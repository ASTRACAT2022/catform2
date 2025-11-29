import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Форма не найдена</h1>
        <p className="mt-2 text-sm text-muted-foreground">Эта форма не существует или была удалена</p>
        <Link href="/">
          <Button className="mt-6">Вернуться на главную</Button>
        </Link>
      </Card>
    </div>
  )
}
