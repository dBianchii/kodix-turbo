import { RxCalendar, RxCube, RxGlobe, RxInput } from "react-icons/rx";

import { getTranslations } from "@kdx/locales/server";
import { getAppName } from "@kdx/locales/server-hooks";
import { calendarAppId, kodixCareAppId, todoAppId } from "@kdx/shared";
import { cn } from "@kdx/ui";
import { Calendar } from "@kdx/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kdx/ui/command";
import { BentoCard, BentoGrid } from "@kdx/ui/magic-ui/bento-grid";
import Globe from "@kdx/ui/magic-ui/globe";
import Marquee from "@kdx/ui/magic-ui/marquee";

import { IconKodixApp } from "./app/kodix-icon";

export async function HeroBento() {
  const t = await getTranslations();
  const apps = [
    {
      icon: (
        <IconKodixApp appId={kodixCareAppId} size={20} renderText={false} />
      ),
      name: getAppName(kodixCareAppId),
      body: t(
        "The ultimate solution for managing your home clinic or your home care",
      ),
    },
    {
      icon: <IconKodixApp appId={calendarAppId} size={20} renderText={false} />,
      name: getAppName(calendarAppId),
      body: t("The unified calendar system that integrates with all your apps"),
    },
    {
      icon: <IconKodixApp appId={todoAppId} size={20} renderText={false} />,
      name: getAppName(todoAppId),
      body: t("A simple todo app that integrates with all your apps"),
    },
  ];

  const features = [
    {
      Icon: RxCube,
      name: t("An ecosystem of apps"),
      description: t(
        "Kodix offers a wide arangement of apps tailored for your business needs",
      ),
      href: "/",
      cta: t("Browse apps"),
      className: "col-span-3 lg:col-span-1",
      background: (
        <Marquee
          pauseOnHover
          className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
        >
          {apps.map((f, idx) => (
            <figure
              key={idx}
              className={cn(
                "relative w-36 cursor-pointer overflow-hidden rounded-xl border p-4",
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none",
              )}
            >
              <div className="flex flex-row items-center gap-2">
                <div className="flex flex-row">
                  {f.icon}
                  <figcaption className="ml-2 text-sm font-medium dark:text-white ">
                    {f.name}
                  </figcaption>
                </div>
              </div>
              <blockquote className="mt-2 text-xs">{f.body}</blockquote>
            </figure>
          ))}
        </Marquee>
      ),
    },
    {
      Icon: RxInput,
      name: t("Made for humans"),
      description: t(
        "A design system that will blow competition out of the water",
      ),
      href: "/",
      cta: "Learn more",
      className: "col-span-3 lg:col-span-2",
      background: (
        <Command className="absolute right-10 top-10 w-[70%] origin-top translate-x-0 border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:-translate-x-10">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>screenshot.png</CommandItem>
              <CommandItem>bitcoin.pdf</CommandItem>
              <CommandItem>finances.xlsx</CommandItem>
              <CommandItem>logo.svg</CommandItem>
              <CommandItem>keys.gpg</CommandItem>
              <CommandItem>seed.txt</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      ),
    },
    {
      Icon: RxGlobe,
      name: t("Multilingual"),
      description: t("Supports 3 languages and counting"),
      href: "/",
      cta: t("Learn more"),
      className: "col-span-3 lg:col-span-2",
      background: (
        <Globe className="top-0 h-[600px] w-[600px] transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_30%,#000_100%)] group-hover:scale-105 sm:left-40" />
      ),
    },
    {
      Icon: RxCalendar,
      name: "Calendar",
      description: "Use the calendar to filter your files by date.",
      className: "col-span-3 lg:col-span-1",
      href: "/",
      cta: "Learn more",
      background: (
        <Calendar
          mode="single"
          selected={new Date(2022, 4, 11, 0, 0, 0)}
          className="absolute right-0 top-10 origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105"
        />
      ),
    },
  ];

  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}
