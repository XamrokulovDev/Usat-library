import axios, { AxiosError } from "axios";
import { BookOpen, ChevronDown, Upload, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Modal, message as antdMessage } from "antd";

interface PermissionType {
  id: string;
  group_id: string;
  permission_id: string;
  permissionInfo: {
    id: string;
    code_name: string;
  };
}

interface BookType {
  id: string;
  name: string;
  year: number;
  page: number;
  books: string;
}

interface LanguageType {
  id: string;
  name: string;
}

interface AlphabetType {
  id: string;
  name: string;
}

interface StatusType {
  id: string;
  name: string;
}

interface KafedraType {
  id: string;
  name_uz: string;
}

interface CategoryType {
  id: string;
  name_uz: string;
}

interface BookItemType {
  id: string;
  book_id: number;
  language_id: number;
  alphabet_id: number;
  status_id: number;
  kafedra_id: number;
  category_id: number | string;
  BookCategoryKafedra?: {
    category: {
      name_uz: string;
    };
    kafedra: {
      name_uz: string;
    };
  };
  PDFFile: {
    file_url: string;
    original_name?: string;
  };
  createdAt: string;
  updatedAt: string;
  book?: {
    id: string;
    name: string;
  };
  language?: {
    id: string;
    name: string;
  };
  alphabet?: {
    id: string;
    name: string;
  };
  status?: {
    id: string;
    name: string;
  };
}

