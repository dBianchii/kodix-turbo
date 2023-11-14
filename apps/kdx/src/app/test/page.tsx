"use client";

import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Check } from "lucide-react";
import moment from "moment";
import { RRule } from "rrule";

import {
  Button,
  cn,
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Toggle,
} from "@kdx/ui";

import { FrequencyToTxt } from "~/app/_components/frequency-picker";

const freqs = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY];

const weekdays = [
  RRule.SU,
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
];
const Dropdown = () => {
  const [show, setShow] = useState(false);
  const [parent] = useAutoAnimate();

  const reveal = () => setShow(!show);

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Personalized Recurrence</DialogTitle>
        </DialogHeader>
        <Button onClick={reveal}></Button>
        <div className="mt-4 flex flex-row gap-4">
          <span className="font-medium">Repeat every:</span>
          <Input
            type="number"
            min={1}
            aria-valuemin={1}
            placeholder="1"
            className="w-16"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                asdojadio
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-300 p-0" side="bottom" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {freqs.map((freq, i) => (
                      <CommandItem key={i}>
                        <Check className={cn("mr-2 h-4 w-4")} />
                        {FrequencyToTxt(freq).toLowerCase()}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div ref={parent} className="mt-2">
          {show && (
            <div className={"flex-col"}>
              <span className={cn("mt-4 font-medium")}>Repeat:</span>
              <div className="mt-2 flex-row space-x-1">
                {weekdays.map((weekday) => (
                  <Toggle
                    size={"sm"}
                    aria-label="Toggle italic"
                    key={JSON.stringify(weekday)}
                  >
                    {moment().weekday(weekday.getJsWeekday()).format("ddd")}
                  </Toggle>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Dropdown;
