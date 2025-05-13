import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts"; // أو أحدث إصدار متوافق

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("[SERVER] Starting Deno server with Puppeteer for JS rendering...");

/**
 * Fetches page content using Puppeteer to allow JavaScript execution.
 * @param {string} urlToFetch - The URL to fetch.
 * @param {number} [timeoutMs=60000] - Timeout for page navigation.
 * @returns {Promise<string>} The HTML content of the page after JavaScript execution.
 */
async function fetchPageWithPuppeteer(urlToFetch: string, timeoutMs: number = 60000): Promise<string> {
  let browser;
  console.log(`[PUPPETEER] Launching browser for URL: ${urlToFetch}`);
  try {
    browser = await puppeteer.launch({
      headless: true, // 'new' is preferred for newer versions, true for older.
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Useful in Docker/CI environments
        // '--single-process', // Try if encountering issues, but generally not recommended
        // '--no-zygote', // Try if encountering issues
      ],
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log(`[PUPPETEER] Navigating to: ${urlToFetch}`);
    await page.goto(urlToFetch, { waitUntil: 'networkidle2', timeout: timeoutMs });

    // Optional: You can add a small delay or wait for a specific selector if content loads very late
    // console.log(`[PUPPETEER] Waiting for an additional 3 seconds for late JS.`);
    // await page.waitForTimeout(3000);

    const htmlContent = await page.content();
    console.log(`[PUPPETEER] Content fetched successfully for ${urlToFetch}. HTML length: ${htmlContent.length}`);
    return htmlContent;
  } catch (error) {
    console.error(`[PUPPETEER] Error during operation for ${urlToFetch}: ${error.message}`, error.stack);
    throw new Error(`Puppeteer failed for ${urlToFetch}: ${error.message}`); // Re-throw to be caught by the main try-catch
  } finally {
    if (browser) {
      console.log(`[PUPPETEER] Closing browser for ${urlToFetch}`);
      await browser.close();
    }
  }
}

serve(async (req) => {
  console.log(`[REQUEST] Received ${req.method} request to ${req.url}`);
  if (req.method === 'OPTIONS') {
    console.log("[CORS] Handling OPTIONS preflight request.");
    return new Response(null, { headers: corsHeaders });
  }

  let requestUrl = 'N/A'; // To ensure `requestUrl` is always defined for logging in catch block

  try {
    const { url } = await req.json();
    requestUrl = url; // Assign the actual URL

    if (!url) {
      console.warn("[VALIDATION] URL is required in the request body.");
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[EXTRACTION_PROCESS] Starting content extraction for URL: ${url}`);

    // Use Puppeteer to get JS-rendered HTML
    const html = await fetchPageWithPuppeteer(url, 60000); // 60-second timeout for Puppeteer

    console.log(`[EXTRACTION_PROCESS] Retrieved HTML (via Puppeteer) length: ${html.length} characters`);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      console.error("[EXTRACTION_PROCESS] Failed to parse HTML content obtained from Puppeteer.");
      throw new Error("Failed to parse HTML content from Puppeteer");
    }

    // Extract title
    const titleElement = doc.querySelector("title");
    const metaTitleElement = doc.querySelector("meta[property='og:title']");
    const title = titleElement?.textContent?.trim() ||
                 metaTitleElement?.getAttribute("content")?.trim() ||
                 "Extracted Content";
    console.log(`[METADATA] Extracted title: ${title}`);

    // Determine if content is RTL
    let isRTL = false;
    const dirAttr = doc.querySelector("html")?.getAttribute("dir");
    const langAttr = doc.querySelector("html")?.getAttribute("lang");
    if (dirAttr === "rtl" || langAttr?.startsWith("ar") || langAttr?.startsWith("he")) {
      isRTL = true;
    }
    console.log(`[METADATA] Determined RTL status: ${isRTL}`);

    // Extract main content using Readability or fallback
    let mainContent = "";
    let textContent = "";
    let excerpt = "";
    let byline = "";
    let siteName = "";

    try {
      console.log("[READABILITY] Applying Readability to extract content...");
      const reader = new Readability(doc.cloneNode(true) as Document); // Pass a clone to Readability
      const article = reader.parse();

      if (article && article.content) {
        console.log(`[READABILITY] Successfully extracted article: "${article.title}"`);
        mainContent = article.content;
        textContent = article.textContent || "";
        excerpt = article.excerpt || "";
        byline = article.byline || "";
        siteName = article.siteName || "";
        console.log(`[READABILITY] Content length: ${mainContent.length}, Text length: ${textContent.length}`);
      } else {
        console.log("[READABILITY] Could not extract article, falling back to manual extraction.");
        mainContent = fallbackExtractContent(doc);
        // If fallback returns HTML, parse it to get clean text content
        if (mainContent) {
          const tempDoc = new DOMParser().parseFromString(mainContent, "text/html");
          textContent = tempDoc?.body?.textContent || doc.body?.textContent || "";
        } else {
          textContent = doc.body?.textContent || ""; // Fallback to full body text if mainContent is empty
        }
        console.log(`[FALLBACK_RESULT] mainContent length: ${mainContent.length}, textContent length: ${textContent?.length}`);
      }
    } catch (readabilityError) {
      console.error("[READABILITY] Error using Readability:", readabilityError.message);
      console.log("[FALLBACK] Falling back to manual extraction due to Readability error.");
      mainContent = fallbackExtractContent(doc);
      if (mainContent) {
        const tempDoc = new DOMParser().parseFromString(mainContent, "text/html");
        textContent = tempDoc?.body?.textContent || doc.body?.textContent || "";
      } else {
        textContent = doc.body?.textContent || "";
      }
      console.log(`[FALLBACK_RESULT_AFTER_ERROR] mainContent length: ${mainContent.length}, textContent length: ${textContent?.length}`);
    }

    textContent = textContent.replace(/\s+/g, ' ').trim();
    console.log(`[TEXT_CLEANUP] Final textContent length after cleaning: ${textContent.length}`);

    // Extract excerpt if not already set
    if (!excerpt && textContent) {
      excerpt = textContent.length > 250 ? textContent.substring(0, 250) + "..." : textContent;
      console.log(`[METADATA] Generated excerpt.`);
    }

    // Extract author/byline if not already set
    if (!byline) {
      const authorSelectors = [
        'meta[name="author"]', 'meta[property="article:author"]',
        '.author', '.byline', '.entry-author', '[rel="author"]', '.post-author',
        '[itemprop="author"] span[itemprop="name"]', '[itemprop="author"]', '.author-name'
      ];
      for (const selector of authorSelectors) {
        const el = doc.querySelector(selector);
        if (el) {
          byline = (el.getAttribute("content") || el.textContent || "").trim();
          if (byline) { console.log(`[METADATA] Found byline using "${selector}": ${byline}`); break; }
        }
      }
      if (!byline) console.log(`[METADATA] Could not find byline using fallback selectors.`);
    }

    // Extract site name if not already set
    if (!siteName) {
      const siteNameSelectors = [
        'meta[property="og:site_name"]', '.site-name', '.site-title', '#site-title',
        'meta[name="application-name"]', '[itemprop="publisher"] meta[itemprop="name"]',
        '[itemprop="publisher"]'
      ];
      for (const selector of siteNameSelectors) {
        const el = doc.querySelector(selector);
        if (el) {
          siteName = (el.getAttribute("content") || el.textContent || "").trim();
          if (siteName) { console.log(`[METADATA] Found site name using "${selector}": ${siteName}`); break; }
        }
      }
      if (!siteName) {
        try {
          const hostname = new URL(url).hostname;
          siteName = hostname.replace(/^www\./, '').split('.')[0]; // Basic extraction
          console.log(`[METADATA] Generated site name from hostname: ${siteName}`);
        } catch {
          siteName = "";
          console.warn(`[METADATA] Could not generate site name from hostname for URL: ${url}`);
        }
      }
    }

    // Re-check RTL based on final textContent if not already determined by HTML attributes
    if (!isRTL && textContent) {
      const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
      if (rtlChars.test(textContent.substring(0, 500))) { // Check first 500 chars
        isRTL = true;
        console.log(`[METADATA] Determined RTL status based on text content scan.`);
      }
    }

    console.log(`[EXTRACTION_PROCESS] Completed. Final mainContent (HTML) length: ${mainContent.length}`);
    const result = {
      title,
      content: mainContent, // HTML content
      textContent,         // Plain text content
      length: textContent.length,
      excerpt,
      byline,
      siteName,
      rtl: isRTL
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[GLOBAL_ERROR_HANDLER] Error processing URL (${requestUrl}): ${error.message}`, error.stack);
    return new Response(
      JSON.stringify({
        error: "Failed to extract content from URL",
        details: error.message,
        title: "Error extracting content",
        content: `<p>Could not extract content from the provided URL. Please check the URL or try again later.</p>`,
        textContent: "Could not extract content from the provided URL.",
        length: 0,
        excerpt: "",
        byline: "",
        siteName: "",
        rtl: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Fallback content extraction method.
 * @param {Document} doc - The parsed DOM document (should be JS-rendered if using Puppeteer).
 * @returns {string} The extracted HTML content as a string, or an empty string.
 */
function fallbackExtractContent(doc: Document): string {
  console.log("[FALLBACK] Starting fallback content extraction.");
  const contentSelectors = [
    'div.post-details-content', // Priority for al-akhbar
    'article[class*="article-body"]', 'div[class*="article-body"]',
    '.entry-content', '.post-content', '.article-content',
    'main article', 'article main',
    '#main-content article', '#content article',
    'article', '[role="article"]', 'main', '[role="main"]',
    '.story-content', '#story',
    // Add more generic selectors if needed
  ];

  let contentElement: Element | null = null;
  let foundSelector = '';

  for (const selector of contentSelectors) {
    console.log(`[FALLBACK_SELECTOR_TRY] Trying selector: "${selector}"`);
    contentElement = doc.querySelector(selector);
    if (contentElement) {
      foundSelector = selector;
      console.log(`[FALLBACK_SELECTOR_FOUND] Found potential content element using selector: "${selector}"`);
      break;
    } else {
        console.log(`[FALLBACK_SELECTOR_FAIL] Selector "${selector}" did not find any element.`);
    }
  }

  if (!contentElement) {
    console.log("[FALLBACK_NO_ELEMENT] No specific content container found by selectors, trying document.body.");
    contentElement = doc.body;
    foundSelector = 'document.body';
  }

  if (contentElement) {
    console.log(`[FALLBACK_CLEANING] Using element from selector "${foundSelector}" for cleaning.`);
    const unwantedSelectors = [
      'script', 'style', 'link[rel="stylesheet"]', 'template', 'noscript', 'iframe', 'form', 'svg',
      'header', 'footer', 'nav', 'aside', '.sidebar', '#sidebar',
      '.ads', '.advert', '.advertisement', '[class*="ad-"]', '[id*="ad-"]',
      '.comments', '#comments', '.comment-form',
      '.related-posts', '.related-articles', '.share-buttons', '.social-links',
      '.site-header', '.main-header', '.site-footer', '.main-footer',
      '.navigation', '.pagination', '.breadcrumb', '.toc', '.table-of-contents',
      '.cookie-banner', '.gdpr-consent', '.modal', '.popup',
      '.hidden', '[hidden]', '[style*="display:none"]', '[style*="visibility:hidden"]',
      '.sr-only', // Screen-reader only content
      // More specific selectors for common clutter
      'figure > figcaption', // Remove captions if they are separate from image meaning
      '.gallery-caption', '.wp-caption-text',
      '.meta', '.post-meta', '.entry-meta', // Often contains tags, categories, dates that Readability might handle or you might extract separately
      '.author-bio', // Sometimes better extracted separately
    ];

    // Clone the node to avoid modifying the original document during iteration
    const contentClone = contentElement.cloneNode(true) as Element;

    for (const selector of unwantedSelectors) {
      try {
        contentClone.querySelectorAll(selector).forEach(el => el.remove());
      } catch (e) {
        console.warn(`[FALLBACK_CLEANING_ERROR] Error removing elements with selector "${selector}": ${e.message}`);
      }
    }
    console.log("[FALLBACK_CLEANING] Cleaning completed. Returning innerHTML.");
    return contentClone.innerHTML || "";
  }

  console.log("[FALLBACK_NO_CONTENT] No content element could be processed. Returning empty string.");
  return "";
}