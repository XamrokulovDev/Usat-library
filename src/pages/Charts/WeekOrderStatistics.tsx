import WeeklyOrderChart from "../../components/charts/WeeklyOrderChart";
import ComponentCard from "../../components/common/ComponentCard";

export default function WeekStatistics() {
  return (
    <div className="space-y-6">
      <ComponentCard title="Haftalik Buyurtmalar Statistikasi">
        <WeeklyOrderChart />
      </ComponentCard>
    </div>
  )
}