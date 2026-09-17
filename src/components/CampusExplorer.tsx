"use client";

import "@/lib/suppress-warnings";
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { usePreparedBuildings, type PreparedBuilding } from "./Buildings";
import { Scene, type Focus } from "./Scene";
import { CATEGORY_STYLES } from "@/lib/materials";
import { getJaverianaBuildingInfo } from "@/lib/javeriana-descriptions";
import type { CampusData, PlacesData, TerrainData } from "@/lib/types";

type Props = { data: CampusData; terrain: TerrainData; places: PlacesData };

/** Ancho de la barra lateral en px. Debe coincidir con la clase `w-72` del <aside>. */
const SIDEBAR_WIDTH = 288;

export function CampusExplorer({ data, terrain, places }: Props) {
  const prepared = usePreparedBuildings(data.buildings);
  const [webglFailed, setWebglFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showTrees, setShowTrees] = useState(true);
  const [showAccesses, setShowAccesses] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [query, setQuery] = useState("");
  const [includeUnnamed, setIncludeUnnamed] = useState(false);
  const [focus, setFocus] = useState<Focus | null>(null);

  useEffect(() => {
    const updateSize = () => setIsMobile(window.innerWidth < 768);
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const radius = Math.max(data.meta.widthM, data.meta.depthM) / 2;
  const sidebarWidth = isMobile ? 0 : SIDEBAR_WIDTH;

  const byId = useMemo(() => {
    const m = new Map<string, PreparedBuilding>();
    for (const p of prepared) m.set(p.building.id, p);
    return m;
  }, [prepared]);

  const listed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prepared
      .filter((p) => !p.building.isPart)
      .filter((p) => includeUnnamed || p.building.name !== null)
      .filter((p) => {
        if (selectedCategory === "todos") return true;
        return p.building.category === selectedCategory;
      })
      .filter((p) => {
        if (!q) return true;
        const label = p.building.name ?? p.building.id;
        const cat = p.building.category ?? "";
        const catLabel = CATEGORY_STYLES[cat]?.label ?? "";
        return (
          label.toLowerCase().includes(q) ||
          p.building.kind.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q) ||
          catLabel.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const an = a.building.name;
        const bn = b.building.name;
        if (an && bn) return an.localeCompare(bn, "es", { numeric: true });
        if (an) return -1;
        if (bn) return 1;
        return a.building.id.localeCompare(b.building.id);
      });
  }, [prepared, query, includeUnnamed, selectedCategory]);

  const select = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (!id) {
        setFocus(null);
        return;
      }
      const p = byId.get(id);
      // `center` es [x, z] del mundo; se apunta a media altura del volumen.
      if (p) {
        setFocus({
          id,
          position: [p.geometry.center[0], p.geometry.top * 0.5, p.geometry.center[1]],
          // Se encuadra según lo mayor entre huella y altura, para que una torre
          // estrecha y alta no quede cortada.
          extent: Math.max(p.geometry.footprintRadius, p.geometry.top * 0.6),
        });
      }
    },
    [byId],
  );

  const selected = selectedId ? byId.get(selectedId) : undefined;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0d1b2e] text-slate-100">
      {webglFailed ? (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <p className="max-w-md text-center text-sm leading-relaxed text-slate-300">
            No se pudo inicializar WebGL en este navegador, así que la vista 3D no está
            disponible. El listado de edificios de la izquierda sigue funcionando.
          </p>
        </div>
      ) : (
        <Canvas
          // `shadows` booleano hace que r3f pida PCFSoftShadowMap, deprecado en three
          // 0.185: el motor lo sustituye por PCFShadowMap y avisa por consola. Se pide
          // directamente el que se acaba usando, así que no hay cambio visual.
          shadows="percentage"
          dpr={[1, 2]}
          camera={{
            fov: 45,
            near: 1,
            far: radius * 12,
            // A ~790 m con fov 45 entran los 590 m de fondo del campus. Más cerca
            // se recorta el extremo sur, que es donde están las zonas deportivas.
            position: [radius * 1.1, radius * 1.45, radius * 1.95],
          }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          onPointerMissed={() => select(null)}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", () => setWebglFailed(true));
          }}
        >
          <Scene
            data={data}
            terrain={terrain}
            places={places}
            prepared={prepared}
            selectedId={selectedId}
            hoveredId={hoveredId}
            showLabels={showLabels}
            showTrees={showTrees}
            showAccesses={showAccesses}
            showServices={showServices}
            isNight={isNight}
            focus={focus}
            sidebarWidth={sidebarWidth}
            onSelect={select}
            onHover={setHoveredId}
          />
        </Canvas>
      )}

      {/* ---------- Cabecera ---------- */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between bg-gradient-to-b from-[#0d1b2e]/95 via-[#0d1b2e]/70 to-transparent px-4 py-3 sm:px-6 sm:py-4">
        <div className="pointer-events-auto">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">
            Explorador 3D · geometría real de OpenStreetMap
          </p>
          <h1 className="mt-0.5 text-sm font-bold text-slate-100 sm:text-lg">{data.meta.campusName}</h1>
        </div>

        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsNight((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-[#0f2038]/90 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-md backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
            title={isNight ? "Cambiar a modo día" : "Cambiar a modo noche"}
          >
            <span>{isNight ? "🌙 Noche" : "☀️ Día"}</span>
          </button>

          <div className="hidden text-right font-mono text-[10px] leading-relaxed text-slate-400 lg:block">
            <p>
              <b className="text-orange-400">{data.meta.buildingCount}</b> volúmenes ·{" "}
              <b className="text-orange-400">{data.meta.namedCount}</b> con nombre
            </p>
            <p>
              <b className="text-orange-400">{terrain.meta.pathCount}</b> vías ·{" "}
              <b className="text-orange-400">{terrain.meta.areaCount}</b> zonas ·{" "}
              <b className="text-orange-400">{terrain.meta.treeCount}</b> árboles
            </p>
            <p>
              {data.meta.widthM} × {data.meta.depthM} m
            </p>
          </div>
        </div>
      </header>

      {/* ---------- Botón flotante para celular (modo móvil) ---------- */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed bottom-6 left-3.5 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-[#0f2038]/95 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition-transform active:scale-95 md:hidden"
      >
        <span className="text-sm leading-none">☰</span>
        <span>Explorar campus ({listed.length})</span>
      </button>

      {/* ---------- Drawer / Menú interactivo de consultas en celular ---------- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60 backdrop-blur-sm md:hidden">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex max-h-[82vh] w-full flex-col rounded-t-2xl border-t border-white/15 bg-[#0d1b2e] shadow-2xl">
            {/* Cabecera del drawer */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">Explorar campus Javeriana</span>
                <span className="rounded-full bg-orange-500/20 px-2 py-0.5 font-mono text-[10px] text-orange-300">
                  {listed.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Buscador en móvil */}
            <div className="px-3 pt-2.5">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar edificio, facultad, categoría…"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs outline-none placeholder:text-slate-500 focus:border-orange-400/60"
              />
            </div>

            {/* Categorías en móvil */}
            <div className="flex gap-1 overflow-x-auto px-3 py-2 text-[10px]">
              <button
                type="button"
                onClick={() => setSelectedCategory("todos")}
                className={`shrink-0 rounded-full px-2.5 py-1 transition-colors ${
                  selectedCategory === "todos"
                    ? "bg-white/20 font-bold text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                Todos
              </button>
              {Object.entries(CATEGORY_STYLES).map(([catKey, cat]) => (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
                    selectedCategory === catKey
                      ? "font-bold text-white shadow-sm"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                  }`}
                  style={selectedCategory === catKey ? { backgroundColor: cat.color } : {}}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Lista de edificios en móvil */}
            <div className="flex-1 overflow-y-auto px-3 py-1">
              {listed.map((p) => {
                const active = p.building.id === selectedId;
                const cat = p.building.category ? CATEGORY_STYLES[p.building.category] : null;

                return (
                  <button
                    key={p.building.id}
                    type="button"
                    onClick={() => {
                      select(p.building.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={[
                      "mb-1.5 block w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                      active
                        ? "border-orange-400 bg-white/15 text-white"
                        : "border-transparent bg-white/5 text-slate-200 active:bg-white/10",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="font-medium">
                        {p.building.name ?? <span className="text-slate-400">Sin nombre en OSM</span>}
                      </span>
                      {cat && (
                        <span
                          className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium"
                          style={{
                            backgroundColor: `${cat.color}25`,
                            color: cat.color,
                          }}
                        >
                          {cat.emoji} {cat.label}
                        </span>
                      )}
                    </div>
                    <span className="mt-1 block font-mono text-[9.5px] text-slate-400">
                      {p.building.kind} · {p.building.height} m
                      {p.building.levels ? ` · ${p.building.levels} niveles` : ""}
                    </span>
                  </button>
                );
              })}
              {listed.length === 0 && (
                <p className="px-4 py-8 text-center text-xs text-slate-400">Sin coincidencias.</p>
              )}
            </div>

            {/* Capas y controles en móvil */}
            <div className="grid grid-cols-2 gap-1.5 border-t border-white/10 p-3 text-[10.5px]">
              <Toggle label="Etiquetas" on={showLabels} onClick={() => setShowLabels((v) => !v)} />
              <Toggle label="Sin nombre" on={includeUnnamed} onClick={() => setIncludeUnnamed((v) => !v)} />
              <Toggle label="Arbolado" on={showTrees} onClick={() => setShowTrees((v) => !v)} />
              <Toggle label="Accesos" on={showAccesses} onClick={() => setShowAccesses((v) => !v)} />
              <Toggle label="Servicios" on={showServices} onClick={() => setShowServices((v) => !v)} />
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setFocus({ id: `reset:${Date.now()}`, position: [0, 0, 0], extent: radius });
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center rounded-md border border-white/15 bg-white/5 px-2 py-1.5 font-mono text-[10px] hover:bg-white/10"
              >
                Centrar campus ↺
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Lista lateral de escritorio ---------- */}
      <aside className="absolute bottom-8 left-0 top-24 hidden md:flex w-72 flex-col border-r border-white/10 bg-[#0f2038]/85 backdrop-blur-md z-10">
        <div className="border-b border-white/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
          Edificios · {listed.length}
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar edificio, categoría…"
          className="mx-3.5 mt-2.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs outline-none placeholder:text-slate-500 focus:border-orange-400/60"
        />

        {/* Filtros por categoría */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 text-[10px]">
          <button
            type="button"
            onClick={() => setSelectedCategory("todos")}
            className={`shrink-0 rounded-full px-2 py-0.5 transition-colors ${
              selectedCategory === "todos"
                ? "bg-white/20 font-bold text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
            }`}
          >
            Todos
          </button>
          {Object.entries(CATEGORY_STYLES).map(([catKey, cat]) => (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategory(catKey)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 transition-colors ${
                selectedCategory === catKey
                  ? "font-bold text-white shadow-sm"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              }`}
              style={selectedCategory === catKey ? { backgroundColor: cat.color } : {}}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-1 flex-1 overflow-y-auto py-1">
          {listed.map((p) => {
            const active = p.building.id === selectedId;
            const cat = p.building.category ? CATEGORY_STYLES[p.building.category] : null;

            return (
              <button
                key={p.building.id}
                type="button"
                onClick={() => select(p.building.id)}
                onMouseEnter={() => setHoveredId(p.building.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={[
                  "block w-full border-l-2 px-4 py-1.5 text-left text-xs leading-snug transition-colors",
                  active
                    ? "border-orange-400 bg-white/10 text-white"
                    : "border-transparent text-slate-200 hover:bg-white/5",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="truncate font-medium">
                    {p.building.name ?? <span className="text-slate-400">Sin nombre en OSM</span>}
                  </span>
                  {cat && (
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium"
                      style={{
                        backgroundColor: `${cat.color}25`,
                        color: cat.color,
                      }}
                    >
                      {cat.emoji} {cat.label}
                    </span>
                  )}
                </div>
                <span className="mt-0.5 block font-mono text-[9.5px] text-slate-400">
                  {p.building.kind} · {p.building.height} m
                  {p.building.levels ? ` · ${p.building.levels} niveles` : ""}
                </span>
              </button>
            );
          })}
          {listed.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-slate-400">Sin coincidencias.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 border-t border-white/10 p-3">
          <Toggle
            label="Etiquetas"
            on={showLabels}
            onClick={() => setShowLabels((v) => !v)}
          />
          <Toggle
            label="Incluir sin nombre"
            on={includeUnnamed}
            onClick={() => setIncludeUnnamed((v) => !v)}
          />
          <Toggle
            label={`Arbolado · ${terrain.meta.treeCount}`}
            on={showTrees}
            onClick={() => setShowTrees((v) => !v)}
          />
          <Toggle
            label={`Accesos · ${places.meta.accessCount}`}
            on={showAccesses}
            onClick={() => setShowAccesses((v) => !v)}
          />
          <Toggle
            label={`Servicios · ${places.meta.serviceCount}`}
            on={showServices}
            onClick={() => setShowServices((v) => !v)}
          />
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setFocus({ id: `reset:${Date.now()}`, position: [0, 0, 0], extent: radius });
            }}
            className="rounded-md border border-white/15 bg-white/5 px-2.5 py-2 text-left font-mono text-[10.5px] hover:bg-white/10"
          >
            Centrar campus ↺
          </button>
        </div>
      </aside>

      {/* ---------- Ficha del edificio (adaptada para móvil y escritorio) ---------- */}
      {selected && (
        <section className="fixed inset-x-3 bottom-14 z-30 max-h-[62vh] overflow-y-auto rounded-xl border border-white/15 bg-[#0f2038]/95 p-4 shadow-2xl backdrop-blur-md sm:absolute sm:bottom-12 sm:right-4 sm:inset-x-auto sm:w-84 sm:max-h-[75vh]">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="absolute right-3 top-2.5 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <div className="mb-2 pr-6">
            {selected.building.category && CATEGORY_STYLES[selected.building.category] && (
              <span
                className="mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${CATEGORY_STYLES[selected.building.category].color}25`,
                  color: CATEGORY_STYLES[selected.building.category].color,
                  border: `1px solid ${CATEGORY_STYLES[selected.building.category].color}40`,
                }}
              >
                {CATEGORY_STYLES[selected.building.category].emoji} {CATEGORY_STYLES[selected.building.category].label}
              </span>
            )}
            <h2 className="text-base font-bold leading-tight text-white">
              {selected.building.name ?? "Edificio sin nombre en OSM"}
            </h2>
          </div>

          {/* DESCRIPCIÓN ENRIQUECIDA: ÚNICAMENTE PARA EDIFICIOS DE LA JAVERIANA */}
          {selected.building.category === "universidad" && (() => {
            const javInfo = getJaverianaBuildingInfo(selected.building.id, selected.building.name);
            return (
              <div className="my-2.5 rounded-lg border border-amber-400/25 bg-amber-500/10 p-2.5 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <span>🏛️</span>
                  <span>Pontificia Universidad Javeriana</span>
                  {javInfo?.buildingNumber && (
                    <span className="ml-auto rounded bg-amber-400/20 px-1.5 py-0.5 font-mono text-[9px] text-amber-200">
                      Ed. {javInfo.buildingNumber}
                    </span>
                  )}
                </div>

                {javInfo ? (
                  <>
                    {javInfo.faculty && (
                      <p className="mt-1 text-[11px] font-medium text-amber-200">
                        {javInfo.faculty}
                      </p>
                    )}
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-200">
                      {javInfo.description}
                    </p>
                    {javInfo.highlights && javInfo.highlights.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {javInfo.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[9px] text-amber-300/90"
                          >
                            • {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                    Instalación del campus central de la Pontificia Universidad Javeriana.
                  </p>
                )}
              </div>
            );
          })()}

          {/* Ficha técnica del volumen */}
          <div className="space-y-0.5">
            <Row label="Tipo (OSM)" value={selected.building.kind} />
            {/* Los pisos que se ven en la fachada no siempre son dato de OSM: solo 68 de
                276 volúmenes traen `building:levels`. Cuando se deducen de la altura hay
                que decirlo, o la ficha estaría afirmando algo que OSM no dice. */}
            <Row
              label="Niveles"
              value={
                selected.building.levels != null ? (
                  selected.building.levels.toString()
                ) : selected.geometry.floors.levels > 0 ? (
                  <span className="text-slate-300">
                    ~{selected.geometry.floors.levels}{" "}
                    <span className="text-[9px] text-slate-500">estimado</span>
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <Row label="Altura" value={`${selected.building.height} m`} />
            {selected.building.minHeight > 0 && (
              <Row label="Arranca a" value={`${selected.building.minHeight} m`} />
            )}
            <Row label="Material" value={selected.building.material ?? "—"} />
            <Row
              label="Color"
              value={
                selected.building.colour ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-3 w-3 rounded-sm border border-white/25"
                      style={{ background: selected.building.colour }}
                    />
                    {selected.building.colour}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="Tejado"
              value={
                selected.building.roofShape
                  ? `${selected.building.roofShape}${selected.building.roofHeight ? ` · ${selected.building.roofHeight} m` : ""}`
                  : "plano"
              }
            />
          </div>

          <a
            href={`https://www.openstreetmap.org/${selected.building.id}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 block border-t border-white/10 pt-2 font-mono text-[10px] text-slate-400 hover:text-orange-400"
          >
            {selected.building.id} · ver en OSM ↗
          </a>
        </section>
      )}

      <footer className="absolute inset-x-0 bottom-0 bg-[#0d1b2e]/85 py-1 text-center font-mono text-[9.5px] text-slate-400">
        Datos ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-dotted"
        >
          OpenStreetMap contributors
        </a>{" "}
        (ODbL) · instantánea del {new Date(data.meta.fetchedAt).toLocaleDateString("es-CO")}
      </footer>
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-md border border-white/15 bg-white/5 px-2.5 py-2 font-mono text-[10.5px] hover:bg-white/10"
    >
      {label}
      <span className={on ? "text-orange-400" : "text-slate-500"}>{on ? "ON" : "OFF"}</span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-white/10 py-1.5 font-mono text-[10.5px] text-slate-400">
      <span>{label}</span>
      <span className="text-right font-sans text-slate-100">{value}</span>
    </div>
  );
}
