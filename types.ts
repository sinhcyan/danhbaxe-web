export type CarrierStatus = 'published' | 'pending' | 'private';
export type CarrierType = 'fixed' | 'flexible';
export type ServiceType = 'passenger' | 'goods' | 'bike';

export interface TimedStop {
  name: string;
  time: string; // HH:mm
}

export interface Carrier {
  id: string;
  name: string;
  phone: string;
  type: CarrierType;
  services: ServiceType[];
  status: CarrierStatus;
  image_url?: string;
  created_at?: string;
}

export interface Route {
  id: string;
  carrier_id: string;
  origin_district: string;
  destination_province: string;
  path_tags: string[];
  timed_stops: TimedStop[];
  departure_times: string[];
  description: string;
  price?: number; // Price in VND
  created_at?: string;
  carrier?: Carrier;
}

export interface SearchParams {
  origin: string;
  destination: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface AIAnalysisResult {
  carrierName: string;
  origin: string;
  departureTime: string;
  destination: string;
  arrivalTime: string;
  intermediateStops: string[];
  price?: number; 
}