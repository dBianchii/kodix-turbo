import type { ListItemProps } from "tamagui";
import { ListItem, YGroup } from "tamagui";

export function MenuListItem({ children, ...props }: ListItemProps) {
  return (
    <YGroup.Item>
      <ListItem
        bg={"$color3"}
        hoverTheme
        pressTheme
        icon={props.icon}
        fontSize={"$5"}
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
