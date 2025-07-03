import { useEffect, useState } from "react"
import Chart from "react-apexcharts"
import type { ApexOptions } from "apexcharts"
import axios from "axios"

interface OrderType {
  id: string
  status_id: number
  status_message: string
  user_id: string
  book_id: string
  created_at: string
  finished_at?: string
}

interface HourlyData {
  hour: string
  count: number
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

export default function DailyHourlyOrderChart() {
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const processOrderData = (orders: OrderType[]): HourlyData[] => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const currentDate = now.getDate()

    const hourCounts: { [key: number]: number } = {}

    for (let i = 0; i < 24; i++) {
      hourCounts[i] = 0
    }

    orders.forEach((order) => {
      const orderDate = new Date(order.created_at)
      if (
        orderDate.getFullYear() === currentYear &&
        orderDate.getMonth() === currentMonth &&
        orderDate.getDate() === currentDate
      ) {
        const hour = orderDate.getHours()
        hourCounts[hour]++
      }
    })

    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, "0")}:00`,
      count: hourCounts[i],
    }))
  }

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const rolesStr = localStorage.getItem("isRoles") || "[]"
      const roles: string[] = JSON.parse(rolesStr)

      const permissionsResponse = await axios.get(`${import.meta.env.VITE_API}/api/group-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const userGroups: PermissionType[] = permissionsResponse.data.data
      const matched = userGroups.filter((g: PermissionType) => roles.includes(g.group_id))
      const permissionCode = matched[0]?.permissionInfo.code_name || ""

      const ordersResponse = await axios.get(`${import.meta.env.VITE_API}/api/user-order`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-permission": permissionCode,
        },
      })

      const orders: OrderType[] = ordersResponse.data.data
      const processedData = processOrderData(orders)
      setHourlyData(processedData)
    } catch (error) {
      console.error("Buyurtmalarni olishda xatolik:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 8,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: ["#fff"],
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: hourlyData.map((item) => item.hour),
      title: {
        text: "Soatlar",
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => Math.floor(val).toString(),
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      opacity: 0.9,
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#6366f1"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} ta buyurtma`,
      },
      style: {
        fontSize: "12px",
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      fontSize: "14px",
    },
  }

  const series = [
    {
      name: "Buyurtmalar",
      data: hourlyData.map((item) => item.count),
    },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Yuklanmoqda...</span>
      </div>
    )
  }

  const totalOrders = hourlyData.reduce((sum, item) => sum + item.count, 0)
  const highestHour = hourlyData.reduce((max, item) => (item.count > max.count ? item : max), hourlyData[0])
  const averageOrders = Math.round(totalOrders / hourlyData.length)
  const currentHour = new Date().getHours()
  const currentHourCount = hourlyData[currentHour]?.count || 0

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div id="hourlyOrderChart" className="min-w-[800px]">
        <Chart options={options} series={series} type="bar" height={350} />
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-blue-600 dark:text-blue-400 font-semibold">Jami buyurtmalar</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {totalOrders}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-green-600 dark:text-green-400 font-semibold">Eng yuqori soat</div>
          <div className="text-lg font-bold text-green-700 dark:text-green-300">
            {highestHour.hour} ({highestHour.count} ta)
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
          <div className="text-orange-600 dark:text-orange-400 font-semibold">O'rtacha soatlik</div>
          <div className="text-lg font-bold text-orange-700 dark:text-orange-300">
            {averageOrders} ta
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="text-purple-600 dark:text-purple-400 font-semibold">Joriy soat</div>
          <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
            {currentHourCount} ta
          </div>
        </div>
      </div>
    </div>
  )
}