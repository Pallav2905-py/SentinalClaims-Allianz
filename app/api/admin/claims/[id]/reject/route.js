import { NextResponse } from 'next/server';
import ClaimModel from '@/lib/mongodb-claims';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * POST /api/admin/claims/[id]/reject
 * Reject a claim
 */
export async function POST(request, { params }) {
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

    // TODO: Add admin role check
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const resolvedParams = await params;
    const claimId = resolvedParams.id;
    const body = await request.json();
    const reviewNotes = body.reviewNotes || body.reason || 'Claim rejected';

    // Check if claim exists
    const claim = await ClaimModel.findById(claimId);
    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Update claim status to rejected
    const updated = await ClaimModel.updateStatus(claimId, 'rejected', reviewNotes);

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to reject claim' },
        { status: 400 }
      );
    }

    // Get updated claim
    const updatedClaim = await ClaimModel.findById(claimId);

    return NextResponse.json({
      success: true,
      message: 'Claim rejected successfully',
      claim: {
        id: updatedClaim._id.toString(),
        status: updatedClaim.status,
        reviewNotes: updatedClaim.reviewNotes,
        reviewedAt: updatedClaim.reviewedAt,
      },
    });

  } catch (error) {
    console.error('Error rejecting claim:', error);
    return NextResponse.json(
      { error: 'Failed to reject claim' },
      { status: 500 }
    );
  }
}
