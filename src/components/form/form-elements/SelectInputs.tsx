import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Select from "../Select";
import MultiSelect from "../MultiSelect";

export default function SelectInputs() {
  const options = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Development" },
  ];
  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const multiOptions = [
    { value: "1", text: "1 chi variant", selected: false },
    { value: "2", text: "2 chi variant", selected: false },
    { value: "3", text: "3 chi variant", selected: false },
    { value: "4", text: "4 chi variant", selected: false },
    { value: "5", text: "5 chi variant", selected: false },
  ];
  return (
    <ComponentCard title="Kitoblar variantlarini to'ldirish">
      <div className="space-y-6">
        <div>
          <Label>Variantlarni tanlang</Label>
          <Select
            options={options}
            placeholder="Variantlarni tanlang"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
        </div>
        <div>
          <MultiSelect
            label="Bir nechta variantlarni tanlang"
            options={multiOptions}
            defaultSelected={["1", "3"]}
            onChange={(values) => setSelectedValues(values)}
          />
          <p className="sr-only">
            Selected Values: {selectedValues.join(", ")}
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
