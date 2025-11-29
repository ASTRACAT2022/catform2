import { PublicForm } from "@/components/public-form"
import { getFormWithFields } from "@/lib/db-helpers"
import { notFound } from "next/navigation"

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params
  const form = getFormWithFields(formId)

  if (!form || form.status !== "published") {
    notFound()
  }

  // Increment view count
  const db = (await import("@/lib/db")).default
  db.prepare("UPDATE forms SET view_count = view_count + 1 WHERE id = ?").run(formId)

  return <PublicForm form={form} />
}
