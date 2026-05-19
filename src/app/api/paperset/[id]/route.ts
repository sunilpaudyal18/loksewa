import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateAnswer } from "@/lib/parser/ocrCorrections";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const paperSet = await prisma.paperSet.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { number: "asc" } },
        _count: { select: { sessions: true } },
      },
    });
    if (!paperSet) {
      return NextResponse.json({ error: "Paper set not found" }, { status: 404 });
    }
    return NextResponse.json(paperSet);
  } catch {
    return NextResponse.json({ error: "Failed to fetch paper set" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { questionId, _delete, text, optionA, optionB, optionC, optionD, answer } = body;

    if (!questionId) {
      return NextResponse.json({ error: "questionId required" }, { status: 400 });
    }

    // Handle delete of individual question
    if (_delete) {
      await prisma.question.delete({ where: { id: questionId } });
      // Update totalQ count
      const count = await prisma.question.count({ where: { paperSetId: id } });
      await prisma.paperSet.update({ where: { id }, data: { totalQ: count } });
      return NextResponse.json({ success: true });
    }

    // Validate answer value before writing
    if (answer !== undefined) {
      const cleanAnswer = validateAnswer(answer);
      if (answer !== "" && !cleanAnswer) {
        return NextResponse.json(
          { error: `Invalid answer "${answer}". Must be A, B, C, or D.` },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...(text !== undefined && { text }),
        ...(optionA !== undefined && { optionA }),
        ...(optionB !== undefined && { optionB }),
        ...(optionC !== undefined && { optionC }),
        ...(optionD !== undefined && { optionD }),
        ...(answer !== undefined && { answer }),
        hasWarning: false,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.paperSet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete paper set" }, { status: 500 });
  }
}
