/**
 * Enhanced Fraud Analysis Service
 * Provides multi-angle fraud assessment with leading and lagging indicators
 */

/**
 * Analyze claim from multiple perspectives
 * Returns comprehensive fraud assessment
 */
export async function multiAngleFraudAnalysis(claim, mlPrediction, aiFeatures) {
  const analysis = {
    overallRisk: mlPrediction.risk_level,
    fraudProbability: mlPrediction.fraud_probability,
    confidence: calculateConfidence(mlPrediction, aiFeatures),
    perspectives: {
      financial: analyzeFinancialPerspective(claim, aiFeatures),
      behavioral: analyzeBehavioralPerspective(claim, aiFeatures),
      documentary: analyzeDocumentaryPerspective(claim, aiFeatures),
    },
    indicators: {
      leading: identifyLeadingIndicators(claim, aiFeatures),
      lagging: identifyLaggingIndicators(claim, mlPrediction),
    },
    recommendedActions: generateRecommendations(mlPrediction, aiFeatures),
    timestamp: new Date(),
  };

  return analysis;
}

/**
 * Calculate overall confidence score
 */
function calculateConfidence(mlPrediction, aiFeatures) {
  let confidence = 0.5; // Base confidence

  // ML model confidence
  if (mlPrediction.fraud_probability > 0.7 || mlPrediction.fraud_probability < 0.3) {
    confidence += 0.2; // High confidence in extreme values
  }

  // Feature completeness
  const featureCount = Object.keys(aiFeatures).length;
  if (featureCount >= 15) {
    confidence += 0.2; // More features = more confidence
  }

  // Risk level alignment
  const expectedRisk = mlPrediction.fraud_probability > 0.7 ? 'high' :
                       mlPrediction.fraud_probability > 0.4 ? 'medium' : 'low';
  if (expectedRisk === mlPrediction.risk_level) {
    confidence += 0.1; // Aligned risk assessment
  }

  return Math.min(confidence, 1.0);
}

/**
 * Analyze from financial perspective
 */
function analyzeFinancialPerspective(claim, features) {
  const flags = [];
  let riskScore = 0;

  // Amount analysis
  if (features.amount_vs_avg_ratio > 2.0) {
    flags.push('Claim amount significantly higher than average');
    riskScore += 0.3;
  }

  if (features.amount_vs_policy_ratio > 0.8) {
    flags.push('Claim near policy limit');
    riskScore += 0.2;
  }

  if (features.claimed_amount > 50000) {
    flags.push('High value claim - requires detailed verification');
    riskScore += 0.1;
  }

  // Frequency analysis
  if (features.total_claims_1y > 3) {
    flags.push('Multiple claims in short period');
    riskScore += 0.25;
  }

  if (features.days_since_last_claim < 90) {
    flags.push('Recent previous claim filed');
    riskScore += 0.15;
  }

  return {
    riskScore: Math.min(riskScore, 1.0),
    flags,
    assessment: riskScore > 0.6 ? 'High Risk' : riskScore > 0.3 ? 'Medium Risk' : 'Low Risk',
  };
}

/**
 * Analyze from behavioral perspective
 */
function analyzeBehavioralPerspective(claim, features) {
  const flags = [];
  let riskScore = 0;

  // Timing analysis
  if (features.report_delay_hours > 168) { // More than 7 days
    flags.push('Significant delay in reporting incident');
    riskScore += 0.3;
  }

  if (features.time_since_policy_start < 30) {
    flags.push('Claim filed shortly after policy start');
    riskScore += 0.25;
  }

  // History analysis
  if (features.fraud_history_flag > 0) {
    flags.push('Historical fraud indicators present');
    riskScore += 0.4;
  }

  if (features.previous_rejections > 0) {
    flags.push(`${features.previous_rejections} previous claim(s) rejected`);
    riskScore += 0.2;
  }

  // Geographic risk
  if (features.geo_risk_score > 0.7) {
    flags.push('Incident location has elevated risk profile');
    riskScore += 0.15;
  }

  return {
    riskScore: Math.min(riskScore, 1.0),
    flags,
    assessment: riskScore > 0.6 ? 'High Risk' : riskScore > 0.3 ? 'Medium Risk' : 'Low Risk',
  };
}

/**
 * Analyze from documentary perspective
 */
