import { useEffect, useMemo, useState } from "react"

import type { TranslationDictionary } from "@/lib/types"

import { useLanguage } from "@/components/providers/language-provider"

const translationCache = new Map<string, TranslationDictionary>()

function buildCacheKey(language: string, resource: string) {
  return `${language}:${resource}`
}

async function fetchTranslationFile(language: string, resource: string) {
  const cacheKey = buildCacheKey(language, resource)
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!
  }

  const response = await fetch(`/translations/${language}/${resource}.json`, {
    cache: "force-cache",
  })

  if (!response.ok) {
    console.warn(
      `Missing translation file: /translations/${language}/${resource}.json`,
    )
    translationCache.set(cacheKey, {})
    return {}
  }

  const data = (await response.json()) as TranslationDictionary
  translationCache.set(cacheKey, data)
  return data
}

export function useTranslations(
  resource: string,
  options: { mergeAll?: boolean } = { mergeAll: true },
) {
  const { language, isReady } = useLanguage()
  const [translations, setTranslations] = useState<TranslationDictionary>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isReady) return

    let isCancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const langFolder = language.toUpperCase()

        const [allTranslations, pageTranslations] = await Promise.all([
          options.mergeAll
            ? fetchTranslationFile(langFolder, "all")
            : Promise.resolve({}),
          fetchTranslationFile(langFolder, resource),
        ])

        if (!isCancelled) {
          setTranslations({
            ...allTranslations,
            ...pageTranslations,
          })
        }
      } catch (error) {
        console.error("Error loading translations", error)
        if (!isCancelled) {
          setTranslations({})
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      isCancelled = true
    }
  }, [language, resource, isReady, options.mergeAll])

  const t = useMemo(() => {
    return (key: string, fallback?: string) =>
      translations[key] ?? fallback ?? key
  }, [translations])

  return { translations, t, language, isLoading }
}
