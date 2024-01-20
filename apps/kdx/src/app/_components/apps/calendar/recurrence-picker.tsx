/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import type { Weekday } from "rrule";
import { useCallback, useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Check } from "lucide-react";
import moment from "moment";
import { Frequency, RRule } from "rrule";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kdx/ui/alert-dialog";
import { Button } from "@kdx/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@kdx/ui/command";
import { Input } from "@kdx/ui/input";
import { Label } from "@kdx/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@kdx/ui/popover";
import { RadioGroup, RadioGroupItem } from "@kdx/ui/radio-group";
import { Toggle } from "@kdx/ui/toggle";
import { cn } from "@kdx/ui/utils";

import { DatePicker } from "~/app/_components/date-picker";
import { FrequencyToTxt } from "~/app/_components/frequency-picker";

/**
 * @description rrule.toText() returns the text based on the UTC timezone. This function returns the text based on the local timezone.
 */
export function tzOffsetText(rule: RRule) {
  const tzOffset = moment().utcOffset();
  const newRRule = rule.clone();
  newRRule.options.until = newRRule.options.until
    ? moment(rule.options.until).add(tzOffset, "minutes").toDate()
    : null;
  return newRRule.toText();
}

const freqs = [RRule.DAILY, RRule.WEEKLY, RRule.MONTHLY, RRule.YEARLY];
const allWeekdays: Weekday[] = [
  RRule.SU,
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
];

