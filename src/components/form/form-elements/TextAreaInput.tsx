import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import TextArea from "../input/TextArea";
import Label from "../Label";

export default function TextAreaInput() {
  const [message, setMessage] = useState("");
  return (
    <ComponentCard title="Kitoblar haqida ma'lumotlarni kiriting">
      <div className="space-y-6">
        {/* Default TextArea */}
        <div>
          <Label>Tavsif</Label>
          <TextArea
            value={message}
            onChange={(value) => setMessage(value)}
            rows={6}
          />
        </div>

      </div>
    </ComponentCard>
  );
}
