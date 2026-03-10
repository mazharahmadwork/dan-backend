import { Request, Response } from "express";
import { DatabaseError } from "pg";
import { CategoryService } from "./categories.service";

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getCategoriesTree();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const category = await CategoryService.getCategoryById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Failed to fetch category" });
  }
};

export const getCategoriesByParentId = async (req: Request, res: Response) => {
  try {
    const parent_id = req.query.parent_id as string | undefined;
    const id = parent_id === "" || parent_id === "null" ? null : parent_id ?? null;
    const categories = await CategoryService.getCategoriesByParentId(id ?? null);
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories by parent:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const category = await CategoryService.createCategory({
      name,
      parent_id: parent_id ?? null
    });
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_PARENT") {
        return res.status(400).json({
          message: "Invalid parent_id. Parent category does not exist.",
          hint: "Create a parent first: POST /api/categories with body {\"name\": \"Electronics\"}, then use the returned id as parent_id. Or omit parent_id for a top-level category."
        });
      }
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(400).json({
        message: "Invalid parent_id. Parent category does not exist.",
        hint: "Create a parent first: POST /api/categories with body {\"name\": \"Electronics\"}, then use the returned id as parent_id. Or omit parent_id for a top-level category."
      });
    }
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const updated = await CategoryService.updateCategory(id, {
      name,
      parent_id: parent_id !== undefined ? parent_id : undefined
    });

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SELF_REFERENCE") {
        return res
          .status(400)
          .json({ message: "Category cannot be its own parent." });
      }
      if (error.message === "INVALID_PARENT") {
        return res
          .status(400)
          .json({ message: "Invalid parent_id. Parent category does not exist." });
      }
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return res
        .status(400)
        .json({ message: "Invalid parent_id. Parent category does not exist." });
    }
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await CategoryService.deleteCategory(id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(204).send();
  } catch (error) {
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(409).json({
        message: "Cannot delete category. It is referenced by other records.",
        hint: "The deletion process will automatically handle associated events and child categories."
      });
    }
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};
