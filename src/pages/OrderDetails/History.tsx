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

interface OrderHistoryType {
  id: string
  user_order_id: string
  action: string
  performed_by: string
  created_at: string
  AdminUser: {
    id: string
    full_name: string
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

interface OrderWithHistory {
  order: OrderType
  history: OrderHistoryType
}

const History = () => {
  const [orders, setOrders] = useState<OrderType[]>([])
  const [orderHistory, setOrderHistory] = useState<OrderHistoryType[]>([])
  const [userGroups, setUserGroups] = useState<PermissionType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [ordersWithHistory, setOrdersWithHistory] = useState<OrderWithHistory[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserGroups(data.data)
    } catch (error) {
      console.error("Permissionni olishda xatolik:", error)
      setError("Permission ma'lumotlarini olishda xatolik yuz berdi.")
    }
  }

  const fetchOrderHistory = async (permissionCode: string) => {
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.get(`${import.meta.env.VITE_API}/api/order-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionCode,
        },
      })
      setOrderHistory(data.data)
    } catch (error) {
      console.error("Order history olishda xatolik:", error)
      setError("Buyurtmalar tarixini olishda xatolik yuz berdi.")
    }
  }

  const fetchOrders = async (permissionCode: string) => {
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.get(`${import.meta.env.VITE_API}/api/user-order`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionCode,
        },
      })
      setOrders(data.data)
    } catch (error) {
      console.error("Buyurtmalarni olishda xatolik:", error)
      setError("Buyurtmalarni olishda xatolik yuz berdi.")
    }
  }

  const fetchDataWithPermissions = async () => {
    if (userGroups.length === 0) return

    try {
      setLoading(true)
      setError(null)

      // Get user roles from localStorage
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []

      // Match user groups with roles
      const matchedGroups = userGroups.filter((item) => isRoles.includes(item.group_id))

      if (matchedGroups.length === 0) {
        setError("Sizda ushbu sahifaga kirish huquqi yo'q.")
        setLoading(false)
        return
      }

      // Get permission code from first matched group
      const permissionCode = matchedGroups[0]?.permissionInfo?.code_name

      if (!permissionCode) {
        setError("Permission kodi topilmadi.")
        setLoading(false)
        return
      }

      // Fetch both order history and orders with the same permission
      await Promise.all([fetchOrderHistory(permissionCode), fetchOrders(permissionCode)])
    } catch (error) {
      console.error("Ma'lumotlarni olishda xatolik:", error)
      setError("Ma'lumotlarni olishda xatolik yuz berdi.")
    } finally {
      setLoading(false)
    }
  }

  const matchOrdersWithHistory = () => {
    const matched: OrderWithHistory[] = []

    orderHistory.forEach((history) => {
      const matchedOrder = orders.find((order) => order.id === history.user_order_id)
      if (matchedOrder) {
        matched.push({
          order: matchedOrder,
          history: history,
        })
      }
    })

    setOrdersWithHistory(matched)
  }

  // Initial permission fetch
  useEffect(() => {
    fetchPermissions()
  }, [])

  // Fetch data when permissions are loaded
  useEffect(() => {
    if (userGroups.length > 0) {
      fetchDataWithPermissions()
    }
  }, [userGroups])

  // Match orders with history when both are loaded
  useEffect(() => {
    if (orders.length > 0 && orderHistory.length > 0) {
      matchOrdersWithHistory()
    }
  }, [orders, orderHistory])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-red-300 dark:text-red-600 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-400 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Buyurtmalar tarixi</h3>
        </div>
        <h4 className="text-md font-semibold text-gray-800 dark:text-white/90">Jami: {ordersWithHistory.length} ta</h4>
      </div>

      <div className="space-y-6 mt-6">
        {ordersWithHistory.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">Buyurtmalar tarixi yo'q!</p>
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
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Qabul qilgan xodim
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Qabul qilingan vaqt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {ordersWithHistory.map((item, index) => (
                  <tr key={item.history.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {item.order.User?.full_name || "Foydalanuvchi ma'lumoti yo'q"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {item.order.User?.phone ? (
                        <a
                          href={`tel:${item.order.User.phone}`}
                          className="px-6 py-3 whitespace-nowrap text-center text-[13px] font-medium text-gray-600 dark:text-gray-400 underline"
                        >
                          {item.order.User.phone}
                        </a>
                      ) : (
                        "Ma'lumot yo'q"
                      )}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {item.order.Book?.name || "Kitob ma'lumoti yo'q"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {item.history.AdminUser.full_name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {formatDate(item.history.created_at)}
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

export default History;