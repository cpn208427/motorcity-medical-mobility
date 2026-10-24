import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Activity, Bus, Accessibility, Bell, CheckCircle2, Clock, DollarSign, MapPin, Mic,
  Navigation, Send, ShieldCheck, Smartphone, Ambulance, Users, ArrowRightLeft, Bot, Footprints,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { createSampleTransitLegs, createTransitPlan, formatTripTime, summarizeTransitLegs, timeTransitLegs } from "@/lib/transit-plan";
import { LiveBusTracker } from "@/components/live-bus-tracker";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { HOSPITALS, HOSPITAL_DIRECTORY_URL } from "@/lib/hospitals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedTransit-AI — Rides to Henry Ford Health Appointments" },
      { name: "description", content: "Plan reliable DDOT, SMART, shuttle and Medicaid rides to Henry Ford Health appointments across Metro Detroit." },
      { property: "og:title", content: "MedTransit-AI — Smart Medical Transit for Metro Detroit" },
      { property: "og:description", content: "AI-assisted ride coordination for Henry Ford Health patients and care coordinators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const ORIGINS = ["Current Location", "Detroit - Midtown", "Warren", "Dearborn"] as const;
// Rough map coordinates (SVG 400x300 space)
const ORIGIN_PTS: Record<string, [number, number]> = {
  "Current Location": [250, 210], "Detroit - Midtown": [235, 195], Warren: [290, 80], Dearborn: [130, 225],
};
const MINUTES: Record<string, number> = { "Current Location": 32, "Detroit - Midtown": 18, Warren: 46, Dearborn: 38 };

type Msg = { role: "bot" | "user"; text: string };

function Index() {
  const [name, setName] = useState("Dorothy Williams");
  const [phone, setPhone] = useState("(313) 555-0142");
  const [origin, setOrigin] = useState<string>("Warren");
  const [hospital, setHospital] = useState(0);
  const [date, setDate] = useState("2026-10-28");
  const [time, setTime] = useState("10:00");
  const [wheelchair, setWheelchair] = useState(false);
  const [routes, setRoutes] = useState(false);
  const [useNextBus, setUseNextBus] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "bot", text: "Hello! I'm your MedTransit Assistant. Where and when is your upcoming appointment? I can help plan a sample trip. Current bus arrivals are available in the official live trackers; travel times and connections need confirmation." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => chatEnd.current?.scrollIntoView({ block: "nearest" }), [msgs, typing]);

  const destination = HOSPITALS[hospital] ?? HOSPITALS[0];
  const hospName = destination.name;
  const legs = createSampleTransitLegs(MINUTES[origin] ?? 30);
  const duration = summarizeTransitLegs(legs);
  const mins = duration.totalMinutes;
  const durationText = `${duration.rideMinutes} min on buses + ${duration.waitMinutes} min transfer wait + ${duration.walkMinutes} min walking`;
  const fmtTime = (t: string, offsetMin = 0) => {
    const [h = 0, m = 0] = t.split(":").map(Number);
    const total = (h * 60 + m - offsetMin + 1440) % 1440;
    const hh = Math.floor(total / 60), mm = total % 60;
    return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
  };
  const plan = createTransitPlan(date, time, mins);
  const tripTime = (value: Date | undefined) => value && plan ? formatTripTime(value, plan.appointment) : "—";
  const leaveBy = tripTime(useNextBus ? plan?.backupDeparture : plan?.primaryDeparture);
  const arrival = tripTime(useNextBus ? plan?.backupArrival : plan?.primaryArrival);
  const departure = useNextBus ? plan?.backupDeparture : plan?.primaryDeparture;
  const timedLegs = departure ? timeTransitLegs(departure, legs) : [];
  const firstBusDeparture = timedLegs.find((leg) => leg.kind === "ride")?.start;
  const backupBusDeparture = plan ? timeTransitLegs(plan.backupDeparture, legs).find((leg) => leg.kind === "ride")?.start : undefined;

  const calculate = () => {
    if (!plan) { toast.error("Enter a valid appointment date and time."); return; }
    setUseNextBus(false);
    setRoutes(true);
    toast.success("Sample routes planned", { description: "Primary and next-bus options arrive at least 20 minutes early." });
  };

  const reply = (text: string): string => {
    const t = text.toLowerCase();
    const tm = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
    if (tm) {
      let h = Number(tm[1]) % 12; if (tm[3] === "pm") h += 12;
      const nt = `${String(h).padStart(2, "0")}:${tm[2] ?? "00"}`; setTime(nt);
      const updatedPlan = createTransitPlan(date, nt, mins);
      setUseNextBus(false);
      return updatedPlan ? `Appointment at ${fmtTime(nt)}. Sample plan: leave ${formatTripTime(updatedPlan.primaryDeparture, updatedPlan.appointment)} and arrive at the hospital entrance 35 minutes early. Journey: ${durationText}. If you miss that bus, leave ${formatTripTime(updatedPlan.backupDeparture, updatedPlan.appointment)} to arrive 20 minutes early, including all walks and the transfer wait. Actual departures, coverage, and connections need confirmation.` : "Enter a valid appointment date to plan your ride.";
    }
    if (t.includes("wheelchair") || t.includes("accessib")) {
      setWheelchair(true);
      return "Noted: wheelchair accessible transit required. The HFH Volunteer Shuttle and Medicaid NEMT both offer lift-equipped vehicles. All DDOT and SMART buses on this route have ramps and kneeling floors.";
    }
    if (t.includes("remind") || t.includes("sms")) {
      return `Your sample itinerary can be previewed using the SMS button. For current bus arrivals, use the official DDOT or SMART live tracker. No reminder has been scheduled.`;
    }
    return `Sample trip from ${origin} to ${hospName}, ${destination.address}: about ${mins} minutes (${durationText}), leave by ${leaveBy}, arrive at the entrance ${arrival}. The next-bus option preserves a 20-minute early arrival, assuming a 15-minute service interval. Confirm actual bus coverage, walking access, and transfer times before traveling.`;
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput(""); setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "bot", text: reply(text) }]);
      setTyping(false); setRoutes(true);
    }, 700);
  };

  const startVoice = () => {
    const W = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input isn't supported in this browser. Please type instead."); return; }
    const r = new SR(); r.lang = "en-US";
    r.onresult = (e: any) => send(e.results[0][0].transcript);
    r.start(); toast("Listening… speak now");
  };

  const o = ORIGIN_PTS[origin] ?? [250, 210], d = [215, 175];
  const mid: [number, number] = [(o[0] + d[0]) / 2 + 25, (o[1] + d[1]) / 2 - 20];
  const smsText = `MedTransit-AI SAMPLE: Hi ${name.split(" ")[0]}, appointment at ${hospName}, ${destination.address} on ${date}, ${fmtTime(time)}. Leave home by ${leaveBy}; first bus ${tripTime(firstBusDeparture)}; arrival at hospital entrance ${arrival} (${useNextBus ? 20 : 35} min early). Total ${mins} min: ${durationText}. ${useNextBus ? "Next-bus option selected. If this bus is also missed, contact your coordinator." : `Miss the first bus? Leave home ${tripTime(plan?.backupDeparture)}, next bus ${tripTime(backupBusDeparture)}, arrival ${tripTime(plan?.backupArrival)} (20 min early).`} Bus coverage, walking and transfer times are illustrative, not live-confirmed. Fare $2.00.`;

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-accent">
              <Activity className="h-7 w-7 animate-pulse" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MedTransit-AI</h1>
              <p className="text-sm opacity-80">Smart Transit &amp; Ride Coordination for Henry Ford Health Patients</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-sm font-semibold" role="status">
            <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" /><span className="relative h-3 w-3 rounded-full bg-success" /></span>
            Sample schedules · live departures unverified
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-2">
        {/* LEFT */}
        <section aria-labelledby="planner" className="space-y-6">
          <h2 id="planner" className="text-xl font-bold">Smart Transit Planner &amp; AI Assistant</h2>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Patient name"><input className={inp} value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Phone number"><input className={inp} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            </div>
            <fieldset className="mt-4">
              <legend className="mb-2 font-semibold">Departure location</legend>
              <div className="flex flex-wrap gap-2">
                {ORIGINS.map((x) => (
                  <button key={x} type="button" aria-pressed={origin === x} onClick={() => setOrigin(x)}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 font-semibold transition ${origin === x ? "border-accent bg-accent text-accent-foreground" : "border-input bg-card hover:border-accent"}`}>
                    {x === "Current Location" ? <Navigation className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}{x}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 space-y-2">
              <label id="hospital-label" className="block font-semibold">Destination hospital</label>
              <Select value={String(hospital)} onValueChange={(value) => { setHospital(Number(value)); setUseNextBus(false); }}>
                <SelectTrigger aria-labelledby="hospital-label" className="h-auto min-h-20 whitespace-normal border-2 bg-card px-3 py-3 text-left text-base [&>span]:line-clamp-none">
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block font-semibold">{destination.name}</span>
                    <span className="block text-sm text-muted-foreground">{destination.address}</span>
                  </span>
                </SelectTrigger>
                <SelectContent className="max-h-96 w-[var(--radix-select-trigger-width)]">
                  {HOSPITALS.map((h, i) => <SelectItem key={h.name} value={String(i)} className="py-3 text-base">
                    <span className="block whitespace-normal font-semibold">{h.name}</span>
                    <span className="block whitespace-normal text-sm">{h.address}</span>
                  </SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">12 hospitals in the <a className="underline underline-offset-2" href={HOSPITAL_DIRECTORY_URL} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Henry Ford Health directory</a>. Bus coverage and travel times to each destination need confirmation.</p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Appointment date"><input className={inp} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
              <Field label="Appointment time"><input className={inp} type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
            </div>
            <label className="mt-4 flex items-center gap-3 font-semibold">
              <input type="checkbox" className="h-5 w-5 accent-[var(--accent)]" checked={wheelchair} onChange={(e) => setWheelchair(e.target.checked)} />
              Wheelchair accessible vehicle needed
            </label>
            <button onClick={calculate} className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent text-lg font-bold text-accent-foreground shadow-md transition hover:brightness-110 focus-visible:outline-4 focus-visible:outline-ring">
              <Bus className="h-5 w-5" /> Calculate Best Transit Route
            </button>
          </div>

          <div className="flex flex-col rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b px-5 py-4">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></div>
              <div><h3 className="font-bold">MedTransit Assistant</h3><p className="text-sm text-muted-foreground">Type or speak naturally</p></div>
            </div>
            <div className="h-72 space-y-3 overflow-y-auto p-5" aria-live="polite">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
                  <p className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{m.text}</p>
                </div>
              ))}
              {typing && <p className="text-muted-foreground">Assistant is checking routes…</p>}
              <div ref={chatEnd} />
            </div>
            <div className="flex flex-wrap gap-2 px-5 pb-3">
              {["I have a 10 AM cardiology appointment", "I need wheelchair accessible transit", "Remind me via SMS 2 hours before"].map((p) => (
                <button key={p} onClick={() => send(p)} className="rounded-full border border-accent/40 bg-secondary px-3 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-foreground">{p}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t p-4">
              <label htmlFor="chat" className="sr-only">Message</label>
              <input id="chat" className={inp + " flex-1"} placeholder="e.g. I need a ride Tuesday at 2 PM" value={input} onChange={(e) => setInput(e.target.value)} />
              <button type="button" onClick={startVoice} aria-label="Speak" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-input hover:border-accent"><Mic className="h-5 w-5" /></button>
              <button type="submit" aria-label="Send" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Send className="h-5 w-5" /></button>
            </form>
          </div>
        </section>

        {/* RIGHT */}
        <section aria-labelledby="output" className="space-y-6">
          <h2 id="output" className="text-xl font-bold">Routes &amp; Ride Coordination</h2>
          <LiveBusTracker />
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="h-72 w-full bg-secondary" role="img" aria-label={`Map from ${origin} to ${hospName}`}>
              <path d="M330 300 C 320 250, 340 200, 400 170 L400 300 Z" className="fill-accent/25" />
              {[60, 120, 180, 240].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} className="stroke-border" strokeWidth="1.5" />)}
              {[80, 160, 240, 320].map((x) => <line key={x} y1="0" y2="300" x1={x} x2={x} className="stroke-border" strokeWidth="1.5" />)}
              <line x1="230" y1="300" x2="300" y2="0" className="stroke-input" strokeWidth="4" />
              <line x1="0" y1="230" x2="400" y2="160" className="stroke-input" strokeWidth="4" />
              <text x="335" y="270" className="fill-muted-foreground text-[10px]">Detroit River</text>
              {routes && <path d={`M${o[0]} ${o[1]} Q ${mid[0]} ${mid[1]} ${d[0]} ${d[1]}`} fill="none" className="stroke-accent" strokeWidth="5" strokeDasharray="10 6" strokeLinecap="round" />}
              <circle cx={o[0]} cy={o[1]} r="9" className="fill-primary stroke-card" strokeWidth="3" />
              <text x={o[0] + 12} y={o[1] + 4} className="fill-foreground text-[11px] font-bold">{origin}</text>
              <circle cx={d[0]} cy={d[1]} r="9" className="fill-destructive stroke-card" strokeWidth="3" />
              <text x={d[0] - 8} y={d[1] - 14} className="fill-foreground text-[11px] font-bold">✚ {hospName.replace("Henry Ford ", "HF ").slice(0, 26)}</text>
            </svg>
            <div className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="font-semibold">{routes ? `≈ ${mins} min · Leave by ${leaveBy} · Arrive ${arrival}` : "Calculate a route to see it on the map"}</span>
              <span className="shrink-0 text-muted-foreground">Illustrative map</span>
            </div>
          </div>

          {!routes ? (
            <div className="rounded-2xl border-2 border-dashed bg-card p-8 text-center text-muted-foreground">
              Press <strong className="text-foreground">Calculate Best Transit Route</strong> or chat with the assistant to see ride options.
            </div>
          ) : (
            <div className="space-y-4">
              <RouteCard icon={<Bus />} tag="Sample public transit · coverage unverified" title="Option A · Two-bus journey" best>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat icon={<Clock />} label="Travel" value={`${mins} min`} />
                  <Stat icon={<ArrowRightLeft />} label="Transfers" value="1" />
                  <Stat icon={<DollarSign />} label="Cost" value="$2.00" />
                  <Stat icon={<Clock />} label="Wait" value={`${duration.waitMinutes} min`} />
                </div>
                <p className="mt-3 flex items-start gap-2 text-sm font-semibold"><Footprints className="h-5 w-5 shrink-0" />{durationText} · Total {mins} min</p>
                <ol className="mt-4 space-y-2 border-l-2 border-accent pl-4">
                  {timedLegs.map((leg, index) => <li key={index}>
                    <strong>{tripTime(leg.start)} – {tripTime(leg.end)}</strong> — {leg.label} · {leg.minutes} min
                  </li>)}
                  <li><strong>Arrive at entrance {arrival}</strong> — {hospName}, {useNextBus ? 20 : 35} min early</li>
                </ol>
                <div className="mt-4 space-y-3 border-t pt-4">
                  <h4 className="font-bold">{useNextBus ? "Next bus selected" : "Missed the first bus?"}</h4>
                  <p>Leave home <strong>{tripTime(plan?.backupDeparture)}</strong> · Next bus <strong>{tripTime(backupBusDeparture)}</strong> · Entrance arrival <strong>{tripTime(plan?.backupArrival)}</strong> · 20 min before your appointment.</p>
                  <p className="text-sm text-muted-foreground">Sample 15-minute bus interval; both options include {duration.waitMinutes} min transfer waiting and {duration.walkMinutes} min walking. Routes, transfer waits, and walking access are not verified for this destination. Confirm with the agency; a further missed bus or delay requires coordinator help.</p>
                  <Button variant="outline" className="min-h-12 h-auto whitespace-normal" disabled={!plan} onClick={() => setUseNextBus((value) => !value)}>
                    <ArrowRightLeft /> {useNextBus ? "Return to first bus" : "I missed the first bus — use next bus"}
                  </Button>
                </div>
              </RouteCard>
              <RouteCard icon={<Users />} tag="Free Healthcare Shuttle" title="Option B · HFH Community Volunteer Shuttle">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold">Sample pickup window: {fmtTime(time, mins + 40)} – {fmtTime(time, mins + 20)} · Arrive at least 20 min early</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-semibold"><Accessibility className="h-4 w-4" /> Wheelchair accessible</span>
                  <span className="rounded-full bg-success/15 px-3 py-1 text-sm font-semibold text-success">Free</span>
                </div>
                <button onClick={() => toast.success("Seat reserved", { description: `Shuttle pickup for ${name}` })} className={btn + " mt-4 bg-primary text-primary-foreground"}>Reserve Seat</button>
              </RouteCard>
              <RouteCard icon={<Ambulance />} tag="Medicaid NEMT" title="Option C · Non-Emergency Medical Transport Rider">
                <p><CheckCircle2 className="mr-2 inline h-5 w-5 align-[-4px] text-success" />Eligibility preview: <strong>Likely eligible</strong> (Michigan Medicaid / Healthy Michigan Plan)</p>
                <p className="mt-1 text-sm text-muted-foreground">Door-to-door{wheelchair ? ", lift-equipped van" : ""}. Request arrival by {tripTime(plan?.backupArrival)} (20 min early). Book 2+ business days ahead; pickup requires provider confirmation.</p>
                <button onClick={() => toast.success("NEMT dispatch requested", { description: "Confirmation within 24 hours" })} className={btn + " mt-4 bg-accent text-accent-foreground"}>Request Dispatch</button>
              </RouteCard>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => { setSmsOpen(true); toast.success(`SMS itinerary sent to ${phone}`); }} className={btn + " min-h-14 bg-accent text-accent-foreground"}>
              <Smartphone className="h-5 w-5" /> Send SMS Reminder &amp; Itinerary to Patient
            </button>
            <button onClick={() => toast.success("Care coordinator alerted", { description: `Transit plan for ${name} shared` })} className={btn + " min-h-14 border-2 border-primary bg-card text-primary"}>
              <Bell className="h-5 w-5" /> Alert Care Coordinator of Transit Plan
            </button>
          </div>
          <section aria-labelledby="calendar-status" className="space-y-2 border-t pt-5">
            <h3 id="calendar-status" className="text-lg font-bold">Shared care-team calendar</h3>
            <p className="font-semibold text-muted-foreground">Google Calendar · Not connected</p>
            <p className="text-sm text-muted-foreground">Apple Calendar · Sync pending. Once connected, the shared Google calendar can stay up to date in Apple Calendar through a Google account with access. Native iCloud sync is not connected.</p>
            <p className="text-sm text-muted-foreground">No patient or ride details have been sent to a calendar. Shared patient details must be limited to authorized recipients.</p>
          </section>
        </section>
      </main>

      <section aria-label="Impact" className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 text-center sm:grid-cols-3">
          {[["89%", "Reduction in Transit-Related No-Shows"], ["12,400+", "Detroit Rides Coordinated"], ["$42", "Average Savings per Appointment"]].map(([v, l]) => (
            <div key={l}><p className="font-display text-4xl font-bold text-accent">{v}</p><p className="mt-1 text-lg">{l}</p></div>
          ))}
        </div>
      </section>

      <Sheet open={smsOpen} onOpenChange={setSmsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>SMS sent to {phone}</SheetTitle>
            <SheetDescription>Preview of the text message on {name}'s phone.</SheetDescription>
          </SheetHeader>
          <div className="mx-4 mt-4 rounded-[2rem] border-8 border-primary bg-secondary p-4">
            <p className="mb-3 text-center text-xs text-muted-foreground">Text Message · now</p>
            <p className="rounded-2xl rounded-bl-sm bg-card p-4 leading-relaxed shadow-sm">{smsText}</p>
            <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" /> Delivered</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

const inp = "h-12 w-full rounded-xl border-2 border-input bg-card px-3 text-base focus-visible:border-ring focus-visible:outline-none";
const btn = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-bold transition hover:brightness-110";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block font-semibold">{label}</span>{children}</label>;
}
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <div className="flex items-center gap-1 text-sm text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">{icon}{label}</div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
function RouteCard({ icon, tag, title, best, children }: { icon: React.ReactNode; tag: string; title: string; best?: boolean; children: React.ReactNode }) {
  return (
    <article className={`rounded-2xl border bg-card p-5 shadow-sm ${best ? "border-2 border-accent" : ""}`}>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-accent [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
        <div className="flex-1"><p className="text-sm font-semibold text-muted-foreground">{tag}</p><h3 className="text-lg font-bold">{title}</h3></div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-sm font-bold text-success"><CheckCircle2 className="h-4 w-4" />{best ? "Best match" : "Available"}</span>
      </div>
      {children}
    </article>
  );
}
