import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, FlatList, Dimensions } from "react-native";
import * as Location from "expo-location";
import { router } from "expo-router";
import MapView, { Marker, Circle, Callout } from "react-native-maps";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { ScoredOffer } from "@/lib/types";

const { width } = Dimensions.get("window");

export default function FindScreen() {
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [offers, setOffers] = useState<ScoredOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<ScoredOffer | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Location access is required to find nearby spots.");
        setLocating(false);
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const pos = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setLocation(pos);
      setLocating(false);
      loadOffers(pos.lat, pos.lng);
    })();
  }, []);

  async function loadOffers(lat: number, lng: number) {
    setLoading(true);
    try {
      const data = await api.findSpots(lat, lng);
      setOffers(data.offers ?? data ?? []);
    } catch {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }

  function handleOfferPress(offer: ScoredOffer) {
    setSelectedOffer(offer);
    mapRef.current?.animateToRegion({
      latitude: offer.latitude,
      longitude: offer.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 400);
  }

  const geofenceRegion = location ? {
    latitude: location.lat,
    longitude: location.lng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : undefined;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Spotimization</Text>
        {!user?.isPremium && (
          <TouchableOpacity style={s.premiumBadge} onPress={() => router.push("/(tabs)/profile")}>
            <Text style={s.premiumText}>Free</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Map */}
      <View style={s.mapContainer}>
        {locating ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={s.loadingText}>Finding your location...</Text>
          </View>
        ) : location ? (
          <MapView
            ref={mapRef}
            style={s.map}
            initialRegion={geofenceRegion}
            showsUserLocation
            showsMyLocationButton
            onPress={() => setSelectedOffer(null)}
          >
            {offers.map((o) => (
              <Marker
                key={o.id}
                coordinate={{ latitude: o.latitude, longitude: o.longitude }}
                onPress={() => handleOfferPress(o)}
                pinColor={o.etaMinutes && o.etaMinutes < 10 ? "#10B981" : o.etaMinutes && o.etaMinutes < 20 ? "#F59E0B" : "#EF4444"}
              >
                <Callout>
                  <View style={s.callout}>
                    <Text style={s.calloutTitle}>{o.address || "Parking spot"}</Text>
                    {o.etaMinutes && <Text style={s.calloutText}>{o.etaMinutes} min away</Text>}
                    {o.rankingScore && <Text style={s.calloutText}>Rating: {o.rankingScore}/5</Text>}
                    <Text style={s.calloutAction}>Tap to match</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
            <Circle
              center={{ latitude: location.lat, longitude: location.lng }}
              radius={500}
              strokeColor="#2563EB44"
              fillColor="#2563EB11"
            />
          </MapView>
        ) : (
          <View style={s.center}>
            <Text style={s.loadingText}>Unable to get location.</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => { setLocating(true); }}>
              <Text style={s.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom sheet */}
      <View style={s.bottomSheet}>
        <View style={s.handle} />
        <Text style={s.sheetTitle}>
          {offers.length > 0
            ? `${offers.length} spot${offers.length > 1 ? "s" : ""} available nearby`
            : loading
              ? "Searching for spots..."
              : "No spots right now"}
        </Text>

        {loading ? (
          <ActivityIndicator color="#2563EB" style={{ marginTop: 16 }} />
        ) : offers.length > 0 ? (
          <FlatList
            data={offers.slice(0, 10)}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[s.spotCard, selectedOffer?.id === item.id && s.spotCardSelected]}
                onPress={() => handleOfferPress(item)}
              >
                <Text style={s.spotDistance}>{item.distanceKm.toFixed(1)} km</Text>
                <Text style={s.spotEta}>
                  {item.etaMinutes ? `${item.etaMinutes} min` : "—"}
                </Text>
                <Text style={s.spotRating}>★ {item.rankingScore?.toFixed(1) || "—"}</Text>
                <TouchableOpacity
                  style={s.matchBtn}
                  onPress={() => router.push(`/match/new?offerId=${item.id}`)}
                >
                  <Text style={s.matchBtnText}>Match</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={s.emptyText}>Try offering your spot instead!</Text>
        )}

        <TouchableOpacity
          style={s.refreshBtn}
          onPress={() => location && loadOffers(location.lat, location.lng)}
        >
          <Text style={s.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#FFF" },
  premiumBadge: { backgroundColor: "#1E293B", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  premiumText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  mapContainer: { flex: 1, marginHorizontal: 12, borderRadius: 16, overflow: "hidden" },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#94A3B8", fontSize: 14, marginTop: 12 },
  retryBtn: { marginTop: 12, backgroundColor: "#1E293B", borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: "#60A5FA", fontSize: 14, fontWeight: "600" },
  callout: { padding: 8, maxWidth: 180 },
  calloutTitle: { fontWeight: "700", fontSize: 14, marginBottom: 4 },
  calloutText: { color: "#64748B", fontSize: 12 },
  calloutAction: { color: "#2563EB", fontSize: 12, fontWeight: "600", marginTop: 4 },
  bottomSheet: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: 260,
  },
  handle: { width: 36, height: 4, backgroundColor: "#334155", borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  sheetTitle: { color: "#FFF", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  spotCard: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 16,
    width: 140,
    borderWidth: 1,
    borderColor: "#334155",
  },
  spotCardSelected: { borderColor: "#2563EB" },
  spotDistance: { color: "#FFF", fontSize: 20, fontWeight: "800" },
  spotEta: { color: "#94A3B8", fontSize: 13, marginTop: 2 },
  spotRating: { color: "#F59E0B", fontSize: 13, marginTop: 2 },
  matchBtn: { backgroundColor: "#2563EB", borderRadius: 8, paddingVertical: 8, alignItems: "center", marginTop: 8 },
  matchBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  emptyText: { color: "#64748B", fontSize: 14, textAlign: "center", marginTop: 8 },
  refreshBtn: { alignSelf: "center", marginTop: 8 },
  refreshText: { color: "#60A5FA", fontSize: 14, fontWeight: "600" },
});
