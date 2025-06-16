import { useState, ChangeEvent, FormEvent } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import axios, { AxiosError } from "axios";
import Label from "../form/Label";
import { message as antdMessage } from "antd";
import { useNavigate } from "react-router-dom";

interface FormData {
  passport_id: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    full_name: string;
    userGroups?: {
      group_id: string;
    }[];
  };
}

interface ErrorResponse {
  success: boolean;
  message: string;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passport_id, setPassportId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const validatePassportId = (id: string) => {
    const passportRegex = /^[A-Z]{2}\d{7}$/;
    return passportRegex.test(id);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePassportId(passport_id)) {
      antdMessage.warning("Passport ID faqat shu formatni qabul qiladi: AD1234567");
      return;
    }

    const payload: FormData = {
      passport_id,
      password,
    };

    try {
      setLoading(true);

      const response = await axios.post<LoginResponse>(
        `${import.meta.env.VITE_API}/api/admin/log`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const token = response.data.data.token;
        const full_name = response.data.data.full_name;
        const roles = response.data.data.userGroups?.map((item) => item.group_id);
        const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;

        localStorage.setItem("token", token);
        localStorage.setItem("name", full_name);
        localStorage.setItem("isRoles", JSON.stringify(roles));
        localStorage.setItem("token_expiry", expiry.toString());

        antdMessage.success("Kirish muvaffaqiyatli");
        navigate("/");

        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        antdMessage.error("Kirishda xatolik yuz berdi");
      }
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      if (err.response) {
        antdMessage.error(err.response.data.message);
      } else {
        antdMessage.error("Noma’lum xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-center text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Tizimga kirish
            </h1>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Passport ID kiriting <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="AD2072541"
                    value={passport_id}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setPassportId(e.target.value.toUpperCase()) // katta harf majburlash
                    }
                  />
                </div>
                <div>
                  <Label>
                    Parolni kiriting <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Parolni kiriting!"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button disabled={loading} className="w-full" size="sm">
                    {loading ? "Yuborilmoqda..." : "Kirish"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}