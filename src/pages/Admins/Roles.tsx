import { Users } from "lucide-react";
import Group from "./Group";

const Roles: React.FC = () => {

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Xodimlarni boshqarish</h3>
        </div>
      </div>
      <Group />
    </div>
  );
};

export default Roles;