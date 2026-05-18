import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paperSetId, answers, timeTaken } = body;

    if (!paperSetId || !answers) {
      return NextResponse.json({ error: "paperSetId and answers required" }, { status: 400 });
    }

    // Fetch correct answers
    const questions = await prisma.question.findMany({
      where: { paperSetId },
      select: { id: true, answer: true, number: true },
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: "Paper set not found or empty" }, { status: 404 });
    }

    // Calculate score
    let score = 0;
    for (const q of questions) {
      if (answers[q.id] === q.answer) score++;
    }

    // Get or create demo user
    const demoUser = await prisma.user.upsert({
      where: { email: "demo@loksewa.local" },
      update: {},
      create: { email: "demo@loksewa.local", name: "Demo User" },
    });

    const session = await prisma.quizSession.create({
      data: {
        userId: demoUser.id,
        paperSetId,
        answers: JSON.stringify(answers),
        score,
        totalQ: questions.length,
        timeTaken: timeTaken || 0,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      score,
      totalQ: questions.length,
      percentage: Math.round((score / questions.length) * 100),
    });
  } catch (err) {
    console.error("[Session Error]", err);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}
