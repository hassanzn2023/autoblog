import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("[SERVER] Starting Deno server..."); // Log server start

serve(async (req) => {
  console.log(`[REQUEST] Received ${req.method} request to ${req.url}`); // Log incoming request

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("[CORS] Handling OPTIONS preflight request.");
    return new Response(null, { headers: corsHeaders });
  }

  let url = 'N/A'; // Define url variable with a default value in case of error before parsing JSON

  try {
    console.log("[STEP 0] Attempting to parse request body as JSON.");
    const reqBody = await req.json();
    url = reqBody.url; // Assign url here after successful parsing

    console.log(`[STEP 1] Extracting content from URL: ${url}`);

    if (!url) {
      console.warn("[STEP 1a] URL is missing from request body.");
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the content from the URL with improved headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`[STEP 2 - TIMEOUT] Fetch timeout (${20000}ms) reached for ${url}`); // Log when timeout occurs
      controller.abort(); // Abort the fetch request
    }, 20000); // 20 second timeout

    console.log(`[STEP 2] Starting fetch for ${url} with 20s timeout`); // Log before starting fetch

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8'
      },
      signal: controller.signal
    }).finally(() => {
       console.log(`[STEP 3 - FINALLY] Fetch promise settled (completed or aborted) for ${url}`); // Log when fetch promise settles
       clearTimeout(timeoutId); // Clear the timeout regardless of fetch outcome
    });

    console.log(`[STEP 4] Fetch completed for ${url}. Status: ${response.status}`); // Log after fetch completes

    if (!response.ok) {
      console.error(`[STEP 4a] Fetch failed with status: ${response.status} ${response.statusText} for ${url}`); // Log fetch failure status
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    console.log(`[STEP 4b] Fetch successful. Getting response text for ${url}`); // Log before getting text
    const html = await response.text();
    console.log(`[STEP 5] Retrieved HTML content length: ${html.length} characters from ${url}`); // Log HTML length

    console.log(`[STEP 6] Parsing HTML content for ${url}`); // Log before parsing HTML
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      console.error(`[STEP 6a] Failed to parse HTML content for ${url}`); // Log parsing failure
      throw new Error("Failed to parse HTML content");
    }

    console.log(`[STEP 6b] HTML parsed successfully. Extracting title and other metadata for ${url}`); // Log after successful parsing

    // Extract title
    const titleElement = doc.querySelector("title");
    const metaTitleElement = doc.querySelector("meta[property='og:title']");
    const title = titleElement?.textContent ||
                 metaTitleElement?.getAttribute("content") ||
                 "Extracted Content";

    console.log(`[STEP 6c] Extracted title: ${title} for ${url}`); // Log extracted title

    // Determine if content is RTL
    let isRTL = false;
    const dirAttr = doc.querySelector("html")?.getAttribute("dir");
    const langAttr = doc.querySelector("html")?.getAttribute("lang");

    if (dirAttr === "rtl" || langAttr?.startsWith("ar") || langAttr?.startsWith("he")) {
      isRTL = true;
    }
    console.log(`[STEP 6d] Determined RTL status: ${isRTL} for ${url}`); // Log RTL status


    // Extract main content using Readability
    let mainContent = "";
    let textContent = "";
    let excerpt = "";
    let byline = "";
    let siteName = "";

    try {
      // Apply Readability to extract the main content
      console.log(`[STEP 7] Applying Readability to extract content for ${url}`); // Log before Readability

      // Readability needs the full document to work best
      const reader = new Readability(doc);
      const article = reader.parse();

      if (article) {
        console.log(`[STEP 7a] Readability successfully extracted article: "${article.title}" for ${url}`); // Log Readability success
        mainContent = article.content || "";
        textContent = article.textContent || "";
        excerpt = article.excerpt || "";
        byline = article.byline || "";
        siteName = article.siteName || "";

        console.log(`[STEP 7b] Readability content length: ${mainContent.length}, text length: ${textContent.length} for ${url}`); // Log lengths from Readability
      } else {
        console.log(`[STEP 7c] Readability could not extract article from ${url}, falling back to manual extraction`); // Log Readability failure
        // Fall back to manual extraction logic if Readability fails
        mainContent = fallbackExtractContent(doc);
        textContent = doc.body?.textContent || ""; // Use body text as fallback
        console.log(`[STEP 7d] Fallback extraction completed for ${url}. Content length: ${mainContent.length}, text length: ${textContent?.length}`); // Log fallback lengths
      }
    } catch (readabilityError) {
      console.error(`[STEP 7e] Error using Readability for ${url}:`, readabilityError); // Log Readability error
      console.log(`[STEP 7f] Readability failed, falling back to manual extraction for ${url}`); // Indicate fallback after error

      // Fall back to the original extraction method
      mainContent = fallbackExtractContent(doc);
      textContent = doc.body?.textContent || ""; // Use body text as fallback
      console.log(`[STEP 7g] Fallback extraction completed after Readability error for ${url}. Content length: ${mainContent.length}, text length: ${textContent?.length}`); // Log fallback lengths after error
    }

    // Clean text content
    textContent = textContent.replace(/\s+/g, ' ').trim();
    console.log(`[STEP 8] Cleaned text content for ${url}. Final text length: ${textContent.length}`); // Log after cleaning text

    // Extract excerpt if not already set by Readability
    if (!excerpt && textContent) { // Only generate excerpt if textContent exists
      excerpt = textContent.length > 150
        ? textContent.substring(0, 150) + "..."
        : textContent;
      console.log(`[STEP 8a] Generated excerpt for ${url}.`); // Log excerpt generation
    } else if (excerpt) {
        console.log(`[STEP 8b] Excerpt already set by Readability for ${url}.`); // Log if excerpt was already set
    } else {
        console.log(`[STEP 8c] No text content to generate excerpt for ${url}.`); // Log if no text content
    }


    // Extract author/byline with expanded selectors if not already set by Readability
    if (!byline) {
      const authorSelectors = [
        'meta[name="author"]',
        'meta[property="article:author"]',
        '.author', '.byline', '.entry-author',
        '[rel="author"]', '.post-author',
        '[itemprop="author"]', '.author-name'
      ];

      for (const selector of authorSelectors) {
        const authorElement = doc.querySelector(selector);
        if (authorElement) {
          byline = authorElement.getAttribute("content") || authorElement.textContent || "";
          if (byline) {
              console.log(`[STEP 8d] Found byline using selector: ${selector} for ${url}.`); // Log which selector found byline
              break;
          }
        }
      }
      if (!byline) {
          console.log(`[STEP 8e] Could not find byline using fallback selectors for ${url}.`); // Log if byline not found
      }
    } else {
        console.log(`[STEP 8f] Byline already set by Readability for ${url}.`); // Log if byline was already set
    }


    // Extract site name if not already set by Readability
    if (!siteName) {
      const siteNameSelectors = [
        'meta[property="og:site_name"]',
        '.site-name', '.site-title', '#site-title',
        '[itemprop="publisher"]', '.publisher'
      ];

      for (const selector of siteNameSelectors) {
        const siteNameElement = doc.querySelector(selector);
        if (siteNameElement) {
          siteName = siteNameElement.getAttribute("content") || siteNameElement.textContent || "";
          if (siteName) {
              console.log(`[STEP 8g] Found site name using selector: ${selector} for ${url}.`); // Log which selector found site name
              break;
          }
        }
      }

      if (!siteName) {
        try {
          const hostname = new URL(url).hostname;
          siteName = hostname.replace(/^www\./, '').split('.')[0];
          console.log(`[STEP 8h] Generated site name from hostname: ${siteName} for ${url}.`); // Log generating site name from hostname
        } catch {
          siteName = "";
          console.log(`[STEP 8i] Could not generate site name from hostname for ${url}.`); // Log failure to generate site name from hostname
        }
      }
    } else {
        console.log(`[STEP 8j] Site name already set by Readability for ${url}.`); // Log if site name was already set
    }

    // Check content again for RTL characters if not already determined
    if (!isRTL && textContent) { // Only check if not already RTL and textContent exists
      const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
      const wasRTL = isRTL; // Store original state
      isRTL = rtlChars.test(textContent);
      if (!wasRTL && isRTL) {
         console.log(`[STEP 8k] Determined RTL based on text content scan for ${url}.`); // Log if RTL determined by scan
      } else if (!isRTL) {
         console.log(`[STEP 8l] Content is not RTL (based on attributes or scan) for ${url}.`); // Log if not RTL
      }
    } else if (isRTL) {
        console.log(`[STEP 8m] RTL already determined by attributes for ${url}.`); // Log if RTL already determined by attributes
    }


    console.log(`[STEP 9] Completed extraction process for ${url}. Final content length: ${mainContent.length} characters`); // Log end of extraction logic

    // Return the extracted content
    const result = {
      title,
      content: mainContent,
      textContent,
      length: textContent.length,
      excerpt,
      byline,
      siteName,
      rtl: isRTL
    };

    console.log(`[STEP 10] Returning success JSON response for ${url}`); // Log before returning success
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Catch any error that occurred during the process
    console.error(`[ERROR CATCH] Caught error processing URL: ${url}`); // Log the URL causing the error
    console.error(`[ERROR CATCH] Error object:`, error); // Log the full error object for detailed debugging
    console.error(`[ERROR CATCH] Error message: ${error.message}`); // Log the error message

    console.log(`[ERROR CATCH] Returning error JSON response for ${url}`); // Log before returning error response

    // Return an error response
    return new Response(
      JSON.stringify({
        error: "Failed to extract content from URL",
        details: error.message,
        // Provide fallback empty/default values in case of error
        title: "Error extracting content",
        content: `<p>Could not extract content from the provided URL. Please try again or paste the content manually.</p>`,
        textContent: "Could not extract content from the provided URL.",
        length: 0,
        excerpt: "",
        byline: "",
        siteName: "",
        rtl: false // Default to false on error
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Fallback content extraction method - Used if Readability fails.
 * Tries to find main content container using extended selectors and cleans it.
 * @param {Document} doc - The parsed DOM document.
 * @returns {string} The extracted HTML content or an empty string.
 */
function fallbackExtractContent(doc: Document): string {
  console.log("[FALLBACK] Starting fallback content extraction."); // Log fallback start

  // Try to find main content container using extended selectors
  const contentSelectors = [
    'div.post-details-content', // <<-- المحدد الجديد والأكثر دقة في الأعلى
    'article .article-body',    // يبقى كخيار جيد لمواقع أخرى
    'main .content-area',       // يبقى كخيار جيد لمواقع أخرى
    'article',                  // محدد عام
    '[role="main"]',            // محدد عام
    'main',                     // محدد عام (كما كان يستخدم سابقاً)
    '.content', '.article', '.post', '.entry-content', '.story', '.blog-post',
    '#content', '#main-content', '#article-content', '#story-content', '#post-content',
    '.story-body', '.post-body',
    '.main-content', '.page-content', '.entry', '.single-content', '.wordpress-content'
  ];

  let contentElement: Element | null = null;
  let foundSelector = ''; // Variable to store the selector that worked

  for (const selector of contentSelectors) {
    contentElement = doc.querySelector(selector);
    if (contentElement) {
      foundSelector = selector;
      console.log(`[FALLBACK] Found potential content element using selector: ${selector}`); // Log selector found
      break;
    }
  }

  // If no main content found by selectors, use the body
  if (!contentElement) {
    console.log("[FALLBACK] No specific content container found using selectors, falling back to document.body."); // Log fallback to body
    contentElement = doc.body;
    if (contentElement) {
         foundSelector = 'body';
    }
  }

  if (contentElement) {
    console.log(`[FALLBACK] Using element found by selector "${foundSelector}" for cleaning and extraction.`); // Log the final element used

    // Define selectors for unwanted elements within the content
    const unwantedSelectors = [
      'script', 'style', 'footer', 'header', 'nav',
      '.ads', '.comments', '.sidebar', '.widget', '.menu',
      '.navigation', '.breadcrumb', '.related', '.share',
      '[id*="comment"]', '[class*="comment"]',
      '[id*="widget"]', '[class*="widget"]',
      '[id*="sidebar"]', '[class*="sidebar"]',
      '[id*="banner"]', '[class*="banner"]',
      '[id*="footer"]', '[class*="footer"]',
      'iframe', // Often contains ads or embedded content
      'form', // Input forms, comment forms etc.
      'svg', // Often icons or complex logos
      'noscript' // Content for non-script browsers, often duplicates or messages
      // Add more selectors here based on inspection of problem sites if needed
      // E.g., '.article-tags', '.article-social-share', '.read-more', etc.
    ];

    // Create a clone to avoid modifying the original DOM object from Readability
    const contentClone = contentElement.cloneNode(true) as Element;

    console.log(`[FALLBACK] Cleaning cloned content element. Removing ${unwantedSelectors.length} types of elements.`); // Log starting cleaning

    for (const selector of unwantedSelectors) {
      try {
         const elementsToRemove = contentClone.querySelectorAll(selector);
         elementsToRemove.forEach(el => {
             // Optional: Log specific elements being removed if debugging is intense
             // console.log(`[FALLBACK - CLEANING] Removing element with selector: ${selector}`);
             el.remove();
            });
      } catch (e) {
         console.warn(`[FALLBACK - CLEANING] Failed to remove elements with selector "${selector}": ${e.message}`); // Log if a selector fails (e.g., invalid syntax)
      }
    }

    console.log("[FALLBACK] Cleaning completed. Returning innerHTML."); // Log cleaning completion

    // Return the innerHTML of the cleaned clone
    return contentClone.innerHTML || "";
  }

  console.log("[FALLBACK] No content element found (neither by selectors nor body). Returning empty string."); // Log if no element was found at all
  return ""; // Return empty string if no content element was found
}