import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { api } from "@/lib/api";
import type { Match } from "@/lib/types";

const { width } = Dimensions.get("window");

export default function MatchDetailScreen() {
  const { id, offerId } = useLocalSearchParams<{ id: string; offerId?: string }>();
  const mapRef = useRef<MapView>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (id && id !== "new") {
          const data = await api.myMatches();
          const found = data?.find((m: Match) => m.id === id);
          if (found) setMatch(found);
        }
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          setCurrentLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleAction(action: "accept" | "arrived" | "departing" | "complete") {
    try {
      const matchId = id!;
      switch (action) {
        case "accept":
          await api.acceptMatch(matchId);
          break;
        case "arrived":
          await api.confirmArrival(matchId);
          break;
        case "departing":
          await api.startDeparture(matchId);
          break;
        case "complete":
          await api.completeExchange(matchId);
          break;
      }
      Alert.alert("Done", `Action: ${action}`, [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error || (!match && id !== "new")) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>{error || "Match not found"}</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const spotLat = match?.spotLat || currentLocation?.lat || 33.77;
  const spotLng = match?.spotLng || currentLocation?.lng || -118.19;

  return (
    <View style={s.container}>
      {/* Close button */}
      <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
        <Text style={s.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Map */}
      <View style={s.mapContainer}>
        <MapView
          ref={mapRef}
          style={s.map}
          initialRegion={{
            latitude: spotLat,
            longitude: spotLng,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
          showsUserLocation
        >
          {match && (
            <>
              <Marker coordinate={{ latitude: spotLat, longitude: spotLng }} pinColor="#2563EB" title="Spot" />
              {currentLocation && (
                <Marker coordinate={{ latitude: currentLocation.lat, longitude: currentLocation.lng }} pinColor="#7C3AED" title="You" />
              )}
              <Circle center={{ latitude: spotLat, longitude: spotLng }} radius={50} strokeColor="#2563EB44" fillColor="#2563EB11" />
            </>
          )}
        </MapView>
      </View>

      {/* Info card */}
      <View style={s.card}>
        <Text style={s.cardTitle}>
          {match
            ? `Match with ${match.departingUser?.name || match.arrivingUser?.name || "Driver"}`
            : "New Match"}
        </Text>

        {match && (
          <>
            <View style={s.row}>
              <Text style={s.label}>Status</Text>
              <Text style={[s.value, { color: "#10B981" }]}>{match.status}</Text>
            </View>
            {match.etaMinutes && (
              <View style={s.row}>
                <Text style={s.label}>ETA</Text>
                <Text style={s.value}>{match.etaMinutes} min</Text>
              </View>
            )}
          </>
        )}

        {/* Action buttons */}
        {!match && offerId ? (
          <TouchableOpacity style={s.primaryBtn} onPress={() => handleAction("accept")}>
            <Text style={s.primaryBtnText}>Request Match</Text>
          </TouchableOpacity>
        ) : match?.status === "matched" || match?.status === "active" ? (
          <View style={s.btnGroup}>
            <TouchableOpacity style={s.primaryBtn} onPress={() => handleAction("arrived")}>
              <Text style={s.primaryBtnText}>I've Arrived</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.secondaryBtn} onPress={() => handleAction("departing")}>
              <Text style={s.secondaryBtnText}>I'm Leaving Now</Text>
            </TouchableOpacity>
          </View>
        ) : match?.status === "arrived" ? (
          <TouchableOpacity style={s.primaryBtn} onPress={() => handleAction("complete")}>
            <Text style={s.primaryBtnText}>Complete Exchange ✓</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0F172A" },
  closeBtn: { position: "absolute", top: 56, left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" },
  closeText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  mapContainer: { flex: 1, margin: 12, borderRadius: 24, overflow: "hidden" },
  map: { flex: 1 },
  card: { backgroundColor: "#1E293B", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#FFF", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#94A3B8", fontSize: 14 },
  value: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  btnGroup: { gap: 8, marginTop: 16 },
  primaryBtn: { backgroundColor: "#2563EB", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 16 },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  secondaryBtn: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  secondaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  errorText: { color: "#EF4444", fontSize: 16 },
  backBtn: { marginTop: 16 },
  backText: { color: "#60A5FA", fontSize: 14 },
});
