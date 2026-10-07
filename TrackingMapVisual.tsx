import { useEffect, useRef } from "react";
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, UrlTile, type Region } from "react-native-maps";
import CustomerPin from "./assets/tracking-customer-pin.svg";
import DestinationPin from "./assets/tracking-destination-pin.svg";
import RecenterIcon from "./assets/tracking-recenter.svg";
import LiveIndicator from "./assets/tracking-live-indicator.svg";
import DelayedIndicator from "./assets/tracking-location-delayed.svg";
import LivePulse from "./assets/tracking-live-pulse.svg";

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
  /** Pulse and the live mark run only while this is true. */
  live?: boolean;
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
  live = true,
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
  const pulseOn = Boolean(van) && live && !stale && !reduceMotion;
  const scale = useRef(new Animated.Value(0.65)).current;
  const opacity = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    if (!pulseOn) {
      scale.setValue(0.65);
      opacity.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.7,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.65, duration: 0, useNativeDriver: false }),
          Animated.timing(opacity, { toValue: 0.75, duration: 0, useNativeDriver: false }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, pulseOn, scale]);

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
            <CustomerPin width={32} height={32} />
          </Marker>
        ) : null}
        {separateDestination && destination ? (
          <Marker coordinate={destination} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <DestinationPin width={28} height={28} />
          </Marker>
        ) : null}
        {van && pulseOn ? (
          <Marker coordinate={van} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges>
            <View style={styles.pulseSlot}>
              <Animated.View style={[styles.pulse, { opacity, transform: [{ scale }] }]}>
                <LivePulse width={72} height={72} />
              </Animated.View>
            </View>
          </Marker>
        ) : null}
        {van ? (
          <Marker coordinate={van} anchor={{ x: 0.5, y: 0.5 }} flat rotation={heading} tracksViewChanges={false}>
            <Image source={VAN} style={styles.van} />
          </Marker>
        ) : null}
      </MapView>
      {stale ? (
        <View style={styles.signal} pointerEvents="none">
          <DelayedIndicator width={16} height={16} />
        </View>
      ) : live && van ? (
        <View style={styles.signal} pointerEvents="none">
          <LiveIndicator width={16} height={16} />
        </View>
      ) : null}
      <Pressable
        style={styles.recenter}
        onPress={onRecenter}
        accessibilityRole="button"
        accessibilityLabel="Recenter"
      >
        <RecenterIcon width={24} height={24} />
      </Pressable>
      <Text style={styles.attribution}>© OpenStreetMap contributors, © CARTO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#070D18" },
  van: { width: 17, height: 36, resizeMode: "contain" },
  pulseSlot: { width: 124, height: 124, alignItems: "center", justifyContent: "center" },
  pulse: { width: 72, height: 72 },
  signal: { position: "absolute", top: 12, end: 12 },
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
    alignItems: "center",
    justifyContent: "center",
  },
  attribution: { position: "absolute", start: 8, bottom: 4, color: "#8EA0B8", fontSize: 9 },
});
