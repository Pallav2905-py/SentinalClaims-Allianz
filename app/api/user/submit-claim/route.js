import { NextResponse } from 'next/server';
import { parseFormData } from '@/lib/upload-helper';
import ClaimModel from '@/lib/mongodb-claims';
import { extractFeaturesFromClaim, generateFraudExplanation } from '@/lib/groq-service';
import { predictFraud } from '@/lib/prediction-service';
import { auth } from '@/lib/auth';
import { extractTextFromPDFs, combinePDFTexts } from '@/lib/pdf-parser';
import { multiAngleFraudAnalysis } from '@/lib/fraud-analysis-service';

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
        message: 'Claim submitted successfully. Processing fraud detection...',
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

    // Step 0: Extract text from PDFs if any
    console.log('Extracting text from PDF files...');
    const pdfTextMap = await extractTextFromPDFs(files);
    const pdfText = combinePDFTexts(pdfTextMap);
    if (pdfText) {
      console.log(`Extracted text from ${Object.keys(pdfTextMap).length} PDF file(s)`);
    }

    // Step 1: Extract features using Groq (with PDF text)
    console.log('Extracting features...');
    const extractedFeatures = await extractFeaturesFromClaim(description, files.length, pdfText);
    console.log('Features extracted:', extractedFeatures);

    // Step 2: Get fraud prediction from FastAPI
    console.log('Getting fraud prediction...');
    const fraudResult = await predictFraud(extractedFeatures);
    console.log('Fraud prediction:', fraudResult);

    // Step 3: Perform multi-angle fraud analysis
    console.log('Performing multi-angle fraud analysis...');
    const comprehensiveAnalysis = await multiAngleFraudAnalysis(
      { textDescription: description, fileCount: files.length },
      fraudResult,
      extractedFeatures
    );
    console.log('Comprehensive analysis complete');

    // Step 4: Generate AI explanation (with PDF text)
    console.log('Generating explanation...');
    const explanation = await generateFraudExplanation(description, extractedFeatures, fraudResult, pdfText);
    console.log('Explanation generated');

    // Step 5: Update claim with comprehensive results
    await ClaimModel.updateFraudAnalysis(claimId, {
      extractedFeatures,
      fraudScore: fraudResult.fraud_probability,
      riskLevel: fraudResult.risk_level,
      aiExplanation: explanation,
      comprehensiveAnalysis, // Store multi-angle analysis
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
