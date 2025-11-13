"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "@/hooks/use-translations"
import type { RawSpeciesEntry } from "@/lib/types"

const STORAGE_KEY = "heardSpecies"

export default function SpeciesDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = decodeURIComponent(params.slug)
  const { t, language } = useTranslations("species")

  const [allEntries, setAllEntries] = useState<RawSpeciesEntry[]>([])
  const [selectedAssociation, setSelectedAssociation] = useState<string>()
  const [heardSpecies, setHeardSpecies] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    fetch("/api/species")
      .then((res) => res.json())
      .then((data: RawSpeciesEntry[]) => setAllEntries(data))
      .catch((error) => console.error("Failed to load species data", error))
  }, [])

  const entries = useMemo(() => {
    return allEntries.filter((entry) => entry["nome-PT"] === slug)
  }, [allEntries, slug])

  const associations = useMemo(() => {
    const values = Array.from(new Set(entries.map((entry) => entry.association)))
    return values
  }, [entries])

  const activeAssociation =
    selectedAssociation ?? associations[0] ?? ""

  const entry = useMemo(() => {
    if (!entries.length) return undefined
    return (
      entries.find((item) => item.association === activeAssociation) ??
      entries[0]
    )
  }, [entries, activeAssociation])

  if (!allEntries.length) {
    return (
      <div className="rounded border border-border/40 bg-muted/10 p-6 text-sm text-muted-foreground">
        {t("loading", "A carregar informações da espécie...")}
      </div>
    )
  }

  if (!entry) {
    notFound()
  }

  const isHeard = heardSpecies.includes(entry["nome-PT"])

  const toggleHeard = () => {
    const updated = isHeard
      ? heardSpecies.filter((name) => name !== entry["nome-PT"])
      : [...heardSpecies, entry["nome-PT"]]
    setHeardSpecies(updated)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }
  }

  const description = entry[language === "PT" ? "descricao-PT" : "descricao-EN"]
  const notes = entry[language === "PT" ? "notas-PT" : "notas-EN"]
  const months =
    entry[
      language === "PT"
        ? "most_probable_months_PT"
        : "most_probable_months_EN"
    ]

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold uppercase tracking-[0.35em] text-foreground">
            {entry[language === "PT" ? "nome-PT" : "nome-EN"]}
          </h1>
          <Badge className="rounded-none bg-foreground text-background uppercase">
            {entry[language === "PT" ? "grupo-PT" : "grupo-EN"]}
          </Badge>
        </div>
        <p className="text-sm italic text-muted-foreground md:text-base">
          {entry.scientific_name}
        </p>
      </header>

      <section className="space-y-6 rounded-lg border border-border/40 bg-muted/10 p-6">
        <div className="grid gap-4 md:grid-cols-[2fr_3fr] md:items-end">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {t("location_select", "Localização associada")}
            </label>
              <Select
                value={activeAssociation}
                onValueChange={(value) => setSelectedAssociation(value)}
              >
              <SelectTrigger className="border-border/60 uppercase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border/40 bg-background">
                {associations.map((association) => (
                  <SelectItem
                    key={association}
                    value={association}
                    className="uppercase"
                  >
                    {association}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              variant={isHeard ? "destructive" : "outline"}
              className="border-border/60 uppercase"
              onClick={toggleHeard}
            >
              {isHeard
                ? t("remove_from_heard", "Remover de ouvidos")
                : t("add_to_heard", "Adicionar a ouvidos")}
            </Button>
            <Button asChild className="uppercase">
              <Link href={`/recordings?species=${encodeURIComponent(entry["nome-PT"])}`}>
                {t("view_recordings", "Ver gravações")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
              {t("description_heading", "Descrição")}
            </h2>
            <p>{description}</p>
            {notes && (
              <>
                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
                  {t("notes_heading", "Notas")}
                </h3>
                <p>{notes}</p>
              </>
            )}
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
                {t("best_months", "Melhores meses")}
              </h3>
              <p className="uppercase tracking-[0.3em]">
                {months.join(" • ")}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
                {t("time_of_day", "Hora do dia")}
              </h3>
              <p>
                {entry[language === "PT" ? "quando-PT" : "quando-EN"] ??
                  entry.epocaEN ??
                  t("unknown", "Desconhecido")}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
                {t("where_heading", "Onde ouvir")}
              </h3>
              <p>
                {entry[language === "PT" ? "onde" : "ondeEN"] ??
                  t("unknown", "Desconhecido")}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
                {t("habitat_heading", "Habitat")}
              </h3>
              <p>
                {entry[language === "PT" ? "habitat-PT" : "habitat-EN"] ??
                  t("unknown", "Desconhecido")}
              </p>
            </div>
          </div>
        </div>

        <div
          className="[&_iframe]:w-full [&_iframe]:rounded-md [&_iframe]:border [&_iframe]:border-border/30"
          dangerouslySetInnerHTML={{ __html: entry.sound_url }}
        />

        {entry.url && (
          <Button asChild variant="outline" className="border-border/60 uppercase">
            <Link href={entry.url} target="_blank" rel="noopener noreferrer">
              {t("listen_source", "Ouvir no SoundCloud")}
            </Link>
          </Button>
        )}
      </section>
    </div>
  )
}
