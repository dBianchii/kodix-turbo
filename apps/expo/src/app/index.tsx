import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { api } from "~/utils/api";

// function PostCard(props: {
//   post: RouterOutputs["post"]["all"][number];
//   onDelete: () => void;
// }) {
//   return (
//     <View className="flex flex-row rounded-lg bg-muted p-4">
//       <View className="flex-grow">
//         <Link
//           asChild
//           href={{
//             pathname: "/post/[id]",
//             params: { id: props.post.id },
//           }}
//         >
//           <Pressable className="">
//             <Text className=" text-xl font-semibold text-primary">
//               {props.post.title}
//             </Text>
//             <Text className="mt-2 text-foreground">{props.post.content}</Text>
//           </Pressable>
//         </Link>
//       </View>
//       <Pressable onPress={props.onDelete}>
//         <Text className="font-bold uppercase text-primary">Delete</Text>
//       </Pressable>
//     </View>
//   );
// }

export default function Index() {
  // const utils = api.useUtils();

  // const postQuery = api.post.all.useQuery();

  // const deletePostMutation = api.post.delete.useMutation({
  //   onSettled: () => utils.post.all.invalidate().then(),
  // });

  const stuff = api.app.getAll.useQuery();

  return (
    <SafeAreaView className=" bg-background">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Home Page" }} />
      <View className="h-full w-full bg-background p-4">
        <Text className="pb-2 text-center text-5xl font-bold text-foreground">
          <Text className="text-primary">T3</Text> Turbo
        </Text>

        <Text className="text-white">
          {stuff.data?.length && JSON.stringify(stuff.data)}
        </Text>

        {/* <Pressable
          onPress={() => void utils.post.all.invalidate()}
          className="flex items-center rounded-lg bg-primary p-2"
        >
          <Text className="text-foreground"> Refresh posts</Text>
        </Pressable> */}

        <View className="py-2">
          <Text className="font-semibold italic text-primary">
            Press on a postss
          </Text>
        </View>

        {/* <FlashList
          data={postQuery.data}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={(p) => (
            <PostCard
              post={p.item}
              onDelete={() => deletePostMutation.mutate(p.item.id)}
            />
          )}
        /> */}
      </View>
    </SafeAreaView>
  );
}
