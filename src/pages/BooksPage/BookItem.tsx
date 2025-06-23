import { BookOpen } from 'lucide-react'

const BookItem = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Kitob detallarni bog'lash</h3>
        </div>
      </div>
    </div>
  )
}

export default BookItem