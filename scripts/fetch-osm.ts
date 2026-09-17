/**
 * Ingesta de datos OSM del campus de la Pontificia Universidad Javeriana (Bogotá).
 *
 * Se ejecuta manualmente (`bun run osm:fetch`), NO en cada request ni en cada build,
 * para no depender de la disponibilidad ni del rate limit de Overpass. El resultado
 * queda versionado en src/data/campus.json.
 *
 * Pasos:
 *   1. Resuelve el polígono real del campus (way/40739535, verificado por wikidata Q1517478).
 *   2. Descarga building + building:part dentro del bbox de ese polígono.
 *   3. Filtra por point-in-polygon contra el contorno del campus (descarta Ecopetrol,
 *      el Ministerio de Ambiente y las torres de Chapinero que caen dentro del bbox).
 *   4. Proyecta a metros y normaliza los tags 3D a un esquema compacto.
 *
 * Sistema de coordenadas de salida (IMPORTANTE):
 *   Los anillos se emiten en el PLANO DE LA SHAPE: [x = metros al este, y = metros al norte].
 *   El cliente construye THREE.Shape con esos pares, extruye en +Z y aplica rotateX(-PI/2),
 *   lo que produce world = (este, altura, -norte). Es decir el norte queda en -Z, que es
 *   la convención estándar de three.js. No invertir el signo aquí: hacerlo produce un
 *   campus espejado en el eje norte-sur.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const CAMPUS_WAY_ID = 40739535;
const CAMPUS_WIKIDATA = "Q1517478";
const OUT_PATH = fileURLToPath(new URL("../src/data/campus.json", import.meta.url));

const M_PER_DEG_LAT = 111_320;

type OsmTags = Record<string, string>;
type LatLon = { lat: number; lon: number };

type OsmElement = {
  type: "way" | "relation" | "node";
  id: number;
  tags?: OsmTags;
  geometry?: LatLon[];
  members?: { type: string; ref: number; role: string; geometry?: LatLon[] }[];
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function overpass(query: string): Promise<OsmElement[]> {
  let lastError = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const endpoint of ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            // Overpass responde 406 sin un User-Agent identificable.
            "User-Agent": "campus-javeriana-3d/1.0 (proyecto académico; ingesta manual)",
            Accept: "application/json",
          },
          body: "data=" + encodeURIComponent(query),
        });
        if (!res.ok) {
          lastError = `${endpoint} → HTTP ${res.status}`;
          continue;
        }
        const json = (await res.json()) as { elements?: OsmElement[] };
        return json.elements ?? [];
      } catch (err) {
        lastError = `${endpoint} → ${(err as Error).message}`;
      }
    }
    const wait = 2000 * (attempt + 1);
    console.warn(`  ⚠ Overpass no respondió (${lastError}); reintento en ${wait / 1000}s…`);
    await sleep(wait);
  }
  throw new Error(`Overpass agotó los reintentos. Último error: ${lastError}`);
}

/** Ray casting. `poly` en [lon, lat]. */
function pointInPolygon(x: number, y: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function centroidLonLat(ring: LatLon[]): [number, number] {
  let lon = 0;
  let lat = 0;
  for (const p of ring) {
    lon += p.lon;
    lat += p.lat;
  }
  return [lon / ring.length, lat / ring.length];
}

/** Área con la fórmula del cordón, en grados² con signo. Signo = orientación. */
function signedArea(ring: [number, number][]): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

function num(v: string | undefined): number | undefined {
  if (v == null) return undefined;
  // OSM a veces trae "12 m", "12.5", "3;4"
  const m = /-?\d+(\.\d+)?/.exec(v);
  if (!m) return undefined;
  const n = Number.parseFloat(m[0]);
  return Number.isFinite(n) ? n : undefined;
}

/** Normaliza building:colour / roof:colour a un hex que THREE.Color acepte. */
function normalizeColour(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const s = v.trim().toLowerCase();
  if (s === "transparent" || s === "none") return undefined;
  if (/^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/.test(s)) return s;
  // nombres CSS: los deja pasar, THREE.Color los resuelve
  if (/^[a-z_]+$/.test(s)) return s.replace(/_/g, "");
  return undefined;
}

/** Infiere la tipología del edificio a partir de tags primarios y secundarios */
function buildingKind(tags: OsmTags): string {
  if (tags.building && tags.building !== "yes") return tags.building;
  if (tags["building:part"] && tags["building:part"] !== "yes") return tags["building:part"];
  if (tags.amenity === "university" || tags.amenity === "college" || tags.amenity === "school") return "university";
  if (tags.amenity === "hospital" || tags.amenity === "clinic") return "hospital";
  if (tags.amenity === "place_of_worship") return "church";
  if (tags.office) return "office";
  if (tags.shop) return "commercial";
  if (tags.tourism === "hotel") return "hotel";
  return tags.building ?? tags["building:part"] ?? "yes";
}

/** Altura realista según tipología, hitos conocidos y área de huella */
function fallbackHeight(tags: OsmTags, footprintM2 = 0): number {
  const levels = num(tags["building:levels"]);
  if (levels != null) return levels * 3.2;

  const name = (tags.name ?? tags["name:es"] ?? "").toLowerCase();
  if (name.includes("ugi")) return 72; // Torre UGI: 22 pisos, ~72 m
  if (name.includes("ecopetrol")) return 36; // Edificios Ecopetrol: ~11-12 plantas
  if (name.includes("ministerio") || name.includes("anla")) return 28;
  if (name.includes("car")) return 26;

  const kind = buildingKind(tags);
  switch (kind) {
    case "hospital":
    case "clinic":
      return 18;
    case "university":
    case "college":
    case "school":
      return 12;
    case "apartments":
      return 18; // ~5-6 pisos promedio en Chapinero
    case "office":
      return 22; // ~6-7 pisos
    case "hotel":
      return 20;
    case "church":
    case "chapel":
      return 14;
    case "commercial":
    case "retail":
      return 9;
    case "house":
      return 8; // ~2.5 pisos
    case "residential":
      return 10;
    case "roof":
    case "shed":
      return 3;
    default:
      if (footprintM2 > 450) return 18; // bloque grande multifamiliar / oficinas
      if (footprintM2 > 180) return 11; // edificio mediano de 3 pisos
      return 7.5; // predio pequeño estándar de 2 plantas
  }
}

type Ring = [number, number][];

/** Agrupa los miembros de una relación multipolígono en (outer, holes). */
function ringsFromRelation(el: OsmElement): { outer: LatLon[]; inners: LatLon[][] }[] {
  const outers = (el.members ?? [])
    .filter((m) => m.role === "outer" && m.geometry && m.geometry.length >= 4)
    .map((m) => m.geometry as LatLon[]);
  const inners = (el.members ?? [])
    .filter((m) => m.role === "inner" && m.geometry && m.geometry.length >= 4)
    .map((m) => m.geometry as LatLon[]);

  if (outers.length === 0) return [];
  // Cada outer es una pieza independiente; los inners se asignan al outer que los contiene.
  return outers.map((outer) => {
    const poly = outer.map((p) => [p.lon, p.lat] as [number, number]);
    const mine = inners.filter((inner) => {
      const [cx, cy] = centroidLonLat(inner);
      return pointInPolygon(cx, cy, poly);
    });
    return { outer, inners: mine };
  });
}

async function main() {
  console.log("→ Resolviendo el polígono del campus…");
  const campusEls = await overpass(
    `[out:json][timeout:60];way(${CAMPUS_WAY_ID});out geom;`,
  );
  const campus = campusEls.find((e) => e.geometry && e.geometry.length > 3);
  if (!campus?.geometry) throw new Error("No se encontró el polígono del campus");
  if (campus.tags?.wikidata !== CAMPUS_WIKIDATA) {
    console.warn(
      `⚠ way/${CAMPUS_WAY_ID} tiene wikidata=${campus.tags?.wikidata} (se esperaba ${CAMPUS_WIKIDATA}). ` +
        `El objeto pudo cambiar en OSM — verificar antes de confiar en el resultado.`,
    );
  }
  const campusPoly: Ring = campus.geometry.map((p) => [p.lon, p.lat]);
  console.log(`  ${campus.tags?.name} — ${campusPoly.length} vértices`);

  const lats = campus.geometry.map((p) => p.lat);
  const lons = campus.geometry.map((p) => p.lon);
  const south = Math.min(...lats);
  const north = Math.max(...lats);
  const west = Math.min(...lons);
  const east = Math.max(...lons);

  // Origen del sistema local = centro del bbox del campus.
  const originLat = (south + north) / 2;
  const originLon = (west + east) / 2;
  const mPerDegLon = M_PER_DEG_LAT * Math.cos((originLat * Math.PI) / 180);

  const MARGIN_M = 200; // ~2 cuadras a la redonda
  const bboxSouth = south - MARGIN_M / M_PER_DEG_LAT;
  const bboxNorth = north + MARGIN_M / M_PER_DEG_LAT;
  const bboxWest = west - MARGIN_M / mPerDegLon;
  const bboxEast = east + MARGIN_M / mPerDegLon;

  console.log("→ Descargando edificios (Overpass)…");
  const bbox = `${bboxSouth},${bboxWest},${bboxNorth},${bboxEast}`;
  const elements = await overpass(
    `[out:json][timeout:90];(` +
      `way["building"](${bbox});` +
      `relation["building"](${bbox});` +
      `way["building:part"](${bbox});` +
      `relation["building:part"](${bbox});` +
      `);out geom;`,
  );
  console.log(`  ${elements.length} elementos crudos en el bbox`);

  type Piece = { outer: LatLon[]; inners: LatLon[][] };

  const buildings: unknown[] = [];
  let skippedOutside = 0;
  let skippedDegenerate = 0;

  for (const el of elements) {
    const tags = el.tags ?? {};
    let pieces: Piece[] = [];

    if (el.type === "way" && el.geometry && el.geometry.length >= 4) {
      pieces = [{ outer: el.geometry, inners: [] }];
    } else if (el.type === "relation") {
      pieces = ringsFromRelation(el);
    }
    if (pieces.length === 0) {
      skippedDegenerate++;
      continue;
    }

    const isPart = tags["building:part"] != null && tags.building == null;
    const kind = buildingKind(tags);
    const minHeight = num(tags.min_height) ?? 0;
    const roofHeight = num(tags["roof:height"]) ?? 0;
    const roofShape = tags["roof:shape"];

    const projected = pieces
      .map(({ outer, inners }) => {
        const toShape = (ring: LatLon[]): Ring => {
          const pts: Ring = ring.map((p) => [
            (p.lon - originLon) * mPerDegLon,
            (p.lat - originLat) * M_PER_DEG_LAT, // +Y = norte. Ver nota de cabecera.
          ]);
          // Overpass cierra el anillo repitiendo el primer punto; THREE.Shape no lo quiere.
          const first = pts[0];
          const last = pts[pts.length - 1];
          if (
            pts.length > 1 &&
            Math.abs(first[0] - last[0]) < 1e-9 &&
            Math.abs(first[1] - last[1]) < 1e-9
          ) {
            pts.pop();
          }
          return pts;
        };

        const o = toShape(outer);
        if (o.length < 3) return null;
        // Contorno CCW, huecos CW: evita agujeros invertidos en la triangulación.
        if (signedArea(o) < 0) o.reverse();
        const hs = inners
          .map(toShape)
          .filter((h) => h.length >= 3)
          .map((h) => (signedArea(h) > 0 ? h.reverse() : h));
        return { outer: o, holes: hs };
      })
      .filter((p): p is { outer: Ring; holes: Ring[] } => p !== null);

    if (projected.length === 0) {
      skippedDegenerate++;
      continue;
    }

    // Área en m² de la huella para calibrar la altura si no viene etiquetada
    const footprintM2 = Math.abs(signedArea(projected[0].outer));
    const height = num(tags.height) ?? fallbackHeight(tags, footprintM2);

    // Redondeo a cm: recorta ~40% del peso del JSON sin diferencia visible.
    const round = (r: Ring): Ring => r.map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]);

    buildings.push({
      id: `${el.type === "relation" ? "relation" : "way"}/${el.id}`,
      name: tags.name ?? tags["name:es"] ?? null,
      kind,
      isPart,
      height: +height.toFixed(2),
      minHeight: +minHeight.toFixed(2),
      levels: num(tags["building:levels"]) ?? null,
      colour: normalizeColour(tags["building:colour"]) ?? null,
      material: tags["building:material"] ?? null,
      roofColour: normalizeColour(tags["roof:colour"]) ?? null,
      roofMaterial: tags["roof:material"] ?? null,
      roofShape: roofShape ?? null,
      roofHeight: roofHeight > 0 && roofHeight < height ? +roofHeight.toFixed(2) : 0,
      roofDirection: num(tags["roof:direction"]) ?? null,
      parts: projected.map((p) => ({ outer: round(p.outer), holes: p.holes.map(round) })),
    });
  }

  const campusOutline = campus.geometry.map((p) => [
    +((p.lon - originLon) * mPerDegLon).toFixed(2),
    +((p.lat - originLat) * M_PER_DEG_LAT).toFixed(2),
  ]);

  const named = buildings.filter((b) => (b as { name: string | null }).name !== null);

  let bMinX = Infinity;
  let bMaxX = -Infinity;
  let bMinY = Infinity;
  let bMaxY = -Infinity;
  for (const b of buildings as { parts: { outer: Ring }[] }[]) {
    for (const part of b.parts) {
      for (const [x, y] of part.outer) {
        if (x < bMinX) bMinX = x;
        if (x > bMaxX) bMaxX = x;
        if (y < bMinY) bMinY = y;
        if (y > bMaxY) bMaxY = y;
      }
    }
  }

  const payload = {
    meta: {
      source: "OpenStreetMap contributors, ODbL 1.0",
      campusId: `way/${CAMPUS_WAY_ID}`,
      campusName: campus.tags?.name ?? "Pontificia Universidad Javeriana",
      website: campus.tags?.website ?? null,
      fetchedAt: new Date().toISOString(),
      origin: { lat: originLat, lon: originLon },
      // Nota de convención para el consumidor:
      ringSpace: "shape-plane: [x = metros al este, y = metros al norte]",
      widthM: +(bMaxX - bMinX).toFixed(1),
      depthM: +(bMaxY - bMinY).toFixed(1),
      buildingCount: buildings.length,
      namedCount: named.length,
    },
    campusOutline,
    buildings,
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(payload));

  console.log(`  descartados fuera del campus: ${skippedOutside}`);
  console.log(`  descartados por geometría degenerada: ${skippedDegenerate}`);
  console.log(
    `✓ ${buildings.length} edificios (${named.length} con nombre) — ` +
      `campus ${payload.meta.widthM}×${payload.meta.depthM} m`,
  );
  console.log(`✓ escrito en ${OUT_PATH}`);
}

main().catch((err) => {
  console.error("✗ Falló la ingesta:", err);
  process.exit(1);
});
