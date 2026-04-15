import { randomUUID } from "crypto";
import {
  Event,
  EventWithCategoryName,
  EventDetailResponse,
  EventOptionWithVotes,
  EventVotesByCountry,
  EventStatus,
  CreateEventDTO,
  UpdateEventDTO
} from "./events.types";
import { EventModel } from "./events.model";
import { CategoryModel } from "../categories/categories.model";
import { UserModel } from "../users/user.model";
import { EventOptionModel } from "../event-options/event-option.model";
import { VoteModel } from "../votes/vote.model";
import pool from "../../db";

function getEventStatus(event: Event): EventStatus {
  const now = new Date();
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);

  if (end < now) {
    return "completed";
  }

  if (start > now) {
    return "upcoming";
  }

  return "active";
}

async function withCategoryName(event: Event): Promise<EventWithCategoryName> {
  const category = await CategoryModel.findById(event.category_id);
  return {
    ...event,
    category_name: category?.name ?? "",
    status: getEventStatus(event)
  };
}

async function withCategoryNames(
  events: Event[]
): Promise<EventWithCategoryName[]> {
  if (events.length === 0) return [];
  const categoryIds = [...new Set(events.map((e) => e.category_id))];
  const categories = await Promise.all(
    categoryIds.map((id) => CategoryModel.findById(id))
  );
  const nameByCategoryId = Object.fromEntries(
    categoryIds.map((id, i) => [id, categories[i]?.name ?? ""])
  );
  return events.map((event) => ({
    ...event,
    category_name: nameByCategoryId[event.category_id] ?? "",
    status: getEventStatus(event)
  }));
}

