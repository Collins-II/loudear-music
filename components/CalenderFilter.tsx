"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "./ui/calendar"

interface DropdownProps {
  actionLabel?: string
  label?: string
  onChange?: (value: Date | undefined) => void
}

export function CalendarFilter({ 
  actionLabel = "Filter Date", 
  label = "Select Date", 
  onChange 
}: DropdownProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const onChangeCall = (value: Date | undefined) => {
    setDate(value)
    if (onChange) onChange(value)
  }

  const handleClear = () => {
    setDate(undefined)
    if (onChange) onChange(undefined)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-black text-white hover:bg-black/80">
          {actionLabel}: {date ? date.toLocaleDateString() : "None"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="p-4 bg-black dark:bg-slate-200 rounded-xl shadow-xl w-auto space-y-3"
      >
        <DropdownMenuLabel className="text-sm font-semibold text-gray-300 dark:text-gray-700">
          {label}
        </DropdownMenuLabel>

        <Calendar
          mode="single"
          selected={date}
          onSelect={onChangeCall}
          className="rounded-md border border-gray-700 dark:border-gray-200 bg-slate-900 dark:bg-white"
        />

        <DropdownMenuSeparator className="my-2" />

        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full"
          onClick={handleClear}
        >
          Clear Filters
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
