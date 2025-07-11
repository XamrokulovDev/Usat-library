import React, { useState, useEffect, useRef, type FormEvent } from "react";
import { Button, Input, Modal, message as antdMessage } from "antd";
import axios from "axios";
import TeacherStaff, { type StaffRef } from "./TeaStaff";
import { Users } from "lucide-react";

interface FormData {
  fullname: string;
  passport_id: string;
  phone: string;
  password: string;
  is_active: boolean;
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

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-800 dark:text-gray-800 mb-1">
    {children}
  </label>
);

const Teacher = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fullname, setFullName] = useState("");
  const [passport_id, setPassportId] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [userGroup, setUserGroup] = useState<PermissionType[]>([]);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const teacherRef = useRef<StaffRef>(null);
  const handleOpenModal = () => setIsModalOpen(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearForm();
  };

  const clearForm = () => {
    setFullName("");
    setPassportId("");
    setPhone("");
    setPassword("");
    setShowPassword(false);
  };

  const fetchPermission = async () => {
    const token = localStorage.getItem("token");
    setFetchLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserGroup(response.data.data);
    } catch (err) {
      console.error("Ruxsatnomalarni olishda xatolik:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchPermission();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullname || !passport_id || !phone || !password) {
      antdMessage.warning("Barcha maydonlarni to‘ldiring!");
      return;
    }

    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(phone)) {
      antdMessage.warning("Telefon raqam formatini to‘g‘ri kiriting: +99890***2423");
      return;
    }

    const payload: FormData = {
      fullname,
      passport_id,
      phone,
      password,
      is_active: true,
    };

    setSubmitLoading(true);
    try {
      const token = localStorage.getItem("token");

      const isRolesStr = localStorage.getItem("isRoles");
      const isRoles = isRolesStr ? JSON.parse(isRolesStr) : [];
      const matchedGroups = userGroup.filter((item) => isRoles.includes(item.group_id));
      const permissionIds = matchedGroups?.map((item) => item.permissionInfo.code_name);

      const response = await axios.post(`${import.meta.env.VITE_API}/api/teachers`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      });

      if (response.data.success) {
        antdMessage.success("O‘qituvchi muvaffaqiyatli qo‘shildi!");
        handleCloseModal();
        teacherRef.current?.refreshStaff();
      } else {
        antdMessage.error("Ro‘yxatdan o‘tishda xatolik!");
      }
    } catch (err) {
      console.error("Xatolik:", err);
      antdMessage.error("Tizimda xatolik yuz berdi!");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          O‘qituvchilar
        </h3>
      </div>

      <div className="flex items-center justify-end mt-4">
        <button
          onClick={handleOpenModal}
          className="bg-gray-500 dark:bg-gray-700 text-white rounded-lg px-4 py-2"
        >
          O‘qituvchi qo‘shish
        </button>
      </div>
      {/* AGAR LOADING BO‘LSA SPINNER KO‘RSAT */}
      {fetchLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-300">Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="mt-10">
          <TeacherStaff ref={teacherRef} />
        </div>
      )}
      <Modal
        title="O‘qituvchi qo‘shish"
        open={isModalOpen}
        centered
        onCancel={handleCloseModal}
        footer={null}
      >
        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          <div>
            <Label>To‘liq ism</Label>
            <Input value={fullname} onChange={(e) => setFullName(e.target.value)} placeholder="To‘liq ism" />
          </div>
          <div>
            <Label>Passport ID</Label>
            <Input value={passport_id} onChange={(e) => setPassportId(e.target.value)} placeholder="AD1234567" />
          </div>
          <div>
            <Label>Telefon raqami</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998901234567" />
          </div>
          <div>
            <Label>Parol</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol o‘ylab toping"
            />
          </div>
          <div>
            <Button
              htmlType="submit"
              type="primary"
              loading={submitLoading}
              className="w-full"
            >
              {submitLoading ? "Yuborilmoqda..." : "Ro‘yxatga olish"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Teacher;