import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import CompleteMark from "./assets/service-complete.svg";
import RatingStar from "./assets/rating-star.svg";

export type PostServiceExperienceProps = {
  language: "ar" | "en";
  bookingSummary: string;
  technicianName: string;
  vanNumber: string;
  technicianRating: number;
  serviceRating: number;
  comment: string;
  onTechnicianRating: (value: number) => void;
  onServiceRating: (value: number) => void;
  onComment: (value: string) => void;
  onContinue: () => void;
};

const COPY = {
  title: { ar: "تمت الخدمة بنجاح", en: "Service completed" },
  tech: { ar: "قيّم الفني", en: "Rate the technician" },
  service: { ar: "قيّم الخدمة", en: "Rate the service" },
  ask: { ar: "كيف كانت تجربتك مع الفني؟", en: "How was your technician?" },
  comment: { ar: "أضف تعليقًا — اختياري", en: "Add a comment — optional" },
  next: { ar: "متابعة", en: "Continue" },
} as const;

function Stars({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <View accessibilityRole="adjustable" accessibilityLabel={label} style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} hitSlop={6}>
          <RatingStar width={32} height={32} opacity={star <= value ? 1 : 0.28} />
        </Pressable>
      ))}
    </View>
  );
}

export function PostServiceExperience({
  language,
  bookingSummary,
  technicianName,
  vanNumber,
  technicianRating,
  serviceRating,
  comment,
  onTechnicianRating,
  onServiceRating,
  onComment,
  onContinue,
}: PostServiceExperienceProps) {
  const ar = language === "ar";
  const t = (key: keyof typeof COPY) => (ar ? COPY[key].ar : COPY[key].en);

  return (
    <View style={[styles.wrap, { direction: ar ? "rtl" : "ltr" }]}>
      <View style={styles.mark}>
        <CompleteMark width={72} height={72} />
      </View>
      <Text style={styles.title}>{t("title")}</Text>
      <Text style={styles.summary}>{bookingSummary}</Text>
      <Text style={styles.meta}>
        {technicianName} · {vanNumber}
      </Text>
      <Text style={styles.ask}>{t("ask")}</Text>
      <Text style={styles.label}>{t("tech")}</Text>
      <Stars value={technicianRating} onChange={onTechnicianRating} label={t("tech")} />
      <Text style={styles.label}>{t("service")}</Text>
      <Stars value={serviceRating} onChange={onServiceRating} label={t("service")} />
      <TextInput
        value={comment}
        onChangeText={onComment}
        placeholder={t("comment")}
        placeholderTextColor="#8EA0B8"
        multiline
        style={styles.input}
      />
      <Pressable onPress={onContinue} style={styles.next}>
        <Text style={styles.nextText}>{t("next")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: "#070D18", padding: 20, gap: 10, alignItems: "stretch" },
  mark: { alignItems: "center" },
  title: { color: "#F3F7FB", fontSize: 24, fontWeight: "700", textAlign: "center" },
  summary: { color: "#F3F7FB", fontSize: 15, textAlign: "center" },
  meta: { color: "#8EA0B8", fontSize: 13, textAlign: "center" },
  ask: { color: "#8AF0FF", fontSize: 14, marginTop: 8 },
  label: { color: "#F3F7FB", fontSize: 15, fontWeight: "600" },
  stars: { flexDirection: "row", gap: 8 },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: "#1C2D48",
    borderRadius: 16,
    padding: 12,
    color: "#F3F7FB",
    textAlignVertical: "top",
  },
  next: {
    height: 48,
    borderRadius: 16,
    backgroundColor: "#3AD7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  nextText: { color: "#07090E", fontWeight: "700" },
});
