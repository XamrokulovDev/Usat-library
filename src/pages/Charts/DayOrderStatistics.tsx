import DailyOrderChart from "../../components/charts/DailyOrderChart";
import ComponentCard from "../../components/common/ComponentCard";

export default function DaiStatistics() {
  return (
    <div className="space-y-6">
      <ComponentCard title="Kunlik Buyurtmalar Statistikasi">
        <DailyOrderChart />
      </ComponentCard>
    </div>
  )
}