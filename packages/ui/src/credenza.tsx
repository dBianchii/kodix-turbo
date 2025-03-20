"use client";

import { cn } from ".";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { useMediaQuery } from "./hooks/use-media-query";

const desktop = { query: "md" } as const;

const Credenza = (props: React.ComponentProps<typeof Dialog>) => {
  const isDesktop = useMediaQuery(desktop);
  const Credenza = isDesktop ? Dialog : Drawer;

  return <Credenza {...props} />;
};

const CredenzaTrigger = (props: React.ComponentProps<typeof DialogTrigger>) => {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaTrigger = isDesktop ? DialogTrigger : DrawerTrigger;

  return <CredenzaTrigger {...props} />;
};

const CredenzaClose = (props: React.ComponentProps<typeof DialogClose>) => {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaClose = isDesktop ? DialogClose : DrawerClose;

  return <CredenzaClose {...props} />;
};

const CredenzaContent = (props: React.ComponentProps<typeof DialogContent>) => {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaContent = isDesktop ? DialogContent : DrawerContent;

  return <CredenzaContent {...props} />;
};

const CredenzaDescription = (
  props: React.ComponentProps<typeof DialogDescription>,
) => {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaDescription = isDesktop ? DialogDescription : DrawerDescription;

  return <CredenzaDescription {...props} />;
};

const CredenzaHeader = (props: React.ComponentProps<typeof DialogHeader>) => {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaHeader = isDesktop ? DialogHeader : DrawerHeader;

  return <CredenzaHeader {...props} />;
};

const CredenzaTitle = (props: React.ComponentProps<typeof DialogTitle>) => {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaTitle = isDesktop ? DialogTitle : DrawerTitle;

  return <CredenzaTitle {...props} />;
};

const CredenzaBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("px-4 md:px-0", className)} {...props} />;
};

const CredenzaFooter = (props: React.ComponentProps<typeof DialogFooter>) => {
  const isDesktop = useMediaQuery(desktop);
  const CredenzaFooter = isDesktop ? DialogFooter : DrawerFooter;

  return <CredenzaFooter {...props} />;
};

export {
  Credenza,
  CredenzaTrigger,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaBody,
  CredenzaFooter,
};
