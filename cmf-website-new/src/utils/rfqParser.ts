/**
 * RFQ Parser - Intelligent text parsing for RFQ emails and project descriptions
 * Designed to achieve 90% auto-fill accuracy from pasted RFQ content
 */

export interface ParsedRFQData {
  // Contact information
  contact?: {
    email?: string;
    phone?: string;
    name?: string;
    company?: string;
  };
  
  // Project details
  project?: {
    projectName?: string;
    description?: string;
    quantity?: number;
    material?: string;
    thickness?: string;
    requiredDate?: string;
    budget?: string;
  };
  
  // Additional context
  metadata?: {
    hasAttachments?: boolean;
    urgentIndicators?: string[];
    confidence?: number; // 0-1 scale
  };
}

export interface ParsedSummary {
  found: Array<{
    field: string;
    value: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
  missing: string[];
  text: string;
  cleanedText: string;
}

// Common RFQ patterns and regex expressions
const PATTERNS = {
  // Contact information
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  phone: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})(?:\s?(?:ext|x|extension)\.?\s?(\d+))?/gi,
  name: /(?:from\s*:?\s*|name\s*:?\s*|contact\s*:?\s*|regards?\s*,?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  company: /(?:company\s*:?\s*|organization\s*:?\s*|firm\s*:?\s*)([A-Z][A-Za-z0-9\s&.,'-]+)/gi,
  
  // Quantities and measurements
  quantity: /(?:quantity\s*:?\s*|qty\s*:?\s*|need\s+|require\s+|order\s+)(\d+(?:[,\s]\d+)*)\s*(?:units?|pieces?|pcs?|parts?|items?)?/gi,
  material: /(?:material\s*:?\s*|steel|aluminum|stainless|copper|brass|titanium|carbon|alloy)(?:\s+steel|\s+aluminum)?/gi,
  thickness: /(?:thickness\s*:?\s*|thick\s*:?\s*|gauge\s*:?\s*|(\d+(?:\.\d+)?)\s*(?:mm|inch|"|in|gauge|ga))/gi,
  
  // Dates and deadlines
  date: /(?:by\s+|due\s+|need\s+by\s+|deadline\s*:?\s*|required\s+by\s+)(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})/gi,
  urgency: /(?:urgent|asap|rush|emergency|immediate|priority|critical)/gi,
  
  // Budget indicators
  budget: /(?:budget\s*:?\s*|cost\s*:?\s*|\$)(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|thousand|million)?/gi,
  
  // Project types
  projectType: /(?:prototype|batch|production|custom|repair|modification|fabrication|cutting|bending|welding)/gi,
  
  // Attachments
  attachments: /(?:attached|attachment|file|drawing|cad|pdf|dwg|step|iges)/gi,
};

// Material standardization mapping
const MATERIAL_MAPPING: Record<string, string> = {
  'steel': 'steel',
  'carbon steel': 'steel',
  'mild steel': 'steel',
  'stainless': 'stainless-steel',
  'stainless steel': 'stainless-steel',
  'ss': 'stainless-steel',
  'aluminum': 'aluminum',
  'aluminium': 'aluminum',
  'al': 'aluminum',
  'copper': 'copper',
  'cu': 'copper',
  'brass': 'brass',
  'titanium': 'titanium',
  'ti': 'titanium',
};

// Project type mapping
const PROJECT_TYPE_MAPPING: Record<string, string> = {
  'prototype': 'prototype',
  'prototyping': 'prototype',
  'batch': 'small-batch',
  'small batch': 'small-batch',
  'production': 'large-production',
  'mass production': 'large-production',
  'custom': 'custom-fabrication',
  'fabrication': 'custom-fabrication',
  'repair': 'repair-modification',
  'modification': 'repair-modification',
};

/**
 * Clean text by removing email signatures, headers, and HTML
 */
export function cleanText(text: string): string {
  let cleaned = text;
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');
  
  // Remove email headers (From:, To:, Subject:, etc.)
  cleaned = cleaned.replace(/^(?:From|To|Subject|Date|Sent|CC|BCC)\s*:.*$/gm, '');
  
  // Remove email signatures (common patterns)
  cleaned = cleaned.replace(/(?:Best regards?|Sincerely|Thanks?|Cheers),?\s*\n.*$/gms, '');
  cleaned = cleaned.replace(/--+\s*\n.*$/gms, '');
  cleaned = cleaned.replace(/\n\s*\n.*?(?:phone|email|mobile).*$/gms, '');
  
  // Remove quoted text (> or | at start of line)
  cleaned = cleaned.replace(/^[>|]\s*.*$/gm, '');
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

/**
 * Extract specific field values from text
 */
function extractField(text: string, pattern: RegExp, processor?: (match: string) => string): string[] {
  const matches: string[] = [];
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    let value = match[1] || match[0];
    if (processor) {
      value = processor(value);
    }
    matches.push(value.trim());
  }
  
  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Extract contact information from text
 */
function extractContactInfo(text: string): ParsedRFQData['contact'] {
  const contact: ParsedRFQData['contact'] = {};
  
  // Extract email
  const emails = extractField(text, PATTERNS.email);
  if (emails.length > 0) {
    // Prefer non-noreply emails
    contact.email = emails.find(e => !e.includes('noreply')) || emails[0];
  }
  
  // Extract phone
  const phones = extractField(text, PATTERNS.phone);
  if (phones.length > 0) {
    contact.phone = phones[0];
  }
  
  // Extract name (more sophisticated approach)
  const nameMatches = text.match(/(?:from\s*:?\s*|name\s*:?\s*|contact\s*:?\s*|regards?\s*,?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi);
  if (nameMatches) {
    const name = nameMatches[0].replace(/(?:from|name|contact|regards?)[:\s,]*/gi, '').trim();
    if (name.length > 1 && name.length < 50) {
      contact.name = name;
    }
  }
  
  // Extract company
  const companies = extractField(text, PATTERNS.company);
  if (companies.length > 0) {
    contact.company = companies[0];
  }
  
  return Object.keys(contact).length > 0 ? contact : undefined;
}

/**
 * Extract project details from text
 */
function extractProjectInfo(text: string): ParsedRFQData['project'] {
  const project: ParsedRFQData['project'] = {};
  
  // Extract quantity
  const quantities = extractField(text, PATTERNS.quantity, (match) => {
    return match.replace(/[,\s]/g, '');
  });
  if (quantities.length > 0) {
    const qty = parseInt(quantities[0], 10);
    if (!isNaN(qty) && qty > 0 && qty < 1000000) {
      project.quantity = qty;
    }
  }
  
  // Extract material
  const materialMatches = text.match(PATTERNS.material);
  if (materialMatches) {
    const rawMaterial = materialMatches[0].toLowerCase().trim();
    for (const [key, value] of Object.entries(MATERIAL_MAPPING)) {
      if (rawMaterial.includes(key)) {
        project.material = value;
        break;
      }
    }
  }
  
  // Extract thickness
  const thicknesses = extractField(text, PATTERNS.thickness);
  if (thicknesses.length > 0) {
    project.thickness = thicknesses[0];
  }
  
  // Extract dates
  const dates = extractField(text, PATTERNS.date);
  if (dates.length > 0) {
    try {
      const parsedDate = new Date(dates[0]);
      if (!isNaN(parsedDate.getTime()) && parsedDate > new Date()) {
        project.requiredDate = parsedDate.toISOString().split('T')[0];
      }
    } catch (e) {
      // Ignore invalid dates
    }
  }
  
  // Extract budget
  const budgets = extractField(text, PATTERNS.budget);
  if (budgets.length > 0) {
    const amount = parseFloat(budgets[0].replace(/[,$]/g, ''));
    if (!isNaN(amount)) {
      if (amount < 1000) project.budget = 'under-1k';
      else if (amount < 5000) project.budget = '1k-5k';
      else if (amount < 10000) project.budget = '5k-10k';
      else if (amount < 25000) project.budget = '10k-25k';
      else if (amount < 50000) project.budget = '25k-50k';
      else if (amount < 100000) project.budget = '50k-100k';
      else project.budget = 'over-100k';
    }
  }
  
  // Extract project type
  const projectTypes = extractField(text, PATTERNS.projectType);
  if (projectTypes.length > 0) {
    const rawType = projectTypes[0].toLowerCase();
    for (const [key, value] of Object.entries(PROJECT_TYPE_MAPPING)) {
      if (rawType.includes(key)) {
        project.projectType = value;
        break;
      }
    }
  }
  
  // Generate project name if not found
  if (!project.projectName && project.material) {
    const materialName = project.material.replace('-', ' ');
    const typeName = project.projectType || 'fabrication';
    project.projectName = `Custom ${materialName} ${typeName}`.replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Use cleaned text as description if nothing else found
  if (!project.description && text.length > 20) {
    // Take first meaningful sentence as description
    const sentences = text.split(/[.!?]+/);
    const meaningfulSentence = sentences.find(s => 
      s.trim().length > 20 && 
      !s.includes('@') && 
      !s.match(/^(from|to|subject|date):/i)
    );
    if (meaningfulSentence) {
      project.description = meaningfulSentence.trim();
    }
  }
  
  return Object.keys(project).length > 0 ? project : undefined;
}

/**
 * Extract metadata about the RFQ
 */
function extractMetadata(text: string): ParsedRFQData['metadata'] {
  const metadata: ParsedRFQData['metadata'] = {};
  
  // Check for attachments
  metadata.hasAttachments = PATTERNS.attachments.test(text);
  
  // Check for urgency indicators
  const urgencyMatches = text.match(PATTERNS.urgency);
  if (urgencyMatches) {
    metadata.urgentIndicators = [...new Set(urgencyMatches.map(m => m.toLowerCase()))];
  }
  
  // Calculate confidence based on amount of data extracted
  let confidenceScore = 0;
  if (PATTERNS.email.test(text)) confidenceScore += 0.2;
  if (PATTERNS.quantity.test(text)) confidenceScore += 0.2;
  if (PATTERNS.material.test(text)) confidenceScore += 0.2;
  if (PATTERNS.date.test(text)) confidenceScore += 0.15;
  if (text.length > 50) confidenceScore += 0.15;
  if (PATTERNS.phone.test(text)) confidenceScore += 0.1;
  
  metadata.confidence = Math.min(1, confidenceScore);
  
  return metadata;
}

/**
 * Main parser function - processes RFQ text and returns structured data
 */
export function parseRFQText(rawText: string): ParsedRFQData {
  if (!rawText || rawText.trim().length === 0) {
    return {};
  }
  
  const cleanedText = cleanText(rawText);
  
  const result: ParsedRFQData = {
    contact: extractContactInfo(cleanedText),
    project: extractProjectInfo(cleanedText),
    metadata: extractMetadata(cleanedText),
  };
  
  return result;
}

/**
 * Generate a summary of what was parsed vs what's missing
 */
export function generateParseSummary(parsedData: ParsedRFQData, originalText: string): ParsedSummary {
  const found: ParsedSummary['found'] = [];
  const missing: string[] = [];
  
  // Check contact fields
  if (parsedData.contact?.email) {
    found.push({ field: 'Email', value: parsedData.contact.email, confidence: 'high' });
  } else {
    missing.push('Email address');
  }
  
  if (parsedData.contact?.name) {
    found.push({ field: 'Name', value: parsedData.contact.name, confidence: 'medium' });
  } else {
    missing.push('Contact name');
  }
  
  if (parsedData.contact?.company) {
    found.push({ field: 'Company', value: parsedData.contact.company, confidence: 'medium' });
  }
  
  // Check project fields
  if (parsedData.project?.quantity) {
    found.push({ field: 'Quantity', value: parsedData.project.quantity.toString(), confidence: 'high' });
  } else {
    missing.push('Quantity');
  }
  
  if (parsedData.project?.material) {
    found.push({ field: 'Material', value: parsedData.project.material, confidence: 'high' });
  } else {
    missing.push('Material type');
  }
  
  if (parsedData.project?.requiredDate) {
    found.push({ field: 'Required Date', value: parsedData.project.requiredDate, confidence: 'medium' });
  } else {
    missing.push('Required date');
  }
  
  if (parsedData.project?.budget) {
    found.push({ field: 'Budget', value: parsedData.project.budget, confidence: 'low' });
  }
  
  return {
    found,
    missing,
    text: originalText,
    cleanedText: cleanText(originalText),
  };
}

/**
 * Test function to validate parser with sample RFQ data
 */
export function testParser(sampleTexts: string[]): void {
  console.log('Testing RFQ Parser...');
  
  sampleTexts.forEach((text, index) => {
    console.log(`\n--- Sample ${index + 1} ---`);
    console.log('Original:', text.substring(0, 100) + '...');
    
    const parsed = parseRFQText(text);
    const summary = generateParseSummary(parsed, text);
    
    console.log('Parsed:', parsed);
    console.log('Summary:', summary);
    console.log('Confidence:', parsed.metadata?.confidence);
  });
}