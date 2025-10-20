import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, plantDiagnoses, PlantDiagnosis, InsertPlantDiagnosis, equipmentSessions, EquipmentSession, InsertEquipmentSession } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// 植物診断履歴関連のクエリ
export async function savePlantDiagnosis(diagnosis: InsertPlantDiagnosis): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save plant diagnosis: database not available");
    return;
  }
  await db.insert(plantDiagnoses).values(diagnosis);
}

export async function getPlantDiagnosesByUser(userId: string): Promise<PlantDiagnosis[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get plant diagnoses: database not available");
    return [];
  }
  return await db.select().from(plantDiagnoses).where(eq(plantDiagnoses.userId, userId)).orderBy(desc(plantDiagnoses.createdAt));
}

export async function saveEquipmentSession(session: InsertEquipmentSession): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save equipment session: database not available");
    return;
  }
  await db.insert(equipmentSessions).values(session);
}

export async function updateEquipmentSession(id: string, updates: Partial<InsertEquipmentSession>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update equipment session: database not available");
    return;
  }
  await db.update(equipmentSessions).set(updates).where(eq(equipmentSessions.id, id));
}

export async function getEquipmentSession(id: string): Promise<EquipmentSession | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get equipment session: database not available");
    return undefined;
  }
  const result = await db.select().from(equipmentSessions).where(eq(equipmentSessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEquipmentSessionsByUser(userId: string): Promise<EquipmentSession[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get equipment sessions: database not available");
    return [];
  }
  return await db.select().from(equipmentSessions).where(eq(equipmentSessions.userId, userId)).orderBy(desc(equipmentSessions.updatedAt));
}
