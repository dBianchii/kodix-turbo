import { Sheet } from "tamagui";

export function SheetModal({
  children,
  open,
  setOpen,
}: {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      open={open}
      onOpenChange={setOpen}
      position={1}
      snapPoints={[100, 45]}
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
    >
      <Sheet.Overlay
        animation="medium"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame
        p={"$2"}
        ai="center"
        borderColor={"$color6"}
        backgroundColor="$color3"
        borderWidth={1}
        borderBottomWidth={0}
      >
        {children}
      </Sheet.Frame>
    </Sheet>
  );
}
