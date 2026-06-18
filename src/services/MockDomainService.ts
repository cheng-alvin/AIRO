export interface DomainSuggestionMock {
  id: string;
  address: string;
  relativeScore: number;
}

export interface DomainPropertyDetailsMock {
  address: string;
  bedrooms: number;
  bathrooms: number;
  carSpaces: number;
  areaSize: number;
  propertyType: string;
  imageUrl: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}

const mockPropertiesList: DomainPropertyDetailsMock[] = [
  {
    address: "123 Ocean View Drive, Beachside",
    bedrooms: 4,
    bathrooms: 3,
    carSpaces: 2,
    areaSize: 350,
    propertyType: "Luxury Villa",
    imageUrl: "https://images.unsplash.com/photo-1613490908676-e137c48f2203?auto=format&fit=crop&w=400&q=80",
    geolocation: { latitude: -33.8688, longitude: 151.2093 }
  },
  {
    address: "45 Mountain Road, Highland Park",
    bedrooms: 5,
    bathrooms: 4,
    carSpaces: 3,
    areaSize: 520,
    propertyType: "Family House",
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
    geolocation: { latitude: -33.87, longitude: 151.21 }
  },
  {
    address: "88 City Center Ave, Downtown",
    bedrooms: 2,
    bathrooms: 1,
    carSpaces: 1,
    areaSize: 85,
    propertyType: "Cozy Apartment",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1e52409818?auto=format&fit=crop&w=400&q=80",
    geolocation: { latitude: -33.872, longitude: 151.205 }
  }
];

export const fetchSuggestionMock = (addressString: string): Promise<DomainSuggestionMock[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a suggestion matching the search text for realism in POC
      resolve([
        {
          id: "mock-id-random",
          address: addressString || "Selected Property",
          relativeScore: 100,
        }
      ]);
    }, 800);
  });
};

export const fetchPropertyDetailsMock = (id: string): Promise<DomainPropertyDetailsMock | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Pick a random property to demonstrate POC versatility
      const randomIndex = Math.floor(Math.random() * mockPropertiesList.length);
      const selectedProperty = mockPropertiesList[randomIndex];
      resolve(selectedProperty);
    }, 800);
  });
};
