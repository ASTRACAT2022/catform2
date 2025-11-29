import { FormConstructor } from "@/components/form-constructor"

export default async function ConstructorPage({
  params,
}: {
  params: Promise<{ formId: string }>
}) {
  const { formId } = await params

  return <FormConstructor formId={formId} />
}
