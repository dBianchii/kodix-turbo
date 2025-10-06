import type { ListItemProps } from "tamagui";
import { ListItem, YGroup } from "tamagui";

export function MenuListItem({ children, ...props }: ListItemProps) {
  return (
    <YGroup.Item>
      <ListItem
        bg={"$color3"}
        bordered
        fontSize={"$5"}
        hoverTheme
        icon={props.icon}
        iconAfter={props.iconAfter}
        pressTheme
        py={"$4"}
        {...props}
      >
        {children}
      </ListItem>
    </YGroup.Item>
  );
}