const BookItem = () => {
  const [userGroup, setUserGroup] = useState<PermissionType[]>([]);
  const [books, setBooks] = useState<BookType[]>([]);
  const [bookItems, setBookItems] = useState<BookItemType[]>([]);
  const [languages, setLanguages] = useState<LanguageType[]>([]);
  const [alphabets, setAlphabetType] = useState<AlphabetType[]>([]);
  const [statuses, setStatuses] = useState<StatusType[]>([]);
  const [kafedras, setKafedras] = useState<KafedraType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("");
  const [selectedAlphabetId, setSelectedAlphabetId] = useState<string>("");
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [selectedKafedraId, setSelectedKafedraId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [bookSearchTerm, setBookSearchTerm] = useState<string>("");
  const [languageSearchTerm, setLanguageSearchTerm] = useState<string>("");
  const [alphabetSearchTerm, setAlphabetSearchTerm] = useState<string>("");
  const [statusSearchTerm, setStatusSearchTerm] = useState<string>("");
  const [kafedraSearchTerm, setKafedraSearchTerm] = useState<string>("");
  const [categorySearchTerm, setCategorySearchTerm] = useState<string>("");
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState<boolean>(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] =
    useState<boolean>(false);
  const [isAlphabetDropdownOpen, setIsAlphabetDropdownOpen] =
    useState<boolean>(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] =
    useState<boolean>(false);
  const [isKafedraDropdownOpen, setIsKafedraDropdownOpen] =
    useState<boolean>(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookItem, setSelectedBookItem] = useState<BookItemType | null>(
    null
  );
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [isPdfAvailable, setIsPdfAvailable] = useState<boolean>(false);

  const bookDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const alphabetDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const kafedraDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const populateBookItems = (items: BookItemType[]): BookItemType[] => {
    return items.map((item) => ({
      ...item,
      book: item.book_id
        ? books.find((book) => book.id === item.book_id.toString())
        : undefined,
      language: item.language_id
        ? languages.find((lang) => lang.id === item.language_id.toString())
        : undefined,
      alphabet: item.alphabet_id
        ? alphabets.find((alpha) => alpha.id === item.alphabet_id.toString())
        : undefined,
      status: item.status_id
        ? statuses.find((status) => status.id === item.status_id.toString())
        : undefined,
      kafedra: item.kafedra_id
        ? kafedras.find((kafedra) => kafedra.id === item.kafedra_id.toString())
        : undefined,
      category:
        item.category_id != null
          ? categories.find(
              (category) => category.id === item.category_id.toString()
            )
          : undefined,
    }));
  };

  const fetchPermission = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
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
      console.error("❌ Permission olishda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
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
      setBooks(response.data.data);
    } catch (error) {
      console.error("❌ Kitoblarni olishda xatolik:", error);
    }
  };

  const fetchCategories = async () => {
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
        `${import.meta.env.VITE_API}/api/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );
      setCategories(response.data.data);
    } catch (err) {
      console.error("❌ Kategoriyalarni olishda xatolik:", err);
    }
  };

  const fetchBookItems = async () => {
    setError(null);
    setFetchLoading(true);
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
        `${import.meta.env.VITE_API}/api/book-items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );

      const rawBookItems = response.data.data;

      if (
        books.length > 0 &&
        languages.length > 0 &&
        alphabets.length > 0 &&
        statuses.length > 0 &&
        kafedras.length > 0 &&
        categories.length > 0
      ) {
        const populatedItems = populateBookItems(rawBookItems);
        setBookItems(populatedItems);
      } else {
        setBookItems(rawBookItems);
      }
    } catch (err) {
      console.error("Kitob detallarni olishda xatolik:", err);
      setError("Kitob detallarni olishda xatolik yuz berdi.");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchLanguages = async () => {
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
        `${import.meta.env.VITE_API}/api/languages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );
      setLanguages(response.data.data);
    } catch (err) {
      console.error("❌ Tillarni olishda xatolik:", err);
    }
  };

  const fetchAlphabets = async () => {
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
        `${import.meta.env.VITE_API}/api/alphabet`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );
      setAlphabetType(response.data.data);
    } catch (err) {
      console.error("❌ Alifboni olishda xatolik:", err);
    }
  };

  const fetchStatuses = async () => {
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
        `${import.meta.env.VITE_API}/api/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );
      setStatuses(response.data.data);
    } catch (err) {
      console.error("❌ Statusni olishda xatolik:", err);
    }
  };

  const fetchKafedras = async () => {
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
        `${import.meta.env.VITE_API}/api/kafedra`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );
      setKafedras(response.data.data);
    } catch (err) {
      console.error("❌ Kafedralarni olishda xatolik:", err);
    }
  };

  useEffect(() => {
    fetchPermission();
  }, []);

  useEffect(() => {
    if (userGroup.length > 0) {
      const fetchAllData = async () => {
        await Promise.all([
          fetchBooks(),
          fetchLanguages(),
          fetchAlphabets(),
          fetchStatuses(),
          fetchKafedras(),
          fetchCategories(),
        ]);
      };
      fetchAllData();
    }
  }, [userGroup]);

  useEffect(() => {
    if (
      books.length > 0 &&
      languages.length > 0 &&
      alphabets.length > 0 &&
      statuses.length > 0 &&
      kafedras.length > 0 &&
      categories.length > 0
    ) {
      fetchBookItems();
    }
  }, [books, languages, alphabets, statuses, kafedras, categories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bookDropdownRef.current &&
        !bookDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBookDropdownOpen(false);
      }
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
      if (
        alphabetDropdownRef.current &&
        !alphabetDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAlphabetDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
      if (
        kafedraDropdownRef.current &&
        !kafedraDropdownRef.current.contains(event.target as Node)
      ) {
        setIsKafedraDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(bookSearchTerm.toLowerCase())
  );

  const filteredLanguages = languages.filter((language) =>
    language.name.toLowerCase().includes(languageSearchTerm.toLowerCase())
  );

  const filteredAlphabets = alphabets.filter((alphabet) =>
    alphabet.name.toLowerCase().includes(alphabetSearchTerm.toLowerCase())
  );

  const filteredStatuses = statuses.filter((status) =>
    status.name.toLowerCase().includes(statusSearchTerm.toLowerCase())
  );

  const filteredKafedras = kafedras.filter((kafedra) =>
    kafedra.name_uz.toLowerCase().includes(kafedraSearchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter((category) =>
    category.name_uz.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const handleBookSelect = (book: BookType) => {
    setSelectedBookId(book.id);
    setBookSearchTerm(book.name);
    setIsBookDropdownOpen(false);
  };

  const handleLanguageSelect = (language: LanguageType) => {
    setSelectedLanguageId(language.id);
    setLanguageSearchTerm(language.name);
    setIsLanguageDropdownOpen(false);
  };

  const handleAlphabetSelect = (alphabet: AlphabetType) => {
    setSelectedAlphabetId(alphabet.id);
    setAlphabetSearchTerm(alphabet.name);
    setIsAlphabetDropdownOpen(false);
  };

  const handleStatusSelect = (status: StatusType) => {
    setSelectedStatusId(status.id);
    setStatusSearchTerm(status.name);
    setIsStatusDropdownOpen(false);
  };

  const handleKafedraSelect = (kafedra: KafedraType) => {
    setSelectedKafedraId(kafedra.id);
    setKafedraSearchTerm(kafedra.name_uz);
    setIsKafedraDropdownOpen(false);
  };

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategoryId(category.id);
    setCategorySearchTerm(category.name_uz);
    setIsCategoryDropdownOpen(false);
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        antdMessage.error("Faqat PDF fayllar qabul qilinadi!");
        e.target.value = "";
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        antdMessage.error("Fayl hajmi 100MB dan oshmasligi kerak!");
        e.target.value = "";
        return;
      }
      setSelectedPdfFile(file);
    }
  };

  const removePdfFile = () => {
    setSelectedPdfFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !selectedBookId ||
      !selectedLanguageId ||
      !selectedAlphabetId ||
      !selectedStatusId
    ) {
      antdMessage.warning("Barcha majburiy maydonlarni to'ldiring!");
      return;
    }

    if (isPdfAvailable && !selectedPdfFile) {
      antdMessage.warning("PDF faylni yuklang!");
      return;
    }

    setSubmitLoading(true);

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

      const formData = new FormData();
      formData.append("book_id", selectedBookId);
      formData.append("language_id", selectedLanguageId);
      formData.append("alphabet_id", selectedAlphabetId);
      formData.append("status_id", selectedStatusId);
      formData.append("kafedra_id", selectedKafedraId);

      if (selectedCategoryId) {
        formData.append("category_id", selectedCategoryId);
      }

      if (isPdfAvailable && selectedPdfFile) {
        formData.append("pdf", selectedPdfFile);
      } else {
        const dummyFile = new File([""], "salom.pdf", {
          type: "application/pdf",
        });
        formData.append("pdf", dummyFile);
      }

      await axios.post(`${import.meta.env.VITE_API}/api/book-items`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionIds[0],
          "Content-Type": "multipart/form-data",
        },
      });

      antdMessage.success("Kitob detallar muvaffaqiyatli bog'landi!");

      // formani tozalash
      setSelectedBookId("");
      setSelectedLanguageId("");
      setSelectedAlphabetId("");
      setSelectedStatusId("");
      setSelectedKafedraId("");
      setSelectedCategoryId("");
      setSelectedPdfFile(null);
      setIsPdfAvailable(false);
      setBookSearchTerm("");
      setLanguageSearchTerm("");
      setAlphabetSearchTerm("");
      setStatusSearchTerm("");
      setKafedraSearchTerm("");
      setCategorySearchTerm("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchBookItems();
    } catch (err) {
      const error = err as AxiosError;

      console.error("Xatolik yuz berdi:", error);

      if (error.response?.status === 409) {
        antdMessage.warning("Bu kitobga allaqachon detallar mavjud!");
      } else {
        antdMessage.error("Kitob detallar bog'lanmadi!");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const showDeleteModal = (bookItem: BookItemType) => {
    setSelectedBookItem(bookItem);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteOk = async () => {
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
        `${import.meta.env.VITE_API}/api/book-items/${selectedBookItem?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-permission": permissionIds[0],
          },
        }
      );

      setIsDeleteModalVisible(false);
      setSelectedBookItem(null);
      fetchBookItems();
      antdMessage.success("Kitob detallar muvaffaqiyatli o'chirildi!");
    } catch (error) {
      console.error("O'chirishda xatolik yuz berdi:", error);
      antdMessage.error("O'chirishda xatolik yuz berdi!");
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false);
    setSelectedBookItem(null);
  };

  if (loading && userGroup.length === 0) {
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
    <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Kitob detallarni bog'lash
        </h3>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 gap-6 mt-6 mb-8"
      >
        {/* Book Select */}
        <div className="w-full" ref={bookDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kitobni tanlang! *
          </label>
          <div className="relative">
            <input
              type="text"
              value={bookSearchTerm}
              onChange={(e) => {
                setBookSearchTerm(e.target.value);
                setIsBookDropdownOpen(true);
                if (!e.target.value) {
                  setSelectedBookId("");
                }
              }}
              onFocus={() => setIsBookDropdownOpen(true)}
              placeholder="Kitobni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isBookDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isBookDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleBookSelect(book)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedBookId === book.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {book.name}
                      {selectedBookId === book.id && (
                        <span className="float-right">✓</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    Kitob topilmadi
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Language Select */}
        <div className="w-full" ref={languageDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tilni tanlang! *
          </label>
          <div className="relative">
            <input
              type="text"
              value={languageSearchTerm}
              onChange={(e) => {
                setLanguageSearchTerm(e.target.value);
                setIsLanguageDropdownOpen(true);
                if (!e.target.value) {
                  setSelectedLanguageId("");
                }
              }}
              onFocus={() => setIsLanguageDropdownOpen(true)}
              placeholder="Tilni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isLanguageDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isLanguageDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map((language) => (
                    <div
                      key={language.id}
                      onClick={() => handleLanguageSelect(language)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedLanguageId === language.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {language.name}
                      {selectedLanguageId === language.id && (
                        <span className="float-right">✓</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    Til topilmadi
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Alphabet Select */}
        <div className="w-full" ref={alphabetDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Alifboni tanlang! *
          </label>
          <div className="relative">
            <input
              type="text"
              value={alphabetSearchTerm}
              onChange={(e) => {
                setAlphabetSearchTerm(e.target.value);
                setIsAlphabetDropdownOpen(true);
                if (!e.target.value) {
                  setSelectedAlphabetId("");
                }
              }}
              onFocus={() => setIsAlphabetDropdownOpen(true)}
              placeholder="Alifboni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsAlphabetDropdownOpen(!isAlphabetDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isAlphabetDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isAlphabetDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredAlphabets.length > 0 ? (
                  filteredAlphabets.map((alphabet) => (
                    <div
                      key={alphabet.id}
                      onClick={() => handleAlphabetSelect(alphabet)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedAlphabetId === alphabet.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {alphabet.name}
                      {selectedAlphabetId === alphabet.id && (
                        <span className="float-right">✓</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    Alifbo topilmadi
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Status Select */}
        <div className="w-full" ref={statusDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Statusni tanlang! *
          </label>
          <div className="relative">
            <input
              type="text"
              value={statusSearchTerm}
              onChange={(e) => {
                setStatusSearchTerm(e.target.value);
                setIsStatusDropdownOpen(true);
                if (!e.target.value) {
                  setSelectedStatusId("");
                }
              }}
              onFocus={() => setIsStatusDropdownOpen(true)}
              placeholder="Statusni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isStatusDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isStatusDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredStatuses.length > 0 ? (
                  filteredStatuses.map((status) => (
                    <div
                      key={status.id}
                      onClick={() => handleStatusSelect(status)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedStatusId === status.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {status.name}
                      {selectedStatusId === status.id && (
                        <span className="float-right">✓</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    Status topilmadi
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Kafedra Select */}
        <div className="w-full" ref={kafedraDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kafedralarni tanlang!
          </label>
          <div className="relative">
            <input
              type="text"
              value={kafedraSearchTerm}
              onChange={(e) => {
                setKafedraSearchTerm(e.target.value);
                setIsKafedraDropdownOpen(true);
                if (!e.target.value) {
                  setSelectedKafedraId("");
                }
              }}
              onFocus={() => setIsKafedraDropdownOpen(true)}
              placeholder="Kafedralarni tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsKafedraDropdownOpen(!isKafedraDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isKafedraDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isKafedraDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredKafedras.length > 0 ? (
                  filteredKafedras.map((kafedra) => (
                    <div
                      key={kafedra.id}
                      onClick={() => handleKafedraSelect(kafedra)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedKafedraId === kafedra.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {kafedra.name_uz}
                      {selectedKafedraId === kafedra.id && (
                        <span className="float-right">✓</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    Kafedra topilmadi
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Category Select - YANGI QO'SHILDI */}
        <div className="w-full" ref={categoryDropdownRef}>
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kategoriyani tanlang!
          </label>
          <div className="relative">
            <input
              type="text"
              value={categorySearchTerm}
              onChange={(e) => {
                setCategorySearchTerm(e.target.value);
                setIsCategoryDropdownOpen(true);
                if (!e.target.value) {
                  setSelectedCategoryId("");
                }
              }}
              onFocus={() => setIsCategoryDropdownOpen(true)}
              placeholder="Kategoriyani tanlang!"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white cursor-pointer"
              autoComplete="off"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            >
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isCategoryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors ${
                        selectedCategoryId === category.id
                          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100"
                          : ""
                      }`}
                    >
                      {category.name_uz}
                      {selectedCategoryId === category.id && (
                        <span className="float-right">✓</span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    Kategoriya topilmadi
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PDF Availability Checkbox */}
        <div className="w-full md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="pdf-available"
              checked={isPdfAvailable}
              onChange={(e) => {
                setIsPdfAvailable(e.target.checked);
                if (!e.target.checked) {
                  setSelectedPdfFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }
              }}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="pdf-available"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Kitob PDF mavjudmi?
            </label>
          </div>
        </div>

        {/* PDF Upload - Only show if checkbox is checked */}
        {isPdfAvailable && (
          <div className="w-full md:col-span-2">
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              PDF faylni yuklang! *
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex items-center justify-center gap-2 min-h-[60px] bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {selectedPdfFile
                    ? selectedPdfFile.name
                    : "PDF faylni tanlang yoki shu yerga tashlang"}
                </span>
              </label>
              {selectedPdfFile && (
                <div className="mt-2 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      {selectedPdfFile.name}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      ({(selectedPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removePdfFile}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Faqat PDF fayllar qabul qilinadi. Maksimal hajm: 100MB
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitLoading ? "Yuborilmoqda..." : "Bog'lash"}
          </button>
        </div>
      </form>

      {/* Book Items List */}
      <div className="space-y-6 mt-15 my-4">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {bookItems.length === 0
              ? "Kitob detallari yo'q!"
              : "Barcha kitob detallari"}
          </h4>
        </div>

        {fetchLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">Yuklanmoqda...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : bookItems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Ma'lumotlar mavjud emas!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    #
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Kitob nomi
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Til
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Alifbo
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Status
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Kafedra
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    Kategoriya
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-gray-800 dark:text-white">
                    PDF
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-gray-800 dark:text-white">
                    O'chirish
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookItems.map((bookItem, index) => (
                  <tr
                    key={bookItem.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {index}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.book?.name || "-"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.language?.name || "-"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.alphabet?.name || "-"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.status?.name || "-"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.BookCategoryKafedra?.kafedra.name_uz || "-"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.BookCategoryKafedra?.category.name_uz || "-"}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-800 dark:text-white">
                      {bookItem.PDFFile &&
                      bookItem.PDFFile.file_url &&
                      bookItem.PDFFile.original_name &&
                      bookItem.PDFFile.original_name !== "salom.pdf" ? (
                        <a
                          href={bookItem.PDFFile.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 underline flex items-center gap-1"
                        >
                          Ko'rish
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">
                          pdf yo'q
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center">
                      <button
                        className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md transition-all duration-300"
                        onClick={() => showDeleteModal(bookItem)}
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
        title="Kitob detallarni o'chirish"
        open={isDeleteModalVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="Ha, o'chirish"
        cancelText="Bekor qilish"
      >
        <p>
          "{selectedBookItem?.book?.name || "Bu kitob"}" detallarini o'chirishga
          ishonchingiz komilmi?
        </p>
      </Modal>
    </div>
  );
};

export default BookItem;
