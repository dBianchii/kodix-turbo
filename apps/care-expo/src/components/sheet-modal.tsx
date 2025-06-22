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

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackButton,
    );
    return () => {
      backHandler.remove();
    };
  }, [setOpen]);

  return (
    <Sheet
      unmountChildrenWhenHidden
      forceRemoveScrollEnabled={open}
      open={open}
      onOpenChange={setOpen}
      snapPoints={[85]}
      snapPointsMode={"percent"}
      zIndex={100_000}
      dismissOnSnapToBottom
      animation="medium"
      animationConfig={{
        type: "spring",
        damping: 10,
        mass: 0.3,
      }}
      modal
      native
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
