"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Star } from "lucide-react"
import type { FormField } from "@/lib/types"

interface FieldPreviewProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
}

export function FieldPreview({ field, onUpdate }: FieldPreviewProps) {
  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.validation?.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}

      {renderFieldInput(field)}
    </div>
  )
}

function renderFieldInput(field: FormField) {
  switch (field.type) {
    case "text":
    case "email":
    case "number":
      return <Input type={field.type} placeholder={field.placeholder || ""} disabled />

    case "textarea":
      return <Textarea placeholder={field.placeholder || ""} rows={3} disabled />

    case "select":
      return (
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Выберите вариант"} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || ["Вариант 1", "Вариант 2"]).map((option, i) => (
              <SelectItem key={i} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "radio":
      return (
        <RadioGroup disabled>
          {(field.options || ["Вариант 1", "Вариант 2"]).map((option, i) => (
            <div key={i} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${field.id}-${i}`} />
              <Label htmlFor={`${field.id}-${i}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )

    case "checkbox":
      return (
        <div className="space-y-2">
          {(field.options || ["Вариант 1", "Вариант 2"]).map((option, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Checkbox id={`${field.id}-${i}`} disabled />
              <Label htmlFor={`${field.id}-${i}`}>{option}</Label>
            </div>
          ))}
        </div>
      )

    case "date":
      return <Input type="date" disabled />

    case "time":
      return <Input type="time" disabled />

    case "datetime":
      return <Input type="datetime-local" disabled />

    case "slider":
      return (
        <div className="pt-2">
          <Slider defaultValue={[50]} min={field.validation?.min || 0} max={field.validation?.max || 100} disabled />
        </div>
      )

    case "rating":
      return (
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-6 w-6 text-muted-foreground" />
          ))}
        </div>
      )

    case "file":
      return (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8">
          <p className="text-sm text-muted-foreground">Нажмите для загрузки файла</p>
        </div>
      )

    case "geolocation":
      return (
        <div className="flex items-center justify-center rounded-lg border bg-muted p-8">
          <p className="text-sm text-muted-foreground">Определение местоположения</p>
        </div>
      )

    default:
      return <Input placeholder="Неизвестный тип поля" disabled />
  }
}
