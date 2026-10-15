export interface ApodItem {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version?: string;
  title: string;
  url: string;
}

export interface LaunchProvider {
  name: string;
}

export interface LaunchStatus {
  name: string;
  abbrev: string;
}

export interface LaunchPad {
  name: string;
  location?: {
    name?: string;
    country_code?: string;
  };
}

export interface LaunchImage {
  image_url?: string;
}

export interface LaunchResult {
  id: string;
  name: string;
  net: string;
  status?: LaunchStatus;
  launch_service_provider?: LaunchProvider;
  pad?: LaunchPad;
  image?: string;
  mission?: {
    description?: string;
    type?: string;
  };
}

export interface LaunchApiResponse {
  results: LaunchResult[];
}

export interface NeoCloseApproach {
  close_approach_date: string;
  relative_velocity: {
    kilometers_per_hour: string;
  };
  miss_distance: {
    kilometers: string;
  };
}

export interface NeoObject {
  id: string;
  name: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: NeoCloseApproach[];
}

export interface NeoApiResponse {
  near_earth_objects: Record<string, NeoObject[]>;
}
