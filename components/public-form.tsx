"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { CheckCircle2, Loader2 } from "lucide-react"
import { PublicFormField } from "./public-form/field"
import type { FormWithFields } from "@/lib/types"

interface PublicFormProps {
  form: FormWithFields
}

export function PublicForm({ form }: PublicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime] = useState(Date.now())
  const [currentPage, setCurrentPage] = useState(0)

  // Build validation schema
  const schema = buildValidationSchema(form.fields)
  const formMethods = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
  })

  const { handleSubmit, watch } = formMethods
  const formValues = watch()

  // Calculate progress
  const totalFields = form.fields.filter((f) => f.validation?.required).length
  const filledFields = form.fields.filter((f) => f.validation?.required && formValues[f.id]).length
  const progress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0

  async function onSubmit(data: any) {
    setIsSubmitting(true)

    try {
      const completionTime = Math.floor((Date.now() - startTime) / 1000)

      // Get browser fingerprint
      const fingerprint = await getBrowserFingerprint()

      const answers = form.fields.map((field) => ({
        fieldId: field.id,
        value: data[field.id] || null,
      }))

      const response = await fetch(`/api/forms/${form.id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          metadata: {
            fingerprint,
            completionTime,
            deviceType: getDeviceType(),
            referrer: document.referrer,
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to submit")

      setIsSubmitted(true)

      // Handle redirect
      if (form.settings.redirect?.enabled && form.settings.redirect.url) {
        setTimeout(() => {
          window.location.href = form.settings.redirect!.url!
        }, 2000)
      }
    } catch (error) {
      console.error("[v0] Error submitting form:", error)
      toast.error("Ошибка при отправке формы")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Apply custom theme
  const theme = form.settings.theme || {}
  const style = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
  } as React.CSSProperties

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4" style={style}>
        <Card className="max-w-md p-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold">Спасибо!</h2>
          <p className="mt-2 text-muted-foreground">
            {form.settings.redirect?.message || "Ваш ответ успешно отправлен"}
          </p>
          {form.settings.redirect?.enabled && form.settings.redirect.url && (
            <p className="mt-4 text-sm text-muted-foreground">Перенаправление...</p>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 py-12" style={style}>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">{form.title}</h1>
          {form.description && <p className="mt-2 text-muted-foreground">{form.description}</p>}
        </div>

        {/* Progress Bar */}
        {totalFields > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Прогресс</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mt-2" />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {form.fields.map((field) => (
            <Card key={field.id} className="p-6">
              <PublicFormField field={field} formMethods={formMethods} />
            </Card>
          ))}

          {/* Submit Button */}
          <Card className="p-6">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
              style={{
                backgroundColor: theme.accentColor,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Отправка...
                </>
              ) : (
                "Отправить"
              )}
            </Button>
          </Card>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Создано с помощью{" "}
            <a href="/" className="font-semibold hover:underline">
              CAT FORM
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function buildValidationSchema(fields: any[]) {
  const shape: any = {}

  for (const field of fields) {
    let validator: any

    switch (field.type) {
      case "email":
        validator = z.string().email("Неверный формат email")
        break

      case "number":
        validator = z.coerce.number()
        if (field.validation?.min !== undefined) {
          validator = validator.min(field.validation.min, `Минимум ${field.validation.min}`)
        }
        if (field.validation?.max !== undefined) {
          validator = validator.max(field.validation.max, `Максимум ${field.validation.max}`)
        }
        break

      case "checkbox":
        validator = z.array(z.string())
        break

      case "file":
        validator = z.any()
        break

      default:
        validator = z.string()
        if (field.validation?.minLength) {
          validator = validator.min(field.validation.minLength, `Минимум ${field.validation.minLength} символов`)
        }
        if (field.validation?.maxLength) {
          validator = validator.max(field.validation.maxLength, `Максимум ${field.validation.maxLength} символов`)
        }
        if (field.validation?.pattern) {
          validator = validator.regex(new RegExp(field.validation.pattern), "Неверный формат")
        }
    }

    if (field.validation?.required) {
      shape[field.id] = validator
    } else {
      shape[field.id] = validator.optional()
    }
  }

  return z.object(shape)
}

async function getBrowserFingerprint(): Promise<string> {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (ctx) {
    ctx.textBaseline = "top"
    ctx.font = "14px Arial"
    ctx.fillText("fingerprint", 2, 2)
  }

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    screen.width,
    screen.height,
    screen.colorDepth,
  ].join("|")

  // Simple hash
  let hash = 0
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  return hash.toString(36)
}

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}
