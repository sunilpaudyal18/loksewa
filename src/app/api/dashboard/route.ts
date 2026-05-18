import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const demoUser = await prisma.user.findUnique({
      where: { email: "demo@loksewa.local" },
    });

    if (!demoUser) {
      return NextResponse.json({ paperSets: [], sessions: [] });
    }

    const [paperSets, sessions] = await Promise.all([
      prisma.paperSet.findMany({
        where: { userId: demoUser.id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { questions: true, sessions: true } } },
      }),
      prisma.quizSession.findMany({
        where: { userId: demoUser.id },
        orderBy: { completedAt: "desc" },
        take: 10,
        include: { paperSet: { select: { title: true } } },
      }),
    ]);

    return NextResponse.json({ paperSets, sessions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
