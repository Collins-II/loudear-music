"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DropdownProps {
  actionLabel: string
  label: string
  data: string[]
  onChange: (value: string) => void // pass the selected value
}

export function DropdownRadio({
  actionLabel,
  label,
  data,
  onChange,
}: DropdownProps) {
  const [position, setPosition] = React.useState(data[0] ?? "")

  const onChangeCall = (value: string) => {
    setPosition(value)        // update local state
    onChange(value)           // notify parent with new value
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-black hover:bg-black/70 text-white" asChild>
        <Button variant="outline">{actionLabel}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/70">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={position} onValueChange={onChangeCall}>
          {data.map((d, i) => (
            <DropdownMenuRadioItem key={i} value={d}>
              {d}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
