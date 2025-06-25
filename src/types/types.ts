import type React from "react"
// Order interface
export interface OrderData {
  created_at: string
  name: string
  status: string
}

// KafedraData interface - any ishlatmasdan
export interface KafedraData {
  kafedra: string
  full_name: string
  phone: string
  yonalish: string
  group: string
  orders: OrderData[]
}

export interface PermissionType {
  id: string
  group_id: string
  permission_id: string
  permissionInfo: {
    id: string
    code_name: string
    table: string
  }
}

export interface KafedraPermission {
  kafedra: string
  permission: string
}

export type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  subItems?: { name: string; permission: string; path: string; pro?: boolean; new?: boolean }[]
}