export function RecurrencePicker({
  open,
  setOpen,
  interval,
  setInterval,
  frequency,
  setFrequency,
  until,
  setUntil,
  count,
  setCount,
  weekdays,
  setWeekdays,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  interval: number;
  setInterval: React.Dispatch<React.SetStateAction<number>>;
  frequency: Frequency;
  setFrequency: React.Dispatch<React.SetStateAction<Frequency>>;
  until: moment.Moment | undefined;
  setUntil: React.Dispatch<React.SetStateAction<moment.Moment | undefined>>;
  count: number | undefined;
  setCount: React.Dispatch<React.SetStateAction<number | undefined>>;
  weekdays: Weekday[] | undefined;
  setWeekdays: React.Dispatch<React.SetStateAction<Weekday[] | undefined>>;
}) {
  const [draftInterval, setDraftInterval] = useState(interval);
  const [draftFrequency, setDraftFrequency] = useState(frequency);
  const [draftUntil, setDraftUntil] = useState(until);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [draftCount, setDraftCount] = useState(count);
  const [draftWeekdays, setDraftWeekdays] = useState(weekdays);

  const discardDraft = useCallback(() => {
    setDraftInterval(interval);
    setDraftFrequency(frequency);
    setDraftUntil(until);
    setDraftCount(count);
    setDraftWeekdays(weekdays);
  }, [interval, frequency, until, count, weekdays]);

  useEffect(() => {
    discardDraft();
  }, [open, discardDraft]);

  function saveDraft() {
    setInterval(draftInterval);
    setFrequency(draftFrequency);
    setUntil(draftUntil);
    setCount(undefined); // We don't have count yet in the UI so we just set it to undefined
    setWeekdays(draftWeekdays);
  }
  function closeDialog(openOrClose: boolean, save: boolean) {
    if (save) saveDraft();
    else discardDraft();
    setOpen(openOrClose);
  }
  const ruleForText = new RRule({
    freq: frequency,
    until: until ? until?.toDate() : undefined,
    interval: interval,
    byweekday: weekdays,
  });

  const [parent] = useAutoAnimate();

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm">
            {count === 1 ? "doesn't repeat" : tzOffsetText(ruleForText)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-300 p-0" side="bottom" align={"start"}>
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setFrequency(RRule.DAILY);
                    setInterval(1);
                    setCount(1);
                    setUntil(undefined);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      frequency === RRule.DAILY && interval === 1 && count === 1
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  Doesn&apos;t repeat
                </CommandItem>
                {freqs.map((freq, i) => (
                  <CommandItem
                    key={i}
                    onSelect={() => {
                      setInterval(1);
                      setFrequency(freq);
                      setUntil(undefined);
                      setCount(undefined);
                      freq !== Frequency.WEEKLY && setWeekdays(undefined);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        frequency === freq &&
                          interval === 1 &&
                          !until &&
                          !count &&
                          !weekdays
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    Every {FrequencyToTxt(freq).toLowerCase()}
                  </CommandItem>
                ))}
                <CommandItem onSelect={() => setOpen(true)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      until ?? interval > 1 ? "opacity-100" : "opacity-0",
                    )}
                  />
                  Custom...
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <AlertDialog
        open={open}
        onOpenChange={(openOrClose) => closeDialog(openOrClose, false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personalized Recurrence</AlertDialogTitle>
          </AlertDialogHeader>
          <div>
            <div className="mt-4 flex flex-row gap-4">
              <p>Repeat every:</p>
              <Input
                type="number"
                min={1}
                aria-valuemin={1}
                value={draftInterval}
                onChange={(e) => setDraftInterval(parseInt(e.target.value))}
                placeholder="1"
                className="w-16"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {FrequencyToTxt(draftFrequency).toLowerCase()}
                    {draftInterval !== 1 ? "s" : null}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-300 p-0"
                  side="bottom"
                  align="start"
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {freqs.map((freq, i) => (
                          <CommandItem
                            key={i}
                            onSelect={() => {
                              if (freq !== Frequency.WEEKLY) {
                                setDraftWeekdays(undefined);
                              }
                              setDraftFrequency(freq);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                draftFrequency === freq
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {FrequencyToTxt(freq).toLowerCase()}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="mt-2" ref={parent}>
              {draftFrequency === Frequency.WEEKLY && (
                <div className={"flex-col"}>
                  <span className={cn("mt-4")}>Repeat:</span>
                  <div className="mt-2 flex-row space-x-1">
                    {allWeekdays.map((weekday) => (
                      <Toggle
                        size={"sm"}
                        pressed={draftWeekdays?.some(
                          (dw) => dw.getJsWeekday() === weekday.getJsWeekday(),
                        )}
                        aria-label="Toggle italic"
                        key={JSON.stringify(weekday)}
                        onPressedChange={(pressed) => {
                          setDraftWeekdays((prev) => {
                            if (prev === undefined) {
                              return [weekday];
                            }
                            if (pressed) {
                              return [...prev, weekday];
                            }
                            return prev.filter(
                              (dw) =>
                                dw.getJsWeekday() !== weekday.getJsWeekday(),
                            );
                          });
                        }}
                      >
                        {moment().weekday(weekday.getJsWeekday()).format("ddd")}
                      </Toggle>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-row">
              <div className="flex flex-col">
                <RadioGroup
                  className="mt-2 space-y-3"
                  defaultValue={draftUntil === undefined ? "1" : "0"}
                >
                  <span className="mt-4">Ends:</span>
                  <div
                    className="flex items-center"
                    onClick={() => setDraftUntil(undefined)}
                  >
                    <RadioGroupItem
                      value=""
                      id="r1"
                      checked={draftUntil === undefined}
                    />
                    <Label htmlFor="r1" className="ml-2">
                      Never
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <RadioGroupItem
                        value="0"
                        id="r2"
                        checked={draftUntil !== undefined}
                        onClick={() => setDraftUntil(until ?? moment())}
                      />
                      <Label htmlFor="r2" className="ml-2">
                        At
                      </Label>
                    </div>

                    <div className=" ml-8">
                      <DatePicker
                        date={draftUntil?.toDate()}
                        setDate={(date) => setDraftUntil(moment(date))}
                        // disabledDate={(date) =>
                        //   date < new Date()
                        // }
                        disabledPopover={draftUntil === undefined}
                      />
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => closeDialog(false, false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                closeDialog(false, true);
              }}
            >
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
