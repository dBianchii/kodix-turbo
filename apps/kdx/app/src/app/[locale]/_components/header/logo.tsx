import { Link } from "~/i18n/routing";

export function Logo({ redirect }: { redirect: string }) {
  return (
    <Link
      className="font-medium text-bold text-primary text-xl"
      href={redirect}
    >
      <span className="hidden text-balance bg-linear-to-br from-30% from-black to-black/80 bg-clip-text font-semibold text-transparent leading-none tracking-tighter md:block dark:from-white dark:to-white/40">
        Kodix
      </span>
      <span className="block text-balance bg-linear-to-br from-30% from-black to-black/80 bg-clip-text font-semibold text-transparent leading-none tracking-tighter md:hidden dark:from-white dark:to-white/40">
        Kdx
      </span>
    </Link>
  );
}
