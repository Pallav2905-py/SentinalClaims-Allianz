import { NextResponse } from 'next/server';
import PolicyModel from '@/lib/mongodb-policies';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/policy/[id]
 * Get detailed policy information
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
      policy: {
        _id: policy._id.toString(),
        policyNumber: policy.policyNumber,
        policyType: policy.policyType,
        fileName: policy.fileName,
        fileSize: policy.fileSize,
        summary: policy.summary,
        coverageDetails: policy.coverageDetails,
        exclusions: policy.exclusions,
        limits: policy.limits,
        keyTerms: policy.keyTerms,
        status: policy.status,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
      },
    });

  } catch (error) {
    console.error('Error fetching policy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policy' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/policy/[id]
 * Delete a policy document
 */
export async function DELETE(request, { params }) {
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

    // Delete the policy
    await PolicyModel.delete(policyId);

    return NextResponse.json({
      success: true,
      message: 'Policy deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting policy:', error);
    return NextResponse.json(
      { error: 'Failed to delete policy' },
      { status: 500 }
    );
  }
}
