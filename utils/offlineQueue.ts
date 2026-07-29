import { getDB } from "@/src/db/database";

export const encolarPeticion = async (
  method: string,
  endpoint: string,
  body?: Record<string, any>,
  imageUri?: string
) => {
  const db = getDB();
  if (!db) throw new Error("DB no inicializada");

  await db.runAsync(
    `INSERT INTO pending_requests (method, endpoint, body, image_uri, created_at, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [
      method,
      endpoint,
      body ? JSON.stringify(body) : null,
      imageUri || null,
      new Date().toISOString(),
    ]
  );
};

export const obtenerCola = async () => {
  const db = getDB();
  if (!db) return [];

  return await db.getAllAsync(
    `SELECT * FROM pending_requests WHERE status = 'pending' ORDER BY created_at ASC`
  );
};

export const eliminarDeCola = async (id: number) => {
  const db = getDB();
  if (!db) return;

  await db.runAsync(`DELETE FROM pending_requests WHERE id = ?`, [id]);
};

export const marcarError = async (id: number) => {
  const db = getDB();
  if (!db) return;

  await db.runAsync(
    `UPDATE pending_requests SET status = 'failed' WHERE id = ?`,
    [id]
  );
};

export const contarPendientes = async (): Promise<number> => {
  const db = getDB();
  if (!db) return 0;

  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM pending_requests WHERE status = 'pending'`
  );
  return result?.count || 0;
};
