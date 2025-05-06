export function Message({ role, content }: { role: string; content: string }) {
  return (
    <div
      className={`rounded-lg p-3 ${role === "user" ? "self-end bg-blue-500 text-white" : "self-start bg-gray-700 text-white"}`}
    >
      {content}
    </div>
  );
}
