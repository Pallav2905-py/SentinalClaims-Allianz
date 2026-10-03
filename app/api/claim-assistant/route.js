import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { extractClaimInfo, generateFollowUpQuestion } from '@/lib/gemini-service';

/**
 * POST /api/claim-assistant
 * AI-powered claim information extraction and guidance
 */
export async function POST(request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory, claimData, policyContext } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Extract claim information from user message
    const extractionResult = await extractClaimInfo(
      message,
      conversationHistory || [],
      policyContext || {}
    );

    // Merge with existing claim data
    const updatedClaimData = {
      ...claimData,
      ...Object.fromEntries(
        Object.entries(extractionResult.extractedData || {}).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      ),
    };

    // Determine next question
    const nextQuestion = await generateFollowUpQuestion(updatedClaimData, policyContext || {});

    // Generate response message
    let responseMessage = '';
    if (nextQuestion) {
      responseMessage = nextQuestion.question;
    } else {
      responseMessage = 'Thank you! I have all the information I need. Please review your claim details and upload any supporting documents.';
    }

    return NextResponse.json({
      success: true,
      response: responseMessage,
      claimData: updatedClaimData,
      nextQuestion: nextQuestion,
      extractedInfo: extractionResult.extractedData,
      confidence: extractionResult.confidence || 0.8,
    });
  } catch (error) {
    console.error('Claim assistant error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
