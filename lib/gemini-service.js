/**
 * Gemini AI Service for Claim Assistant
 * Uses free-tier Gemini API for claim extraction and analysis
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY; // Fallback to GROQ if no Gemini key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Extract claim information from user message
 */
export async function extractClaimInfo(userMessage, conversationHistory = [], policyContext = {}) {
  try {
    const prompt = `You are an insurance claim assistant. Extract structured information from the user's claim description.

Policy Context:
- Insurance Type: ${policyContext.insuranceType || 'unknown'}
- Policy Number: ${policyContext.policyNumber || 'unknown'}

User Message: "${userMessage}"

Previous Conversation:
${conversationHistory.map((m, i) => `${i + 1}. ${m.role}: ${m.content}`).join('\n')}

Extract and return ONLY valid JSON with this structure:
{
  "extractedData": {
    "incidentType": "",
    "incidentDate": "",
    "incidentTime": "",
    "location": "",
    "description": "",
    "damageType": [],
    "injuries": false,
    "otherPartyInvolved": false,
    "policeReport": false,
    "estimatedAmount": null
  },
  "missingFields": [],
  "nextQuestion": {
    "field": "",
    "question": "",
    "inputType": "text|date|time|boolean|single-select|multi-select|currency",
    "options": []
  },
  "confidence": 0.0
}

Rules:
1. Only extract information explicitly stated by the user
2. Mark fields as null if not mentioned
3. Suggest ONE most important missing field for nextQuestion
4. Keep questions simple and conversational
5. Return ONLY the JSON, no other text`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/{[\s\S]*}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error('Gemini extraction error:', error);
    
    // Fallback: deterministic extraction
    return deterministicExtractClaimInfo(userMessage, policyContext);
  }
}

/**
 * Fallback deterministic extraction (no AI)
 */
function deterministicExtractClaimInfo(userMessage, policyContext) {
  const lowerMessage = userMessage.toLowerCase();
  
  const extractedData = {
    description: userMessage,
    injuries: lowerMessage.includes('injured') || lowerMessage.includes('hurt'),
    otherPartyInvolved: lowerMessage.includes('other vehicle') || lowerMessage.includes('another car'),
    policeReport: lowerMessage.includes('police') || lowerMessage.includes('fir') || lowerMessage.includes('report'),
  };

  // Determine next question based on policy type
  let nextQuestion = {
    field: 'incidentDate',
    question: 'When did this incident occur?',
    inputType: 'date',
    options: [],
  };

  if (policyContext.insuranceType === 'motor') {
    if (!lowerMessage.includes('accident') && !lowerMessage.includes('damage')) {
      nextQuestion = {
        field: 'incidentType',
        question: 'Was this an accident, theft, or damage?',
        inputType: 'single-select',
        options: ['Accident', 'Theft', 'Damage'],
      };
    }
  }

  return {
    extractedData,
    missingFields: ['incidentDate', 'location', 'estimatedAmount'],
    nextQuestion,
    confidence: 0.5,
  };
}

/**
 * Generate follow-up question based on context
 */
export async function generateFollowUpQuestion(claimData, policyContext) {
  // Deterministic logic for follow-up questions
  const missing = [];
  
  if (!claimData.incidentDate) missing.push('incidentDate');
  if (!claimData.location) missing.push('location');
  if (!claimData.description || claimData.description.length < 20) missing.push('description');
  if (claimData.estimatedAmount === null || claimData.estimatedAmount === undefined) missing.push('estimatedAmount');
  
  // Policy-specific questions
  if (policyContext.insuranceType === 'motor') {
    if (claimData.injuries === undefined) missing.push('injuries');
    if (claimData.otherPartyInvolved === undefined) missing.push('otherPartyInvolved');
  }
  
  if (missing.length === 0) {
    return null; // All information collected
  }
  
  const field = missing[0];
  const questions = {
    incidentDate: {
      field: 'incidentDate',
      question: 'When did this happen?',
      inputType: 'date',
    },
    location: {
      field: 'location',
      question: 'Where did this incident occur?',
      inputType: 'text',
    },
    description: {
      field: 'description',
      question: 'Please describe what happened in more detail',
      inputType: 'textarea',
    },
    estimatedAmount: {
      field: 'estimatedAmount',
      question: 'What is the approximate damage/claim amount?',
      inputType: 'currency',
    },
    injuries: {
      field: 'injuries',
      question: 'Was anyone injured?',
      inputType: 'boolean',
    },
    otherPartyInvolved: {
      field: 'otherPartyInvolved',
      question: 'Was another vehicle or party involved?',
      inputType: 'boolean',
    },
  };
  
  return questions[field] || null;
}

/**
 * Validate if claim is ready for submission
 */
export function validateClaimData(claimData, policyContext) {
  const required = ['description', 'incidentDate'];
  
  const missing = required.filter(field => !claimData[field]);
  
  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
}
