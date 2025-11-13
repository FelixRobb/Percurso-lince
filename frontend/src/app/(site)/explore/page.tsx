"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"

import { useLanguage } from "@/components/providers/language-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "@/hooks/use-translations"
import type { LocationDetailsEntry, LocationDetailsMap } from "@/lib/types"

type ExploreCard = {
  id: string
  titleKey: string
  image: string
  mapHref: string
  recordingsHref: string
  detailsKey: keyof LocationDetailsMap
  badgeKey?: string
}

const EXPLORE_CARDS: ExploreCard[] = [
  {
    id: "azenhas",
    titleKey: "azenhas_title",
    image: "/images/Azenhas_do_guadiana.jpg",
    mapHref: "/map?location=Azenhas%20do%20Guadiana",
    recordingsHref: "/recordings?location=Azenhas%20do%20Guadiana",
    detailsKey: "Azenhas do Guadiana",
  },
  {
    id: "ribeira",
    titleKey: "ribeira_title",
    image: "/images/Ribeira_de_oeiras.jpg",
    mapHref: "/map?location=Ribeira%20de%20Oeiras",
    recordingsHref: "/recordings?location=Ribeira%20de%20Oeiras",
    detailsKey: "Ribeira de Oeiras",
  },
  {
    id: "mertola",
    titleKey: "mertola_title",
    image: "/images/Vila_de_mertola.jpg",
    mapHref: "/map?location=Vila%20de%20M%C3%A9rtola",
    recordingsHref: "/recordings?location=Vila%20de%20M%C3%A9rtola",
    detailsKey: "Vila de Mértola",
  },
  {
    id: "pr3",
    titleKey: "pr3_title",
    image: "/images/pr3.jpg",
    mapHref:
      "/map?track=PR3%20MTL%20-%20As%20Margens%20do%20Guadiana",
    recordingsHref:
      "/recordings?location=PR3%20MTL%20-%20As%20Margens%20do%20Guadiana",
    detailsKey: "PR3 MTL - As Margens do Guadiana",
    badgeKey: "trail",
  },
  {
    id: "pr5",
    titleKey: "pr5_title",
    image: "/images/pr5.jpg",
    mapHref:
      "/map?track=PR5%20MTL%20-%20Ao%20Ritmo%20das%20%C3%81guas%20do%20Vasc%C3%A3o",
    recordingsHref:
      "/recordings?location=PR5%20MTL%20-%20Ao%20Ritmo%20das%20%C3%81guas%20do%20Vasc%C3%A3o",
    detailsKey: "PR5 MTL - Ao Ritmo das Águas do Vascão",
    badgeKey: "trail",
  },
  {
    id: "pr8",
    titleKey: "pr8_title",
    image: "/images/pr8.jpg",
    mapHref:
      "/map?track=PR8%20MTL%20-%20Moinho%20do%20Alferes%20um%20Percurso%20Ribeirinho",
    recordingsHref:
      "/recordings?location=PR8%20MTL%20-%20Moinho%20do%20Alferes%20um%20Percurso%20Ribeirinho",
    detailsKey: "PR8 MTL - Moinho do Alferes um Percurso Ribeirinho",
    badgeKey: "trail",
  },
]

type SelectedDetail = {
  title: string
  content: string
  links?: LocationDetailsEntry["links"]
}

export default function ExplorePage() {
  const { language } = useLanguage()
  const { t } = useTranslations("home")
  const [details, setDetails] = useState<LocationDetailsMap>({})
  const [selected, setSelected] = useState<SelectedDetail | null>(null)

  useEffect(() => {
    fetch("/api/details")
      .then((res) => res.json())
      .then((data: LocationDetailsMap) => setDetails(data))
      .catch((error) =>
        console.error("Failed to load location details", error),
      )
  }, [])

  const cards = useMemo(
    () =>
      EXPLORE_CARDS.map((card) => {
        const info = details[card.detailsKey]
        const content =
          info?.[`description-${language}` as const] ??
          info?.["description-PT"] ??
          ""
        return {
          ...card,
          infoContent: content,
          infoLinks: info?.links ?? [],
        }
      }),
    [details, language],
  )

  const openDetail = (card: (typeof cards)[number]) => {
    setSelected({
      title: t(card.titleKey),
      content: card.infoContent,
      links: card.infoLinks,
    })
  }

  return (
    <div className="space-y-12">
      <div className="space-y-3 text-center uppercase">
        <h2 className="text-2xl font-semibold tracking-[0.35em] text-foreground">
          {t("localidades")}
        </h2>
        <p className="text-sm tracking-[0.3em] text-muted-foreground">
          {t("pelasmar")}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card
            key={card.id}
            className="flex h-full flex-col overflow-hidden border border-border/40 bg-background/80"
          >
            <CardHeader className="relative h-48 overflow-hidden p-0">
              <Image
                src={card.image}
                alt={t(card.titleKey)}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              {card.badgeKey && (
                <Badge className="absolute left-3 top-3 rounded-none bg-foreground text-background">
                  {t("trail_badge", "Percurso")}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold uppercase tracking-[0.3em]">
                  {t(card.titleKey)}
                </h3>
                <button
                  onClick={() => openDetail(card)}
                  className="text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("info_button", "Info")}
                </button>
              </div>
            </CardContent>
            <CardFooter className="grid gap-3 border-t border-border/30 p-6">
              <Button
                asChild
                variant="outline"
                className="w-full border-foreground uppercase"
              >
                <Link href={card.mapHref}>{t("view_map")}</Link>
              </Button>
              <Button asChild className="w-full uppercase">
                <Link href={card.recordingsHref}>{t("view_recordings")}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl border border-border/30 bg-background">
          <DialogHeader>
            <DialogTitle className="text-lg uppercase tracking-[0.35em]">
              {selected?.title}
            </DialogTitle>
            <DialogDescription className="hidden">
              {selected?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {selected?.content}
          </div>
          {selected?.links?.length ? (
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              {selected.links.map((link) => (
                <Button
                  key={link.url}
                  asChild
                  variant="outline"
                  className="border-foreground uppercase"
                >
                  <Link href={link.url}>
                    {language === "PT" ? link["text-PT"] : link["text-EN"]}
                  </Link>
                </Button>
              ))}
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
