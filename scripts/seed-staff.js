const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config({ path: ".env.local", override: true });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI || !MONGODB_DB) {
  console.error("Missing MONGODB_URI or MONGODB_DB in .env.local");
  process.exit(1);
}

async function seedStaff() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB for staff seeding...");
    const db = client.db(MONGODB_DB);

    const passwordHash = await bcrypt.hash("Admin123!", 10);

    const staffAccounts = [
      {
        name: "Chief Admin",
        email: "admin@nyaysahayak.gov",
        passwordHash,
        role: "admin",
        createdAt: new Date(),
      },
      {
        name: "Hon. Judge Sharma",
        email: "judge@nyaysahayak.gov",
        passwordHash,
        role: "judge",
        createdAt: new Date(),
      },
      {
        name: "Senior Clerk Verma",
        email: "clerk@nyaysahayak.gov",
        passwordHash,
        role: "clerk",
        createdAt: new Date(),
      }
    ];

    let createdCount = 0;

    for (const account of staffAccounts) {
      // Check if user already exists
      const existingUser = await db.collection("users").findOne({ email: account.email });
      if (!existingUser) {
        account._id = new ObjectId();
        await db.collection("users").insertOne(account);
        console.log(`Created ${account.role} account: ${account.email}`);
        createdCount++;
      } else {
        console.log(`Account ${account.email} already exists. Skipping.`);
      }
    }

    console.log(`\nSeed complete! Created ${createdCount} new staff accounts.`);
    console.log(`You can now log in at /login using these emails and the password: Admin123!`);
    
  } catch (err) {
    console.error("Error during staff seeding:", err);
  } finally {
    await client.close();
  }
}

seedStaff();
