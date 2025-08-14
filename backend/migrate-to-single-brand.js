/**
 * Migration Script: Convert to One Brand Per User
 * 
 * This script safely migrates existing users with multiple brands
 * to the new one-brand-per-user system by keeping only the most recent brand.
 * 
 * Run with: node migrate-to-single-brand.js
 */

const mongoose = require('mongoose');
const BrandProfile = require('./models/BrandProfile');
require('dotenv').config();

async function migrateToSingleBrand() {
  try {
    console.log('🚀 Starting migration to one brand per user...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all users with multiple brands
    const usersWithMultipleBrands = await BrandProfile.aggregate([
      {
        $group: {
          _id: '$ownerUserId',
          brands: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    console.log(`📊 Found ${usersWithMultipleBrands.length} users with multiple brands`);
    
    let totalBrandsRemoved = 0;
    
    for (const userData of usersWithMultipleBrands) {
      const userId = userData._id;
      const brands = userData.brands;
      
      console.log(`\n👤 Processing user ${userId} with ${brands.length} brands:`);
      
      // Sort brands by updatedAt (most recent first)
      brands.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      // Keep the most recent brand
      const brandToKeep = brands[0];
      const brandsToRemove = brands.slice(1);
      
      console.log(`✅ Keeping: ${brandToKeep.domain} (updated: ${brandToKeep.updatedAt})`);
      
      // Remove older brands
      for (const brandToRemove of brandsToRemove) {
        console.log(`🗑️ Removing: ${brandToRemove.domain} (updated: ${brandToRemove.updatedAt})`);
        await BrandProfile.findByIdAndDelete(brandToRemove._id);
        totalBrandsRemoved++;
      }
    }
    
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Total brands removed: ${totalBrandsRemoved}`);
    console.log(`👥 Users processed: ${usersWithMultipleBrands.length}`);
    
    // Verify migration
    const verification = await BrandProfile.aggregate([
      {
        $group: {
          _id: '$ownerUserId',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    if (verification.length === 0) {
      console.log('✅ Verification passed: All users now have only one brand');
    } else {
      console.log('⚠️ Warning: Some users still have multiple brands');
      console.log(verification);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToSingleBrand()
    .then(() => {
      console.log('🏁 Migration script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToSingleBrand };
