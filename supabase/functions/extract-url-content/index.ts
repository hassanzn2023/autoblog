
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Extracting content from URL: ${url}`);
    
    // Fetch the content from the URL with improved headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Retrieved HTML content length: ${html.length} characters`);
    
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    if (!doc) {
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
      
      if (article) {
        console.log(`Readability successfully extracted article: ${article.title}`);
        mainContent = article.content || "";
        textContent = article.textContent || "";
        excerpt = article.excerpt || "";
        byline = article.byline || "";
        siteName = article.siteName || "";
        
        console.log(`Extracted content length: ${mainContent.length} characters`);
        console.log(`Extracted text length: ${textContent.length} characters`);
      } else {
        console.log("Readability could not extract article, falling back to manual extraction");
        // Fall back to manual extraction logic if Readability fails
        mainContent = fallbackExtractContent(doc);
        textContent = doc.body?.textContent || "";
      }
    } catch (readabilityError) {
      console.error("Error using Readability:", readabilityError);
      
      // Fall back to the original extraction method
      mainContent = fallbackExtractContent(doc);
      textContent = doc.body?.textContent || "";
    }
    
    // Clean text content
    textContent = textContent.replace(/\s+/g, ' ').trim();
    
    // Extract excerpt if not already set by Readability
    if (!excerpt) {
      excerpt = textContent.length > 150
        ? textContent.substring(0, 150) + "..."
        : textContent;
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
          if (byline) break;
        }
      }
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
          if (siteName) break;
        }
      }
      
      if (!siteName) {
        try {
          const hostname = new URL(url).hostname;
          siteName = hostname.replace(/^www\./, '').split('.')[0];
        } catch {
          siteName = "";
        }
      }
    }
    
    // Check content again for RTL characters if not already determined
    if (!isRTL) {
      const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
      isRTL = rtlChars.test(textContent);
    }
    
    console.log(`Completed extraction. Content length: ${mainContent.length} characters`);
    
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
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error extracting content from URL:", error.message);
    return new Response(
      JSON.stringify({ 
        error: "Failed to extract content from URL", 
        details: error.message,
        title: "Error extracting content",
        content: `<p>Could not extract content from the provided URL. Please try again or paste the content manually.</p>`,
        textContent: "Could not extract content from the provided URL.",
        length: 0,
        excerpt: "",
        byline: "",
        siteName: ""
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Fallback content extraction method
 */
function fallbackExtractContent(doc) {
  // Try to find main content container using extended selectors
const contentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.article',
    '.post',
    '.entry-content',
    '.story',
    '.blog-post',
    '#content',
    '#main-content',
    '#article-content',
    '#story-content',
    '#post-content',
    '.article-body',
    '.story-body',
    '.content-area',
    '.post-body',
    '.main-content',
    '.page-content',
    '.entry',
    '.single-content',
    '.wordpress-content',
    // Add the new selectors based on your analysis:
    '.post-details-content', // من الكود الذي قدمته
    '.prose',                // من الكود الذي قدمته
    // You could also add more specific selectors if needed, e.g., '.post-details-content .prose'
  ];
  
  let contentElement = null;
  for (const selector of contentSelectors) {
    contentElement = doc.querySelector(selector);
    if (contentElement) {
      console.log(`Found content using selector: ${selector}`);
      break;
    }
  }
  
  // If no main content found, use the body
  if (!contentElement) {
    console.log("No specific content container found, using body");
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
        '[id*="comment"]',
        '[class*="comment"]',
        '[id*="widget"]',
        '[class*="widget"]',
        '[id*="sidebar"]',
        '[class*="sidebar"]',
        '[id*="banner"]',
        '[class*="banner"]',
        '[id*="footer"]',
        '[class*="footer"]'
      ];
    
    // Create a copy of the content to avoid modifying during iteration
    const contentClone = contentElement.cloneNode(true);
    
    for (const selector of unwantedSelectors) {
      const elements = contentClone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    }
    
    return contentClone.innerHTML || "";
  }
  
  return "";
}
