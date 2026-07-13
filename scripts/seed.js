const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { generateCaseFacts } = require("../src/lib/prompts/seedCaseFactsPrompt");

// Real Indian Names
const firstNames = ["Ravi", "Anjali", "Vikram", "Sneha", "Karan", "Pooja", "Rahul", "Neha", "Arjun", "Priya", "Amit", "Kavita", "Sanjay", "Ritu", "Mohit"];
const lastNames = ["Sharma", "Desai", "Verma", "Patel", "Singh", "Kumar", "Iyer", "Nair", "Reddy", "Gupta", "Mehta", "Jain", "Bose", "Das", "Chopra"];
const companyNames = ["Tata Industries", "Reliance Builders", "Infosys Solutions", "Wipro Enterprises", "Mahindra Auto", "Bajaj Finance", "L&T Construction"];
const courts = ["District Court, Lucknow", "High Court of Delhi", "Bombay High Court", "Session Court, Pune", "Madras High Court"];

const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const generatePersonName = () => `${randomElement(firstNames)} ${randomElement(lastNames)}`;
const generateEntityName = () => Math.random() > 0.7 ? randomElement(companyNames) : generatePersonName();

// Duplicate the logic here to avoid ES module import issues in native Node
function calculatePendencyScore(caseData, currentDate = new Date()) {
  const { filedDate, adjournmentCount = 0, lastActionDate } = caseData;
  if (!filedDate || !lastActionDate) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  const ageInDays = Math.max(0, (currentDate - new Date(filedDate)) / msPerDay);
  const ageScore = Math.min(100, (ageInDays / 1825) * 100);

  const adjournmentScore = Math.min(100, Math.pow(adjournmentCount, 1.5) * 15);

  const inactivityDays = Math.max(0, (currentDate - new Date(lastActionDate)) / msPerDay);
  const inactivityScore = Math.min(100, (inactivityDays / 365) * 100);

  return Math.round(
    (ageScore * 0.40) + 
    (adjournmentScore * 0.35) + 
    (inactivityScore * 0.25)
  );
}

