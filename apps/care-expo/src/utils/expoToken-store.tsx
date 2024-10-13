import AsyncStorage from "@react-native-async-storage/async-storage";

const expoPushTokenKey = "expoPushToken";
export const getStorageExpoToken = () => AsyncStorage.getItem(expoPushTokenKey);
export const saveStorageExpoToken = (token: string) =>
  AsyncStorage.setItem(expoPushTokenKey, token);
export const deleteStorageExpoToken = () =>
  AsyncStorage.removeItem(expoPushTokenKey);
