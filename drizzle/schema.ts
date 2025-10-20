import {
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  int,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 植物診断履歴テーブル
 */
export const plantDiagnoses = mysqlTable("plant_diagnoses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }),
  imageUrl: text("imageUrl"),
  description: text("description"),
  cropType: varchar("cropType", { length: 64 }),
  temperature: int("temperature"),
  humidity: int("humidity"),
  ec: int("ec"),
  result: json("result").$type<{
    作物: string;
    診断: string;
    信頼度: number;
    原因: string;
    対策: string[];
    予防: string;
    緊急度: string;
  }>(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PlantDiagnosis = typeof plantDiagnoses.$inferSelect;
export type InsertPlantDiagnosis = typeof plantDiagnoses.$inferInsert;

/**
 * 機器診断セッションテーブル
 */
export const equipmentSessions = mysqlTable("equipment_sessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }),
  conversationHistory: json("conversationHistory").$type<
    Array<{ role: string; parts: Array<{ text: string }> }>
  >(),
  finalDiagnosis: json("finalDiagnosis").$type<{
    機器: string;
    推定原因: string;
    信頼度: number;
    代替原因: string[];
    緊急度: string;
  }>(),
  status: mysqlEnum("status", ["ongoing", "completed"]).default("ongoing"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type EquipmentSession = typeof equipmentSessions.$inferSelect;
export type InsertEquipmentSession = typeof equipmentSessions.$inferInsert;
