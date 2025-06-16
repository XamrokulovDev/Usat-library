"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Modal, Input, message as antdMessage } from "antd"

interface FacultyType {
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

const Kafedra = () => {
  const [name, setName] = useState<string>("")
  const [faculties, setFaculties] = useState<FacultyType[]>([])
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [updateLoading, setUpdateLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedFaculty, setSelectedFaculty] = useState<FacultyType | null>(null)
  const [editedTitle, setEditedTitle] = useState<string>("")

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

      const response = await axios.get(`${import.meta.env.VITE_API}/api/kafedra`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setFaculties(response.data.data)
    } catch (err) {
      console.error("Kafedralarni olishda xatolik:", err)
      setError("Kafedralarni olishda xatolik yuz berdi.")
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
    if (!name.trim()) {
      antdMessage.warning("Kafedra kiritish shart!")
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
        `${import.meta.env.VITE_API}/api/kafedra`,
        { name: name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        },
      )
      antdMessage.success("Kafedra muvaffaqiyatli qo'shildi!")
      setName("")
      fetchFaculties()
    } catch (error) {
      console.error("Xatolik yuz berdi:", error)
      antdMessage.error("Xatolik! Kafedra qo'shilmadi.")
    } finally {
      setSubmitLoading(false)
    }
  }

  const showUpdateModal = (faculty: FacultyType) => {
    setSelectedFaculty(faculty)
    setEditedTitle(faculty.name)
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

      await axios.put(
        `${import.meta.env.VITE_API}/api/kafedra/${selectedFaculty?.id}`,
        { name: editedTitle },
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
      antdMessage.success("Kafedra muvaffaqiyatli yangilandi!")
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

      await axios.delete(`${import.meta.env.VITE_API}/api/kafedra/${selectedFaculty?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setIsDeleteModalVisible(false)
      setSelectedFaculty(null)
      fetchFaculties()
      antdMessage.success("Kafedra o'chirildi!")
    } catch (error) {
      console.error("O'chirishda xatolik:", error)
      antdMessage.error("O'chirishda xatolik yuz berdi.")
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setSelectedFaculty(null)
  }

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Kafedra Qo'shish</h2>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        <div className="w-full md:col-span-2">
          <label htmlFor="kafedra" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kafedra nomi
          </label>
          <input
            id="kafedra"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Iqtisodiyot"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            {submitLoading ? "Yuborilmoqda..." : "Qo'shish"}
          </button>
        </div>
      </form>

      <div className="mt-20">
        <h2 className="text-2xl font-medium mb-6 text-gray-800 dark:text-white">
          {faculties.length === 0 ? "Kafedralar mavjud emas" : "Barcha Kafedralar"}
        </h2>
        {fetchLoading ? (
          <p className="text-gray-700 dark:text-gray-300">Ma'lumotlar yuklanmoqda...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="font-normal border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-gray-800 dark:text-white">
                    #
                  </th>
                  <th className="font-normal border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Kafedra nomi
                  </th>
                  <th className="font-normal border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-800 dark:text-white">
                    Yangilash
                  </th>
                  <th className="font-normal border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-gray-800 dark:text-white">
                    O'chirish
                  </th>
                </tr>
              </thead>
              <tbody>
                {faculties.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Hech qanday kafedra topilmadi
                    </td>
                  </tr>
                ) : (
                  faculties.map((faculty, index) => (
                    <tr key={faculty.id} className="">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-white">
                        {faculty.name}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        <button
                          className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md transition-all duration-300"
                          onClick={() => showUpdateModal(faculty)}
                        >
                          Yangilash
                        </button>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        <button
                          className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md transition-all duration-300"
                          onClick={() => showDeleteModal(faculty)}
                        >
                          O'chirish
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPDATE MODAL */}
      <Modal
        title="Kafedrani Tahrirlash"
        open={isUpdateModalVisible}
        onOk={handleUpdateOk}
        onCancel={handleUpdateCancel}
        okText={updateLoading ? "Yangilanmoqda..." : "Saqlash"}
        cancelText="Bekor qilish"
        confirmLoading={updateLoading}
      >
        <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} placeholder="Yangi kafedra nomi" />
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        title="Kafedrani o'chirish"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="O'chirish"
        cancelText="Yo'q"
      >
        <p>{selectedFaculty ? `"${selectedFaculty.name}" Kafedrani o'chirmoqchimisiz?` : ""}</p>
      </Modal>
    </div>
  )
}

export default Kafedra;