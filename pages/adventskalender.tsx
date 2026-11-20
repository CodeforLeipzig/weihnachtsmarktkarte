import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Head } from "@components/Head";
import { getMapData } from "@lib/loadMapData";

export async function getStaticProps() {
  const mapData = getMapData();
  // Nur relevante Felder für den Adventskalender mitgeben
  const markets = (mapData.props.markets as any[]).map((m) => ({
    id: Number(m.id),
    name: m.name,
    shortname: m.shortname,
    bezirk: m.bezirk,
    strasse: m.strasse,
    plz_ort: m.plz_ort,
    image: m.image || null,
    von: m.von,
    bis: m.bis,
  }));
  return { props: { markets } };
}

// Deterministischer Shuffle (Seed = String), damit die Zuordnung
// bei jedem Build gleich bleibt
function seededShuffle<T>(arr: T[], seed: string): T[] {
  const result = [...arr];
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  for (let i = result.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    const j = (h >>> 0) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface MarketEntry {
  id: number;
  name: string;
  shortname: string;
  bezirk: string;
  strasse: string;
  plz_ort: string;
  image: string | null;
  von: string;
  bis: string;
}

interface Door {
  day: number;
  market: MarketEntry | null;
}

const AdventskalenderPage: NextPage<{ markets: MarketEntry[] }> = ({ markets }) => {
  // 24 Türchen, jedem wird ein Markt zugeordnet
  // Märkte deterministisch mischen und auf 24 Tage verteilen
  const doors: Door[] = useMemo(() => {
    const shuffled = seededShuffle(markets, "adventskalender-2025");
    const d: Door[] = [];
    for (let day = 1; day <= 24; day++) {
      d.push({ day, market: shuffled[(day - 1) % shuffled.length] ?? null });
    }
    return d;
  }, [markets]);

  const [opened, setOpened] = useState<number[]>([]);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setToday(new Date());
    // Geöffnete Türchen aus localStorage laden
    try {
      const saved = window.localStorage.getItem("adventskalender-opened");
      if (saved) setOpened(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const currentDay = today && today.getMonth() === 11 ? today.getDate() : null;

  function toggleDoor(day: number) {
    if (!today) return;
    // Nur Türchen bis einschließlich heute öffnen
    const isDecember = today.getMonth() === 11;
    const maxDay = isDecember ? today.getDate() : 24;
    if (day > maxDay) return; // zukünftige Türchen gesperrt

    setOpened((prev) => {
      const next = prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day];
      try {
        window.localStorage.setItem(
          "adventskalender-opened",
          JSON.stringify(next)
        );
      } catch {
        // ignore
      }
      return next;
    });
  }

  function resetCalendar() {
    setOpened([]);
    try {
      window.localStorage.removeItem("adventskalender-opened");
    } catch {
      // ignore
    }
  }

  const openedCount = opened.length;

  return (
    <>
      <Head
        pageTitle="Adventskalender – Leipziger Weihnachtsmarkt-Finder"
        description="24 Türchen, 24 Weihnachtsmärkte in Leipzig – öffne jeden Tag im Advent ein neues Türchen und entdecke einen Weihnachtsmarkt."
        keywords={[
          "Leipzig",
          "Adventskalender",
          "Weihnachtsmärkte",
          "Weihnachtsmarkt",
          "Advent",
        ]}
      />
      <div className="min-h-screen bg-darkblue text-white">
        {/* Header */}
        <header className="px-6 py-8 max-w-5xl mx-auto">
          <Link
            href="/"
            className="text-gold hover:text-secondary text-sm underline"
          >
            ← Zurück zur Karte
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gold mt-4 font-clanbold">
            🎄 Adventskalender
          </h1>
          <p className="mt-3 text-gray-lightgray text-lg max-w-2xl">
            24 Türchen, 24 Weihnachtsmärkte in und um Leipzig. Öffne jeden Tag
            ein neues Türchen und entdecke, welcher Markt dahinter steckt.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {openedCount > 0
              ? `${openedCount} von 24 Türchen geöffnet`
              : "Noch kein Türchen geöffnet"}
            {currentDay !== null && currentDay <= 24 && (
              <> · Heute ist der {currentDay}. Dezember – Türchen bis {currentDay} verfügbar</>
            )}
            {openedCount > 0 && (
              <button
                onClick={resetCalendar}
                className="ml-3 text-gold underline hover:text-secondary text-sm"
              >
                zurücksetzen
              </button>
            )}
          </p>
        </header>

        {/* Kalender-Grid */}
        <main className="px-6 pb-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {doors.map((door) => {
              const isOpen = opened.includes(door.day);
              const isLocked =
                today !== null &&
                (today.getMonth() !== 11 || door.day > today.getDate());
              const isToday =
                today !== null &&
                today.getMonth() === 11 &&
                today.getDate() === door.day;

              return (
                <button
                  key={door.day}
                  onClick={() => toggleDoor(door.day)}
                  disabled={isLocked}
                  className={[
                    "relative aspect-square rounded-xl border-2 p-3 text-left transition-all duration-200 flex flex-col justify-between",
                    isOpen
                      ? "bg-gold text-darkblue border-gold"
                      : "bg-[#0e2133] text-gold border-gold/40 hover:border-gold hover:bg-[#12293f]",
                    isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    isToday && !isOpen ? "ring-2 ring-secondary animate-pulse" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-2xl md:text-3xl font-bold font-clanbold",
                      isOpen ? "text-darkblue" : "text-gold",
                    ].join(" ")}
                  >
                    {door.day}
                  </span>

                  {isOpen && door.market ? (
                    <span className="text-xs md:text-sm font-bold leading-tight line-clamp-3">
                      {door.market.shortname || door.market.name}
                    </span>
                  ) : (
                    <span className="text-2xl self-end">
                      {isLocked ? "🔒" : "🎁"}
                    </span>
                  )}

                  {isToday && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-darkblue text-[10px] font-bold px-2 py-0.5 rounded-full">
                      HEUTE
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail-Anzeige des zuletzt geöffneten Türchens */}
          {opened.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gold font-clanbold mb-4">
                Geöffnete Türchen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...opened]
                  .sort((a, b) => b - a)
                  .map((day) => {
                    const door = doors.find((d) => d.day === day);
                    if (!door || !door.market) return null;
                    const m = door.market;
                    return (
                      <Link
                        key={day}
                        href={`/?id=${m.id}`}
                        className="block bg-[#0e2133] border border-gold/30 rounded-xl p-4 hover:border-gold hover:bg-[#12293f] transition-colors no-underline"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl font-bold text-gold font-clanbold shrink-0 w-10">
                            {day}
                          </span>
                          <div>
                            <h3 className="font-bold text-gold text-lg leading-tight">
                              {m.name}
                            </h3>
                            <p className="text-sm text-gray-lightgray mt-1">
                              📍 {m.strasse}, {m.plz_ort}
                              {m.bezirk && <> · {m.bezirk}</>}
                            </p>
                            <p className="text-xs text-secondary mt-2 underline">
                              Auf der Karte ansehen →
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-6 border-t border-gold/20 max-w-5xl mx-auto text-sm text-gray-400">
          <Link href="/" className="text-gold underline hover:text-secondary">
            weihnachtsmaerkte.codeforleipzig.de
          </Link>{" "}
          – Alle Weihnachtsmärkte in Leipzig auf einen Blick.
        </footer>
      </div>
    </>
  );
};

export default AdventskalenderPage;
