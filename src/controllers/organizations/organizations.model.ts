import { Organization } from "./organizations.types";
import pool from "../../db";

const TABLE = "organizations";
const COLS = "id, name, owner_id, is_active, created_at";

export const OrganizationModel = {
  async findAll(): Promise<Organization[]> {
    const { rows } = await pool.query<Organization>(
      `SELECT ${COLS} FROM ${TABLE} ORDER BY created_at DESC`
    );
    return rows;
  },

  async findById(id: string): Promise<Organization | null> {
    const { rows } = await pool.query<Organization>(
      `SELECT ${COLS} FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByOwnerId(owner_id: string): Promise<Organization[]> {
    const { rows } = await pool.query<Organization>(
      `SELECT ${COLS} FROM ${TABLE} WHERE owner_id = $1 ORDER BY created_at DESC`,
      [owner_id]
    );
    return rows;
  },

  async create(organization: Organization): Promise<Organization> {
    const { rows } = await pool.query<Organization>(
      `INSERT INTO ${TABLE} (id, name, owner_id, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLS}`,
      [
        organization.id,
        organization.name,
        organization.owner_id,
        organization.is_active,
        organization.created_at
      ]
    );
    return rows[0];
  },

  async update(id: string, organization: Organization): Promise<Organization | null> {
    const { rows } = await pool.query<Organization>(
      `UPDATE ${TABLE}
       SET name = $2, owner_id = $3, is_active = $4
       WHERE id = $1
       RETURNING ${COLS}`,
      [
        id,
        organization.name,
        organization.owner_id,
        organization.is_active
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
