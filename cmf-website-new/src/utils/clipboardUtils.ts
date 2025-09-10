/**
 * Simple clipboard utilities for paste functionality
 */

/**
 * Read text from clipboard using the modern Clipboard API with fallback
 */
export async function readClipboard(): Promise<string | null> {
  try {
    // Modern Clipboard API (requires HTTPS)
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      return text;
    }
    
    // Fallback for older browsers - return null to indicate manual paste needed
    return null;
  } catch (error) {
    console.warn('Could not read from clipboard:', error);
    return null;
  }
}

/**
 * Basic text cleanup for pasted content
 * Removes HTML tags, excessive whitespace, and common email artifacts
 */
export function cleanPastedText(text: string): string {
  if (!text) return '';
  
  let cleaned = text;
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  
  // Remove email headers (From:, To:, Subject:, etc.)
  cleaned = cleaned.replace(/^(?:From|To|Subject|Date|Sent|CC|BCC)\s*:.*$/gm, '');
  
  // Remove email signatures (basic cleanup)
  cleaned = cleaned.replace(/(?:Best regards?|Sincerely|Thanks?|Cheers),?\s*\n.*$/gms, '');
  cleaned = cleaned.replace(/--+\s*\n.*$/gms, '');
  
  // Remove quoted text (> at start of line)
  cleaned = cleaned.replace(/^>\s*.*$/gm, '');
  
  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Max 2 line breaks
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Check if clipboard reading is supported
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard && navigator.clipboard.readText);
}

/**
 * Paste from clipboard into a textarea with optional cleanup
 */
export async function pasteIntoTextarea(
  textareaElement: HTMLTextAreaElement,
  cleanup: boolean = true
): Promise<boolean> {
  try {
    const text = await readClipboard();
    
    if (text) {
      const cleanedText = cleanup ? cleanPastedText(text) : text;
      
      // Insert at current cursor position or replace selection
      const start = textareaElement.selectionStart;
      const end = textareaElement.selectionEnd;
      const currentValue = textareaElement.value;
      
      const newValue = currentValue.substring(0, start) + cleanedText + currentValue.substring(end);
      textareaElement.value = newValue;
      
      // Move cursor to end of pasted content
      const newCursorPos = start + cleanedText.length;
      textareaElement.setSelectionRange(newCursorPos, newCursorPos);
      
      // Trigger change event
      const changeEvent = new Event('input', { bubbles: true });
      textareaElement.dispatchEvent(changeEvent);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error pasting from clipboard:', error);
    return false;
  }
}