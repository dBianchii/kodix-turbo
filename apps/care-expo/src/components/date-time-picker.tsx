import type { XStackProps } from "tamagui";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // https://github.com/mmazzarolo/react-native-modal-datetime-picker

import { Calendar, Clock } from "@tamagui/lucide-icons";
import { Input, XStack } from "tamagui";

export function DateTimePicker({
  date,
  type = "date",
  confirmText,
  cancelText,
  accentColor,
  textColor,
  buttonTextColorIOS,
  onChange,
  onConfirm,
  minimumDate,
  ...props
}: {
  date?: Date;
  type?: "date" | "time";
  confirmText?: string;
  cancelText?: string;
  accentColor?: string;
  textColor?: string;
  buttonTextColorIOS?: string;
  onChange?: (date: Date) => void;
  onConfirm?: (date: Date) => void;
  minimumDate?: Date;
} & XStackProps) {
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const hideDatePicker = () => {
    setShow(false);
  };

  const handleConfirm = (date: Date) => {
    setSelectedDate(date);
    onConfirm?.(date);
    hideDatePicker();
  };

  return (
    <Pressable onPress={() => setShow(true)}>
      <XStack alignItems={"center"} justifyContent="flex-end" {...props}>
        <XStack mr={"$2"}>
          {type === "date" && <Calendar color={"$gray11Dark"} />}
          {type === "time" && <Clock color={"$gray11Dark"} />}
        </XStack>
        <Input pointerEvents="none" editable={false}>
          {type === "date" && selectedDate?.toLocaleDateString()}
          {type === "time" && selectedDate?.toLocaleTimeString()}
        </Input>
      </XStack>

      <DateTimePickerModal
        minimumDate={minimumDate}
        cancelTextIOS={cancelText}
        confirmTextIOS={confirmText}
        date={selectedDate}
        isVisible={show}
        mode={type}
        // display="inline"
        accentColor={accentColor}
        textColor={textColor}
        buttonTextColorIOS={buttonTextColorIOS}
        onChange={onChange}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </Pressable>
  );
}
