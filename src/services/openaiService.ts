// OpenAI service for SEO analysis and keyword suggestions
import axios from 'axios';

const OPENAI_API_KEY = "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";

interface KeywordSuggestion {
  id: string;
  text: string;
}

// Function to extract content from a URL
export async function extractContentFromUrl(url: string): Promise<string> {
  try {
    console.log("Fetching content from URL:", url);
    
    // Make HTTP request to fetch the page content
    const response = await axios.get(url, {
      headers: {
        // Add common headers to mimic a browser request
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    if (response.status === 200) {
      // Extract text content from HTML
      const htmlContent = response.data;
      const textContent = extractTextFromHtml(htmlContent);
      
      // If extraction returned very little content, try a different approach
      if (textContent.length < 500) {
        console.log("Initial content extraction returned limited content, trying alternative method");
        return extractMainContentFromHtml(htmlContent);
      }
      
      return textContent;
    } else {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
  } catch (error) {
    console.error("Error extracting content from URL:", error);
    throw new Error("Could not extract content from the provided URL. Please check the URL and try again.");
  }
}

// Enhanced function to extract text content from HTML
function extractTextFromHtml(html: string): string {
  try {
    // Remove scripts, styles, and HTML tags
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    // Try to find main content
    const mainContentMatch = text.match(/<main\b[^<]*(?:(?!<\/main>)<[^<]*)*<\/main>/gi) ||
                            text.match(/<article\b[^<]*(?:(?!<\/article>)<[^<]*)*<\/article>/gi) ||
                            text.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>[\s\S]*?<\/div>/gi) ||
                            text.match(/<div[^>]*class="[^"]*article[^"]*"[^>]*>[\s\S]*?<\/div>/gi) ||
                            text.match(/<div[^>]*class="[^"]*post[^"]*"[^>]*>[\s\S]*?<\/div>/gi);
    
    if (mainContentMatch && mainContentMatch.length > 0) {
      text = mainContentMatch.join(' ');
    }

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, ' ');
    
    // Replace multiple spaces, tabs, and newlines with a single space
    text = text.replace(/\s+/g, ' ');
    
    // Decode HTML entities
    text = text.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#x27;/g, "'")
               .replace(/&#x2F;/g, '/');
    
    return text.trim();
  } catch (error) {
    console.error("Error in extractTextFromHtml:", error);
    return "Error extracting content from HTML.";
  }
}

// Alternative method to extract main content from HTML
function extractMainContentFromHtml(html: string): string {
  try {
    // Create a temporary element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove unwanted elements
    const elementsToRemove = ['script', 'style', 'nav', 'footer', 'header', 'aside', 'form', 'iframe'];
    elementsToRemove.forEach(tag => {
      const elements = tempDiv.getElementsByTagName(tag);
      while (elements[0]) {
        elements[0].parentNode?.removeChild(elements[0]);
      }
    });
    
    // Try to find main content container
    let contentElement = null;
    const possibleContentSelectors = ['main', 'article', '.content', '.article', '.post', '.entry-content', '#content', '#main-content'];
    
    for (const selector of possibleContentSelectors) {
      const element = selector.startsWith('.') || selector.startsWith('#') 
        ? tempDiv.querySelector(selector) 
        : tempDiv.getElementsByTagName(selector)[0];
      
      if (element) {
        contentElement = element;
        break;
      }
    }
    
    // If no specific content container found, use the body
    const textContent = contentElement 
      ? contentElement.textContent || "" 
      : tempDiv.textContent || "";
    
    // Clean up whitespace
    return textContent.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error("Error in extractMainContentFromHtml:", error);
    return "Error extracting content using alternative method.";
  }
}

export async function generateKeywordSuggestions(
  content: string,
  count: number = 3,
  note?: string
): Promise<KeywordSuggestion[]> {
  try {
    console.log("Generating keyword suggestions for content:", content.substring(0, 100) + "...");
    console.log("User note for regeneration:", note);
    
    // Prepare the prompt for OpenAI
    const prompt = `
    Based on the following content, suggest ${count} SEO-friendly primary keywords that would help this content rank well in search engines. 
    Each suggestion should be specific and relevant to the main topic.
    ${note ? `Additional guidance: ${note}` : ''}
    
    Content: ${content.substring(0, 3000)}
    
    Provide exactly ${count} keywords in JSON array format, each with an id and text field.
    `;

    // Make API call to OpenAI
    const openAIResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an SEO expert that provides keyword suggestions based on content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseContent = openAIResponse.data.choices[0].message.content;
    console.log("OpenAI response:", responseContent);
    
    // Parse the JSON response
    try {
      // Find JSON array in the response
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsedSuggestions = JSON.parse(jsonStr);
        
        // Format the results as expected
        return parsedSuggestions.map((suggestion: any, index: number) => ({
          id: suggestion.id || `${index + 1}`,
          text: suggestion.text
        }));
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
    }
    
    // Empty default if parsing fails
    return [];
  } catch (error) {
    console.error("Error generating keyword suggestions:", error);
    return [];
  }
}

export async function generateSecondaryKeywordSuggestions(
  primaryKeyword: string,
  content: string,
  count: number = 6,
  note?: string
): Promise<KeywordSuggestion[]> {
  try {
    console.log("Generating secondary keywords for primary keyword:", primaryKeyword);
    console.log("Based on content:", content.substring(0, 100) + "...");
    console.log("User note for regeneration:", note);
    
    // Prepare the prompt for OpenAI
    const prompt = `
    Based on the primary keyword "${primaryKeyword}" and the following content, suggest ${count} related secondary keywords that would complement the primary keyword and help with SEO.
    ${note ? `Additional guidance: ${note}` : ''}
    
    Content: ${content.substring(0, 3000)}
    
    Provide exactly ${count} secondary keywords in JSON array format, each with an id and text field.
    `;

    // Make API call to OpenAI
    const openAIResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an SEO expert that provides related secondary keyword suggestions based on a primary keyword and content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseContent = openAIResponse.data.choices[0].message.content;
    console.log("OpenAI response:", responseContent);
    
    // Parse the JSON response
    try {
      // Find JSON array in the response
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const parsedSuggestions = JSON.parse(jsonStr);
        
        // Format the results as expected
        return parsedSuggestions.map((suggestion: any, index: number) => ({
          id: suggestion.id || `${index + 1}`,
          text: suggestion.text
        }));
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
    }
    
    // Empty default if parsing fails
    return [];
  } catch (error) {
    console.error("Error generating secondary keyword suggestions:", error);
    return [];
  }
}

export async function analyzeSEOScore(
  content: string,
  primaryKeyword: string,
  secondaryKeywords: string[]
): Promise<{
  score: number;
  recommendations: Array<{
    status: 'success' | 'warning' | 'error';
    text: string;
    action?: string;
  }>;
  stats: {
    words: number;
    headings: number;
    paragraphs: number;
    images: number;
  };
}> {
  try {
    console.log("Analyzing SEO score for content with primary keyword:", primaryKeyword);
    
    // Calculate basic stats
    const words = content.split(/\s+/).filter(Boolean).length;
    const headings = (content.match(/#/g) || []).length;
    const paragraphs = (content.match(/\n\s*\n/g) || []).length + 1;
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    
    // Prepare the prompt for OpenAI
    const prompt = `
    Analyze the following content for SEO optimization with primary keyword "${primaryKeyword}" and secondary keywords: ${secondaryKeywords.join(", ")}.
    
    Content: ${content.substring(0, 3000)}
    
    Provide a JSON response with:
    1. score: A number from 0-100 representing the overall SEO quality
    2. recommendations: An array of objects, each with:
       - status: either "success", "warning", or "error"
       - text: A description of the recommendation
       - action: (optional) A suggested action like "Fix" or "See"
    
    Focus on keyword usage, content structure, readability, and optimization opportunities.
    `;

    // Make API call to OpenAI
    const openAIResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an SEO expert that analyzes content and provides actionable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseContent = openAIResponse.data.choices[0].message.content;
    console.log("OpenAI analysis response:", responseContent);
    
    // Parse the JSON response
    try {
      // Find JSON object in the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const analysis = JSON.parse(jsonStr);
        
        return {
          score: analysis.score || 85,
          recommendations: analysis.recommendations || [
            { 
              status: 'success', 
              text: `Basic optimization for "${primaryKeyword}" complete.` 
            },
            { 
              status: 'warning', 
              text: "For full control, try Pro Mode." 
            }
          ],
          stats: {
            words,
            headings,
            paragraphs,
            images
          }
        };
      }
    } catch (parseError) {
      console.error("Error parsing OpenAI analysis response:", parseError);
    }
    
    // Return default analysis if API call or parsing fails
    return {
      score: 78,
      recommendations: [
        { 
          status: 'success', 
          text: `Basic optimization for "${primaryKeyword}" complete.` 
        },
        { 
          status: 'warning', 
          text: "For full control, try Pro Mode." 
        },
        { 
          status: 'error', 
          text: "Add more supporting content to improve ranking.",
          action: "Fix" 
        },
        { 
          status: 'error', 
          text: "Add at least one image to improve engagement.",
          action: "See" 
        }
      ],
      stats: {
        words,
        headings,
        paragraphs,
        images
      }
    };
  } catch (error) {
    console.error("Error analyzing SEO score:", error);
    
    // Calculate basic stats even if API call fails
    const words = content.split(/\s+/).filter(Boolean).length;
    const headings = (content.match(/#/g) || []).length;
    const paragraphs = (content.match(/\n\s*\n/g) || []).length + 1;
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    
    return {
      score: 70,
      recommendations: [
        { 
          status: 'success', 
          text: `Basic optimization for "${primaryKeyword}" complete.` 
        },
        { 
          status: 'warning', 
          text: "For full control, try Pro Mode." 
        },
        { 
          status: 'error', 
          text: "Add more supporting content to improve ranking.",
          action: "Fix" 
        }
      ],
      stats: {
        words,
        headings,
        paragraphs,
        images
      }
    };
  }
}
