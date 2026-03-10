import { Router } from "express";
import {
  getVotes,
  getVoteById,
  getVotesByEventId,
  getVotesByUserId,
  getVotesByOptionId,
  getEventResults,
  createVote,
  updateVote,
  deleteVote
} from "./vote.controller";

const router = Router();

// GET /api/votes
router.get("/", getVotes);

// GET /api/votes/by-event?event_id=<uuid>
router.get("/by-event", getVotesByEventId);

// GET /api/votes/by-user?user_id=<uuid>
router.get("/by-user", getVotesByUserId);

// GET /api/votes/by-option?option_id=<uuid>
router.get("/by-option", getVotesByOptionId);

// GET /api/votes/event-results?event_id=<uuid>
router.get("/event-results", getEventResults);

// GET /api/votes/:id
router.get("/:id", getVoteById);

// POST /api/votes
router.post("/", createVote);

// PUT /api/votes/:id
router.put("/:id", updateVote);

// DELETE /api/votes/:id
router.delete("/:id", deleteVote);

export default router;
