import { EventOption } from "./event-option.types";
import pool from "../../db";

const TABLE = "event_options";
const COLS = "id, event_id, name, description";

export const EventOptionModel = {
  async findAll(): Promise<EventOption[]> {
    const { rows } = await pool.query<EventOption>(
      `SELECT ${COLS} FROM ${TABLE} ORDER BY event_id, name`
    );
    return rows;
  },

  async findById(id: string): Promise<EventOption | null> {
    const { rows } = await pool.query<EventOption>(
      `SELECT ${COLS} FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByEventId(event_id: string): Promise<EventOption[]> {
    const { rows } = await pool.query<EventOption>(
      `SELECT ${COLS} FROM ${TABLE} WHERE event_id = $1 ORDER BY name`,
      [event_id]
    );
    return rows;
  },

  async create(option: EventOption): Promise<EventOption> {
    const { rows } = await pool.query<EventOption>(
      `INSERT INTO ${TABLE} (id, event_id, name, description)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLS}`,
      [option.id, option.event_id, option.name, option.description]
    );
    return rows[0];
  },

  async update(id: string, option: EventOption): Promise<EventOption | null> {
    const { rows } = await pool.query<EventOption>(
      `UPDATE ${TABLE} SET name = $2, description = $3 WHERE id = $1 RETURNING ${COLS}`,
      [id, option.name, option.description]
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
