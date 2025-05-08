// scripts/createUser.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from 'server/models/User';
import connectMongo from 'server/libs/connectMongo';

dotenv.config(); // Loads MONGODB_URI from .env

// Run: npx tsx utils/dataImport.ts

async function createUser() {
  try {
    await connectMongo();

    const newUser = await User.create({
      firstName: 'Justin',
      lastName: 'Bernard',
      email: 'justin.bernard320@gmail.com',
      password: '321',
      role: 'Admin',
      phoneNumber: '123-456-7890'
    });

    console.log('🎉 User created:', newUser);
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

createUser();