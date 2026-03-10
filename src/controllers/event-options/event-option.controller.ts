import { Request, Response } from "express";
import { DatabaseError } from "pg";
import { EventOptionService } from "./event-option.service";

export const getEventOptions = async (_req: Request, res: Response) => {
  try {
    const options = await EventOptionService.getEventOptions();
    res.json(options);
  } catch (error) {
    console.error("Error fetching event options:", error);
    res.status(500).json({ message: "Failed to fetch event options" });
  }
};

export const getEventOptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const option = await EventOptionService.getEventOptionById(id);

    if (!option) {
      return res.status(404).json({ message: "Event option not found" });
    }

    res.json(option);
  } catch (error) {
    console.error("Error fetching event option:", error);
    res.status(500).json({ message: "Failed to fetch event option" });
  }
};

export const getOptionsByEventId = async (req: Request, res: Response) => {
  try {
    const event_id = req.query.event_id as string;
    if (!event_id) {
      return res.status(400).json({ message: "event_id query is required" });
    }
    const options = await EventOptionService.getOptionsByEventId(event_id);
    res.json(options);
  } catch (error) {
    console.error("Error fetching event options by event:", error);
    res.status(500).json({ message: "Failed to fetch event options" });
  }
};

export const createEventOption = async (req: Request, res: Response) => {
  try {
    const { event_id, name, description } = req.body;

    if (!event_id || !name) {
      return res.status(400).json({
        message: "event_id and name are required"
      });
    }

    const option = await EventOptionService.createEventOption({
      event_id,
      name,
      description
    });
    res.status(201).json(option);
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
          "Event options table not found. Run the CREATE TABLE from queries.txt."
      });
    }
    console.error("Error creating event option:", error);
    res.status(500).json({ message: "Failed to create event option" });
  }
};

export const updateEventOption = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, description } = req.body;

    const updated = await EventOptionService.updateEventOption(id, {
      name,
      description
    });

    if (!updated) {
      return res.status(404).json({ message: "Event option not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating event option:", error);
    res.status(500).json({ message: "Failed to update event option" });
  }
};

export const deleteEventOption = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await EventOptionService.deleteEventOption(id);

    if (!deleted) {
      return res.status(404).json({ message: "Event option not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting event option:", error);
    res.status(500).json({ message: "Failed to delete event option" });
  }
};
