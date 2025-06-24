import { type JSX, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { Spin } from "antd"

interface ProtectedRouteProps {
  children: JSX.Element
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const token = localStorage.getItem("token")

  useEffect(() => {
    if (!token) {
      const hasRefreshed = sessionStorage.getItem("hasRefreshed")

      if (!hasRefreshed) {
        sessionStorage.setItem("hasRefreshed", "true")

        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setTimeout(() => {
          setIsChecking(false)
          setShouldRedirect(true)
        }, 1000)
      }
    } else {
      sessionStorage.removeItem("hasRefreshed")
      setIsChecking(false)
    }
  }, [token])

  if (isChecking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">{!token ? "Tekshirilmoqda..." : "Yuklanmoqda..."}</p>
        </div>
      </div>
    )
  }

  if (shouldRedirect) {
    return <Navigate to="/signin" replace />
  }

  return children
}

export default ProtectedRoute;