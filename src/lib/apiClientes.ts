// src/lib/apiClientes.ts
import axios from 'axios';
import { Cliente, ClienteCreate, ClienteUpdate, ClientesResponse } from '@/types/cliente';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000',
});

export async function listClientes(q?: string) {
  const res = await api.get<Cliente[]>('/clientes', { params: q ? { q } : undefined });
  return res.data;
}

export async function listClientesPaged(params?: { page?: number; pageSize?: number; q?: string }) {
  const { page = 1, pageSize = 10, q } = params ?? {};
  const res = await api.get<ClientesResponse>('/clientes', { params: { page, pageSize, q } });
  return res.data;
}

export async function getCliente(id: number | string) {
  const res = await api.get<Cliente>(`/clientes/${id}`);
  return res.data;
}

export async function createCliente(payload: ClienteCreate) {
  const res = await api.post<Cliente>('/clientes', payload);
  return res.data;
}

export async function updateCliente(id: number | string, payload: ClienteUpdate) {
  const res = await api.put<Cliente>(`/clientes/${id}`, payload);
  return res.data;
}

export async function deleteCliente(id: number | string) {
  await api.delete(`/clientes/${id}`);
  return { ok: true as const };
}
