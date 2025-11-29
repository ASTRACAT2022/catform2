"use client"

import { useState, useEffect } from "react"
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ComponentPanel } from "./constructor/component-panel"
import { FormCanvas } from "./constructor/form-canvas"
import { FieldSettings } from "./constructor/field-settings"
import { FormSettings as FormSettingsComponent } from "./constructor/form-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Eye, Settings, Layout } from "lucide-react"
import { toast } from "sonner"
import type { FormField, FormWithFields, FieldType } from "@/lib/types"

interface FormConstructorProps {
  formId: string
}

export function FormConstructor({ formId }: FormConstructorProps) {
  const [form, setForm] = useState<FormWithFields | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load form data
  useEffect(() => {
    loadForm()
  }, [formId])

  async function loadForm() {
    try {
      const response = await fetch(`/api/forms/${formId}`)
      if (!response.ok) throw new Error("Failed to load form")

      const data = await response.json()
      setForm(data.form)
      setFields(data.form.fields || [])
    } catch (error) {
      console.error("[v0] Error loading form:", error)
      toast.error("Не удалось загрузить форму")
    } finally {
      setIsLoading(false)
    }
  }

  async function saveForm() {
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form?.title,
          description: form?.description,
          settings: form?.settings,
        }),
      })

      if (!response.ok) throw new Error("Failed to save form")

      toast.success("Форма сохранена")
    } catch (error) {
      console.error("[v0] Error saving form:", error)
      toast.error("Ошибка при сохранении")
    }
  }

  async function addField(type: FieldType) {
    try {
      const position = fields.length

      const response = await fetch(`/api/forms/${formId}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          label: getDefaultLabel(type),
          position,
          validation: {},
          settings: {},
        }),
      })

      if (!response.ok) throw new Error("Failed to add field")

      const data = await response.json()
      setFields([...fields, data.field])
      toast.success("Поле добавлено")
    } catch (error) {
      console.error("[v0] Error adding field:", error)
      toast.error("Ошибка при добавлении поля")
    }
  }

  async function updateField(fieldId: string, updates: Partial<FormField>) {
    try {
      const response = await fetch(`/api/forms/${formId}/fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update field")

      setFields(fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)))
    } catch (error) {
      console.error("[v0] Error updating field:", error)
      toast.error("Ошибка при обновлении поля")
    }
  }

  async function deleteField(fieldId: string) {
    try {
      const response = await fetch(`/api/forms/${formId}/fields/${fieldId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete field")

      setFields(fields.filter((field) => field.id !== fieldId))
      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null)
      }
      toast.success("Поле удалено")
    } catch (error) {
      console.error("[v0] Error deleting field:", error)
      toast.error("Ошибка при удалении поля")
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActiveId(null)
      return
    }

    // Handle adding new field from component panel
    if (active.id.toString().startsWith("component-")) {
      const type = active.id.toString().replace("component-", "") as FieldType
      addField(type)
    } else {
      // Handle reordering existing fields
      const oldIndex = fields.findIndex((f) => f.id === active.id)
      const newIndex = fields.findIndex((f) => f.id === over.id)

      if (oldIndex !== newIndex) {
        const newFields = [...fields]
        const [movedField] = newFields.splice(oldIndex, 1)
        newFields.splice(newIndex, 0, movedField)

        // Update positions
        const updatedFields = newFields.map((field, index) => ({
          ...field,
          position: index,
        }))

        setFields(updatedFields)

        // Update positions in backend
        updatedFields.forEach((field) => {
          updateField(field.id, { position: field.position })
        })
      }
    }

    setActiveId(null)
  }

  function getDefaultLabel(type: FieldType): string {
    const labels: Record<FieldType, string> = {
      text: "Текстовое поле",
      email: "Email",
      number: "Число",
      textarea: "Большое текстовое поле",
      select: "Выпадающий список",
      checkbox: "Флажки",
      radio: "Варианты ответа",
      file: "Загрузка файла",
      date: "Дата",
      time: "Время",
      datetime: "Дата и время",
      slider: "Слайдер",
      rating: "Оценка",
      matrix: "Матрица",
      geolocation: "Геолокация",
    }
    return labels[type] || "Новое поле"
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{form?.title || "Новая форма"}</h1>
          <span className="text-xs text-muted-foreground">
            {fields.length} {fields.length === 1 ? "поле" : "полей"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Предпросмотр
          </Button>
          <Button size="sm" onClick={saveForm}>
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Left Sidebar - Component Panel */}
          <aside className="w-64 border-r bg-muted/30">
            <Tabs defaultValue="components" className="h-full">
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="components" className="flex-1">
                  <Layout className="mr-2 h-4 w-4" />
                  Компоненты
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Настройки
                </TabsTrigger>
              </TabsList>

              <TabsContent value="components" className="m-0 h-[calc(100%-41px)]">
                <ComponentPanel />
              </TabsContent>

              <TabsContent value="settings" className="m-0 h-[calc(100%-41px)] p-4">
                {form && <FormSettingsComponent form={form} onUpdate={(updates) => setForm({ ...form, ...updates })} />}
              </TabsContent>
            </Tabs>
          </aside>

          {/* Center - Form Canvas */}
          <main className="flex-1 overflow-auto bg-muted/20">
            <div className="mx-auto max-w-3xl p-8">
              <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <FormCanvas
                  fields={fields}
                  selectedFieldId={selectedFieldId}
                  onSelectField={setSelectedFieldId}
                  onDeleteField={deleteField}
                  onUpdateField={updateField}
                />
              </SortableContext>
            </div>
          </main>

          {/* Right Sidebar - Field Settings */}
          {selectedField && (
            <aside className="w-80 border-l bg-background">
              <div className="border-b p-4">
                <h2 className="font-semibold">Настройки поля</h2>
                <p className="text-xs text-muted-foreground">{selectedField.type}</p>
              </div>
              <ScrollArea className="h-[calc(100vh-120px)]">
                <div className="p-4">
                  <FieldSettings field={selectedField} onUpdate={(updates) => updateField(selectedField.id, updates)} />
                </div>
              </ScrollArea>
            </aside>
          )}

          <DragOverlay>
            {activeId && (
              <div className="rounded-lg border-2 border-primary bg-background p-4 shadow-lg">Перемещение...</div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
