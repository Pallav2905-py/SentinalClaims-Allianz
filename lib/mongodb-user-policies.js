import { ObjectId } from 'mongodb';
import clientPromise from './db';

/**
 * User Policy Model
 * Manages actual insurance policies (Motor, Health, Travel, Home)
 * Different from PolicyModel which handles PDF policy documents
 */
class UserPolicyModel {
  static collectionName = 'user_policies';

  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('allianz_auth');
    return db.collection(this.collectionName);
  }

  /**
   * Create a new insurance policy
   */
  static async create(policyData) {
    try {
      const collection = await this.getCollection();
      
      const policy = {
        userId: new ObjectId(policyData.userId),
        policyNumber: policyData.policyNumber,
        provider: policyData.provider || 'Allianz',
        insuranceType: policyData.insuranceType, // motor, health, travel, home
        policyHolder: policyData.policyHolder,
        status: policyData.status || 'active', // active, expired, cancelled
        startDate: new Date(policyData.startDate),
        expiryDate: new Date(policyData.expiryDate),
        premium: policyData.premium || 0,
        coverageAmount: policyData.coverageAmount || 0,
        
        // Type-specific fields
        ...policyData.specificFields,
        
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(policy);
      return { ...policy, _id: result.insertedId };
    } catch (error) {
      console.error('Error creating user policy:', error);
      throw new Error('Failed to create policy');
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
   * Update a policy
   */
  static async update(policyId, updateData) {
    try {
      const collection = await this.getCollection();
      
      const update = {
        ...updateData,
        updatedAt: new Date(),
      };

      // Don't allow updating userId
      delete update.userId;
      delete update._id;

      await collection.updateOne(
        { _id: new ObjectId(policyId) },
        { $set: update }
      );

      return this.findById(policyId);
    } catch (error) {
      console.error('Error updating policy:', error);
      throw new Error('Failed to update policy');
    }
  }

  /**
   * Delete a policy
   */
  static async delete(policyId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: new ObjectId(policyId) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw new Error('Failed to delete policy');
    }
  }

  /**
   * Get policy statistics
   */
  static async getStats(userId) {
    try {
      const collection = await this.getCollection();
      const filter = { userId: new ObjectId(userId) };
      
      const total = await collection.countDocuments(filter);
      const active = await collection.countDocuments({ ...filter, status: 'active' });
      const expired = await collection.countDocuments({ ...filter, status: 'expired' });

      return { total, active, expired };
    } catch (error) {
      console.error('Error getting policy stats:', error);
      return { total: 0, active: 0, expired: 0 };
    }
  }
}

export default UserPolicyModel;
