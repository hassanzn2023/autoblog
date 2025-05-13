
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detects if text is written in a Right-to-Left script
 * Works with Arabic, Hebrew, Persian, and other RTL languages
 */
export function isRTL(text: string) {
  if (!text) return false;
  
  // Pattern to detect RTL characters from Arabic, Hebrew, Persian, etc.
  const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlChars.test(text);
}

/**
 * Determines the appropriate font class based on text direction
 */
export function getTextDirectionClass(text: string) {
  return isRTL(text) ? 'rtl' : 'ltr';
}

/**
 * Gets the font class based on text content
 */
export function getFontClass(text: string) {
  return isRTL(text) ? 'font-arabic' : 'font-english';
}
