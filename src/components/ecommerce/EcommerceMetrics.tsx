import { useEffect, useState } from "react";
import { GroupIcon } from "../../icons";
import { GoBook } from "react-icons/go";
import { MdOutlineBook } from "react-icons/md";
import axios from "axios";

interface ResultType {
  books: number;
  users: number;
  issued: number;
}

interface PermissionInfoType {
  id: string;
  code_name: string;
}

interface PermissionType {
  id: string;
  group_id: string;
  permission_id: string;
  permissionInfo: PermissionInfoType;
}

interface BookType {
  id: string;
  name: string;
  year: number;
  page: number;
  books: number;
  auther_id: string;
  createdAt: string;
  updatedAt: string;
}

export default function EcommerceMetrics() {
  const [state, setState] = useState<ResultType>({
    books: 0,
    users: 0,
    issued: 0,
  });

  const [userGroup, setUserGroup] = useState<PermissionType[]>([]);

  const fetchPermission = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API}/api/group-permissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserGroup(response.data.data);
    } catch (err) {
      console.error("Ruxsatlarni olishda xatolik:", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const isRolesStr = localStorage.getItem("isRoles");
      const isRoles: string[] = isRolesStr ? JSON.parse(isRolesStr) : [];

      const matchedGroups = userGroup.filter((item) =>
        isRoles.includes(item.group_id)
      );

      const permissionIds = matchedGroups.map(
        (item) => item.permissionInfo.code_name
      );

      const response = await axios.get(
        `${import.meta.env.VITE_API}/api/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );

      setState((prev) => ({
        ...prev,
        users: response.data.data.users,
        issued: response.data.data.issued,
      }));
    } catch (err) {
      console.error("Dashboard ma'lumotlarini olishda xatolik:", err);
    }
  };

  const fetchBooksCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const isRolesStr = localStorage.getItem("isRoles");
      const isRoles: string[] = isRolesStr ? JSON.parse(isRolesStr) : [];

      const permissionRes = await axios.get<{ data: PermissionType[] }>(
        `${import.meta.env.VITE_API}/api/group-permissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const allPermissions = permissionRes.data.data;

      const matchedGroups = allPermissions.filter((item) =>
        isRoles.includes(item.group_id)
      );

      const permissionCodes = matchedGroups.map(
        (item) => item.permissionInfo.code_name
      );

      if (permissionCodes.length === 0) return;

      const booksRes = await axios.get<{ data: BookType[] }>(
        `${import.meta.env.VITE_API}/api/books`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionCodes[0],
          },
        }
      );

      const totalBooks = booksRes.data.data.reduce((sum, book) => {
        return sum + book.books;
      }, 0);

      setState((prev) => ({
        ...prev,
        books: totalBooks,
      }));
    } catch (error) {
      console.error("Kitoblar sonini olishda yoki ruxsatda xatolik:", error);
    }
  };

  useEffect(() => {
    fetchPermission();
    fetchBooksCount();
  }, []);

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchDashboardData();
    }
  }, [userGroup]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      <Card
        icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
        label="Barcha foydalanuvchilar soni"
        value={state.users}
      />
      <Card
        icon={<GoBook className="text-gray-800 size-6 dark:text-white/90" />}
        label="Barcha kitoblar soni"
        value={state.books}
      />
      <Card
        icon={<MdOutlineBook className="text-gray-800 size-6 dark:text-white/90" />}
        label="Foydalanishga berilgan kitoblar soni"
        value={state.issued}
      />
    </div>
  );
}

interface CardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function Card({ icon, label, value }: CardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {icon}
      </div>
      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value}
          </h4>
        </div>
      </div>
    </div>
  );
}