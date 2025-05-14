
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock data for SERP analysis - in production, this would be replaced with an actual SERP API
const mockCompetitorData = {
  "us": {
    competitors: [
      {
        url: "https://example.com/article1",
        title: "Top 10 SEO Strategies for 2023",
        wordCount: 1250,
        headingsCount: 8,
        paragraphsCount: 15,
        imagesCount: 6
      },
      {
        url: "https://example.com/article2",
        title: "Ultimate SEO Guide",
        wordCount: 2100,
        headingsCount: 12,
        paragraphsCount: 22,
        imagesCount: 9
      },
      {
        url: "https://example.com/article3",
        title: "SEO Best Practices",
        wordCount: 1800,
        headingsCount: 10,
        paragraphsCount: 18,
        imagesCount: 5
      },
      {
        url: "https://example.com/article4",
        title: "SEO for Beginners",
        wordCount: 950,
        headingsCount: 6,
        paragraphsCount: 12,
        imagesCount: 3
      },
      {
        url: "https://example.com/article5",
        title: "Advanced SEO Techniques",
        wordCount: 3200,
        headingsCount: 15,
        paragraphsCount: 28,
        imagesCount: 12
      }
    ]
  },
  "ae": {
    competitors: [
      {
        url: "https://example.ae/article1",
        title: "أفضل استراتيجيات تحسين محركات البحث",
        wordCount: 1100,
        headingsCount: 7,
        paragraphsCount: 14,
        imagesCount: 5
      },
      {
        url: "https://example.ae/article2",
        title: "دليل شامل لتحسين محركات البحث",
        wordCount: 1900,
        headingsCount: 11,
        paragraphsCount: 20,
        imagesCount: 8
      },
      {
        url: "https://example.ae/article3",
        title: "أفضل ممارسات السيو",
        wordCount: 1600,
        headingsCount: 9,
        paragraphsCount: 16,
        imagesCount: 4
      },
      {
        url: "https://example.ae/article4",
        title: "تحسين محركات البحث للمبتدئين",
        wordCount: 850,
        headingsCount: 5,
        paragraphsCount: 10,
        imagesCount: 3
      },
      {
        url: "https://example.ae/article5",
        title: "تقنيات السيو المتقدمة",
        wordCount: 2800,
        headingsCount: 14,
        paragraphsCount: 26,
        imagesCount: 10
      }
    ]
  },
  "sa": {
    competitors: [
      {
        url: "https://example.sa/article1",
        title: "استراتيجيات السيو للعام 2023",
        wordCount: 1300,
        headingsCount: 8,
        paragraphsCount: 16,
        imagesCount: 6
      },
      {
        url: "https://example.sa/article2",
        title: "دليل تحسين محركات البحث",
        wordCount: 2000,
        headingsCount: 12,
        paragraphsCount: 21,
        imagesCount: 9
      },
      {
        url: "https://example.sa/article3",
        title: "أساسيات السيو الناجح",
        wordCount: 1700,
        headingsCount: 9,
        paragraphsCount: 17,
        imagesCount: 5
      },
      {
        url: "https://example.sa/article4",
        title: "السيو للشركات الصغيرة",
        wordCount: 900,
        headingsCount: 6,
        paragraphsCount: 11,
        imagesCount: 3
      },
      {
        url: "https://example.sa/article5",
        title: "تقنيات متقدمة في تحسين محركات البحث",
        wordCount: 3000,
        headingsCount: 15,
        paragraphsCount: 27,
        imagesCount: 11
      }
    ]
  }
};

// Function to calculate analysis from competitor data
function calculateCompetitorAnalysis(competitors) {
  // Calculate averages
  const totalWordCount = competitors.reduce((sum, comp) => sum + comp.wordCount, 0);
  const totalHeadingsCount = competitors.reduce((sum, comp) => sum + comp.headingsCount, 0);
  const totalParagraphsCount = competitors.reduce((sum, comp) => sum + comp.paragraphsCount, 0);
  const totalImagesCount = competitors.reduce((sum, comp) => sum + comp.imagesCount, 0);
  
  const avgWordCount = Math.round(totalWordCount / competitors.length);
  const avgHeadingsCount = Math.round(totalHeadingsCount / competitors.length);
  const avgParagraphsCount = Math.round(totalParagraphsCount / competitors.length);
  const avgImagesCount = Math.round(totalImagesCount / competitors.length);
  
  // Calculate min/max ranges (typically 80%-120% of average)
  const wordCountMin = Math.round(avgWordCount * 0.8);
  const wordCountMax = Math.round(avgWordCount * 1.2);
  
  const headingsCountMin = Math.max(1, Math.round(avgHeadingsCount * 0.8));
  const headingsCountMax = Math.round(avgHeadingsCount * 1.2);
  
  const paragraphsCountMin = Math.max(1, Math.round(avgParagraphsCount * 0.8));
  const paragraphsCountMax = Math.round(avgParagraphsCount * 1.2);
  
  const imagesCountMin = Math.max(1, Math.round(avgImagesCount * 0.8));
  const imagesCountMax = Math.round(avgImagesCount * 1.2);
  
  return {
    wordCount: {
      min: wordCountMin,
      max: wordCountMax,
      avg: avgWordCount
    },
    headingsCount: {
      min: headingsCountMin,
      max: headingsCountMax,
      avg: avgHeadingsCount
    },
    paragraphsCount: {
      min: paragraphsCountMin,
      max: paragraphsCountMax,
      avg: avgParagraphsCount
    },
    imagesCount: {
      min: imagesCountMin,
      max: imagesCountMax,
      avg: avgImagesCount
    },
    competitors: competitors.map(comp => ({
      url: comp.url,
      title: comp.title,
      stats: {
        wordCount: comp.wordCount,
        headingsCount: comp.headingsCount,
        paragraphsCount: comp.paragraphsCount,
        imagesCount: comp.imagesCount
      }
    }))
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const { keyword, country, userId, workspaceId } = await req.json();
    
    console.log(`Analyzing competitors for keyword: "${keyword}" in country: ${country}`);
    
    // Validate required parameters
    if (!keyword) {
      throw new Error('Keyword is required');
    }
    
    // Use a default country if not provided
    const targetCountry = country || 'us';
    
    // In a production environment, we would fetch real data from a SERP API here
    // For now, we're using mock data
    
    // Get the mock data for the specified country (or default to US)
    const countryData = mockCompetitorData[targetCountry] || mockCompetitorData['us'];
    
    // Calculate analysis based on competitors
    const analysis = calculateCompetitorAnalysis(countryData.competitors);
    
    // Log activity to database if userId and workspaceId are provided
    if (userId && workspaceId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('api_usage').insert({
        user_id: userId,
        workspace_id: workspaceId,
        api_type: 'serp_analysis',
        operation_type: 'competitor_analysis',
        usage_amount: 1,
        credits_consumed: 2 // Assume this operation costs 2 credits
      });
    }
    
    // Return the analysis
    return new Response(JSON.stringify({
      success: true,
      keyword,
      country: targetCountry,
      analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in analyze-competitors function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
