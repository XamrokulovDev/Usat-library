import { type JSX, useState, useEffect } from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: JSX.Element
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading")

  useEffect(() => {
    const checkAuthentication = () => {
      try {
        const token = localStorage.getItem("token")

        if (token && token.trim() !== "" && token !== "null" && token !== "undefined") {
          setAuthState("authenticated")
        } else {
          console.log("Token topilmadi, signin sahifasiga yo'naltirish")
          setAuthState("unauthenticated")
        }
      } catch (error) {
        console.error("Authentication tekshirishda xatolik:", error)
        setAuthState("unauthenticated")
      }
    }

    const timer = setTimeout(checkAuthentication, 100)

    return () => clearTimeout(timer)
  }, [])

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Sahifa yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (authState === "unauthenticated") {
    return <Navigate to="/signin" replace />
  }

  return children
}

export default ProtectedRoute;