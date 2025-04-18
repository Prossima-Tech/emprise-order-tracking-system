export interface RailwayZone {
  id: string;
  code: string;
  name: string;
  headquarters: string;
  region: string;
}

export const RAILWAY_ZONES: RailwayZone[] = [
  {
    id: "cr",
    code: "CR",
    name: "Central Railway",
    headquarters: "Mumbai",
    region: "Central India"
  },
  {
    id: "er",
    code: "ER",
    name: "Eastern Railway",
    headquarters: "Kolkata",
    region: "Eastern India"
  },
  {
    id: "ecr",
    code: "ECR",
    name: "East Central Railway",
    headquarters: "Hajipur",
    region: "Eastern India"
  },
  {
    id: "ecor",
    code: "ECoR",
    name: "East Coast Railway",
    headquarters: "Bhubaneswar",
    region: "Eastern India"
  },
  {
    id: "nr",
    code: "NR",
    name: "Northern Railway",
    headquarters: "New Delhi",
    region: "Northern India"
  },
  {
    id: "ncr",
    code: "NCR",
    name: "North Central Railway",
    headquarters: "Allahabad",
    region: "Northern India"
  },
  {
    id: "ner",
    code: "NER",
    name: "North Eastern Railway",
    headquarters: "Gorakhpur",
    region: "Northern India"
  },
  {
    id: "nfr",
    code: "NFR",
    name: "Northeast Frontier Railway",
    headquarters: "Maligaon",
    region: "Northeast India"
  },
  {
    id: "nwr",
    code: "NWR",
    name: "North Western Railway",
    headquarters: "Jaipur",
    region: "Northern India"
  },
  {
    id: "sr",
    code: "SR",
    name: "Southern Railway",
    headquarters: "Chennai",
    region: "Southern India"
  },
  {
    id: "scr",
    code: "SCR",
    name: "South Central Railway",
    headquarters: "Secunderabad",
    region: "Southern India"
  },
  {
    id: "ser",
    code: "SER",
    name: "South Eastern Railway",
    headquarters: "Kolkata",
    region: "Eastern India"
  },
  {
    id: "secr",
    code: "SECR",
    name: "South East Central Railway",
    headquarters: "Bilaspur",
    region: "Central India"
  },
  {
    id: "swr",
    code: "SWR",
    name: "South Western Railway",
    headquarters: "Hubli",
    region: "Southern India"
  },
  {
    id: "wr",
    code: "WR",
    name: "Western Railway",
    headquarters: "Mumbai",
    region: "Western India"
  },
  {
    id: "wcr",
    code: "WCR",
    name: "West Central Railway",
    headquarters: "Jabalpur",
    region: "Central India"
  },
  {
    id: "metro",
    code: "METRO",
    name: "Metro Railway",
    headquarters: "Kolkata",
    region: "Eastern India"
  }
];

// Helper function to get zone name by ID
export const getZoneName = (zoneId: string): string => {
  const zone = RAILWAY_ZONES.find(z => z.id === zoneId);
  return zone ? zone.name : '';
};

// Helper function to get zone by ID
export const getZoneById = (zoneId: string): RailwayZone | undefined => {
  return RAILWAY_ZONES.find(z => z.id === zoneId);
};

// Helper function to get zones by region
export const getZonesByRegion = (region: string): RailwayZone[] => {
  return RAILWAY_ZONES.filter(z => z.region === region);
};

// Get unique regions
export const RAILWAY_REGIONS = Array.from(
  new Set(RAILWAY_ZONES.map(z => z.region))
).sort(); 