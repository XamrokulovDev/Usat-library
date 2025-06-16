"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Modal, Input, message as antdMessage } from "antd"

interface GroupType {
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

const Category = () => {
  const [name, setName] = useState<string>("")
  const [groups, setGroups] = useState<GroupType[]>([])
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [updateLoading, setUpdateLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null)
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
      setGroups(response.data.data)
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
    if (!name.trim()) {
      antdMessage.warning("Kategoriya kiritish shart!")
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
        `${import.meta.env.VITE_API}/api/categories`,
        { name: name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        },
      )
      antdMessage.success("Kategoriya muvaffaqiyatli qo'shildi!")
      setName("")
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
    setEditedTitle(group.name)
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
        `${import.meta.env.VITE_API}/api/categories/${selectedGroup?.id}`,
        { name: editedTitle },
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
    } catch (error) {
      console.error("O'chirishda xatolik yuz berdi:", error)
      antdMessage.error("O'chirishda xatolik yuz berdi!")
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setSelectedGroup(null)
  }

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Kategoriya qo'shish</h2>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        <div className="w-full md:col-span-2">
          <label htmlFor="category" className="block font-medium text-gray-700 dark:text-gray-300 cursor-pointer mb-1">
            Kategoriya nomi
          </label>
          <input
            id="category"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masalan: Badiiy adabiyot"
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
          {groups.length === 0 ? "Kategoriyalar yo'q!" : "Barcha Kategoriyalar"}
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
                    Kategoriya nomi
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
                {groups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Hech qanday kategoriya topilmadi
                    </td>
                  </tr>
                ) : (
                  groups.map((group, index) => (
                    <tr key={group.id} className="">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-800 dark:text-white">
                        {group.name}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        <button
                          className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md transition-all duration-300"
                          onClick={() => showUpdateModal(group)}
                        >
                          Yangilash
                        </button>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                        <button
                          className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md transition-all duration-300"
                          onClick={() => showDeleteModal(group)}
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
        title="Kategoriyani Tahrirlash"
        open={isUpdateModalVisible}
        onOk={handleUpdateOk}
        onCancel={handleUpdateCancel}
        okText={updateLoading ? "Yangilanmoqda..." : "Yangilash"}
        cancelText="Bekor qilish"
        confirmLoading={updateLoading}
      >
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="Yangi Kategoriya nomi"
        />
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
        <p>{selectedGroup ? `"${selectedGroup.name}" Kategoriyani o'chirmoqchimisiz?` : ""}</p>
      </Modal>
    </div>
  )
}

export default Category;