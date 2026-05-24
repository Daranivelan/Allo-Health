import type { ReservationResponse } from "@/lib/inventory-types";

export async function createReservation(input: {
  productId: string;
  warehouseId: string;
  quantity: number;
}): Promise<ReservationResponse> {
  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to create reservation");
  }

  return data;
}

export async function confirmReservation(id: string) {
  const response = await fetch(`/api/reservations/${id}/confirm`, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to confirm reservation");
  }

  return data;
}

export async function releaseReservation(id: string) {
  const response = await fetch(`/api/reservations/${id}/release`, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to cancel reservation");
  }

  return data;
}
