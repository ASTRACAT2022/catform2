"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Users, Clock, TrendingUp, Download, RefreshCw } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import type { Form } from "@/lib/types"

interface AnalyticsDashboardProps {
  formId: string
}

export function AnalyticsDashboard({ formId }: AnalyticsDashboardProps) {
  const [form, setForm] = useState<Form | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState("30")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [formId, timeRange])

  async function loadData() {
    setIsLoading(true)
    try {
      const [formRes, analyticsRes, responsesRes] = await Promise.all([
        fetch(`/api/forms/${formId}`),
        fetch(`/api/forms/${formId}/analytics?days=${timeRange}`),
        fetch(`/api/forms/${formId}/responses`),
      ])

      const formData = await formRes.json()
      const analyticsData = await analyticsRes.json()
      const responsesData = await responsesRes.json()

      setForm(formData.form)
      setAnalytics(analyticsData.analytics)
      setResponses(responsesData.responses)
    } catch (error) {
      console.error("[v0] Error loading analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function exportData(format: "csv" | "json") {
    try {
      const data = responses.map((r) => {
        const row: any = {
          id: r.id,
          created_at: new Date(r.created_at * 1000).toISOString(),
          completed: r.completed,
          device_type: r.device_type,
          country: r.country,
        }

        r.answers.forEach((a: any) => {
          const field = form?.fields?.find((f: any) => f.id === a.field_id)
          if (field) {
            row[field.label] = a.value
          }
        })

        return row
      })

      if (format === "csv") {
        const csv = convertToCSV(data)
        downloadFile(csv, `form-${formId}-responses.csv`, "text/csv")
      } else {
        downloadFile(JSON.stringify(data, null, 2), `form-${formId}-responses.json`, "application/json")
      }
    } catch (error) {
      console.error("[v0] Error exporting data:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Загрузка аналитики...</p>
        </div>
      </div>
    )
  }

  const totalViews = form?.view_count || 0
  const totalResponses = form?.response_count || 0
  const conversionRate = totalViews > 0 ? (totalResponses / totalViews) * 100 : 0
  const avgCompletionTime = responses.reduce((acc, r) => acc + (r.completion_time || 0), 0) / (responses.length || 1)

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{form?.title}</h1>
            <p className="text-xs text-muted-foreground">Аналитика</p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 дней</SelectItem>
                <SelectItem value="30">30 дней</SelectItem>
                <SelectItem value="90">90 дней</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-muted/20 p-6">
        <div className="container max-w-7xl space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Просмотры</p>
              </div>
              <p className="mt-2 text-3xl font-bold">{totalViews}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Ответы</p>
              </div>
              <p className="mt-2 text-3xl font-bold">{totalResponses}</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Конверсия</p>
              </div>
              <p className="mt-2 text-3xl font-bold">{conversionRate.toFixed(1)}%</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Среднее время</p>
              </div>
              <p className="mt-2 text-3xl font-bold">{Math.round(avgCompletionTime)}с</p>
            </Card>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="responses">Ответы</TabsTrigger>
              <TabsTrigger value="export">Экспорт</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Responses Over Time */}
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Ответы по дням</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.responsesByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Ответов" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Device & Country Breakdown */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">По устройствам</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics?.deviceBreakdown || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => entry.device_type || "unknown"}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(analytics?.deviceBreakdown || []).map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">По странам</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics?.countryBreakdown || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="responses" className="space-y-4">
              {responses.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">Пока нет ответов</p>
                </Card>
              ) : (
                responses.map((response) => (
                  <Card key={response.id} className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Ответ #{response.id.slice(-8)}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(response.created_at * 1000), "dd.MM.yyyy HH:mm")}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{response.device_type || "unknown"}</p>
                        <p>{response.country || "unknown"}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {response.answers.map((answer: any) => {
                        const field = form?.fields?.find((f: any) => f.id === answer.field_id)
                        return (
                          <div key={answer.id}>
                            <p className="text-sm font-medium">{field?.label}</p>
                            <p className="text-sm text-muted-foreground">{JSON.stringify(answer.value)}</p>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="export">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Экспорт данных</h3>
                <p className="mb-6 text-sm text-muted-foreground">Скачайте все ответы в удобном формате</p>

                <div className="flex gap-3">
                  <Button onClick={() => exportData("csv")}>
                    <Download className="mr-2 h-4 w-4" />
                    Скачать CSV
                  </Button>
                  <Button variant="outline" onClick={() => exportData("json")}>
                    <Download className="mr-2 h-4 w-4" />
                    Скачать JSON
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const rows = data.map((row) => headers.map((header) => JSON.stringify(row[header] || "")).join(","))

  return [headers.join(","), ...rows].join("\n")
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
