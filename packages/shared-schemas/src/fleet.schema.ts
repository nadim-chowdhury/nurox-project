import { z } from "zod";

export const vehicleSchema = z.object({
  id: z.string().uuid(),
  registrationNumber: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  fuelType: z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID"]),
  capacityKg: z.number().min(0),
  insuranceExpiry: z.string().datetime().optional(),
  roadTaxExpiry: z.string().datetime().optional(),
});

export const createVehicleSchema = vehicleSchema.omit({ id: true });
export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;

export const fuelLogSchema = z.object({
  vehicleId: z.string().uuid(),
  odometer: z.number().min(0),
  fuelQuantity: z.number().min(0.1),
  cost: z.number().min(0),
});

export type CreateFuelLogDto = z.infer<typeof fuelLogSchema>;

export const tripLogSchema = z.object({
  vehicleId: z.string().uuid(),
  driverId: z.string().uuid(),
  origin: z.string().min(1),
  destination: z.string().min(1),
  distanceKm: z.number().min(0),
});

export type CreateTripLogDto = z.infer<typeof tripLogSchema>;
