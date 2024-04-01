"use client";

import type { Frequency } from "rrule";
import React, { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@kdx/ui/dialog";
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        {children ?? (
          <Button variant="outline" size="sm">
            {FrequencyToTxt(frequency)}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Personalized Recurrence</DialogTitle>
              <DialogDescription>
                <div className="mt-4 flex flex-row gap-4">
                  <span className="font-medium">Repeat every:</span>
                  <Input type="number" placeholder="1" className="w-16" />
                  <Select defaultValue="DAILY">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Days</SelectItem>
                      <SelectItem value="WEEKLY">Weeks</SelectItem>
                      <SelectItem value="MONTHLY">Months</SelectItem>
                      <SelectItem value="YEARLY">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-row">
                  <div className="flex flex-col">
                    <RadioGroup
                      className="mt-2 space-y-3"
                      defaultValue={neverEnds ? "1" : "0"}
                    >
                      <span className="mt-4 font-medium">Ends:</span>
                      <div className="flex items-center">
                        <RadioGroupItem
                          value="1"
                          id="r1"
                          onClick={() => {
                            setNeverEnds(true);
                          }}
                        />
                        <Label htmlFor="r1" className="ml-2">
                          Never
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
                          At
                        </Label>
                        <div className=" ml-8">
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
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
          <Command>
            <CommandInput placeholder="Change frequency..." />
            <CommandList
              onSelect={() => {
                setOpen(false);
              }}
            >
              <CommandGroup>
                {freqs.map((freq, i) => (
                  <CommandItem
                    key={i}
                    onSelect={() => {
                      setFrequency(freq);
                      setOpen(false);
                    }}
                  >
                    {FrequencyToTxt(freq)}
                  </CommandItem>
                ))}
                <CommandItem
                  onSelect={() => {
                    setDialogOpen(true);
                  }}
                >
                  Custom...
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Dialog>
      </PopoverContent>
    </Popover>
  );
}

export function FrequencyToTxt(frequency: Frequency | null) {
  switch (frequency) {
    case RRule.DAILY:
      return "Day";
    case RRule.WEEKLY:
      return "Week";
    case RRule.MONTHLY:
      return "Month";
    case RRule.YEARLY:
      return "Year";
    default:
      return "None";
  }
}
