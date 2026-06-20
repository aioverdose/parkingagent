import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/validation";

export function ok<T>(body: T, status: number = 200) {
  return NextResponse.json(body, { status });
}

export function err(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(error: unknown, label: string) {
  if (error instanceof ValidationError) {
    return err(error.message, 400);
  }
  console.error(`${label}:`, error);
  return err("Internal server error", 500);
}
