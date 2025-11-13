"use client"

import dynamic from "next/dynamic"

const MapPage = dynamic(() => import("./page-client"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[540px] rounded-lg border border-border/40 bg-muted/10" />
  ),
})

export default function MapPageWrapper() {
  return <MapPage />
}
