import { format, isValid, parseISO, subMinutes } from "date-fns";

export const ARRIVAL_BUFFER_MINUTES = 20;
export const DEMO_BUS_HEADWAY_MINUTES = 15;

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