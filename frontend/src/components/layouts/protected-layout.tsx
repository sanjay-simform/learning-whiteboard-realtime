import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../context/Auth.context"
import DashboardLayoutSkeleton from "../skeleton-loader/dashboard-skeleton-loading"

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return <DashboardLayoutSkeleton />
  }
  if (!user) {
    return <Navigate to="/signin" replace />
  }
  return (
    <>
      <div className="min-h-screen w-full">
        <Outlet />
      </div>
    </>
  )
}
