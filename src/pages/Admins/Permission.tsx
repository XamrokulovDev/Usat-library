"use client"

import type React from "react"
import { useState, type ChangeEvent, useEffect } from "react"
import { Input, Modal, message as antdMessage } from "antd"
import axios, { type AxiosError } from "axios"
import { PermissionData } from "../../../data/data";

interface FormData {
  name: string
  code_name: string
  table: string
}

interface PermissionType {
  id: string
  name: string
  code_name: string
  table: string
}

const Permission: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [permission, setPermission] = useState<PermissionType[]>([])
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code_name: "",
    table: "",
  })

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
        console.error("Yo'nalishlarni olishda xatolik:", err)
      } finally {
        setFetchLoading(false)
      }
    }
    fetchPermission()
  }, [])

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setFormData({ name: "", code_name: "", table: "" })
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "name") {
      const generatedCodeName = value
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_а-яёғқҳў]/gi, "")
      setFormData((prev) => ({
        ...prev,
        name: value,
        code_name: generatedCodeName,
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async () => {
    const emptyFields = Object.entries(formData).filter(([, val]) => !val.trim())
    if (emptyFields.length > 0) {
      antdMessage.warning("Iltimos, barcha maydonlarni to'ldiring!")
      return
    }

    setSubmitLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(`${import.meta.env.VITE_API}/api/permissions`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Serverda xatolik yuz berdi")
      }

      antdMessage.success("Huquq muvaffaqiyatli qo'shildi!")
      setIsModalOpen(false)
      setFormData({ name: "", code_name: "", table: "" })

      const refreshResponse = await axios.get<{ data: PermissionType[] }>(
        `${import.meta.env.VITE_API}/api/permissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setPermission(refreshResponse.data.data)
    } catch (error) {
      const err = error as AxiosError<{ message: string }>
      antdMessage.error("Xatolik: " + (err.response?.data.message || err.message))
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Barcha huquqlar</h2>
    <div className="mt-20 my-10">
      <div className="flex items-center justify-end mb-6">
        <button
          className="dark:bg-gray-600 bg-gray-500 dark:text-gray-200 text-gray-100 rounded-lg mb-5 px-4 py-2"
          onClick={showModal}
        >
          Huquq qo'shish
        </button>
      </div>
      {/* Jadval */}
      {fetchLoading ? (
        <p className="text-center text-gray-700 dark:text-gray-300 py-4">Ma'lumotlar yuklanmoqda...</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="text-center py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider px-10">
                #
              </th>
              <th className="w-1/3 text-center py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider px-10">
                Ruxsat nomi
              </th>
              <th className="w-1/3 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                Kalit so'z
              </th>
              <th className="w-1/3 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                Bo'limi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {permission.map((item, index) => (
              <tr key={item.id}>
                <td className="text-center py-4 text-sm text-gray-700 dark:text-gray-300 px-10 border-b dark:border-gray-500">
                  {index + 1}
                </td>
                <td className="text-center py-4 text-sm text-gray-700 dark:text-gray-300 px-10 border-b dark:border-gray-500">
                  {item?.name}
                </td>
                <td className="text-center px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-500">
                  {item?.code_name}
                </td>
                <td className="text-center px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-gray-500">
                  {item?.table}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal */}
      <Modal
        centered
        title="Huquq qo'shish"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={submitLoading ? "Saqlanmoqda..." : "Saqlash"}
        cancelText="Bekor qilish"
        confirmLoading={submitLoading}
      >
        <div className="mt-10 mb-4">
          <label className="block mb-1 text-gray-800 dark:text-gray-600">Huquq nomi</label>
          <Input name="name" placeholder="Foydalanuvchilarni ko'rish" value={formData.name} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-800 dark:text-gray-600">Avtomatik</label>
          <Input name="code_name" placeholder="foydalanuvchilarni_korish" value={formData.code_name} readOnly />
        </div>
        <div className="mb-4">
          <label className="block mb-1 text-gray-800 dark:text-gray-600">Bo'lim</label>
          <select
            name="table"
            value={formData.table}
            onChange={handleChange}
            className="w-full border rounded-md outline-none cursor-pointer px-3 py-2"
          >
            <option value="" disabled>
              Bo'limni tanlang!
            </option>
            {PermissionData?.map((item) => (
              <option value={item.name} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
    </div>
  )
}

export default Permission;