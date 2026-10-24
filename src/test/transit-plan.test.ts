import { describe, expect, it } from "vitest";
import { differenceInMinutes, format } from "date-fns";
import { createTransitPlan, formatTripTime } from "@/lib/transit-plan";

describe("Medical transit arrival rules", () => {
  it("plans primary arrival at least 20 minutes before the appointment", () => {
    const plan = createTransitPlan("2026-10-28", "10:00", 46);
    if (!plan) throw new Error("Expected valid plan");
    expect(format(plan.primaryDeparture, "HH:mm")).toBe("08:39");
    expect(differenceInMinutes(plan.appointment, plan.primaryArrival)).toBe(35);
  });
  it("keeps the next bus 20 minutes early after missing the first option", () => {
    const plan = createTransitPlan("2026-10-28", "10:00", 46);
    if (!plan) throw new Error("Expected valid plan");
    expect(format(plan.backupDeparture, "HH:mm")).toBe("08:54");
    expect(differenceInMinutes(plan.backupDeparture, plan.primaryDeparture)).toBe(15);
    expect(differenceInMinutes(plan.backupArrival, plan.backupDeparture)).toBe(46);
    expect(differenceInMinutes(plan.appointment, plan.backupArrival)).toBe(20);
  });
  it("keeps the correct departure date when leaving the previous day", () => {
    const plan = createTransitPlan("2026-10-28", "00:30", 46);
    if (!plan) throw new Error("Expected valid plan");
    expect(format(plan.primaryDeparture, "yyyy-MM-dd HH:mm")).toBe("2026-10-27 23:09");
    expect(formatTripTime(plan.backupDeparture, plan.appointment)).toBe("Oct 27, 11:24 PM");
  });
  it("rejects missing appointment inputs", () => {
    expect(createTransitPlan("", "", 46)).toBeNull();
  });
});