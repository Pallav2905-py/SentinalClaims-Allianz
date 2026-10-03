import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
// import pdf from 'pdf-parse';
// import { pdfParse } from "pdf-parse";
// import pdfParse from "pdf-parse/lib/pdf-parse.js";


import { readFile } from 'fs/promises';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// async function extractTextFromPDF(filePath) {
//   try {
//     const dataBuffer = await readFile(filePath);
//     // const data = await pdf(dataBuffer);
//     const data = await pdfParse(buffer);

    
//     if (!data.text || data.text.trim().length < 50) {
//       throw new Error('PDF appears to be empty or contains very little text');
//     }
    
//     return data.text;
//   } catch (error) {
//     console.error('PDF extraction error:', error);
//     throw new Error('Failed to extract text from PDF. The file may be scanned or corrupted.');
//   }
// }

export async function POST(request) {
  try {
    const formData = await request.formData();
    const message = formData.get('message');
    const file = formData.get('file');
    const historyJson = formData.get('history');

    let conversationHistory = [];
    if (historyJson) {
      try {
        conversationHistory = JSON.parse(historyJson);
      } catch (e) {
        console.error('Failed to parse conversation history:', e);
      }
    }

    let pdfContent = '';
    let policyInfo = '';

    // Process PDF if attached
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file temporarily
      const uploadsDir = join(process.cwd(), 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const fileName = `policy_${Date.now()}_${file.name}`;
      const filePath = join(uploadsDir, fileName);
      await writeFile(filePath, buffer);

      try {
        pdfContent = await extractTextFromPDF(filePath);
        policyInfo = `Analyzed document: ${file.name}`;
      } catch (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Build the prompt for Groq
    let systemPrompt = `You are an expert insurance policy assistant. You help users understand their insurance policies, answer questions about coverage, claims, premiums, and provide personalized advice.

Your responsibilities:
- Explain policy terms and conditions in simple language
- Answer questions about coverage, exclusions, and benefits
- Help users understand their rights and obligations
- Provide guidance on filing claims
- Offer general insurance advice

Be professional, clear, and helpful. If you don't know something, say so. Keep responses concise but informative.`;

    if (pdfContent) {
      systemPrompt += `\n\nThe user has uploaded a policy document. Here is the content:\n\n${pdfContent.substring(0, 15000)}`; // Limit to avoid token limits
    }

    // Build messages array for Groq
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 5 messages to avoid token limits)
    const recentHistory = conversationHistory.slice(-5);
    messages.push(...recentHistory);

    // Add current message
    if (message) {
      messages.push({ role: 'user', content: message });
    } else if (pdfContent) {
      messages.push({ 
        role: 'user', 
        content: 'I\'ve uploaded a policy document. Please analyze it and provide a summary of the key coverage details, limits, exclusions, and any important terms I should be aware of.' 
      });
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

    return NextResponse.json({
      response,
      policyInfo: policyInfo || undefined,
      success: true
    });

  } catch (error) {
    console.error('Policy chat error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
