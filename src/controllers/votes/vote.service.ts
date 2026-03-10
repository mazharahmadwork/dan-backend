import { randomUUID } from "crypto";
import {
  Vote,
  CreateVoteDTO,
  UpdateVoteDTO,
  EventResultsResponse
} from "./vote.types";
import { VoteModel } from "./vote.model";
import { UserModel } from "../users/user.model";
import { EventModel } from "../events/events.model";
import { EventOptionModel } from "../event-options/event-option.model";
import { CountryModel } from "../countries/country.model";

export const VoteService = {
  async getVotes(): Promise<Vote[]> {
    return VoteModel.findAll();
  },

  async getVoteById(id: string): Promise<Vote | null> {
    return VoteModel.findById(id);
  },

  async getVotesByEventId(event_id: string): Promise<Vote[]> {
    return VoteModel.findByEventId(event_id);
  },

  async getVotesByUserId(user_id: string): Promise<Vote[]> {
    return VoteModel.findByUserId(user_id);
  },

  async getVotesByOptionId(option_id: string): Promise<Vote[]> {
    return VoteModel.findByOptionId(option_id);
  },

  async getEventResults(event_id: string): Promise<EventResultsResponse> {
    const [event, options, votes] = await Promise.all([
      EventModel.findById(event_id),
      EventOptionModel.findByEventId(event_id),
      VoteModel.findByEventId(event_id)
    ]);

    const now = new Date();
    let status: EventResultsResponse["status"] = "active";
    let event_title = "";
    let event_description = "";
    if (event) {
      const end = new Date(event.end_date);
      const start = new Date(event.start_date);
      if (end < now) status = "completed";
      else if (start > now) status = "upcoming";
      event_title = event.title;
      event_description = event.description;
    }

    const total_votes = votes.length;
    const countByOptionId: Record<string, number> = {};
    for (const v of votes) {
      countByOptionId[v.option_id] = (countByOptionId[v.option_id] ?? 0) + 1;
    }

    const optionsList: EventResultsResponse["options"] = options.map(
      (opt) => {
        const count = countByOptionId[opt.id] ?? 0;
        const percentage =
          total_votes > 0 ? Math.round((count / total_votes) * 10000) / 100 : 0;
        return {
          option_id: opt.id,
          name: opt.name,
          description: opt.description ?? "",
          count,
          percentage
        };
      }
    );

    return {
      event_id,
      event_title,
      event_description,
      status,
      total_votes,
      options: optionsList
    };
  },

  async createVote(data: CreateVoteDTO): Promise<Vote> {
    const user = await UserModel.findById(data.user_id);
    if (!user) {
      throw new Error("INVALID_USER");
    }

    const event = await EventModel.findById(data.event_id);
    if (!event) {
      throw new Error("INVALID_EVENT");
    }

    const option = await EventOptionModel.findById(data.option_id);
    if (!option) {
      throw new Error("INVALID_OPTION");
    }
    if (option.event_id !== data.event_id) {
      throw new Error("OPTION_NOT_FOR_EVENT");
    }

    const country = await CountryModel.findById(data.country_id);
    if (!country) {
      throw new Error("INVALID_COUNTRY");
    }

    const existing = await VoteModel.findByUserAndEventAndOption(
      data.user_id,
      data.event_id,
      data.option_id
    );
    if (existing) {
      throw new Error("ALREADY_VOTED");
    }

    const vote: Vote = {
      id: randomUUID(),
      user_id: data.user_id,
      event_id: data.event_id,
      option_id: data.option_id,
      country_id: data.country_id,
      is_anonymous: data.is_anonymous ?? false,
      created_at: new Date().toISOString()
    };

    return VoteModel.create(vote);
  },

  async updateVote(id: string, data: UpdateVoteDTO): Promise<Vote | null> {
    const existing = await VoteModel.findById(id);
    if (!existing) return null;

    const updated: Vote = {
      ...existing,
      is_anonymous:
        data.is_anonymous !== undefined ? data.is_anonymous : existing.is_anonymous
    };

    return VoteModel.update(id, updated);
  },

  async deleteVote(id: string): Promise<boolean> {
    return VoteModel.delete(id);
  }
};
