"use client"

import { type JSX, useState, useEffect } from "react"
import { Navigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: JSX.Element
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token")

        if (token) {
          // Token mavjudligini va haqiqiyligini tekshirish
          // Agar kerak bo'lsa, bu yerda API chaqiruv ham qilishingiz mumkin
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Loading holatida
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  // Agar autentifikatsiya qilinmagan bo'lsa, redirect qilish
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  // Agar autentifikatsiya qilingan bo'lsa, children ko'rsatish
  return children
}

export default ProtectedRoute;