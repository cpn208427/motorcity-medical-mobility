import { describe, expect, it } from "vitest";
import { differenceInMinutes, format } from "date-fns";
import { createSampleTransitLegs, createTransitPlan, formatTripTime, summarizeTransitLegs, timeTransitLegs } from "@/lib/transit-plan";

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
  it("includes transfer waiting in the total journey and fallback timing", () => {
    const legs = createSampleTransitLegs(46);
    const summary = summarizeTransitLegs(legs);
    expect(summary.waitMinutes).toBe(10);
    expect(summary.totalMinutes).toBe(65);
    const plan = createTransitPlan("2026-10-28", "10:00", summary.totalMinutes);
    if (!plan) throw new Error("Expected valid plan");
    expect(format(plan.primaryDeparture, "HH:mm")).toBe("08:20");
    expect(format(plan.backupDeparture, "HH:mm")).toBe("08:35");
    const timed = timeTransitLegs(plan.backupDeparture, legs);
    const wait = timed.find((leg) => leg.kind === "wait");
    if (!wait) throw new Error("Expected transfer wait");
    expect(differenceInMinutes(wait.end, wait.start)).toBe(10);
    expect(timed.at(-1)?.end.getTime()).toBe(plan.backupArrival.getTime());
    expect(differenceInMinutes(plan.appointment, plan.backupArrival)).toBe(20);
  });
  it("includes every walk through arrival at the hospital entrance", () => {
    const legs = createSampleTransitLegs(46);
    expect(legs.filter((leg) => leg.kind === "walk").map((leg) => leg.minutes)).toEqual([3, 2, 4]);
    const summary = summarizeTransitLegs(legs);
    expect(summary.walkMinutes).toBe(9);
    const plan = createTransitPlan("2026-10-28", "10:00", summary.totalMinutes);
    if (!plan) throw new Error("Expected valid plan");
    const timed = timeTransitLegs(plan.primaryDeparture, legs);
    expect(timed.at(-1)?.kind).toBe("walk");
    expect(timed.at(-1)?.end.getTime()).toBe(plan.primaryArrival.getTime());
    expect(differenceInMinutes(plan.appointment, plan.primaryArrival)).toBe(35);
  });
});