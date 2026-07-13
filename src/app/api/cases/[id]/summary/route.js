import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { getCaseSummaryPrompt } from "@/lib/prompts/caseSummaryPrompt";
import { Groq } from "groq-sdk";

export async function POST(req, { params }) {
  const { id } = params;
  
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);
    
    const caseData = await db.collection("cases").findOne({ _id: new ObjectId(id) });
    await client.close();

    if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = getCaseSummaryPrompt(caseData);

    const res = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192"
    });

    const summary = res.choices[0].message.content;
    
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Failed to generate summary", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
