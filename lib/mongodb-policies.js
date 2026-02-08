import { ObjectId } from 'mongodb';
import clientPromise from './db';

/**
 * Policy Document Model
 * Manages insurance policy documents and their AI analysis
 */
class PolicyModel {
  static collectionName = 'policies';

  /**
   * Get the policies collection
   */
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('allianz_auth');
    return db.collection(this.collectionName);
  }

  /**
   * Create a new policy document
   */
  static async create(policyData) {
    try {
      const collection = await this.getCollection();
      
      const policy = {
        userId: new ObjectId(policyData.userId),
        policyNumber: policyData.policyNumber,
        policyType: policyData.policyType || 'general',
        fileName: policyData.fileName,
        filePath: policyData.filePath,
        fileSize: policyData.fileSize,
        extractedText: policyData.extractedText || '',
        summary: policyData.summary || null,
        keyTerms: policyData.keyTerms || [],
        coverageDetails: policyData.coverageDetails || {},
        exclusions: policyData.exclusions || [],
        limits: policyData.limits || {},
        metadata: policyData.metadata || {},
        chatHistory: [],
        status: 'processing', // processing, active, archived
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(policy);
      return { ...policy, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating policy:', error);
      throw new Error('Failed to create policy document');
    }
  }

  /**
   * Update policy with AI analysis
   */
  static async updateAnalysis(policyId, analysisData) {
    try {
      const collection = await this.getCollection();
      
      const update = {
        $set: {
          summary: analysisData.summary,
          keyTerms: analysisData.keyTerms || [],
          coverageDetails: analysisData.coverageDetails || {},
          exclusions: analysisData.exclusions || [],
          limits: analysisData.limits || {},
          status: 'active',
          updatedAt: new Date(),
        },
      };

      await collection.updateOne(
        { _id: new ObjectId(policyId) },
        update
      );

      return this.findById(policyId);
    } catch (error) {
      console.error('Error updating policy analysis:', error);
      throw new Error('Failed to update policy analysis');
    }
  }

  /**
   * Add a chat message to policy history
   */
  static async addChatMessage(policyId, message) {
    try {
      const collection = await this.getCollection();
      
      const chatEntry = {
        role: message.role, // 'user' or 'assistant'
        content: message.content,
        timestamp: new Date(),
      };

      await collection.updateOne(
        { _id: new ObjectId(policyId) },
        {
          $push: { chatHistory: chatEntry },
          $set: { updatedAt: new Date() },
        }
      );

      return this.findById(policyId);
    } catch (error) {
      console.error('Error adding chat message:', error);
      throw new Error('Failed to add chat message');
    }
  }

  /**
   * Find policy by ID
   */
  static async findById(policyId) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: new ObjectId(policyId) });
    } catch (error) {
      console.error('Error finding policy:', error);
      return null;
    }
  }

  /**
   * Find all policies for a user
   */
  static async findByUserId(userId) {
    try {
      const collection = await this.getCollection();
      return await collection
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (error) {
      console.error('Error finding user policies:', error);
      return [];
    }
  }

  /**
   * Find policy by policy number
   */
  static async findByPolicyNumber(policyNumber) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ policyNumber });
    } catch (error) {
      console.error('Error finding policy by number:', error);
      return null;
    }
  }

  /**
   * Update policy status
   */
  static async updateStatus(policyId, status) {
    try {
      const collection = await this.getCollection();
      await collection.updateOne(
        { _id: new ObjectId(policyId) },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        }
      );
      return this.findById(policyId);
    } catch (error) {
      console.error('Error updating policy status:', error);
      throw new Error('Failed to update policy status');
    }
  }

  /**
   * Delete a policy
   */
  static async delete(policyId) {
    try {
      const collection = await this.getCollection();
      await collection.deleteOne({ _id: new ObjectId(policyId) });
      return true;
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw new Error('Failed to delete policy');
    }
  }

  /**
   * Get statistics
   */
  static async getStats(userId = null) {
    try {
      const collection = await this.getCollection();
      const filter = userId ? { userId: new ObjectId(userId) } : {};
      
      const total = await collection.countDocuments(filter);
      const active = await collection.countDocuments({ ...filter, status: 'active' });
      const processing = await collection.countDocuments({ ...filter, status: 'processing' });
      const archived = await collection.countDocuments({ ...filter, status: 'archived' });

      return {
        total,
        active,
        processing,
        archived,
      };
    } catch (error) {
      console.error('Error getting policy stats:', error);
      return null;
    }
  }
}

export default PolicyModel;
