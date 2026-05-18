import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "tmp", "uploads");

export async function POST(req: NextRequest) {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await req.formData();
    const questionFiles = formData.getAll("questions") as File[];
    const answerKeyFile = formData.get("answerKey") as File | null;

    if (!questionFiles || questionFiles.length === 0) {
      return NextResponse.json(
        { error: "No question images uploaded" },
        { status: 400 }
      );
    }
    if (!answerKeyFile) {
      return NextResponse.json(
        { error: "Answer key image is required" },
        { status: 400 }
      );
    }

    const jobId = randomUUID();
    const jobDir = path.join(UPLOAD_DIR, jobId);
    await mkdir(jobDir, { recursive: true });

    // Save question images
    const questionPaths: string[] = [];
    for (let i = 0; i < questionFiles.length; i++) {
      const file = questionFiles[i];
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `q_${i}.${ext}`;
      const filePath = path.join(jobDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      questionPaths.push(filePath);
    }

    // Save answer key
    const akExt = answerKeyFile.name.split(".").pop() || "jpg";
    const akPath = path.join(jobDir, `answerkey.${akExt}`);
    const akBuffer = Buffer.from(await answerKeyFile.arrayBuffer());
    await writeFile(akPath, akBuffer);

    return NextResponse.json({
      jobId,
      questionCount: questionFiles.length,
      message: "Upload successful. Ready to process.",
    });
  } catch (err) {
    console.error("[Upload Error]", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
