export default function InviteNotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold">Not found</h1>
      <p>
        Team not found by the given invite code or user is not authorized to
        join the team.
      </p>
    </section>
  );
}
