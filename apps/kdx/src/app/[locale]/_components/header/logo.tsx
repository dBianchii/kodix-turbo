import { Link } from "~/i18n/routing";

export function Logo({ redirect }: { redirect: string }) {
  return (
    <Link
      href={redirect}
      className="text-bold text-primary text-xl font-medium"
    >
      <span className="hidden bg-linear-to-br from-black from-30% to-black/80 bg-clip-text leading-none font-semibold tracking-tighter text-balance text-transparent md:block dark:from-white dark:to-white/40">
        Kodix
      </span>
      <span className="block bg-linear-to-br from-black from-30% to-black/80 bg-clip-text leading-none font-semibold tracking-tighter text-balance text-transparent md:hidden dark:from-white dark:to-white/40">
        Kdx
      </span>
    </Link>
  );
}
