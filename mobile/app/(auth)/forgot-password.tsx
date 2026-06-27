import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { api } from "@/lib/api";
import { StatusBar } from "expo-status-bar";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert("Error", "Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.container}>
      <StatusBar style="light" />
      <View style={s.inner}>
        <Text style={s.title}>Reset Password</Text>

        {sent ? (
          <>
            <Text style={s.subtitle}>Check your email for a reset link.</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={s.link}>Back to login</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.subtitle}>Enter your email and we'll send you a reset link.</Text>
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />
            <TouchableOpacity style={[s.button, loading && s.buttonDisabled]} onPress={handleReset} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={s.buttonText}>Send Reset Link</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={s.link}>Back to login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: "800", color: "#FFF", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#94A3B8", textAlign: "center", marginBottom: 32 },
  input: { backgroundColor: "#1E293B", borderRadius: 12, padding: 16, fontSize: 16, color: "#FFF", marginBottom: 12, borderWidth: 1, borderColor: "#334155" },
  button: { backgroundColor: "#2563EB", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8, marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  link: { color: "#60A5FA", fontSize: 14, textAlign: "center", marginTop: 8 },
});
