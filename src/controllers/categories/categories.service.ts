import { randomUUID } from "crypto";
import {
  Category,
  CategoryWithChildren,
  CreateCategoryDTO
} from "./categories.types";
import { CategoryModel } from "./categories.model";
import { EventModel } from "../events/events.model";

function buildCategoryTree(
  categories: Category[],
  parent_id: string | null
): CategoryWithChildren[] {
  return categories
    .filter((c) => c.parent_id === parent_id)
    .map((c) => ({
      ...c,
      children: buildCategoryTree(categories, c.id)
    }));
}

export const CategoryService = {
  async getCategories(): Promise<Category[]> {
    return CategoryModel.findAll();
  },

  async getCategoriesTree(): Promise<CategoryWithChildren[]> {
    const categories = await CategoryModel.findAll();
    return buildCategoryTree(categories, null);
  },

  async getCategoryById(id: string): Promise<Category | null> {
    return CategoryModel.findById(id);
  },

  async getCategoriesByParentId(parent_id: string | null): Promise<Category[]> {
    return CategoryModel.findByParentId(parent_id);
  },

  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    if (data.parent_id != null) {
      const parent = await CategoryModel.findById(data.parent_id);
      if (!parent) {
        throw new Error("INVALID_PARENT");
      }
    }

    const category: Category = {
      id: randomUUID(),
      name: data.name,
      parent_id: data.parent_id ?? null
    };

    return CategoryModel.create(category);
  },

  async updateCategory(
    id: string,
    data: CreateCategoryDTO
  ): Promise<Category | null> {
    const existing = await CategoryModel.findById(id);
    if (!existing) {
      return null;
    }

    if (data.parent_id != null && data.parent_id !== existing.parent_id) {
      if (data.parent_id === id) {
        throw new Error("SELF_REFERENCE");
      }
      const parent = await CategoryModel.findById(data.parent_id);
      if (!parent) {
        throw new Error("INVALID_PARENT");
      }
    }

    const updated: Category = {
      ...existing,
      name: data.name ?? existing.name,
      parent_id: data.parent_id !== undefined ? data.parent_id : existing.parent_id
    };

    return CategoryModel.update(id, updated);
  },

  async deleteCategory(id: string): Promise<boolean> {
    // Check if category exists
    const category = await CategoryModel.findById(id);
    if (!category) {
      return false;
    }

    // Collect all category IDs that will be deleted (this category + all descendants)
    const categoryIdsToDelete: string[] = [];
    await this.collectCategoryIds(id, categoryIdsToDelete);

    // Delete all events associated with these categories (cascade delete)
    for (const categoryId of categoryIdsToDelete) {
      const events = await EventModel.findByCategoryId(categoryId);
      for (const event of events) {
        await EventModel.delete(event.id);
      }
    }

    // Recursively delete all children first
    await this.deleteCategoryChildren(id);

    // Then delete the category itself
    return CategoryModel.delete(id);
  },

  /**
   * Recursively collect all category IDs that will be deleted (category + all descendants)
   */
  async collectCategoryIds(categoryId: string, ids: string[]): Promise<void> {
    ids.push(categoryId);
    const children = await CategoryModel.findByParentId(categoryId);
    for (const child of children) {
      await this.collectCategoryIds(child.id, ids);
    }
  },

  /**
   * Recursively delete all children of a category
   */
  async deleteCategoryChildren(parentId: string): Promise<void> {
    // Find all direct children
    const children = await CategoryModel.findByParentId(parentId);

    // Recursively delete each child's children first
    for (const child of children) {
      await this.deleteCategoryChildren(child.id);
    }

    // Then delete all direct children
    for (const child of children) {
      await CategoryModel.delete(child.id);
    }
  }
};
