import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router"
import { ChevronDownIcon, GridIcon, GroupIcon, HorizontaLDots, PieChartIcon } from "../icons"
import { useSidebar } from "../context/SidebarContext"
import { GoBook } from "react-icons/go"
import { MdSchool } from "react-icons/md"
import axios from "axios"
import type { NavItem, PermissionType } from "../types/types"

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const [permissionIds, setPermissionIds] = useState<string[]>([])
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const location = useLocation()
  const navigate = useNavigate()

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others"
    index: number
  } | null>(null)
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const baseNavItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Dashboard",
      subItems: [
        { name: "Bosh sahifa", permission: "", path: "/", pro: false },
        { name: "Buyurtmalar", permission: "", path: "/order", pro: false },
        { name: "Arxivdagi buyurtmalar", permission: "", path: "/history", pro: false },
      ],
    },
    {
      name: "Kitoblar",
      icon: <GoBook />,
      subItems: [
        { name: "Barcha Kitoblar", permission: "kitob_korish", path: "/books-all", pro: false },
        { name: "Kitob qo'shish", permission: "kitob_qoshish", path: "/book-create", pro: false },
        { name: "Kitob detallarini bog'lash", permission: "kitob_detal", path: "/books-detail", pro: false },
        { name: "Kitob mualliflari", permission: "kitob_muallif", path: "/auther", pro: false },
        { name: "Kitob kategoriyalari", permission: "kategoriya", path: "/categories", pro: false },
        { name: "Kafedralar", permission: "kafedra", path: "/kafedra", pro: false },
        { name: "Kitob tillari", permission: "kitob_tili", path: "/languages", pro: false },
        { name: "Kitob alifbolari", permission: "kitob_alifbo", path: "/alphabet", pro: false },
        { name: "Kitob statuslari", permission: "kitob_status", path: "/status", pro: false },
      ],
    },
    {
      name: "Dekanat bo'limi",
      icon: <MdSchool />,
      subItems: [
        { name: "Qora ro'yxatdagilar", permission: "qora_list", path: "/black-list", pro: false },
        { name: "Barcha kafedralar", permission: "direktor", path: "/direktor", pro: false },
      ],
    },
    {
      name: "Talabalar",
      icon: <GroupIcon />,
      subItems: [
        { name: "Yo'nalish", permission: "yonalish", path: "/direction", pro: false },
        { name: "Talaba Guruhlari", permission: "guruhlar", path: "/student_group", pro: false },
        { name: "Barcha foydalanuvchilar", permission: "admin", path: "/users-all", pro: false },
      ],
    },
    {
      name: "Admin",
      icon: <GroupIcon />,
      subItems: [
        { name: "Xodim qo'shish", permission: "", path: "/admins", pro: false },
        { name: "Huquq qo'shish", permission: "", path: "/permission-create", pro: false },
        // { name: "O'qituvchi qo'shish", permission: "", path: "/teacher-create", pro: false },
        { name: "Xodimlarni boshqarish", permission: "", path: "/roles", pro: false },
        { name: "Foydalanuvchilarni tiklash", permission: "", path: "/users-build", pro: false },
      ],
    },
  ]

  const othersItems: NavItem[] = [
    {
      icon: <PieChartIcon />,
      name: "Statistika",
      subItems: [
        { name: "Yillik Statistika", permission: "", path: "/yearly-chart", pro: false },
        { name: "Oylik Statistika", permission: "", path: "/monthly-chart", pro: false },
        { name: "Haftalik Statistika", permission: "", path: "/weekly-chart", pro: false },
        { name: "Kunlik Statistika", permission: "", path: "/daily-chart", pro: false }
      ]
    },
  ]

  useEffect(() => {
    const isRolesStr = localStorage.getItem("isRoles")
    if (isRolesStr) {
      try {
        const roles: string[] = JSON.parse(isRolesStr)
        setUserRoles(roles)
      } catch (error) {
        console.error("Error parsing roles from localStorage:", error)
        setUserRoles([])
      }
    }
  }, [])

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname])

  const fetchPermission = async (): Promise<void> => {
    const token = localStorage.getItem("token")
    try {
      const response = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const isRolesStr = localStorage.getItem("isRoles")
      const isRoles: string[] = isRolesStr ? JSON.parse(isRolesStr) : []
      const matchedGroups: PermissionType[] = response.data.data.filter((item: PermissionType) =>
        isRoles.includes(item.group_id),
      )
      const permissionIds: string[] = matchedGroups.map((item: PermissionType) => item.permissionInfo.table)

      setPermissionIds(permissionIds)
    } catch (err) {
      console.error("Permission olishda xatolik:", err)
    }
  }

  useEffect(() => {
    fetchPermission()
  }, [])

  useEffect(() => {
    setNavItems(baseNavItems)
  }, [])

  useEffect(() => {
    const isRolesStr = localStorage.getItem("isRoles")
    const isRoles = isRolesStr ? JSON.parse(isRolesStr) : []

    if (!isRoles.includes("1") && location.pathname === "/roles") {
      navigate("*")
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    const isRolesStr = localStorage.getItem("isRoles")
    if (isRolesStr) {
      try {
        const roles = JSON.parse(isRolesStr)
        if ((roles.includes("4") || roles.includes("5") || roles.includes("6")) && location.pathname === "/") {
          if (!roles.includes("4")) {
            navigate("/black-list")
          }
        }
      } catch (error) {
        console.error("Error parsing roles for redirect:", error)
      }
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    let submenuMatched = false
    ;["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems
      items.forEach((nav, index) => {
        if (nav.subItems) {
          const filteredSubItems = nav.subItems.filter(
            (subItem) => !subItem.permission || permissionIds.includes(subItem.permission),
          )

          filteredSubItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              })
              submenuMatched = true
            }
          })
        }
      })
    })

    if (!submenuMatched) {
      setOpenSubmenu(null)
    }
  }, [location, isActive, permissionIds, navItems])

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }))
      }
    }
  }, [openSubmenu])

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null
      }
      return { type: menuType, index }
    })
  }

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    return (
      <ul className="flex flex-col gap-4">
        {items.map((nav, index) => {
          if (nav.name === "Admin" && !userRoles.includes("1")) {
            return null
          }

          if (nav.name === "Talabalar" && !userRoles.includes("1")) {
            return null
          }

          if (nav.name === "Dashboard" && !userRoles.includes("1") && !userRoles.includes("2")) {
            return null
          }

          if (
            nav.name === "Dekanat bo'limi" &&
            !userRoles.includes("1") &&
            !userRoles.includes("4") &&
            !userRoles.includes("5") &&
            !userRoles.includes("6")
          ) {
            return null
          }

          const filteredSubItems = nav.subItems?.filter(
            (subItem) => !subItem.permission || permissionIds.includes(subItem.permission),
          )

          if (nav.name === "Kitoblar" && filteredSubItems && filteredSubItems.length === 0) {
            return null
          }

          return (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <ChevronDownIcon
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType && openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                <Link
                  to={nav.path || "/"}
                  className={`menu-item group ${
                    nav.path && isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      nav.path && isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                </Link>
              )}
              {nav.subItems && filteredSubItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {filteredSubItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className="dark:hidden" src="/images/logo/logo-dark.png" alt="Logo" width={150} height={40} />
              <img className="hidden dark:block" src="/images/logo/logo-icon.png" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <>
              <img className="hidden dark:block" src="/images/logo/logos.png" alt="Logo" width={32} height={32} />
              <img src="/images/logo/logo.png" className="dark:hidden" alt="Logo" width={32} height={32} />
            </>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            {userRoles.includes("1") && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? "Others" : <HorizontaLDots className="size-6" />}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default AppSidebar;