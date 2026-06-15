import { Vehicle } from './vehicle';
import { Booking } from './booking';

export interface OwnerVehiclesResponse {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  vehicles: Vehicle[];
}

export interface OwnerBookingsResponse {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  bookings: Booking[];
}

export interface CreateVehiclePayload {
  title: string;
  brand: string;
  model: string;
  year: number;
  vehicleNumber: string;
  fuelType: 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID';
  transmission: 'MANUAL' | 'AUTOMATIC';
  seatCapacity: number;
  pricePerDay: number;
  city: string;
  latitude: number;
  longitude: number;
  description: string;
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;
