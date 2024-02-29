import { LuLoader2 } from "react-icons/lu";

export default function Loading() {
  //TODO: make this a skeleton of a data-table
  return (
    <div className="flex items-center justify-center">
      <LuLoader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}
