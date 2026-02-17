import { openDB } from 'idb';

const DB_NAME = 'restaurant-pos-offline';

export async function queueOrder(order: unknown): Promise<void> {
  const db = await openDB(DB_NAME, 1, {
    upgrade(dbInstance) {
      if (!dbInstance.objectStoreNames.contains('orders')) {
        dbInstance.createObjectStore('orders', { keyPath: 'id' });
      }
    }
  });

  await db.put('orders', {
    id: `offline-${Date.now()}`,
    order,
    createdAt: Date.now()
  });
}

export async function getQueuedOrders(): Promise<Array<{ id: string; order: unknown }>> {
  const db = await openDB(DB_NAME, 1);
  return db.getAll('orders') as Promise<Array<{ id: string; order: unknown }>>;
}

export async function clearQueuedOrder(id: string): Promise<void> {
  const db = await openDB(DB_NAME, 1);
  await db.delete('orders', id);
}
