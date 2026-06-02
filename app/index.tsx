import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "../constants/colors";
import { useAuthStore } from "../store/Authstore";

export default function Index() {
  const router = useRouter();
  const { hydrate, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? "/leads" : "/auth/login");
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.bg,
      }}
    >
      <ActivityIndicator size="large" color={Colors.gold} />
    </View>
  );
}
