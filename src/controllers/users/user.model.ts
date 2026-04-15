import { User } from "./user.types";
import pool from "../../db";

const TABLE = "users";
const COLS_WITH_AGE =
  "id, email, password_hash, full_name, date_of_birth, age, country_id, verification_status, created_at, updated_at";
const COLS_WITHOUT_AGE =
  "id, email, password_hash, full_name, date_of_birth, country_id, verification_status, created_at, updated_at";

let hasAgeColumnCache: boolean | null = null;

async function hasAgeColumn(): Promise<boolean> {
  if (hasAgeColumnCache !== null) {
    return hasAgeColumnCache;
  }

  const { rows } = await pool.query<{ exists: boolean }>(
    `SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = $1
        AND column_name = 'age'
    ) AS exists`,
    [TABLE]
  );

  hasAgeColumnCache = rows[0]?.exists ?? false;
  return hasAgeColumnCache;
}

export const UserModel = {
  async findAll(): Promise<User[]> {
    const cols = (await hasAgeColumn()) ? COLS_WITH_AGE : COLS_WITHOUT_AGE;
    const { rows } = await pool.query<User>(
      `SELECT ${cols} FROM ${TABLE} ORDER BY created_at DESC`
    );
    return rows;
  },

  async findById(id: string): Promise<User | null> {
    const cols = (await hasAgeColumn()) ? COLS_WITH_AGE : COLS_WITHOUT_AGE;
    const { rows } = await pool.query<User>(
      `SELECT ${cols} FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const cols = (await hasAgeColumn()) ? COLS_WITH_AGE : COLS_WITHOUT_AGE;
    const { rows } = await pool.query<User>(
      `SELECT ${cols} FROM ${TABLE} WHERE email = $1`,
      [email]
    );
    return rows[0] ?? null;
  },

  async create(user: User): Promise<User> {
    const useAge = await hasAgeColumn();
    const cols = useAge ? COLS_WITH_AGE : COLS_WITHOUT_AGE;
    const { rows } = useAge
      ? await pool.query<User>(
          `INSERT INTO ${TABLE} (id, email, password_hash, full_name, date_of_birth, age, country_id, verification_status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING ${cols}`,
          [
            user.id,
            user.email,
            user.password_hash,
            user.full_name,
            user.date_of_birth,
            user.age,
            user.country_id,
            user.verification_status,
            user.created_at,
            user.updated_at
          ]
        )
      : await pool.query<User>(
          `INSERT INTO ${TABLE} (id, email, password_hash, full_name, date_of_birth, country_id, verification_status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING ${cols}`,
          [
            user.id,
            user.email,
            user.password_hash,
            user.full_name,
            user.date_of_birth,
            user.country_id,
            user.verification_status,
            user.created_at,
            user.updated_at
          ]
        );
    return rows[0];
  },

  async update(id: string, user: User): Promise<User | null> {
    const useAge = await hasAgeColumn();
    const cols = useAge ? COLS_WITH_AGE : COLS_WITHOUT_AGE;
    const { rows } = useAge
      ? await pool.query<User>(
          `UPDATE ${TABLE}
           SET email = $2, password_hash = $3, full_name = $4, date_of_birth = $5,
               age = $6, country_id = $7, verification_status = $8, updated_at = $9
           WHERE id = $1
           RETURNING ${cols}`,
          [
            id,
            user.email,
            user.password_hash,
            user.full_name,
            user.date_of_birth,
            user.age,
            user.country_id,
            user.verification_status,
            user.updated_at
          ]
        )
      : await pool.query<User>(
          `UPDATE ${TABLE}
           SET email = $2, password_hash = $3, full_name = $4, date_of_birth = $5,
               country_id = $6, verification_status = $7, updated_at = $8
           WHERE id = $1
           RETURNING ${cols}`,
          [
            id,
            user.email,
            user.password_hash,
            user.full_name,
            user.date_of_birth,
            user.country_id,
            user.verification_status,
            user.updated_at
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
