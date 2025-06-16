import axios from "axios";
import { useEffect, useState } from "react";

interface BookType {
  id: string;
  name: string;
  year: number;
  page: number;
  book_code: string;
}

interface PermissionType {
  id: string;
  group_id: string;
  permission_id: string;
  permissionInfo: {
    id: string;
    code_name: string;
  }
}

export default function RecentOrders() {
  const [data, setData] = useState<BookType[]>([]);
  const [userGroup, setUserGroup] = useState<PermissionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPermission = async () => {
    const token = localStorage.getItem("token"); 
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setUserGroup(response.data.data);
    } catch (err) {
      console.error("Muallifni olishda xatolik:", err);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPermission();
  },[]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const isRolesStr = localStorage.getItem("isRoles");
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : [];
      const matchedGroups = userGroup.filter(item => isRoles.includes(item.group_id));
      const permissionIds = matchedGroups?.map((item)=> item.permissionInfo.code_name);

      const response = await axios.get<{ data: BookType[] }>(
        `${import.meta.env.VITE_API}/api/books`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0]
          }
        }
      );
      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Foydalanuvchilarni olishda xatolik:", error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userGroup.length > 0) {
      fetchData();
    }
  }, [userGroup]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Shu kunlardagi buyurtmalar
        </h3>
      </div>
      <div className="my-10">
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">Ma'lumotlar yuklanmoqda...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">Hech qanday kitob topilmadi</p>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="text-center px-6 py-4 text-sm font-medium text-gray-700 dark:text-white tracking-wider">#</th>
                <th className="w-1/4 text-left px-6 py-4 text-sm font-medium text-gray-700 dark:text-white tracking-wider">Kitob nomi</th>
                <th className="w-1/4 text-center px-6 py-4 text-sm font-medium text-gray-700 dark:text-white tracking-wider">Kitob chiqarilgan yil</th>
                <th className="w-1/4 text-center px-6 py-4 text-sm font-medium text-gray-700 dark:text-white tracking-wider">Kitob varaqasi</th>
                <th className="w-1/4 text-center px-6 py-4 text-sm font-medium text-gray-700 dark:text-white tracking-wider">Kitob kodi</th>
              </tr>
            </thead>
            <tbody className="">
              {data.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white border-b dark:border-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-800 dark:text-white border-b dark:border-gray-700">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white border-b dark:border-gray-700">
                    {item.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white border-b dark:border-gray-700">
                    {item.page}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white border-b dark:border-gray-700">
                    {item.book_code}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}