import { Link } from "react-router-dom"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card"

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Board List</h1>

          <Link to="/board/1">
            <Card className="mb-4 hover:bg-accent">
              <CardHeader>
                <CardTitle>Board 1</CardTitle>
                <CardDescription>A board of people</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link to="/board/2">
            <Card className="mb-4 hover:bg-accent">
              <CardHeader>
                <CardTitle>Board 2</CardTitle>
                <CardDescription>A board of people</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
