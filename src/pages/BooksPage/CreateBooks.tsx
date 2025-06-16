"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { message as antdMessage } from "antd"

interface AutherType {
  id: number
  name: string
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

const CreateBooks: React.FC = () => {
  const [auther, setAuthers] = useState<AutherType[]>([])
  const [userGroup, setUserGroup] = useState<PermissionType[]>([])
  const [selectedAutherId, setSelectedAutherId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const [bookName, setBookName] = useState<string>("")
  const [year, setYear] = useState<string>("")
  const [page, setPage] = useState<string>("")
  const [bookCode, setBookCode] = useState<string>("")
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchPermission = async (): Promise<void> => {
    const token: string | null = localStorage.getItem("token")
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

  useEffect(() => {
    fetchPermission()
  }, [])

  const fetchAuthers = async (): Promise<void> => {
    setFetchLoading(true)
    try {
      const token: string | null = localStorage.getItem("token")

      const isRolesStr: string | null = localStorage.getItem("isRoles")
      const isRoles: string[] = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups: PermissionType[] = userGroup.filter((item: PermissionType) =>
        isRoles.includes(item.group_id),
      )
      const permissionIds: string[] = matchedGroups?.map((item: PermissionType) => item.permissionInfo.code_name)

      const response = await axios.get(`${import.meta.env.VITE_API}/api/auther`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })
      setAuthers(response.data.data)
    } catch (err) {
      console.error("Autherlarni olishda xatolik:", err)
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => {
    if (userGroup.length > 0) {
      fetchAuthers()
    }
  }, [userGroup])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const filteredAuthers: AutherType[] = auther.filter((author: AutherType) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAutherSelect = (author: AutherType): void => {
    setSelectedAutherId(author.id.toString())
    setSearchTerm(author.name)
    setIsDropdownOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value: string = e.target.value
    setSearchTerm(value)
    setIsDropdownOpen(true)

    if (!value) {
      setSelectedAutherId(null)
    }
  }

  const handleInputFocus = (): void => {
    setIsDropdownOpen(true)
  }

  const handleDropdownToggle = (): void => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!bookName || !selectedAutherId || !year || !page || !bookCode) {
      antdMessage.warning("Barcha maydonlarni to'ldirish shart!")
      return
    }

    const data = {
      name: bookName,
      auther_id: Number(selectedAutherId),
      year: Number(year),
      page: Number(page),
      book_code: bookCode,
    }

    setSubmitLoading(true)
    try {
      const token: string | null = localStorage.getItem("token")

      const isRolesStr: string | null = localStorage.getItem("isRoles")
      const isRoles: string[] = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups: PermissionType[] = userGroup.filter((item: PermissionType) =>
        isRoles.includes(item.group_id),
      )
      const permissionIds: string[] = matchedGroups?.map((item: PermissionType) => item.permissionInfo.code_name)

      await axios.post(`${import.meta.env.VITE_API}/api/books`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
        },
      })

      antdMessage.success("Kitob muvaffaqiyatli qo'shildi!")
      setBookName("")
      setSelectedAutherId(null)
      setSearchTerm("")
      setYear("")
      setPage("")
      setBookCode("")
    } catch (err) {
      console.error("Kitob qo'shishda xatolik:", err)
      antdMessage.error("Kitob qo'shishda xatolik yuz berdi.")
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Kitob qo'shish</h2>
      {fetchLoading ? (
        <p className="text-gray-700 dark:text-gray-300">Ma'lumotlar yuklanmoqda...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="book" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kitob nomini kiriting!
          </label>
          <input
            id="book"
            name="name"
            type="text"
            value={bookName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookName(e.target.value)}
            placeholder="Sariq devni minib"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />

          {/* Searchable Author Select */}
          <div className="w-full md:col-span-2 mt-5" ref={dropdownRef}>
            <label htmlFor="auther" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
              Yozuvchini tanlang!
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="auther"
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="Kitob muallifini tanlang!"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white cursor-pointer"
                autoComplete="off"
              />

              {/* Dropdown arrow */}
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={handleDropdownToggle}
              >
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredAuthers.length > 0 ? (
                    filteredAuthers.map((author: AutherType) => (
                      <div
                        key={author.id}
                        onClick={() => handleAutherSelect(author)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white ${
                          selectedAutherId === author.id.toString()
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                            : ""
                        }`}
                      >
                        {author.name}
                        {selectedAutherId === author.id.toString() && <span className="float-right">✓</span>}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Yozuvchi topilmadi</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <label htmlFor="year" className="block font-medium text-gray-700 dark:text-gray-300 mt-5">
            Kitob chiqarilgan yilni kiriting!
          </label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(e.target.value)}
            placeholder="2024"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />

          <label htmlFor="page" className="block font-medium text-gray-700 dark:text-gray-300 mt-5">
            Kitob necha betligini kiriting!
          </label>
          <input
            id="page"
            type="number"
            value={page}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPage(e.target.value)}
            placeholder="256"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />

          <label htmlFor="book_code" className="block font-medium text-gray-700 dark:text-gray-300 mt-5">
            Kitob kodini kiriting!
          </label>
          <input
            id="book_code"
            type="text"
            value={bookCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookCode(e.target.value)}
            placeholder="DUN2023-002"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
          />

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md shadow-md transition mt-10 px-6 py-2"
          >
            {submitLoading ? "Yuborilmoqda..." : "Qo'shish"}
          </button>
        </form>
      )}
    </div>
  )
}

export default CreateBooks;