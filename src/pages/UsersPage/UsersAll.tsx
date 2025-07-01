import axios from "axios"
import type React from "react"
import { useEffect, useState } from "react"
import { Users, Search } from "lucide-react"

export interface UsersType {
  id: string
  full_name: string
  passport_id: string
  phone: string
  StudentGroup: {
    id: string
    name: string
    Yonalish: {
      id: string
      name_uz: string
    }
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

const UsersAll: React.FC = () => {
  const [data, setData] = useState<UsersType[]>([])
  const [selectedYonalish, setSelectedYonalish] = useState<string>("")
  const [selectedGuruh, setSelectedGuruh] = useState<string>("")
  const [searchValue, setSearchValue] = useState<string>("")
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [finalFilteredData, setFinalFilteredData] = useState<UsersType[]>([])
  const [loading, setLoading] = useState<boolean>(false)

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
      console.error("Muallifni olishda xatolik:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermission()
  }, [])

  const getUniqueYonalishlar = (): { id: string; name_uz: string }[] => {
    const validData = data.filter((u) => u.StudentGroup && u.StudentGroup.Yonalish)
    const yonalishlar = validData.map((u) => u.StudentGroup.Yonalish)
    return Array.from(new Map(yonalishlar.map((y) => [y.id, y])).values())
  }

  const getUniqueGuruhlar = (): { id: string; name: string }[] => {
    const validData = data.filter((u) => u.StudentGroup)
    let guruhlar = validData.map((u) => u.StudentGroup)

    if (selectedYonalish) {
      guruhlar = guruhlar.filter((g) => g.Yonalish && g.Yonalish.id === selectedYonalish)
    }

    return Array.from(new Map(guruhlar.map((g) => [g.id, g])).values())
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get<{ data: UsersType[] }>(`${import.meta.env.VITE_API}/api/all-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setData(response.data.data)
    } catch (error) {
      console.error("Foydalanuvchilarni olishda xatolik:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchData()
    }
  }, [userGroup])

  useEffect(() => {
    let filtered = data

    if (selectedYonalish) {
      filtered = filtered.filter(
        (u) => u.StudentGroup && u.StudentGroup.Yonalish && u.StudentGroup.Yonalish.id === selectedYonalish,
      )
    }

    if (selectedGuruh) {
      filtered = filtered.filter((u) => u.StudentGroup && u.StudentGroup.id === selectedGuruh)
    }

    if (searchValue.trim()) {
      filtered = filtered.filter((u) => u.full_name.toLowerCase().includes(searchValue.toLowerCase()))
    }

    const validFilteredData = filtered.filter((u) => u.StudentGroup && u.StudentGroup.Yonalish)
    setFinalFilteredData(validFilteredData)
  }, [selectedYonalish, selectedGuruh, searchValue, data])

  const handleYonalishChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYonalish(e.target.value)
    setSelectedGuruh("")
  }

  const handleGuruhChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGuruh(e.target.value)
  }

  if (loading) {
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
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Barcha foydalanuvchilar</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="search"
            name="name"
            placeholder="Qidiruv"
            className="w-55 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6 mt-15">
        {finalFilteredData.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Ma'lumotlar mavjud emas!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-white uppercase tracking-wider">
                    #
                  </th>
                  <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Ism familiya
                  </th>
                  <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Passport
                  </th>
                  <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white uppercase tracking-wider">
                    <select
                      className="mt-1 w-full border border-gray-200 dark:border-gray-600 outline-none rounded px-2 py-1 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={selectedYonalish}
                      onChange={handleYonalishChange}
                    >
                      <option value="">Yo'nalish</option>
                      {getUniqueYonalishlar().map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.name_uz}
                        </option>
                      ))}
                    </select>
                  </th>
                  <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white uppercase tracking-wider">
                    <select
                      className="mt-1 w-full border border-gray-200 dark:border-gray-600 outline-none rounded px-2 py-1 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                      value={selectedGuruh}
                      onChange={handleGuruhChange}
                    >
                      <option value="">Guruh</option>
                      {getUniqueGuruhlar().map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {finalFilteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="w-1/4 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.full_name}
                    </td>
                    <td className="w-1/4 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.passport_id}
                    </td>
                    <td className="w-1/4 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.StudentGroup.Yonalish.name_uz}
                    </td>
                    <td className="w-1/4 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {item.StudentGroup.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersAll