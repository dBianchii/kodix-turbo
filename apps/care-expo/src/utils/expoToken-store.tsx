import AsyncStorage from "@react-native-async-storage/async-storage";

const expoPushTokenKey = "expoPushToken";
export const getExpoToken = () => AsyncStorage.getItem(expoPushTokenKey);
export const saveExpoToken = (token: string) =>
  AsyncStorage.setItem(expoPushTokenKey, token);
export const deleteExpoToken = () => AsyncStorage.removeItem(expoPushTokenKey);
