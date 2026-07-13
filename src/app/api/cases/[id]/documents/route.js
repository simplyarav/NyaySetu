import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/requireRole";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req, { params }) {
  try {
    const user = requireRole(["clerk", "judge", "admin", "lawyer", "litigant"]);
    if (user instanceof NextResponse) return user;

    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid case ID format" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const caseIdObj = new ObjectId(id);
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExt = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : "");
    const uniqueFilename = `${crypto.randomUUID()}${fileExt}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    const fileUrl = `/uploads/${uniqueFilename}`;

    // Read the file and write to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const doc = {
      _id: new ObjectId(),
      caseId: caseIdObj,
      title: file.name,
      fileUrl: fileUrl,
      uploadedBy: new ObjectId(user.id),
      uploadedAt: new Date(),
    };

    await db.collection("caseDocuments").insertOne(doc);

    // Audit log
    await db.collection("auditLogs").insertOne({
      caseId: caseIdObj,
      actorId: new ObjectId(user.id),
      actorRole: user.role,
      action: "document_uploaded",
      reason: `Uploaded document: ${file.name}`,
      timestamp: new Date()
    });

    return NextResponse.json({ message: "Document uploaded successfully", document: doc }, { status: 201 });
  } catch (error) {
    console.error("POST document Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
