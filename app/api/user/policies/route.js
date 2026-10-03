import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import UserPolicyModel from '@/lib/mongodb-user-policies';
import { demoPolicies } from '@/lib/demo-policies';

/**
 * GET /api/user/policies
 * Get all policies for the current user
 */
export async function GET(request) {
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

    const policies = await UserPolicyModel.findByUserId(session.user.id);

    return NextResponse.json({
      success: true,
      policies,
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/policies
 * Create a new policy or load demo policies
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

    // Handle demo data loading
    if (body.action === 'load_demo') {
      const createdPolicies = [];
      
      for (const demoPolicy of demoPolicies) {
        const policy = await UserPolicyModel.create({
          ...demoPolicy,
          userId: session.user.id,
          policyHolder: session.user.name || 'Demo User',
        });
        createdPolicies.push(policy);
      }

      return NextResponse.json({
        success: true,
        message: 'Demo policies loaded successfully',
        policies: createdPolicies,
      });
    }

    // Create individual policy
    const {
      policyNumber,
      provider,
      insuranceType,
      policyHolder,
      status,
      startDate,
      expiryDate,
      premium,
      coverageAmount,
      specificFields,
    } = body;

    if (!policyNumber || !insuranceType || !startDate || !expiryDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const policy = await UserPolicyModel.create({
      userId: session.user.id,
      policyNumber,
      provider: provider || 'Allianz Insurance',
      insuranceType,
      policyHolder: policyHolder || session.user.name,
      status: status || 'active',
      startDate,
      expiryDate,
      premium: premium || 0,
      coverageAmount: coverageAmount || 0,
      specificFields: specificFields || {},
    });

    return NextResponse.json({
      success: true,
      policy,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}
