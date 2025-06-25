import type React from "react"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { message as antdMessage } from "antd"
import { BookPlus, ChevronDown } from "lucide-react"

interface AutherType {
  id: number
  name: string
}

interface PermissionType {
  id: string
  group_id: string
  permission_id: string
  permissionInfo: {
    id: string
    code_name: string
  }
}

const CreateBooks: React.FC = () => {
  const [auther, setAuthers] = useState<AutherType[]>([])
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [selectedAutherId, setSelectedAutherId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [bookName, setBookName] = useState<string>("")
  const [year, setYear] = useState<string>("")
  const [page, setPage] = useState<string>("")
  const [books, setBooks] = useState<string>("")
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchPermission = async (): Promise<void> => {
    const token: string | null = localStorage.getItem("token")
    setFetchLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setUserGroup(response.data.data)
    } catch (err) {
      console.error("Muallifni olishda xatolik:", err)
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    fetchPermission()
  }, [])

  const fetchAuthers = async (): Promise<void> => {
    setFetchLoading(true)
    try {
      const token: string | null = localStorage.getItem("token")

      const isRolesStr: string | null = localStorage.getItem("isRoles")
      const isRoles: string[] = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups: PermissionType[] = userGroup.filter((item: PermissionType) =>
        isRoles.includes(item.group_id),
      )
      const permissionIds: string[] = matchedGroups?.map((item: PermissionType) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/auther`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setAuthers(response.data.data)
    } catch (err) {
      console.error("Autherlarni olishda xatolik:", err)
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchAuthers()
    }
  }, [userGroup])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredAuthers: AutherType[] = auther.filter((author: AutherType) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAutherSelect = (author: AutherType): void => {
    setSelectedAutherId(author.id.toString())
    setSearchTerm(author.name)
    setIsDropdownOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value: string = e.target.value
    setSearchTerm(value)
    setIsDropdownOpen(true)

    if (!value) {
      setSelectedAutherId(null)
    }
  }

  const handleInputFocus = (): void => {
    setIsDropdownOpen(true)
  }

  const handleDropdownToggle = (): void => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!bookName || !selectedAutherId || !year || !page || !books) {
      antdMessage.warning("Barcha maydonlarni to'ldirish shart!")
      return
    }

    const data = {
      name: bookName,
      auther_id: Number(selectedAutherId),
      year: Number(year),
      page: Number(page),
      books: books,
    }

    setSubmitLoading(true)
    try {
      const token: string | null = localStorage.getItem("token")

      const isRolesStr: string | null = localStorage.getItem("isRoles")
      const isRoles: string[] = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups: PermissionType[] = userGroup.filter((item: PermissionType) =>
        isRoles.includes(item.group_id),
      )
      const permissionIds: string[] = matchedGroups?.map((item: PermissionType) => item.permissionInfo.code_name)

      await axios.post(`${import.meta.env.VITE_API}/api/books`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })

      antdMessage.success("Kitob muvaffaqiyatli qo'shildi!")
      setBookName("")
      setSelectedAutherId(null)
      setSearchTerm("")
      setYear("")
      setPage("")
      setBooks("")
    } catch (err) {
      console.error("Kitob qo'shishda xatolik:", err)
      antdMessage.error("Kitob qo'shishda xatolik yuz berdi.")
    } finally {
      setSubmitLoading(false)
    }
  }

  if (fetchLoading && userGroup.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Yuklanmoqda...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex items-center gap-2">
        <BookPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Kitob qo'shish</h3>
      </div>
      {fetchLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 mt-15">
          <div>
            <label htmlFor="book" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kitob nomini kiriting!
            </label>
            <input
              id="book"
              name="name"
              type="text"
              value={bookName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookName(e.target.value)}
              placeholder="Sariq devni minib"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
            />
          </div>
          {/* Searchable Author Select */}
          <div className="w-full" ref={dropdownRef}>
            <label htmlFor="auther" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              Yozuvchini tanlang!
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="auther"
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="Kitob muallifini tanlang!"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
                autoComplete="off"
              />

              {/* Dropdown arrow */}
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={handleDropdownToggle}
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredAuthers.length > 0 ? (
                    filteredAuthers.map((author: AutherType) => (
                      <div
                        key={author.id}
                        onClick={() => handleAutherSelect(author)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                          selectedAutherId === author.id.toString()
                            ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                            : ""
                        }`}
                      >
                        {author.name}
                        {selectedAutherId === author.id.toString() && <span className="float-right">✓</span>}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Yozuvchi topilmadi</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="year" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kitob chiqarilgan yilni kiriting!
            </label>
            <input
              id="year"
              type="number"
              value={year}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(e.target.value)}
              placeholder="2024"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="page" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kitob necha betligini kiriting!
            </label>
            <input
              id="page"
              type="number"
              value={page}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPage(e.target.value)}
              placeholder="256"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="books" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kitob sonini kiriting!
            </label>
            <input
              id="books"
              type="text"
              value={books}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBooks(e.target.value)}
              placeholder="100 ta"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg shadow-md transition px-6 py-3 font-medium"
          >
            {submitLoading ? "Yuborilmoqda..." : "Qo'shish"}
          </button>
        </form>
      )}
    </div>
  )
}

export default CreateBooks;