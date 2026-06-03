import { toast } from "sonner"
import { useLogin } from "../../../api-client/service/auth/auth.service"
import { LoginForm, type LoginFormData } from "../components/login-form"
import { useAuth } from "../../../context/Auth.context"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function SignInPage() {
  const loginMutation = useLogin()
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (data: LoginFormData) => {
    setError(null)
    const response = await loginMutation.mutateAsync(data)
    if (response.error) {
      setError(response.error.message)
      toast.error(response.error.message, {
        position: "top-center",
      })
      return
    }

    setUser(response.data.user)
    localStorage.setItem("access_token", response.data.token)
    localStorage.setItem("lastUsername", data.username)
    navigate("/")
  }
  return (
    <LoginForm
      onSubmit={handleLogin}
      isLoading={loginMutation.isPending}
      error={error}
    />
  )
}
