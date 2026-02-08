import clientPromise from '../lib/db';

/**
 * User Model for MongoDB
 * 
 * Better Auth automatically manages the user collection with the following schema:
 * {
 *   _id: ObjectId,
 *   email: String (unique, indexed),
 *   emailVerified: Boolean,
 *   name: String,
 *   image: String,
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 * 
 * Sessions are stored in a separate "session" collection:
 * {
 *   _id: ObjectId,
 *   userId: ObjectId (reference to user),
 *   token: String (unique, indexed),
 *   expiresAt: Date,
 *   ipAddress: String,
 *   userAgent: String,
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

class User {
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('allianz_auth');
    return db.collection('user');
  }

  static async findById(userId) {
    try {
      const collection = await this.getCollection();
      const user = await collection.findOne({ _id: userId });
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  static async findByEmail(email) {
    try {
      const collection = await this.getCollection();
      const user = await collection.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  static async updateUser(userId, updates) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: userId },
        { 
          $set: { 
            ...updates,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  static async deleteUser(userId) {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteOne({ _id: userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  static async getAllUsers(limit = 100, skip = 0) {
    try {
      const collection = await this.getCollection();
      const users = await collection
        .find({})
        .limit(limit)
        .skip(skip)
        .toArray();
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }
}

export default User;
