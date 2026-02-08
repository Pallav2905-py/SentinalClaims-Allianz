import axios from 'axios';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

/**
 * Send extracted features to FastAPI ML model for fraud prediction
 */
export async function predictFraud(features) {
  try {
    const response = await axios.post(`${FASTAPI_URL}/predict`, features, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    if (response.data && typeof response.data.fraud_probability !== 'undefined') {
      return {
        fraud_probability: response.data.fraud_probability,
        risk_level: response.data.risk_level || determineRiskLevel(response.data.fraud_probability),
      };
    }

    throw new Error('Invalid response from prediction service');
  } catch (error) {
    console.error('Error calling prediction service:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Prediction service is not available. Please ensure FastAPI is running on ' + FASTAPI_URL);
    }
    
    if (error.response) {
      throw new Error(`Prediction service error: ${error.response.status} - ${error.response.statusText}`);
    }
    
    throw new Error('Failed to get fraud prediction: ' + error.message);
  }
}

/**
 * Determine risk level based on fraud probability
 */
function determineRiskLevel(probability) {
  if (probability >= 0.7) return 'high';
  if (probability >= 0.4) return 'medium';
  return 'low';
}

/**
 * Health check for FastAPI service
 */
export async function checkPredictionServiceHealth() {
  try {
    const response = await axios.get(`${FASTAPI_URL}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('Prediction service health check failed:', error.message);
    return false;
  }
}
