import type {
  AggregatedSpecies,
  LanguageCode,
  RawSpeciesEntry,
  SimplifiedSpecies,
} from "./types"

export function transformSpeciesEntry(entry: RawSpeciesEntry): AggregatedSpecies {
  const names: Record<LanguageCode, string> = {
    PT: entry["nome-PT"],
    EN: entry["nome-EN"],
  }

  const group: Record<LanguageCode, string> = {
    PT: entry["grupo-PT"],
    EN: entry["grupo-EN"],
  }

  const description: Record<LanguageCode, string> = {
    PT: entry["descricao-PT"],
    EN: entry["descricao-EN"],
  }

  const notes: Record<LanguageCode, string> = {
    PT: entry["notas-PT"] ?? "",
    EN: entry["notas-EN"] ?? "",
  }

  const bestMonths: Record<LanguageCode, string[]> = {
    PT: entry["most_probable_months_PT"],
    EN: entry["most_probable_months_EN"],
  }

  const when: Record<LanguageCode, string> | undefined =
    entry["quando-PT"] || entry["quando-EN"]
      ? {
          PT: entry["quando-PT"] ?? "",
          EN: entry["quando-EN"] ?? entry.epocaEN ?? "",
        }
      : undefined

  const where: Record<LanguageCode, string> | undefined =
    entry.onde || entry.ondeEN
      ? {
          PT: entry.onde ?? "",
          EN: entry.ondeEN ?? "",
        }
      : undefined

  const habitat: Record<LanguageCode, string> | undefined =
    entry["habitat-PT"] || entry["habitat-EN"]
      ? {
          PT: entry["habitat-PT"] ?? "",
          EN: entry["habitat-EN"] ?? "",
        }
      : undefined

  return {
    id: entry.id,
    association: entry.association,
    percurso: entry.percurso,
    scientificName: entry.scientific_name,
    soundEmbedHtml: entry.sound_url,
    soundUrl: entry.url,
    audioFile: entry.fich_som,
    names,
    group,
    description,
    notes,
    bestMonths,
    when,
    where,
    habitat,
    author: entry.autor,
  }
}

export function aggregateSpeciesByName(
  species: RawSpeciesEntry[],
): SimplifiedSpecies[] {
  const aggregated = new Map<string, SimplifiedSpecies>()

  species.forEach((entry) => {
    const namePT = entry["nome-PT"]
    const current = aggregated.get(namePT)
    const whenPT = entry["quando-PT"] ?? ""
    const whenEN = entry["quando-EN"] ?? entry.epocaEN ?? ""

    if (!current) {
      aggregated.set(namePT, {
        name: {
          PT: namePT,
          EN: entry["nome-EN"],
        },
        scientificName: entry.scientific_name,
        associations: [entry.association],
        bestMonths: Array.from(new Set(entry["most_probable_months_PT"])),
        group: {
          PT: entry["grupo-PT"],
          EN: entry["grupo-EN"],
        },
        when: {
          PT: whenPT,
          EN: whenEN,
        },
        notes: {
          PT: entry["notas-PT"] ?? "",
          EN: entry["notas-EN"] ?? "",
        },
        description: {
          PT: entry["descricao-PT"],
          EN: entry["descricao-EN"],
        },
        soundEmbedHtml: entry.sound_url,
      })
    } else {
      current.associations = Array.from(
        new Set([...current.associations, entry.association]),
      )
      current.bestMonths = Array.from(
        new Set([...current.bestMonths, ...entry["most_probable_months_PT"]]),
      ).sort((a, b) => a.localeCompare(b, "pt"))

      aggregated.set(namePT, current)
    }
  })

  return Array.from(aggregated.values()).sort((a, b) =>
    a.name.PT.localeCompare(b.name.PT, "pt"),
  )
}

export function filterSpeciesByAssociation(
  species: RawSpeciesEntry[],
  association?: string,
) {
  if (!association || association === "all") {
    return species
  }
  return species.filter((entry) => entry.association === association)
}

export function getUniqueAssociations(species: RawSpeciesEntry[]) {
  return Array.from(new Set(species.map((entry) => entry.association))).sort(
    (a, b) => a.localeCompare(b, "pt"),
  )
}
