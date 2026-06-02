import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Direct upload is no longer supported. Use /api/process instead." },
    { status: 410 }
  );
}
