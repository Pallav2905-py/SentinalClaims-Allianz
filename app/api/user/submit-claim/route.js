import { NextResponse } from 'next/server';
import { parseFormData } from '@/lib/upload-helper';
import ClaimModel from '@/lib/mongodb-claims';
import { auth } from '@/lib/auth';
import { runNemoClaimWorkflow } from '@/lib/nemo-agents-service';

export const runtime = 'nodejs';

/**
 * POST /api/user/submit-claim
 * Submit a new insurance claim with files
 */
export async function POST(request) {
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

    // Parse multipart form data with files
    const { fields, files } = await parseFormData(request);

    // Validate required fields
    if (!fields.textDescription || fields.textDescription.trim().length < 10) {
      return NextResponse.json(
        { error: 'Claim description must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Extract file information
    const audioFile = files.find(f => ['.mp3', '.wav', '.m4a'].some(ext => f.filename.endsWith(ext)));
    const audioPath = audioFile ? audioFile.path : null;

    // Create initial claim record with full file info
    const initialClaim = await ClaimModel.create({
      userId: session.user.id,
      textDescription: fields.textDescription,
      audioPath: audioPath,
      uploadedFiles: files,
      status: 'processing',
    });

    // Process claim in background (async)
    processClaimAsync(initialClaim._id.toString(), fields.textDescription, files);

    return NextResponse.json(
      {
        success: true,
        message: 'Claim submitted successfully. Nemo multi-agent workflow is now processing your claim.',
        claimId: initialClaim._id.toString(),
        status: 'processing',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error submitting claim:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit claim' },
      { status: 500 }
    );
  }
}

/**
 * Process claim asynchronously
 */
async function processClaimAsync(claimId, description, files) {
  try {
    console.log(`Processing claim ${claimId}...`);

    // Full multi-agent orchestration (planner, cyber, coverage, weather, fraud, payout, audit)
    const nemoResult = await runNemoClaimWorkflow({
      claimId,
      description,
      files,
    });

    await ClaimModel.updateFraudAnalysis(claimId, {
      ...nemoResult.fraudBundle,
      agentWorkflow: nemoResult.agentWorkflow,
      payoutDecision: nemoResult.payoutDecision,
      auditSummary: nemoResult.auditSummary,
      processingSummary: nemoResult.processingSummary,
    });

    // Update status to pending (ready for admin review)
    await ClaimModel.updateStatus(claimId, 'pending');

    console.log(`Claim ${claimId} processed successfully`);
  } catch (error) {
    console.error(`Error processing claim ${claimId}:`, error);
    
    // Update claim with error status
    try {
      await ClaimModel.updateStatus(claimId, 'error');
      await ClaimModel.updateFraudAnalysis(claimId, {
        extractedFeatures: null,
        fraudScore: null,
        riskLevel: null,
        aiExplanation: `Processing failed: ${error.message}`,
        processingSummary: {
          finalStatus: 'error',
          humanDecision: 'manual-review',
          pipelineVersion: 'nemo-v1',
        },
      });
    } catch (updateError) {
      console.error('Failed to update claim with error status:', updateError);
    }
  }
}

/**
 * GET /api/user/submit-claim
 * Get user's claims
 */
export async function GET(request) {
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

    // Get user's claims
    const claims = await ClaimModel.findByUserId(session.user.id);

    return NextResponse.json({
      success: true,
      claims: claims.map(claim => ({
        _id: claim._id.toString(),
        textDescription: claim.textDescription,
        audioPath: claim.audioPath,
        status: claim.status,
        uploadedFiles: claim.uploadedFiles || [],
        fraudAnalysis: claim.fraudAnalysis,
        agentWorkflow: claim.agentWorkflow || null,
        payoutDecision: claim.payoutDecision || null,
        auditSummary: claim.auditSummary || null,
        processingSummary: claim.processingSummary || null,
        reviewNotes: claim.reviewNotes,
        reviewedAt: claim.reviewedAt,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      })),
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}
