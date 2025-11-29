"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, Trash2 } from "lucide-react"
import type { FormField } from "@/lib/types"
import { FieldPreview } from "./field-preview"

interface FormCanvasProps {
  fields: FormField[]
  selectedFieldId: string | null
  onSelectField: (fieldId: string) => void
  onDeleteField: (fieldId: string) => void
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
}

export function FormCanvas({ fields, selectedFieldId, onSelectField, onDeleteField, onUpdateField }: FormCanvasProps) {
  if (fields.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Перетащите компоненты сюда, чтобы начать создание формы</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <SortableField
          key={field.id}
          field={field}
          isSelected={field.id === selectedFieldId}
          onSelect={() => onSelectField(field.id)}
          onDelete={() => onDeleteField(field.id)}
          onUpdate={(updates) => onUpdateField(field.id, updates)}
        />
      ))}
    </div>
  )
}

function SortableField({
  field,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: {
  field: FormField
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onUpdate: (updates: Partial<FormField>) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`group relative transition-all ${isSelected ? "ring-2 ring-primary" : "hover:border-primary"}`}
        onClick={onSelect}
      >
        <div className="flex items-start gap-2 p-4">
          <button
            className="mt-2 cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <FieldPreview field={field} onUpdate={onUpdate} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
