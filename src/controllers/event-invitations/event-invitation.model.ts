import { EventInvitation } from "./event-invitation.types";
import pool from "../../db";

const TABLE = "event_invitations";
const COLS = "id, event_id, email, invite_token, status, created_at";

export const EventInvitationModel = {
  async findAll(): Promise<EventInvitation[]> {
    const { rows } = await pool.query<EventInvitation>(
      `SELECT ${COLS} FROM ${TABLE} ORDER BY created_at DESC`
    );
    return rows;
  },

  async findById(id: string): Promise<EventInvitation | null> {
    const { rows } = await pool.query<EventInvitation>(
      `SELECT ${COLS} FROM ${TABLE} WHERE id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByEventId(event_id: string): Promise<EventInvitation[]> {
    const { rows } = await pool.query<EventInvitation>(
      `SELECT ${COLS} FROM ${TABLE} WHERE event_id = $1 ORDER BY created_at DESC`,
      [event_id]
    );
    return rows;
  },

  async findByToken(invite_token: string): Promise<EventInvitation | null> {
    const { rows } = await pool.query<EventInvitation>(
      `SELECT ${COLS} FROM ${TABLE} WHERE invite_token = $1`,
      [invite_token]
    );
    return rows[0] ?? null;
  },

  async create(invitation: EventInvitation): Promise<EventInvitation> {
    const { rows } = await pool.query<EventInvitation>(
      `INSERT INTO ${TABLE} (id, event_id, email, invite_token, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${COLS}`,
      [
        invitation.id,
        invitation.event_id,
        invitation.email,
        invitation.invite_token,
        invitation.status,
        invitation.created_at
      ]
    );
    return rows[0];
  },

  async update(
    id: string,
    invitation: EventInvitation
  ): Promise<EventInvitation | null> {
    const { rows } = await pool.query<EventInvitation>(
      `UPDATE ${TABLE} SET status = $2 WHERE id = $1 RETURNING ${COLS}`,
      [id, invitation.status]
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
