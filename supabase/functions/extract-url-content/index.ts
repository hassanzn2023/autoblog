import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Use the alpha version for DOM manipulation as it's required by Readability
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
// Optional: Import createClient if you want to add Supabase logging/credits here
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define a score function for potential content elements
// Using 'any' for Deno_dom Element type to avoid complex type definitions here
function calculateContentScore(element: any): number {
    if (!element || !element.textContent) {
        return 0;
    }

    // Basic score based on text length
    let score = element.textContent.length;

    // Boost score for paragraphs (common in articles)
    const paragraphs = element.querySelectorAll('p');
    score += paragraphs.length * 20; // Arbitrary weight

    // Boost score for headings (h2, h3 often structure articles)
    const headings = element.querySelectorAll('h2, h3');
    score += headings.length * 10; // Arbitrary weight

    // Penalize based on link density (high links often mean navigation/sidebar/footer)
    const links = element.querySelectorAll('a');
    const textLength = element.textContent.length || 1; // Avoid division by zero
    const linkDensity = links.length / textLength;
    if (linkDensity > 0.05) { // If more than 5% of characters are in links (adjust threshold)
        score *= (1 - linkDensity * 10); // Apply a penalty, higher density means bigger penalty (adjust factor)
    }
     if (score < 0) score = 0; // Ensure score is not negative

    // Minor boost for semantic elements likely to contain content
    if (element.tagName === 'ARTICLE' || element.tagName === 'MAIN') {
        score += 100; // Higher boost for ARTICLE/MAIN
    } else if (element.tagName === 'SECTION') {
        score += 50;
    } else if (element.tagName === 'DIV') {
         // Divs are common, give a small boost but they are not semantic
         score += 5;
    }


    // Penalty for elements that are likely boilerplate containers based on common classes/IDs
    const id = element.id || '';
    const className = element.className || '';
     const boilerplateKeywords = ['sidebar', 'footer', 'header', 'nav', 'menu', 'widget', 'comment', 'ad', 'ads', 'related', 'share', 'breadcrumb']; // Expanded list
     const isBoilerplate = boilerplateKeywords.some(keyword =>
         id.toLowerCase().includes(keyword) || className.toLowerCase().includes(keyword)
     );
     if (isBoilerplate) {
         score *= 0.2; // Reduce score significantly
     }


    return score;
}


/**
 * Helper to recursively find the best scoring element (most likely content)
 */
function findBestScoringElement(element: any, minScoreThreshold = 100): any | null { // Increased default threshold slightly
    if (!element) return null;

    let bestElement: any = null;
    let highestScore = minScoreThreshold - 1; // Start below threshold

    // Get children that are common block containers or text holders
    // Prioritize common content containers but include divs for flexibility
    const childrenToEvaluate = element.querySelectorAll('article, main, section, div, p, blockquote'); // Evaluate these children type

    // Score the current element itself (in case the content is directly in the root of the search)
     const currentElementScore = calculateContentScore(element);
      if (currentElementScore > highestScore) {
         highestScore = currentElementScore;
         bestElement = element;
      }


    for (const child of childrenToEvaluate) {
         // Avoid evaluating very small elements that are unlikely to be content blocks
         if ((child.textContent?.length || 0) < 30) { // Minimum text length for a child candidate
             continue; // Skip very short children
         }

        const childScore = calculateContentScore(child);

         // Recursive call to check grandchildren, but maybe stop at a certain depth or score
         // For simplicity, let's primarily evaluate the child and its immediate relevant children

         let potentialBestDescendant: any = child;
         let potentialBestDescendantScore = childScore;

         // Look one level deeper into common container types (article, section, div, main)
         if(['ARTICLE', 'MAIN', 'SECTION', 'DIV'].includes(child.tagName)){
              for(const grandChild of child.children){
                   const isGrandChildCandidate = ['P', 'H2', 'H3', 'BLOCKQUOTE', 'FIGURE', 'DIV'].includes(grandChild.tagName); // Look for text/heading/common containers
                    if(isGrandChildCandidate && (grandChild.textContent?.length || 0) > 50){ // Slightly higher threshold for grandchild
                        const grandChildScore = calculateContentScore(grandChild);
                         if(grandChildScore > potentialBestDescendantScore * 1.1) { // If grandchild is significantly better (adjust factor)
                             potentialBestDescendantScore = grandChildScore;
                             potentialBestDescendant = grandChild;
                         }
                    }
              }
         }


        if (potentialBestDescendantScore > highestScore) {
            highestScore = potentialBestDescendantScore;
            bestElement = potentialBestDescendant;
        }
    }

    // Final check: If the initial element (bodyClone) scored highest, use it.
     // This logic is already covered by the initial score check of 'element' itself,
     // but ensures if no child was better than the parent, the parent is correctly selected.
     // This can be implicit now that we score the starting element too.


    return bestElement;
}


