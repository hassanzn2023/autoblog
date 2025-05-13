import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to detect RTL text
export function isRTLText(text: string): boolean {
  const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(text);
}

// Helper function to get appropriate font class based on text direction
export function getFontClass(text: string): string {
  return isRTLText(text) ? 'font-arabic' : 'font-english';
}

// Helper function to get appropriate text direction
export function getTextDirection(text: string): 'rtl' | 'ltr' {
  return isRTLText(text) ? 'rtl' : 'ltr';
}

// Function to clean HTML content for accurate word counting
export function cleanHtmlContent(html: string): string {
  // Remove HTML tags but keep their text content
  return html.replace(/<[^>]+>/g, ' ')
             .replace(/\s+/g, ' ')
             .trim();
}

// Function to extract headings from HTML content
export function extractHeadings(html: string): string[] {
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  const matches = html.match(headingRegex) || [];
  
  // Extract just the content from heading tags
  return matches.map(match => {
    const contentRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/i;
    const contentMatch = match.match(contentRegex);
    return contentMatch ? contentMatch[1].replace(/<[^>]+>/g, '') : '';
  });
}
