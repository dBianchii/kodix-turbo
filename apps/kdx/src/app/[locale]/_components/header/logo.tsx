import { Link } from "~/i18n/routing";

export function Logo({ redirect }: { redirect: string }) {
  return (
    <Link
      href={redirect}
      className="text-bold text-xl font-medium text-primary"
    >
      <span className="hidden text-balance bg-linear-to-br from-black from-30% to-black/80 bg-clip-text font-semibold leading-none tracking-tighter text-transparent dark:from-white dark:to-white/40 md:block">
        Kodix
      </span>
      <span className="block text-balance bg-linear-to-br from-black from-30% to-black/80 bg-clip-text font-semibold leading-none tracking-tighter text-transparent dark:from-white dark:to-white/40 md:hidden">
        Kdx
      </span>
    </Link>
  );
}
