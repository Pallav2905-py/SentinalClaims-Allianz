import { NextResponse } from 'next/server';
import PolicyModel from '@/lib/mongodb-policies';
import { answerPolicyQuestion } from '@/lib/groq-service';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * POST /api/policy/[id]/chat
 * Ask questions about a specific policy document
 */
export async function POST(request, { params }) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const policyId = resolvedParams.id;

    // Get the policy document
    const policy = await PolicyModel.findById(policyId);

    if (!policy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    // Verify user owns this policy
    if (policy.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to policy' },
        { status: 403 }
      );
    }

    // Check if policy analysis is complete
    if (policy.status === 'processing') {
      return NextResponse.json(
        { error: 'Policy analysis still in progress. Please wait a moment and try again.' },
        { status: 400 }
      );
    }

    if (policy.status === 'error') {
      return NextResponse.json(
        { error: 'Policy analysis failed. Please re-upload the document.' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { question } = body;

    if (!question || question.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a valid question' },
        { status: 400 }
      );
    }

    // Prepare policy context for AI
    const policyContext = {
      policyNumber: policy.policyNumber,
      policyType: policy.policyType,
      summary: policy.summary,
      coverageDetails: policy.coverageDetails,
      exclusions: policy.exclusions,
      limits: policy.limits,
      keyTerms: policy.keyTerms,
      extractedText: policy.extractedText.substring(0, 4000), // Limit text size
    };

    // Get recent chat history (last 5 messages)
    const recentHistory = (policy.chatHistory || []).slice(-5);

    // Get AI answer
    console.log(`Answering question for policy ${policyId}...`);
    const answer = await answerPolicyQuestion(question, policyContext, recentHistory);

    // Save chat to history
    await PolicyModel.addChatMessage(policyId, {
      role: 'user',
      content: question,
    });

    await PolicyModel.addChatMessage(policyId, {
      role: 'assistant',
      content: answer,
    });

    return NextResponse.json({
      success: true,
      answer,
      question,
    });

  } catch (error) {
    console.error('Error in policy chat:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process question' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/policy/[id]/chat
 * Get chat history for a policy
 */
export async function GET(request, { params }) {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const policyId = resolvedParams.id;

    // Get the policy document
    const policy = await PolicyModel.findById(policyId);

    if (!policy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    // Verify user owns this policy
    if (policy.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to policy' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      chatHistory: policy.chatHistory || [],
      policy: {
        _id: policy._id.toString(),
        policyNumber: policy.policyNumber,
        policyType: policy.policyType,
        fileName: policy.fileName,
        summary: policy.summary,
        status: policy.status,
      },
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
