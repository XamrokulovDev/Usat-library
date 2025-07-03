import YearlyOrderChart from "../../components/charts/YearlyOrderChart";
import ComponentCard from "../../components/common/ComponentCard";

export default function YearStatistics() {
  return (
    <div className="space-y-6">
      <ComponentCard title="Yillik Buyurtmalar Statistikasi">
        <YearlyOrderChart />
      </ComponentCard>
    </div>
  )
}