import React, { useEffect, useMemo, useState } from "react";

// CPTSD Daily Practice – Duolingo-style MVP
// - Offline, single-file prototype
// - Stores progress in localStorage
// - Gentle, trauma-informed: micro-lessons + practice + reflection
// NOTE: This is not a medical device and not a substitute for therapy.

const STORAGE_KEY = "cptsd_duo_mvp_v1";

const todayISO = () => new Date().toISOString().slice(0, 10);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function computeStreak(lastDoneDate, streak) {
  const t = new Date(todayISO());
  const last = lastDoneDate ? new Date(lastDoneDate) : null;
  if (!last) return { streak: 0, status: "none" };
  const diffDays = Math.round((t - last) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return { streak, status: "today" };
  if (diffDays === 1) return { streak: streak + 1, status: "continued" };
  return { streak: 0, status: "reset" };
}

const MODULES = [
  {
    id: "reg",
    title: "Telo a regulácia",
    why: "Znížiť bazálne napätie. Bez toho sa všetko rieši výkonom alebo alkoholom.",
    lessons: [
      {
        id: "reg-1",
        title: "Predĺžený výdych (2 min)",
        teach:
          "Cieľ nie je ‚relaxovať‘. Cieľ je dať nervovému systému signál bezpečia. Predĺžený výdych zvyšuje parasympatikus.",
        practice: [
          { type: "breath", label: "Dýchaj 4 sekundy nádych, 6 sekúnd výdych. 10 cyklov." },
          { type: "body", label: "Uvoľni čeľusť, ramená, brucho. Len si všimni napätie." },
        ],
        reflect: "Po cvičení: aké je napätie v tele (0–10)?" ,
      },
      {
        id: "reg-2",
        title: "Orientácia v priestore (60 s)",
        teach:
          "Hypervigilancia sa dá znížiť orientáciou: oči skenujú bezpečné prvky, mozog dostane ‚tu a teraz‘.",
        practice: [
          { type: "body", label: "Pozri sa na 5 vecí, ktoré sú príjemné/neutral. Pomenuj ich nahlas." },
          { type: "body", label: "Nájdi 3 pevné body (stolička, stôl, podlaha). Vnímaj oporu." },
        ],
        reflect: "Čo sa zmenilo v tele (0–10)?" ,
      },
      {
        id: "reg-3",
        title: "Mikro-uvoľnenie (30–90 s)",
        teach:
          "Krátke uvoľnenie je účinnejšie ako veľké plány. Pravidelnosť prepisuje systém.",
        practice: [
          { type: "body", label: "Stlač dlane na 5 sekúnd, potom uvoľni. 5 opakovaní." },
          { type: "body", label: "Zívni/prehltni. Uvoľni jazyk od podnebia." },
        ],
        reflect: "Kde býva tvoje ‚default‘ napätie najviac?" ,
      },
    ],
  },
  {
    id: "dep",
    title: "Emočná deprivácia",
    why: "Jadro: ‚nie som primárny‘. Učíš telo prijímať starostlivosť a pomenovať potreby.",
    lessons: [
      {
        id: "dep-1",
        title: "Názvoslovie potrieb (3 min)",
        teach:
          "Deprivácia často znamená, že potreby sú rozmazané. Najprv ich treba pomenovať bez hanby.",
        practice: [
          { type: "pick", label: "Vyber 1 potrebu dnes", options: ["pokoj", "blízkosť", "uznanie", "oddych", "jasnosť", "opora"] },
          { type: "text", label: "Jedna veta: ‚Dnes potrebujem…‘" },
        ],
        reflect: "Ako ťažké bolo potrebu priznať (0–10)?" ,
      },
      {
        id: "dep-2",
        title: "Mikro-žiadosť (5 min)",
        teach:
          "Korektívna skúsenosť vzniká, keď požiadam a svet sa nezrúti. Začíname mini žiadosťou.",
        practice: [
          { type: "text", label: "Napíš 1 mikro-žiadosť (napr. ‚Môžeme si dnes zavolať 10 min?‘)" },
          { type: "pick", label: "Komu by si to vedel poslať?", options: ["partner", "kamarát", "súrodenec", "kolega", "terapeut", "niekto iný"] },
        ],
        reflect: "Čo sa bojíš, že sa stane, keď požiadaš?" ,
      },
      {
        id: "dep-3",
        title: "Prijať (nie len dať)",
        teach:
          "Self-sacrifice + deprivácia: dávaš, aby si mal vzťah. Teraz trénuješ prijatie bez výkonu.",
        practice: [
          { type: "pick", label: "Vyber jednu vec, ktorú dnes príjmeš", options: ["kompliment", "pomoc", "čas", "nežnosť", "odpustenie", "nič nerobiť"] },
          { type: "text", label: "Jedna veta: ‚Ďakujem, beriem to.‘" },
        ],
        reflect: "Aké pocity pri prijímaní (hanba/úľava/odpor)?" ,
      },
    ],
  },
  {
    id: "anger",
    title: "Hnev a hranice",
    why: "Potlačený hnev sa mení na náročnosť, napätie a telo. Učíš sa hnev bezpečne cítiť a vyjadriť.",
    lessons: [
      {
        id: "ang-1",
        title: "Hnev ≠ agresia (2 min)",
        teach:
          "Hnev je informácia: ‚niečo prekročilo hranicu‘. Agresia je správanie. Cieľ je cítiť hnev bez ubližovania.",
        practice: [
          { type: "pick", label: "Kde cítiš hnev v tele?", options: ["hrudník", "krk", "žalúdok", "ruky", "čeľusť", "neviem"] },
          { type: "body", label: "Zatni päste na 3 sekundy, potom uvoľni. 10×." },
        ],
        reflect: "Čo hnev chráni? (potreba, hranica, hodnota)" ,
      },
      {
        id: "ang-2",
        title: "Jedna hranica (4 min)",
        teach:
          "Hranice sa rodia v malých vetách. Nie v hádke. Trénujeme formát.",
        practice: [
          { type: "text", label: "Doplň vetu: ‚Keď ____, potrebujem ____.‘" },
          { type: "text", label: "Alternatíva: ‚Teraz nie. Ozvem sa o ____.‘" },
        ],
        reflect: "Ako bezpečné je pre teba povedať ‚nie‘ (0–10)?" ,
      },
      {
        id: "ang-3",
        title: "Hnev bez trestu (3 min)",
        teach:
          "Keď bol hnev v detstve trestaný, telo ho drží. Dnes trénuješ, že hnev môže existovať bez bitky.",
        practice: [
          { type: "body", label: "Polož ruku na hrudník. Povedz potichu: ‚Môj hnev je dovolený.‘" },
          { type: "body", label: "Nájdi 1 bezpečný výstup: rýchla chôdza / drepy / tras rúk 30 s." },
        ],
        reflect: "Čo by si dnes spravil inak, keby hnev mohol byť bezpečný?" ,
      },
    ],
  },
  {
    id: "intim",
    title: "Intimita bez alarmu",
    why: "Intimita aktivuje abandonment + depriváciu + kontrolu. Učíš sa tolerovať blízkosť po malých dávkach.",
    lessons: [
      {
        id: "int-1",
        title: "Blízkosť po percentách (3 min)",
        teach:
          "Namiesto ‚buď blízko‘ vs ‚uteč‘ trénujeme stupnicu. 20% blízkosti je úspech.",
        practice: [
          { type: "pick", label: "Vyber dnešné percento blízkosti", options: ["10%", "20%", "30%", "40%", "50%"] },
          { type: "text", label: "Čo to konkrétne znamená? (napr. objatie 10 s, otvorená veta, dotyk ruky)" },
        ],
        reflect: "Aký bol alarm pri tej predstave (0–10)?" ,
      },
      {
        id: "int-2",
        title: "Zostať pri jednej chybe (4 min)",
        teach:
          "Perfekcionizmus vo vzťahu je ochrana. Tréning je: všimnúť si chybu a neodísť v hlave.",
        practice: [
          { type: "text", label: "Spúšťač: akú ‚malú chybu‘ dnes toleruješ bez uzáveru?" },
          { type: "text", label: "Veta pre seba: ‚Toto je nepohodlie, nie nebezpečie.‘" },
        ],
        reflect: "Čoho sa bojíš, že sa stane, ak toleruješ nedokonalosť?" ,
      },
      {
        id: "int-3",
        title: "Sex – bezpečný rámec (bez detailov) (5 min)",
        teach:
          "Keď je úzkosť vysoká, cieľ nie je ‚výkon‘. Cieľ je bezpečný rámec: dohoda, stop-signal, tempo.",
        practice: [
          { type: "pick", label: "Vyber 1 prvok bezpečia", options: ["stop slovo", "pauza kedykoľvek", "pomalé tempo", "svetlo/bez tmy", "bez alkoholu dnes iba dotyk", "aftercare"] },
          { type: "text", label: "Jedna veta, ktorú povieš partnerovi: ‚Potrebujem…, aby som sa cítil bezpečne.‘" },
        ],
        reflect: "Aký malý krok je dnes reálne možný bez preťaženia?" ,
      },
    ],
  },
  {
    id: "id",
    title: "Identita po výkone",
    why: "Keď hodnota = známky, vzniká adaptívne ja. Tu sa skladá autentické ja cez skúsenosť.",
    lessons: [
      {
        id: "id-1",
        title: "Hodnoty (3 min)",
        teach:
          "Identita nie je odpoveď v hlave. Je to opakované ‚čo si vyberám‘.",
        practice: [
          { type: "pick", label: "Vyber 1 hodnotu", options: ["pravdivosť", "tvorivosť", "láskavosť", "sloboda", "pokoj", "odvaha"] },
          { type: "text", label: "Jedna mikro-akcia dnes v tej hodnote." },
        ],
        reflect: "Ako sa cíti ‚ja‘, keď je v súlade s hodnotou?" ,
      },
      {
        id: "id-2",
        title: "Ja bez výkonu (2 min)",
        teach:
          "Nervový systém je zvyknutý zarábať si na bezpečie. Trénujeme ‚som OK aj bez výkonu‘.",
        practice: [
          { type: "body", label: "2 min nič nerob. Len sedieť. Ak príde kritika, všimni si ju." },
          { type: "text", label: "Pomenuj hlas kritika jedným slovom (napr. ‚Tréner‘, ‚Kontrolór‘)." },
        ],
        reflect: "Čoho sa bojíš, že sa stane, keď ‚nič‘?" ,
      },
      {
        id: "id-3",
        title: "Vnútorný detský hlas (4 min)",
        teach:
          "Zraniteľná časť u teba býva potlačená. Dáme jej malý, bezpečný priestor.",
        practice: [
          { type: "text", label: "Doplň: ‚Keby som sa nemusel báť, chcel by som…‘" },
          { type: "text", label: "Doplň: ‚Dnes mi pomôže, keď…‘" },
        ],
        reflect: "Aká emócia sa objavila (1 slovo)?" ,
      },
    ],
  },
  {
    id: "alc",
    title: "Alkohol – nahradiť reguláciu",
    why: "Alkohol nie je charakter. Je to nástroj regulácie. Cieľ je mať iné nástroje a znížiť potrebu.",
    lessons: [
      {
        id: "alc-1",
        title: "Mapa spúšťačov (3 min)",
        teach:
          "Najprv mapujeme, nie bojujeme. Spúšťač → napätie → alkohol → úľava → dlh. Cieľ je prerušiť skôr.",
        practice: [
          { type: "pick", label: "Dnešný spúšťač", options: ["stres", "osamelosť", "sociálna úzkosť", "sex", "konflikt", "odmena"] },
          { type: "text", label: "Aký bol signál v tele (1 veta)?" },
        ],
        reflect: "Kedy sa to začalo dnes? (čas/udalosť)" ,
      },
      {
        id: "alc-2",
        title: "Odklad 10 min (4 min)",
        teach:
          "Cieľ nie je ‚nikdy‘. Cieľ je získať 10 min priestoru, aby mozog prestal byť v tuneli.",
        practice: [
          { type: "body", label: "Keď príde chuť: nastav 10 min. Urob reg-1 dych alebo reg-2 orientáciu." },
          { type: "pick", label: "Ktorý náhradný regulátor dnes použiješ?", options: ["dych", "sprcha", "chôdza", "jedlo", "zavolať", "hudba"] },
        ],
        reflect: "Po 10 min: chuť na alkohol (0–10)?" ,
      },
      {
        id: "alc-3",
        title: "Plán bezpečia (2 min)",
        teach:
          "Ak máš veľké pitie alebo abstinenčné príznaky, rieš to s lekárom. Toto je doplnok, nie náhrada.",
        practice: [
          { type: "text", label: "Jedna veta: ‚Keď to bude veľké, urobím…‘ (osoba/miesto/podpora)" },
          { type: "text", label: "Jedna podporná aktivita na večer (konkrétne)." },
        ],
        reflect: "Ako reálne je dodržať plán (0–10)?" ,
      },
    ],
  },
];

const DAILY_PLAN = [
  { slot: "Warm-up", moduleId: "reg" },
  { slot: "Core", moduleId: "dep" },
  { slot: "Strength", moduleId: "anger" },
  { slot: "Connection", moduleId: "intim" },
  { slot: "Self", moduleId: "id" },
  { slot: "Stability", moduleId: "alc" },
];

function defaultAppState() {
  return {
    createdAt: todayISO(),
    lastDoneDate: null,
    streak: 0,
    xp: 0,
    level: 1,
    moduleXP: Object.fromEntries(MODULES.map((m) => [m.id, 0])),
    lessonDone: {},
    journal: [],
    // Phase system (B): advance after N completed days in current phase
    currentPhaseIndex: 0,
    phaseDoneDays: 0,
    phaseLastCountedDate: null,
    phaseTargetDays: 20,
    settings: {
      dailyMinutes: 15,
      intensity: "gentle", // gentle | standard
    },
  };
}

function levelFromXP(xp) {
  // simple curve
  return 1 + Math.floor(Math.sqrt(Math.max(0, xp)) / 5);
}

function pickDailyLessons(state) {
  // Strict phase-based progression according to therapeutic priorities
  // Phase 1: reg
  // Phase 2: dep
  // Phase 3: anger
  // Phase 4: intim
  // Phase 5: id
  // Alcohol (alc) always available but secondary

  const PHASES = ["reg", "dep", "anger", "intim", "id"];

  const minutes = state.settings?.dailyMinutes ?? 15;
  const targetCount = minutes <= 10 ? 3 : 4;

  const currentPhaseIndex = state.currentPhaseIndex ?? 0;
  const currentModuleId = PHASES[currentPhaseIndex] ?? PHASES[PHASES.length - 1];

  const currentModule = MODULES.find((m) => m.id === currentModuleId);
  const done = state.lessonDone || {};

  const picks = [];

  // Main focus: current phase module
  if (currentModule) {
    const nextLessons = currentModule.lessons.filter((l) => !done[l.id]);
    const lessonPool = nextLessons.length > 0 ? nextLessons : currentModule.lessons;

    for (let i = 0; i < lessonPool.length && picks.length < targetCount - 1; i++) {
      picks.push({ module: currentModule, lesson: lessonPool[i] });
    }
  }

  // Add one regulation lesson as anchor if not already in phase 1
  if (currentModuleId !== "reg") {
    const regModule = MODULES.find((m) => m.id === "reg");
    const regLesson = regModule.lessons.find((l) => !done[l.id]) || regModule.lessons[0];
    picks.push({ module: regModule, lesson: regLesson });
  }

  return picks.slice(0, targetCount);
}

function ProgressRing({ value }) {
  const v = clamp(value, 0, 1);
  const r = 18;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - v);
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
      <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" opacity="0.15" strokeWidth="4" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray={c}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform="rotate(-90 22 22)"
      />
    </svg>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs opacity-90">
      {children}
    </span>
  );
}

