import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { router } from "expo-router";
import { api } from "@/lib/api";

export default function OfferScreen() {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [minutesUntilDeparture, setMinutesUntilDeparture] = useState("15");
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Location access required.");
        setLocating(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const pos = { lat: loc.coords.latitude, lng: loc.coords.longitude };
      setLocation(pos);
      setPin(pos);
      setLocating(false);
    })();
  }, []);

  async function handleOffer() {
    if (!pin) { Alert.alert("Error", "Set your spot location on the map."); return; }
    const depMinutes = parseInt(minutesUntilDeparture, 10);
    if (isNaN(depMinutes) || depMinutes < 1) { Alert.alert("Error", "Enter valid minutes."); return; }

    setSubmitting(true);
    try {
      const expectedDeparture = new Date(Date.now() + depMinutes * 60000).toISOString();
      await api.offerSpot({
        latitude: pin.lat,
        longitude: pin.lng,
        address: address.trim() || undefined,
        expectedDeparture,
      });
      Alert.alert("Spot Offered!", "Drivers will be notified.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const region = location ? {
    latitude: location.lat,
    longitude: location.lng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  } : undefined;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={s.header}>
        <Text style={s.title}>Offer Your Spot</Text>
        <Text style={s.subtitle}>Tap the map to set your parking location</Text>
      </View>

      {locating ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <View style={s.mapContainer}>
          <MapView
            ref={mapRef}
            style={s.map}
            initialRegion={region}
            showsUserLocation
            onPress={(e) => setPin({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}
          >
            {pin && <Marker coordinate={{ latitude: pin.lat, longitude: pin.lng }} pinColor="#2563EB" />}
          </MapView>
        </View>
      )}

      <View style={s.form}>
        <TextInput
          style={s.input}
          placeholder="Address (optional)"
          placeholderTextColor="#64748B"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={s.input}
          placeholder="Minutes until you leave"
          placeholderTextColor="#64748B"
          value={minutesUntilDeparture}
          onChangeText={setMinutesUntilDeparture}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[s.offerBtn, submitting && s.offerBtnDisabled]}
          onPress={handleOffer}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={s.offerBtnText}>Offer My Spot</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "800", color: "#FFF" },
  subtitle: { fontSize: 14, color: "#94A3B8", marginTop: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  mapContainer: { flex: 1, marginHorizontal: 12, borderRadius: 16, overflow: "hidden" },
  map: { flex: 1 },
  form: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, backgroundColor: "#1E293B", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  input: { backgroundColor: "#0F172A", borderRadius: 12, padding: 16, fontSize: 16, color: "#FFF", marginBottom: 12, borderWidth: 1, borderColor: "#334155" },
  offerBtn: { backgroundColor: "#10B981", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 4 },
  offerBtnDisabled: { opacity: 0.6 },
  offerBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
