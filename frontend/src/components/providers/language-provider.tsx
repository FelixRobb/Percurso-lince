"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { LanguageCode } from "@/lib/types"

type LanguageContextValue = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  openSelector: () => void
  isReady: boolean
}

const SUPPORTED_LANGUAGES: LanguageCode[] = ["PT", "EN"]
const STORAGE_KEY = "lang-psg"

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") return "PT"
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY)
    return storedLanguage && isLanguage(storedLanguage) ? storedLanguage : "PT"
  })
  const [showDialog, setShowDialog] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY)
    return !(storedLanguage && isLanguage(storedLanguage))
  })
  const [isReady] = useState(() => typeof window !== "undefined")

  const persistLanguage = useCallback((nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage)
    }
    setShowDialog(false)
  }, [])

  const openSelector = useCallback(() => {
    setShowDialog(true)
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({
        language,
        setLanguage: persistLanguage,
      openSelector,
      isReady,
    }),
    [language, persistLanguage, openSelector, isReady],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
      <LanguageSelectionDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSelect={persistLanguage}
      />
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

function isLanguage(value: string): value is LanguageCode {
  return SUPPORTED_LANGUAGES.includes(value as LanguageCode)
}

function LanguageSelectionDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (language: LanguageCode) => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className="max-w-sm border border-foreground/10 bg-background">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold uppercase tracking-wide">
            Choose your language
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select the language you want to use throughout the experience.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            className="w-full uppercase"
            onClick={() => onSelect("PT")}
          >
            Português
          </Button>
          <Button className="w-full uppercase" onClick={() => onSelect("EN")}>
            English
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
