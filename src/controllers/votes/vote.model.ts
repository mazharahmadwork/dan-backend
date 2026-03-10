import { Vote } from "./vote.types";
import pool from "../../db";

const TABLE = "votes";
const COLS =
  "id, user_id, event_id, option_id, country_id, is_anonymous, created_at";

export const VoteModel = {
  async findAll(): Promise<Vote[]> {
    const { rows } = await pool.query<Vote>(
      `SELECT ${COLS} FROM ${TABLE} ORDER BY created_at DESC`
    );
    return rows;
  },

  async findById(id: string): Promise<Vote | null> {
    const { rows } = await pool.query<Vote>(
      `SELECT ${COLS} FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByEventId(event_id: string): Promise<Vote[]> {
    const { rows } = await pool.query<Vote>(
      `SELECT ${COLS} FROM ${TABLE} WHERE event_id = $1 ORDER BY created_at DESC`,
      [event_id]
    );
    return rows;
  },

  async findByUserId(user_id: string): Promise<Vote[]> {
    const { rows } = await pool.query<Vote>(
      `SELECT ${COLS} FROM ${TABLE} WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    return rows;
  },

  async findByOptionId(option_id: string): Promise<Vote[]> {
    const { rows } = await pool.query<Vote>(
      `SELECT ${COLS} FROM ${TABLE} WHERE option_id = $1 ORDER BY created_at DESC`,
      [option_id]
    );
    return rows;
  },

  async findByUserAndEventAndOption(
    user_id: string,
    event_id: string,
    option_id: string
  ): Promise<Vote | null> {
    const { rows } = await pool.query<Vote>(
      `SELECT ${COLS} FROM ${TABLE} WHERE user_id = $1 AND event_id = $2 AND option_id = $3`,
      [user_id, event_id, option_id]
    );
    return rows[0] ?? null;
  },

  async create(vote: Vote): Promise<Vote> {
    const { rows } = await pool.query<Vote>(
      `INSERT INTO ${TABLE} (id, user_id, event_id, option_id, country_id, is_anonymous, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${COLS}`,
      [
        vote.id,
        vote.user_id,
        vote.event_id,
        vote.option_id,
        vote.country_id,
        vote.is_anonymous,
        vote.created_at
      ]
    );
    return rows[0];
  },

  async update(id: string, vote: Vote): Promise<Vote | null> {
    const { rows } = await pool.query<Vote>(
      `UPDATE ${TABLE} SET is_anonymous = $2 WHERE id = $1 RETURNING ${COLS}`,
      [id, vote.is_anonymous]
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
