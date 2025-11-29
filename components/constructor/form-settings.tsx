"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Form, FormSettings as FormSettingsType } from "@/lib/types"

interface FormSettingsProps {
  form: Form
  onUpdate: (updates: Partial<Form>) => void
}

export function FormSettings({ form, onUpdate }: FormSettingsProps) {
  function updateSettings(updates: Partial<FormSettingsType>) {
    onUpdate({
      settings: {
        ...form.settings,
        ...updates,
      },
    })
  }

  function updateTheme(key: string, value: string) {
    updateSettings({
      theme: {
        ...form.settings.theme,
        [key]: value,
      },
    })
  }

  function updateLimits(key: string, value: any) {
    updateSettings({
      limits: {
        ...form.settings.limits,
        [key]: value,
      },
    })
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Название формы</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Моя форма"
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={form.description || ""}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Краткое описание формы"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="status">Статус</Label>
            <Select value={form.status} onValueChange={(value: any) => onUpdate({ status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Черновик</SelectItem>
                <SelectItem value="published">Опубликовано</SelectItem>
                <SelectItem value="archived">Архив</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Theme Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Оформление</h3>

          <div>
            <Label htmlFor="bgColor">Цвет фона</Label>
            <Input
              id="bgColor"
              type="color"
              value={form.settings.theme?.backgroundColor || "#ffffff"}
              onChange={(e) => updateTheme("backgroundColor", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="textColor">Цвет текста</Label>
            <Input
              id="textColor"
              type="color"
              value={form.settings.theme?.textColor || "#000000"}
              onChange={(e) => updateTheme("textColor", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="accentColor">Акцентный цвет</Label>
            <Input
              id="accentColor"
              type="color"
              value={form.settings.theme?.accentColor || "#3b82f6"}
              onChange={(e) => updateTheme("accentColor", e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Security & Limits */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Ограничения</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="oneResponse">Один ответ на пользователя</Label>
            <Switch
              id="oneResponse"
              checked={form.settings.limits?.oneResponsePerUser || false}
              onCheckedChange={(checked) => updateLimits("oneResponsePerUser", checked)}
            />
          </div>

          <div>
            <Label htmlFor="maxResponses">Закрыть после N ответов (опционально)</Label>
            <Input
              id="maxResponses"
              type="number"
              value={form.settings.limits?.closeAfterResponses || ""}
              onChange={(e) => updateLimits("closeAfterResponses", Number.parseInt(e.target.value) || undefined)}
              placeholder="Не ограничено"
            />
          </div>

          <div>
            <Label htmlFor="closeDate">Закрыть после даты</Label>
            <Input
              id="closeDate"
              type="datetime-local"
              value={
                form.settings.limits?.closeAfterDate
                  ? new Date(form.settings.limits.closeAfterDate * 1000).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                updateLimits(
                  "closeAfterDate",
                  e.target.value ? Math.floor(new Date(e.target.value).getTime() / 1000) : undefined,
                )
              }
            />
          </div>
        </div>

        <Separator />

        {/* CAPTCHA */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Защита</h3>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="captcha">AstraCAPTCHA</Label>
              <p className="text-xs text-muted-foreground">Защита от спама и роботов</p>
            </div>
            <Switch
              id="captcha"
              checked={form.settings.captcha?.enabled || false}
              onCheckedChange={(checked) =>
                updateSettings({
                  captcha: {
                    ...form.settings.captcha,
                    enabled: checked,
                    provider: "astra",
                  },
                })
              }
            />
          </div>
        </div>

        <Separator />

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Уведомления</h3>

          <div>
            <Label htmlFor="notifyEmail">Email для уведомлений</Label>
            <Input
              id="notifyEmail"
              type="email"
              value={form.settings.notifications?.email || ""}
              onChange={(e) =>
                updateSettings({
                  notifications: {
                    ...form.settings.notifications,
                    email: e.target.value,
                  },
                })
              }
              placeholder="your@email.com"
            />
            <p className="mt-1 text-xs text-muted-foreground">Получать уведомления о новых ответах</p>
          </div>

          <div>
            <Label htmlFor="notifyTelegram">Telegram Bot ID</Label>
            <Input
              id="notifyTelegram"
              value={form.settings.notifications?.telegram || ""}
              onChange={(e) =>
                updateSettings({
                  notifications: {
                    ...form.settings.notifications,
                    telegram: e.target.value,
                  },
                })
              }
              placeholder="@your_bot"
            />
          </div>
        </div>

        <Separator />

        {/* Redirect after submit */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">После отправки</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="redirect">Редирект на URL</Label>
            <Switch
              id="redirect"
              checked={form.settings.redirect?.enabled || false}
              onCheckedChange={(checked) =>
                updateSettings({
                  redirect: {
                    ...form.settings.redirect,
                    enabled: checked,
                  },
                })
              }
            />
          </div>

          {form.settings.redirect?.enabled && (
            <>
              <div>
                <Label htmlFor="redirectUrl">URL для редиректа</Label>
                <Input
                  id="redirectUrl"
                  type="url"
                  value={form.settings.redirect?.url || ""}
                  onChange={(e) =>
                    updateSettings({
                      redirect: {
                        ...form.settings.redirect,
                        url: e.target.value,
                      },
                    })
                  }
                  placeholder="https://example.com/thank-you"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="successMessage">Сообщение об успехе</Label>
            <Textarea
              id="successMessage"
              value={form.settings.redirect?.message || ""}
              onChange={(e) =>
                updateSettings({
                  redirect: {
                    ...form.settings.redirect,
                    message: e.target.value,
                  },
                })
              }
              placeholder="Спасибо за ответ!"
              rows={2}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
