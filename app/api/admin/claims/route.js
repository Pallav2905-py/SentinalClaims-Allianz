import { NextResponse } from 'next/server';
import ClaimModel from '@/lib/mongodb-claims';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/admin/claims
 * Get all claims with optional filters
 */
export async function GET(request) {
  try {
    // Get user session and check admin role
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized. Please log in.' },
    //     { status: 401 }
    //   );
    // }

    // TODO: Add admin role check when implemented
    // if (session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    // }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Build filters
    const filters = {};
    if (status) filters.status = status;
    if (riskLevel) filters.riskLevel = riskLevel;

    // Get claims
    const claims = await ClaimModel.findAll(filters, limit, skip);

    // Get statistics
    const stats = await ClaimModel.getStats();

    return NextResponse.json({
      success: true,
      claims: claims.map(claim => ({
        _id: claim._id.toString(),
        userId: claim.userId?.toString(),
        textDescription: claim.textDescription || 'No description',
        status: claim.status,
        fraudAnalysis: {
          extractedFeatures: claim.extractedFeatures || claim.fraudAnalysis?.extractedFeatures || {},
          fraudProbability: claim.fraudScore ?? claim.fraudAnalysis?.fraudProbability ?? 0,
          riskLevel: claim.riskLevel || claim.fraudAnalysis?.riskLevel || 'unknown',
          explanation: claim.aiExplanation || claim.fraudAnalysis?.explanation || 'Analysis pending'
        },
        uploadedFiles: claim.uploadedFiles || claim.filePaths?.map(path => ({ filePath: path })) || [],
        audioPath: claim.audioPath,
        reviewNotes: claim.reviewNotes,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      })),
      stats,
      pagination: {
        limit,
        skip,
        total: claims.length,
      },
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}