/**
 * Enhanced Fallback content extraction method using scoring and recursive finding
 */
function fallbackExtractContentEnhanced(doc: any): string { // Using 'any' for Deno_dom Document type
    if (!doc || !doc.body) {
        console.warn("Fallback: Document or body is null.");
        return "";
    }

    // Create a clone to avoid modifying the original DOM while removing elements
    const bodyClone = doc.body.cloneNode(true);

    // Remove known unwanted elements from the clone before scoring
    const unwantedSelectors = [
        'script', 'style', 'iframe', 'noscript', // Basic cleanups
        'nav', 'footer', '.ads', '.ad-container', '[id*="ad"]', '[class*="ad"]', // Common non-content areas
        '.comments', '.sidebar', '.widget', '.menu', '.navigation', '.breadcrumb',
        '.related', '.share', '[id*="comment"]', '[class*="comment"]',
        '[id*="widget"]', '[class*="widget"]', '[id*="sidebar"]', '[class*="sidebar"]',
        '[id*="banner"]', '[class*="banner"]', '[id*="footer"]', '[class*="footer"]',
        '[id*="header"]', '[class*="header"]', // May remove headers too, but be careful
        '.no-print', // Often used for UI elements not content
        'form' // Forms are rarely article content
    ];

    for (const selector of unwantedSelectors) {
        try {
             const elements = bodyClone.querySelectorAll(selector);
             elements.forEach((el: any) => el.remove());
        } catch(e) {
             console.error(`Fallback: Error removing elements with selector "${selector}": ${e}`);
        }
    }
     console.log("Fallback: Removed unwanted elements.");


    // Start the search for the best content element from the cleaned body
    // findBestScoringElement will traverse down from the cloned body
    const bestElement = findBestScoringElement(bodyClone, 100); // Start recursive search with a base score threshold

    // If a good element was found and it contains enough text, return its innerHTML
    if (bestElement && (bestElement.textContent?.length || 0) > 100) { // Ensure extracted content is not too short (adjust threshold)
        console.log(`Enhanced fallback found a suitable element with score. Returning innerHTML.`);
        return bestElement.innerHTML || "";
    }

    // If no suitable element was found, fallback to returning the cleaned body's innerHTML
    console.log("Enhanced fallback did not find a specific element or element was too short. Returning cleaned body innerHTML.");
    return bodyClone.innerHTML || ""; // Return content of the cleaned body
}


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check for API Key - Important for rate limiting/usage tracking if you implement it
  // const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  // const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

  // if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
  //      console.error("Supabase env vars not set");
  //      // Decide if you block requests if Supabase is not configured
  // }
  // const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;


  try {
    const { url, userId, workspaceId } = await req.json(); // Assuming userId and workspaceId might be passed for logging/credits

    if (!url) {
      console.warn("URL is required but was not provided.");
      return new Response(JSON.stringify({
        error: 'URL is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Attempting to extract content from URL: ${url}`);
    // console.log(`User ID: ${userId || 'Not provided'}, Workspace ID: ${workspaceId || 'Not provided'}`); // Log auth details if passed

    // Optional: Implement credit check here if needed
    // if (supabase && userId && workspaceId) { ... check credits ... }


    // Fetch the content from the URL with improved headers and timeout
    const controller = new AbortController();
    // Increased timeout slightly more for potentially slow sites
    const timeoutId = setTimeout(() => {
        controller.abort();
        console.error(`Fetch timeout occurred for URL: ${url} after 35 seconds.`);
    }, 35000); // 35 second timeout

    let response: Response;
    try {
        response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', // Common desktop user agent
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8', // Prefer HTML/XHTML
            'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8', // Accept English and Arabic
             'Referer': url, // Add referer header
             'Connection': 'keep-alive' // Keep connection open
          },
          signal: controller.signal
        });
         console.log(`Fetch successful for URL: ${url}, Status: ${response.status}`);
    } catch (fetchError: any) { // Use 'any' for generic error type
        if (fetchError.name === 'AbortError') {
             console.error(`Fetch aborted (timeout or manual) for URL: ${url}`);
             throw new Error("URL fetch timed out or was aborted.");
        }
        console.error(`Failed to fetch URL: ${url}`, fetchError);
        throw new Error(`Failed to fetch URL: ${fetchError.message || 'Unknown network error'}`);
    } finally {
        clearTimeout(timeoutId);
    }


    if (!response.ok) {
      console.error(`Fetch returned non-OK status: ${response.status} ${response.statusText} for ${url}`);
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

     // Check Content-Type to ensure it's HTML
     const contentType = response.headers.get("content-type");
     if (!contentType || !contentType.includes("text/html")) {
         console.warn(`Received non-HTML content type: "${contentType}" for ${url}`);
         throw new Error(`URL does not provide HTML content. Received: ${contentType || 'unknown'}`);
     }


    const html = await response.text();
    console.log(`Retrieved HTML content length: ${html.length} characters`);

    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    if (!doc) {
      console.error(`Failed to parse HTML content from ${url}`);
      throw new Error("Failed to parse HTML content");
    }
    console.log("HTML content parsed successfully.");

    // Extract title
    const titleElement = doc.querySelector("title");
    const metaTitleElement = doc.querySelector("meta[property='og:title']") || doc.querySelector("meta[name='twitter:title']"); // Add twitter title
     // Use page title if available, fallback to og:title/twitter:title, then default
    const title = titleElement?.textContent?.trim() || metaTitleElement?.getAttribute("content")?.trim() || "Extracted Content";

    console.log(`Extracted title: "${title}"`);


    // Determine if content is RTL - Initial check from HTML/meta attributes
    let isRTL = false;
    const dirAttr = doc.querySelector("html")?.getAttribute("dir");
    const langAttr = doc.querySelector("html")?.getAttribute("lang");
    if (dirAttr === "rtl" || langAttr?.startsWith("ar") || langAttr?.startsWith("he")) {
      isRTL = true;
    }


    // Extract main content using Readability first
    let mainContent = ""; // HTML content
    let textContent = ""; // Plain text content derived from mainContent
    let excerpt = "";
    let byline = "";
    let siteName = "";
     let usedReadability = false; // Flag to indicate if Readability succeeded

    try {
      console.log("Applying Readability to extract content");
       // Readability needs the document object, not its innerHTML
      const reader = new Readability(doc);
      const article = reader.parse(); // This might return null if no article is found

      if (article) {
        console.log(`Readability successfully extracted article. Title: ${article.title || 'No Title'}`);
        mainContent = article.content || ""; // HTML content
        textContent = article.textContent || ""; // Plain text content
        excerpt = article.excerpt || "";
        byline = article.byline || "";
        siteName = article.siteName || "";
         usedReadability = true; // Mark that Readability was used
        console.log(`Readability extracted content length: ${mainContent.length} characters`);
        console.log(`Readability extracted text length: ${textContent.length} characters`);
      } else {
        console.log("Readability could not extract article, falling back to enhanced manual extraction");
        // Fall back to enhanced manual extraction logic if Readability fails
        mainContent = fallbackExtractContentEnhanced(doc); // <-- Call the ENHANCED fallback

         // Derive textContent, excerpt, etc. from fallback mainContent
         if (mainContent) {
             // Create a temporary element to get textContent without HTML tags for accurate length/excerpt/RTL check
             const tempDoc = parser.parseFromString(mainContent, "text/html");
             textContent = tempDoc.body?.textContent || "";
         } else {
             // If fallback didn't get much, use cleaned body text as a last resort for textContent/excerpt/RTL check
             const tempDoc = parser.parseFromString(doc.body?.innerHTML || '', "text/html"); // Use cleaned body innerHTML
             textContent = tempDoc.body?.textContent || "";
         }
      }
    } catch (readabilityError: any) { // Use 'any' for error type
      console.error("Error using Readability, falling back:", readabilityError.message || readabilityError);
      // Fall back to the enhanced manual extraction method if Readability throws an error
      mainContent = fallbackExtractContentEnhanced(doc); // <-- Call the ENHANCED fallback
      if (mainContent) {
          const tempDoc = parser.parseFromString(mainContent, "text/html");
          textContent = tempDoc.body?.textContent || "";
      } else {
           const tempDoc = parser.parseFromString(doc.body?.innerHTML || '', "text/html");
           textContent = tempDoc.body?.textContent || "";
      }
    }


    // Clean and refine extracted plain text content
    textContent = textContent.replace(/\s+/g, ' ').trim();
    // Remove multiple newline characters that are not part of actual paragraphs (e.g., from list items or divs)
    textContent = textContent.replace(/\n{2,}/g, '\n\n').replace(/(\S)\n([^\n\S])/g, '$1$2'); // Preserve single newlines within paragraphs better? This regex might need fine-tuning. A simpler approach is just space replacement.
     // Let's stick to the simpler space replacement and trimming for robustness:
     textContent = textContent.replace(/\s+/g, ' ').trim();


    // Extract excerpt if not already set by Readability or derived from content
    if (!excerpt && textContent) {
      excerpt = textContent.length > 200 ? textContent.substring(0, 200).trim() + "..." : textContent.trim(); // Use textContent for excerpt
    } else if (excerpt) {
        excerpt = excerpt.trim(); // Trim existing excerpt from Readability
    }


    // Extract author/byline with expanded selectors if not already set by Readability
    if (!byline) {
      const authorSelectors = [
        'meta[name="author"]',
        'meta[property="article:author"]',
         '[itemprop="author"] [itemprop="name"]', // Common schema markup
         '[rel="author"]', // Link with rel="author"
         '.author', '.byline', '.entry-author',
        '.post-author',
        '[itemprop="author"]', // Element with itemprop="author"
        '.author-name',
        '.td-post-author-name', // Example for some themes
         'a[rel="author"] span' // Common pattern for linked author name
      ];
      for (const selector of authorSelectors){
        const authorElement = doc.querySelector(selector);
        if (authorElement) {
          // Prefer 'content' attribute for meta tags, otherwise textContent
          byline = (authorElement.getAttribute("content") || authorElement.textContent || "")?.trim();
          if (byline) break;
        }
      }
    } else {
        byline = byline.trim(); // Trim existing byline from Readability
    }


    // Extract site name if not already set by Readability
    if (!siteName) {
      const siteNameSelectors = [
        'meta[property="og:site_name"]',
         'meta[name="twitter:site"]', // Add twitter site
        '.site-name', '.site-title', '#site-title',
        '[itemprop="publisher"] [itemprop="name"]', // Common schema markup
        '.publisher',
         'a.site-title', // Common link with site title
         '#site-description' // Sometimes site name is here
      ];
      for (const selector of siteNameSelectors){
        const siteNameElement = doc.querySelector(selector);
        if (siteNameElement) {
          // Prefer 'content' attribute for meta tags, otherwise textContent
          siteName = (siteNameElement.getAttribute("content") || siteNameElement.textContent || "")?.trim();
          if (siteName) break;
        }
      }
      // Fallback to hostname if site name still not found
      if (!siteName) {
        try {
          const hostname = new URL(url).hostname;
          siteName = hostname.replace(/^www\./, '').split('.')[0]; // Get domain name part (e.g., "example" from "www.example.com")
        } catch  {
          siteName = ""; // If URL is invalid, siteName remains empty
        }
      }
    } else {
        siteName = siteName.trim(); // Trim existing siteName from Readability
    }


    // Final check content for RTL characters based on the final textContent
    if (!isRTL && textContent) { // Only re-check if not already marked RTL and textContent is available
      const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFF]/;
      isRTL = rtlChars.test(textContent);
      if(isRTL) console.log("RTL detected based on text content.");
    } else if (isRTL) {
         console.log("RTL detected based on HTML attributes.");
    } else {
        console.log("LTR detected based on text content.");
    }


    console.log(`--- Final Extraction Results ---`);
    console.log(`Title: "${title}"`);
    console.log(`Content (HTML) Length: ${mainContent.length} characters`);
    console.log(`Text Content Length: ${textContent.length} characters`);
    console.log(`Excerpt (sample): "${excerpt.substring(0, 100)}..."`); // Log excerpt sample
    console.log(`Byline: "${byline}"`);
    console.log(`SiteName: "${siteName}"`);
    console.log(`Is RTL: ${isRTL}`);
    console.log(`Used Readability: ${usedReadability}`);
    console.log(`--------------------------------`);


    // Optional: Record successful extraction and credits used here
    // if (supabase && userId && workspaceId && required_credits_for_success) { ... record usage ... }


    // Return the extracted content
    const result = {
      title,
      content: mainContent, // HTML content
      textContent, // Plain text content derived from mainContent or body
      length: textContent.length, // Length of final plain text
      excerpt,
      byline,
      siteName,
      rtl: isRTL,
      usedReadability // Add a flag to indicate if Readability succeeded
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) { // Use 'any' for generic error type
    console.error("Error extracting content from URL:", error.message || error);
    // Optional: Record failed extraction and any minimal credit cost/log
    // if (supabase && userId && workspaceId && required_credits_for_failure) { ... record usage ... }

    // Return an error response with some fallback data
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during content extraction', // Return the specific error message
        status: 'error', // Add status field for easier handling on frontend
        title: "Extraction Failed",
        content: `<p>Could not extract content from the provided URL.</p><p>Details: ${error.message || 'Unknown error'}</p><p>Please try again or paste the content manually.</p>`, // Provide feedback in content HTML
        textContent: `Could not extract content from the provided URL. Details: ${error.message || 'Unknown error'}`, // Provide feedback in plain text
        length: 0,
        excerpt: "",
        byline: "",
        siteName: ""
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// --- Enhanced Fallback content extraction logic ---

// Define a score function for potential content elements
// Using 'any' for Deno_dom Element type to avoid complex type definitions here
function calculateContentScore(element: any): number {
    if (!element || typeof element.textContent !== 'string') { // Ensure textContent exists
        return 0;
    }

    // Basic score based on text length
    let score = element.textContent.length;

    // Boost score for paragraphs (common in articles)
    const paragraphs = element.querySelectorAll('p');
    score += paragraphs.length * 20; // Arbitrary weight

    // Boost score for headings (h2, h3 often structure articles)
    const headings = element.querySelectorAll('h2, h3');
    score += headings.length * 10; // Arbitrary weight

    // Penalize based on link density (high links often mean navigation/sidebar/footer)
    const links = element.querySelectorAll('a');
    const textLength = element.textContent.length || 1; // Avoid division by zero
    const linkDensity = links.length / textLength;
    if (linkDensity > 0.05) { // If more than 5% of characters are in links (adjust threshold)
        score *= (1 - linkDensity * 10); // Apply a penalty, higher density means bigger penalty (adjust factor)
    }
     if (score < 0) score = 0; // Ensure score is not negative

    // Minor boost for semantic elements likely to contain content
    if (element.tagName === 'ARTICLE' || element.tagName === 'MAIN') {
        score += 100; // Higher boost for ARTICLE/MAIN
    } else if (element.tagName === 'SECTION') {
        score += 50;
    } else if (element.tagName === 'DIV') {
         // Divs are common, give a small boost but they are not semantic
         score += 5;
    }


    // Penalty for elements that are likely boilerplate containers based on common classes/IDs
    const id = element.id || '';
    const className = element.className || '';
     const boilerplateKeywords = ['sidebar', 'footer', 'header', 'nav', 'menu', 'widget', 'comment', 'ad', 'ads', 'related', 'share', 'breadcrumb']; // Expanded list
     const isBoilerplate = boilerplateKeywords.some(keyword =>
         id.toLowerCase().includes(keyword) || className.toLowerCase().includes(keyword)
     );
     if (isBoilerplate) {
         score *= 0.2; // Reduce score significantly
     }


    return score;
}


/**
 * Helper to recursively find the best scoring element (most likely content)
 */
function findBestScoringElement(element: any, minScoreThreshold = 100): any | null { // Increased default threshold slightly
    if (!element) return null;

    let bestElement: any = null;
    let highestScore = minScoreThreshold - 1; // Start below threshold

    // Score the current element itself (in case the content is directly in the root of the search)
    const currentElementScore = calculateContentScore(element);
    if (currentElementScore > highestScore) {
       highestScore = currentElementScore;
       bestElement = element;
    }


    // Get children that are common block containers or text holders to evaluate
    // Prioritize common content containers but include divs for flexibility
    const childrenToEvaluate = element.querySelectorAll('article, main, section, div, p, blockquote'); // Evaluate these children type

    for (const child of childrenToEvaluate) {
         // Avoid evaluating very small elements that are unlikely to be content blocks
         if ((child.textContent?.length || 0) < 30) { // Minimum text length for a child candidate (adjust)
             continue; // Skip very short children
         }

        const childScore = calculateContentScore(child);

         // Recursively check children of this child, but maybe stop at a certain depth or score
         // For simplicity, let's primarily evaluate the child and its immediate relevant children

         let potentialBestDescendant: any = child;
         let potentialBestDescendantScore = childScore;

         // Look one level deeper into common container types (article, section, div, main)
         if(['ARTICLE', 'MAIN', 'SECTION', 'DIV'].includes(child.tagName)){
              for(const grandChild of child.children){
                   const isGrandChildCandidate = ['P', 'H2', 'H3', 'BLOCKQUOTE', 'FIGURE', 'DIV'].includes(grandChild.tagName); // Look for text/heading/common containers
                    if(isGrandChildCandidate && (grandChild.textContent?.length || 0) > 50){ // Slightly higher threshold for grandchild (adjust)
                        const grandChildScore = calculateContentScore(grandChild);
                         if(grandChildScore > potentialBestDescendantScore * 1.1) { // If grandchild is significantly better (adjust factor)
                             potentialBestDescendantScore = grandChildScore;
                             potentialBestDescendant = grandChild;
                         }
                    }
              }
         }


        if (potentialBestDescendantScore > highestScore) {
            highestScore = potentialBestDescendantScore;
            bestElement = potentialBestDescendant;
        }
    }

    // Final check: If the initial element (the one passed to the function)
    // ended up with the highest score, it is the best element.
    // This is handled by the initial score check of 'element' itself.


    return bestElement;
}


/**
 * Enhanced Fallback content extraction method using scoring and recursive finding
 * Takes the parsed DOM document as input.
 */
function fallbackExtractContentEnhanced(doc: any): string {
    if (!doc || !doc.body) {
        console.warn("Fallback: Document or body is null.");
        return "";
    }

    // Create a clone of the body to avoid modifying the original DOM while removing elements
    const bodyClone = doc.body.cloneNode(true);

    // Remove known unwanted elements from the clone before scoring
    const unwantedSelectors = [
        'script', 'style', 'iframe', 'noscript', // Basic cleanups
        'nav', 'footer', '.ads', '.ad-container', '[id*="ad"]', '[class*="ad"]', // Common non-content areas
        '.comments', '.sidebar', '.widget', '.menu', '.navigation', '.breadcrumb',
        '.related', '.share', '[id*="comment"]', '[class*="comment"]',
        '[id*="widget"]', '[class*="widget"]', '[id*="sidebar"]', '[class*="sidebar"]',
        '[id*="banner"]', '[class*="banner"]', '[id*="footer"]', '[class*="footer"]',
        '[id*="header"]', '[class*="header"]', // May remove headers too, but be careful
        '.no-print', // Often used for UI elements not content
        'form' // Forms are rarely article content
    ];

    for (const selector of unwantedSelectors) {
        try {
             const elements = bodyClone.querySelectorAll(selector);
             elements.forEach((el: any) => el.remove());
        } catch(e) {
             console.error(`Fallback: Error removing elements with selector "${selector}": ${e}`);
        }
    }
     console.log("Fallback: Removed unwanted elements from body clone.");


    // Start the search for the best content element from the cleaned body clone
    // findBestScoringElement will traverse down from the cloned body
    // Passing bodyClone itself as the starting element for evaluation
    const bestElement = findBestScoringElement(bodyClone, 100); // Start recursive search with a base score threshold (adjust)

    // If a good element was found and it contains enough text, return its innerHTML
    // Adding a check for minimum text length of the *found* element
    if (bestElement && (bestElement.textContent?.length || 0) > 100) { // Ensure extracted content is not too short (adjust threshold)
        console.log(`Enhanced fallback found a suitable element with score.`);
        return bestElement.innerHTML || "";
    }

    // If no suitable element was found, fallback to returning the cleaned body's innerHTML
    console.log(`Enhanced fallback did not find a specific element (score below ${100} or text too short < ${100} chars). Returning cleaned body innerHTML.`);
    return bodyClone.innerHTML || ""; // Return content of the cleaned body
}