export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1 py-8">{children}</main>;
}
