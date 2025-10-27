// Storage implementation using javascript_database blueprint
import { products, type Product, type InsertProduct } from "@shared/schema";
import { db } from "./db";
import { desc } from "drizzle-orm";

export interface IStorage {
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
}

export class DatabaseStorage implements IStorage {
  async getAllProducts(): Promise<Product[]> {
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));
    return allProducts;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }
}

export const storage = new DatabaseStorage();
