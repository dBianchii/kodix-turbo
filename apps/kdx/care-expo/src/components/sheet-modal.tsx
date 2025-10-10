import type { SheetProps } from "tamagui";
import { useEffect } from "react";
import { BackHandler } from "react-native";
import { Sheet } from "tamagui";

import { defaultPadding } from "./safe-area-view";

export function SheetModal({
  children,
  open,
  setOpen,
  withOverlay = true,
  withHandle = true,
  sheetFrameProps,
  ...sheetProps
}: {
  children: React.ReactNode;
  open: boolean;
  withOverlay?: boolean;
  setOpen?: (open: boolean) => void;
  withHandle?: boolean;
  sheetFrameProps?: React.ComponentProps<typeof Sheet.Frame>;
} & SheetProps) {
  useEffect(() => {
    const handleBackButton = () => {
      setOpen?.(false);
      return true;
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackButton);
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackButton);
    };
  });

  return (
    <Sheet
      animation="medium"
      animationConfig={{
        damping: 10,
        mass: 0.3,
        type: "spring",
      }}
      dismissOnSnapToBottom
      forceRemoveScrollEnabled={open}
      modal
      native
      onOpenChange={setOpen}
      open={open}
      snapPoints={[85]}
      snapPointsMode={"percent"}
      unmountChildrenWhenHidden
      zIndex={100_000}
      {...sheetProps} // Pass additional props to Sheet
    >
      {withHandle && <Sheet.Handle backgroundColor={"$blue5Dark"} />}
      {withOverlay && (
        <Sheet.Overlay
          animation="medium"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
      )}

      <Sheet.Frame p={defaultPadding} {...sheetFrameProps}>
        {children}
      </Sheet.Frame>
    </Sheet>
  );
}
