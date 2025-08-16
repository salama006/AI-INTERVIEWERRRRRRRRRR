import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json().catch(() => ({}));
  console.log("📝 Received data at log_interview:", data);

  return NextResponse.json({
    message: "Log interview route is working!",
    received: data,
  });
}