export const EventService = {
  async getEvents(): Promise<EventWithCategoryName[]> {
    const events = await EventModel.findAll();
    return withCategoryNames(events);
  },

  async getHeroEvents(): Promise<EventWithCategoryName[]> {
    const active = await EventService.getEventsByStatus("active");
    return [...active]
      .sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )
      .slice(0, 3);
  },

  async getEventsByStatus(
    status: EventStatus
  ): Promise<EventWithCategoryName[]> {
    const events = await EventModel.findAll();
    const withNamesAndStatus = await withCategoryNames(events);
    return withNamesAndStatus.filter((event) => event.status === status);
  },

  async getEventById(id: string): Promise<EventWithCategoryName | null> {
    const event = await EventModel.findById(id);
    if (!event) return null;
    return withCategoryName(event);
  },

  async getEventDetailById(id: string): Promise<EventDetailResponse | null> {
    const event = await EventService.getEventById(id);
    if (!event) return null;

    const [options, votes, aggregateResult] = await Promise.all([
      EventOptionModel.findByEventId(id),
      VoteModel.findByEventId(id),
      pool.query<{
        country_participated_total: string;
        avg_age: string | null;
      }>(
        `SELECT
           COUNT(DISTINCT v.country_id)::text AS country_participated_total,
           ROUND(AVG(DATE_PART('year', AGE(CURRENT_DATE, u.date_of_birth)))::numeric, 2)::text AS avg_age
         FROM votes v
         JOIN users u ON u.id = v.user_id
         WHERE v.event_id = $1`,
        [id]
      )
    ]);

    const votesByOptionId = votes.reduce<Record<string, number>>((acc, vote) => {
      acc[vote.option_id] = (acc[vote.option_id] ?? 0) + 1;
      return acc;
    }, {});

    const optionsWithVotes: EventOptionWithVotes[] = options.map((option) => ({
      ...option,
      votes_count: votesByOptionId[option.id] ?? 0
    }));

    const aggregate = aggregateResult.rows[0];
    return {
      ...event,
      options: optionsWithVotes,
      total_votes_cast: votes.length,
      country_participated_total: Number(
        aggregate?.country_participated_total ?? "0"
      ),
      avg_age: aggregate?.avg_age != null ? Number(aggregate.avg_age) : null
    };
  },

  async getEventVotesByCountry(id: string): Promise<EventVotesByCountry[] | null> {
    const event = await EventModel.findById(id);
    if (!event) return null;

    const [optionsResult, matrixResult, globalResult] = await Promise.all([
      pool.query<{ option_id: string; option_name: string }>(
        `SELECT id AS option_id, name AS option_name
         FROM event_options
         WHERE event_id = $1
         ORDER BY name`,
        [id]
      ),
      pool.query<{
        country_id: string;
        country_name: string;
        option_id: string;
        votes_count: string;
      }>(
        `SELECT
           c.id AS country_id,
           c.name AS country_name,
           eo.id AS option_id,
           COUNT(v.id)::text AS votes_count
         FROM (
           SELECT DISTINCT country_id
           FROM votes
           WHERE event_id = $1
         ) vc
         JOIN countries c ON c.id = vc.country_id
         CROSS JOIN event_options eo
         LEFT JOIN votes v
           ON v.event_id = $1
          AND v.country_id = c.id
          AND v.option_id = eo.id
         WHERE eo.event_id = $1
         GROUP BY c.id, c.name, eo.id
         ORDER BY c.name, eo.id`,
        [id]
      ),
      pool.query<{
        option_id: string;
        votes_count: string;
      }>(
        `SELECT
           eo.id AS option_id,
           COUNT(v.id)::text AS votes_count
         FROM event_options eo
         LEFT JOIN votes v
           ON v.event_id = $1
          AND v.option_id = eo.id
         WHERE eo.event_id = $1
         GROUP BY eo.id
         ORDER BY eo.id`,
        [id]
      )
    ]);

    const optionsById = Object.fromEntries(
      optionsResult.rows.map((row) => [row.option_id, row.option_name])
    );

    const grouped = new Map<string, EventVotesByCountry>();
    for (const row of matrixResult.rows) {
      if (!grouped.has(row.country_id)) {
        grouped.set(row.country_id, {
          country_id: row.country_id,
          country_name: row.country_name,
          options: []
        });
      }
      grouped.get(row.country_id)!.options.push({
        option_id: row.option_id,
        option_name: optionsById[row.option_id] ?? row.option_id,
        votes_count: Number(row.votes_count)
      });
    }

    const globalOptions = globalResult.rows.map((row) => ({
      option_id: row.option_id,
      option_name: optionsById[row.option_id] ?? row.option_id,
      votes_count: Number(row.votes_count)
    }));

    return [
      {
        country_id: "global",
        country_name: "Global",
        options: globalOptions
      },
      ...grouped.values()
    ];
  },

  async getEventsByCategoryId(
    category_id: string
  ): Promise<EventWithCategoryName[]> {
    const events = await EventModel.findByCategoryId(category_id);
    return withCategoryNames(events);
  },

  async getEventsByCategoryAndStatus(
    category_id: string,
    status: EventStatus
  ): Promise<EventWithCategoryName[]> {
    const events = await EventModel.findByCategoryId(category_id);
    const withNamesAndStatus = await withCategoryNames(events);
    return withNamesAndStatus.filter((event) => event.status === status);
  },

  async getEventsByCreatedBy(
    created_by: string
  ): Promise<EventWithCategoryName[]> {
    const events = await EventModel.findByCreatedBy(created_by);
    return withCategoryNames(events);
  },

  async createEvent(data: CreateEventDTO): Promise<EventWithCategoryName> {
    const category = await CategoryModel.findById(data.category_id);
    if (!category) {
      throw new Error("INVALID_CATEGORY");
    }

    const creator = await UserModel.findById(data.created_by);
    if (!creator) {
      throw new Error("INVALID_CREATED_BY");
    }

    const event: Event = {
      id: randomUUID(),
      title: data.title,
      description: data.description ?? "",
      event_type: data.event_type,
      is_public: data.is_public ?? false,
      is_white_label: data.is_white_label ?? false,
      category_id: data.category_id,
      created_by: data.created_by,
      start_date: data.start_date,
      end_date: data.end_date,
      created_at: new Date().toISOString()
    };

    const created = await EventModel.create(event);
    return withCategoryName(created);
  },

  async updateEvent(
    id: string,
    data: UpdateEventDTO
  ): Promise<EventWithCategoryName | null> {
    const existing = await EventModel.findById(id);
    if (!existing) return null;

    if (data.category_id != null && data.category_id !== existing.category_id) {
      const category = await CategoryModel.findById(data.category_id);
      if (!category) {
        throw new Error("INVALID_CATEGORY");
      }
    }

    const updated: Event = {
      ...existing,
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      event_type: data.event_type ?? existing.event_type,
      is_public: data.is_public !== undefined ? data.is_public : existing.is_public,
      is_white_label:
        data.is_white_label !== undefined
          ? data.is_white_label
          : existing.is_white_label,
      category_id: data.category_id ?? existing.category_id,
      start_date: data.start_date ?? existing.start_date,
      end_date: data.end_date ?? existing.end_date
    };

    const result = await EventModel.update(id, updated);
    if (!result) return null;
    return withCategoryName(result);
  },

  async deleteEvent(id: string): Promise<boolean> {
    return EventModel.delete(id);
  }
};
