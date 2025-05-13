import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts"; // تأكد من أن هذا الرابط يعمل أو استخدم إصداراً مناسباً

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("[SERVER] Starting Deno server with Puppeteer support...");

/**
 * Fetches page content using Puppeteer to allow JavaScript execution.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<string>} The HTML content of the page after JavaScript execution.
 */
async function fetchPageWithPuppeteer(url: string): Promise<string> {
  let browser;
  try {
    console.log(`[PUPPETEER] Launching browser for ${url}`);
    browser = await puppeteer.launch({
      headless: true, // Set to false for debugging to see the browser
      args: [
        '--no-sandbox', // Often required in server environments
        '--disable-setuid-sandbox', // Often required in server environments
        '--disable-dev-shm-usage', // May be needed in Docker or CI environments
        '--single-process', // Try if you have issues with multi-process
        '--no-zygote' // Try if you have issues with multi-process
      ],
    });
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log(`[PUPPETEER] Navigating to ${url}`);
    // Increased timeout and wait until network is relatively idle
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // 60 second timeout

    // Optional: Wait for a specific selector that indicates content is loaded
    // try {
    //   console.log(`[PUPPETEER] Waiting for selector 'div.post-details-content' (max 30s)`);
    //   await page.waitForSelector('div.post-details-content', { timeout: 30000 });
    //   console.log(`[PUPPETEER] Selector 'div.post-details-content' found.`);
    // } catch (e) {
    //   console.warn(`[PUPPETEER] Timed out waiting for 'div.post-details-content'. Proceeding anyway. Error: ${e.message}`);
    // }

    console.log(`[PUPPETEER] Getting page content for ${url}`);
    const htmlContent = await page.content(); // This gets HTML after JS execution

    return htmlContent;
  } catch (error) {
    console.error(`[PUPPETEER] Error fetching page ${url}:`, error);
    throw new Error(`Puppeteer failed to fetch ${url}: ${error.message}`);
  } finally {
    if (browser) {
      console.log(`[PUPPETEER] Closing browser for ${url}`);
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

  let url = 'N/A';

  try {
    console.log("[STEP 0] Attempting to parse request body as JSON.");
    const reqBody = await req.json();
    url = reqBody.url;

    console.log(`[STEP 1] Extracting content from URL: ${url}`);

    if (!url) {
      console.warn("[STEP 1a] URL is missing from request body.");
      return new Response(JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Use Puppeteer to fetch HTML
    console.log(`[STEP 2] Fetching HTML content using Puppeteer for ${url}`);
    const html = await fetchPageWithPuppeteer(url);
    console.log(`[STEP 5] Retrieved HTML (via Puppeteer) content length: ${html.length} characters from ${url}`);

    // --- The rest of the extraction logic remains largely the same ---
    // --- as DOMParser and Readability will now operate on the JS-rendered HTML ---

    console.log(`[STEP 6] Parsing HTML content for ${url}`);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      console.error(`[STEP 6a] Failed to parse HTML content (from Puppeteer) for ${url}`);
      throw new Error("Failed to parse HTML content obtained from Puppeteer");
    }

    console.log(`[STEP 6b] HTML parsed successfully. Extracting title and other metadata for ${url}`);
    const titleElement = doc.querySelector("title");
    const metaTitleElement = doc.querySelector("meta[property='og:title']");
    const title = titleElement?.textContent || metaTitleElement?.getAttribute("content") || "Extracted Content";
    console.log(`[STEP 6c] Extracted title: ${title} for ${url}`);

    let isRTL = false;
    const dirAttr = doc.querySelector("html")?.getAttribute("dir");
    const langAttr = doc.querySelector("html")?.getAttribute("lang");
    if (dirAttr === "rtl" || langAttr?.startsWith("ar") || langAttr?.startsWith("he")) isRTL = true;
    console.log(`[STEP 6d] Determined RTL status: ${isRTL} for ${url}`);

    let mainContent = "";
    let textContent = "";
    let excerpt = "";
    let byline = "";
    let siteName = "";

    try {
      console.log(`[STEP 7] Applying Readability to extract content for ${url}`);
      const reader = new Readability(doc); // Pass the JS-rendered doc
      const article = reader.parse();

      if (article) {
        console.log(`[STEP 7a] Readability successfully extracted article: "${article.title}" for ${url}`);
        mainContent = article.content || "";
        textContent = article.textContent || "";
        excerpt = article.excerpt || "";
        byline = article.byline || "";
        siteName = article.siteName || "";
        console.log(`[STEP 7b] Readability content length: ${mainContent.length}, text length: ${textContent.length} for ${url}`);
      } else {
        console.log(`[STEP 7c] Readability could not extract article from ${url}, falling back to manual extraction`);
        mainContent = fallbackExtractContent(doc); // Pass the JS-rendered doc
        // If fallbackExtractContent returns HTML, we need to get textContent from it or the doc
        if (mainContent) {
            const tempDoc = new DOMParser().parseFromString(mainContent, "text/html");
            textContent = tempDoc?.body?.textContent || doc.body?.textContent || "";
        } else {
            textContent = doc.body?.textContent || "";
        }
        console.log(`[STEP 7d] Fallback extraction completed. mainContent length: ${mainContent.length}, textContent length: ${textContent?.length}`);
      }
    } catch (readabilityError) {
      console.error(`[STEP 7e] Error using Readability for ${url}:`, readabilityError);
      console.log(`[STEP 7f] Readability failed, falling back to manual extraction for ${url}`);
      mainContent = fallbackExtractContent(doc); // Pass the JS-rendered doc
      if (mainContent) {
        const tempDoc = new DOMParser().parseFromString(mainContent, "text/html");
        textContent = tempDoc?.body?.textContent || doc.body?.textContent || "";
      } else {
        textContent = doc.body?.textContent || "";
      }
      console.log(`[STEP 7g] Fallback extraction (after error) completed. mainContent length: ${mainContent.length}, textContent length: ${textContent?.length}`);
    }

    textContent = textContent.replace(/\s+/g, ' ').trim();
    console.log(`[STEP 8] Cleaned text content. Final text length: ${textContent.length}`);

    if (!excerpt && textContent) {
      excerpt = textContent.length > 150 ? textContent.substring(0, 150) + "..." : textContent;
      console.log(`[STEP 8a] Generated excerpt.`);
    } // ... (rest of metadata extraction)

        // Extract author/byline with expanded selectors if not already set by Readability
    if (!byline) {
      const authorSelectors = [
        'meta[name="author"]', 'meta[property="article:author"]', '.author', '.byline', 
        '.entry-author', '[rel="author"]', '.post-author', '[itemprop="author"]', '.author-name'
      ];
      for (const selector of authorSelectors) {
        const el = doc.querySelector(selector);
        if (el) { byline = el.getAttribute("content") || el.textContent || ""; if (byline) { console.log(`[STEP 8d] Found byline: ${byline}`); break;} }
      }
      if (!byline) console.log(`[STEP 8e] Could not find byline.`);
    }

    // Extract site name if not already set by Readability
    if (!siteName) {
      const siteNameSelectors = [
        'meta[property="og:site_name"]', '.site-name', '.site-title', '#site-title', 
        '[itemprop="publisher"]', '.publisher'
      ];
      for (const selector of siteNameSelectors) {
        const el = doc.querySelector(selector);
        if (el) { siteName = el.getAttribute("content") || el.textContent || ""; if (siteName) { console.log(`[STEP 8g] Found siteName: ${siteName}`); break;} }
      }
      if (!siteName) {
        try { const hn = new URL(url).hostname; siteName = hn.replace(/^www\./, '').split('.')[0]; console.log(`[STEP 8h] Generated siteName from hostname: ${siteName}`);}
        catch { siteName = ""; console.log(`[STEP 8i] Could not generate siteName from hostname.`); }
      }
    }
    
    if (!isRTL && textContent) {
      const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
      isRTL = rtlChars.test(textContent);
      if (isRTL) console.log(`[STEP 8k] Determined RTL based on text scan.`);
    }


    console.log(`[STEP 9] Completed extraction. Final mainContent length: ${mainContent.length}`);
    const result = { title, content: mainContent, textContent, length: textContent.length, excerpt, byline, siteName, rtl: isRTL };

    console.log(`[STEP 10] Returning success JSON response for ${url}`);
    return new Response(JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error(`[ERROR CATCH] Error processing URL (${url}):`, error.message, error.stack);
    return new Response(
      JSON.stringify({
        error: "Failed to extract content from URL", details: error.message,
        title: "Error extracting content", content: `<p>Could not extract content.</p>`,
        textContent: "Could not extract content.", length: 0, excerpt: "", byline: "", siteName: "", rtl: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function fallbackExtractContent(doc: Document): string {
  console.log("[FALLBACK] Starting fallback content extraction.");
  const contentSelectors = [
    'div.post-details-content', // Target this specific class first
    'article.article-content',  // Common pattern
    '.entry-content',           // WordPress
    '.post-content',            // Common blog pattern
    '.article-body',            // News sites
    '#articleBody',             // Some sites use IDs
    'article',
    '[role="article"]',
    'main',
    '.content', '#content', '.main-content', '#main'
  ];
  let contentElement: Element | null = null;
  let foundSelector = '';

  for (const selector of contentSelectors) {
    console.log(`[FALLBACK - TRYING SELECTOR] Attempting to find: "${selector}"`);
    contentElement = doc.querySelector(selector);
    if (contentElement) {
      foundSelector = selector;
      console.log(`[FALLBACK] Found element using selector: ${selector}`);
      break;
    } else {
      console.log(`[FALLBACK - SELECTOR FAILED] Selector "${selector}" not found.`);
    }
  }

  if (!contentElement) {
    console.log("[FALLBACK] No specific content container found, using document.body.");
    contentElement = doc.body;
    foundSelector = 'body';
  }

  if (contentElement) {
    console.log(`[FALLBACK] Using element from selector "${foundSelector}" for cleaning.`);
    const unwantedSelectors = [
      'script', 'style', 'footer', 'header', 'nav', 'aside', '.sidebar',
      '.ads', '.advertisement', '.ad-container', '.comments', '#comments',
      '.related-posts', '.share-buttons', '.social-media-links',
      '.site-footer', '.site-header', '.main-nav', '.breadcrumb',
      'form', 'iframe', 'noscript', 'figure.wp-block-image figcaption', // Remove captions inside figures if they are problematic
      '.hidden', '[aria-hidden="true"]', // Common classes for visually hidden elements
      '.noprint', // Elements not meant for printing (often UI)
      '[id*="modal"]', '[class*="modal"]', // Modals
      '[id*="popup"]', '[class*="popup"]' // Popups
    ];
    const contentClone = contentElement.cloneNode(true) as Element;

    for (const selector of unwantedSelectors) {
      contentClone.querySelectorAll(selector).forEach(el => el.remove());
    }
    console.log("[FALLBACK] Cleaning completed. Returning innerHTML.");
    return contentClone.innerHTML || "";
  }
  console.log("[FALLBACK] No content element to process. Returning empty string.");
  return "";
}