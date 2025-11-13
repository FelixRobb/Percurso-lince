"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "@/hooks/use-translations"
import {
  aggregateSpeciesByName,
  getUniqueAssociations,
} from "@/lib/species-utils"
import type { RawSpeciesEntry, SimplifiedSpecies } from "@/lib/types"

type Filters = {
  association: string
  group: string
  when: string
  month: string
}

const MONTHS_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function RecordingsPage() {
  const { t, language } = useTranslations("recordings")
  const [speciesRaw, setSpeciesRaw] = useState<RawSpeciesEntry[]>([])
  const [speciesList, setSpeciesList] = useState<SimplifiedSpecies[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Filters>({
    association: "",
    group: "",
    when: "",
    month: "",
  })

  useEffect(() => {
    fetch("/api/species")
      .then((res) => res.json())
      .then((data: RawSpeciesEntry[]) => {
        setSpeciesRaw(data)
        setSpeciesList(aggregateSpeciesByName(data))

        const params = new URLSearchParams(window.location.search)
        const locationFromUrl = params.get("location")
        if (locationFromUrl) {
          setFilters((prev) => ({ ...prev, association: locationFromUrl }))
        }
      })
      .catch((error) => console.error("Failed to load species data", error))
  }, [])

  const associations = useMemo(() => {
    return ["", ...getUniqueAssociations(speciesRaw)]
  }, [speciesRaw])

  const groups = useMemo(() => {
    const field = language === "PT" ? "grupo-PT" : "grupo-EN"
    const values = new Set(
      speciesRaw.map((entry) => entry[field as keyof RawSpeciesEntry]).filter(Boolean) as string[],
    )
    return ["", ...Array.from(values).sort((a, b) => a.localeCompare(b))]
  }, [speciesRaw, language])

  const timesOfDay = useMemo(() => {
    const field = language === "PT" ? "quando-PT" : "quando-EN"
    const values = new Set(
      speciesRaw.map((entry) => entry[field as keyof RawSpeciesEntry]).filter(Boolean) as string[],
    )
    return ["", ...Array.from(values).sort((a, b) => a.localeCompare(b))]
  }, [speciesRaw, language])

  const filteredSpecies = useMemo(() => {
    const monthFilterValue =
      filters.month && language === "EN"
        ? MONTHS_PT[MONTHS_EN.indexOf(filters.month)]
        : filters.month

    const baseList = speciesList.filter((item) => {
      const matchesAssociation =
        !filters.association || item.associations.includes(filters.association)
      const matchesGroup = !filters.group || item.group[language].toLowerCase() === filters.group.toLowerCase()
      const matchesWhen =
        !filters.when || item.when[language].toLowerCase() === filters.when.toLowerCase()
      const matchesMonth =
        !monthFilterValue || item.bestMonths.includes(monthFilterValue)
      return matchesAssociation && matchesGroup && matchesWhen && matchesMonth
    })

    if (!searchTerm) {
      return baseList
    }

    const query = searchTerm.toLowerCase().trim()
    return baseList
      .map((species) => {
        const name = species.name[language].toLowerCase()
        const scientific = species.scientificName.toLowerCase()
        let weight = 0

        if (name.startsWith(query)) {
          weight += 3
        } else if (name.includes(query)) {
          weight += 1
        }

        if (scientific.startsWith(query) && query.length > 2) {
          weight += 2
        } else if (scientific.includes(query)) {
          weight += 0.5
        }

        return { species, weight }
      })
      .filter((item) => item.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .map((item) => item.species)
  }, [speciesList, filters, searchTerm, language])

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold uppercase tracking-[0.35em] text-foreground">
          {t("title")}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t(
            "description",
            "Filtre e explore as espécies sonoras gravadas nos trilhos e localizações do Guadiana.",
          )}
        </p>
      </header>

      <section className="grid gap-6 rounded-lg border border-border/40 bg-muted/10 p-6">
        <div className="grid gap-4 md:grid-cols-[2fr_3fr] md:items-end">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {t("search-placeholder", "Pesquisar espécies")}
            </label>
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t("search-placeholder", "Pesquisar espécies")}
              className="rounded-none border-border/60 uppercase placeholder:text-xs placeholder:tracking-[0.3em]"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label={t("allloc", "Todas as localizações")}
              value={filters.association}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, association: value }))
              }
              options={associations.map((item) => ({
                value: item,
                label: item || t("allloc", "Todas as localizações"),
              }))}
            />
            <FilterSelect
              label={t("alltype", "Classe Animal")}
              value={filters.group}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, group: value }))
              }
              options={groups.map((item) => ({
                value: item,
                label: item || t("alltype", "Classe Animal"),
              }))}
            />
            <FilterSelect
              label={t("alltime", "Hora do dia")}
              value={filters.when}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, when: value }))
              }
              options={timesOfDay.map((item) => ({
                value: item,
                label: item || t("alltime", "Hora do dia"),
              }))}
            />
            <FilterSelect
              label={t("allmonths", "Todos os meses")}
              value={filters.month}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, month: value }))
              }
              options={[
                "",
                ...(language === "PT" ? MONTHS_PT : MONTHS_EN),
              ].map((item) => ({
                value: item,
                label: item || t("allmonths", "Todos os meses"),
              }))}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="border border-border/40 uppercase"
            onClick={() => {
              setFilters({
                association: "",
                group: "",
                when: "",
                month: "",
              })
              setSearchTerm("")
            }}
          >
            {t("clear_filters", "Limpar filtros")}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          {t("results_heading", "Resultados")}
        </h2>
        {filteredSpecies.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("no_results", "Nenhum registo encontrado.")}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSpecies.map((species) => (
              <Card
                key={species.scientificName}
                className="flex h-full flex-col border border-border/40 bg-background/80"
              >
                <CardHeader className="flex flex-col gap-2 border-b border-border/20 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.3em]">
                        {species.name[language]}
                      </h3>
                      <p className="text-xs italic text-muted-foreground">
                        {species.scientificName}
                      </p>
                    </div>
                    <Badge className="rounded-none bg-foreground text-background uppercase">
                      {species.group[language]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    {species.associations.map((association) => (
                      <span key={association}>{association}</span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 p-5">
                  <div className="[&_iframe]:w-full [&_iframe]:rounded-md [&_iframe]:border [&_iframe]:border-border/30">
                    <div
                      className="aspect-video w-full overflow-hidden rounded border border-border/30 bg-muted/20"
                      dangerouslySetInnerHTML={{ __html: species.soundEmbedHtml }}
                    />
                  </div>
                  <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                    <p>{species.description[language]}</p>
                    <p className="uppercase tracking-[0.3em]">
                      {t("best_months", "Melhores meses")}:{" "}
                      {species.bestMonths.join(" • ")}
                    </p>
                    <p className="uppercase tracking-[0.3em]">
                      {t("time_of_day", "Hora do dia")}: {species.when[language]}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-auto border-border/60 uppercase"
                  >
                    <Link href={`/species/${encodeURIComponent(species.name.PT)}`}>
                      {t("view_species", "Ver detalhes")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="border-border/60 uppercase">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-border/40 bg-background">
          {options.map((option) => (
            <SelectItem key={option.value || "all"} value={option.value} className="uppercase">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
