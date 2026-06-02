import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/colors";
// import { usePushNotifications } from "../../hooks/usePushNotifications";

export default function TabsLayout() {
  // Register push notifications at tab layout level
  //   usePushNotifications();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.zinc400,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.zinc200,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="leads"
        options={{
          title: "My Leads",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Calling Report",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lead"
        options={{
          title: "lead",
          href: null, // Hidden from tab bar — opened via push notification
        }}
      />
      <Tabs.Screen
        name="outcome"
        options={{
          title: "Log Outcome",
          href: null, // Hidden from tab bar — opened via push notification
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "index",
          href: null, // Hidden from tab bar — opened via push notification
        }}
      />
    </Tabs>
  );
}
