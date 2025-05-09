
import mammoth from 'mammoth';

/**
 * Parse a Word document file and extract its content as HTML
 */
export async function parseWordDocument(file: File): Promise<{html: string, text: string}> {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Use mammoth to convert Word document to HTML
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    // Get the HTML and text content
    const html = result.value;
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Return both HTML and text content
    return {
      html,
      text
    };
  } catch (error) {
    console.error("Error parsing Word document:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to parse Word document");
  }
}

/**
 * Extract images from a Word document
 * This feature requires additional handling with mammoth's options
 */
export async function extractImagesFromWordDocument(file: File): Promise<{[key: string]: string}> {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Map to store image data URLs
    const imageMap: {[key: string]: string} = {};
    
    // Use mammoth's image handling API correctly
    const options = {
      arrayBuffer: arrayBuffer,
      convertImage: mammoth.images.imgElement((image: any) => {
        return image.read().then((imageBuffer: ArrayBuffer) => {
          // Convert image buffer to base64
          const base64 = arrayBufferToBase64(imageBuffer);
          const mimeType = image.contentType || 'image/jpeg';
          const dataUri = `data:${mimeType};base64,${base64}`;
          
          // Store in the map
          const imageId = `image-${Object.keys(imageMap).length + 1}`;
          imageMap[imageId] = dataUri;
          
          // Return attributes for the img element
          return {
            src: dataUri,
            alt: `Image from document (${imageId})`
          };
        });
      })
    };
    
    // Convert the document with image handling
    await mammoth.convertToHtml(options);
    
    return imageMap;
  } catch (error) {
    console.error("Error extracting images from Word document:", error);
    return {};
  }
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}
