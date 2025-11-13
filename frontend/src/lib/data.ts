import { promises as fs } from "fs"
import path from "path"

import type { LocationDetailsMap, RawSpeciesEntry } from "./types"

const DATA_ROOT = path.join(process.cwd(), "public", "data")

const SPECIES_DATA_FILE = path.join(DATA_ROOT, "species.json")
const DETAILS_DATA_FILE = path.join(DATA_ROOT, "details.json")

export async function readSpeciesData(): Promise<RawSpeciesEntry[]> {
  const file = await fs.readFile(SPECIES_DATA_FILE, "utf-8")
  return JSON.parse(file) as RawSpeciesEntry[]
}

export async function readLocationDetails(): Promise<LocationDetailsMap> {
  const file = await fs.readFile(DETAILS_DATA_FILE, "utf-8")
  return JSON.parse(file) as LocationDetailsMap
}

export type { RawSpeciesEntry, LocationDetailsMap }

