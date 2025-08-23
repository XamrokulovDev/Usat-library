import axios from "axios"
import { GraduationCap, Search } from "lucide-react"
import { useEffect, useState } from "react"

interface OrderType {
  name: string
  status: string
  created_at: string
}

interface KafedraUserType {
  full_name: string
  phone: string
  yonalish: string
  group: string
  orders: OrderType[]
}

interface FlattenedOrderType {
  full_name: string
  phone: string
  yonalish: string
  group: string
  order_name: string
  order_status: string
  order_created_at: string
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

const Direktor = () => {
  const [userGroups, setUserGroups] = useState<PermissionType[]>([])
  const [kafedraData, setKafedraData] = useState<KafedraUserType[]>([])
  const [flattenedOrders, setFlattenedOrders] = useState<FlattenedOrderType[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const [selectedYonalish, setSelectedYonalish] = useState<string>("")
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [searchValue, setSearchValue] = useState<string>("")
  const [filteredOrders, setFilteredOrders] = useState<FlattenedOrderType[]>([])

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

  const fetchKafedraOrders = async (permissionHeader: string) => {
    try {
      const token = localStorage.getItem("token")
      const { data } = await axios.get(`${import.meta.env.VITE_API}/api/all-orders-kafedra/kafedra`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionHeader,
        },
      })
      setKafedraData(data.data)
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
            yonalish: user.yonalish,
            group: user.group,
            order_name: order.name,
            order_status: order.status,
            order_created_at: order.created_at,
          })
        })
      }
    })
    setFlattenedOrders(flattened);
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
    fetchPermissions()
  }, [])

  useEffect(() => {
    if (userGroups.length === 0) return
    const rolesStr = localStorage.getItem("isRoles") || "[]"
    const roles: string[] = JSON.parse(rolesStr)
    const matched = userGroups.filter((g) => roles.includes(g.group_id))
    const permissionCode = matched[0]?.permissionInfo.code_name || ""
    fetchKafedraOrders(permissionCode).finally(() => setLoading(false))
  }, [userGroups])

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
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    } else {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
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
          <GraduationCap className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Kafedra buyurtmalari</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="search"
            name="name"
            placeholder="Qidiruv..."
            className="w-55 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-6 mt-15 mb-3">
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
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Bu filterga mos ma'lumot mavjud emas!</p>
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
                          className="px-6 py-3 whitespace-nowrap text-center text-[13px] font-medium text-gray-600 dark:text-gray-400 underline"
                        >
                          {item.phone}
                        </a>
                      ) : (
                        "Ma'lumot yo'q"
                      )}
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

export default Direktor;