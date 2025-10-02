"use client"
import { useDispatch, useSelector } from "react-redux"
import { setTheme } from "@/lib copy/store/themeSlice"
import { RootState } from "@/lib copy/store/index"
import { Button } from "@/components/ui/button"

export function ThemeSwitcher() {
  const dispatch = useDispatch()
  const theme = useSelector((state: RootState) => state.theme.currentTheme)

  return (
    <div className="flex gap-2">
      <Button
        className={theme.colors.primary}
        onClick={() => dispatch(setTheme("cleo"))}
      >
        Cleo Ice Queen
      </Button>

      <Button
        className={theme.colors.secondary}
        onClick={() => dispatch(setTheme("default"))}
      >
        Default
      </Button>
    </div>
  )
}
