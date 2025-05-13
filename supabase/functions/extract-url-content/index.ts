import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("[SERVER] Starting Deno server with Puppeteer for JS rendering...");

async function fetchPageWithPuppeteer(urlToFetch: string, timeoutMs: number = 60000): Promise<string> {
  let browser;
  console.log(`[PUPPETEER] Launching browser for URL: ${urlToFetch}`);
  try {
    browser = await puppeteer.launch({
      headless: true, // يمكنك تغييرها إلى false للرؤية أثناء التطوير
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        // '--disable-gpu', // جرب هذا إذا كانت هناك مشاكل متعلقة بالـ GPU
        // '--single-process', // جرب هذا إذا كانت هناك مشاكل مع عمليات متعددة
        // '--no-zygote', // جرب هذا أيضًا
      ],
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log(`[PUPPETEER] Navigating to: ${urlToFetch}`);
    await page.goto(urlToFetch, { waitUntil: 'networkidle2', timeout: timeoutMs });

    const htmlContent = await page.content();
    console.log(`[PUPPETEER] Content fetched successfully for ${urlToFetch}. HTML length: ${htmlContent.length}`);
    return htmlContent;
  } catch (error) {
    // --------- سجل مفصل للخطأ من Puppeteer ---------
    console.error(`[PUPPETEER_ERROR_DETAIL] Error during Puppeteer operation for ${urlToFetch}:`);
    console.error(`[PUPPETEER_ERROR_DETAIL] Message: ${error.message}`);
    console.error(`[PUPPETEER_ERROR_DETAIL] Name: ${error.name}`);
    console.error(`[PUPPETEER_ERROR_DETAIL] Stack: ${error.stack}`);
    console.error(`[PUPPETEER_ERROR_DETAIL] Full error object:`, error); // اطبع الكائن كاملاً
    // -----------------------------------------------
    throw new Error(`Puppeteer failed for ${urlToFetch}: ${error.message}`);
  } finally {
    if (browser) {
      console.log(`[PUPPETEER] Closing browser for ${urlToFetch}`);
      try {
        await browser.close();
      } catch (closeError) {
        console.error(`[PUPPETEER] Error closing browser: ${closeError.message}`);
      }
    }
  }
}

serve(async (req) => {
  console.log(`[REQUEST] Received ${req.method} request to ${req.url}`);
  if (req.method === 'OPTIONS') {
    console.log("[CORS] Handling OPTIONS preflight request.");
    return new Response(null, { headers: corsHeaders });
  }

  let requestUrl = 'N/A';

  try {
    const reqBody = await req.json(); // استخدم let هنا لتجنب الخطأ إذا كان req.json() يرمي خطأ
    requestUrl = reqBody.url;

    if (!requestUrl) {
      console.warn("[VALIDATION] URL is required in the request body.");
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[EXTRACTION_PROCESS] Starting content extraction for URL: ${requestUrl}`);
    const html = await fetchPageWithPuppeteer(requestUrl, 60000);
    console.log(`[EXTRACTION_PROCESS] Retrieved HTML (via Puppeteer) length: ${html.length} characters`);

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      console.error("[EXTRACTION_PROCESS] Failed to parse HTML content obtained from Puppeteer.");
      throw new Error("Failed to parse HTML content from Puppeteer");
    }

    const titleElement = doc.querySelector("title");
    const metaTitleElement = doc.querySelector("meta[property='og:title']");
    const title = titleElement?.textContent?.trim() || metaTitleElement?.getAttribute("content")?.trim() || "Extracted Content";
    console.log(`[METADATA] Extracted title: ${title}`);

    let isRTL = false;
    const dirAttr = doc.querySelector("html")?.getAttribute("dir");
    const langAttr = doc.querySelector("html")?.getAttribute("lang");
    if (dirAttr === "rtl" || langAttr?.startsWith("ar") || langAttr?.startsWith("he")) isRTL = true;
    console.log(`[METADATA] Determined RTL status: ${isRTL}`);

    let mainContent = "";
    let textContent = "";
    let excerpt = "";
    let byline = "";
    let siteName = "";

    try {
      console.log("[READABILITY] Applying Readability to extract content...");
      const reader = new Readability(doc.cloneNode(true) as Document);
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
        if (mainContent) {
          const tempDoc = new DOMParser().parseFromString(mainContent, "text/html");
          textContent = tempDoc?.body?.textContent || doc.body?.textContent || "";
        } else {
          textContent = doc.body?.textContent || "";
        }
        console.log(`[FALLBACK_RESULT] mainContent length: ${mainContent.length}, textContent length: ${textContent?.length}`);
      }
    } catch (readabilityError) {
      console.error("[READABILITY] Error using Readability:", readabilityError.message, readabilityError.stack);
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

    if (!excerpt && textContent) {
      excerpt = textContent.length > 250 ? textContent.substring(0, 250) + "..." : textContent;
      console.log(`[METADATA] Generated excerpt.`);
    }

    if (!byline) {
      const authorSelectors = ['meta[name="author"]', 'meta[property="article:author"]', '.author', '.byline', '.entry-author', '[rel="author"]', '.post-author', '[itemprop="author"] span[itemprop="name"]', '[itemprop="author"]', '.author-name'];
      for (const selector of authorSelectors) {
        const el = doc.querySelector(selector);
        if (el) { byline = (el.getAttribute("content") || el.textContent || "").trim(); if (byline) { console.log(`[METADATA] Found byline using "${selector}": ${byline}`); break; } }
      }
      if (!byline) console.log(`[METADATA] Could not find byline.`);
    }

    if (!siteName) {
      const siteNameSelectors = ['meta[property="og:site_name"]', '.site-name', '.site-title', '#site-title', 'meta[name="application-name"]', '[itemprop="publisher"] meta[itemprop="name"]', '[itemprop="publisher"]'];
      for (const selector of siteNameSelectors) {
        const el = doc.querySelector(selector);
        if (el) { siteName = (el.getAttribute("content") || el.textContent || "").trim(); if (siteName) { console.log(`[METADATA] Found site name using "${selector}": ${siteName}`); break; } }
      }
      if (!siteName) {
        try { const hostname = new URL(requestUrl).hostname; siteName = hostname.replace(/^www\./, '').split('.')[0]; console.log(`[METADATA] Generated site name from hostname: ${siteName}`); }
        catch { siteName = ""; console.warn(`[METADATA] Could not generate site name from hostname for URL: ${requestUrl}`); }
      }
    }
    
    if (!isRTL && textContent) {
      const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
      if (rtlChars.test(textContent.substring(0, 500))) { isRTL = true; console.log(`[METADATA] Determined RTL status based on text content scan.`); }
    }

    console.log(`[EXTRACTION_PROCESS] Completed. Final mainContent (HTML) length: ${mainContent.length}`);
    const result = { title, content: mainContent, textContent, length: textContent.length, excerpt, byline, siteName, rtl: isRTL };

    return new Response( JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    // --------- سجل مفصل للخطأ العام ---------
    console.error(`[GLOBAL_ERROR_HANDLER] Error processing URL (${requestUrl}):`);
    console.error(`[GLOBAL_ERROR_HANDLER] Message: ${error.message}`);
    console.error(`[GLOBAL_ERROR_HANDLER] Name: ${error.name}`);
    console.error(`[GLOBAL_ERROR_HANDLER] Stack: ${error.stack}`);
    console.error(`[GLOBAL_ERROR_HANDLER] Full error object:`, error); // اطبع الكائن كاملاً
    // ----------------------------------------
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
  const contentSelectors = [ 'div.post-details-content', 'article[class*="article-body"]', 'div[class*="article-body"]', '.entry-content', '.post-content', '.article-content', 'main article', 'article main', '#main-content article', '#content article', 'article', '[role="article"]', 'main', '[role="main"]', '.story-content', '#story', ];
  let contentElement: Element | null = null;
  let foundSelector = '';

  for (const selector of contentSelectors) {
    console.log(`[FALLBACK_SELECTOR_TRY] Trying selector: "${selector}"`);
    contentElement = doc.querySelector(selector);
    if (contentElement) { foundSelector = selector; console.log(`[FALLBACK_SELECTOR_FOUND] Found element using selector: "${selector}"`); break; }
    else { console.log(`[FALLBACK_SELECTOR_FAIL] Selector "${selector}" not found.`); }
  }

  if (!contentElement) { console.log("[FALLBACK_NO_ELEMENT] No specific content container found, using document.body."); contentElement = doc.body; foundSelector = 'document.body'; }

  if (contentElement) {
    console.log(`[FALLBACK_CLEANING] Using element from selector "${foundSelector}" for cleaning.`);
    const unwantedSelectors = [ 'script', 'style', 'link[rel="stylesheet"]', 'template', 'noscript', 'iframe', 'form', 'svg', 'header', 'footer', 'nav', 'aside', '.sidebar', '#sidebar', '.ads', '.advert', '.advertisement', '[class*="ad-"]', '[id*="ad-"]', '.comments', '#comments', '.comment-form', '.related-posts', '.related-articles', '.share-buttons', '.social-links', '.site-header', '.main-header', '.site-footer', '.main-footer', '.navigation', '.pagination', '.breadcrumb', '.toc', '.table-of-contents', '.cookie-banner', '.gdpr-consent', '.modal', '.popup', '.hidden', '[hidden]', '[style*="display:none"]', '[style*="visibility:hidden"]', '.sr-only', 'figure > figcaption', '.gallery-caption', '.wp-caption-text', '.meta', '.post-meta', '.entry-meta', '.author-bio', ];
    const contentClone = contentElement.cloneNode(true) as Element;
    for (const selector of unwantedSelectors) { try { contentClone.querySelectorAll(selector).forEach(el => el.remove()); } catch (e) { console.warn(`[FALLBACK_CLEANING_ERROR] Error removing elements with selector "${selector}": ${e.message}`); } }
    console.log("[FALLBACK_CLEANING] Cleaning completed. Returning innerHTML.");
    return contentClone.innerHTML || "";
  }
  console.log("[FALLBACK_NO_CONTENT] No content element to process. Returning empty string.");
  return "";
}