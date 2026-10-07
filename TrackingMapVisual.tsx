import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, UrlTile, type Region } from "react-native-maps";

export type LatLng = { latitude: number; longitude: number };

export type TrackingMapVisualProps = {
  /** From secure config. Never commit a real key. An empty string skips tile requests. */
  cartoApiKey: string;
  van?: LatLng | null;
  /** Degrees clockwise from north. 0 means the van nose points up. */
  heading?: number;
  customer?: LatLng | null;
  /** Pass only when this point is different from the customer/service location. */
  destination?: LatLng | null;
  /** Real route only. Omit when no routing provider has returned a path. */
  route?: LatLng[] | null;
  stale?: boolean;
  following?: boolean;
  onFollowChange?: (following: boolean) => void;
  onRecenter?: () => void;
  reduceMotion?: boolean;
};

export const CARTO_VECTOR_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?key=${CARTO_BASEMAP_API_KEY}";

export function cartoRasterTemplate(retina: boolean) {
  const scale = retina ? "@2x" : "";
  return `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}${scale}.png?key=\${CARTO_BASEMAP_API_KEY}`;
}

const VAN = require("./assets/tracking-van-marker@3x.png");

function regionFor(point: LatLng, delta: number): Region {
  return { ...point, latitudeDelta: delta, longitudeDelta: delta };
}

export function TrackingMapVisual({
  cartoApiKey,
  van,
  heading = 0,
  customer,
  destination,
  route,
  stale = false,
  following = true,
  onFollowChange,
  onRecenter,
  reduceMotion = false,
}: TrackingMapVisualProps) {
  const focus = van ?? customer ?? destination ?? null;
  const separateDestination = Boolean(
    destination &&
      customer &&
      (destination.latitude !== customer.latitude || destination.longitude !== customer.longitude),
  );
  const tileUrl = cartoApiKey
    ? `https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png?key=${encodeURIComponent(cartoApiKey)}`
    : null;
  const line = stale ? "#F0A43A" : "#3AD7FF";

  return (
    <View style={styles.fill}>
      <MapView
        style={styles.fill}
        initialRegion={focus ? regionFor(focus, 0.04) : undefined}
        region={following && van ? regionFor(van, 0.02) : undefined}
        onPanDrag={() => onFollowChange?.(false)}
        mapType="none"
      >
        {tileUrl ? <UrlTile urlTemplate={tileUrl} maximumZ={20} /> : null}
        {route && route.length > 1 ? (
          <Polyline coordinates={route} strokeColor={stale ? "rgba(240,164,58,0.22)" : "rgba(58,215,255,0.22)"} strokeWidth={10} />
        ) : null}
        {route && route.length > 1 ? <Polyline coordinates={route} strokeColor={line} strokeWidth={4} /> : null}
        {customer ? (
          <Marker coordinate={customer} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.customer} />
          </Marker>
        ) : null}
        {separateDestination && destination ? (
          <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.destination} />
          </Marker>
        ) : null}
        {van && !reduceMotion && !stale ? (
          <Marker coordinate={van} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.pulse} />
          </Marker>
        ) : null}
        {van ? (
          <Marker coordinate={van} anchor={{ x: 0.5, y: 0.5 }} flat rotation={heading} tracksViewChanges={false}>
            <Image source={VAN} style={styles.van} />
          </Marker>
        ) : null}
      </MapView>
      <Pressable style={styles.recenter} onPress={onRecenter} accessibilityLabel="Recenter" />
      <Text style={styles.attribution}>© OpenStreetMap contributors, © CARTO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#070D18" },
  van: { width: 17, height: 36, resizeMode: "contain" },
  pulse: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(58,215,255,0.45)",
  },
  customer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#071018",
    borderWidth: 2,
    borderColor: "#F3F7FB",
  },
  destination: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#3AD7FF",
    borderWidth: 3,
    borderColor: "#F3F7FB",
  },
  recenter: {
    position: "absolute",
    end: 12,
    bottom: 28,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(12,20,34,0.9)",
    borderWidth: 1,
    borderColor: "#1C2D48",
  },
  attribution: { position: "absolute", start: 8, bottom: 4, color: "#8EA0B8", fontSize: 9 },
});
