import { Router } from "express";
import {
  getEvents,
  getEventById,
  getEventDetailById,
  getEventVotesByCountry,
  getHeroEvents,
  getEventsByCategoryId,
  getActiveEventsByCategoryId,
  getUpcomingEventsByCategoryId,
  getCompletedEventsByCategoryId,
  getEventsByCreatedBy,
  getEventsByStatus,
  createEvent,
  updateEvent,
  deleteEvent
} from "./events.controller";

const router = Router();

// GET /api/events
router.get("/", getEvents);

// GET /api/events/hero – latest 3 active events
router.get("/hero", getHeroEvents);

// GET /api/events/by-status?status=upcoming|active|completed
router.get("/by-status", getEventsByStatus);

// GET /api/events/by-category?category_id=<uuid>
router.get("/by-category", getEventsByCategoryId);

// GET /api/events/by-category-active?category_id=<uuid>
router.get("/by-category-active", getActiveEventsByCategoryId);

// GET /api/events/by-category-upcoming?category_id=<uuid>
router.get("/by-category-upcoming", getUpcomingEventsByCategoryId);

// GET /api/events/by-category-completed?category_id=<uuid>
router.get("/by-category-completed", getCompletedEventsByCategoryId);

// GET /api/events/by-created-by?created_by=<user-uuid>
router.get("/by-created-by", getEventsByCreatedBy);

// GET /api/events/event-detail/:id
router.get("/event-detail/:id", getEventDetailById);

// GET /api/events/event-detail/by-country/:id
router.get("/event-detail/by-country/:id", getEventVotesByCountry);

// GET /api/events/:id
router.get("/:id", getEventById);

// POST /api/events
router.post("/", createEvent);

// PUT /api/events/:id
router.put("/:id", updateEvent);

// DELETE /api/events/:id
router.delete("/:id", deleteEvent);

export default router;
