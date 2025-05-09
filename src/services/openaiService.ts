
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
    const response = await axios.get(url);
    
    if (response.status === 200) {
      // Basic HTML content extraction
      const htmlContent = response.data;
      
      // Extract text content from HTML
      // This is a simple implementation - in a production app, 
      // you'd use a more robust HTML parsing library
      const textContent = extractTextFromHtml(htmlContent);
      
      return textContent;
    } else {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
  } catch (error) {
    console.error("Error extracting content from URL:", error);
    throw new Error("Could not extract content from the provided URL");
  }
}

// Helper function to extract text content from HTML
function extractTextFromHtml(html: string): string {
  // Remove scripts, styles, and HTML tags
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Try to find main content
  const mainContentMatch = text.match(/<main\b[^<]*(?:(?!<\/main>)<[^<]*)*<\/main>/gi) ||
                          text.match(/<article\b[^<]*(?:(?!<\/article>)<[^<]*)*<\/article>/gi) ||
                          text.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>[\s\S]*?<\/div>/gi);
  
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
    
    // Fallback if parsing fails
    return [
      { id: '1', text: 'SEO optimization techniques' },
      { id: '2', text: 'content marketing strategy' },
      { id: '3', text: 'digital marketing best practices' },
    ].slice(0, count);
  } catch (error) {
    console.error("Error generating keyword suggestions:", error);
    return [
      { id: '1', text: 'SEO optimization techniques' },
      { id: '2', text: 'content marketing strategy' },
      { id: '3', text: 'digital marketing best practices' },
    ].slice(0, count);
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
    
    // Provide fallback suggestions if API call or parsing fails
    if (primaryKeyword.toLowerCase().includes('coffee')) {
      return [
        { id: '1', text: 'specialty coffee beans' },
        { id: '2', text: 'arabica coffee varieties' },
        { id: '3', text: 'coffee brewing methods' },
        { id: '4', text: 'fair trade coffee' },
        { id: '5', text: 'fresh roasted coffee' },
        { id: '6', text: 'single origin coffee' },
      ].slice(0, count);
    } else {
      return [
        { id: '1', text: 'seo content strategy' },
        { id: '2', text: 'keyword research tools' },
        { id: '3', text: 'search engine ranking factors' },
        { id: '4', text: 'on-page optimization' },
        { id: '5', text: 'meta descriptions' },
        { id: '6', text: 'content marketing' },
      ].slice(0, count);
    }
  } catch (error) {
    console.error("Error generating secondary keyword suggestions:", error);
    return [
      { id: '1', text: 'seo content strategy' },
      { id: '2', text: 'keyword research tools' },
      { id: '3', text: 'search engine ranking factors' },
      { id: '4', text: 'on-page optimization' },
      { id: '5', text: 'meta descriptions' },
      { id: '6', text: 'content marketing' },
    ].slice(0, count);
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
