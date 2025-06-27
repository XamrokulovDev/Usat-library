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

interface CategoryType {
  id: string
  name: string
}

interface KafedraType {
  id: string
  name: string
}

const CategoryItem = () => {
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [kafedras, setKafedras] = useState<KafedraType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [selectedKafedraId, setSelectedKafedraId] = useState<string>("")

  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("")
  const [kafedraSearchTerm, setKafedraSearchTerm] = useState<string>("")

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false)
  const [isKafedraDropdownOpen, setIsKafedraDropdownOpen] = useState<boolean>(false)

  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const kafedraDropdownRef = useRef<HTMLDivElement>(null)

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
      fetchCategories()
      fetchKafedras()
    }
  }, [userGroup])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false)
      }
      if (kafedraDropdownRef.current && !kafedraDropdownRef.current.contains(event.target as Node)) {
        setIsKafedraDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()),
  )

  const filteredKafedras = kafedras.filter((kafedra) =>
    kafedra.name.toLowerCase().includes(kafedraSearchTerm.toLowerCase()),
  )

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategoryId(category.id)
    setCategorySearchTerm(category.name)
    setIsCategoryDropdownOpen(false)
  }

  const handleKafedraSelect = (kafedra: KafedraType) => {
    setSelectedKafedraId(kafedra.id)
    setKafedraSearchTerm(kafedra.name)
    setIsKafedraDropdownOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedCategoryId || !selectedKafedraId) {
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

      const categoryKafedraData = {
        category_id: selectedCategoryId,
        kafedra_id: selectedKafedraId,
      }

      await axios.post(`${import.meta.env.VITE_API}/api/category-kafedra`, categoryKafedraData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })

      antdMessage.success("Kategoriya va kafedra muvaffaqiyatli bog'landi!")

      setSelectedCategoryId("")
      setSelectedKafedraId("")
      setCategorySearchTerm("")
      setKafedraSearchTerm("")
    } catch (error) {
      console.error("Xatolik yuz berdi:", error)
      antdMessage.error("Kategoriya va kafedra bog'lanmadi!")
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
    <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Kategoriya va Kafedrani bog'lash</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-15">
        {/* Category Select */}
        <div className="w-full" ref={categoryDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Kategoriyani tanlang!</label>
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
              placeholder="Kategoriyani tanlang!"
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

        {/* Kafedra Select */}
        <div className="w-full" ref={kafedraDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Kafedrani tanlang!</label>
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
              placeholder="Kafedrani tanlang!"
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
        <div className="md:col-span-2 mt-3">
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLoading ? "Yuborilmoqda..." : "Bog'lash"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CategoryItem;