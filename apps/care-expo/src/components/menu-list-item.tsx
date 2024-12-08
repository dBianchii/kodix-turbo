import type { ListItemProps } from "tamagui";
import { ListItem, YGroup } from "tamagui";

export function MenuListItem({ children, ...props }: ListItemProps) {
  return (
    <YGroup.Item>
      <ListItem
        bg={"$color3"}
        hoverTheme
        pressTheme
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        icon={props.icon}
        fontSize={"$5"}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        iconAfter={props.iconAfter}
        py={"$4"}
        bordered
        {...props}
      >
        {children}
      </ListItem>
    </YGroup.Item>
  );
}
