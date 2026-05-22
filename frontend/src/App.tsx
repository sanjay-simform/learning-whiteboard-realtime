import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "./components/ui/sonner"
import { AuthProvider } from "./context/Auth.context"
import { WSProvider } from "./socket/ws-provider"

const SignInPage = lazy(() => import("./modules/auth/pages/sign-in.page"))
const AuthLayout = lazy(() => import("./modules/auth/layout"))
const ProtectedLayout = lazy(
  () => import("./components/layouts/protected-layout")
)
const HomePage = lazy(() => import("./modules/home/pages/home.page"))
const BoardPage = lazy(() => import("./modules/board/pages/board.page"))

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WSProvider>
          <Toaster />

          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
                Loading...
              </div>
            }
          >
            <Routes>
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/board/:boardId" element={<BoardPage />} />
              </Route>

              <Route element={<AuthLayout />}>
                <Route path="/signin" element={<SignInPage />} />
              </Route>
            </Routes>
          </Suspense>
        </WSProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
