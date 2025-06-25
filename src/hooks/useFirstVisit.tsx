"use client"

import { useEffect, useState } from "react"

export const useFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false)

  useEffect(() => {
    // SessionStorage dan tekshirish (tab yopilganda o'chadi)
    const hasVisited = sessionStorage.getItem("hasVisited")

    if (!hasVisited) {
      setIsFirstVisit(true)
      sessionStorage.setItem("hasVisited", "true")

      // Birinchi marta kirgan bo'lsa, refresh qilish
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }, [])

  return isFirstVisit
}