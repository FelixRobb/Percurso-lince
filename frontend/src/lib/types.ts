export type LanguageCode = "PT" | "EN"

export interface RawSpeciesEntry {
  id: number
  "troço": number
  association: string
  percurso: string
  scientific_name: string
  "nome-PT": string
  "nome-EN": string
  "grupo-PT": string
  "grupo-EN": string
  sound_url: string
  url?: string
  fich_som?: string
  "descricao-PT": string
  "descricao-EN": string
  onde?: string
  ondeEN?: string
  "habitat-PT"?: string
  "habitat-EN"?: string
  "quando-PT"?: string
  "quando-EN"?: string
  epocaEN?: string
  "notas-PT"?: string
  "notas-EN"?: string
  "most_probable_months_PT": string[]
  "most_probable_months_EN": string[]
  autor?: string
  [key: string]: unknown
}

export interface LocationLink {
  "text-PT": string
  "text-EN": string
  url: string
}

export interface LocationDetailsEntry {
  "description-PT": string
  "description-EN": string
  links?: LocationLink[]
}

export type LocationDetailsMap = Record<string, LocationDetailsEntry>

export type TranslationDictionary = Record<string, string>

export interface AggregatedSpecies {
  id: number
  association: string
  percurso: string
  scientificName: string
  soundEmbedHtml: string
  soundUrl?: string
  audioFile?: string
  names: Record<LanguageCode, string>
  group: Record<LanguageCode, string>
  description: Record<LanguageCode, string>
  notes: Record<LanguageCode, string>
  bestMonths: Record<LanguageCode, string[]>
  when?: Record<LanguageCode, string>
  where?: Record<LanguageCode, string>
  habitat?: Record<LanguageCode, string>
  author?: string
}

export interface SimplifiedSpecies {
  name: Record<LanguageCode, string>
  scientificName: string
  associations: string[]
  bestMonths: string[]
  group: Record<LanguageCode, string>
  when: Record<LanguageCode, string>
  notes: Record<LanguageCode, string>
  description: Record<LanguageCode, string>
  soundEmbedHtml: string
}
