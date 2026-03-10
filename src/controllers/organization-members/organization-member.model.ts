import { OrganizationMember } from "./organization-member.types";
import pool from "../../db";

const TABLE = "organization_members";
const COLS = "id, organization_id, user_id, role";

export const OrganizationMemberModel = {
  async findAll(): Promise<OrganizationMember[]> {
    const { rows } = await pool.query<OrganizationMember>(
      `SELECT ${COLS} FROM ${TABLE} ORDER BY organization_id, user_id`
    );
    return rows;
  },

  async findById(id: string): Promise<OrganizationMember | null> {
    const { rows } = await pool.query<OrganizationMember>(
      `SELECT ${COLS} FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByOrganizationId(
    organization_id: string
  ): Promise<OrganizationMember[]> {
    const { rows } = await pool.query<OrganizationMember>(
      `SELECT ${COLS} FROM ${TABLE} WHERE organization_id = $1 ORDER BY role, user_id`,
      [organization_id]
    );
    return rows;
  },

  async findByUserId(user_id: string): Promise<OrganizationMember[]> {
    const { rows } = await pool.query<OrganizationMember>(
      `SELECT ${COLS} FROM ${TABLE} WHERE user_id = $1 ORDER BY organization_id`,
      [user_id]
    );
    return rows;
  },

  async findByOrganizationAndUser(
    organization_id: string,
    user_id: string
  ): Promise<OrganizationMember | null> {
    const { rows } = await pool.query<OrganizationMember>(
      `SELECT ${COLS} FROM ${TABLE} WHERE organization_id = $1 AND user_id = $2`,
      [organization_id, user_id]
    );
    return rows[0] ?? null;
  },

  async create(member: OrganizationMember): Promise<OrganizationMember> {
    const { rows } = await pool.query<OrganizationMember>(
      `INSERT INTO ${TABLE} (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, $4)
       RETURNING ${COLS}`,
      [member.id, member.organization_id, member.user_id, member.role]
    );
    return rows[0];
  },

  async update(
    id: string,
    member: OrganizationMember
  ): Promise<OrganizationMember | null> {
    const { rows } = await pool.query<OrganizationMember>(
      `UPDATE ${TABLE} SET role = $2 WHERE id = $1 RETURNING ${COLS}`,
      [id, member.role]
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
