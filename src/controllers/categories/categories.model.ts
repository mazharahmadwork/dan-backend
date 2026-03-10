import { Category } from "./categories.types";
import pool from "../../db";

const TABLE = "categories";
const COLS = "id, name, parent_id";

export const CategoryModel = {
  async findAll(): Promise<Category[]> {
    const { rows } = await pool.query<Category>(
      `SELECT ${COLS} FROM ${TABLE} ORDER BY name`
    );
    return rows;
  },

  async findById(id: string): Promise<Category | null> {
    const { rows } = await pool.query<Category>(
      `SELECT ${COLS} FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByParentId(parent_id: string | null): Promise<Category[]> {
    const { rows } = await pool.query<Category>(
      `SELECT ${COLS} FROM ${TABLE} WHERE ($1::uuid IS NULL AND parent_id IS NULL) OR parent_id = $1 ORDER BY name`,
      [parent_id]
    );
    return rows;
  },

  async create(category: Category): Promise<Category> {
    const { rows } = await pool.query<Category>(
      `INSERT INTO ${TABLE} (id, name, parent_id) VALUES ($1, $2, $3) RETURNING ${COLS}`,
      [category.id, category.name, category.parent_id]
    );
    return rows[0];
  },

  async update(id: string, category: Category): Promise<Category | null> {
    const { rows } = await pool.query<Category>(
      `UPDATE ${TABLE} SET name = $2, parent_id = $3 WHERE id = $1 RETURNING ${COLS}`,
      [id, category.name, category.parent_id]
    );
    return rows[0] ?? null;
  },

  async delete(id: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `DELETE FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rowCount === 1;
  }
};
