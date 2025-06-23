import type React from "react"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { Modal, Input, message as antdMessage } from "antd"
import { Users, ChevronDown } from "lucide-react"

interface FacultyType {
  id: string
  name: string
}

interface KafedraType {
  id: string
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

const StudentGroup = () => {
  const [name, setName] = useState<string>("")
  const [faculties, setFaculties] = useState<FacultyType[]>([])
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [updateLoading, setUpdateLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [kafedras, setKafedras] = useState<KafedraType[]>([])
  const [selectedKafedraId, setSelectedKafedraId] = useState<string | null>(null)
  const [kafedraSearchTerm, setKafedraSearchTerm] = useState<string>("")
  const [isKafedraDropdownOpen, setIsKafedraDropdownOpen] = useState<boolean>(false)

  const [selectedFaculty, setSelectedFaculty] = useState<FacultyType | null>(null)
  const [editedKafedraId, setEditedKafedraId] = useState<string | null>(null)
  const [editedTitle, setEditedTitle] = useState<string>("")
  const [editKafedraSearchTerm, setEditKafedraSearchTerm] = useState<string>("")
  const [isEditKafedraDropdownOpen, setIsEditKafedraDropdownOpen] = useState<boolean>(false)

  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false)

  const kafedraDropdownRef = useRef<HTMLDivElement>(null)
  const editKafedraDropdownRef = useRef<HTMLDivElement>(null)

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

      const response = await axios.get(`${import.meta.env.VITE_API}/api/student-groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setFaculties(response.data.data)
    } catch (err) {
      console.error("Guruhlarni olishda xatolik:", err)
      setError("Guruhlarni olishda xatolik yuz berdi.")
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchKafedras = async () => {
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
      setKafedras(response.data.data);
    } catch (err) {
      console.error("Guruhlarni olishda xatolik:", err)
      antdMessage.error("Guruhlarni olishda xatolik yuz berdi.")
    }
  }

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchFaculties()
      fetchKafedras()
    }
  }, [userGroup])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kafedraDropdownRef.current && !kafedraDropdownRef.current.contains(event.target as Node)) {
        setIsKafedraDropdownOpen(false)
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

  const filteredKafedras = kafedras.filter((kafedra) =>
    kafedra.name.toLowerCase().includes(kafedraSearchTerm.toLowerCase()),
  )

  const filteredEditKafedras = kafedras.filter((kafedra) =>
    kafedra.name.toLowerCase().includes(editKafedraSearchTerm.toLowerCase()),
  )

  const handleKafedraSelect = (kafedra: KafedraType) => {
    setSelectedKafedraId(kafedra.id)
    setKafedraSearchTerm(kafedra.name)
    setIsKafedraDropdownOpen(false)
  }

  const handleEditKafedraSelect = (kafedra: KafedraType) => {
    setEditedKafedraId(kafedra.id)
    setEditKafedraSearchTerm(kafedra.name)
    setIsEditKafedraDropdownOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedKafedraId) {
      antdMessage.warning("Yo'nalishni tanlang!")
      return
    }

    if (!name.trim() || !selectedKafedraId) {
      antdMessage.warning("Guruh nomini va yo'nalishni to'liq to'ldiring!")
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
        `${import.meta.env.VITE_API}/api/student-groups`,
        {
          name: name,
          yonalish_id: Number(selectedKafedraId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        },
      )
      antdMessage.success("Guruh muvaffaqiyatli qo'shildi!")
      setName("")
      setSelectedKafedraId(null)
      setKafedraSearchTerm("")
      fetchFaculties()
    } catch (error) {
      console.error("Xatolik yuz berdi:", error)
      antdMessage.error("Guruh qo'shilmadi.")
    } finally {
      setSubmitLoading(false)
    }
  }

  const showUpdateModal = (faculty: FacultyType) => {
    setSelectedFaculty(faculty)
    setEditedTitle(faculty.name)
    const matched = kafedras.find((k) => k.name === faculty.name)
    setEditedKafedraId(matched?.id || null)
    setEditKafedraSearchTerm(matched?.name || "")
    setIsUpdateModalVisible(true)
  }

  const handleUpdateOk = async () => {
    if (!editedTitle.trim() && !editedKafedraId) {
      antdMessage.warning("Guruh nomini va yo'nalishni to'liq to'ldiring!")
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
        `${import.meta.env.VITE_API}/api/student-groups/${selectedFaculty?.id}`,
        {
          name: editedTitle,
          yonalish_id: Number(editedKafedraId),
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
      antdMessage.success("Guruh muvaffaqiyatli yangilandi!")
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

      await axios.delete(`${import.meta.env.VITE_API}/api/student-groups/${selectedFaculty?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setIsDeleteModalVisible(false)
      setSelectedFaculty(null)
      fetchFaculties()
      antdMessage.success("Guruh o'chirildi!")
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
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Guruh Qo'shish</h3>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="w-full md:col-span-2">
          <label htmlFor="group" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Guruh nomi
          </label>
          <input
            id="group"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: 12/21"
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
          />
        </div>
        {/* Searchable Yo'nalish Select */}
        <div className="w-full md:col-span-2" ref={kafedraDropdownRef}>
          <label htmlFor="kafedra" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Yo'nalishni tanlang!
          </label>
          <div className="relative">
            <input
              type="text"
              value={kafedraSearchTerm}
              onChange={(e) => {
                setKafedraSearchTerm(e.target.value)
                setIsKafedraDropdownOpen(true)
                if (!e.target.value) {
                  setSelectedKafedraId(null)
                }
              }}
              onFocus={() => setIsKafedraDropdownOpen(true)}
              placeholder="Yo'nalishni tanlang!"
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
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Yo'nalish topilmadi</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
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
            {faculties.length === 0 ? "Guruhlar mavjud emas" : "Barcha Guruhlar"}
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
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
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
                    Guruh nomi
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
                      {faculty.name}
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
        title="Guruhni Tahrirlash"
        open={isUpdateModalVisible}
        onOk={handleUpdateOk}
        onCancel={handleUpdateCancel}
        okText={updateLoading ? "Yangilanmoqda..." : "Saqlash"}
        cancelText="Bekor qilish"
        confirmLoading={updateLoading}
      >
        <div className="flex flex-col gap-4">
          <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} placeholder="Yangi guruh nomi" />

          {/* Edit Yo'nalish Searchable Select */}
          <div ref={editKafedraDropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={editKafedraSearchTerm}
                onChange={(e) => {
                  setEditKafedraSearchTerm(e.target.value)
                  setIsEditKafedraDropdownOpen(true)
                  if (!e.target.value) {
                    setEditedKafedraId(null)
                  }
                }}
                onFocus={() => setIsEditKafedraDropdownOpen(true)}
                placeholder="Yo'nalishni tanlang!"
                className="w-full px-4 py-1 border border-gray-300 dark:border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-white dark:text-gray-600"
                autoComplete="off"
              />

              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setIsEditKafedraDropdownOpen(!isEditKafedraDropdownOpen)}
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isEditKafedraDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isEditKafedraDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredEditKafedras.length > 0 ? (
                    filteredEditKafedras.map((kafedra) => (
                      <div
                        key={kafedra.id}
                        onClick={() => handleEditKafedraSelect(kafedra)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          editedKafedraId === kafedra.id ? "bg-blue-100 text-blue-900" : ""
                        }`}
                      >
                        {kafedra.name}
                        {editedKafedraId === kafedra.id && <span className="float-right">✓</span>}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">Yo'nalish topilmadi</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        title="Guruhni o'chirish"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="O'chirish"
        cancelText="Yo'q"
      >
        <p>{selectedFaculty ? `"${selectedFaculty.name}" Guruhni o'chirmoqchimisiz?` : ""}</p>
      </Modal>
    </div>
  )
}

export default StudentGroup;