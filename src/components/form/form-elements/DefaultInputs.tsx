
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Select from "../Select";


export default function DefaultInputs() {
 
  const options = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Development" },
  ];
  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };

  return (
    <ComponentCard title="Kitoblar turilarrini to'ldirish">
      <div className="space-y-6">
        <div>
          <Label htmlFor="input">Kitob nomi</Label>
          <Input type="text" id="input" />
        </div>
        <div>
          <Label htmlFor="inputTwo">Kitob nomini kiriting</Label>
          <Input type="text" id="inputTwo" placeholder="kitob nomini kiriting" />
        </div>
        <div>
          <Label>Kitob kategoriyalrni tanlang</Label>
          <Select
            options={options}
            placeholder="variantlar"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />

        </div>
      </div>
    </ComponentCard>
  );
}
