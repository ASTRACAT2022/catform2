"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import type { FormField } from "@/lib/types"

interface FieldSettingsProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
}

export function FieldSettings({ field, onUpdate }: FieldSettingsProps) {
  const [newOption, setNewOption] = useState("")

  const hasOptions = ["select", "radio", "checkbox"].includes(field.type)

  function addOption() {
    if (!newOption.trim()) return

    const currentOptions = field.options || []
    onUpdate({ options: [...currentOptions, newOption.trim()] })
    setNewOption("")
  }

  function removeOption(index: number) {
    const currentOptions = field.options || []
    onUpdate({ options: currentOptions.filter((_, i) => i !== index) })
  }

  function updateValidation(key: string, value: any) {
    onUpdate({
      validation: {
        ...field.validation,
        [key]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="label">Текст вопроса</Label>
          <Input
            id="label"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Введите текст вопроса"
          />
        </div>

        <div>
          <Label htmlFor="description">Описание (опционально)</Label>
          <Textarea
            id="description"
            value={field.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Добавьте дополнительное описание"
            rows={2}
          />
        </div>

        {!hasOptions && (
          <div>
            <Label htmlFor="placeholder">Подсказка</Label>
            <Input
              id="placeholder"
              value={field.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="Текст подсказки"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Options for select/radio/checkbox */}
      {hasOptions && (
        <>
          <div className="space-y-4">
            <Label>Варианты ответа</Label>

            <div className="space-y-2">
              {(field.options || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={option} disabled className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeOption(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Новый вариант"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addOption()
                  }
                }}
              />
              <Button onClick={addOption} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />
        </>
      )}

      {/* Validation */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Валидация</h3>

        <div className="flex items-center justify-between">
          <Label htmlFor="required">Обязательное поле</Label>
          <Switch
            id="required"
            checked={field.validation?.required || false}
            onCheckedChange={(checked) => updateValidation("required", checked)}
          />
        </div>

        {field.type === "text" || field.type === "textarea" ? (
          <>
            <div>
              <Label htmlFor="minLength">Минимальная длина</Label>
              <Input
                id="minLength"
                type="number"
                value={field.validation?.minLength || ""}
                onChange={(e) => updateValidation("minLength", Number.parseInt(e.target.value) || undefined)}
                placeholder="Не установлено"
              />
            </div>

            <div>
              <Label htmlFor="maxLength">Максимальная длина</Label>
              <Input
                id="maxLength"
                type="number"
                value={field.validation?.maxLength || ""}
                onChange={(e) => updateValidation("maxLength", Number.parseInt(e.target.value) || undefined)}
                placeholder="Не установлено"
              />
            </div>
          </>
        ) : null}

        {field.type === "number" || field.type === "slider" ? (
          <>
            <div>
              <Label htmlFor="min">Минимальное значение</Label>
              <Input
                id="min"
                type="number"
                value={field.validation?.min || ""}
                onChange={(e) => updateValidation("min", Number.parseInt(e.target.value) || undefined)}
                placeholder="Не установлено"
              />
            </div>

            <div>
              <Label htmlFor="max">Максимальное значение</Label>
              <Input
                id="max"
                type="number"
                value={field.validation?.max || ""}
                onChange={(e) => updateValidation("max", Number.parseInt(e.target.value) || undefined)}
                placeholder="Не установлено"
              />
            </div>
          </>
        ) : null}

        {field.type === "text" && (
          <div>
            <Label htmlFor="pattern">Регулярное выражение (pattern)</Label>
            <Input
              id="pattern"
              value={field.validation?.pattern || ""}
              onChange={(e) => updateValidation("pattern", e.target.value)}
              placeholder="Например: [0-9]{3}-[0-9]{2}-[0-9]{2}"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Дополнительно</h3>

        {field.type !== "matrix" && (
          <div>
            <Label htmlFor="score">Баллы за ответ (для квизов)</Label>
            <Input
              id="score"
              type="number"
              value={field.settings?.score || ""}
              onChange={(e) =>
                onUpdate({
                  settings: {
                    ...field.settings,
                    score: Number.parseInt(e.target.value) || undefined,
                  },
                })
              }
              placeholder="0"
            />
            <p className="mt-1 text-xs text-muted-foreground">Используется в режиме квиза для подсчета результатов</p>
          </div>
        )}
      </div>
    </div>
  )
}