function Card({ children }) {
  return <div className="rounded-2xl border bg-white/60 p-4 shadow-sm backdrop-blur">{children}</div>;
}

function Button({ children, onClick, disabled, variant = "primary" }) {
  const base =
    "w-full rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-black text-white"
      : variant === "ghost"
      ? "border bg-white"
      : "border bg-white";
  return (
    <button className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Textarea({ value, onChange, placeholder }) {
  return (
    <textarea
      className="min-h-[90px] w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          className={`rounded-xl border px-3 py-2 text-sm ${value === o.value ? "bg-black text-white" : "bg-white"}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Slider({ value, onChange, min = 0, max = 10 }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="w-8 text-right text-sm tabular-nums">{value}</div>
    </div>
  );
}

function LessonRunner({ pick, onComplete, intensity }) {
  const { module, lesson } = pick;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const items = useMemo(() => {
    const teach = { kind: "teach", title: lesson.title, text: lesson.teach };
    const practice = (lesson.practice || []).map((p, idx) => ({ kind: "practice", p, idx }));
    const reflect = { kind: "reflect", text: lesson.reflect };

    let all = [teach, ...practice, reflect];
    if (intensity === "gentle") {
      // reduce to teach + 1 practice + reflect
      const firstPractice = practice[0] ? [practice[0]] : [];
      all = [teach, ...firstPractice, reflect];
    }
    return all;
  }, [lesson, intensity]);

  const current = items[step];

  const setAnswer = (k, v) => setAnswers((a) => ({ ...a, [k]: v }));

  const canNext = useMemo(() => {
    if (!current) return false;
    if (current.kind === "teach") return true;
    if (current.kind === "practice") {
      const p = current.p;
      if (p.type === "pick") return !!answers[`pick_${current.idx}`];
      if (p.type === "text") return (answers[`text_${current.idx}`] || "").trim().length > 0;
      return true;
    }
    if (current.kind === "reflect") return (answers[`reflect`] || "").toString().trim().length > 0;
    return true;
  }, [current, answers]);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs opacity-70">CPTSD Daily Practice</div>
              <div className="text-2xl font-semibold">Tvoj systémový tréning</div>
              <div className="mt-1 text-sm opacity-80">
                Mikro-kroky. Bez výkonu. Bez hanby. Konzistentne.
              </div>
              {(() => {
                const PHASES = ["reg", "dep", "anger", "intim", "id"];
                const phaseId = PHASES[state.currentPhaseIndex ?? 0] ?? "id";
                const phaseTitle = MODULES.find((m) => m.id === phaseId)?.title || "";
                const doneDays = state.phaseDoneDays ?? 0;
                const target = state.phaseTargetDays ?? 20;
                return (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Chip>Fáza: {phaseTitle}</Chip>
                    <Chip>Fázové dni: {doneDays}/{target}</Chip>
                  </div>
                );
              })()}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Chip>Level {state.level}</Chip>
                <Chip>XP {state.xp}</Chip>
                <Chip>Streak {state.streak}</Chip>
              </div>
              <div className="text-xs opacity-70">Dnes: {todayISO()}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatTile label="Denné minúty" value={`${state.settings.dailyMinutes}m`} />
            <StatTile label="Intenzita" value={state.settings.intensity === "gentle" ? "jemná" : "štandard"} />
            <StatTile label="Hotovo dnes" value={doneToday ? "áno" : "nie"} />
          </div>

          <nav className="grid grid-cols-4 gap-2">
            {[
              { id: "today", label: "Dnes" },
              { id: "modules", label: "Moduly" },
              { id: "journal", label: "Denník" },
              { id: "settings", label: "Nastavenia" },
            ].map((t) => (
              <button
                key={t.id}
                className={`rounded-xl border px-3 py-2 text-sm ${tab === t.id ? "bg-black text-white" : "bg-white"}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        {tab === "today" && (
          <div className="space-y-4">
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Dnešný plán</div>
                  <div className="mt-1 text-sm opacity-80">
                    Vybrané podľa toho, kde máš najmenej XP. Cieľ: 2–4 mikrolekcie.
                  </div>
                </div>
                <Chip>{dailyPicks.length} lekcie</Chip>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {dailyPicks.map((p, idx) => {
                  const done = !!state.lessonDone?.[p.lesson.id];
                  return (
                    <button
                      key={p.lesson.id}
                      onClick={() => setActivePickIdx(idx)}
                      className={`rounded-2xl border p-3 text-left transition ${idx === activePickIdx ? "bg-zinc-50" : "bg-white"}`}
                    >
                      <div className="text-xs opacity-70">{p.module.title}</div>
                      <div className="mt-0.5 text-sm font-medium">{p.lesson.title}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <Chip>{done ? "hotovo" : "na rade"}</Chip>
                        <span className="text-xs opacity-60">+10 XP</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {activePick ? (
              <LessonRunner pick={activePick} onComplete={completeLesson} intensity={state.settings.intensity} />
            ) : (
              <Card>
                <div className="text-sm">Žiadne lekcie dnes.</div>
              </Card>
            )}

            <Card>
              <div className="text-sm font-semibold">Rýchly check-in (30 s)</div>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-xs opacity-70">Napätie v tele</div>
                  <Slider
                    value={state.quickTension ?? 5}
                    onChange={(v) => setState((s) => ({ ...s, quickTension: v }))}
                  />
                </div>
                <div>
                  <div className="text-xs opacity-70">Úzkosť</div>
                  <Slider
                    value={state.quickAnxiety ?? 5}
                    onChange={(v) => setState((s) => ({ ...s, quickAnxiety: v }))}
                  />
                </div>
              </div>
              <div className="mt-3 text-xs opacity-70">
                Tip: ak je napätie ≥7, daj si najprv jednu lekciu z „Telo a regulácia“.
              </div>
            </Card>
          </div>
        )}

        {tab === "modules" && (
          <div className="grid gap-3">
            {MODULES.map((m) => (
              <Card key={m.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">{m.title}</div>
                    <div className="mt-1 text-sm opacity-80">{m.why}</div>
                  </div>
                  <Chip>XP {state.moduleXP?.[m.id] ?? 0}</Chip>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {m.lessons.map((l) => {
                    const done = !!state.lessonDone?.[l.id];
                    return (
                      <div key={l.id} className="rounded-2xl border bg-white p-3">
                        <div className="text-sm font-medium">{l.title}</div>
                        <div className="mt-2 flex items-center justify-between">
                          <Chip>{done ? "hotovo" : "nezačaté"}</Chip>
                          <span className="text-xs opacity-60">10 XP</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "journal" && (
          <div className="space-y-3">
            <Card>
              <div className="text-sm font-semibold">Denník</div>
              <div className="mt-1 text-sm opacity-80">
                Tu sa ukladá tvoja krátka práca. Máš to ako dôkaz konzistencie (nie výkonu).
              </div>
            </Card>

            {(state.journal || []).length === 0 ? (
              <Card>
                <div className="text-sm">Zatiaľ prázdne. Urob jednu mikrolekciu a objaví sa tu záznam.</div>
              </Card>
            ) : (
              (state.journal || []).map((j, idx) => (
                <Card key={j.ts + idx}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs opacity-70">{j.date}</div>
                      <div className="text-sm font-semibold">{j.lessonTitle}</div>
                      <div className="mt-0.5 text-xs opacity-70">
                        {MODULES.find((m) => m.id === j.moduleId)?.title}
                      </div>
                    </div>
                    <Chip>+10 XP</Chip>
                  </div>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm">Zobraziť odpovede</summary>
                    <pre className="mt-2 overflow-auto rounded-xl border bg-white p-3 text-xs leading-relaxed">
{JSON.stringify(j.answers, null, 2)}
                    </pre>
                  </details>
                </Card>
              ))
            )}
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-3">
            <Card>
              <div className="text-sm font-semibold">Nastavenia</div>
              <div className="mt-1 text-sm opacity-80">
                Udržateľnosť > intenzita. Ak sa systém preťaží, zníž minúty alebo prepni na jemnú.
              </div>
            </Card>

            <Card>
              <div className="text-sm font-medium">Denný čas</div>
              <div className="mt-2">
                <Slider
                  min={4}
                  max={15}
                  value={state.settings.dailyMinutes}
                  onChange={(v) => setState((s) => ({ ...s, settings: { ...s.settings, dailyMinutes: v } }))}
                />
                <div className="mt-1 text-xs opacity-70">Odporúčanie: 6–10 min.</div>
              </div>
            </Card>

            <Card>
              <div className="text-sm font-medium">Intenzita</div>
              <div className="mt-2">
                <Segmented
                  value={state.settings.intensity}
                  onChange={(v) => setState((s) => ({ ...s, settings: { ...s.settings, intensity: v } }))}
                  options={[
                    { value: "gentle", label: "Jemná" },
                    { value: "standard", label: "Štandard" },
                  ]}
                />
              </div>
            </Card>

            <Card>
              <div className="text-sm font-medium">Reset</div>
              <div className="mt-2 text-sm opacity-80">Ak chceš začať odznova.</div>
              <div className="mt-3">
                <Button variant="ghost" onClick={resetProgress}>
                  Vymazať progres
                </Button>
              </div>
            </Card>

            <Card>
              <div className="text-xs opacity-70">
                Bezpečnostná poznámka: Ak máš výrazné pitie a prestávky spôsobujú tras, potenie, nespavosť alebo paniku,
                je bezpečnejšie riešiť to s lekárom. Tento prototyp je tréning návykov, nie medicínska liečba.
              </div>
            </Card>
          </div>
        )}

        <footer className="pb-10 pt-2 text-center text-xs opacity-60">
          MVP prototyp • lokálne ukladanie • trauma‑informed mikro‑kroky
        </footer>
      </div>
    </div>
  );
}

export default App;
