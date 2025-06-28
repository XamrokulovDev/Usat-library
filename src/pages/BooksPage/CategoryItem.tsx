"use client"

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

interface CategoryType {
  id: string
  name: string
}

interface KafedraType {
  id: string
  name: string
}

interface CategoryKafedraType {
  id: string
  category_id: string
  kafedra_id: string
  Category: {
    id: string
    name: string
  }
  Kafedra: {
    id: string
    name: string
  }
}

const CategoryKafedraItem = () => {
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [kafedras, setKafedras] = useState<KafedraType[]>([])
  const [categoryKafedras, setCategoryKafedras] = useState<CategoryKafedraType[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [updateLoading, setUpdateLoading] = useState<boolean>(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [selectedKafedraId, setSelectedKafedraId] = useState<string>("")
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("")
  const [kafedraSearchTerm, setKafedraSearchTerm] = useState<string>("")
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false)
  const [isKafedraDropdownOpen, setIsKafedraDropdownOpen] = useState<boolean>(false)
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false)
  const [selectedCategoryKafedra, setSelectedCategoryKafedra] = useState<CategoryKafedraType | null>(null)
  const [editedCategoryId, setEditedCategoryId] = useState<string>("")
  const [editedKafedraId, setEditedKafedraId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

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
      setError("Permission olishda xatolik yuz berdi.")
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

  const fetchCategoryKafedras = async () => {
    setFetchLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/category-kafedra`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setCategoryKafedras(response.data.data)
    } catch (err) {
      console.error("❌ Kategoriya-kafedra bog'lanishlarini olishda xatolik:", err)
      setError("Kategoriya-kafedra bog'lanishlarini olishda xatolik yuz berdi.")
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    fetchPermission()
  }, [])

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchCategories()
      fetchKafedras()
      fetchCategoryKafedras()
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
      await fetchCategoryKafedras()
    } catch (error) {
      console.error("Xatolik yuz berdi:", error)
      antdMessage.error("Kategoriya va kafedra bog'lanmadi!")
    } finally {
      setSubmitLoading(false)
    }
  }

  const showUpdateModal = (categoryKafedra: CategoryKafedraType) => {
    setSelectedCategoryKafedra(categoryKafedra)
    setEditedCategoryId(categoryKafedra.category_id)
    setEditedKafedraId(categoryKafedra.kafedra_id)
    setIsUpdateModalVisible(true)
  }

  const handleUpdateOk = async () => {
    if (!editedCategoryId || !editedKafedraId) {
      antdMessage.warning("Barcha maydonlarni to'ldiring!")
      return
    }

    setUpdateLoading(true)
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      await axios.put(
        `${import.meta.env.VITE_API}/api/category-kafedra/${selectedCategoryKafedra?.id}`,
        {
          category_id: editedCategoryId,
          kafedra_id: editedKafedraId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        },
      )

      setIsUpdateModalVisible(false)
      setSelectedCategoryKafedra(null)
      fetchCategoryKafedras()
      antdMessage.success("Bog'lanish muvaffaqiyatli yangilandi!")
    } catch (error) {
      console.error("Yangilashda xatolik yuz berdi:", error)
      antdMessage.error("Yangilashda xatolik yuz berdi!")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false)
    setSelectedCategoryKafedra(null)
  }

  const showDeleteModal = (categoryKafedra: CategoryKafedraType) => {
    setSelectedCategoryKafedra(categoryKafedra)
    setIsDeleteModalVisible(true)
  }

  const handleDeleteOk = async () => {
    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      await axios.delete(`${import.meta.env.VITE_API}/api/category-kafedra/${selectedCategoryKafedra?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })

      setIsDeleteModalVisible(false)
      setSelectedCategoryKafedra(null)
      fetchCategoryKafedras()
      antdMessage.success("Bog'lanish muvaffaqiyatli o'chirildi!")
    } catch (error) {
      console.error("O'chirishda xatolik yuz berdi:", error)
      antdMessage.error("O'chirishda xatolik yuz berdi!")
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setSelectedCategoryKafedra(null)
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
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Kategoriya va Kafedrani bog'lash</h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mb-8 mt-15">
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
        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLoading ? "Yuborilmoqda..." : "Bog'lash"}
          </button>
        </div>
      </form>

      {/* Table Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {categoryKafedras.length === 0 ? "Bog'lanishlar yo'q!" : "Barcha bog'lanishlar"}
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
        ) : categoryKafedras.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Ma'lumotlar mavjud emas!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-gray-800 dark:text-white">
                    #
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-gray-800 dark:text-white">
                    Kategoriya
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-gray-800 dark:text-white">
                    Kafedra
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center text-gray-800 dark:text-white">
                    Yangilash
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center text-gray-800 dark:text-white">
                    O'chirish
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryKafedras.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {item.Category.name}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {item.Kafedra.name}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                      <button
                        className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md transition-all duration-300"
                        onClick={() => showUpdateModal(item)}
                      >
                        Yangilash
                      </button>
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                      <button
                        className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md transition-all duration-300"
                        onClick={() => showDeleteModal(item)}
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
        title="Bog'lanishni Tahrirlash"
        open={isUpdateModalVisible}
        onOk={handleUpdateOk}
        onCancel={handleUpdateCancel}
        okText={updateLoading ? "Yangilanmoqda..." : "Yangilash"}
        cancelText="Bekor qilish"
        confirmLoading={updateLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
            <select
              value={editedCategoryId}
              onChange={(e) => setEditedCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Kategoriyani tanlang</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kafedra</label>
            <select
              value={editedKafedraId}
              onChange={(e) => setEditedKafedraId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Kafedrani tanlang</option>
              {kafedras.map((kafedra) => (
                <option key={kafedra.id} value={kafedra.id}>
                  {kafedra.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        title="Bog'lanishni o'chirish"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="O'chirish"
        cancelText="Yo'q"
      >
        <p>
          {selectedCategoryKafedra
            ? `"${selectedCategoryKafedra.Category.name}" va "${selectedCategoryKafedra.Kafedra.name}" bog'lanishini o'chirmoqchimisiz?`
            : ""}
        </p>
      </Modal>
    </div>
  )
}

export default CategoryKafedraItem;