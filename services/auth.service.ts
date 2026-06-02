import * as SecureStore from "expo-secure-store";
import { api } from "./api";

export const login = async (identifier: string, password: string) => {
  const isEmail = identifier.includes("@");
  const body = isEmail
    ? { email: identifier, password }
    : { username: identifier, password };

  const res = await api.post("/auth/login", body);
  const { token, user } = res.data;

  await SecureStore.setItemAsync("auth_token", token);
  return { token, user };
};

export const logout = async () => {
  await SecureStore.deleteItemAsync("auth_token");
};

export const getStoredToken = () => SecureStore.getItemAsync("auth_token");
