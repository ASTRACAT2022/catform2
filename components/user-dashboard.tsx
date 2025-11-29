"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreVertical, Edit, BarChart3, Copy, Trash2, FileText, Eye } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"
import type { Form } from "@/lib/types"

export function UserDashboard() {
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newFormTitle, setNewFormTitle] = useState("")
  const [newFormDescription, setNewFormDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadForms()
  }, [])

  async function loadForms() {
    try {
      const response = await fetch("/api/forms")
      if (!response.ok) throw new Error("Failed to load forms")

      const data = await response.json()
      setForms(data.forms)
    } catch (error) {
      console.error("[v0] Error loading forms:", error)
      toast.error("Не удалось загрузить формы")
    } finally {
      setIsLoading(false)
    }
  }

  async function createForm() {
    if (!newFormTitle.trim()) {
      toast.error("Введите название формы")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newFormTitle,
          description: newFormDescription || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to create form")

      const data = await response.json()
      toast.success("Форма создана")

      setShowCreateDialog(false)
      setNewFormTitle("")
      setNewFormDescription("")

      window.location.href = `/constructor/${data.form.id}`
    } catch (error) {
      console.error("[v0] Error creating form:", error)
      toast.error("Ошибка при создании формы")
    } finally {
      setIsCreating(false)
    }
  }

  async function duplicateForm(formId: string) {
    try {
      const response = await fetch(`/api/forms/${formId}`)
      if (!response.ok) throw new Error("Failed to load form")

      const data = await response.json()
      const form = data.form

      const createResponse = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${form.title} (копия)`,
          description: form.description,
        }),
      })

      if (!createResponse.ok) throw new Error("Failed to duplicate form")

      const newFormData = await createResponse.json()
      const newFormId = newFormData.form.id

      for (const field of form.fields) {
        await fetch(`/api/forms/${newFormId}/fields`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: field.type,
            label: field.label,
            description: field.description,
            placeholder: field.placeholder,
            options: field.options,
            validation: field.validation,
            position: field.position,
            settings: field.settings,
          }),
        })
      }

      toast.success("Форма скопирована")
      loadForms()
    } catch (error) {
      console.error("[v0] Error duplicating form:", error)
      toast.error("Ошибка при копировании формы")
    }
  }

  async function deleteForm(formId: string) {
    if (!confirm("Вы уверены, что хотите удалить эту форму?")) return

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete form")

      toast.success("Форма удалена")
      loadForms()
    } catch (error) {
      console.error("[v0] Error deleting form:", error)
      toast.error("Ошибка при удалении формы")
    }
  }

  function copyFormLink(formId: string) {
    const url = `${window.location.origin}/form/${formId}`
    navigator.clipboard.writeText(url)
    toast.success("Ссылка скопирована")
  }

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

  const totalForms = forms.length
  const totalResponses = forms.reduce((acc, f) => acc + f.response_count, 0)
  const totalViews = forms.reduce((acc, f) => acc + f.view_count, 0)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold">CF</span>
            </div>
            <span className="text-xl font-bold">CAT FORM</span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Главная</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-muted/20 p-6">
        <div className="container max-w-7xl space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Всего форм</p>
              </div>
              <p className="mt-2 text-3xl font-bold">{totalForms}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Просмотры</p>
              </div>
              <p className="mt-2 text-3xl font-bold">{totalViews}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Ответы</p>
              </div>
              <p className="mt-2 text-3xl font-bold">{totalResponses}</p>
            </Card>
          </div>

          {/* Forms List */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Мои формы</h2>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Создать форму
            </Button>
          </div>

          {forms.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Пока нет форм</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Создайте свою первую форму, чтобы начать собирать ответы
              </p>
              <Button className="mt-6" onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Создать форму
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {forms.map((form) => (
                <Card key={form.id} className="group relative overflow-hidden p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{form.title}</h3>
                      {form.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{form.description}</p>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/constructor/${form.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/analytics/${form.id}`}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Аналитика
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyFormLink(form.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Копировать ссылку
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateForm(form.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Дублировать
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteForm(form.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={form.status === "published" ? "default" : "secondary"}>
                      {form.status === "published" ? "Опубликовано" : form.status === "draft" ? "Черновик" : "Архив"}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {form.view_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {form.response_count}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Обновлено {format(new Date(form.updated_at * 1000), "dd.MM.yyyy")}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/constructor/${form.id}`} className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </Button>
                    </Link>
                    <Link href={`/form/${form.id}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Form Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новую форму</DialogTitle>
            <DialogDescription>Введите название и описание для вашей новой формы</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название формы</Label>
              <Input
                id="title"
                value={newFormTitle}
                onChange={(e) => setNewFormTitle(e.target.value)}
                placeholder="Моя новая форма"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    createForm()
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание (опционально)</Label>
              <Input
                id="description"
                value={newFormDescription}
                onChange={(e) => setNewFormDescription(e.target.value)}
                placeholder="Краткое описание формы"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Отмена
            </Button>
            <Button onClick={createForm} disabled={isCreating}>
              {isCreating ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
