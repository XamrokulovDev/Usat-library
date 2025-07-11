import { ReactNode } from "react"
export interface BookType {
  id: string
  name: string
  year: number
  page: number
  books: number
  auther_id: number
  book_count: number
  description: string
  image: string
}

export interface AutherType {
  id: number
  name: string
}

export interface PermissionType {
  id: string
  group_id: string
  permission_id: string
  permissionInfo: {
    id: string
    table: string
    code_name: string
  }
}

export interface NavItem {
  name: string
  path?: string
  icon: ReactNode
  subItems?: NavSubItem[]
}

export interface NavSubItem {
  name: string
  permission: string
  path: string
  pro?: boolean
  new?: boolean
}