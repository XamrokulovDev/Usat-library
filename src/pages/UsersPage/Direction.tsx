import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Modal, Input, message as antdMessage } from "antd"
import { Navigation } from "lucide-react"

interface FacultyType {
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

const Direction = () => {
  const [nameUz, setNameUz] = useState<string>("")
  const [nameRu, setNameRu] = useState<string>("")
  const [faculties, setFaculties] = useState<FacultyType[]>([])
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [updateLoading, setUpdateLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedFaculty, setSelectedFaculty] = useState<FacultyType | null>(null)
  const [editedTitleUz, setEditedTitleUz] = useState<string>("")
  const [editedTitleRu, setEditedTitleRu] = useState<string>("")

  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false)

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

  const fetchFaculties = async () => {
    setFetchLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/yonalish`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setFaculties(response.data.data)
    } catch (err) {
      console.error("Yo'nalishlarni olishda xatolik:", err)
      setError("Yo'nalishlarni olishda xatolik yuz berdi.")
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchFaculties()
    }
  }, [userGroup])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!nameUz.trim() || !nameRu.trim()) {
      antdMessage.warning("Iltimos, yo'nalish nomlarini to'ldiring!")
      return
    }

    setSubmitLoading(true)
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      await axios.post(
        `${import.meta.env.VITE_API}/api/yonalish`,
        {
          name_uz: nameUz,
          name_ru: nameRu,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        },
      )
      antdMessage.success("Yo'nalish muvaffaqiyatli qo'shildi!")
      setNameUz("")
      setNameRu("")
      fetchFaculties()
    } catch (error) {
      console.error("Xatolik yuz berdi:", error)
      antdMessage.error("Yo'nalish qo'shilmadi.")
    } finally {
      setSubmitLoading(false)
    }
  }

  const showUpdateModal = (faculty: FacultyType) => {
    setSelectedFaculty(faculty)
    setEditedTitleUz(faculty.name_uz)
    setEditedTitleRu(faculty.name_ru)
    setIsUpdateModalVisible(true)
  }

  const handleUpdateOk = async () => {
    if (!editedTitleUz.trim() || !editedTitleRu.trim()) {
      antdMessage.warning("Iltimos, yo'nalish nomlarini kiriting!")
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
        `${import.meta.env.VITE_API}/api/yonalish/${selectedFaculty?.id}`,
        {
          name_uz: editedTitleUz,
          name_ru: editedTitleRu,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        },
      )
      setIsUpdateModalVisible(false)
      setSelectedFaculty(null)
      fetchFaculties()
      antdMessage.success("Yo'nalish muvaffaqiyatli yangilandi!")
    } catch (error) {
      console.error("Yangilashda xatolik:", error)
      antdMessage.error("Yangilash bajarilmadi!")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false)
    setSelectedFaculty(null)
  }

  const showDeleteModal = (faculty: FacultyType) => {
    setSelectedFaculty(faculty)
    setIsDeleteModalVisible(true)
  }

  const handleDeleteOk = async () => {
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      await axios.delete(`${import.meta.env.VITE_API}/api/yonalish/${selectedFaculty?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setIsDeleteModalVisible(false)
      setSelectedFaculty(null)
      fetchFaculties()
      antdMessage.success("Yo'nalish o'chirildi!")
    } catch (error) {
      console.error("O'chirishda xatolik:", error)
      antdMessage.error("O'chirishda xatolik yuz berdi.")
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setSelectedFaculty(null)
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
        <Navigation className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Yo'nalish Qo'shish</h3>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6 mb-8 mt-6">
        <div className="w-full">
          <label htmlFor="direction_uz" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Yo'nalish nomi
          </label>
          <input
            id="direction_uz"
            name="name_uz"
            value={nameUz}
            onChange={(e) => setNameUz(e.target.value)}
            placeholder="Masalan: Marketing"
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="w-full">
          <label htmlFor="direction_ru" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Название направления
          </label>
          <input
            id="direction_ru"
            name="name_ru"
            value={nameRu}
            onChange={(e) => setNameRu(e.target.value)}
            placeholder="Например: Маркетинг"
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="mt-4">
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
            {faculties.length === 0 ? "Yo'nalishlar mavjud emas" : "Barcha yo'nalishlar"}
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
        ) : faculties.length === 0 ? (
          <div className="text-center py-12">
            <Navigation className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
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
                    Yo'nalish nomi (O'zbek)
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Yo'nalish nomi (Rus)
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
                {faculties.map((faculty, index) => (
                  <tr key={faculty.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {faculty.name_uz}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {faculty.name_ru}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                      <button
                        className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md transition-all duration-300"
                        onClick={() => showUpdateModal(faculty)}
                      >
                        Yangilash
                      </button>
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                      <button
                        className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md transition-all duration-300"
                        onClick={() => showDeleteModal(faculty)}
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
        title="Yo'nalishni Tahrirlash"
        open={isUpdateModalVisible}
        onOk={handleUpdateOk}
        onCancel={handleUpdateCancel}
        okText={updateLoading ? "Yangilanmoqda..." : "Saqlash"}
        cancelText="Bekor qilish"
        confirmLoading={updateLoading}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Yo'nalish nomi (O'zbek tilida)
            </label>
            <Input
              value={editedTitleUz}
              onChange={(e) => setEditedTitleUz(e.target.value)}
              placeholder="Yangi yo'nalish nomi (O'zbek)"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Yo'nalish nomi (Rus tilida)
            </label>
            <Input
              value={editedTitleRu}
              onChange={(e) => setEditedTitleRu(e.target.value)}
              placeholder="Новое название направления (Русский)"
            />
          </div>
        </div>
      </Modal>
      {/* DELETE MODAL */}
      <Modal
        title="yo'nalishni o'chirish"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="O'chirish"
        cancelText="Yo'q"
      >
        <p>{selectedFaculty ? `"${selectedFaculty.name_uz}" / "${selectedFaculty.name_ru}" Yo'nalishni o'chirmoqchimisiz?` : ""}</p>
      </Modal>
    </div>
  )
}

export default Direction;