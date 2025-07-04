import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Modal, Input, message as antdMessage } from "antd"
import { Tag } from 'lucide-react'

interface GroupType {
  id: string
  name_uz: string
  name_ru: string
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

const Category = () => {
  const [nameUz, setNameUz] = useState<string>("")
  const [nameRu, setNameRu] = useState<string>("")
  const [groups, setGroups] = useState<GroupType[]>([])
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [updateLoading, setUpdateLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null)
  const [editedTitleUz, setEditedTitleUz] = useState<string>("")
  const [editedTitleRu, setEditedTitleRu] = useState<string>("")

  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false)

  const generateCode = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }

  const fetchPermission = async () => {
    const token = localStorage.getItem("token")
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
      setError("Muallifni olishda xatolik yuz berdi.")
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    fetchPermission()
  }, [])

  const fetchGroups = async () => {
    setError(null)
    setFetchLoading(true)
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
      setGroups(response.data.data);
    } catch (err) {
      console.error("Muallifni olishda xatolik:", err)
      setError("Muallifni olishda xatolik yuz berdi.")
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchGroups()
    }
  }, [userGroup])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!nameUz.trim() || !nameRu.trim()) {
      antdMessage.warning("Barcha maydonlarni to'ldirish shart!")
      return
    }
    setSubmitLoading(true)
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const generatedCode = generateCode(nameUz)

      await axios.post(
        `${import.meta.env.VITE_API}/api/categories`,
        { 
          name_uz: nameUz,
          name_ru: nameRu,
          code: generatedCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        },
      )
      antdMessage.success("Kategoriya muvaffaqiyatli qo'shildi!")
      setNameUz("")
      setNameRu("")
      await fetchGroups()
    } catch (error) {
      console.error("Xatolik yuz berdi:", error)
      antdMessage.error("Kategoriya qo'shilmadi!")
    } finally {
      setSubmitLoading(false)
    }
  }

  const showUpdateModal = (group: GroupType) => {
    setSelectedGroup(group)
    setEditedTitleUz(group.name_uz)
    setEditedTitleRu(group.name_ru)
    setIsUpdateModalVisible(true)
  }

  const handleUpdateOk = async () => {
    if (!editedTitleUz.trim() || !editedTitleRu.trim()) {
      antdMessage.warning("Barcha maydonlarni to'ldirish shart!")
      return
    }
    
    setUpdateLoading(true)
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const generatedCode = generateCode(editedTitleUz)

      await axios.put(
        `${import.meta.env.VITE_API}/api/categories/${selectedGroup?.id}`,
        { 
          name_uz: editedTitleUz,
          name_ru: editedTitleRu,
          code: generatedCode
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        },
      )
      setIsUpdateModalVisible(false)
      setSelectedGroup(null)
      fetchGroups()
      antdMessage.success("Kategoriya muvaffaqiyatli yangilandi!")
    } catch (error) {
      console.error("Yangilashda xatolik yuz berdi:", error)
      antdMessage.error("Yangilashda xatolik yuz berdi!")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false)
    setSelectedGroup(null)
  }

  const showDeleteModal = (group: GroupType) => {
    setSelectedGroup(group)
    setIsDeleteModalVisible(true)
  }

  const handleDeleteOk = async () => {
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      await axios.delete(`${import.meta.env.VITE_API}/api/categories/${selectedGroup?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setIsDeleteModalVisible(false)
      setSelectedGroup(null)
      fetchGroups()
      antdMessage.success("Kategoriya muvaffaqiyatli o'chirildi!")
    } catch (error) {
      console.error("O'chirishda xatolik yuz berdi:", error)
      antdMessage.error("O'chirishda xatolik yuz berdi!")
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setSelectedGroup(null)
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
        <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Kategoriya qo'shish</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 mb-8 mt-15">
        <div className="w-full">
          <label htmlFor="categoryUz" className="block font-medium text-gray-700 dark:text-gray-300 cursor-pointer mb-2">
            Kategoriya nomi
          </label>
          <input
            id="categoryUz"
            name="name_uz"
            value={nameUz}
            onChange={(e) => setNameUz(e.target.value)}
            placeholder="Masalan: Badiiy adabiyot"
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="w-full">
          <label htmlFor="categoryRu" className="block font-medium text-gray-700 dark:text-gray-300 cursor-pointer mb-2">
            Название категории
          </label>
          <input
            id="categoryRu"
            name="name_ru"
            value={nameRu}
            onChange={(e) => setNameRu(e.target.value)}
            placeholder="Например: Художественная литература"
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitLoading ? "Yuborilmoqda..." : "Qo'shish"}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {groups.length === 0 ? "Kategoriyalar yo'q!" : "Barcha Kategoriyalar"}
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
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
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
                    Kategoriya nomi
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Название категории
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
                {groups.map((group, index) => (
                  <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {group.name_uz}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {group.name_ru}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                      <button
                        className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md transition-all duration-300"
                        onClick={() => showUpdateModal(group)}
                      >
                        Yangilash
                      </button>
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                      <button
                        className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md transition-all duration-300"
                        onClick={() => showDeleteModal(group)}
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
        title="Kategoriyani Tahrirlash"
        open={isUpdateModalVisible}
        onOk={handleUpdateOk}
        onCancel={handleUpdateCancel}
        okText={updateLoading ? "Yangilanmoqda..." : "Yangilash"}
        cancelText="Bekor qilish"
        confirmLoading={updateLoading}
        width={600}
      >
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Kategoriya nomi
            </label>
            <Input
              value={editedTitleUz}
              onChange={(e) => setEditedTitleUz(e.target.value)}
              placeholder="Yangi kategoriya nomi"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Название категории
            </label>
            <Input
              value={editedTitleRu}
              onChange={(e) => setEditedTitleRu(e.target.value)}
              placeholder="Новое название категории"
            />
          </div>
        </div>
      </Modal>
      {/* DELETE MODAL */}
      <Modal
        title="Kategoriyani o'chirish"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="O'chirish"
        cancelText="Yo'q"
      >
        <p>
          {selectedGroup 
            ? `"${selectedGroup.name_uz}" / "${selectedGroup.name_ru}" kategoriyani o'chirmoqchimisiz?` 
            : ""
          }
        </p>
      </Modal>
    </div>
  )
}

export default Category;