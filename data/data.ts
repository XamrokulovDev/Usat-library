type StatusType = 'active' | 'inactive' | 'pending';

interface Notification {
    id: number;
    name: string;
    status: StatusType;
    date: string;
    hour: string;
}

interface PermissionType {
  id: number;
  name: string;
}

export const PermissionData: PermissionType[] = [
  { id: 1, name: "kitob_muallif" },
  { id: 2, name: "kategoriya" },
  { id: 3, name: "kitob_tili" },
  { id: 4, name: "kitob_alifbo" },
  { id: 5, name: "kitob_status" },
  { id: 6, name: "kitob_kategoriya" },
  { id: 7, name: "kitob_qo'shish" },
  { id: 8, name: "kitob_ko'rish" },
  { id: 9, name: "kafedralar" },
  { id: 10, name: "yo'nalish" },
  { id: 11, name: "guruhlar" },
  { id: 12, name: "admin" },
];

export const notifications: Notification[] = [
    {
        id: 1,
        name: 'John Doe',
        status: 'active',
        date: '2023-10-01',
        hour: '10:00 AM',
    },
    {
        id: 2,
        name: 'Jane Smith',
        status: 'inactive',
        date: '2023-10-02',
        hour: '11:00 AM',
    },
    {
        id: 3,
        name: 'Alice Johnson',
        status: 'pending',
        date: '2023-10-03',
        hour: '12:00 PM',
    },
    {
        id: 4,
        name: 'Bob Brown',
        status: 'active',
        date: '2023-10-04',
        hour: '01:00 PM',
    },
    {
        id: 5,
        name: 'Charlie Davis',
        status: 'inactive',
        date: '2023-10-05',
        hour: '02:00 PM',
    },
    {
        id: 6,
        name: 'Diana Evans',
        status: 'pending',
        date: '2023-10-06',
        hour: '03:00 PM',
    }
]