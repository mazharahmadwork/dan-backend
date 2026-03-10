import { randomUUID } from "crypto";
import { randomBytes } from "crypto";
import {
  EventInvitation,
  CreateEventInvitationDTO,
  UpdateEventInvitationDTO
} from "./event-invitation.types";
import { EventInvitationModel } from "./event-invitation.model";
import pool from "../../db";

function generateInviteToken(): string {
  return randomBytes(32).toString("hex");
}

export const EventInvitationService = {
  async getEventInvitations(): Promise<EventInvitation[]> {
    return EventInvitationModel.findAll();
  },

  async getEventInvitationById(
    id: string
  ): Promise<EventInvitation | null> {
    return EventInvitationModel.findById(id);
  },

  async getInvitationsByEventId(
    event_id: string
  ): Promise<EventInvitation[]> {
    return EventInvitationModel.findByEventId(event_id);
  },

  async getEventInvitationByToken(
    invite_token: string
  ): Promise<EventInvitation | null> {
    return EventInvitationModel.findByToken(invite_token);
  },

  async createEventInvitation(
    data: CreateEventInvitationDTO
  ): Promise<EventInvitation> {
    const { rows } = await pool.query(
      "SELECT 1 FROM events WHERE id = $1",
      [data.event_id]
    );
    if (rows.length === 0) {
      throw new Error("INVALID_EVENT");
    }

    const invitation: EventInvitation = {
      id: randomUUID(),
      event_id: data.event_id,
      email: data.email,
      invite_token: generateInviteToken(),
      status: data.status ?? "pending",
      created_at: new Date().toISOString()
    };

    return EventInvitationModel.create(invitation);
  },

  async updateEventInvitation(
    id: string,
    data: UpdateEventInvitationDTO
  ): Promise<EventInvitation | null> {
    const existing = await EventInvitationModel.findById(id);
    if (!existing) return null;

    const updated: EventInvitation = {
      ...existing,
      status: data.status ?? existing.status
    };

    return EventInvitationModel.update(id, updated);
  },

  async deleteEventInvitation(id: string): Promise<boolean> {
    return EventInvitationModel.delete(id);
  }
};
