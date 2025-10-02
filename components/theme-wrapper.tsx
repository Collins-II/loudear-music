"use client"
import { useSelector } from "react-redux"
import { RootState } from "@/lib copy/store/index"

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useSelector((state: RootState) => state.theme.currentTheme)

  return (
    <div className={`${theme.colors.background} min-h-screen ${theme.colors.text}`}>
      {children}
    </div>
  )
}
