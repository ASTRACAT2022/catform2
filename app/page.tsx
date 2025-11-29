import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Plus, FileText, BarChart3, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold">CF</span>
            </div>
            <span className="text-xl font-bold">CAT FORM</span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Мои формы</Button>
            </Link>
            <Link href="/api/init" target="_blank">
              <Button variant="outline" size="sm">
                Инициализировать БД
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <div className="container py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight">
              Создавайте формы. <br />
              <span className="text-primary">Полностью бесплатно.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              CAT FORM — бесплатный конструктор форм с глубокой аналитикой. Опросы, квизы, анкеты без ограничений и
              подписок.
            </p>

            <div className="mt-10 flex justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Создать форму
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Посмотреть примеры
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="mx-auto mt-24 grid max-w-5xl gap-8 md:grid-cols-3">
            <Card className="p-6">
              <FileText className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">Конструктор форм</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Drag & drop интерфейс с 14+ типами полей. Логика, условия, квиз-режим.
              </p>
            </Card>

            <Card className="p-6">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">Глубокая аналитика</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Real-time дашборд, статистика по странам, устройствам, тепловая карта.
              </p>
            </Card>

            <Card className="p-6">
              <Settings className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">100% бесплатно</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Без лимитов, без подписок. Экспорт в CSV/JSON/XLSX, Telegram интеграция.
              </p>
            </Card>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-24 max-w-4xl rounded-2xl border bg-muted/30 p-12">
            <div className="grid gap-8 text-center md:grid-cols-3">
              <div>
                <div className="text-4xl font-bold">0</div>
                <div className="mt-2 text-sm text-muted-foreground">Форм создано</div>
              </div>
              <div>
                <div className="text-4xl font-bold">0</div>
                <div className="mt-2 text-sm text-muted-foreground">Ответов собрано</div>
              </div>
              <div>
                <div className="text-4xl font-bold">100%</div>
                <div className="mt-2 text-sm text-muted-foreground">Бесплатно</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 CAT FORM by ASTRACAT. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}
