import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/products - Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ 
        error: "Ошибка получения товаров"
      });
    }
  });

  // POST /api/products - Create a new product
  app.post("/api/products", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertProductSchema.parse(req.body);
      
      // Create product
      const product = await storage.createProduct(validatedData);
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Ошибка валидации данных",
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          })),
        });
      }
      
      res.status(500).json({ 
        error: "Ошибка создания товара"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
