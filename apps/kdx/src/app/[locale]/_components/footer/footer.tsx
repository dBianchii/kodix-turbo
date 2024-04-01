import Link from "next/link";

import HeaderFooterRemover from "~/app/[locale]/_components/header-footer-remover";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";

export function Footer() {
  return (
    <HeaderFooterRemover>
      <footer className="bg-foreground/5">
        <MaxWidthWrapper>
          <div className="flex flex-col items-center md:h-24 md:flex-row">
            <Link href="/" className="font-medium underline underline-offset-4">
              Kodix © 2023 No rights reserved
            </Link>
          </div>
        </MaxWidthWrapper>
      </footer>
    </HeaderFooterRemover>
  );
}
