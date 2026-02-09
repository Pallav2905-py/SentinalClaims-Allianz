import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in environment variables');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Extract structured features from claim narrative
 * Returns strict JSON with required fraud detection features
 */
export async function extractFeaturesFromClaim(claimDescription, fileCount = 0, pdfText = '') {
  const pdfSection = pdfText ? `\n\nExtracted PDF Documents:\n${pdfText}` : '';
  
  const prompt = `You are a fraud detection feature extractor. Analyze this insurance claim and extract ONLY the following features as valid JSON.

Claim Description:
${claimDescription}

Files Attached: ${fileCount}${pdfSection}

Extract these exact fields (use reasonable estimates if not explicitly stated):

{
  "age": <integer - claimant age, estimate from context if not stated>,
  "total_claims_1y": <integer - number of claims in past year, default 1>,
  "avg_claim_amount": <float - average claim amount, estimate based on description>,
  "days_since_last_claim": <integer - days since last claim, default 365>,
  "claimed_amount": <float - amount claimed in this incident>,
  "policy_limit": <float - estimated policy limit>,
  "amount_vs_avg_ratio": <float - claimed_amount / avg_claim_amount>,
  "amount_vs_policy_ratio": <float - claimed_amount / policy_limit>,
  "report_delay_hours": <integer - hours between incident and report, default 24>,
  "time_since_policy_start": <integer - days since policy started, default 365>,
  "geo_risk_score": <float 0-1 - geographic risk, default 0.5>,
  "missing_docs_count": <integer - number of missing documents>,
  "duplicate_doc_flag": <integer 0 or 1 - duplicate document detected>,
  "doc_tamper_score": <float 0-1 - document tampering likelihood>,
  "previous_rejections": <integer - number of previous rejected claims, default 0>,
  "fraud_history_flag": <integer 0 or 1 - fraud history indicator>
}

Return ONLY valid JSON. No explanations, no markdown, just the JSON object.`;

  try {
    let fullResponse = '';
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_completion_tokens: 2048,
      top_p: 0.9,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
    }

    // Clean the response to extract JSON
    let jsonText = fullResponse.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Try to find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const features = JSON.parse(jsonText);
    
    // Validate required fields
    const requiredFields = [
      'age', 'total_claims_1y', 'avg_claim_amount', 'days_since_last_claim',
      'claimed_amount', 'policy_limit', 'amount_vs_avg_ratio', 'amount_vs_policy_ratio',
      'report_delay_hours', 'time_since_policy_start', 'geo_risk_score',
      'missing_docs_count', 'duplicate_doc_flag', 'doc_tamper_score',
      'previous_rejections', 'fraud_history_flag'
    ];

    for (const field of requiredFields) {
      if (!(field in features)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return features;
  } catch (error) {
    console.error('Error extracting features:', error);
    throw new Error('Failed to extract features from claim: ' + error.message);
  }
}

/**
 * Generate AI explanation for fraud detection result
 */
export async function generateFraudExplanation(claimDescription, extractedFeatures, fraudResult, pdfText = '') {
  const pdfSection = pdfText ? `\n\nExtracted PDF Documents:\n${pdfText}` : '';
  
  const prompt = `You are an insurance fraud analyst. Provide a clear explanation of this fraud detection result.

Claim Description:
${claimDescription}${pdfSection}

Extracted Features:
${JSON.stringify(extractedFeatures, null, 2)}

Fraud Detection Result:
- Fraud Probability: ${fraudResult.fraud_probability}
- Risk Level: ${fraudResult.risk_level}

Generate a response with these sections:

1. SUMMARY (2-3 sentences about the claim)
2. RED FLAGS (list specific concerning elements, if any)
3.LAGGING INDICATORS (list any signs that suggest potential fraud, even if not definitive)
4.LEADING INDICATORS (list any signs that suggest the claim is likely legitimate)
5. ANALYSIS (detailed explanation of the fraud score)
6. RECOMMENDATION (approve, review manually, or reject)

Be professional and factual. Focus on the data patterns.`;

  try {
    let fullResponse = '';
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
    }

    return fullResponse.trim();
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw new Error('Failed to generate fraud explanation: ' + error.message);
  }
}
/**
 * Analyze insurance policy document and extract key information
 */
export async function analyzePolicyDocument(policyText, policyNumber = '') {
  const prompt = `You are an insurance policy analyst. Analyze this insurance policy document and extract key information in a structured JSON format.

Policy Number: ${policyNumber || 'Not specified'}

Policy Document:
${policyText}

Extract the following information as valid JSON:

{
  "summary": "<2-3 sentence summary of the policy>",
  "policyType": "<type of insurance: auto, home, health, life, etc.>",
  "coverageDetails": {
    "mainCoverage": "<primary coverage description>",
    "additionalCoverage": ["<list of additional coverages>"],
    "coverageAmount": "<maximum coverage amount if specified>"
  },
  "limits": {
    "perIncident": "<limit per incident>",
    "annual": "<annual limit>", 
    "lifetime": "<lifetime limit if applicable>"
  },
  "exclusions": ["<list of what is not covered>"],
  "keyTerms": [
    {"term": "<important term>", "definition": "<definition>"}
  ],
  "premiumInfo": {
    "amount": "<premium amount if specified>",
    "frequency": "<payment frequency>"
  },
  "validityPeriod": {
    "startDate": "<start date if specified>",
    "endDate": "<end date if specified>"
  }
}

Return ONLY valid JSON. No explanations, no markdown, just the JSON object.`;

  try {
    let fullResponse = '';
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_completion_tokens: 4096,
      top_p: 0.9,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
    }

    // Clean the response to extract JSON
    let jsonText = fullResponse.trim();
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error analyzing policy:', error);
    throw new Error('Failed to analyze policy document: ' + error.message);
  }
}

/**
 * Answer questions about a policy using the policy context
 */
export async function answerPolicyQuestion(question, policyContext, chatHistory = []) {
  const historyText = chatHistory.length > 0
    ? '\n\nPrevious conversation:\n' + chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')
    : '';

  const prompt = `You are an insurance policy assistant. Answer questions about the insurance policy based on the provided policy information.

Policy Information:
${JSON.stringify(policyContext, null, 2)}
${historyText}

User Question: ${question}

Provide a clear, accurate answer based ONLY on the policy information provided. If the information is not in the policy, say so. Be professional and helpful.

Guidelines:
- Be specific and reference policy details
- Use plain language, avoid jargon when possible
- If relevant, mention coverage limits or exclusions
- Keep responses concise but complete
- If asked about claims, reference the policy terms that apply`;

  try {
    let fullResponse = '';
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
    }

    return fullResponse.trim();
  } catch (error) {
    console.error('Error answering policy question:', error);
    throw new Error('Failed to answer policy question: ' + error.message);
  }
}