import { LuLoaderCircle } from "react-icons/lu";

export default function Loading() {
  //TODO: make this a skeleton of a data-table
  return (
    <div className="flex items-center justify-center">
      <LuLoaderCircle className="size-5 animate-spin" />
    </div>
  );
}
