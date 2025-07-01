import { PieChartIcon } from "lucide-react"
import type React from "react"
interface ComponentCardProps {
  title: string
  children: React.ReactNode
  className?: string
  desc?: string
}

const ComponentCard: React.FC<ComponentCardProps> = ({ title, children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <div className="flex items-center gap-2 px-6 py-5">
        <PieChartIcon className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  )
}

export default ComponentCard;