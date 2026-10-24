// Henry Ford Health's 12-entry Hospital Locations directory roster.
// St. John Hospital and St. John Children's Hospital share a campus address.
export const HOSPITAL_DIRECTORY_URL = "https://www.henryford.com/locations";
export const HOSPITALS = [
  { name: "Henry Ford Hospital", address: "2799 W Grand Blvd, Detroit, MI 48202", source: "henry-ford-hospital" },
  { name: "Henry Ford West Bloomfield Hospital", address: "6777 W Maple Rd, West Bloomfield, MI 48322", source: "west-bloomfield" },
  { name: "Henry Ford Genesys Hospital", address: "1 Genesys Pkwy, Grand Blanc, MI 48439", source: "genesys-hospital" },
  { name: "Henry Ford Jackson Hospital", address: "205 N East Ave, Jackson, MI 49201", source: "jackson-hospital" },
  { name: "Henry Ford Macomb Hospital", address: "15855 19 Mile Rd, Clinton Township, MI 48038", source: "macomb" },
  { name: "Henry Ford Providence Novi Hospital", address: "47601 Grand River Ave, Novi, MI 48374", source: "providence-novi-hospital" },
  { name: "Henry Ford Providence Southfield Hospital", address: "16001 W 9 Mile Rd, Southfield, MI 48075", source: "providence-southfield-hospital" },
  { name: "Henry Ford Rochester Hospital", address: "1101 W University Dr, Rochester, MI 48307", source: "rochester-hospital" },
  { name: "Henry Ford St. John Children's Hospital", address: "22101 Moross Rd, Detroit, MI 48236", source: "st-john-childrens-hospital" },
  { name: "Henry Ford St. John Hospital", address: "22101 Moross Rd, Detroit, MI 48236", source: "st-john-hospital" },
  { name: "Henry Ford Warren Hospital", address: "11800 12 Mile Rd, Warren, MI 48093", source: "warren-hospital" },
  { name: "Henry Ford Wyandotte Hospital", address: "2333 Biddle Ave, Wyandotte, MI 48192", source: "wyandotte" },
] as const;