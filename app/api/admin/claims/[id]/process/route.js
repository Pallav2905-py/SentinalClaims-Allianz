import { NextResponse } from 'next/server';
import ClaimModel from '@/lib/mongodb-claims';
import { runNemoClaimWorkflow } from '@/lib/nemo-agents-service';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for long-running agent workflow

/**
 * POST /api/admin/claims/[id]/process
 * Process a claim through the AI agent workflow
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;

    // Get user session and check admin role
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Uncomment when role checking is ready
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get the claim
    const claim = await ClaimModel.findById(id);
    
    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Update status to processing
    await ClaimModel.updateStatus(id, 'PROCESSING');

    // Run the complete agent workflow
    const workflowResult = await runNemoClaimWorkflow({
      claimId: id,
      description: claim.textDescription || '',
      files: claim.uploadedFiles || [],
    });

    // Update claim with all agent results
    await ClaimModel.updateFraudAnalysis(id, workflowResult.fraudBundle);

    // Determine final status based on workflow result
    const recommendation = workflowResult.auditSummary?.humanRecommendation;
    let finalStatus = 'AWAITING_REVIEW';
    
    if (recommendation === 'reject' || workflowResult.fraudBundle.riskLevel === 'high') {
      finalStatus = 'AWAITING_REVIEW'; // High risk requires human review
    }

    // Update final status
    await ClaimModel.updateStatus(id, finalStatus);

    // Fetch updated claim
    const updatedClaim = await ClaimModel.findById(id);

    return NextResponse.json({
      success: true,
      claim: {
        _id: updatedClaim._id.toString(),
        status: updatedClaim.status,
        agentWorkflow: workflowResult.agentWorkflow,
        fraudAnalysis: {
          fraudProbability: workflowResult.fraudBundle.fraudScore,
          riskLevel: workflowResult.fraudBundle.riskLevel,
          explanation: workflowResult.fraudBundle.aiExplanation,
          comprehensiveAnalysis: workflowResult.fraudBundle.comprehensiveAnalysis,
        },
        payoutDecision: workflowResult.payoutDecision,
        auditSummary: workflowResult.auditSummary,
        processingSummary: workflowResult.processingSummary,
      },
    });

  } catch (error) {
    console.error('Error processing claim:', error);
    
    // Try to update claim status to error
    try {
      const { id } = await params;
      await ClaimModel.updateStatus(id, 'ERROR');
    } catch (e) {
      console.error('Failed to update error status:', e);
    }

    return NextResponse.json(
      { error: 'Failed to process claim', details: error.message },
      { status: 500 }
    );
  }
}
