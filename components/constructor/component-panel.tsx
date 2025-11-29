"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Type,
  Mail,
  Hash,
  ListOrdered,
  CheckSquare,
  Circle,
  Upload,
  Calendar,
  Clock,
  Sliders,
  Star,
  Table,
  MapPin,
  AlignLeft,
} from "lucide-react"
import type { FieldType } from "@/lib/types"

const components: Array<{
  type: FieldType
  label: string
  icon: React.ElementType
  category: string
}> = [
  { type: "text", label: "Текст", icon: Type, category: "Основные" },
  { type: "email", label: "Email", icon: Mail, category: "Основные" },
  { type: "number", label: "Число", icon: Hash, category: "Основные" },
  { type: "textarea", label: "Большой текст", icon: AlignLeft, category: "Основные" },
  { type: "select", label: "Список", icon: ListOrdered, category: "Выбор" },
  { type: "radio", label: "Вариант", icon: Circle, category: "Выбор" },
  { type: "checkbox", label: "Флажки", icon: CheckSquare, category: "Выбор" },
  { type: "date", label: "Дата", icon: Calendar, category: "Дата и время" },
  { type: "time", label: "Время", icon: Clock, category: "Дата и время" },
  { type: "slider", label: "Слайдер", icon: Sliders, category: "Специальные" },
  { type: "rating", label: "Оценка", icon: Star, category: "Специальные" },
  { type: "file", label: "Файл", icon: Upload, category: "Специальные" },
  { type: "matrix", label: "Матрица", icon: Table, category: "Специальные" },
  { type: "geolocation", label: "Геолокация", icon: MapPin, category: "Специальные" },
]

const categories = ["Основные", "Выбор", "Дата и время", "Специальные"]

function DraggableComponent({
  type,
  label,
  icon: Icon,
}: {
  type: FieldType
  label: string
  icon: React.ElementType
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-${type}`,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex cursor-grab items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:border-primary hover:bg-accent ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

export function ComponentPanel() {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category}</h3>
            <div className="space-y-2">
              {components
                .filter((c) => c.category === category)
                .map((component) => (
                  <DraggableComponent key={component.type} {...component} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
