import MonthlyOrderChart from "../../components/charts/MonthlyOrderChart";
import ComponentCard from "../../components/common/ComponentCard";

export default function MonthStatistics() {
  return (
    <div className="space-y-6">
      <ComponentCard title="Oylik Buyurtmalar Statistikasi">
        <MonthlyOrderChart />
      </ComponentCard>
    </div>
  )
}