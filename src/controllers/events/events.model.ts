import { Event } from "./events.types";
import pool from "../../db";

const TABLE = "events";
const COLS =
  "id, title, description, event_type, is_public, is_white_label, category_id, created_by, start_date, end_date, created_at";

export const EventModel = {
  async findAll(): Promise<Event[]> {
    const { rows } = await pool.query<Event>(
      `SELECT ${COLS} FROM ${TABLE} ORDER BY start_date DESC`
    );
    return rows;
  },

  async findById(id: string): Promise<Event | null> {
    const { rows } = await pool.query<Event>(
      `SELECT ${COLS} FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByCategoryId(category_id: string): Promise<Event[]> {
    const { rows } = await pool.query<Event>(
      `SELECT ${COLS} FROM ${TABLE} WHERE category_id = $1 ORDER BY start_date DESC`,
      [category_id]
    );
    return rows;
  },

  async findByCreatedBy(created_by: string): Promise<Event[]> {
    const { rows } = await pool.query<Event>(
      `SELECT ${COLS} FROM ${TABLE} WHERE created_by = $1 ORDER BY start_date DESC`,
      [created_by]
    );
    return rows;
  },

  async create(event: Event): Promise<Event> {
    const { rows } = await pool.query<Event>(
      `INSERT INTO ${TABLE} (id, title, description, event_type, is_public, is_white_label, category_id, created_by, start_date, end_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING ${COLS}`,
      [
        event.id,
        event.title,
        event.description,
        event.event_type,
        event.is_public,
        event.is_white_label,
        event.category_id,
        event.created_by,
        event.start_date,
        event.end_date,
        event.created_at
      ]
    );
    return rows[0];
  },

  async update(id: string, event: Event): Promise<Event | null> {
    const { rows } = await pool.query<Event>(
      `UPDATE ${TABLE}
       SET title = $2, description = $3, event_type = $4, is_public = $5, is_white_label = $6,
           category_id = $7, start_date = $8, end_date = $9
       WHERE id = $1
       RETURNING ${COLS}`,
      [
        id,
        event.title,
        event.description,
        event.event_type,
        event.is_public,
        event.is_white_label,
        event.category_id,
        event.start_date,
        event.end_date
      ]
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
