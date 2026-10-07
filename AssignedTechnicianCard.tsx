import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import CallIcon from "./assets/technician-call.svg";

export type TrackingCardStatus = "assigned" | "on_the_way" | "arrived" | "in_progress";

export type StaffProfile = {
  name: string;
  role: string;
  photoUri?: string | null;
};

export type AssignedTechnicianCardProps = {
  language: "ar" | "en";
  status: TrackingCardStatus;
  technician: StaffProfile & {
    phone: string;
    averageRating: number;
    ratingCount: number;
  };
  assistant?: StaffProfile | null;
  van: { number: string; model: string };
  onCall: (phone: string) => void;
};

const COPY = {
  assigned: { ar: "تم تعيين الفني", en: "Technician assigned" },
  on_the_way: { ar: "الفني بالطريق إليك", en: "Technician is on the way" },
  arrived: { ar: "وصل الفني", en: "Technician arrived" },
  in_progress: { ar: "جاري تنفيذ الخدمة", en: "Service in progress" },
  call: { ar: "اتصال", en: "Call" },
  live: { ar: "تتبع مباشر", en: "Live tracking" },
  reviews: { ar: "تقييم", en: "reviews" },
} as const;

function initials(name: string) {
  const part = name.trim().split(/\s+/)[0] ?? "";
  return part.slice(0, 1);
}

/** Groups a UAE mobile number. Any other value is shown exactly as passed in. */
export function formatTechnicianPhone(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("971") && digits.length === 12) {
    const local = digits.slice(3);
    return `+971 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  }
  return trimmed;
}

function Avatar({ person, size }: { person: StaffProfile; size: number }) {
  if (person.photoUri) {
    return <Image source={{ uri: person.photoUri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.fallbackText}>{initials(person.name)}</Text>
    </View>
  );
}

export function AssignedTechnicianCard({
  language,
  status,
  technician,
  assistant,
  van,
  onCall,
}: AssignedTechnicianCardProps) {
  const ar = language === "ar";
  const live = status === "on_the_way";
  const callLabel = ar ? COPY.call.ar : COPY.call.en;
  const reviewLabel = ar ? COPY.reviews.ar : COPY.reviews.en;

  return (
    <View style={[styles.card, { direction: ar ? "rtl" : "ltr" }]}>
      <Text style={styles.status}>{ar ? COPY[status].ar : COPY[status].en}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={callLabel}
          onPress={() => onCall(technician.phone)}
          style={styles.call}
        >
          <CallIcon width={48} height={48} />
          <Text style={styles.callText}>{callLabel}</Text>
        </Pressable>
        <View style={styles.copy}>
          <Text style={styles.role}>{technician.role}</Text>
          <Text style={styles.name}>{technician.name}</Text>
          <Text style={styles.meta}>
            {technician.averageRating.toFixed(1)} · {technician.ratingCount} {reviewLabel}
          </Text>
          <Text style={styles.phone}>{formatTechnicianPhone(technician.phone)}</Text>
          <Text style={styles.meta}>
            {van.number} · {van.model}
          </Text>
          {live ? <Text style={styles.live}>{ar ? COPY.live.ar : COPY.live.en}</Text> : null}
        </View>
        <Avatar person={technician} size={52} />
      </View>
      {assistant ? (
        <View style={styles.assistant}>
          <Avatar person={assistant} size={28} />
          <View style={styles.copy}>
            <Text style={styles.assistantName}>{assistant.name}</Text>
            <Text style={styles.meta}>{assistant.role}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "rgba(58, 215, 255, 0.45)",
    backgroundColor: "#0C1422",
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  status: { color: "#8AF0FF", fontSize: 13, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  role: { color: "#8EA0B8", fontSize: 12 },
  name: { color: "#F3F7FB", fontSize: 16, fontWeight: "700" },
  meta: { color: "#8EA0B8", fontSize: 12, marginTop: 2 },
  phone: { color: "#F3F7FB", fontSize: 14, fontWeight: "600", marginTop: 2, writingDirection: "ltr" },
  live: { color: "#3EE59A", fontSize: 12, marginTop: 4 },
  call: { alignItems: "center", gap: 2 },
  callText: { color: "#8AF0FF", fontSize: 11, fontWeight: "700" },
  fallback: { backgroundColor: "#121C2E", alignItems: "center", justifyContent: "center" },
  fallbackText: { color: "#3AD7FF", fontWeight: "700" },
  assistant: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#1C2D48",
    paddingTop: 8,
  },
  assistantName: { color: "#F3F7FB", fontSize: 13, fontWeight: "600" },
});
