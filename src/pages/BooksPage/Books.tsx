"use client"

import axios from "axios"
import { useEffect, useState } from "react"

interface BookType {
  id: string
  name: string
  year: number
  page: number
  book_code: string
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

const Books = () => {
  const [data, setData] = useState<BookType[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get<{ data: BookType[] }>(`${import.meta.env.VITE_API}/api/books`, {
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

  const filteredBooks = data.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.book_code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Barcha kitoblar</h2>
        <div className="relative">
          <input
            id="search"
            name="name"
            placeholder="Qidiruv..."
            className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-1 focus:ring-gray-500 focus:outline-none dark:bg-gray-700 dark:text-white pr-5 px-5 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-10">
        {loading ? (
          <p className="text-center text-gray-700 dark:text-gray-300 py-4">Ma'lumotlar yuklanmoqda...</p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">Hech qanday kitob topilmadi</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  #
                </th>
                <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Kitob nomi
                </th>
                <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Kitob chiqarilgan yil
                </th>
                <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Kitob varaqasi
                </th>
                <th className="w-1/4 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Kitob kodi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredBooks.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                    {item.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                    {item.page}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                    {item.book_code}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Books;