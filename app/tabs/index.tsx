import { Redirect } from "expo-router";

// Default tab route — redirect to leads
export default function TabsIndex() {
  return <Redirect href="/(tabs)/leads" />;
}
