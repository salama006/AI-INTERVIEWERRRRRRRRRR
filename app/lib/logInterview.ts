// app/lib/logInterview.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const DATA_FILE = path.join(DATA_DIR, "interview_logs.json");

// Append entry to JSON file
export function logInterviewMessage(role: string, text?: string, audio?: string) {
  let data: any[] = [];
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      data = JSON.parse(content);
    }
  } catch (err) {
    console.warn("Failed reading JSON, starting new array", err);
  }

  const entry = {
    timestamp: new Date().toISOString(),
    role,
    ...(text ? { text } : {}),
    ...(audio ? { audio } : {}), // store base64 string if audio
  };

  data.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

