import axios from "axios"
import { BookOpen, ChevronDown } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { message as antdMessage } from "antd"

interface PermissionType {
  id: string
  group_id: string
  permission_id: string
  permissionInfo: {
    id: string
    code_name: string
  }
}

interface BookType {
  id: string
  name: string
  year: number
  page: number
  books: string
}

interface LanguageType {
  id: string
  name: string
}

interface AlphabetType {
  id: string
  name: string
}

interface StatusType {
  id: string
  name: string
}

interface CategoryType {
  id: string
  name: string
}

const BookItem = () => {
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [books, setBooks] = useState<BookType[]>([])
  const [languages, setLanguages] = useState<LanguageType[]>([])
  const [alphabets, setAlphabets] = useState<AlphabetType[]>([])
  const [statuses, setStatuses] = useState<StatusType[]>([])
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [selectedBookId, setSelectedBookId] = useState<string>("")
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("")
  const [selectedAlphabetId, setSelectedAlphabetId] = useState<string>("")
  const [selectedStatusId, setSelectedStatusId] = useState<string>("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")

  const [bookSearchTerm, setBookSearchTerm] = useState<string>("")
  const [languageSearchTerm, setLanguageSearchTerm] = useState<string>("")
  const [alphabetSearchTerm, setAlphabetSearchTerm] = useState<string>("")
  const [statusSearchTerm, setStatusSearchTerm] = useState<string>("")
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("")

  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState<boolean>(false)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState<boolean>(false)
  const [isAlphabetDropdownOpen, setIsAlphabetDropdownOpen] = useState<boolean>(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<boolean>(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false)

  const bookDropdownRef = useRef<HTMLDivElement>(null)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const alphabetDropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  const fetchPermission = async () => {
    const token = localStorage.getItem("token")
    setLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setUserGroup(response.data.data)
    } catch (err) {
      console.error("❌ Permission olishda xatolik:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get<{ data: BookType[] }>(`${import.meta.env.VITE_API}/api/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setBooks(response.data.data)
    } catch (error) {
      console.error("❌ Kitoblarni olishda xatolik:", error)
    }
  }

  const fetchLanguages = async () => {
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/languages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setLanguages(response.data.data)
    } catch (err) {
      console.error("❌ Tillarni olishda xatolik:", err)
    }
  }

  const fetchAlphabets = async () => {
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/alphabet`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setAlphabets(response.data.data)
    } catch (err) {
      console.error("❌ Alifboni olishda xatolik:", err)
    }
  }

  const fetchStatuses = async () => {
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setStatuses(response.data.data)
    } catch (err) {
      console.error("❌ Statusni olishda xatolik:", err)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setCategories(response.data.data)
    } catch (err) {
      console.error("❌ Kategoriyalarni olishda xatolik:", err)
    }
  }

  useEffect(() => {
    fetchPermission()
  }, [])

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchBooks()
      fetchLanguages()
      fetchAlphabets()
      fetchStatuses()
      fetchCategories()
    }
  }, [userGroup])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bookDropdownRef.current && !bookDropdownRef.current.contains(event.target as Node)) {
        setIsBookDropdownOpen(false)
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false)
      }
      if (alphabetDropdownRef.current && !alphabetDropdownRef.current.contains(event.target as Node)) {
        setIsAlphabetDropdownOpen(false)
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false)
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredBooks = books.filter((book) => book.name.toLowerCase().includes(bookSearchTerm.toLowerCase()))

  const filteredLanguages = languages.filter((language) =>
    language.name.toLowerCase().includes(languageSearchTerm.toLowerCase()),
  )

  const filteredAlphabets = alphabets.filter((alphabet) =>
    alphabet.name.toLowerCase().includes(alphabetSearchTerm.toLowerCase()),
  )

  const filteredStatuses = statuses.filter((status) =>
    status.name.toLowerCase().includes(statusSearchTerm.toLowerCase()),
  )

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()),
  )

  const handleBookSelect = (book: BookType) => {
    setSelectedBookId(book.id)
    setBookSearchTerm(book.name)
    setIsBookDropdownOpen(false)
  }

  const handleLanguageSelect = (language: LanguageType) => {
    setSelectedLanguageId(language.id)
    setLanguageSearchTerm(language.name)
    setIsLanguageDropdownOpen(false)
  }

  const handleAlphabetSelect = (alphabet: AlphabetType) => {
    setSelectedAlphabetId(alphabet.id)
    setAlphabetSearchTerm(alphabet.name)
    setIsAlphabetDropdownOpen(false)
  }

  const handleStatusSelect = (status: StatusType) => {
    setSelectedStatusId(status.id)
    setStatusSearchTerm(status.name)
    setIsStatusDropdownOpen(false)
  }

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategoryId(category.id)
    setCategorySearchTerm(category.name)
    setIsCategoryDropdownOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedBookId || !selectedLanguageId || !selectedAlphabetId || !selectedStatusId) {
      antdMessage.warning("Barcha maydonlarni to'ldiring!")
      return
    }

    setSubmitLoading(true)
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const bookItemData = {
        book_id: Number.parseInt(selectedBookId),
        language_id: Number.parseInt(selectedLanguageId),
        alphabet_id: Number.parseInt(selectedAlphabetId),
        status_id: Number.parseInt(selectedStatusId),
        pdf_url: "salom.pdf",
      }

      await axios.post(`${import.meta.env.VITE_API}/api/book-items`, bookItemData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
          "Content-Type": "application/json",
        },
      })

      if (selectedCategoryId) {
        const bookCategoryData = {
          book_id: Number.parseInt(selectedBookId),
          category_id: Number.parseInt(selectedCategoryId),
        }

        await axios.post(`${import.meta.env.VITE_API}/api/book-categories`, bookCategoryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
            "Content-Type": "application/json",
          },
        })
      }

      antdMessage.success("Kitob detallar muvaffaqiyatli bog'landi!")

      setSelectedBookId("")
      setSelectedLanguageId("")
      setSelectedAlphabetId("")
      setSelectedStatusId("")
      setSelectedCategoryId("")
      setBookSearchTerm("")
      setLanguageSearchTerm("")
      setAlphabetSearchTerm("")
      setStatusSearchTerm("")
      setCategorySearchTerm("")
    } catch (error) {
      console.error("Xatolik yuz berdi:", error)
      antdMessage.error("Kitob detallar bog'lanmadi!")
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading && userGroup.length === 0) {
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
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Kitob detallarni bog'lash</h3>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        {/* Book Select */}
        <div className="w-full" ref={bookDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Kitobni tanlang!</label>
          <div className="relative">
            <input
              type="text"
              value={bookSearchTerm}
              onChange={(e) => {
                setBookSearchTerm(e.target.value)
                setIsBookDropdownOpen(true)
                if (!e.target.value) {
                  setSelectedBookId("")
                }
              }}
              onFocus={() => setIsBookDropdownOpen(true)}
              placeholder="Kitobni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isBookDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
            {isBookDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleBookSelect(book)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedBookId === book.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {book.name}
                      {selectedBookId === book.id && <span className="float-right">✓</span>}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Kitob topilmadi</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Language Select */}
        <div className="w-full" ref={languageDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Tilni tanlang!</label>
          <div className="relative">
            <input
              type="text"
              value={languageSearchTerm}
              onChange={(e) => {
                setLanguageSearchTerm(e.target.value)
                setIsLanguageDropdownOpen(true)
                if (!e.target.value) {
                  setSelectedLanguageId("")
                }
              }}
              onFocus={() => setIsLanguageDropdownOpen(true)}
              placeholder="Tilni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isLanguageDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
            {isLanguageDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <div
                      key={language.id}
                      onClick={() => handleLanguageSelect(language)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedLanguageId === language.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {language.name}
                      {selectedLanguageId === language.id && <span className="float-right">✓</span>}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Til topilmadi</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Alphabet Select */}
        <div className="w-full" ref={alphabetDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Alifboni tanlang!</label>
          <div className="relative">
            <input
              type="text"
              value={alphabetSearchTerm}
              onChange={(e) => {
                setAlphabetSearchTerm(e.target.value)
                setIsAlphabetDropdownOpen(true)
                if (!e.target.value) {
                  setSelectedAlphabetId("")
                }
              }}
              onFocus={() => setIsAlphabetDropdownOpen(true)}
              placeholder="Alifboni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsAlphabetDropdownOpen(!isAlphabetDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isAlphabetDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
            {isAlphabetDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredAlphabets.length > 0 ? (
                  filteredAlphabets.map((alphabet) => (
                    <div
                      key={alphabet.id}
                      onClick={() => handleAlphabetSelect(alphabet)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedAlphabetId === alphabet.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {alphabet.name}
                      {selectedAlphabetId === alphabet.id && <span className="float-right">✓</span>}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Alifbo topilmadi</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status Select */}
        <div className="w-full" ref={statusDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Statusni tanlang!</label>
          <div className="relative">
            <input
              type="text"
              value={statusSearchTerm}
              onChange={(e) => {
                setStatusSearchTerm(e.target.value)
                setIsStatusDropdownOpen(true)
                if (!e.target.value) {
                  setSelectedStatusId("")
                }
              }}
              onFocus={() => setIsStatusDropdownOpen(true)}
              placeholder="Statusni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
            {isStatusDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredStatuses.length > 0 ? (
                  filteredStatuses.map((status) => (
                    <div
                      key={status.id}
                      onClick={() => handleStatusSelect(status)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedStatusId === status.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {status.name}
                      {selectedStatusId === status.id && <span className="float-right">✓</span>}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Status topilmadi</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Category Select */}
        <div className="w-full" ref={categoryDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Kategoriyalarni tanlang!</label>
          <div className="relative">
            <input
              type="text"
              value={categorySearchTerm}
              onChange={(e) => {
                setCategorySearchTerm(e.target.value)
                setIsCategoryDropdownOpen(true)
                if (!e.target.value) {
                  setSelectedCategoryId("")
                }
              }}
              onFocus={() => setIsCategoryDropdownOpen(true)}
              placeholder="Kategoriyalarni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
            {isCategoryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedCategoryId === category.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {category.name}
                      {selectedCategoryId === category.id && <span className="float-right">✓</span>}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Kategoriya topilmadi</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitLoading ? "Yuborilmoqda..." : "Bog'lash"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookItem;