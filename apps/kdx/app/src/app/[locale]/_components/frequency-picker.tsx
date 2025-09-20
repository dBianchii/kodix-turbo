"use client";

import type { Frequency } from "rrule";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { RRule } from "rrule";

import { Button } from "@kdx/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kdx/ui/command";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
} from "@kdx/ui/credenza";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import { RadioGroup, RadioGroupItem } from "@kdx/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kdx/ui/select";

import { DatePicker } from "./date-picker";

export function FrequencyPicker({
  frequency,
  setFrequency,
  untilDate,
  setUntilDate,
  neverEnds,
  setNeverEnds,
  children,
}: {
  frequency: Frequency | null;
  setFrequency: React.Dispatch<React.SetStateAction<Frequency>>;
  untilDate: Date | undefined;
  setUntilDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  neverEnds: boolean;
  setNeverEnds: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const freqs = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY];

  const t = useTranslations();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        {children ?? (
          <Button variant="outline" size="sm">
            <FrequencyToTxt frequency={frequency} />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
        <Credenza open={dialogOpen} onOpenChange={setDialogOpen}>
          <CredenzaContent>
            <CredenzaHeader>
              <CredenzaTitle>
                {t("apps.calendar.Custom recurrence")}
              </CredenzaTitle>
              <CredenzaDescription>
                <div className="mt-4 flex flex-row gap-4">
                  <span className="font-medium">{t("Repeat every")}:</span>
                  <Input type="number" placeholder="1" className="w-16" />
                  <Select defaultValue="DAILY">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue
                        placeholder={t("apps.calendar.Select a recurrence")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">{t("Days")}</SelectItem>
                      <SelectItem value="WEEKLY">{t("Weeks")}</SelectItem>
                      <SelectItem value="MONTHLY">{t("Months")}</SelectItem>
                      <SelectItem value="YEARLY">{t("Years")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-row">
                  <div className="flex flex-col">
                    <RadioGroup
                      className="mt-2 space-y-3"
                      defaultValue={neverEnds ? "1" : "0"}
                    >
                      <span className="mt-4 font-medium">{t("Ends")}:</span>
                      <div className="flex items-center">
                        <RadioGroupItem
                          value="1"
                          id="r1"
                          onClick={() => {
                            setNeverEnds(true);
                          }}
                        />
                        <Label htmlFor="r1" className="ml-2">
                          {t("Never")}
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem
                          value="0"
                          id="r2"
                          onClick={() => {
                            setNeverEnds(false);
                          }}
                        />
                        <Label htmlFor="r2" className="ml-2">
                          {t("At")}
                        </Label>
                        <div className="ml-8">
                          <DatePicker
                            date={untilDate}
                            setDate={setUntilDate}
                            disabledDate={(date) => date < new Date()}
                            disabledPopover={neverEnds}
                          />
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CredenzaDescription>
            </CredenzaHeader>
          </CredenzaContent>
          <Command>
            <CommandInput placeholder={`${t("Change frequency")}...`} />
            <CommandList
              onSelect={() => {
                setOpen(false);
              }}
            >
              <CommandGroup>
                {freqs.map((freq) => (
                  <CommandItem
                    key={`${freq}-freq-command-item`}
                    onSelect={() => {
                      setFrequency(freq);
                      setOpen(false);
                    }}
                  >
                    <FrequencyToTxt frequency={freq} />
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() => {
                    setDialogOpen(true);
                  }}
                >
                  {t("Custom")}...
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Credenza>
      </PopoverContent>
    </Popover>
  );
}

export function FrequencyToTxt({
  frequency,
  count = 0,
  lowercase = false,
}: {
  frequency: Frequency | null;
  count?: number;
  lowercase?: boolean;
}) {
  const t = useTranslations();
  let text: string;
  switch (frequency) {
    case RRule.DAILY:
      text = t("Day", { count });
      break;
    case RRule.WEEKLY:
      text = t("Week", { count });
      break;
    case RRule.MONTHLY:
      text = t("Month", { count });
      break;
    case RRule.YEARLY:
      text = t("Year", { count });
      break;
    default:
      text = t("None");
      break;
  }
  if (lowercase) text = text.toLowerCase();
  return text;
}
