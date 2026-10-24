import { describe, expect, it } from "vitest";
import { HOSPITALS } from "@/lib/hospitals";

describe("Michigan Henry Ford hospital destinations", () => {
  it("includes the 12 directory hospitals with their full Michigan addresses", () => {
    expect(HOSPITALS).toHaveLength(12);
    expect(new Set(HOSPITALS.map((hospital) => hospital.name)).size).toBe(12);
    expect(HOSPITALS.map((hospital) => [hospital.name, hospital.address])).toEqual([
      ["Henry Ford Hospital", "2799 W Grand Blvd, Detroit, MI 48202"],
      ["Henry Ford West Bloomfield Hospital", "6777 W Maple Rd, West Bloomfield, MI 48322"],
      ["Henry Ford Genesys Hospital", "1 Genesys Pkwy, Grand Blanc, MI 48439"],
      ["Henry Ford Jackson Hospital", "205 N East Ave, Jackson, MI 49201"],
      ["Henry Ford Macomb Hospital", "15855 19 Mile Rd, Clinton Township, MI 48038"],
      ["Henry Ford Providence Novi Hospital", "47601 Grand River Ave, Novi, MI 48374"],
      ["Henry Ford Providence Southfield Hospital", "16001 W 9 Mile Rd, Southfield, MI 48075"],
      ["Henry Ford Rochester Hospital", "1101 W University Dr, Rochester, MI 48307"],
      ["Henry Ford St. John Children's Hospital", "22101 Moross Rd, Detroit, MI 48236"],
      ["Henry Ford St. John Hospital", "22101 Moross Rd, Detroit, MI 48236"],
      ["Henry Ford Warren Hospital", "11800 12 Mile Rd, Warren, MI 48093"],
      ["Henry Ford Wyandotte Hospital", "2333 Biddle Ave, Wyandotte, MI 48192"],
    ]);
  });
});