function analyzeDocumentaryPerspective(claim, features) {
  const flags = [];
  let riskScore = 0;

  // Document quality
  if (features.missing_docs_count > 2) {
    flags.push(`${features.missing_docs_count} required documents missing`);
    riskScore += 0.3;
  }

  if (features.duplicate_doc_flag > 0) {
    flags.push('Duplicate or recycled documents detected');
    riskScore += 0.4;
  }

  if (features.doc_tamper_score > 0.5) {
    flags.push('Possible document tampering or alteration detected');
    riskScore += 0.35;
  }

  if (features.missing_docs_count === 0 && features.duplicate_doc_flag === 0) {
    flags.push('Complete and authentic documentation provided');
    riskScore -= 0.1; // Reduce risk for good documentation
  }

  return {
    riskScore: Math.max(Math.min(riskScore, 1.0), 0),
    flags,
    assessment: riskScore > 0.6 ? 'High Risk' : riskScore > 0.3 ? 'Medium Risk' : 'Low Risk',
  };
}

/**
 * Identify leading indicators (predictive)
 */
function identifyLeadingIndicators(claim, features) {
  const indicators = [];

  // Early warning signs
  if (features.time_since_policy_start < 60) {
    indicators.push({
      type: 'Policy Timing',
      value: `${features.time_since_policy_start} days since policy start`,
      risk: 'medium',
      description: 'New policies have statistically higher fraud rates',
    });
  }

  if (features.geo_risk_score > 0.7) {
    indicators.push({
      type: 'Geographic Risk',
      value: `${(features.geo_risk_score * 100).toFixed(0)}% risk area`,
      risk: 'high',
      description: 'Location associated with elevated fraud activity',
    });
  }

  if (features.amount_vs_avg_ratio > 2) {
    indicators.push({
      type: 'Claim Amount Anomaly',
      value: `${(features.amount_vs_avg_ratio * 100).toFixed(0)}% above average`,
      risk: 'high',
      description: 'Unusually large claim relative to customer history',
    });
  }

  if (features.report_delay_hours > 168) {
    indicators.push({
      type: 'Reporting Delay',
      value: `${Math.floor(features.report_delay_hours / 24)} days delay`,
      risk: 'medium',
      description: 'Delayed reporting may indicate claim fabrication',
    });
  }

  return indicators;
}

/**
 * Identify lagging indicators (historical patterns)
 */
function identifyLaggingIndicators(claim, mlPrediction) {
  const indicators = [];

  // Historical patterns
  if (mlPrediction.fraud_probability > 0.7) {
    indicators.push({
      type: 'ML Model Confidence',
      value: `${(mlPrediction.fraud_probability * 100).toFixed(1)}% fraud probability`,
      severity: 'high',
      description: 'Machine learning model indicates high fraud likelihood based on historical patterns',
    });
  }

  indicators.push({
    type: 'Risk Classification',
    value: mlPrediction.risk_level.toUpperCase(),
    severity: mlPrediction.risk_level,
    description: 'Overall risk assessment based on comprehensive analysis',
  });

  return indicators;
}

/**
 * Generate recommended actions
 */
function generateRecommendations(mlPrediction, features) {
  const recommendations = [];

  if (mlPrediction.fraud_probability > 0.7) {
    recommendations.push({
      priority: 'high',
      action: 'Detailed Investigation Required',
      description: 'Assign to senior fraud investigator for comprehensive review',
    });
    recommendations.push({
      priority: 'high',
      action: 'Document Verification',
      description: 'Request original documents and conduct forensic analysis',
    });
  } else if (mlPrediction.fraud_probability > 0.4) {
    recommendations.push({
      priority: 'medium',
      action: 'Enhanced Review',
      description: 'Conduct additional verification checks before approval',
    });
  } else {
    recommendations.push({
      priority: 'low',
      action: 'Standard Processing',
      description: 'Process through normal claims workflow with routine checks',
    });
  }

  // Specific recommendations based on flags
  if (features.missing_docs_count > 0) {
    recommendations.push({
      priority: 'medium',
      action: 'Request Missing Documentation',
      description: `${features.missing_docs_count} required document(s) need to be submitted`,
    });
  }

  if (features.doc_tamper_score > 0.5) {
    recommendations.push({
      priority: 'high',
      action: 'Document Authentication',
      description: 'Verify authenticity of submitted documents with issuing authorities',
    });
  }

  if (features.previous_rejections > 0) {
    recommendations.push({
      priority: 'medium',
      action: 'Review Claim History',
      description: 'Compare with previously rejected claims for patterns',
    });
  }

  return recommendations;
}

export default {
  multiAngleFraudAnalysis,
};
