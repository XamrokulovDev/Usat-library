import axios from "axios";
import { useEffect, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { Modal } from "antd";

interface BookType {
  id: string;
  name: string;
  year: number;
  page: number;
  books: string;
  book_count: string;
  description: string;
  auther_id?: number;
  image?: {
    url: string;
  };
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

interface AutherType {
  id: number;
  auther_id: string;
  name: string;
}

const Books = () => {
  const [data, setData] = useState<BookType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [userGroup, setUserGroup] = useState<PermissionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<BookType | null>(null);
  const [auther, setAuthers] = useState<AutherType[]>([]);

  const sliceDescription = (text: string): string => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= 3) {
      return words.join(" ");
    }
    return words.slice(0, 3).join(" ") + "...";
  };

  const fetchPermission = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const isRolesStr = localStorage.getItem("isRoles");
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : [];
      const matchedGroups = userGroup.filter((item) =>
        isRoles.includes(item.group_id)
      );
      const permissionIds = matchedGroups?.map(
        (item) => item.permissionInfo.code_name
      );

      const response = await axios.get(
        `${import.meta.env.VITE_API}/api/group-permissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );
      setUserGroup(response.data.data);
    } catch (err) {
      console.error("Muallifni olishda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermission();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const isRolesStr = localStorage.getItem("isRoles");
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : [];
      const matchedGroups = userGroup.filter((item) =>
        isRoles.includes(item.group_id)
      );
      const permissionIds = matchedGroups?.map(
        (item) => item.permissionInfo.code_name
      );

      const response = await axios.get<{ data: BookType[] }>(
        `${import.meta.env.VITE_API}/api/books`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Foydalanuvchilarni olishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchData();
    }
  }, [userGroup]);

  const showDeleteModal = (book: BookType) => {
    setSelectedBook(book);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteOk = async () => {
    if (!selectedBook) return;

    try {
      const token = localStorage.getItem("token");
      const isRolesStr = localStorage.getItem("isRoles");
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : [];
      const matchedGroups = userGroup.filter((item) =>
        isRoles.includes(item.group_id)
      );
      const permissionIds = matchedGroups?.map(
        (item) => item.permissionInfo.code_name
      );

      await axios.delete(
        `${import.meta.env.VITE_API}/api/books/${selectedBook.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );

      fetchData();
      setIsDeleteModalVisible(false);
      setSelectedBook(null);
    } catch (error) {
      console.error("Kitobni o'chirishda xatolik:", error);
    }
  };

  const fetchAuthers = async (): Promise<void> => {
    try {
      const token: string | null = localStorage.getItem("token");
      const isRolesStr: string | null = localStorage.getItem("isRoles");
      const isRoles: string[] = isRolesStr ? JSON.parse(isRolesStr) : [];
      const matchedGroups: PermissionType[] = userGroup.filter(
        (item: PermissionType) => isRoles.includes(item.group_id)
      );
      const permissionIds: string[] = matchedGroups?.map(
        (item: PermissionType) => item.permissionInfo.code_name
      );
      const response = await axios.get(
        `${import.meta.env.VITE_API}/api/auther`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );
      setAuthers(response.data.data);
    } catch (err) {
      console.error("Autherlarni olishda xatolik:", err);
    }
  };
  useEffect(() => {
    if (userGroup.length > 0) {
      fetchAuthers();
    }
  }, [userGroup]);

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setSelectedBook(null);
  };

  const filteredBooks = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Yuklanmoqda...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Barcha kitoblar
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="search"
              name="name"
              placeholder="Qidiruv..."
              className="w-55 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-6 mt-15 mb-3">
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Ma'lumotlar mavjud emas!
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
                      Kitob muallifi
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Kitob tavsifi
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Kitob chiqarilgan yil
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Kitob varaqasi
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Kitob soni
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Qolgan kitoblar
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      Rasmi
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                      O'chirish
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredBooks.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {index}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {auther.find((a) => a.id === item.auther_id)?.name || "-"}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {sliceDescription(item?.description)}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {item.year}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {item.page}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {item.books}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium text-gray-800 dark:text-white">
                        {item.book_count}
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center text-blue-500 dark:text-blue-500 underline cursor-pointer">
                        <button onClick={() => setSelectedBooks(item)}>
                          ko'rish
                        </button>
                      </td>
                      <td className="px-6 py-2 whitespace-nowrap text-center">
                        <button
                          className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md transition-all duration-300"
                          onClick={() => showDeleteModal(item)}
                        >
                          O'chirish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* DELETE MODAL */}
        <Modal
          title="Kitobni o'chirish"
          open={isDeleteModalVisible}
          onOk={handleDeleteOk}
          onCancel={handleDeleteCancel}
          okText="O'chirish"
          cancelText="Yo'q"
        >
          <p>
            {selectedBook
              ? `"${selectedBook.name}" kitobini o'chirmoqchimisiz?`
              : ""}
          </p>
        </Modal>
      </div>
      {selectedBooks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="h-[90%] bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg relative overflow-hidden flex items-center justify-center">
            <button
              onClick={() => setSelectedBooks(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
            {selectedBooks?.image?.url && (
              <img
                src={`${import.meta.env.VITE_API}${
                  selectedBooks.image.url.startsWith("/") ? "" : "/"
                }${selectedBooks.image.url}`}
                alt={selectedBooks.name}
                className="rounded-lg w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Books;