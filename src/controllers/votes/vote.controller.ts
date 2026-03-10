import { Request, Response } from "express";
import { DatabaseError } from "pg";
import { VoteService } from "./vote.service";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(s: unknown): s is string {
  return typeof s === "string" && UUID_REGEX.test(s);
}

export const getVotes = async (_req: Request, res: Response) => {
  try {
    const votes = await VoteService.getVotes();
    res.json(votes);
  } catch (error) {
    console.error("Error fetching votes:", error);
    res.status(500).json({ message: "Failed to fetch votes" });
  }
};

export const getVoteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const vote = await VoteService.getVoteById(id);

    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }

    res.json(vote);
  } catch (error) {
    console.error("Error fetching vote:", error);
    res.status(500).json({ message: "Failed to fetch vote" });
  }
};

export const getVotesByEventId = async (req: Request, res: Response) => {
  try {
    const event_id = req.query.event_id as string;
    if (!event_id) {
      return res.status(400).json({ message: "event_id query is required" });
    }
    const votes = await VoteService.getVotesByEventId(event_id);
    res.json(votes);
  } catch (error) {
    console.error("Error fetching votes by event:", error);
    res.status(500).json({ message: "Failed to fetch votes" });
  }
};

export const getVotesByUserId = async (req: Request, res: Response) => {
  try {
    const user_id = req.query.user_id as string;
    if (!user_id) {
      return res.status(400).json({ message: "user_id query is required" });
    }
    const votes = await VoteService.getVotesByUserId(user_id);
    res.json(votes);
  } catch (error) {
    console.error("Error fetching votes by user:", error);
    res.status(500).json({ message: "Failed to fetch votes" });
  }
};

export const getVotesByOptionId = async (req: Request, res: Response) => {
  try {
    const option_id = req.query.option_id as string;
    if (!option_id) {
      return res.status(400).json({ message: "option_id query is required" });
    }
    const votes = await VoteService.getVotesByOptionId(option_id);
    res.json(votes);
  } catch (error) {
    console.error("Error fetching votes by option:", error);
    res.status(500).json({ message: "Failed to fetch votes" });
  }
};

export const getEventResults = async (req: Request, res: Response) => {
  try {
    const event_id = req.query.event_id as string;
    if (!event_id) {
      return res.status(400).json({
        message: "event_id query is required"
      });
    }
    if (!isValidUUID(event_id)) {
      return res.status(400).json({
        message:
          "event_id must be a valid 36-character UUID (e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)."
      });
    }
    const results = await VoteService.getEventResults(event_id);
    res.json(results);
  } catch (error) {
    console.error("Error fetching event results:", error);
    res.status(500).json({ message: "Failed to fetch event results" });
  }
};

export const createVote = async (req: Request, res: Response) => {
  try {
    const { user_id, event_id, option_id, country_id, is_anonymous } =
      req.body;

    if (!user_id || !event_id || !option_id || !country_id) {
      return res.status(400).json({
        message:
          "user_id, event_id, option_id and country_id are required"
      });
    }

    const invalid: string[] = [];
    if (!isValidUUID(user_id)) invalid.push("user_id");
    if (!isValidUUID(event_id)) invalid.push("event_id");
    if (!isValidUUID(option_id)) invalid.push("option_id");
    if (invalid.length > 0) {
      return res.status(400).json({
        message: `Invalid UUID format. Check that these are valid 36-character UUIDs (e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx): ${invalid.join(", ")}.`,
        invalid_fields: invalid
      });
    }

    const vote = await VoteService.createVote({
      user_id,
      event_id,
      option_id,
      country_id,
      is_anonymous
    });
    res.status(201).json(vote);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_USER") {
        return res.status(400).json({
          message: "Invalid user_id. User does not exist."
        });
      }
      if (error.message === "INVALID_EVENT") {
        return res.status(400).json({
          message: "Invalid event_id. Event does not exist."
        });
      }
      if (error.message === "INVALID_OPTION") {
        return res.status(400).json({
          message: "Invalid option_id. Event option does not exist."
        });
      }
      if (error.message === "OPTION_NOT_FOR_EVENT") {
        return res.status(400).json({
          message: "option_id does not belong to the given event_id."
        });
      }
      if (error.message === "INVALID_COUNTRY") {
        return res.status(400).json({
          message: "Invalid country_id. Country does not exist."
        });
      }
      if (error.message === "ALREADY_VOTED") {
        return res.status(409).json({
          message: "User has already voted for this option in this event."
        });
      }
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return res.status(400).json({
        message:
          "Invalid user_id, event_id, option_id or country_id. Referenced record does not exist."
      });
    }
    if (error instanceof DatabaseError && error.code === "23505") {
      return res.status(409).json({
        message: "User has already voted for this option in this event."
      });
    }
    if (error instanceof DatabaseError && error.code === "42P01") {
      return res.status(500).json({
        message: "Votes table not found. Run the CREATE TABLE from queries.txt."
      });
    }
    // Invalid UUID or other DB/validation errors (e.g. 22P02 invalid text for UUID)
    if (error instanceof DatabaseError && error.code === "22P02") {
      return res.status(400).json({
        message:
          "Invalid UUID format in user_id, event_id or option_id. Check that all IDs are valid 36-character UUIDs."
      });
    }
    console.error("Error creating vote:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create vote";
    res.status(500).json({ message: "Failed to create vote", error: message });
  }
};

export const updateVote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { is_anonymous } = req.body;

    const updated = await VoteService.updateVote(id, { is_anonymous });

    if (!updated) {
      return res.status(404).json({ message: "Vote not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating vote:", error);
    res.status(500).json({ message: "Failed to update vote" });
  }
};

export const deleteVote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const deleted = await VoteService.deleteVote(id);

    if (!deleted) {
      return res.status(404).json({ message: "Vote not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting vote:", error);
    res.status(500).json({ message: "Failed to delete vote" });
  }
};
