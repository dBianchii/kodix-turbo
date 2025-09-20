import type { ReactElement } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

/**
 * A component that dismisses the keyboard when tapped outside of the input fields.
 *
 * @param children - The child elements to render.
 * @returns The JSX element that wraps the child elements and dismisses the keyboard on tap.
 */
export function DismissKeyboard({ children }: { children: ReactElement }) {
  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      {children}
    </TouchableWithoutFeedback>
  );
}
