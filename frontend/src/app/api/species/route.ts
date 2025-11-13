import { NextResponse } from "next/server"

import { readSpeciesData } from "@/lib/data"

export async function GET() {
  const species = await readSpeciesData()
  return NextResponse.json(species)
}
