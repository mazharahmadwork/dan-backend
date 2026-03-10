import { Router } from "express";
import {
  getEventOptions,
  getEventOptionById,
  getOptionsByEventId,
  createEventOption,
  updateEventOption,
  deleteEventOption
} from "./event-option.controller";

const router = Router();

// GET /api/event-options
router.get("/", getEventOptions);

// GET /api/event-options/by-event?event_id=<uuid>
router.get("/by-event", getOptionsByEventId);

// GET /api/event-options/:id
router.get("/:id", getEventOptionById);

// POST /api/event-options
router.post("/", createEventOption);

// PUT /api/event-options/:id
router.put("/:id", updateEventOption);

// DELETE /api/event-options/:id
router.delete("/:id", deleteEventOption);

export default router;
