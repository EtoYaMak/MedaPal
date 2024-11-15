import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const router = useRouter();
  const { theme, colors } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/auth");
      }
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subText,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="plus-square" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="medications"
        options={{
          title: "Medications",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="microphone" color={color} />
          ),
          headerShown: false,
          tabBarButton: () => null, // Makes the tab invisible
        }}
      />
    </Tabs>
  );
}
