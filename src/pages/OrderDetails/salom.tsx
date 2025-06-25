import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import axios from "axios"
import { GraduationCap, Search } from "lucide-react"
import type { PermissionType } from "../../types/types"

interface OrderType {
  name: string
  status: string
  created_at: string
}

interface KafedraUserType {
  full_name: string
  phone: string
  kafedra: string
  yonalish: string
  group: string
  orders: OrderType[]
}

interface FlattenedOrderType {
  full_name: string
  phone: string
  kafedra: string
  yonalish: string
  group: string
  order_name: string
  order_status: string
  order_created_at: string
}

const KafedraDetail: React.FC = () => {
  const { kafedraName } = useParams<{ kafedraName: string }>()
  const [userGroups, setUserGroups] = useState<PermissionType[]>([])
  const [kafedraData, setKafedraData] = useState<KafedraUserType[]>([])
  const [flattenedOrders, setFlattenedOrders] = useState<FlattenedOrderType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const navigate = useNavigate()
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const [permissionLoading, setPermissionLoading] = useState<boolean>(true)

  const [selectedYonalish, setSelectedYonalish] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [searchValue, setSearchValue] = useState<string>("")
  const [filteredOrders, setFilteredOrders] = useState<FlattenedOrderType[]>([])
  const decodedKafedraName = kafedraName ? decodeURIComponent(kafedraName).replace(/-/g, " ") : ""

  const fetchPermission = async () => {
    const token = localStorage.getItem("token")
    setPermissionLoading(true)

    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []

      if (isRoles.includes("1")) {
        setHasPermission(true)
      } else if (isRoles.includes("4") || isRoles.includes("5")) {
        setHasPermission(true)
      } else {
        const matchedGroups = response.data.data.filter((item: PermissionType) => isRoles.includes(item.group_id))
        const permissionIds = matchedGroups?.map((item: PermissionType) => item.permissionInfo.code_name)

        if (permissionIds.includes("kafedralar") || permissionIds.includes("kafedra_detail")) {
          setHasPermission(true)
        } else {
          setHasPermission(false)
          setTimeout(() => {
            navigate("/")
          }, 1000)
        }
      }

      setUserGroups(response.data.data)
    } catch (err) {
      console.error("Permission tekshirishda xatolik:", err)
      setHasPermission(false)
    } finally {
      setPermissionLoading(false)
    }
  }

  const fetchKafedraOrders = async (permissionHeader: string) => {
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.get(`${import.meta.env.VITE_API}/api/all-orders-kafedra`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionHeader,
        },
      })

      const filteredData = data.data.filter(
        (item: KafedraUserType) => item.kafedra.toLowerCase() === decodedKafedraName.toLowerCase(),
      )

      setKafedraData(filteredData)
    } catch (error) {
      console.error("Kafedra ma'lumotlarini olishda xatolik:", error)
    }
  }

  const flattenOrdersData = () => {
    const flattened: FlattenedOrderType[] = []

    kafedraData.forEach((user) => {
      if (user.orders && user.orders.length > 0) {
        user.orders.forEach((order) => {
          flattened.push({
            full_name: user.full_name,
            phone: user.phone,
            kafedra: user.kafedra,
            yonalish: user.yonalish,
            group: user.group,
            order_name: order.name,
            order_status: order.status,
            order_created_at: order.created_at,
          })
        })
      }
    })

    setFlattenedOrders(flattened)
  }

  const getUniqueYonalishlar = () => {
    const yonalishlar = flattenedOrders.map((order) => order.yonalish)
    return [...new Set(yonalishlar)].filter((y) => y !== "Noma'lum").sort()
  }

  const getUniqueGroups = () => {
    const groups = flattenedOrders.map((order) => order.group)
    return [...new Set(groups)].filter((g) => g !== "Noma'lum").sort()
  }

  const getUniqueStatuses = () => {
    const statuses = flattenedOrders.map((order) => order.order_status)
    return [...new Set(statuses)].filter((s) => s !== "Noma'lum").sort()
  }

  const applyFilters = () => {
    let filtered = flattenedOrders

    if (selectedYonalish) {
      filtered = filtered.filter((order) => order.yonalish === selectedYonalish)
    }

    if (selectedGroup) {
      filtered = filtered.filter((order) => order.group === selectedGroup)
    }

    if (selectedStatus) {
      filtered = filtered.filter((order) => order.order_status === selectedStatus)
    }

    if (searchValue.trim()) {
      filtered = filtered.filter((order) => order.full_name.toLowerCase().includes(searchValue.toLowerCase()))
    }

    setFilteredOrders(filtered)
  }

  useEffect(() => {
    fetchPermission()
  }, [])

  useEffect(() => {
    if (userGroups.length === 0 || !hasPermission) return
    const rolesStr = localStorage.getItem("isRoles") || "[]"
    const roles: string[] = JSON.parse(rolesStr)
    const matched = userGroups.filter((g) => roles.includes(g.group_id))
    const permissionCode = matched[0]?.permissionInfo.code_name || ""
    fetchKafedraOrders(permissionCode).finally(() => setLoading(false))
  }, [userGroups, hasPermission])

  useEffect(() => {
    if (kafedraData.length > 0) {
      flattenOrdersData()
    }
  }, [kafedraData])

  useEffect(() => {
    applyFilters()
  }, [flattenedOrders, selectedYonalish, selectedGroup, selectedStatus, searchValue])

  const getStatusColor = (status: string) => {
    if (status.includes("Buyurtma berildi")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    } else if (status.includes("Olib ketilgan")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    } else if (status.includes("O'qilmoqda")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    } else if (status.includes("Topshirish vaqti keldi")) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    } else if (status.includes("Topshirilishi kutilmoqda")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    } else if (status.includes("Bekor qilindi")) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    } else if (status.includes("Qora ro'yxatda")) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    } else if (status.includes("Arxiv")) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    } else {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  if (permissionLoading) {
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

  if (!hasPermission) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ruxsat yo'q</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4"></p>
            <p className="text-sm text-gray-500 dark:text-gray-500"></p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg"></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {decodedKafedraName} Kafedra Buyurtmalari
          </h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="search"
            name="name"
            placeholder="Ism bo'yicha qidiruv"
            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6 mt-15">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  #
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  F.I.Sh
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Telefon
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Kafedra
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  <select
                    value={selectedYonalish}
                    onChange={(e) => setSelectedYonalish(e.target.value)}
                    className="mt-1 w-full border border-gray-200 dark:border-gray-600 outline-none rounded px-2 py-1 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Yo'nalish</option>
                    {getUniqueYonalishlar().map((yonalish) => (
                      <option key={yonalish} value={yonalish}>
                        {yonalish}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="mt-1 w-full border border-gray-200 dark:border-gray-600 outline-none rounded px-2 py-1 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Guruh</option>
                    {getUniqueGroups().map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Kitob nomi
                </th>
                <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mt-1 w-full border border-gray-200 dark:border-gray-600 outline-none rounded px-2 py-1 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Holat</option>
                    {getUniqueStatuses().map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {decodedKafedraName} kafedra uchun ma'lumot topilmadi!
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((item, index) => (
                  <tr key={`${item.full_name}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {item.full_name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {item.phone ? (
                        <a
                          href={`tel:${item.phone}`}
                          className="text-[13px] font-medium text-gray-600 dark:text-gray-400 underline"
                        >
                          {item.phone}
                        </a>
                      ) : (
                        "Ma'lumot yo'q"
                      )}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {item.kafedra}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {item.yonalish}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {item.group}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                      {item.order_name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-sm font-medium">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.order_status)}`}
                      >
                        {item.order_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default KafedraDetail;