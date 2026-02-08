import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { checkPredictionServiceHealth } from '@/lib/prediction-service';

export const runtime = 'nodejs';

/**
 * GET /api/health
 * Health check endpoint for all services
 */
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {},
  };

  // Check MongoDB
  try {
    const client = await clientPromise;
    await client.db('allianz_auth').command({ ping: 1 });
    health.services.mongodb = { status: 'connected' };
  } catch (error) {
    health.services.mongodb = { 
      status: 'error', 
      message: error.message 
    };
    health.status = 'degraded';
  }

  // Check Groq API
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }
    health.services.groq = { 
      status: 'configured',
      keyPresent: true 
    };
  } catch (error) {
    health.services.groq = { 
      status: 'error', 
      message: error.message 
    };
    health.status = 'degraded';
  }

  // Check FastAPI
  try {
    const isHealthy = await checkPredictionServiceHealth();
    health.services.fastapi = { 
      status: isHealthy ? 'connected' : 'unreachable',
      url: process.env.FASTAPI_URL || 'http://localhost:8000'
    };
    if (!isHealthy) {
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.fastapi = { 
      status: 'error', 
      message: error.message 
    };
    health.status = 'degraded';
  }

  // Check uploads directory
  try {
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    if (fs.existsSync(uploadsDir)) {
      const stats = fs.statSync(uploadsDir);
      health.services.uploads = { 
        status: 'ready',
        writable: true,
        path: '/uploads'
      };
    } else {
      throw new Error('Uploads directory does not exist');
    }
  } catch (error) {
    health.services.uploads = { 
      status: 'error', 
      message: error.message 
    };
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
