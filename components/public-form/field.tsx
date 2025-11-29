"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { FormField } from "@/lib/types"
import type { UseFormReturn } from "react-hook-form"

interface PublicFormFieldProps {
  field: FormField
  formMethods: UseFormReturn<any>
}

export function PublicFormField({ field, formMethods }: PublicFormFieldProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = formMethods

  const value = watch(field.id)
  const error = errors[field.id]

  return (
    <div className="space-y-3">
      <Label htmlFor={field.id}>
        {field.label}
        {field.validation?.required && <span className="ml-1 text-destructive">*</span>}
      </Label>

      {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}

      {renderFieldInput(field, register, setValue, value)}

      {error && <p className="text-sm text-destructive">{error.message as string}</p>}
    </div>
  )
}

function renderFieldInput(field: FormField, register: any, setValue: any, value: any) {
  switch (field.type) {
    case "text":
    case "email":
      return <Input id={field.id} type={field.type} placeholder={field.placeholder || ""} {...register(field.id)} />

    case "number":
      return (
        <Input
          id={field.id}
          type="number"
          placeholder={field.placeholder || ""}
          min={field.validation?.min}
          max={field.validation?.max}
          {...register(field.id)}
        />
      )

    case "textarea":
      return <Textarea id={field.id} placeholder={field.placeholder || ""} rows={4} {...register(field.id)} />

    case "select":
      return (
        <Select onValueChange={(val) => setValue(field.id, val)} value={value}>
          <SelectTrigger id={field.id}>
            <SelectValue placeholder={field.placeholder || "Выберите вариант"} />
          </SelectTrigger>
          <SelectContent>
            {(field.options || []).map((option, i) => (
              <SelectItem key={i} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "radio":
      return (
        <RadioGroup onValueChange={(val) => setValue(field.id, val)} value={value}>
          {(field.options || []).map((option, i) => (
            <div key={i} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${field.id}-${i}`} />
              <Label htmlFor={`${field.id}-${i}`} className="font-normal">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )

    case "checkbox":
      return (
        <div className="space-y-3">
          {(field.options || []).map((option, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.id}-${i}`}
                checked={value?.includes(option)}
                onCheckedChange={(checked) => {
                  const current = value || []
                  if (checked) {
                    setValue(field.id, [...current, option])
                  } else {
                    setValue(
                      field.id,
                      current.filter((v: string) => v !== option),
                    )
                  }
                }}
              />
              <Label htmlFor={`${field.id}-${i}`} className="font-normal">
                {option}
              </Label>
            </div>
          ))}
        </div>
      )

    case "date":
      return <Input id={field.id} type="date" {...register(field.id)} />

    case "time":
      return <Input id={field.id} type="time" {...register(field.id)} />

    case "datetime":
      return <Input id={field.id} type="datetime-local" {...register(field.id)} />

    case "slider":
      return (
        <div className="space-y-3 pt-2">
          <Slider
            min={field.validation?.min || 0}
            max={field.validation?.max || 100}
            step={1}
            value={[value || field.validation?.min || 0]}
            onValueChange={(vals) => setValue(field.id, vals[0])}
          />
          <div className="text-center text-sm font-medium">{value || 0}</div>
        </div>
      )

    case "rating":
      return <RatingField fieldId={field.id} value={value} setValue={setValue} />

    case "file":
      return (
        <Input
          id={field.id}
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setValue(field.id, file.name)
          }}
        />
      )

    case "geolocation":
      return <GeolocationField fieldId={field.id} setValue={setValue} value={value} />

    default:
      return <Input id={field.id} placeholder="Неизвестный тип поля" disabled />
  }
}

function RatingField({
  fieldId,
  value,
  setValue,
}: {
  fieldId: string
  value: number
  setValue: any
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setValue(fieldId, i + 1)}
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-8 w-8 ${(hover || value) > i ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  )
}

function GeolocationField({
  fieldId,
  setValue,
  value,
}: {
  fieldId: string
  setValue: any
  value: any
}) {
  const [loading, setLoading] = useState(false)

  async function getLocation() {
    setLoading(true)
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude, longitude } = position.coords
      setValue(fieldId, { latitude, longitude })
    } catch (error) {
      console.error("[v0] Error getting location:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-transparent"
        onClick={getLocation}
        disabled={loading}
      >
        <MapPin className="mr-2 h-4 w-4" />
        {loading ? "Определение..." : "Определить местоположение"}
      </Button>

      {value && (
        <div className="rounded-lg bg-muted p-3 text-sm">
          <p>Широта: {value.latitude.toFixed(6)}</p>
          <p>Долгота: {value.longitude.toFixed(6)}</p>
        </div>
      )}
    </div>
  )
}
