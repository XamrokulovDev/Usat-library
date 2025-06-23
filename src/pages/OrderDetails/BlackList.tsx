import axios from "axios"
import { Calendar } from "lucide-react"
import { useEffect, useState } from "react"

interface OrderType {
  id: string
  status_id: number
  status_message: string
  user_id: string
  book_id: string
  created_at: string
  finished_at?: string | null
  taking_at?: string | null
  book_code?: string | null
  Book: {
    id: string
    name: string
    year?: number
    page?: number
  } | null
  User: {
    id: string
    full_name: string
    phone: string
    telegram_id?: string | null
  } | null
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

const BlackList = () => {
  const [orders, setOrders] = useState<OrderType[]>([])
  const [userGroups, setUserGroups] = useState<PermissionType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserGroups(data.data)
    } catch (error) {
      console.error("Permissionni olishda xatolik:", error)
    }
  }

  const fetchOrders = async (permissionHeader: string) => {
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.get(`${import.meta.env.VITE_API}/api/user-order`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionHeader,
        },
      })
      setOrders(data.data);
      console.log(data.data);
    } catch (error) {
      console.error("Buyurtmalarni olishda xatolik:", error)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  useEffect(() => {
    if (userGroups.length === 0) return
    const rolesStr = localStorage.getItem("isRoles") || "[]"
    const roles: string[] = JSON.parse(rolesStr)
    const matched = userGroups.filter((g) => roles.includes(g.group_id))
    const permissionCode = matched[0]?.permissionInfo.code_name || ""
    fetchOrders(permissionCode).finally(() => setLoading(false))
  }, [userGroups])

  const archivedOrders = orders.filter((order) => order.status_id === 8)

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
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-6 h-6 text-blue-400 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Arxivdagi buyurtmalar</h3>
      </div>
      <div className="space-y-6 mt-10">
        {archivedOrders.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Arxivdagi buyurtmalar yo'q!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    #
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Buyurtmachi
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Telefon raqami
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Kitob nomi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {archivedOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {order.User?.full_name || "Foydalanuvchi ma'lumoti yo'q"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {order.User?.phone ? (
                        <a href={`tel:${order.User.phone}`} className="text-[13px] text-gray-800 dark:text-white underline">
                          {order.User.phone}
                        </a>
                      ) : (
                        "Ma'lumot yo'q"
                      )}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {order.Book?.name || "Kitob ma'lumoti yo'q"}
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

export default BlackList;