dotenv.config({ path: ".env.local", override: true });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!MONGODB_URI || !MONGODB_DB) {
  console.error("Missing MONGODB_URI or MONGODB_DB in .env.local");
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log("Connected to MongoDB for seeding...");
    const db = client.db(MONGODB_DB);

    const collections = await db.listCollections().toArray();
    for (const coll of collections) {
      await db.collection(coll.name).drop();
    }
    console.log("Cleared existing collections.");

    const passwordHash = await bcrypt.hash("password123", 12);

    const courtId = new ObjectId();
    const courtName = randomElement(courts);
    await db.collection("courts").insertOne({
      _id: courtId,
      name: courtName,
      createdAt: new Date(),
    });

    const judges = [];
    for (let i = 1; i <= 2; i++) {
      judges.push({
        _id: new ObjectId(),
        name: `Hon. ${generatePersonName()}`,
        email: `judge${i}@example.com`,
        passwordHash,
        role: "judge",
        courtId,
        createdAt: new Date(),
      });
    }

    const clerks = [];
    for (let i = 1; i <= 3; i++) {
      clerks.push({
        _id: new ObjectId(),
        name: generatePersonName(),
        email: `clerk${i}@example.com`,
        passwordHash,
        role: "clerk",
        courtId,
        createdAt: new Date(),
      });
    }

    const lawyers = [];
    for (let i = 1; i <= 5; i++) {
      lawyers.push({
        _id: new ObjectId(),
        name: `Adv. ${generatePersonName()}`,
        email: `lawyer${i}@example.com`,
        passwordHash,
        role: "lawyer",
        barNumber: `BAR-2026-${i * 100}`,
        createdAt: new Date(),
      });
    }

    const litigants = [];
    for (let i = 1; i <= 8; i++) {
      litigants.push({
        _id: new ObjectId(),
        name: generateEntityName(),
        email: `litigant${i}@example.com`,
        passwordHash,
        role: "litigant",
        createdAt: new Date(),
      });
    }

    const adminUser = {
      _id: new ObjectId(),
      name: "System Administrator",
      email: "admin@nyaysetu.gov",
      passwordHash,
      role: "admin",
      createdAt: new Date(),
    };

    const allUsers = [...judges, ...clerks, ...lawyers, ...litigants, adminUser];
    await db.collection("users").insertMany(allUsers);
    console.log(`Created ${allUsers.length} users with realistic names.`);

    const caseTypes = ["civil", "criminal", "family", "commercial"];
    const validStatuses = ["filed", "admitted", "hearing_scheduled", "adjourned", "evidence", "judgment_reserved", "closed"];
    
    const cases = [];
    const auditLogs = [];
    const hearings = [];
    const now = new Date();
    
    // Reducing loop to 25 to allow Groq API to enrich all of them
    const CASE_COUNT = 25;
    console.log(`\nEnriching ${CASE_COUNT} cases using Groq AI...`);

    for (let i = 1; i <= CASE_COUNT; i++) {
      process.stdout.write(`Generating case ${i}/${CASE_COUNT}... `);
      
      const isStuck = i <= 5; // 5 stuck cases
      const isClosed = !isStuck && i % 3 === 0; 
      
      const filedDate = isStuck
        ? randomDate(new Date(now.getFullYear() - 4, 0, 1), new Date(now.getFullYear() - 2, 0, 1))
        : randomDate(new Date(now.getFullYear() - 2, 0, 1), new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000));
        
      const adjournmentCount = isStuck ? randomInt(4, 12) : randomInt(0, 2);
      
      let lastActionDate;
      if (isClosed) {
        const monthsAgo = randomInt(0, 11);
        const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, randomInt(1, 28));
        lastActionDate = date < filedDate ? new Date(filedDate.getTime() + 10 * 24 * 60 * 60 * 1000) : date;
      } else if (isStuck) {
        lastActionDate = randomDate(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000));
      } else {
        lastActionDate = randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now);
      }
      
      const status = isClosed ? "closed" : (isStuck ? "adjourned" : randomElement(validStatuses.filter(s => s !== "closed")));
      const caseType = randomElement(caseTypes);
      const litigant1 = randomElement(litigants);
      let litigant2 = randomElement(litigants);
      while(litigant1._id === litigant2._id) litigant2 = randomElement(litigants); // Ensure distinct litigants

      const caseObj = {
        _id: new ObjectId(),
        caseNumber: `CV-${filedDate.getFullYear()}-${String(i).padStart(6, '0')}`,
        title: `${litigant1.name} v. ${litigant2.name}`,
        caseType,
        status,
        filedDate,
        courtId,
        courtName,
        judgeId: randomElement(judges)._id,
        litigantIds: [litigant1._id, litigant2._id],
        lawyerIds: [randomElement(lawyers)._id],
        adjournmentCount,
        lastActionDate,
        createdAt: filedDate,
        updatedAt: lastActionDate,
      };

      const msPerDay = 1000 * 60 * 60 * 24;
      const ageInDays = Math.max(0, (now - new Date(filedDate)) / msPerDay);
      caseObj.pendencyScore = calculatePendencyScore(caseObj, now);

      // --- Groq Data Enrichment ---
      const aiFacts = await generateCaseFacts({
        caseType,
        adjournmentCount,
        ageInDays,
        status
      }, GROQ_API_KEY);

      caseObj.caseDescription = aiFacts.caseDescription;
      caseObj.reliefSought = aiFacts.reliefSought;
      
      cases.push(caseObj);

      // Audit Log
      auditLogs.push({
        _id: new ObjectId(),
        caseId: caseObj._id,
        actorId: randomElement(clerks)._id,
        actorRole: "clerk",
        action: "status_change",
        toStatus: status,
        reason: isStuck ? aiFacts.stuckReason : "Routine procedural update",
        timestamp: lastActionDate
      });

      // Hearing
      if (aiFacts.hearingNotes && aiFacts.hearingNotes.length > 0) {
        aiFacts.hearingNotes.forEach((note, idx) => {
          hearings.push({
            _id: new ObjectId(),
            caseId: caseObj._id,
            judgeId: caseObj.judgeId,
            scheduledDate: new Date(lastActionDate.getTime() - (idx * 30 * 24 * 60 * 60 * 1000)), // Previous dates
            courtroom: `Room ${randomInt(101, 110)}`,
            status: "completed",
            notes: note,
            createdAt: filedDate
          });
        });
      }

      console.log("Done.");
    }

    await db.collection("cases").insertMany(cases);
    console.log(`\nInserted ${cases.length} enriched cases.`);

    await db.collection("auditLogs").insertMany(auditLogs);
    console.log(`Inserted ${auditLogs.length} audit logs.`);

    await db.collection("hearings").insertMany(hearings);
    console.log(`Inserted ${hearings.length} completed hearings with AI notes.`);

    console.log("\nSeeding complete!");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await client.close();
  }
}

seed();
