"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kodix/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@kodix/ui/drawer";
import { useMediaQuery } from "@kodix/ui/hooks/use-media-query";
import { cn } from "@kodix/ui/lib/utils";

const desktop = { query: "md" } as const;

const Credenza = (props: React.ComponentProps<typeof Dialog>) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? Dialog : Drawer;

  return <Component {...props} />;
};

const CredenzaTrigger = (props: React.ComponentProps<typeof DialogTrigger>) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogTrigger : DrawerTrigger;

  return <Component {...props} />;
};

const CredenzaClose = (props: React.ComponentProps<typeof DialogClose>) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogClose : DrawerClose;

  return <Component {...props} />;
};

const CredenzaContent = (props: React.ComponentProps<typeof DialogContent>) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogContent : DrawerContent;

  return <Component {...props} />;
};

const CredenzaDescription = (
  props: React.ComponentProps<typeof DialogDescription>,
) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogDescription : DrawerDescription;

  return <Component {...props} />;
};

const CredenzaHeader = (props: React.ComponentProps<typeof DialogHeader>) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogHeader : DrawerHeader;

  return <Component {...props} />;
};

const CredenzaTitle = (props: React.ComponentProps<typeof DialogTitle>) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogTitle : DrawerTitle;

  return <Component {...props} />;
};

const CredenzaBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-4 md:px-0", className)} {...props} />
);

const CredenzaFooter = (props: React.ComponentProps<typeof DialogFooter>) => {
  const isDesktop = useMediaQuery(desktop);
  const Component = isDesktop ? DialogFooter : DrawerFooter;

  return <Component {...props} />;
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
