import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  getCategoriesByParentId,
  createCategory,
  updateCategory,
  deleteCategory
} from "./categories.controller";

const router = Router();

// GET /api/categories (all categories)
router.get("/", getCategories);

// GET /api/categories/by-parent?parent_id=<uuid|empty> (children of a parent; omit or null for top-level)
router.get("/by-parent", getCategoriesByParentId);

// GET /api/categories/:id
router.get("/:id", getCategoryById);

// POST /api/categories
router.post("/", createCategory);

// PUT /api/categories/:id
router.put("/:id", updateCategory);

// DELETE /api/categories/:id
router.delete("/:id", deleteCategory);

export default router;
