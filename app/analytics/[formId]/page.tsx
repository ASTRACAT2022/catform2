import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params

  return <AnalyticsDashboard formId={formId} />
}
