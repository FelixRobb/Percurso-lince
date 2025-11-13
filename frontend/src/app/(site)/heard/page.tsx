"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useTranslations } from "@/hooks/use-translations"
import type { RawSpeciesEntry } from "@/lib/types"

const STORAGE_KEY = "heardSpecies"

export default function HeardSpeciesPage() {
  const { t, language } = useTranslations("heard_species")
  const [allSpecies, setAllSpecies] = useState<RawSpeciesEntry[]>([])
  const [heardSpecies, setHeardSpecies] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/species")
      .then((res) => res.json())
      .then((data: RawSpeciesEntry[]) => setAllSpecies(data))
      .catch((error) => console.error("Failed to load species data", error))
  }, [])

  const speciesMap = useMemo(() => {
    const map = new Map<string, RawSpeciesEntry>()
    allSpecies.forEach((entry) => {
      map.set(entry["nome-PT"], entry)
    })
    return map
  }, [allSpecies])

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase().trim()
    return heardSpecies
      .map((ptName) => ({
        ptName,
        entry: speciesMap.get(ptName),
      }))
      .filter(({ entry }) => Boolean(entry))
      .filter(({ entry }) => {
        if (!lowerSearch) return true
        const name = entry![language === "PT" ? "nome-PT" : "nome-EN"].toLowerCase()
        const scientific = entry!.scientific_name.toLowerCase()
        return (
          name.includes(lowerSearch) || scientific.includes(lowerSearch)
        )
      })
  }, [heardSpecies, speciesMap, search, language])

  const removeSpecies = (ptName: string) => {
    const updated = heardSpecies.filter((name) => name !== ptName)
    setHeardSpecies(updated)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold uppercase tracking-[0.35em] text-foreground">
          {t("heard_species_title")}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          {t(
            "heard_species_description",
            "Acompanhe as espécies que já ouviu em campo e continue a sua coleção sonora.",
          )}
        </p>
        <div className="max-w-md">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search_placeholder", "Pesquisar espécies...")}
            className="rounded-none border-border/60 uppercase placeholder:text-xs placeholder:tracking-[0.3em]"
            type="search"
          />
        </div>
      </header>

      {filtered.length === 0 ? (
        <div className="rounded border border-border/40 bg-muted/10 p-6 text-sm text-muted-foreground">
          {heardSpecies.length === 0
            ? t("empty_state", "Ainda não adicionou espécies à sua lista de ouvidos.")
            : t("no_results", "Nenhuma espécie corresponde à pesquisa.")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ ptName, entry }) => (
            <Card key={ptName} className="border border-border/40 bg-background/80">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.3em]">
                    {entry![language === "PT" ? "nome-PT" : "nome-EN"]}
                  </h2>
                  <p className="text-xs italic text-muted-foreground">
                    {entry!.scientific_name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {entry!.association && <span>{entry!.association}</span>}
                  {entry!["grupo-PT"] && (
                    <span>{entry![language === "PT" ? "grupo-PT" : "grupo-EN"]}</span>
                  )}
                </div>
                <div className="mt-auto flex gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-border/60 uppercase"
                  >
                    <Link href={`/species/${encodeURIComponent(ptName)}`}>
                      {t("view_species", "Ver detalhes")}
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="uppercase"
                    onClick={() => removeSpecies(ptName)}
                  >
                    {t("remove_button", "Remover")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
