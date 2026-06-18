export namespace AIRO {
  export interface PropertyData {
    address: string;
    bedrooms: number;
    bathrooms: number;
    carSpaces: number;
    areaSize: number; // area size in m²
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
  }
}
