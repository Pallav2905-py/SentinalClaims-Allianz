import { NextResponse } from 'next/server';
import { parseFormData } from '@/lib/upload-helper';
import PolicyModel from '@/lib/mongodb-policies';
import { extractTextFromPDF } from '@/lib/pdf-parser';
import { analyzePolicyDocument } from '@/lib/groq-service';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * POST /api/policy/upload
 * Upload and analyze a new insurance policy document
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

    // Validate that a PDF file was uploaded
    const pdfFile = files.find(f => f.filename?.toLowerCase().endsWith('.pdf'));
    
    if (!pdfFile) {
      return NextResponse.json(
        { error: 'Please upload a PDF policy document' },
        { status: 400 }
      );
    }

    // Extract text from PDF
    console.log('Extracting text from policy PDF...');
    const policyText = await extractTextFromPDF(pdfFile.path);

    if (!policyText || policyText.length < 100) {
      return NextResponse.json(
        { error: 'Unable to extract text from PDF. Please ensure the PDF contains readable text.' },
        { status: 400 }
      );
    }

    // Create initial policy record
    const policy = await PolicyModel.create({
      userId: session.user.id,
      policyNumber: fields.policyNumber || 'AUTO-' + Date.now(),
      policyType: fields.policyType || 'general',
      fileName: pdfFile.filename,
      filePath: pdfFile.path,
      fileSize: pdfFile.size,
      extractedText: policyText,
      status: 'processing',
    });

    // Analyze policy in background
    analyzePolicyAsync(policy._id.toString(), policyText, fields.policyNumber || '');

    return NextResponse.json(
      {
        success: true,
        message: 'Policy uploaded successfully. AI analysis in progress...',
        policyId: policy._id.toString(),
        status: 'processing',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error uploading policy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload policy' },
      { status: 500 }
    );
  }
}

/**
 * Analyze policy asynchronously
 */
async function analyzePolicyAsync(policyId, policyText, policyNumber) {
  try {
    console.log(`Analyzing policy ${policyId}...`);

    // Analyze policy with Groq AI
    const analysis = await analyzePolicyDocument(policyText, policyNumber);
    console.log('Policy analysis complete:', analysis);

    // Update policy with analysis results
    await PolicyModel.updateAnalysis(policyId, analysis);

    console.log(`Policy ${policyId} analyzed successfully`);
  } catch (error) {
    console.error(`Error analyzing policy ${policyId}:`, error);
    
    // Update policy with error status
    try {
      await PolicyModel.updateStatus(policyId, 'error');
    } catch (updateError) {
      console.error('Failed to update policy with error status:', updateError);
    }
  }
}

/**
 * GET /api/policy/upload
 * Get user's policy documents
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

    // Get user's policies
    const policies = await PolicyModel.findByUserId(session.user.id);

    return NextResponse.json({
      success: true,
      policies: policies.map(policy => ({
        _id: policy._id.toString(),
        policyNumber: policy.policyNumber,
        policyType: policy.policyType,
        fileName: policy.fileName,
        fileSize: policy.fileSize,
        summary: policy.summary,
        status: policy.status,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
      })),
    });

  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}
