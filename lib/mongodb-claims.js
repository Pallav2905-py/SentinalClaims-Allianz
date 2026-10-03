import clientPromise from './db';
import { ObjectId } from 'mongodb';

/**
 * Claim Model
 * Handles all MongoDB operations for claims
 */
class ClaimModel {
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('allianz_auth');
    return db.collection('claims');
  }

  static async create(claimData) {
    try {
      const collection = await this.getCollection();
      const claim = {
        userId: claimData.userId ? new ObjectId(claimData.userId) : null,
        textDescription: claimData.textDescription || '',
        claimType: claimData.claimType || 'general',
        claimAnswers: claimData.claimAnswers || {},
        audioPath: claimData.audioPath || null,
        uploadedFiles: claimData.uploadedFiles || [],
        fraudAnalysis: claimData.fraudAnalysis || null,
        agentWorkflow: claimData.agentWorkflow || null,
        payoutDecision: claimData.payoutDecision || null,
        auditSummary: claimData.auditSummary || null,
        processingSummary: claimData.processingSummary || null,
        status: claimData.status || 'AWAITING_PROCESSING', // AWAITING_PROCESSING, PROCESSING, AWAITING_REVIEW, approved, rejected, ERROR
        reviewNotes: claimData.reviewNotes || null,
        reviewedAt: claimData.reviewedAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(claim);
      return { ...claim, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating claim:', error);
      throw error;
    }
  }

  static async findById(claimId) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: new ObjectId(claimId) });
    } catch (error) {
      console.error('Error finding claim:', error);
      return null;
    }
  }

  static async findByUserId(userId, limit = 50) {
    try {
      const collection = await this.getCollection();
      return await collection
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error finding claims by user:', error);
      return [];
    }
  }

  static async findAll(filters = {}, limit = 100, skip = 0) {
    try {
      const collection = await this.getCollection();
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.riskLevel) {
        query.riskLevel = filters.riskLevel;
      }

      if (filters.userId) {
        query.userId = new ObjectId(filters.userId);
      }

      return await collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Error finding all claims:', error);
      return [];
    }
  }

  static async updateStatus(claimId, status, reviewNotes = null) {
    try {
      const collection = await this.getCollection();
      const updateData = {
        status,
        updatedAt: new Date(),
      };

      if (reviewNotes) {
        updateData.reviewNotes = reviewNotes;
        updateData.reviewedAt = new Date();
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(claimId) },
        { $set: updateData }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating claim status:', error);
      return false;
    }
  }

  static async updateFraudAnalysis(claimId, fraudData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: new ObjectId(claimId) },
        {
          $set: {
            fraudAnalysis: {
              extractedFeatures: fraudData.extractedFeatures,
              fraudProbability: fraudData.fraudScore,
              riskLevel: fraudData.riskLevel,
              explanation: fraudData.aiExplanation,
              comprehensiveAnalysis: fraudData.comprehensiveAnalysis || null,
            },
            agentWorkflow: fraudData.agentWorkflow || null,
            payoutDecision: fraudData.payoutDecision || null,
            auditSummary: fraudData.auditSummary || null,
            processingSummary: fraudData.processingSummary || null,
            riskLevel: fraudData.riskLevel, // For filtering
            fraudScore: fraudData.fraudScore, // For filtering
            updatedAt: new Date(),
          },
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating fraud analysis:', error);
      return false;
    }
  }

  static async delete(claimId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(claimId) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting claim:', error);
      return false;
    }
  }

  static async getStats() {
    try {
      const collection = await this.getCollection();
      
      const totalClaims = await collection.countDocuments();
      // Count all non-approved/rejected as pending
      const pendingClaims = await collection.countDocuments({ 
        status: { $in: ['pending', 'AWAITING_PROCESSING', 'PROCESSING', 'AWAITING_REVIEW'] } 
      });
      const approvedClaims = await collection.countDocuments({ status: 'approved' });
      const rejectedClaims = await collection.countDocuments({ status: 'rejected' });
      
      const highRiskClaims = await collection.countDocuments({ riskLevel: 'high' });
      const mediumRiskClaims = await collection.countDocuments({ riskLevel: 'medium' });
      const lowRiskClaims = await collection.countDocuments({ riskLevel: 'low' });

      return {
        totalClaims: totalClaims,
        pendingClaims: pendingClaims,
        approvedClaims: approvedClaims,
        rejectedClaims: rejectedClaims,
        highRiskClaims: highRiskClaims,
        mediumRiskClaims: mediumRiskClaims,
        lowRiskClaims: lowRiskClaims,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return null;
    }
  }
}

export default ClaimModel;
