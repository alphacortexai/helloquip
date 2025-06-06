import { NextResponse } from "next/server";
import { getLocations } from "@/lib/uglocation";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const parentId = searchParams.get("parentId");

  if (!level) {
    return NextResponse.json({ error: "Missing 'level' query parameter" }, { status: 400 });
  }

  const data = getLocations(level, parentId);
  return NextResponse.json(data);
}
