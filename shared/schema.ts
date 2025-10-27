import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products table for storing scanned product data
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  barcode: text("barcode").notNull(),
  productName: text("product_name").notNull(),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  unitOfMeasure: text("unit_of_measure").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema with validation
export const insertProductSchema = createInsertSchema(products, {
  barcode: z.string().min(8, "Штрихкод должен содержать минимум 8 символов").max(14, "Штрихкод не должен превышать 14 символов"),
  productName: z.string().min(1, "Название товара обязательно").max(200, "Название слишком длинное"),
  retailPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Цена должна быть числом с максимум 2 десятичными знаками").refine((val) => parseFloat(val) > 0, "Цена должна быть больше нуля"),
  category: z.string().min(1, "Категория обязательна").max(100, "Категория слишком длинная"),
  unitOfMeasure: z.string().min(1, "Единица измерения обязательна").max(20, "Единица измерения слишком длинная"),
}).omit({ id: true, createdAt: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Export format types
export interface ExportData {
  barcode: string;
  productName: string;
  retailPrice: string;
  category: string;
  unitOfMeasure: string;
}
