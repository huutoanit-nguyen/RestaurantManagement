// src/types/table.ts
export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";

export interface RestaurantTable {
  id: number;
  tableNumber: number;
  capacity: number;
  location: string;
  status: TableStatus;
}

export interface CreateTableRequest {
  tableNumber: number;
  capacity: number;
  location?: string;
  status?: TableStatus;
}

export type UpdateTableRequest = Partial<CreateTableRequest>;