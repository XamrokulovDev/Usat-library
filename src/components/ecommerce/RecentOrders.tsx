import axios from "axios"
import { useEffect, useState } from "react"
import { Calendar } from "lucide-react"
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

interface BookType {
  id: string
  name: string
}

interface UserType {
  id: string
  full_name: string
  phone: string
  telegram_id: string
}

interface OrderType {
  id: string
  status_id: number
  status_message: string
  user_id: string
  book_id: string
  created_at: string
  Book: BookType
  User: UserType
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<OrderType[]>([])
  const [userGroups, setUserGroups] = useState<PermissionType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [confirmingOrders, setConfirmingOrders] = useState<Set<string>>(new Set())
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set())

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
      setOrders(data.data)
    } catch (error) {
      console.error("Buyurtmalarni olishda xatolik:", error)
    }
  }

  const handleConfirmOrder = async (order: OrderType) => {
    setConfirmingOrders((prev) => new Set(prev).add(order.id))

    try {
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 2000))

      const apiPromise = (async () => {
        const token = localStorage.getItem("token")
        await axios.patch(
          `${import.meta.env.VITE_API}/api/user-order/${order.id}/ready`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
      })()

      await Promise.all([delayPromise, apiPromise])

      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id))
      antdMessage.success("Buyurtma olib ketishga tayyorlandi")

      const rolesStr = localStorage.getItem("isRoles") || "[]"
      const roles: string[] = JSON.parse(rolesStr)
      const matched = userGroups.filter((g) => roles.includes(g.group_id))
      const permissionCode = matched[0]?.permissionInfo.code_name || ""
      fetchOrders(permissionCode)
    } catch (error) {
      console.error("Buyurtmani tasdiqlashda xatolik:", error)

      let errorMessage = "Buyurtmani tasdiqlashda xatolik yuz berdi"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        errorMessage = axiosError.response?.data?.message || errorMessage
      }

      antdMessage.error(errorMessage)
    } finally {
      setConfirmingOrders((prev) => {
        const newSet = new Set(prev)
        newSet.delete(order.id)
        return newSet
      })
    }
  }

  const handleCancelOrder = async (order: OrderType) => {
    setCancellingOrders((prev) => new Set(prev).add(order.id))

    try {
      const token = localStorage.getItem("token")
      await axios.patch(
        `${import.meta.env.VITE_API}/api/user-order/${order.id}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== order.id))
      antdMessage.success("Buyurtma bekor qilindi")

      const rolesStr = localStorage.getItem("isRoles") || "[]"
      const roles: string[] = JSON.parse(rolesStr)
      const matched = userGroups.filter((g) => roles.includes(g.group_id))
      const permissionCode = matched[0]?.permissionInfo.code_name || ""
      fetchOrders(permissionCode)
    } catch (error) {
      console.error("Buyurtmani bekor qilishda xatolik:", error)

      let errorMessage = "Buyurtmani bekor qilishda xatolik yuz berdi"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        errorMessage = axiosError.response?.data?.message || errorMessage
      }

      antdMessage.error(errorMessage)
    } finally {
      setCancellingOrders((prev) => {
        const newSet = new Set(prev)
        newSet.delete(order.id)
        return newSet
      })
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

  useEffect(() => {
    if (userGroups.length === 0) return

    const interval = setInterval(() => {
      const rolesStr = localStorage.getItem("isRoles") || "[]"
      const roles: string[] = JSON.parse(rolesStr)
      const matched = userGroups.filter((g) => roles.includes(g.group_id))
      const permissionCode = matched[0]?.permissionInfo.code_name || ""
      fetchOrders(permissionCode)
    }, 2000)

    return () => clearInterval(interval)
  }, [userGroups])

  const filteredOrders = orders.filter((order) => order.status_id === 1)

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
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Yangi buyurtmalar</h3>
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">Yangi buyurtma yo'q!</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                if (!order.Book || !order.User) return null
                const isConfirming = confirmingOrders.has(order.id)
                const isCancelling = cancellingOrders.has(order.id)

                return (
                  <div
                    key={order.id}
                    className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 dark:border-gray-700 dark:hover:border-gray-600 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900/50 dark:to-gray-800/30"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate mb-2">
                            {order.Book.name}
                          </h3>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.status_id === 1
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : order.status_id === 2
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {order.status_message}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex flex-col items-start gap-1">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Buyurtmachi:</span>
                            {order.User.full_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Telefon raqami:</span>
                            <a href={`tel:${order.User.phone}`} className="underline cursor-pointer text-[12px]">
                              {order.User.phone}
                            </a>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleCancelOrder(order)}
                            disabled={isCancelling}
                            className={`border-2 rounded-lg px-5 py-1 transition-all duration-200 ${
                              isCancelling
                                ? "border-gray-400 bg-gray-400 text-white cursor-not-allowed opacity-60"
                                : "border-red-500/80 bg-red-500/80 text-white/90 cursor-pointer hover:bg-red-600/80"
                            }`}
                          >
                            {isCancelling ? "Bekor qilinmoqda..." : "Bekor qilish"}
                          </button>
                          <button
                            onClick={() => handleConfirmOrder(order)}
                            disabled={isConfirming}
                            className={`border-2 rounded-lg px-5 py-1 transition-all duration-200 ${
                              isConfirming
                                ? "border-gray-400 bg-gray-400 text-white cursor-not-allowed opacity-60"
                                : "border-green-500/70 bg-green-500/70 text-white/90 cursor-pointer hover:bg-green-600/70"
                            }`}
                          >
                            {isConfirming ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}