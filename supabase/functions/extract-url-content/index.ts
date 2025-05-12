
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.36-alpha/deno-dom-wasm.ts";

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
    
    // Fetch the content from the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
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
    
    // Extract main content (simplified approach)
    let mainContent = "";
    let textContent = "";
    
    // Try to find main content container
    const contentSelectors = [
      'main', 'article', '[role="main"]',
      '.content', '.article', '.post', '.entry-content',
      '#content', '#main-content', '#article-content',
      'article', '.article-body', '.story-body'
    ];
    
    let contentElement = null;
    for (const selector of contentSelectors) {
      contentElement = doc.querySelector(selector);
      if (contentElement) break;
    }
    
    // If no main content found, use the body
    if (!contentElement) {
      contentElement = doc.body;
    }
    
    if (contentElement) {
      // Remove unwanted elements
      const unwantedSelectors = ['script', 'style', 'footer', 'header', 'nav', '.ads', '.comments'];
      for (const selector of unwantedSelectors) {
        contentElement.querySelectorAll(selector).forEach(el => el.remove());
      }
      
      mainContent = contentElement.innerHTML || "";
      textContent = contentElement.textContent || "";
    }
    
    // Clean text content
    textContent = textContent.replace(/\s+/g, ' ').trim();
    
    // Extract excerpt (first 150 characters)
    const excerpt = textContent.length > 150
      ? textContent.substring(0, 150) + "..."
      : textContent;
    
    // Extract author/byline
    const authorElement = doc.querySelector("meta[name='author']") || 
                         doc.querySelector("meta[property='article:author']");
    const byline = authorElement?.getAttribute("content") || "";
    
    // Extract site name
    const siteNameElement = doc.querySelector("meta[property='og:site_name']");
    let siteName = siteNameElement?.getAttribute("content") || "";
    
    if (!siteName) {
      try {
        const hostname = new URL(url).hostname;
        siteName = hostname.replace(/^www\./, '').split('.')[0];
      } catch {
        siteName = "";
      }
    }
    
    // Return the extracted content
    const result = {
      title,
      content: mainContent,
      textContent,
      length: textContent.length,
      excerpt,
      byline,
      siteName
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
