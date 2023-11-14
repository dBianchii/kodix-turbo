import Link from "next/link";

import HeaderFooterRemover from "../header-footer-remover";

export function Footer() {
  return (
    <HeaderFooterRemover>
      <footer className="md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-muted-foreground text-center text-sm leading-loose md:text-left"></p>
            <Link href="/" className="font-medium underline underline-offset-4">
              Kodix © 2023 No rights reserved
            </Link>
          </div>
        </div>
      </footer>
    </HeaderFooterRemover>
  );
}
