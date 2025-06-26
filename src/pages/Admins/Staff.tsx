import axios from "axios"
import { useEffect, useState, forwardRef, useImperativeHandle } from "react"

interface StaffType {
  id: number
  user: {
    full_name: string
    passport_id: string
    phone: string
  } | null
  groupInfo: {
    name: string
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

export interface StaffRef {
  refreshStaff: () => void
}

const Staff = forwardRef<StaffRef>((_, ref) => {
  const [staff, setStaff] = useState<StaffType[]>([])
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)

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

  const fetchStaff = async () => {
    setFetchLoading(true)
    try {
      const token = localStorage.getItem("token")

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/admin/all-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setStaff(response.data.data)
    } catch (err) {
      console.error("Yo'nalishlarni olishda xatolik:", err)
    } finally {
      setFetchLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    refreshStaff: () => {
      if (userGroup.length > 0) {
        fetchStaff()
      }
    },
  }))

  useEffect(() => {
    fetchPermission()
  }, [])

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchStaff()
    }
  }, [userGroup])

  const validStaff = staff.filter((item) => {
    const user = item.user
    const groupName = item.groupInfo?.name?.toLowerCase()
    return (
      user &&
      user.full_name &&
      user.phone &&
      user.passport_id &&
      (groupName === "admin" || groupName === "kutubxonachi" || groupName === "direktor" || groupName === "dekanat")
    )
  })

  return (
    <div>
      {fetchLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Yuklanmoqda...</p>
          </div>
        </div>
      ) : validStaff.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Xodimlar hozircha mavjud emas</p>
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
                Lavozimi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {validStaff.map((item, index) => (
              <tr key={item.id}>
                <td className="text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {index + 1}
                </td>
                <td className="w-1/4 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {item?.user!.full_name}
                </td>
                <td className="w-1/4 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {item?.user!.phone}
                </td>
                <td className="w-1/4 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {item?.user!.passport_id}
                </td>
                <td className="w-1/4 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {item?.groupInfo!.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
})

Staff.displayName = "Staff"

export default Staff;