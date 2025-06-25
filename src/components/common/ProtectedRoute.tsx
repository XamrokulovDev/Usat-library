"use client"

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
        // LocalStorage dan token olish
        const token = localStorage.getItem("token")

        if (token && token.trim() !== "" && token !== "null" && token !== "undefined") {
          console.log("Token topildi, foydalanuvchi autentifikatsiya qilingan")
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

    // Kichik kechikish bilan tekshirish
    const timer = setTimeout(checkAuthentication, 100)

    return () => clearTimeout(timer)
  }, [])

  // Loading holatida
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

  // Token yo'q bo'lsa - signin sahifasiga yo'naltirish
  if (authState === "unauthenticated") {
    return <Navigate to="/signin" replace />
  }

  // Token bor bo'lsa - children komponentlarni ko'rsatish
  return children
}

export default ProtectedRoute;