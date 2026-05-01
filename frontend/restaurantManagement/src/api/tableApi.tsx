// src/api/tableApi.ts
import axiosInstance from "./axiosInstance";
import type { RestaurantTable, CreateTableRequest, UpdateTableRequest, TableStatus } from "../types/table";

export const tableApi = {

  getAll: (status?: TableStatus) =>
    axiosInstance
      .get<RestaurantTable[]>("/api/tables", {
        params: status ? { status } : undefined,
      })
      .then((r) => r.data),

  getById: (id: number) =>
    axiosInstance
      .get<RestaurantTable>(`/api/tables/${id}`)
      .then((r) => r.data),

  create: (body: CreateTableRequest) =>
    axiosInstance
      .post<RestaurantTable>("/api/tables", body)
      .then((r) => r.data),

  update: (id: number, body: UpdateTableRequest) =>
    axiosInstance
      .put<RestaurantTable>(`/api/tables/${id}`, body)
      .then((r) => r.data),

  setStatus: (id: number, status: TableStatus) =>
    axiosInstance
      .patch<RestaurantTable>(`/api/tables/${id}/status`, null, {
        params: { status },
      })
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance
      .delete(`/api/tables/${id}`)
      .then((r) => r.data),
};