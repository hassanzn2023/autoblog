import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define a minimum length for Readability extracted text to be considered valid
const MIN_ARTICLE_LENGTH = 500; // You can adjust this value based on testing

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      console.log("Error: URL is required"); // Added log for missing URL
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Attempting to extract content from: ${url}`);

    // Fetch the content from the URL with improved headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.log(`Fetch timed out after 20 seconds for URL: ${url}`); // Log fetch timeout
        controller.abort();
    }, 20000); // 20 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      console.error(`Fetch failed with status: ${response.status} ${response.statusText}`); // Log fetch failure
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Retrieved HTML content length: ${html.length} characters`);

    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
       console.error("Failed to parse HTML content"); // Log parse failure
       throw new Error("Failed to parse HTML content");
    }

    // Extract title
    const titleElement = doc.querySelector("title");
    const metaTitleElement = doc.querySelector("meta[property='og:title']");
    const title = titleElement?.textContent ||
                 metaTitleElement?.getAttribute("content") ||
                 "Extracted Content";

    console.log(`Extracted title: ${title}`);

    // Determine if content is RTL
    let isRTL = false;
    const dirAttr = doc.querySelector("html")?.getAttribute("dir");
    const langAttr = doc.querySelector("html")?.getAttribute("lang");

    if (dirAttr === "rtl" || langAttr?.startsWith("ar") || langAttr?.startsWith("he")) {
      isRTL = true;
      console.log("Content detected as RTL"); // Log RTL detection
    } else {
       console.log("Content detected as LTR"); // Log LTR detection
    }


    // Extract main content using Readability
    let mainContent = "";
    let textContent = "";
    let excerpt = "";
    let byline = "";
    let siteName = "";

    try {
      // Apply Readability to extract the main content
      console.log("Applying Readability to extract content");
      const reader = new Readability(doc);
      const article = reader.parse();

      // --- Console Log 1: Readability Result ---
      console.log(`Readability parse result: ${article ? 'Success' : 'Failed'}`);
      if (article) {
          console.log(`Readability article title: ${article.title}`);
          console.log(`Readability article text length: ${article.textContent?.length || 0}`); // Handle null/undefined textContent
      }
      // ---------------------------------------------

      // Check if Readability succeeded AND the extracted text is long enough
      if (article && article.textContent && article.textContent.length >= MIN_ARTICLE_LENGTH) {
        console.log(`Using Readability result (text length ${article.textContent.length} >= ${MIN_ARTICLE_LENGTH})`);
        mainContent = article.content || "";
        textContent = article.textContent || "";
        excerpt = article.excerpt || "";
        byline = article.byline || "";
        siteName = article.siteName || "";

      } else {
        // --- Log for Falling Back Due to Short/Failed Readability Result ---
        if (article && article.textContent && article.textContent.length < MIN_ARTICLE_LENGTH) {
            console.log(`Readability result too short (${article.textContent.length} chars), falling back to manual extraction`);
        } else if (article && !article.textContent) {
            console.log("Readability extracted article but textContent is empty, falling back to manual extraction");
        } else {
            console.log("Readability could not extract article, falling back to manual extraction");
        }
        // --------------------------------------------------------------

        // Fall back to manual extraction logic
        // Note: fallbackExtractContent returns HTML, textContent fallback uses doc.body.textContent
        mainContent = fallbackExtractContent(doc);
        textContent = doc.body?.textContent || ""; // Fallback for plain text content from body
      }
    } catch (readabilityError) {
      console.error("Error using Readability:", readabilityError);

      // Fall back to the original extraction method on error
      mainContent = fallbackExtractContent(doc);
      textContent = doc.body?.textContent || ""; // Fallback for text content too
    }

    // Clean text content (using the variable that will be returned)
    // Apply cleaning AFTER potential fallback textContent assignment
    textContent = textContent.replace(/\s+/g, ' ').trim();

    // Extract excerpt if not already set by Readability or if fallback produced empty excerpt
    if (!excerpt || excerpt.trim() === "") { // Also check if excerpt is just whitespace
         // Use the cleaned textContent for excerpt calculation
         excerpt = textContent.length > 150
            ? textContent.substring(0, 150).trim() + "..." // Trim substring too
            : textContent.trim(); // Trim the whole text if short
    }


    // Extract author/byline with expanded selectors if not already set by Readability or if fallback produced empty byline
    if (!byline || byline.trim() === "") {
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
          byline = (authorElement.getAttribute("content") || authorElement.textContent || "").trim();
          if (byline) {
              console.log(`Extracted byline using selector: ${selector}`); // Log which selector found byline
              break;
          }
        }
      }
       if (!byline) {
           console.log("Could not find byline using selectors."); // Log if byline extraction failed
       }
    }


    // Extract site name if not already set by Readability or if fallback produced empty siteName
    if (!siteName || siteName.trim() === "") {
      const siteNameSelectors = [
        'meta[property="og:site_name"]',
        '.site-name', '.site-title', '#site-title',
        '[itemprop="publisher"]', '.publisher'
      ];

      for (const selector of siteNameSelectors) {
        const siteNameElement = doc.querySelector(selector);
        if (siteNameElement) {
          siteName = (siteNameElement.getAttribute("content") || siteNameElement.textContent || "").trim();
          if (siteName) {
              console.log(`Extracted siteName using selector: ${selector}`); // Log which selector found siteName
              break;
          }
        }
      }

      if (!siteName) {
        try {
          const hostname = new URL(url).hostname;
          siteName = hostname.replace(/^www\./, '').split('.')[0];
          console.log(`Generated siteName from hostname: ${siteName}`); // Log generating siteName
        } catch {
          siteName = "";
          console.log("Could not extract or generate siteName."); // Log if siteName extraction/generation failed
        }
      }
    }

    // Check content again for RTL characters if not already determined
    // Use the cleaned textContent for this check
    if (!isRTL && textContent.length > 0) { // Only check if not already RTL and textContent is not empty
      const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
      isRTL = rtlChars.test(textContent);
       if (isRTL) {
           console.log("RTL detected based on text content"); // Log RTL detection from text
       }
    }


    // --- Console Log 2: Final Extracted Content Details ---
    console.log(`Final mainContent length: ${mainContent.length} characters`);
    console.log(`Final textContent length: ${textContent.length} characters`);
    console.log(`Final excerpt: ${excerpt}`);
    console.log(`Final byline: ${byline}`);
    console.log(`Final siteName: ${siteName}`);
    console.log(`Final RTL status: ${isRTL}`);
    // ----------------------------------------------------------


    // Return the extracted content
    const result = {
      title,
      content: mainContent, // This is likely HTML from Readability or fallback
      textContent,       // This is cleaned plain text
      length: textContent.length, // Length of the plain text
      excerpt,
      byline,
      siteName,
      rtl: isRTL
    };

    console.log(`Content extraction completed successfully.`); // Final log before returning success

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error extracting content from URL:", error.message); // Log the error message

    // Prepare error response details
    const errorDetails = {
        error: "Failed to extract content from URL",
        details: error.message,
        title: "Error extracting content",
        content: `<p>Could not extract content from the provided URL. Please try again or paste the content manually.</p>`,
        textContent: `Could not extract content from the provided URL. Details: ${error.message}`, // Include error details in textContent for debugging
        length: 0,
        excerpt: "Extraction failed.",
        byline: "",
        siteName: ""
    };

    console.log(`Returning error response: ${JSON.stringify(errorDetails)}`); // Log the error response being sent

    return new Response(
      JSON.stringify(errorDetails),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Fallback content extraction method
 * @param {Document} doc - The parsed DOM Document object.
 * @returns {string} - The extracted HTML content or an empty string.
 */
function fallbackExtractContent(doc) {
  // Try to find main content container using extended selectors
const contentSelectors = [
    // Prioritize more specific selectors first
    '.post-details-content', // Found in your example HTML for Al-Akhbar
    '.prose',                // Found in your example HTML for Al-Akhbar
    '.article-body',
    '.story-body',
    '.content-area',
    '.post-body',
    '.main-content',
    '.page-content',
    '.entry',
    '.single-content',
    '.wordpress-content',
    // Then broader, common tags/roles - MOVED DOWN
    'article',
    'main',
    '[role="main"]',
    '.content', // Generic, keep relatively high
    '.article', // Generic, keep relatively high
    '.post',    // Generic, keep relatively high
    '.entry-content', // Generic, keep relatively high
    '.story',
    '.blog-post',
    '#content',
    '#main-content',
    '#article-content',
    '#story-content',
    '#post-content',
    // Add more specific selectors if you encounter other patterns
  ];

  let contentElement = null;
  for (const selector of contentSelectors) {
    try { // Added try-catch for querySelector in case a selector is invalid
        contentElement = doc.querySelector(selector);
        if (contentElement) {
          console.log(`Fallback: Found content using selector: ${selector}`); // Log which selector was used
          break; // Stop searching once the first matching selector is found
        }
    } catch (e) {
         console.error(`Fallback: Error using content selector "${selector}": ${e}`);
         // Continue to the next selector
    }
  }

  // If no main content found, use the body
  if (!contentElement) {
    console.log("Fallback: No specific content container found, using body"); // Log fallback to body
    contentElement = doc.body;
  }

  if (contentElement) {
      const unwantedSelectors = [
        'script',
        'style',
        'footer',
        'header',
        'nav',
        '.ads',
        '.comments',
        '.sidebar',
        '.widget',
        '.menu',
        '.navigation',
        '.breadcrumb',
        '.related',
        '.share',
        '[id*="comment"]',      // Remove elements with IDs containing "comment"
        '[class*="comment"]',   // Remove elements with classes containing "comment"
        '[id*="widget"]',       // Remove elements with IDs containing "widget"
        '[class*="widget"]',    // Remove elements with classes containing "widget"
        '[id*="sidebar"]',      // Remove elements with IDs containing "sidebar"
        '[class*="sidebar"]',   // Remove elements with classes containing "sidebar"
        '[id*="banner"]',       // Remove elements with IDs containing "banner"
        '[class*="banner"]',    // Remove elements with classes containing "banner"
        '[id*="footer"]',       // Remove elements with IDs containing "footer"
        '[class*="footer"]',    // Remove elements with classes containing "footer"
        // Add more unwanted selectors if you identify them, e.g., specific license blocks
        // --- ADD SPECIFIC SELECTOR FOR THE LICENSE TEXT HERE ---
        // You need to inspect the HTML of the al-akhbar page to find a selector
        // that uniquely identifies the license paragraph/div.
        // Examples (replace with actual selector):
        // '.article-license-info',
        // '.license-text',
        // 'p:contains("رخصة المشاع الإبداعي")', // (Caution: :contains is not standard CSS, might need find logic)
        // '[class*="license"]', // Generic based on class name
        // '[id*="license"]' // Generic based on ID name
      ];

    // Create a copy of the content to avoid modifying during iteration
    // Adding a check here in case contentElement is null for some reason (though unlikely with doc.body fallback)
    const contentClone = contentElement.cloneNode(true);

    if (contentClone) { // Ensure clone was successful
        for (const selector of unwantedSelectors) {
          try {
                // Check if the selector exists within the cloned content before querying
                // This check is slightly redundant if querySelectorAll is used, but harmless.
                // querySelectorAll itself won't throw for non-existent selectors.
                const elements = contentClone.querySelectorAll(selector);
                elements.forEach(el => {
                    // Optional: Log which element is being removed for debugging
                    // console.log(`Fallback: Removing unwanted element with selector: ${selector}`, el);
                    el.remove();
                });
            } catch (e) {
                console.error(`Fallback: Error removing selector ${selector}: ${e}`);
                // Continue with other selectors even if one removal fails
            }
        }

        console.log(`Fallback: Returning innerHTML after removing unwanted elements.`); // Log before returning fallback result
        return contentClone.innerHTML || "";
    } else {
        console.error("Fallback: Failed to clone content element.");
        return ""; // Return empty if cloning failed
    }
  }

  console.log("Fallback: Content element is null, returning empty string."); // Should ideally not happen if doc.body is the fallback
  return "";
}