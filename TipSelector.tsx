import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export type TipSelection = { kind: "preset"; amount: number } | { kind: "custom"; amount: number } | null;

export type TipSelectorProps = {
  language: "ar" | "en";
  /** Null until the customer chooses. Never preselect. */
  selection: TipSelection;
  customText: string;
  onSelectPreset: (amount: number) => void;
  onChooseCustom: () => void;
  onCustomText: (value: string) => void;
  onSkip: () => void;
};

const PRESETS = [5, 10, 20] as const;

export function TipSelector({
  language,
  selection,
  customText,
  onSelectPreset,
  onChooseCustom,
  onCustomText,
  onSkip,
}: TipSelectorProps) {
  const ar = language === "ar";
  const customOpen = selection?.kind === "custom";

  return (
    <View style={[styles.wrap, { direction: ar ? "rtl" : "ltr" }]}>
      <Text style={styles.title}>{ar ? "أضف إكرامية للفني" : "Add a tip for the technician"}</Text>
      <Text style={styles.note}>{ar ? "اختيارية. تقدر تتخطاها." : "Optional. You can skip it."}</Text>
      <View style={styles.row}>
        {PRESETS.map((amount) => {
          const on = selection?.kind === "preset" && selection.amount === amount;
          return (
            <Pressable key={amount} onPress={() => onSelectPreset(amount)} style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{amount} AED</Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={onChooseCustom}
          style={[styles.chip, customOpen && styles.chipOn]}
        >
          <Text style={[styles.chipText, customOpen && styles.chipTextOn]}>{ar ? "مبلغ آخر" : "Other"}</Text>
        </Pressable>
      </View>
      {customOpen ? (
        <TextInput
          value={customText}
          onChangeText={onCustomText}
          keyboardType="decimal-pad"
          placeholder={ar ? "المبلغ بالدرهم" : "Amount in AED"}
          placeholderTextColor="#8EA0B8"
          style={styles.input}
        />
      ) : null}
      <Text style={styles.pending}>
        {ar ? "اختيار المبلغ لا يعني أن الدفع تم." : "Choosing an amount does not mean payment succeeded."}
      </Text>
      <Pressable onPress={onSkip} style={styles.skip}>
        <Text style={styles.skipText}>{ar ? "تخطي" : "Skip"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: "#070D18", padding: 20, gap: 12 },
  title: { color: "#F3F7FB", fontSize: 20, fontWeight: "700" },
  note: { color: "#8EA0B8", fontSize: 13 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#1C2D48",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipOn: { borderColor: "#3AD7FF", backgroundColor: "rgba(58, 215, 255, 0.12)" },
  chipText: { color: "#F3F7FB", fontWeight: "600" },
  chipTextOn: { color: "#8AF0FF" },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#1C2D48",
    borderRadius: 14,
    paddingHorizontal: 12,
    color: "#F3F7FB",
  },
  pending: { color: "#8EA0B8", fontSize: 12 },
  skip: { height: 48, alignItems: "center", justifyContent: "center" },
  skipText: { color: "#8EA0B8", fontWeight: "600" },
});
