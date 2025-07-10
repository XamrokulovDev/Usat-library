import axios from "axios";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

interface TeacherType {
  id: number;
  fullname: string;
  phone: string;
  passport_id: string;
}

interface PermissionType {
  id: string;
  group_id: string;
  permission_id: string;
  permissionInfo: {
    id: string;
    code_name: string;
  };
}

export interface StaffRef {
  refreshStaff: () => void;
}

const TeacherStaff = forwardRef<StaffRef>((_, ref) => {
  const [teachers, setTeachers] = useState<TeacherType[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);
  const [permissionCode, setPermissionCode] = useState<string | null>(null);

  const fetchPermission = async () => {
    const token = localStorage.getItem("token");
    setFetchLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allPermissions: PermissionType[] = response.data.data;
      const isRolesStr = localStorage.getItem("isRoles");
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : [];
      const matchedGroups = allPermissions.filter((item) => isRoles.includes(item.group_id));
      const codes = matchedGroups.map((item) => item.permissionInfo.code_name);
      if (codes.length > 0) setPermissionCode(codes[0]);
    } catch (err) {
      console.error("Ruxsatnoma olishda xatolik:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchTeachers = async () => {
    if (!permissionCode) return;
    setFetchLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API}/api/teachers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionCode,
        },
      });
      setTeachers(response.data.data);
    } catch (err) {
      console.error("O‘qituvchilarni olishda xatolik:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!permissionCode) return;
    setDeleteLoadingId(id);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API}/api/teachers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionCode,
        },
      });
      fetchTeachers();
    } catch (err) {
      console.error("O‘qituvchini o‘chirishda xatolik:", err);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  useImperativeHandle(ref, () => ({
    refreshStaff: fetchTeachers,
  }));

  useEffect(() => {
    fetchPermission();
  }, []);

  useEffect(() => {
    if (permissionCode) fetchTeachers();
  }, [permissionCode]);

  return (
    <div>
      {fetchLoading ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">Yuklanmoqda...</p>
      ) : teachers.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">O‘qituvchilar mavjud emas</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">#</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">Ism</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">Telefon</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">Passport ID</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white">O‘chirish</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {teachers.map((item, index) => (
              <tr key={item.id}>
                <td className="text-center text-gray-800 dark:text-white px-6 py-4">{index + 1}</td>
                <td className="text-center text-gray-800 dark:text-white px-6 py-4">{item.fullname}</td>
                <td className="text-center text-gray-800 dark:text-white px-6 py-4">{item.phone}</td>
                <td className="text-center text-gray-800 dark:text-white px-6 py-4">{item.passport_id}</td>
                <td className="text-center text-gray-800 dark:text-white px-6 py-4">
                  {deleteLoadingId === item.id ? (
                    <span className="text-gray-500 dark:text-gray-400">O‘chirilmoqda...</span>
                  ) : (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      O‘chirish
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
});

TeacherStaff.displayName = "TeacherStaff";

export default TeacherStaff;