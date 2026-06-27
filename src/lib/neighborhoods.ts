export interface NeighborhoodConfig {
  id: string;
  name: string;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

export interface NeighborhoodsData {
  neighborhoods: NeighborhoodConfig[];
  defaultNeighborhoodId: string;
  defaultCity: string;
  defaultLat: number;
  defaultLng: number;
}

export const neighborhoods: NeighborhoodsData = {
  defaultNeighborhoodId: "long-beach",
  defaultCity: "Long Beach, CA",
  defaultLat: 33.7701,
  defaultLng: -118.1937,
  neighborhoods: [
    {
      id: "belmont-shore",
      name: "Belmont Shore",
      latMin: 33.76, latMax: 33.78,
      lngMin: -118.20, lngMax: -118.18,
    },
    {
      id: "downtown-long-beach",
      name: "Downtown Long Beach",
      latMin: 33.77, latMax: 33.79,
      lngMin: -118.19, lngMax: -118.17,
    },
    {
      id: "naples",
      name: "Naples",
      latMin: 33.78, latMax: 33.80,
      lngMin: -118.18, lngMax: -118.16,
    },
  ],
};

export function detectNeighborhood(lat: number, lng: number): string {
  for (const n of neighborhoods.neighborhoods) {
    if (lat >= n.latMin && lat <= n.latMax && lng >= n.lngMin && lng <= n.lngMax) {
      return n.name;
    }
  }
  return neighborhoods.defaultCity;
}
