import { useEffect, useState } from "react"

export const useFirstVisit = () => {
  const [isFirstVisit, setIsFirstVisit] = useState(false)

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisited")

    if (!hasVisited) {
      setIsFirstVisit(true)
      sessionStorage.setItem("hasVisited", "true")

      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }, [])

  return isFirstVisit
}