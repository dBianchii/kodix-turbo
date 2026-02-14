import type { ListItemProps } from "@tamagui/list-item";
import { YGroup } from "@tamagui/group";
import { ListItem } from "@tamagui/list-item";

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
