"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>Choose your role</Label>
      <RadioGroup value={value} onValueChange={onChange} className="flex gap-4 mt-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="FAN" id="fan" />
          <Label htmlFor="fan">Fan</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ARTIST" id="artist" />
          <Label htmlFor="artist">Artist</Label>
        </div>
      </RadioGroup>
    </div>
  )
}
