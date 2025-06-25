"use client"

import axios from "axios"
import { Users } from "lucide-react"
import { useEffect, useState } from "react"
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

interface BuildType {
  id: string
  full_name: string
  phone: string
  passport_id: string
}

const UsersBuild = () => {
  const [build, setBuild] = useState<BuildType[]>([])
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [restoringUsers, setRestoringUsers] = useState<Set<string>>(new Set())

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
      console.error("Permission olishda xatolik:", err)
      setError("Permission olishda xatolik yuz berdi.")
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    fetchPermission()
  }, [])

  const fetchBuild = async () => {
    setError(null)
    setFetchLoading(true)
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/users/users/deleted`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setBuild(response.data.data)
    } catch (err) {
      console.error("O'chirilgan foydalanuvchilarni olishda xatolik:", err)
      setError("O'chirilgan foydalanuvchilarni olishda xatolik yuz berdi.")
    } finally {
      setFetchLoading(false)
    }
  }

  const handleRestore = async (user: BuildType) => {
    setRestoringUsers((prev) => new Set(prev).add(user.id))

    try {
      const token = localStorage.getItem("token")
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      await axios.patch(
        `${import.meta.env.VITE_API}/api/users/${user.id}/restore`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        },
      )

      setBuild((prevBuild) => prevBuild.filter((u) => u.id !== user.id))
      antdMessage.success(`${user.full_name} muvaffaqiyatli tiklandi!`)
    } catch (error) {
      console.error("Foydalanuvchini tiklashda xatolik:", error)

      let errorMessage = "Foydalanuvchini tiklashda xatolik yuz berdi"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        errorMessage = axiosError.response?.data?.message || errorMessage
      }

      antdMessage.error(errorMessage)
    } finally {
      setRestoringUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(user.id)
        return newSet
      })
    }
  }

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchBuild()
    }
  }, [userGroup])

  if (fetchLoading) {
    return (
      <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
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
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Foydalanuvchilarni tiklash</h3>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Xatolik:</strong> {error}
        </div>
      )}

      <div className="overflow-x-auto mt-10">
        {build.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            O'chirilgan foydalanuvchilar hozircha mavjud emas
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  #
                </th>
                <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Ism familiyasi
                </th>
                <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Telefon nomeri
                </th>
                <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Passport ID
                </th>
                <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {build.map((item, index) => {
                const isRestoring = restoringUsers.has(item.id)

                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="text-center px-6 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="w-1/4 text-center px-6 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.full_name || "Ma'lumot yo'q"}
                    </td>
                    <td className="w-1/4 text-center px-6 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.phone || "Ma'lumot yo'q"}
                    </td>
                    <td className="w-1/4 text-center px-6 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.passport_id || "Ma'lumot yo'q"}
                    </td>
                    <td className="w-1/4 text-center px-6 py-3 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleRestore(item)}
                        disabled={isRestoring}
                        className={`px-3 py-1 rounded-md transition-all duration-300 ${
                          isRestoring
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-500 hover:text-blue-700"
                        }`}
                      >
                        {isRestoring ? "Tiklanmoqda..." : "Tiklash"}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default UsersBuild;