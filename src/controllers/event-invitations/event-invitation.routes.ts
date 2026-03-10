import { Router } from "express";
import {
  getEventInvitations,
  getEventInvitationById,
  getInvitationsByEventId,
  getEventInvitationByToken,
  createEventInvitation,
  updateEventInvitation,
  deleteEventInvitation
} from "./event-invitation.controller";

const router = Router();

// GET /api/event-invitations
router.get("/", getEventInvitations);

// GET /api/event-invitations/by-event?event_id=<uuid>
router.get("/by-event", getInvitationsByEventId);

// GET /api/event-invitations/by-token?invite_token=<string>
router.get("/by-token", getEventInvitationByToken);

// GET /api/event-invitations/:id
router.get("/:id", getEventInvitationById);

// POST /api/event-invitations
router.post("/", createEventInvitation);

// PUT /api/event-invitations/:id
router.put("/:id", updateEventInvitation);

// DELETE /api/event-invitations/:id
router.delete("/:id", deleteEventInvitation);

export default router;
