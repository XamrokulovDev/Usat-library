import type React from "react"
import axios from "axios"
import { BookOpen, ChevronDown } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { Modal, message as antdMessage } from "antd"

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

interface KafedraType {
  id: string
  name: string
}

interface BookItemType {
  id: string
  book_id: number
  language_id: number
  alphabet_id: number
  status_id: number
  kafedra_id: number
  pdf_url: string
  createdAt: string
  updatedAt: string
  book?: {
    id: string
    name: string
  }
  language?: {
    id: string
    name: string
  }
  alphabet?: {
    id: string
    name: string
  }
  status?: {
    id: string
    name: string
  }
  kafedra?: {
    id: string
    name: string
  }
}

const BookItem = () => {
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [books, setBooks] = useState<BookType[]>([])
  const [bookItems, setBookItems] = useState<BookItemType[]>([])
  const [languages, setLanguages] = useState<LanguageType[]>([])
  const [alphabets, setAlphabetType] = useState<AlphabetType[]>([])
  const [statuses, setStatuses] = useState<StatusType[]>([])
  const [kafedras, setKafedras] = useState<KafedraType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [updateLoading, setUpdateLoading] = useState<boolean>(false)

  const [selectedBookId, setSelectedBookId] = useState<string>("")
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("")
  const [selectedAlphabetId, setSelectedAlphabetId] = useState<string>("")
  const [selectedStatusId, setSelectedStatusId] = useState<string>("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [selectedKafedraId, setSelectedKafedraId] = useState<string>("")

  const [bookSearchTerm, setBookSearchTerm] = useState<string>("")
  const [languageSearchTerm, setLanguageSearchTerm] = useState<string>("")
  const [alphabetSearchTerm, setAlphabetSearchTerm] = useState<string>("")
  const [statusSearchTerm, setStatusSearchTerm] = useState<string>("")
  const [kafedraSearchTerm, setKafedraSearchTerm] = useState<string>("")

  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState<boolean>(false)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState<boolean>(false)
  const [isAlphabetDropdownOpen, setIsAlphabetDropdownOpen] = useState<boolean>(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<boolean>(false)
  const [isKafedraDropdownOpen, setIsKafedraDropdownOpen] = useState<boolean>(false)

  const [error, setError] = useState<string | null>(null)
  const [selectedBookItem, setSelectedBookItem] = useState<BookItemType | null>(null)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false)

  const [editBookId, setEditBookId] = useState<string>("")
  const [editLanguageId, setEditLanguageId] = useState<string>("")
  const [editAlphabetId, setEditAlphabetId] = useState<string>("")
  const [editStatusId, setEditStatusId] = useState<string>("")
  const [editKafedraId, setEditKafedraId] = useState<string>("")
  const [editBookSearchTerm, setEditBookSearchTerm] = useState<string>("")
  const [editLanguageSearchTerm, setEditLanguageSearchTerm] = useState<string>("")
  const [editAlphabetSearchTerm, setEditAlphabetSearchTerm] = useState<string>("")
  const [editStatusSearchTerm, setEditStatusSearchTerm] = useState<string>("")
  const [editKafedraSearchTerm, setEditKafedraSearchTerm] = useState<string>("")

  const [isEditBookDropdownOpen, setIsEditBookDropdownOpen] = useState<boolean>(false)
  const [isEditLanguageDropdownOpen, setIsEditLanguageDropdownOpen] = useState<boolean>(false)
  const [isEditAlphabetDropdownOpen, setIsEditAlphabetDropdownOpen] = useState<boolean>(false)
  const [isEditStatusDropdownOpen, setIsEditStatusDropdownOpen] = useState<boolean>(false)
  const [isEditKafedraDropdownOpen, setIsEditKafedraDropdownOpen] = useState<boolean>(false)

  const bookDropdownRef = useRef<HTMLDivElement>(null)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const alphabetDropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const kafedraDropdownRef = useRef<HTMLDivElement>(null)

  const editBookDropdownRef = useRef<HTMLDivElement>(null)
  const editLanguageDropdownRef = useRef<HTMLDivElement>(null)
  const editAlphabetDropdownRef = useRef<HTMLDivElement>(null)
  const editStatusDropdownRef = useRef<HTMLDivElement>(null)
  const editKafedraDropdownRef = useRef<HTMLDivElement>(null)

  const populateBookItems = (items: BookItemType[]): BookItemType[] => {
    return items.map((item) => ({
      ...item,
      book: books.find((book) => book.id === item.book_id.toString()),
      language: languages.find((lang) => lang.id === item.language_id.toString()),
      alphabet: alphabets.find((alpha) => alpha.id === item.alphabet_id.toString()),
      status: statuses.find((status) => status.id === item.status_id.toString()),
      kafedra: kafedras.find((kafedra) => kafedra.id === item.kafedra_id.toString()),
    }))
  }

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
      setBooks(response.data.data);
    } catch (error) {
      console.error("❌ Kitoblarni olishda xatolik:", error)
    }
  }

  const fetchBookItems = async () => {
    setError(null)
    setFetchLoading(true)
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/book-items`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })

      const rawBookItems = response.data.data;
      
      if (
        books.length > 0 &&
        languages.length > 0 &&
        alphabets.length > 0 &&
        statuses.length > 0 &&
        kafedras.length > 0
      ) {
        const populatedItems = populateBookItems(rawBookItems)
        setBookItems(populatedItems)
      } else {
        setBookItems(rawBookItems)
      }
    } catch (err) {
      console.error("Kitob detallarni olishda xatolik:", err)
      setError("Kitob detallarni olishda xatolik yuz berdi.")
    } finally {
      setFetchLoading(false)
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
      setAlphabetType(response.data.data)
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

  const fetchKafedras = async () => {
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/kafedra`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setKafedras(response.data.data)
    } catch (err) {
      console.error("❌ Kafedralarni olishda xatolik:", err)
    }
  }

  useEffect(() => {
    fetchPermission()
  }, [])

  useEffect(() => {
    if (userGroup.length > 0) {
      const fetchAllData = async () => {
        await Promise.all([fetchBooks(), fetchLanguages(), fetchAlphabets(), fetchStatuses(), fetchKafedras()])
      }
      fetchAllData()
    }
  }, [userGroup])

  useEffect(() => {
    if (
      books.length > 0 &&
      languages.length > 0 &&
      alphabets.length > 0 &&
      statuses.length > 0 &&
      kafedras.length > 0
    ) {
      fetchBookItems()
    }
  }, [books, languages, alphabets, statuses, kafedras])

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
      if (kafedraDropdownRef.current && !kafedraDropdownRef.current.contains(event.target as Node)) {
        setIsKafedraDropdownOpen(false)
      }

      if (editBookDropdownRef.current && !editBookDropdownRef.current.contains(event.target as Node)) {
        setIsEditBookDropdownOpen(false)
      }
      if (editLanguageDropdownRef.current && !editLanguageDropdownRef.current.contains(event.target as Node)) {
        setIsEditLanguageDropdownOpen(false)
      }
      if (editAlphabetDropdownRef.current && !editAlphabetDropdownRef.current.contains(event.target as Node)) {
        setIsEditAlphabetDropdownOpen(false)
      }
      if (editStatusDropdownRef.current && !editStatusDropdownRef.current.contains(event.target as Node)) {
        setIsEditStatusDropdownOpen(false)
      }
      if (editKafedraDropdownRef.current && !editKafedraDropdownRef.current.contains(event.target as Node)) {
        setIsEditKafedraDropdownOpen(false)
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
  const filteredKafedras = kafedras.filter((kafedra) =>
    kafedra.name.toLowerCase().includes(kafedraSearchTerm.toLowerCase()),
  )

  const editFilteredBooks = books.filter((book) => book.name.toLowerCase().includes(editBookSearchTerm.toLowerCase()))
  const editFilteredLanguages = languages.filter((language) =>
    language.name.toLowerCase().includes(editLanguageSearchTerm.toLowerCase()),
  )
  const editFilteredAlphabets = alphabets.filter((alphabet) =>
    alphabet.name.toLowerCase().includes(editAlphabetSearchTerm.toLowerCase()),
  )
  const editFilteredStatuses = statuses.filter((status) =>
    status.name.toLowerCase().includes(editStatusSearchTerm.toLowerCase()),
  )
  const editFilteredKafedras = kafedras.filter((kafedra) =>
    kafedra.name.toLowerCase().includes(editKafedraSearchTerm.toLowerCase()),
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

  const handleKafedraSelect = (kafedra: KafedraType) => {
    setSelectedKafedraId(kafedra.id)
    setKafedraSearchTerm(kafedra.name)
    setIsKafedraDropdownOpen(false)
  }

  const handleEditBookSelect = (book: BookType) => {
    setEditBookId(book.id)
    setEditBookSearchTerm(book.name)
    setIsEditBookDropdownOpen(false)
  }

  const handleEditLanguageSelect = (language: LanguageType) => {
    setEditLanguageId(language.id)
    setEditLanguageSearchTerm(language.name)
    setIsEditLanguageDropdownOpen(false)
  }

  const handleEditAlphabetSelect = (alphabet: AlphabetType) => {
    setEditAlphabetId(alphabet.id)
    setEditAlphabetSearchTerm(alphabet.name)
    setIsEditAlphabetDropdownOpen(false)
  }

  const handleEditStatusSelect = (status: StatusType) => {
    setEditStatusId(status.id)
    setEditStatusSearchTerm(status.name)
    setIsEditStatusDropdownOpen(false)
  }

  const handleEditKafedraSelect = (kafedra: KafedraType) => {
    setEditKafedraId(kafedra.id)
    setEditKafedraSearchTerm(kafedra.name)
    setIsEditKafedraDropdownOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedBookId || !selectedLanguageId || !selectedAlphabetId || !selectedStatusId) {
      antdMessage.warning("Barcha majburiy maydonlarni to'ldiring!")
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
        kafedra_id: Number.parseInt(selectedKafedraId),
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
      setSelectedKafedraId("")
      setBookSearchTerm("")
      setLanguageSearchTerm("")
      setAlphabetSearchTerm("")
      setStatusSearchTerm("")
      setKafedraSearchTerm("")

      await fetchBookItems()
    } catch (error) {
      console.error("Xatolik yuz berdi:", error)
      antdMessage.error("Kitob detallar bog'lanmadi!")
    } finally {
      setSubmitLoading(false)
    }
  }

  const showUpdateModal = (bookItem: BookItemType) => {
    setSelectedBookItem(bookItem)
    setEditBookId(bookItem.book_id.toString())
    setEditLanguageId(bookItem.language_id.toString())
    setEditAlphabetId(bookItem.alphabet_id.toString())
    setEditStatusId(bookItem.status_id.toString())
    setEditKafedraId(bookItem.kafedra_id.toString())
    setEditBookSearchTerm(bookItem.book?.name || "")
    setEditLanguageSearchTerm(bookItem.language?.name || "")
    setEditAlphabetSearchTerm(bookItem.alphabet?.name || "")
    setEditStatusSearchTerm(bookItem.status?.name || "")
    setEditKafedraSearchTerm(bookItem.kafedra?.name || "")
    setIsUpdateModalVisible(true)
  }

  const handleUpdateOk = async () => {
    setUpdateLoading(true)
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const updateData = {
        book_id: Number.parseInt(editBookId),
        language_id: Number.parseInt(editLanguageId),
        alphabet_id: Number.parseInt(editAlphabetId),
        status_id: Number.parseInt(editStatusId),
        kafedra_id: Number.parseInt(editKafedraId),
        pdf_url: "salom.pdf",
      }

      await axios.put(`${import.meta.env.VITE_API}/api/book-items/${selectedBookItem?.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })

      setIsUpdateModalVisible(false)
      setSelectedBookItem(null)
      fetchBookItems()
      antdMessage.success("Kitob detallar muvaffaqiyatli yangilandi!")
    } catch (error) {
      console.error("Yangilashda xatolik yuz berdi:", error)
      antdMessage.error("Yangilashda xatolik yuz berdi!")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false)
    setSelectedBookItem(null)
  }

  const showDeleteModal = (bookItem: BookItemType) => {
    setSelectedBookItem(bookItem)
    setIsDeleteModalVisible(true)
  }

  const handleDeleteOk = async () => {
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      await axios.delete(`${import.meta.env.VITE_API}/api/book-items/${selectedBookItem?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })

      setIsDeleteModalVisible(false)
      setSelectedBookItem(null)
      fetchBookItems()
      antdMessage.success("Kitob detallar muvaffaqiyatli o'chirildi!")
    } catch (error) {
      console.error("O'chirishda xatolik yuz berdi:", error)
      antdMessage.error("O'chirishda xatolik yuz berdi!")
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setSelectedBookItem(null)
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
    <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Kitob detallarni bog'lash</h3>
      </div>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6 mt-6 mb-8">
        {/* Book Select */}
        <div className="w-full" ref={bookDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Kitobni tanlang! *</label>
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
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Tilni tanlang! *</label>
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
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Alifboni tanlang! *</label>
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
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Statusni tanlang! *</label>
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
        {/* Kafedra Select */}
        <div className="w-full" ref={kafedraDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Kafedralarni tanlang!</label>
          <div className="relative">
            <input
              type="text"
              value={kafedraSearchTerm}
              onChange={(e) => {
                setKafedraSearchTerm(e.target.value)
                setIsKafedraDropdownOpen(true)
                if (!e.target.value) {
                  setSelectedKafedraId("")
                }
              }}
              onFocus={() => setIsKafedraDropdownOpen(true)}
              placeholder="Kafedralarni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsKafedraDropdownOpen(!isKafedraDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${isKafedraDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
            {isKafedraDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredKafedras.length > 0 ? (
                  filteredKafedras.map((kafedra) => (
                    <div
                      key={kafedra.id}
                      onClick={() => handleKafedraSelect(kafedra)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedKafedraId === kafedra.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {kafedra.name}
                      {selectedKafedraId === kafedra.id && <span className="float-right">✓</span>}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Kafedra topilmadi</div>
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
      {/* Book Items List */}
      <div className="space-y-6 mt-15 my-4">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {bookItems.length === 0 ? "Kitob detallari yo'q!" : "Barcha kitob detallari"}
          </h4>
        </div>
        {fetchLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : bookItems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Ma'lumotlar mavjud emas!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    #
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Kitob nomi
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Til
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Alifbo
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Status
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Kafedra
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-gray-800 dark:text-white">
                    Yangilash
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-gray-800 dark:text-white">
                    O'chirish
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookItems.map((bookItem, index) => (
                  <tr key={bookItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.book?.name || "N/A"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.language?.name || "N/A"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.alphabet?.name || "N/A"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.status?.name || "N/A"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.kafedra?.name || "N/A"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                      <button
                        className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md transition-all duration-300"
                        onClick={() => showUpdateModal(bookItem)}
                      >
                        Yangilash
                      </button>
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                      <button
                        className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md transition-all duration-300"
                        onClick={() => showDeleteModal(bookItem)}
                      >
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* UPDATE MODAL */}
      <Modal
        title="Kitob detallarni tahrirlash"
        open={isUpdateModalVisible}
        onOk={handleUpdateOk}
        onCancel={handleUpdateCancel}
        okText={updateLoading ? "Yangilanmoqda..." : "Yangilash"}
        confirmLoading={updateLoading}
        width={900}
      >
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Edit Book Select */}
          <div className="w-full" ref={editBookDropdownRef}>
            <label className="block font-medium text-gray-700 mb-2">Kitobni tanlang! *</label>
            <div className="relative">
              <input
                type="text"
                value={editBookSearchTerm}
                onChange={(e) => {
                  setEditBookSearchTerm(e.target.value)
                  setIsEditBookDropdownOpen(true)
                  if (!e.target.value) {
                    setEditBookId("")
                  }
                }}
                onFocus={() => setIsEditBookDropdownOpen(true)}
                placeholder="Kitobni tanlang!"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                autoComplete="off"
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setIsEditBookDropdownOpen(!isEditBookDropdownOpen)}
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isEditBookDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isEditBookDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {editFilteredBooks.length > 0 ? (
                    editFilteredBooks.map((book) => (
                      <div
                        key={book.id}
                        onClick={() => handleEditBookSelect(book)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                          editBookId === book.id ? "bg-blue-50 text-blue-900" : ""
                        }`}
                      >
                        {book.name}
                        {editBookId === book.id && <span className="float-right">✓</span>}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">Kitob topilmadi</div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Edit Language Select */}
          <div className="w-full" ref={editLanguageDropdownRef}>
            <label className="block font-medium text-gray-700 mb-2">Tilni tanlang! *</label>
            <div className="relative">
              <input
                type="text"
                value={editLanguageSearchTerm}
                onChange={(e) => {
                  setEditLanguageSearchTerm(e.target.value)
                  setIsEditLanguageDropdownOpen(true)
                  if (!e.target.value) {
                    setEditLanguageId("")
                  }
                }}
                onFocus={() => setIsEditLanguageDropdownOpen(true)}
                placeholder="Tilni tanlang!"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                autoComplete="off"
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setIsEditLanguageDropdownOpen(!isEditLanguageDropdownOpen)}
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isEditLanguageDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isEditLanguageDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {editFilteredLanguages.length > 0 ? (
                    editFilteredLanguages.map((language) => (
                      <div
                        key={language.id}
                        onClick={() => handleEditLanguageSelect(language)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                          editLanguageId === language.id ? "bg-blue-50 text-blue-900" : ""
                        }`}
                      >
                        {language.name}
                        {editLanguageId === language.id && <span className="float-right">✓</span>}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">Til topilmadi</div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Edit Alphabet Select */}
          <div className="w-full" ref={editAlphabetDropdownRef}>
            <label className="block font-medium text-gray-700 mb-2">Alifboni tanlang! *</label>
            <div className="relative">
              <input
                type="text"
                value={editAlphabetSearchTerm}
                onChange={(e) => {
                  setEditAlphabetSearchTerm(e.target.value)
                  setIsEditAlphabetDropdownOpen(true)
                  if (!e.target.value) {
                    setEditAlphabetId("")
                  }
                }}
                onFocus={() => setIsEditAlphabetDropdownOpen(true)}
                placeholder="Alifboni tanlang!"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                autoComplete="off"
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setIsEditAlphabetDropdownOpen(!isEditAlphabetDropdownOpen)}
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isEditAlphabetDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isEditAlphabetDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {editFilteredAlphabets.length > 0 ? (
                    editFilteredAlphabets.map((alphabet) => (
                      <div
                        key={alphabet.id}
                        onClick={() => handleEditAlphabetSelect(alphabet)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                          editAlphabetId === alphabet.id ? "bg-blue-50 text-blue-900" : ""
                        }`}
                      >
                        {alphabet.name}
                        {editAlphabetId === alphabet.id && <span className="float-right">✓</span>}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">Alifbo topilmadi</div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Edit Status Select */}
          <div className="w-full" ref={editStatusDropdownRef}>
            <label className="block font-medium text-gray-700 mb-2">Statusni tanlang! *</label>
            <div className="relative">
              <input
                type="text"
                value={editStatusSearchTerm}
                onChange={(e) => {
                  setEditStatusSearchTerm(e.target.value)
                  setIsEditStatusDropdownOpen(true)
                  if (!e.target.value) {
                    setEditStatusId("")
                  }
                }}
                onFocus={() => setIsEditStatusDropdownOpen(true)}
                placeholder="Statusni tanlang!"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                autoComplete="off"
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setIsEditStatusDropdownOpen(!isEditStatusDropdownOpen)}
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isEditStatusDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isEditStatusDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {editFilteredStatuses.length > 0 ? (
                    editFilteredStatuses.map((status) => (
                      <div
                        key={status.id}
                        onClick={() => handleEditStatusSelect(status)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                          editStatusId === status.id ? "bg-blue-50 text-blue-900" : ""
                        }`}
                      >
                        {status.name}
                        {editStatusId === status.id && <span className="float-right">✓</span>}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">Status topilmadi</div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Edit Kafedra Select */}
          <div className="w-full md:col-span-2" ref={editKafedraDropdownRef}>
            <label className="block font-medium text-gray-700 mb-2">Kafedralarni tanlang!</label>
            <div className="relative">
              <input
                type="text"
                value={editKafedraSearchTerm}
                onChange={(e) => {
                  setEditKafedraSearchTerm(e.target.value)
                  setIsEditKafedraDropdownOpen(true)
                  if (!e.target.value) {
                    setEditKafedraId("")
                  }
                }}
                onFocus={() => setIsEditKafedraDropdownOpen(true)}
                placeholder="Kafedralarni tanlang!"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                autoComplete="off"
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setIsEditKafedraDropdownOpen(!isEditKafedraDropdownOpen)}
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isEditKafedraDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isEditKafedraDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {editFilteredKafedras.length > 0 ? (
                    editFilteredKafedras.map((kafedra) => (
                      <div
                        key={kafedra.id}
                        onClick={() => handleEditKafedraSelect(kafedra)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                          editKafedraId === kafedra.id ? "bg-blue-50 text-blue-900" : ""
                        }`}
                      >
                        {kafedra.name}
                        {editKafedraId === kafedra.id && <span className="float-right">✓</span>}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">Kafedra topilmadi</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
      {/* DELETE MODAL */}
      <Modal
        title="Kitob detallarni o'chirish"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="Ha, o'chirish"
        cancelText="Bekor qilish"
      >
        <p>"{selectedBookItem?.book?.name || "Bu kitob"}" detallarini o'chirishga ishonchingiz komilmi?</p>
      </Modal>
    </div>
  )
}

export default BookItem;