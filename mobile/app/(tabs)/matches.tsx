import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api } from "@/lib/api";
import type { Match } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  active: "#10B981",
  matched: "#2563EB",
  arrived: "#F59E0B",
  completed: "#64748B",
  cancelled: "#EF4444",
  expired: "#64748B",
};

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadMatches() {
    try {
      const data = await api.myMatches();
      setMatches(data ?? []);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useFocusEffect(useCallback(() => { loadMatches(); }, []));

  function goToMatch(match: Match) {
    router.push(`/match/${match.id}`);
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>My Matches</Text>
        <Text style={s.count}>{matches.length} total</Text>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMatches(); }} tintColor="#2563EB" />
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyTitle}>No matches yet</Text>
            <Text style={s.emptyText}>Offer your spot or find one nearby.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => goToMatch(item)}>
            <View style={s.cardTop}>
              <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[item.status] || "#64748B" }]} />
              <Text style={s.statusText}>{item.status}</Text>
              <Text style={s.time}>{formatTime(item.matchedAt)}</Text>
            </View>
            <Text style={s.cardTitle}>
              {item.departingUser?.name || "Driver"} → {item.arrivingUser?.name || "You"}
            </Text>
            {item.etaMinutes && <Text style={s.eta}>{item.etaMinutes} min ETA</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#FFF" },
  count: { color: "#64748B", fontSize: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F172A" },
  card: { backgroundColor: "#1E293B", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#334155" },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: "#94A3B8", fontSize: 12, fontWeight: "600", flex: 1 },
  time: { color: "#64748B", fontSize: 12 },
  cardTitle: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  eta: { color: "#94A3B8", fontSize: 13, marginTop: 4 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyTitle: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  emptyText: { color: "#64748B", fontSize: 14, marginTop: 4 },
});
