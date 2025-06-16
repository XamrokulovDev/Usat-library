"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { Button, Input, Modal, message as antdMessage } from "antd"
import axios from "axios"
import Staff from "./Staff";

interface Group {
  id: string
  name: string
}

interface FormData {
  full_name: string
  passport_id: string
  phone: string
  password: string
  group_id: string
}

interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
  }
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

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
)

const EyeCloseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
      clipRule="evenodd"
    />
    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
  </svg>
)

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{children}</label>
)

const Admins = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [full_name, setFullName] = useState("")
  const [passport_id, setPassportId] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [group_id, setGroupId] = useState("")
  const [groups, setGroups] = useState<Group[]>([])
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => {
    setIsModalOpen(false)
    clearForm()
  }

  const clearForm = () => {
    setFullName("")
    setPassportId("")
    setPhone("")
    setPassword("")
    setGroupId("")
    setShowPassword(false)
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
    } finally {
      setFetchLoading(false)
    }
  }
  useEffect(() => {
    fetchPermission()
  }, [])

  const fetchGroups = async () => {
    const token = localStorage.getItem("token")

    const isRolesStr = localStorage.getItem("isRoles")
    const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
    const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
    const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

    setFetchLoading(true)
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/api/groups/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      if (response.data.success) {
        setGroups(response.data.data)
      } else {
        antdMessage.error("Tizimda nimadir xatolik yuz berdi!")
      }
    } catch (error) {
      antdMessage.error(`Tizimda nimadir xatolik yuz berdi: ${error}`)
    } finally {
      setFetchLoading(false)
    }
  }
  useEffect(() => {
    if (userGroup.length > 0) {
      fetchGroups()
    }
  }, [userGroup])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!full_name || !passport_id || !phone || !password || !group_id) {
      antdMessage.warning("Barcha maydonlarni to'liq to'ldiring!")
      return
    }

    const phoneRegex = /^\+998\d{9}$/
    if (!phoneRegex.test(phone)) {
      antdMessage.warning("Telefon raqamni faqat shu formatda kiriting: +99890***2423")
      return
    }

    const payload: FormData = {
      full_name,
      passport_id,
      phone,
      password,
      group_id,
    }

    setSubmitLoading(true)
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.post<LoginResponse>(`${import.meta.env.VITE_API}/api/admin/register`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })

      const data = response.data
      if (data.success) {
        antdMessage.success("Xodim muvaffaqiyatli ishga olindi!")
        handleCloseModal()
      } else {
        antdMessage.error("Ro'yxatdan o'tishda xatolik!")
      }
    } catch (error) {
      console.error("Xatolik:", error)
      antdMessage.error("Tizimda xatolik yuz berdi!")
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Xodimlar</h2>
      <div className="flex items-center justify-end mt-20">
        <button
          className="dark:bg-gray-600 bg-gray-500 dark:text-gray-200 text-gray-100 rounded-lg px-4 py-2"
          onClick={handleOpenModal}
        >
          Xodim qo'shish
        </button>
      </div>
      {/* Xodimlar  */}
      <div className="mt-10">
        <Staff />
      </div>
      <Modal title="Xodim qo'shish" open={isModalOpen} centered onCancel={handleCloseModal} footer={null}>
        {fetchLoading ? (
          <p className="text-center text-gray-700 dark:text-gray-300 py-4">Ma'lumotlar yuklanmoqda...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div>
              <Label>To'liq ismini kiriting!</Label>
              <Input
                placeholder="To'liq ismini kiriting!"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label>Passport ID kiriting!</Label>
              <Input placeholder="AD1234567" value={passport_id} onChange={(e) => setPassportId(e.target.value)} />
            </div>
            <div>
              <Label>Telefon raqami</Label>
              <Input placeholder="+998901234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Guruhni tanlang</Label>
              <select
                value={group_id}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full text-sm px-4 py-2 mt-1 border dark:border-gray-300 rounded-md dark:bg-white dark:text-gray-400 outline-none cursor-pointer"
              >
                <option value="" disabled className="text-gray-600">
                  Guruh tanlang
                </option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id} className="text-gray-800">
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Parol kiriting!</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Parol o'ylab toping!"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>
            <div>
              <Button
                style={{ padding: "20px 0" }}
                htmlType="submit"
                className="w-full"
                size="middle"
                type="primary"
                loading={submitLoading}
              >
                {submitLoading ? "Yuborilmoqda..." : "Ro'yxatga olish"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default Admins;