import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => { logout(); router.replace("/(auth)/login"); } },
    ]);
  }

  async function handleUpgrade() {
    try {
      const data = await api.createCheckout();
      if (data.url) {
        Linking.openURL(data.url);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not open checkout.");
    }
  }

  async function handlePortal() {
    try {
      const data = await api.createPortal();
      if (data.url) {
        Linking.openURL(data.url);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not open portal.");
    }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={s.header}>
        <Text style={s.title}>Profile</Text>
      </View>

      {/* User card */}
      <View style={s.card}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "?"}</Text>
        </View>
        <Text style={s.name}>{user?.name || "User"}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.badgeRow}>
          <View style={[s.badge, user?.isPremium ? s.premiumBadge : s.freeBadge]}>
            <Text style={s.badgeText}>{user?.isPremium ? "Premium" : "Free"}</Text>
          </View>
          <View style={s.badge}>
            <Text style={s.badgeText}>★ {user?.rankingScore?.toFixed(1) || "—"}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statValue}>{user?.scoutLevel || 0}</Text>
          <Text style={s.statLabel}>Scout Level</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statValue}>{user?.scoutPoints || 0}</Text>
          <Text style={s.statLabel}>Points</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statValue}>#{user?.signupNumber || "—"}</Text>
          <Text style={s.statLabel}>Member</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Account</Text>
        <TouchableOpacity style={s.action} onPress={() => router.push("/(tabs)/profile")}>
          <Text style={s.actionText}>Edit Vehicle Info</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.action} onPress={() => router.push("/(tabs)/profile")}>
          <Text style={s.actionText}>My Schedules</Text>
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Subscription</Text>
        {user?.isPremium ? (
          <TouchableOpacity style={s.action} onPress={handlePortal}>
            <Text style={s.actionText}>Manage Subscription</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.upgradeBtn} onPress={handleUpgrade}>
            <Text style={s.upgradeText}>Upgrade to Premium — $4.99/mo</Text>
            <Text style={s.upgradeSub}>Real-time matching, priority support</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#FFF" },
  card: { backgroundColor: "#1E293B", marginHorizontal: 16, borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#FFF" },
  name: { fontSize: 20, fontWeight: "700", color: "#FFF" },
  email: { fontSize: 14, color: "#94A3B8", marginTop: 2 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  badge: { backgroundColor: "#334155", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  premiumBadge: { backgroundColor: "#2563EB" },
  freeBadge: { backgroundColor: "#334155" },
  badgeText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  statsRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 12, gap: 8 },
  stat: { flex: 1, backgroundColor: "#1E293B", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  statValue: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 2 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, color: "#64748B", fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  action: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: "#334155" },
  actionText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  upgradeBtn: { backgroundColor: "#2563EB", borderRadius: 12, padding: 16, marginBottom: 8, alignItems: "center" },
  upgradeText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  upgradeSub: { color: "#93C5FD", fontSize: 12, marginTop: 4 },
  logoutBtn: { marginHorizontal: 16, marginTop: 32, padding: 16, alignItems: "center" },
  logoutText: { color: "#EF4444", fontSize: 15, fontWeight: "600" },
});
