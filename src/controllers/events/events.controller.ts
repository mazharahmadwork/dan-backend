import { Request, Response } from "express";
import { DatabaseError } from "pg";
import { EventService } from "./events.service";

export const getEvents = async (_req: Request, res: Response) => {
  try {
    const events = await EventService.getEvents();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const getHeroEvents = async (_req: Request, res: Response) => {
  try {
    const events = await EventService.getHeroEvents();
    res.json(events);
  } catch (error) {
    console.error("Error fetching hero events:", error);
    res.status(500).json({ message: "Failed to fetch hero events" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const event = await EventService.getEventById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
};

export const getEventsByStatus = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as
      | "upcoming"
      | "active"
      | "completed"
      | undefined;

    if (!status || !["upcoming", "active", "completed"].includes(status)) {
      return res.status(400).json({
        message:
          "status query is required and must be one of upcoming, active, completed"
      });
    }

    const events = await EventService.getEventsByStatus(status);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events by status:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const getEventsByCategoryId = async (req: Request, res: Response) => {
  try {
    const category_id = req.query.category_id as string;
    if (!category_id) {
      return res.status(400).json({ message: "category_id query is required" });
    }
    const events = await EventService.getEventsByCategoryId(category_id);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events by category:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const getActiveEventsByCategoryId = async (
  req: Request,
  res: Response
) => {
  try {
    const category_id = req.query.category_id as string;
    if (!category_id) {
      return res
        .status(400)
        .json({ message: "category_id query is required" });
    }
    const events = await EventService.getEventsByCategoryAndStatus(
      category_id,
      "active"
    );
    res.json(events);
  } catch (error) {
    console.error("Error fetching active events by category:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const getUpcomingEventsByCategoryId = async (
  req: Request,
  res: Response
) => {
  try {
    const category_id = req.query.category_id as string;
    if (!category_id) {
      return res
        .status(400)
        .json({ message: "category_id query is required" });
    }
    const events = await EventService.getEventsByCategoryAndStatus(
      category_id,
      "upcoming"
    );
    res.json(events);
  } catch (error) {
    console.error("Error fetching upcoming events by category:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const getCompletedEventsByCategoryId = async (
  req: Request,
  res: Response
) => {
  try {
    const category_id = req.query.category_id as string;
    if (!category_id) {
      return res
        .status(400)
        .json({ message: "category_id query is required" });
    }
    const events = await EventService.getEventsByCategoryAndStatus(
      category_id,
      "completed"
    );
    res.json(events);
  } catch (error) {
    console.error("Error fetching completed events by category:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const getEventsByCreatedBy = async (req: Request, res: Response) => {
  try {
    const created_by = req.query.created_by as string;
    if (!created_by) {
      return res.status(400).json({ message: "created_by query is required" });
    }
    const events = await EventService.getEventsByCreatedBy(created_by);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events by creator:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      event_type,
      is_public,
      is_white_label,
      category_id,
      created_by,
      start_date,
      end_date
    } = req.body;

    if (
      !title ||
      !event_type ||
      !category_id ||
      !created_by ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({
        message:
          "title, event_type, category_id, created_by, start_date and end_date are required"
      });
    }

    const event = await EventService.createEvent({
      title,
      description,
      event_type,
      is_public,
      is_white_label,
      category_id,
      created_by,
      start_date,
      end_date
    });
    res.status(201).json(event);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CATEGORY") {
        return res.status(400).json({
          message: "Invalid category_id. Category does not exist."
        });
      }
      if (error.message === "INVALID_CREATED_BY") {
        return res.status(400).json({
          message: "Invalid created_by. User does not exist."
        });
      }
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(400).json({
        message: "Invalid category_id or created_by. Category or user does not exist."
      });
    }
    if (error instanceof DatabaseError && error.code === "42P01") {
      return res.status(500).json({
        message: "Events table not found. Run the CREATE TABLE from queries.txt."
      });
    }
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const {
      title,
      description,
      event_type,
      is_public,
      is_white_label,
      category_id,
      start_date,
      end_date
    } = req.body;

    const updated = await EventService.updateEvent(id, {
      title,
      description,
      event_type,
      is_public,
      is_white_label,
      category_id,
      start_date,
      end_date
    });

    if (!updated) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CATEGORY") {
        return res.status(400).json({
          message: "Invalid category_id. Category does not exist."
        });
      }
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(400).json({
        message: "Invalid category_id. Category does not exist."
      });
    }
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await EventService.deleteEvent(id);

    if (!deleted) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};
