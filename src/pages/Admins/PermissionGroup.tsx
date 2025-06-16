"use client"

import { Modal, Select, message as antdMessage } from "antd"
import axios from "axios"
import { useEffect, useState } from "react"
import { useParams } from "react-router"

const { Option } = Select

interface GroupType {
  id: string
  name: string
}

interface PermissionType {
  id: string
  code_name: string
  name: string
  table: string
}

interface PermissionGroupType {
  id: string
  groupInfo: {
    id: string
    name: string
  }
  permissionInfo: {
    id: string
    name: string
  }
}

const PermissionGroup = () => {
  const { id } = useParams();
  const [open, setOpen] = useState(false)
  const [group, setGroup] = useState<GroupType[]>([])
  const [permission, setPermission] = useState<PermissionType[]>([])
  const [permissionGroup, setPermissionGroup] = useState<PermissionGroupType[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([])
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false)
  const [selectedPermissionGroup, setSelectedPermissionGroup] = useState<PermissionGroupType | null>(null)

  useEffect(() => {
    const fetchGroup = async () => {
      setFetchLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get<{ data: GroupType[] }>(`${import.meta.env.VITE_API}/api/groups/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setGroup(response.data.data)
      } catch (err) {
        console.error("Guruhlarni olishda xatolik:", err)
      } finally {
        setFetchLoading(false)
      }
    }
    fetchGroup()
  }, [])

  useEffect(() => {
    const fetchPermission = async () => {
      setFetchLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get<{ data: PermissionType[] }>(`${import.meta.env.VITE_API}/api/permissions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setPermission(response.data.data)
      } catch (err) {
        console.error("Huquqlarni olishda xatolik:", err)
      } finally {
        setFetchLoading(false)
      }
    }
    fetchPermission()
  }, [])

  const fetchPermissionGroups = async () => {
    setFetchLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get<{ data: PermissionGroupType[] }>(
        `${import.meta.env.VITE_API}/api/group-permissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setPermissionGroup(response.data.data);
    } catch (err) {
      console.error("Huquqlarni olishda xatolik:", err)
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissionGroups()
  }, [])

  // POST so'rov
  const handleSubmit = async () => {
    const groupId = id || selectedGroupId

    if (!groupId || selectedPermissionIds.length === 0) {
      antdMessage.warning("Iltimos, guruh va kamida bitta huquqni tanlang!")
      return
    }

    setSubmitLoading(true)
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${import.meta.env.VITE_API}/api/group-permissions/assign`,
        {
          group_id: groupId,
          permission_ids: selectedPermissionIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      antdMessage.success("Huquqlar guruhga muvaffaqiyatli bog'landi!")
      setSelectedGroupId("")
      setSelectedPermissionIds([])
      setOpen(false)

      fetchPermissionGroups()
    } catch (err) {
      console.error("Yuborishda xatolik:", err)
      Modal.error({
        title: "Xatolik",
        content: "Ma'lumot yuborishda xatolik yuz berdi.",
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  // DELETE so'rov
  const showDeleteModal = (permissionGroup: PermissionGroupType) => {
    setSelectedPermissionGroup(permissionGroup)
    setIsDeleteModalVisible(true)
  }

  const handleDeleteOk = async () => {
    if (!selectedPermissionGroup) return

    setDeleteLoading(selectedPermissionGroup.id)
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`${import.meta.env.VITE_API}/api/group-permissions/${selectedPermissionGroup.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      antdMessage.success("Huquq muvaffaqiyatli olib tashlandi!")
      setIsDeleteModalVisible(false)
      setSelectedPermissionGroup(null)

      fetchPermissionGroups()
    } catch (err) {
      console.error("O'chirishda xatolik:", err)
      antdMessage.error("Huquqni olib tashlaganda xatolik yuz berdi!")
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setSelectedPermissionGroup(null)
  }

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <div className="flex items-center justify-start mt-5">
        {
          id ? (
            <div className="text-2xl font-bold mb-6 text-gray-800 dark:text-white capitalize flex items-center">
              {group.find((item) => item.id === id)?.name || "Guruh mavjud emas!"} <p className="lowercase">ning Barcha huquqlari</p>
            </div>
          )
          : (
            <div className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              {group.find((item) => item.id === id)?.name || "Guruh mavjud emas!"} <p className="lowercase">ning Barcha huquqlari</p>
            </div>
          )
        }
      </div>
      <div className="flex items-center justify-end my-10">
        <button
          onClick={() => setOpen(true)}
          className="dark:bg-gray-600 bg-gray-500 dark:text-gray-200 text-gray-100 rounded-lg px-4 py-2"
        >
          Huquq qo'shish
        </button>
      </div>
      {/* Permission Group GET  */}
      {fetchLoading ? (
        <p className="text-center text-gray-700 dark:text-gray-300 py-4">Ma'lumotlar yuklanmoqda...</p>
      ) : (
        (() => {
          const filteredData = permissionGroup?.filter((item) => item.permissionInfo && item.groupInfo?.id === id)

          if (filteredData.length === 0) {
            return (
              <div className="text-center py-16">
                <p className="text-lg text-gray-500 dark:text-gray-400">Hech qanday huquq mavjud emas!</p>
              </div>
            )
          }

          return (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="text-center py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider px-10">
                    #
                  </th>
                  <th className="text-center py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider px-10">
                    Guruh nomi
                  </th>
                  <th className="text-center py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider px-10">
                    Huquqlar
                  </th>
                  <th className="text-center py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider px-10">
                    Huquqni olib tashlash
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredData.map((item, index) => (
                  <tr key={index + 1}>
                    <td className="text-center py-3 text-sm text-gray-700 dark:text-gray-300 px-10 border-b dark:border-gray-500">
                      {index + 1}
                    </td>
                    <td className="text-center py-3 text-sm text-gray-700 dark:text-gray-300 px-10 border-b dark:border-gray-500">
                      {item.groupInfo?.name}
                    </td>
                    <td className="text-center py-3 text-sm text-gray-700 dark:text-gray-300 px-10 border-b dark:border-gray-500">
                      {item.permissionInfo?.name}
                    </td>
                    <td className="text-center py-3 text-sm text-gray-700 dark:text-gray-300 px-10 border-b dark:border-gray-500">
                      <button
                        className="text-sm text-red-500 hover:text-red-600 px-3 py-1 rounded-md transition-all duration-300"
                        onClick={() => showDeleteModal(item)}
                        disabled={deleteLoading === item.id}
                      >
                        {deleteLoading === item.id ? "O'chirilmoqda..." : "Olib tashlash"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        })()
      )}
      {/* Permission Group POST  */}
      <Modal
        centered
        title="Huquq qo'shish"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        okText={submitLoading ? "Saqlanmoqda..." : "Saqlash"}
        cancelText="Bekor qilish"
        confirmLoading={submitLoading}
      >
        <div className="mb-4">
          <label className="block mb-1 text-gray-700 dark:text-gray-700">Guruh nomi</label>
          {id ? (
            <div className="border rounded-md text-gray-500 bg-white px-3 py-1.5">
              {group.find((item) => item.id === id)?.name || "Guruh mavjud emas!"}
            </div>
          ) : (
            <Select
              placeholder="Guruh tanlang"
              className="w-full"
              value={selectedGroupId || undefined}
              onChange={(value) => setSelectedGroupId(value)}
            >
              {group.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          )}
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-700">Huquqlarni tanlang:</label>
          <Select
            mode="multiple"
            placeholder="Huquqlarni tanlang"
            className="w-full"
            value={selectedPermissionIds}
            onChange={(values) => setSelectedPermissionIds(values)}
            maxTagCount="responsive"
            style={{ maxHeight: 200 }}
          >
            {permission.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
      {/* DELETE MODAL */}
      <Modal
        title="Huquqni olib tashlash"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="Olib tashlash"
        cancelText="Bekor qilish"
        confirmLoading={deleteLoading !== null}
      >
        <p>
          {selectedPermissionGroup
            ? `"${selectedPermissionGroup.groupInfo?.name}" guruhidan "${selectedPermissionGroup.permissionInfo?.name}" huquqini olib tashlamoqchimisiz?`
            : ""}
        </p>
      </Modal>
    </div>
  )
}

export default PermissionGroup;