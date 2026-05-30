import { NextResponse } from 'next/server';
import ClaimModel from '@/lib/mongodb-claims';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/admin/claims/[id]
 * Get detailed claim information
 */
export async function GET(request, { params }) {
  try {
    // Get user session and check admin role
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

      const resolvedParams = await params; // ✅ Await the Promise
  const claimId = resolvedParams.id; // ✅ Now we can access properties

    // Get claim
    const claim = await ClaimModel.findById(claimId);

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      claim: {
        _id: claim._id.toString(),
        userId: claim.userId?.toString(),
        textDescription: claim.textDescription || 'No description',
        audioPath: claim.audioPath,
        uploadedFiles: claim.uploadedFiles || claim.filePaths?.map(path => ({ filePath: path })) || [],
        fraudAnalysis: {
          extractedFeatures: claim.extractedFeatures || claim.fraudAnalysis?.extractedFeatures || {},
          fraudProbability: claim.fraudScore ?? claim.fraudAnalysis?.fraudProbability ?? 0,
          riskLevel: claim.riskLevel || claim.fraudAnalysis?.riskLevel || 'unknown',
          explanation: claim.aiExplanation || claim.fraudAnalysis?.explanation || 'Analysis pending'
        },
        agentWorkflow: claim.agentWorkflow || null,
        payoutDecision: claim.payoutDecision || null,
        auditSummary: claim.auditSummary || null,
        processingSummary: claim.processingSummary || null,
        status: claim.status,
        reviewNotes: claim.reviewNotes,
        reviewedAt: claim.reviewedAt,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error fetching claim:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claim' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/claims/[id]
 * Update claim details
 */
export async function PATCH(request, { params }) {
  try {
    // Get user session and check admin role
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
    const claimId = resolvedParams.id;
    const body = await request.json();

    // Update claim status if provided
    if (body.status) {
      const updated = await ClaimModel.updateStatus(
        claimId,
        body.status,
        body.reviewNotes
      );

      if (!updated) {
        return NextResponse.json(
          { error: 'Failed to update claim' },
          { status: 400 }
        );
      }
    }

    // Get updated claim
    const claim = await ClaimModel.findById(claimId);

    return NextResponse.json({
      success: true,
      message: 'Claim updated successfully',
      claim: {
        id: claim._id.toString(),
        status: claim.status,
        reviewNotes: claim.reviewNotes,
        reviewedAt: claim.reviewedAt,
        updatedAt: claim.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/claims/[id]
 * Delete a claim
 */
export async function DELETE(request, { params }) {
  try {
    // Get user session and check admin role
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
    const claimId = resolvedParams.id;

    // Get claim to get file paths
    const claim = await ClaimModel.findById(claimId);

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Delete claim
    const deleted = await ClaimModel.delete(claimId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete claim' },
        { status: 400 }
      );
    }

    // TODO: Optionally delete associated files
    // await deleteUploadedFiles(claim.filePaths);

    return NextResponse.json({
      success: true,
      message: 'Claim deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting claim:', error);
    return NextResponse.json(
      { error: 'Failed to delete claim' },
      { status: 500 }
    );
  }
}
