# X Detailing — final tracking handoff

Presentation only. Codex connects GPS, staff, ratings, and payment. This package does not.

Preview pictures that show a name, a star average, or an ETA are **VISUAL QA DATA**. Do not hardcode them.

## 1. Production assets

| File | Use |
|---|---|
| `assets/tracking-van-marker@3x.png` | **Primary van marker** on the map |
| `assets/tracking-van-marker@2x.png` | 2x |
| `assets/tracking-van-marker@1x.png` | 1x |
| `assets/tracking-van-marker-primary.png` | Large master of the same van |
| `assets/tracking-van-marker.svg` | Silhouette fallback only |
| `assets/tracking-live-pulse.svg` | Under the van. Does not rotate |
| `assets/tracking-live-indicator.svg` | Green live dot |
| `assets/tracking-location-delayed.svg` | Amber dot when the fix is stale |
| `assets/tracking-recenter.svg` | Inside the 44pt glass button |
| `assets/tracking-customer-pin.svg` | Customer / service address |
| `assets/tracking-destination-pin.svg` | Only if that point is different |
| `assets/technician-call.svg` | Call control |
| `assets/rating-star.svg` | Star |
| `assets/tip-icon.svg` | Tip |
| `assets/service-complete.svg` | Completion mark |

`previews/` is reference art, not a basemap.

## 2. Van marker

Use `tracking-van-marker@3x.png`. Show it at **17 × 36 pt**. It stays clear from 32 pt to 44 pt on the long side.

Anchor `{ x: 0.5, y: 0.5 }`. The nose points **up** at heading `0`. Set `flat` and `rotation` to the GPS heading in degrees clockwise from north.

The PNG is transparent and has no pulse baked in.

## 3. Pulse

Add a second marker at the same coordinate, **without** rotation, using `tracking-live-pulse.svg`. Draw it before the van so it sits underneath.

Animate scale `0.65 → 1.7` and opacity `0.75 → 0` over 1800ms. If Reduce Motion is on, or the fix is stale, do not animate. Hide the ring.

## 4. CARTO vector (preferred)

MapLibre, or a React Native map that accepts a MapLibre style:

```
https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json?key=${CARTO_BASEMAP_API_KEY}
```

Replace `${CARTO_BASEMAP_API_KEY}` at runtime from secure config. The same key goes on glyph and sprite URLs inside that style. Do not commit the key.

## 5. CARTO raster fallback

For `react-native-maps` `UrlTile`:

```
https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{scale}.png?key=${CARTO_BASEMAP_API_KEY}
```

- `{s}` is `a`, `b`, `c`, or `d`
- `{scale}` is empty at 1x and `@2x` on retina
- zoom `0` to `20`
- style is Dark Matter with labels: `dark_all`

`TrackingMapVisual` builds this URL from the `cartoApiKey` prop. If the prop is empty it does **not** request tiles, so the "API KEY REQUIRED" watermark never appears.

## 6. Attribution

Keep this on the map, above the home indicator:

`© OpenStreetMap contributors, © CARTO`

## 7. Values that must come from the backend

- Van coordinate and heading
- Customer coordinate
- Destination, only when it differs
- Route, only from a real routing response
- ETA, distance, and progress, only from a real source
- Technician photo, name, role, phone, average rating, rating count
- Assistant, or omit the row
- Van number and model
- Booking summary
- Tip charge result

Do not invent a route, an ETA, a distance, a progress percent, or van movement inside these components.

## 8. AssignedTechnicianCard

Pass staff on props. `onCall(phone)` is the contact action. The label is **اتصال**. There is no sample employee inside the file.

Status copy:

| status | Arabic |
|---|---|
| `assigned` | تم تعيين الفني |
| `on_the_way` | الفني بالطريق إليك |
| `arrived` | وصل الفني |
| `in_progress` | جاري تنفيذ الخدمة |

The live line shows only for `on_the_way`. After arrival, do not keep "on the way".

If `assistant` is null, render nothing for the second person.

## 9. Ratings

`PostServiceExperience` starts with **تمت الخدمة بنجاح**, then the booking summary, technician, and van from props.

Stars start unset (`0`). `onTechnicianRating` and `onServiceRating` receive `1–5`. `onComment` receives the optional text. `onContinue` moves to the tip step. Nothing is submitted here.

There is no app rating and no App Store review.

## 10. TipSelector

Amounts: 5, 10, 20 AED, **مبلغ آخر**, and **تخطي**. Nothing is selected on first paint.

`onSelectPreset(amount)` and `onCustomText` only report the choice. They do not mean payment succeeded. Codex handles payment, then shows its own result. **تخطي** calls `onSkip`.

## 11. Recenter and follow

- Van and destination exist: fit both, 48 pt padding.
- Van only: center the van.
- Destination or customer only: center that point.
- Pan or pinch: `onFollowChange(false)`.
- Recenter: `onRecenter()`, and the parent sets follow back to true.

## 12. RTL and safe area

Arabic: `direction: "rtl"` on cards. English: `ltr`.

Never mirror the map, the roads, the van image, the heading, or the pins. Use `start` / `end`, not left / right.

Do not hardcode screen coordinates or a status-bar height. Apply the device safe-area insets around the map controls, the card, and the rating screens. Layouts are flex, so they fit iPhone XS Max, Dynamic Island phones, and smaller phones.

## 13. Screen order

Live tracking → technician assigned → on the way → arrived → service in progress → completed → technician rating → service rating → optional comment → optional tip → done.
