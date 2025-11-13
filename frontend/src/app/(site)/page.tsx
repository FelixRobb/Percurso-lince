"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useTranslations } from "@/hooks/use-translations"

const LOCATION_LINKS = [
  {
    translationKey: "herolinkazenhas",
    href: "/map?location=Azenhas%20do%20Guadiana",
  },
  {
    translationKey: "herolinkriberira",
    href: "/map?location=Ribeira%20de%20Oeiras",
  },
  {
    translationKey: "herolinkvila",
    href: "/map?location=Vila%20de%20M%C3%A9rtola",
  },
]

const TRAIL_LINKS = [
  {
    translationKey: "herolinkpr3",
    href: "/map?track=PR3%20MTL%20-%20As%20Margens%20do%20Guadiana",
  },
  {
    translationKey: "herolinkpr5",
    href: "/map?track=PR5%20MTL%20-%20Ao%20Ritmo%20das%20%C3%81guas%20do%20Vasc%C3%A3o",
  },
  {
    translationKey: "herolinkpr8",
    href: "/map?track=PR8%20MTL%20-%20Moinho%20do%20Alferes%20um%20Percurso%20Ribeirinho",
  },
]

const CREDITS_KEYS: { key: string; fallback: string }[] = [
  { key: "sideiaoriginal", fallback: "Conceito original" },
  { key: "spesquisa", fallback: "Pesquisa de campo" },
  { key: "sfotos", fallback: "Fotografia" },
  { key: "swebsite", fallback: "Website" },
  { key: "scoordenacao", fallback: "Coordenação" },
]

const CREDITS_VALUES: Record<string, string> = {
  sideiaoriginal: "Magnus Robb & Margarida Lopes Fernandes",
  spesquisa: "Magnus Robb",
  sfotos: "Cristina Girão Vieira, António Tavares, Agostinho Tomás & outros",
  swebsite: "Félix Robb",
  scoordenacao: "João Alves",
}

export default function HomePage() {
  const { t } = useTranslations("index")

  return (
    <div className="space-y-16 md:space-y-20">
      <section className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold uppercase tracking-[0.35em] text-foreground sm:text-4xl">
              {t("herotexth2")}
            </h2>
            <Link
              href="/hearing"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("guiaparaouvir")}
              <ExternalLink className="size-4" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                {t("herolocalizacoes")}
              </h3>
              <ul className="space-y-3 text-sm uppercase tracking-[0.2em]">
                {LOCATION_LINKS.map((item) => (
                  <li key={item.translationKey}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 border-b border-border/40 pb-2 transition-all hover:border-foreground hover:text-foreground"
                    >
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      <span>{t(item.translationKey)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                {t("herolinkpr")}
              </h3>
              <ul className="space-y-3 text-sm uppercase tracking-[0.2em]">
                {TRAIL_LINKS.map((item) => (
                  <li key={item.translationKey}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-2 border-b border-border/40 pb-2 transition-all hover:border-foreground hover:text-foreground"
                    >
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      <span>{t(item.translationKey)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("herotextp")}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-none uppercase">
              <Link href="/map">{t("herolinkvermapa")}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-none border-foreground uppercase"
            >
              <Link href="/recordings">{t("herolinkouvirgravacoes")}</Link>
            </Button>
          </div>
        </div>

        <div className="relative hidden h-full min-h-[360px] overflow-hidden border border-border/40 bg-muted/30 md:block">
          <Image
            src="/images/bg.jpeg"
            alt="Mértola Guadiana landscape"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="space-y-6 border border-border/30 bg-muted/20 p-6 backdrop-blur sm:p-8">
        <h3 className="text-lg uppercase tracking-[0.35em] text-muted-foreground">
          {t("infosectionh3")}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("infosectionp")}
        </p>
        <div className="grid gap-4 text-xs uppercase tracking-[0.3em] text-muted-foreground sm:text-sm">
          {CREDITS_KEYS.map(({ key, fallback }) => (
            <div key={key} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
              <span className="font-semibold text-foreground">{t(key, fallback)}</span>
              <span className="text-muted-foreground">
                {t(`p${key.slice(1)}`, CREDITS_VALUES[key]) || CREDITS_VALUES[key]}
              </span>
            </div>
          ))}
          <p className="text-muted-foreground">{t("mremlf")}</p>
        </div>
        <div className="flex justify-center pt-6">
          <Image
            src="/images/patrocinadores.png"
            alt="Patrocinadores"
            width={480}
            height={160}
            className="w-full max-w-lg"
          />
        </div>
      </section>
    </div>
  )
}
