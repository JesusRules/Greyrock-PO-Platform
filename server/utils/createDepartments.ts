import mongoose from "mongoose";
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectMongo from '../libs/connectMongo.js';
import Department from "../models/Department.js";

dotenv.config(); // Loads MONGODB_URI from .env

const departments = [
  "Administration",
  "Boutique",
  "Events",
  "Food and Beverage",
  "Gaming",
  "IT",
  "Maintenance",
  "Marketing",
  "Security",
  "Surveillance",
  "Vault",
];

// Run: npx tsx utils/createDepartments.ts

async function seedDepartments() {
  try {
    await connectMongo();

    for (const name of departments) {
      const existing = await Department.findOne({ name });

      if (!existing) {
        await Department.create({ name, locked: true });
        console.log(`✅ Created: ${name}`);
      } else {
        console.log(`⚠️ Skipped (already exists): ${name}`);
      }
    }

    console.log("🎉 Done seeding departments.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding departments:", error);
    process.exit(1);
  }
}

seedDepartments();
