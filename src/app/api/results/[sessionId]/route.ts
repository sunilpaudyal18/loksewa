import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  try {
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        paperSet: {
          include: {
            questions: { orderBy: { number: "asc" } },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const userAnswers = JSON.parse(session.answers) as Record<string, string>;

    // Build detailed breakdown
    const breakdown = session.paperSet.questions.map((q) => ({
      id: q.id,
      number: q.number,
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.answer,
      selectedAnswer: userAnswers[q.id] || null,
      isCorrect: userAnswers[q.id] === q.answer,
      isSkipped: !userAnswers[q.id],
      language: q.language,
    }));

    return NextResponse.json({
      sessionId: session.id,
      paperSetId: session.paperSet.id,
      score: session.score,
      totalQ: session.totalQ,
      percentage: Math.round((session.score / session.totalQ) * 100),
      timeTaken: session.timeTaken,
      completedAt: session.completedAt,
      paperSetTitle: session.paperSet.title,
      breakdown,
    });
  } catch (err) {
    console.error("[Results Error]", err);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
