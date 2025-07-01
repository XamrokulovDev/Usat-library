"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { message as antdMessage } from "antd"
import { BookOpen, BookPlus, ChevronDown, Search } from "lucide-react"

interface BookType {
  id: string
  name: string
  year: number
  page: number
  books: string
  auther_id?: number
  book_count: string
}

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
  const [data, setData] = useState<BookType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [tableSearchTerm, setTableSearchTerm] = useState<string>("")
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [editingBookId, setEditingBookId] = useState<string | null>(null)

  // Yangi state - edit qilayotgan kitobning asl ma'lumotlarini saqlash uchun
  const [originalBookData, setOriginalBookData] = useState<BookType | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

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

  const fetchData = async (): Promise<void> => {
    setLoading(true)
    try {
      const token: string | null = localStorage.getItem("token")
      const isRolesStr: string | null = localStorage.getItem("isRoles")
      const isRoles: string[] = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups: PermissionType[] = userGroup.filter((item: PermissionType) =>
        isRoles.includes(item.group_id),
      )
      const permissionIds: string[] = matchedGroups?.map((item: PermissionType) => item.permissionInfo.code_name)
      const response = await axios.get<{ data: BookType[] }>(`${import.meta.env.VITE_API}/api/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setData(response.data.data)
    } catch (error) {
      console.error("Foydalanuvchilarni olishda xatolik:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchAuthers()
      fetchData()
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

  const scrollToForm = (): void => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleEditBook = (book: BookType): void => {
    // Asl kitob ma'lumotlarini saqlash
    setOriginalBookData(book)

    setBookName(book.name)
    setYear(book.year.toString())
    setPage(book.page.toString())
    setBooks(book.books)
    if (book.auther_id) {
      const selectedAuthor: AutherType | undefined = auther.find((author: AutherType) => author.id === book.auther_id)
      if (selectedAuthor) {
        setSelectedAutherId(selectedAuthor.id.toString())
        setSearchTerm(selectedAuthor.name)
      }
    } else {
      setSelectedAutherId(null)
      setSearchTerm("")
    }
    setIsEditMode(true)
    setEditingBookId(book.id)
    scrollToForm()
  }

  const resetForm = (): void => {
    setBookName("")
    setSelectedAutherId(null)
    setSearchTerm("")
    setYear("")
    setPage("")
    setBooks("")
    setIsEditMode(false)
    setEditingBookId(null)
    setOriginalBookData(null)
  }

  // book_count ni avtomatik hisoblash funksiyasi
  const calculateBookCount = (newBooks: string, originalBooks?: string, originalBookCount?: string): string => {
    if (isEditMode && originalBooks && originalBookCount) {
      // Edit mode: yangi book_count = eski book_count + (yangi books - eski books)
      const newBooksNum = Number(newBooks) || 0
      const originalBooksNum = Number(originalBooks) || 0
      const originalBookCountNum = Number(originalBookCount) || 0

      const difference = newBooksNum - originalBooksNum
      const newBookCount = originalBookCountNum + difference

      return Math.max(0, newBookCount).toString() // Manfiy bo'lmasligi uchun
    } else {
      // Create mode: book_count = books
      return newBooks
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!bookName || !selectedAutherId || !year || !page || !books) {
      antdMessage.warning("Barcha maydonlarni to'ldirish shart!")
      return
    }

    // book_count ni avtomatik hisoblash
    const calculatedBookCount = calculateBookCount(books, originalBookData?.books, originalBookData?.book_count)

    const requestData = {
      name: bookName,
      auther_id: Number(selectedAutherId),
      year: Number(year),
      page: Number(page),
      books: books,
      book_count: calculatedBookCount, // Avtomatik hisoblangan qiymat
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

      if (isEditMode && editingBookId) {
        await axios.put(`${import.meta.env.VITE_API}/api/books/${editingBookId}`, requestData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        })
        antdMessage.success("Kitob muvaffaqiyatli yangilandi!")
      } else {
        await axios.post(`${import.meta.env.VITE_API}/api/books`, requestData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        })
        antdMessage.success("Kitob muvaffaqiyatli qo'shildi!")
      }
      resetForm()
      await fetchData()
    } catch (err) {
      console.error("Kitob bilan ishlashda xatolik:", err)
      antdMessage.error(isEditMode ? "Kitob yangilanmadi!" : "Kitob qo'shishda xatolik yuz berdi.")
    } finally {
      setSubmitLoading(false)
    }
  }

  const filteredBooks: BookType[] = data.filter((item: BookType) =>
    item.name.toLowerCase().includes(tableSearchTerm.toLowerCase()),
  )

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
    <>
      {/* Create/Edit Book Form */}
      <div
        ref={formRef}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6"
      >
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <BookPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {isEditMode ? "Kitobni yangilash" : "Kitob qo'shish"}
            </h3>
          </div>
          {isEditMode && (
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Bekor qilish
            </button>
          )}
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
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                  onClick={handleDropdownToggle}
                >
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </div>
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
                placeholder="100"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed text-white rounded-lg shadow-md transition px-6 py-3 font-medium mb-4"
            >
              {submitLoading ? "Yuborilmoqda..." : isEditMode ? "Yangilash" : "Qo'shish"}
            </button>
          </form>
        )}
      </div>

      {/* Books Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 mt-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Barcha kitoblar</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="search"
              name="search"
              placeholder="Qidiruv..."
              className="w-55 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={tableSearchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTableSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
              </div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">Ma'lumotlar mavjud emas!</p>
            </div>
          ) : (
            <div className="overflow-x-auto mt-15 my-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      #
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Kitob nomi
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Kitob chiqarilgan yil
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Kitob varaqasi
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Kitob soni
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Qolgan kitoblar
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Yangilash
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredBooks.map((item: BookType, index: number) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {item.year}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {item.page}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {item.books}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {item.book_count}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center">
                        <button
                          className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md transition-all duration-300"
                          onClick={() => handleEditBook(item)}
                        >
                          Yangilash
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateBooks;