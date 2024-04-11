export default function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1 py-4">{children}</main>;
}
