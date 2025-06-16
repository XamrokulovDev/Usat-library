import axios from "axios";
import React, { useEffect, useState } from "react";

export interface UsersType {
  id: string;
  full_name: string;
  passport_id: string;
  phone: string;
  StudentGroup: {
    id: string;
    name: string;
    Yonalish: {
      id: string;
      name: string;
      Kafedra: {
        id: string;
        name: string;
      };
    };
  };
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

const UsersAll: React.FC = () => {
  const [data, setData] = useState<UsersType[]>([]);
  const [selectedKafedra, setSelectedKafedra] = useState<string>("");
  const [selectedYonalish, setSelectedYonalish] = useState<string>("");
  const [selectedGuruh, setSelectedGuruh] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [userGroup, setUserGroup] = useState<PermissionType[]>([]);
  const [finalFilteredData, setFinalFilteredData] = useState<UsersType[]>([]);

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
    }
  };
  useEffect(() => {
    fetchPermission();
  },[])

  const getUniqueKafedralar = (): { id: string; name: string }[] => {
    const validData = data.filter(u => 
      u.StudentGroup && 
      u.StudentGroup.Yonalish && 
      u.StudentGroup.Yonalish.Kafedra
    );
    
    const kafedralar = validData.map(u => u.StudentGroup.Yonalish.Kafedra);
    return Array.from(new Map(kafedralar.map(k => [k.id, k])).values());
  };

  const getUniqueYonalishlar = (): { id: string; name: string }[] => {
    const validData = data.filter(u => 
      u.StudentGroup && 
      u.StudentGroup.Yonalish
    );
    
    let yonalishlar = validData.map(u => u.StudentGroup.Yonalish);
    
    if (selectedKafedra) {
      yonalishlar = yonalishlar.filter(y => 
        y.Kafedra && y.Kafedra.id === selectedKafedra
      );
    }
    
    return Array.from(new Map(yonalishlar.map(y => [y.id, y])).values());
  };

  const getUniqueGuruhlar = (): { id: string; name: string }[] => {
    const validData = data.filter(u => u.StudentGroup);
    
    let guruhlar = validData.map(u => u.StudentGroup);

    if (selectedKafedra) {
      guruhlar = guruhlar.filter(g => 
        g.Yonalish && 
        g.Yonalish.Kafedra && 
        g.Yonalish.Kafedra.id === selectedKafedra
      );
    }

    if (selectedYonalish) {
      guruhlar = guruhlar.filter(g => 
        g.Yonalish && 
        g.Yonalish.id === selectedYonalish
      );
    }

    return Array.from(new Map(guruhlar.map(g => [g.id, g])).values());
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const isRolesStr = localStorage.getItem("isRoles");
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : [];
      const matchedGroups = userGroup.filter(item => isRoles.includes(item.group_id));
      const permissionIds = matchedGroups?.map((item)=> item.permissionInfo.code_name);

      const response = await axios.get<{ data: UsersType[] }>(
        `${import.meta.env.VITE_API}/api/all-users`,
        {
           headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0]
          }
        }
      );
      setData(response.data.data);
    } catch (error) {
      console.error("Foydalanuvchilarni olishda xatolik:", error);
    }
  };
  useEffect(() => {
    if (userGroup.length > 0) {
      fetchData();
    }
  }, [userGroup]);

  useEffect(() => {
    let filtered = data;

    if (selectedKafedra) {
      filtered = filtered.filter(u => 
        u.StudentGroup && 
        u.StudentGroup.Yonalish && 
        u.StudentGroup.Yonalish.Kafedra && 
        u.StudentGroup.Yonalish.Kafedra.id === selectedKafedra
      );
    }

    if (selectedYonalish) {
      filtered = filtered.filter(u => 
        u.StudentGroup && 
        u.StudentGroup.Yonalish && 
        u.StudentGroup.Yonalish.id === selectedYonalish
      );
    }

    if (selectedGuruh) {
      filtered = filtered.filter(u => 
        u.StudentGroup && 
        u.StudentGroup.id === selectedGuruh
      );
    }

    if (searchValue.trim()) {
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Final filtered data with validation check
    const validFilteredData = filtered.filter(
      u =>
        u.StudentGroup &&
        u.StudentGroup.Yonalish &&
        u.StudentGroup.Yonalish.Kafedra
    );
    setFinalFilteredData(validFilteredData);
  }, [selectedKafedra, selectedYonalish, selectedGuruh, searchValue, data]);

  const handleKafedraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKafedra(e.target.value);
    setSelectedYonalish("");
    setSelectedGuruh("");
  };

  const handleYonalishChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYonalish(e.target.value);
    setSelectedGuruh("");
  };

  const handleGuruhChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGuruh(e.target.value);
  };

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Barcha foydalanuvchilar
        </h2>
        <div className="relative">
          <input
            id="search"
            name="name"
            placeholder="Qidiruv"
            className="border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-1 focus:ring-gray-500 focus:outline-none dark:bg-gray-700 dark:text-white pr-5 px-5 py-2"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto my-20">
        {finalFilteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Foydalanuvchilar mavjud emas!
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-white uppercase tracking-wider">
                  #
                </th>
                <th className="w-1/5 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Ism familiya
                </th>
                <th className="w-1/5 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white tracking-wider">
                  Passport
                </th>
                <th className="w-1/5 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white uppercase tracking-wider">
                  <select
                    className="mt-1 w-full border border-gray-300 dark:border-gray-500 outline-none rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                    value={selectedKafedra}
                    onChange={handleKafedraChange}
                  >
                    <option value="">
                      Kafedra
                    </option>
                    {getUniqueKafedralar().map(k => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="w-1/5 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white uppercase tracking-wider">
                  <select
                    className="mt-1 w-full border border-gray-300 dark:border-gray-500 outline-none rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                    value={selectedYonalish}
                    onChange={handleYonalishChange}
                  >
                    <option value="">
                      Yo'nalish
                    </option>
                    {getUniqueYonalishlar().map(y => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                </th>
                <th className="w-1/5 text-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-white uppercase tracking-wider">
                  <select
                    className="mt-1 w-full border border-gray-300 dark:border-gray-500 outline-none rounded px-2 py-1 dark:bg-gray-700 dark:text-white"
                    value={selectedGuruh}
                    onChange={handleGuruhChange}
                  >
                    <option value="">
                      Guruh
                    </option>
                    {getUniqueGuruhlar().map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {finalFilteredData.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.05] transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                    {index + 1}
                  </td>
                  <td className="w-1/5 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.full_name}
                  </td>
                  <td className="w-1/5 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.passport_id}
                  </td>
                  <td className="w-1/5 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.StudentGroup.Yonalish.Kafedra.name}
                  </td>
                  <td className="w-1/5 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.StudentGroup.Yonalish.name}
                  </td>
                  <td className="w-1/5 text-center px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {item.StudentGroup.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsersAll;