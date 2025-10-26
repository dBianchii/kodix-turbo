import { Spinner } from "@kodix/ui/spinner";

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>;
}

export function LoadingPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
