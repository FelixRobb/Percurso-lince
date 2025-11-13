import { NextResponse } from "next/server"

import { readLocationDetails } from "@/lib/data"

export async function GET() {
  const details = await readLocationDetails()
  return NextResponse.json(details)
}
