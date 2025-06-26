"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { Calendar, Search } from "lucide-react"
import { message as antdMessage, Modal, Input } from "antd"

interface PermissionType {
  id: string
  group_id: string
  permission_id: string
  permissionInfo: {
    id: string
    code_name: string
  }
}

interface OrderType {
  id: string
  status_id: number
  status_message: string
  user_id: string
  book_id: string
  book_code?: string
  created_at: string
  finished_at?: string
  Book: {
    id: string
    name: string
    year?: number
    page?: number
    book_code?: string
  } | null
  User: {
    id: string
    full_name: string
    phone: string
    telegram_id?: string
  } | null
}

const Order = () => {
  const [orders, setOrders] = useState<OrderType[]>([])
  const [userGroups, setUserGroups] = useState<PermissionType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedStatus, setSelectedStatus] = useState<number | "all">("all")
  const [confirmingOrders, setConfirmingOrders] = useState<Set<string>>(new Set())
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set())
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
  const [bookCode, setBookCode] = useState<string>("")
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [isAcceptModalVisible, setIsAcceptModalVisible] = useState<boolean>(false)
  const [selectedAcceptOrder, setSelectedAcceptOrder] = useState<OrderType | null>(null)
  const [acceptBookCode, setAcceptBookCode] = useState<string>("")
  const [acceptSubmitting, setAcceptSubmitting] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")

  const statusOptions = [
    { value: "all", label: "Barcha buyurtmalar" },
    { value: 1, label: "Yangi buyurtmalar" },
    { value: 2, label: "Kitobni olib ketish mumkin!" },
    { value: 3, label: "O'qilayotganlar" },
    { value: 4, label: "Topshirish vaqti kelganlar" },
    { value: 5, label: "Topshirilishi kutilmoqda" },
    { value: 7, label: "Muddati o'tgan" },
  ]

  const calculateTimeRemaining = (finishedAt: string) => {
    const finishTime = new Date(finishedAt)
    const now = currentTime
    const timeDiff = finishTime.getTime() - now.getTime()

    if (timeDiff <= 0) {
      return "Muddat tugagan"
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

    return `${days} kun : ${hours.toString().padStart(2, "0")} soat : ${minutes.toString().padStart(2, "0")} minut : ${seconds.toString().padStart(2, "0")} sekund`
  }

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

  const handleAcceptOrder = async () => {
    if (!selectedAcceptOrder || !acceptBookCode.trim()) {
      antdMessage.error("Kitob kodini kiriting!")
      return
    }

    setAcceptSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const rolesStr = localStorage.getItem("isRoles") || "[]"
      const roles: string[] = JSON.parse(rolesStr)
      const matched = userGroups.filter((g) => roles.includes(g.group_id))
      const permissionCode = matched[0]?.permissionInfo.code_name || ""

      await axios.post(
        `${import.meta.env.VITE_API}/api/user-order/${selectedAcceptOrder.id}/return-check`,
        { book_code: acceptBookCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionCode,
          },
        },
      )

      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== selectedAcceptOrder.id))
      antdMessage.success("Kitob qabul qilindi")
      setIsAcceptModalVisible(false)
      setAcceptBookCode("")
      setSelectedAcceptOrder(null)

      fetchOrders(permissionCode)
    } catch (error) {
      console.error("Kitobni qabul qilishda xatolik:", error)

      let errorMessage = "Kitobni qabul qilishda xatolik yuz berdi"

      if (error) {
        errorMessage = "Kitob kodi noto'g'ri"
      }
      antdMessage.warning(errorMessage)
    } finally {
      setAcceptSubmitting(false)
    }
  }

  const handleSubmitOrder = async () => {
    if (!selectedOrder || !bookCode.trim()) {
      antdMessage.error("Kitob kodini kiriting!")
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const rolesStr = localStorage.getItem("isRoles") || "[]"
      const roles: string[] = JSON.parse(rolesStr)
      const matched = userGroups.filter((g) => roles.includes(g.group_id))
      const permissionCode = matched[0]?.permissionInfo.code_name || ""

      await axios.post(
        `${import.meta.env.VITE_API}/api/user-order/${selectedOrder.id}/checked`,
        { book_code: bookCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionCode,
          },
        },
      )

      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== selectedOrder.id))
      antdMessage.success("Kitob muvaffaqiyatli topshirildi!")
      setIsModalVisible(false)
      setBookCode("")
      setSelectedOrder(null)

      fetchOrders(permissionCode)
    } catch (error) {
      console.error("Kitobni topshirishda xatolik:", error)

      let errorMessage = "Kitobni topshirishda xatolik yuz berdi"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "object" && error !== null && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } }
        if (axiosError.response?.status === 400) {
          errorMessage = "Kitob kodi noto'g'ri"
        }
      }

      antdMessage.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenModal = (order: OrderType) => {
    setSelectedOrder(order)
    setIsModalVisible(true)
  }

  const handleCloseModal = () => {
    setIsModalVisible(false)
    setBookCode("")
    setSelectedOrder(null)
  }

  const handleOpenAcceptModal = (order: OrderType) => {
    setSelectedAcceptOrder(order)
    setIsAcceptModalVisible(true)
  }

  const handleCloseAcceptModal = () => {
    setIsAcceptModalVisible(false)
    setAcceptBookCode("")
    setSelectedAcceptOrder(null)
  }

  const renderActionButtons = (order: OrderType) => {
    const isConfirming = confirmingOrders.has(order.id)
    const isCancelling = cancellingOrders.has(order.id)

    switch (order.status_id) {
      case 1:
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCancelOrder(order)}
              disabled={isCancelling}
              className={`border rounded px-3 py-1 text-xs transition-all duration-200 ${
                isCancelling
                  ? "border-gray-400 bg-gray-400 text-white cursor-not-allowed opacity-60"
                  : "border-red-500 bg-red-500 text-white cursor-pointer hover:bg-red-600"
              }`}
            >
              {isCancelling ? "Bekor qilinmoqda..." : "Bekor qilish"}
            </button>
            <button
              onClick={() => handleConfirmOrder(order)}
              disabled={isConfirming}
              className={`border rounded px-3 py-1 text-xs transition-all duration-200 ${
                isConfirming
                  ? "border-gray-400 bg-gray-400 text-white cursor-not-allowed opacity-60"
                  : "border-green-500 bg-green-500 text-white cursor-pointer hover:bg-green-600"
              }`}
            >
              {isConfirming ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
            </button>
          </div>
        )
      case 2:
        return (
          <button
            onClick={() => handleOpenModal(order)}
            className="border border-green-500 bg-green-500 text-white rounded cursor-pointer px-3 py-1 text-xs hover:bg-green-600"
          >
            Topshirish
          </button>
        )
      case 3:
      case 4:
        return (
          <button
            onClick={() => handleOpenAcceptModal(order)}
            className="border border-orange-500 bg-orange-500 text-white rounded cursor-pointer px-3 py-1 text-xs hover:bg-orange-600"
          >
            Qabul qilish
          </button>
        )
      default:
        return null
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
    Promise.all([fetchOrders(permissionCode)]).finally(() => setLoading(false))
  }, [userGroups])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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

  const filteredOrders = (() => {
    let filtered =
      selectedStatus === "all"
        ? orders.filter((order) => order.status_id !== 8 && order.status_id !== 6)
        : orders.filter((order) => order.status_id === selectedStatus && order.status_id !== 8 && order.status_id !== 6)

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((order) => {
        const bookName = order.Book?.name?.toLowerCase() || ""
        const customerName = order.User?.full_name?.toLowerCase() || ""
        const bookCode = (order.book_code || order.Book?.book_code || "").toLowerCase()

        return bookName.includes(searchLower) || customerName.includes(searchLower) || bookCode.includes(searchLower)
      })
    }

    return filtered
  })()

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Barcha buyurtmalar</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="search"
              name="name"
              placeholder="Qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-55 pl-10 pr-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 mt-15">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {selectedStatus === "all" ? "Ma'lumotlar mavjud emas!" : "Tanlangan status bo'yicha buyurtma topilmadi!"}
            </p>
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
                    Kitob nomi
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Buyurtmachi
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Telefon raqami
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Topshirish vaqti
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Kitob kodi
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {order.Book?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {order.User?.full_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {order.User?.phone ? (
                        <a
                          href={`tel:${order.User.phone}`}
                          className="px-6 py-3 whitespace-nowrap text-center text-[13px] font-medium text-gray-600 dark:text-gray-400 underline"
                        >
                          {order.User.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status_id === 1
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : order.status_id === 2
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : order.status_id === 3
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : order.status_id === 4
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                  : order.status_id === 5
                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                    : order.status_id === 6
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                      : order.status_id === 7
                                        ? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                                        : "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400"
                        }`}
                      >
                        {order.status_message}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {order.status_id >= 3 && order.finished_at ? (
                        <span className="text-red-600 dark:text-red-400 font-mono text-xs">
                          {calculateTimeRemaining(order.finished_at)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {order?.book_code || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {renderActionButtons(order)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        title="Kitobni topshirish"
        open={isModalVisible}
        onOk={handleSubmitOrder}
        onCancel={handleCloseModal}
        okText="Yuborish"
        cancelText="Bekor qilish"
        confirmLoading={submitting}
        okButtonProps={{ disabled: !bookCode.trim() }}
      >
        <div className="py-4">
          <Input
            placeholder="Kitob kodi"
            value={bookCode}
            onChange={(e) => setBookCode(e.target.value)}
            onPressEnter={handleSubmitOrder}
            autoFocus
          />
        </div>
      </Modal>
      <Modal
        title="Kitobni qabul qilish"
        open={isAcceptModalVisible}
        onOk={handleAcceptOrder}
        onCancel={handleCloseAcceptModal}
        okText="Qabul qilish"
        cancelText="Bekor qilish"
        confirmLoading={acceptSubmitting}
        okButtonProps={{ disabled: !acceptBookCode.trim() }}
      >
        <div className="py-4">
          <Input
            placeholder="Kitob kodini kiriting"
            value={acceptBookCode}
            onChange={(e) => setAcceptBookCode(e.target.value)}
            onPressEnter={handleAcceptOrder}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  )
}

export default Order;