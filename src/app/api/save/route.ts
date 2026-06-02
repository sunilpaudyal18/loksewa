import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, year, questions, answers } = body;

    if (!questions || !questions.length) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 });
    }

    const demoUser = await prisma.user.upsert({
      where: { email: "demo@loksewa.local" },
      update: {},
      create: { email: "demo@loksewa.local", name: "Demo User" },
    });

    const matched = questions.map((q: any) => ({
      ...q,
      answer: answers?.[String(q.number)] ?? "",
      hasWarning: q.hasWarning || !answers?.[String(q.number)],
      warningMessage:
        !answers?.[String(q.number)] && !q.hasWarning
          ? "No answer key match found"
          : q.warningMessage,
    }));

    const validated = matched.map((q: any) => {
      const clean = /^[A-D]$/.test(q.answer) ? q.answer : "";
      if (q.answer && !clean) {
        return { ...q, answer: "", hasWarning: true, warningMessage: "Invalid answer rejected" };
      }
      return { ...q, answer: clean };
    });

    const uniqueValidated: any[] = [];
    const usedNumbers = new Set<number>();
    let maxNumber = Math.max(0, ...validated.map((q: any) => q.number));

    for (const q of validated) {
      if (usedNumbers.has(q.number)) {
        maxNumber++;
        q.number = maxNumber;
        q.hasWarning = true;
        q.warningMessage = q.warningMessage
          ? `${q.warningMessage}; Auto-renumbered due to duplicate`
          : "Auto-renumbered due to duplicate";
      }
      usedNumbers.add(q.number);
      uniqueValidated.push(q);
    }

    const paperSet = await prisma.paperSet.create({
      data: {
        userId: demoUser.id,
        title: title || `Paper Set (${new Date().toLocaleDateString()})`,
        subject: subject || null,
        year: year || null,
        totalQ: uniqueValidated.length,
        questions: {
          create: uniqueValidated.map((q: any) => ({
            number: q.number,
            text: q.text,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            answer: q.answer,
            language: q.language,
            confidence: q.confidence,
            hasWarning: q.hasWarning,
            explanation: q.warningMessage ?? undefined,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({
      success: true,
      paperSetId: paperSet.id,
      totalQuestions: uniqueValidated.length,
      ocrConfidence: body.ocrConfidence || 80,
      answerKeyParsed: answers ? Object.keys(answers).length : 0,
    });
  } catch (err) {
    console.error("[Save Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 }
    );
  }
}
