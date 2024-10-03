import Link from "next/link";

import { getTranslations } from "@kdx/locales/next-intl/server";

import HeaderFooterRemover from "~/app/[locale]/_components/header-footer-remover";
import MaxWidthWrapper from "~/app/[locale]/_components/max-width-wrapper";

export async function Footer() {
  const t = await getTranslations();
  return (
    <HeaderFooterRemover>
      <footer className="bg-foreground/5">
        <MaxWidthWrapper>
          <div className="flex h-24 flex-col items-center justify-center md:flex-row">
            <Link href="/" className="font-medium underline underline-offset-4">
              Kodix © 2023 {t("No rights reserved")}
            </Link>
          </div>
        </MaxWidthWrapper>
      </footer>
    </HeaderFooterRemover>
  );
}
