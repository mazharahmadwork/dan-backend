import { Request, Response } from "express";
import { DatabaseError } from "pg";
import { EventInvitationService } from "./event-invitation.service";

export const getEventInvitations = async (_req: Request, res: Response) => {
  try {
    const invitations = await EventInvitationService.getEventInvitations();
    res.json(invitations);
  } catch (error) {
    console.error("Error fetching event invitations:", error);
    res.status(500).json({ message: "Failed to fetch event invitations" });
  }
};

export const getEventInvitationById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params as { id: string };
    const invitation = await EventInvitationService.getEventInvitationById(id);

    if (!invitation) {
      return res.status(404).json({ message: "Event invitation not found" });
    }

    res.json(invitation);
  } catch (error) {
    console.error("Error fetching event invitation:", error);
    res.status(500).json({ message: "Failed to fetch event invitation" });
  }
};

export const getInvitationsByEventId = async (
  req: Request,
  res: Response
) => {
  try {
    const event_id = req.query.event_id as string;
    if (!event_id) {
      return res.status(400).json({ message: "event_id query is required" });
    }
    const invitations =
      await EventInvitationService.getInvitationsByEventId(event_id);
    res.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations by event:", error);
    res.status(500).json({ message: "Failed to fetch event invitations" });
  }
};

export const getEventInvitationByToken = async (
  req: Request,
  res: Response
) => {
  try {
    const invite_token = req.query.invite_token as string;
    if (!invite_token) {
      return res.status(400).json({ message: "invite_token query is required" });
    }
    const invitation =
      await EventInvitationService.getEventInvitationByToken(invite_token);

    if (!invitation) {
      return res.status(404).json({ message: "Event invitation not found" });
    }

    res.json(invitation);
  } catch (error) {
    console.error("Error fetching event invitation by token:", error);
    res.status(500).json({ message: "Failed to fetch event invitation" });
  }
};

export const createEventInvitation = async (
  req: Request,
  res: Response
) => {
  try {
    const { event_id, email, status } = req.body;

    if (!event_id || !email) {
      return res.status(400).json({
        message: "event_id and email are required"
      });
    }

    const invitation = await EventInvitationService.createEventInvitation({
      event_id,
      email,
      status
    });
    res.status(201).json(invitation);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_EVENT") {
        return res.status(400).json({
          message: "Invalid event_id. Event does not exist."
        });
      }
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(400).json({
        message: "Invalid event_id. Event does not exist."
      });
    }
    if (error instanceof DatabaseError && error.code === "42P01") {
      return res.status(500).json({
        message:
          "Event invitations table not found. Run the CREATE TABLE from queries.txt."
      });
    }
    console.error("Error creating event invitation:", error);
    res.status(500).json({ message: "Failed to create event invitation" });
  }
};

export const updateEventInvitation = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const updated = await EventInvitationService.updateEventInvitation(id, {
      status
    });

    if (!updated) {
      return res.status(404).json({ message: "Event invitation not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating event invitation:", error);
    res.status(500).json({ message: "Failed to update event invitation" });
  }
};

export const deleteEventInvitation = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params as { id: string };
    const deleted =
      await EventInvitationService.deleteEventInvitation(id);

    if (!deleted) {
      return res.status(404).json({ message: "Event invitation not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting event invitation:", error);
    res.status(500).json({ message: "Failed to delete event invitation" });
  }
};
