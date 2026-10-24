import { addMinutes, format, isValid, parseISO, subMinutes } from "date-fns";

export const ARRIVAL_BUFFER_MINUTES = 20;
export const DEMO_BUS_HEADWAY_MINUTES = 15;

export type TransitLeg = {
  kind: "walk" | "ride" | "wait";
  label: string;
  minutes: number;
};

// Demonstration durations only: no agency schedules or route coverage are verified.
export function createSampleTransitLegs(rideMinutes: number): TransitLeg[] {
  const firstRide = Math.round(rideMinutes * 0.6);
  return [
    { kind: "walk", label: "Walk to the first bus stop", minutes: 3 },
    { kind: "ride", label: "First bus ride", minutes: firstRide },
    { kind: "walk", label: "Walk to the connecting bus stop", minutes: 2 },
    { kind: "wait", label: "Wait for the connecting bus", minutes: 10 },
    { kind: "ride", label: "Connecting bus ride", minutes: rideMinutes - firstRide },
    { kind: "walk", label: "Walk from the final stop to the hospital entrance", minutes: 4 },
  ];
}

export function summarizeTransitLegs(legs: TransitLeg[]) {
  return {
    totalMinutes: legs.reduce((sum, leg) => sum + leg.minutes, 0),
    walkMinutes: legs.filter((leg) => leg.kind === "walk").reduce((sum, leg) => sum + leg.minutes, 0),
    waitMinutes: legs.filter((leg) => leg.kind === "wait").reduce((sum, leg) => sum + leg.minutes, 0),
    rideMinutes: legs.filter((leg) => leg.kind === "ride").reduce((sum, leg) => sum + leg.minutes, 0),
  };
}

export function timeTransitLegs(departure: Date, legs: TransitLeg[]) {
  let start = departure;
  return legs.map((leg) => {
    const end = addMinutes(start, leg.minutes);
    const timed = { ...leg, start, end };
    start = end;
    return timed;
  });
}

export function createTransitPlan(date: string, time: string, travelMinutes: number) {
  const appointment = parseISO(`${date}T${time}:00`);
  if (!isValid(appointment) || !Number.isFinite(travelMinutes) || travelMinutes <= 0) return null;
  const backupArrival = subMinutes(appointment, ARRIVAL_BUFFER_MINUTES);
  const backupDeparture = subMinutes(backupArrival, travelMinutes);
  const primaryDeparture = subMinutes(backupDeparture, DEMO_BUS_HEADWAY_MINUTES);
  const primaryArrival = subMinutes(backupArrival, DEMO_BUS_HEADWAY_MINUTES);
  return { appointment, primaryDeparture, primaryArrival, backupDeparture, backupArrival };
}

export function formatTripTime(value: Date, appointment: Date) {
  return format(value, "yyyy-MM-dd") === format(appointment, "yyyy-MM-dd")
    ? format(value, "h:mm a")
    : format(value, "MMM d, h:mm a");
}