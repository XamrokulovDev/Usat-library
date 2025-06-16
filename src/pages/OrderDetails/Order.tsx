import axios from "axios"
import { useEffect, useState } from "react"

interface PermissionType {
  id: string
  group_id: string
  permission_id: string
  permissionInfo: {
    id: string
    code_name: string
  }
}

const Order = () => {
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [order, setOrder] = useState<PermissionType[]>([])

  const fetchPermission = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setUserGroup(response.data.data)
    } catch (err) {
      console.error("Muallifni olishda xatolik:", err)
    }
  }

  const fetchFaculties = async () => {
    try {
      const token = localStorage.getItem("token")
  
      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id))
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name)
  
      const response = await axios.get(`${import.meta.env.VITE_API}/api/user-order`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setOrder(response.data.data);
      console.log(response.data.data);
    } catch (err) {
      console.error("Yo'nalishlarni olishda xatolik:", err)
    }
  }

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchFaculties()
    }
  }, [userGroup])

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Barcha Buyurtmalar</h2>
    </div>
  )
}

export default Order;