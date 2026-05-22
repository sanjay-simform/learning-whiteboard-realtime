import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { getProfileApi } from "../api-client/service/profile/profile.service"
export interface AuthUser {
  id: number
  username: string
}

export interface AuthContextType {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = () => {
    setUser(null)
    localStorage.removeItem("access_token")
  }
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          setIsLoading(false)
          return
        }
        const response = await getProfileApi()
        if (response.error || !response.data) {
          logout()
        } else {
          setUser(response.data)
        }
      } catch {
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    bootstrapAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
