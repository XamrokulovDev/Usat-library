import MonthlyOrderChart from "../../components/charts/bar/MonthlyOrderChart"
import ComponentCard from "../../components/common/ComponentCard"

export default function MonthlyOrderStatistics() {
  return (
    <div>
      <div className="space-y-6">
        <ComponentCard
          title="Oylik Buyurtmalar Statistikasi"
        >
          <MonthlyOrderChart />
        </ComponentCard>
      </div>
    </div>
  )
}