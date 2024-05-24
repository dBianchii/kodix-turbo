"use client";

import { motion } from "framer-motion";

import { useI18n } from "@kdx/locales/client";
import { LampContainer } from "@kdx/ui/aceternity/lamp";

export function HeroLamp() {
  const t = useI18n();
  return (
    <LampContainer className="mt-0">
      <motion.h1
        initial={{ opacity: 0.5, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="bg-gradient-to-br from-slate-200 to-slate-500 bg-clip-text py-4 text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        {t("The last stop")} <br />{" "}
        <span className="font-normal">{t("for your companys growth")}</span>
      </motion.h1>
    </LampContainer>
  );
}
