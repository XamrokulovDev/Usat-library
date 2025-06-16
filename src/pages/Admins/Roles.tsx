import Group from "./Group";

const Roles: React.FC = () => {

  return (
    <div className="min-h-[80%] p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Xodimlarni boshqarish
        </h2>
      </div>
      <Group />
    </div>
  );
};

export default Roles;