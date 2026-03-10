import { randomUUID } from "crypto";
import {
  Event,
  EventWithCategoryName,
  EventStatus,
  CreateEventDTO,
  UpdateEventDTO
} from "./events.types";
import { EventModel } from "./events.model";
import { CategoryModel } from "../categories/categories.model";
import { UserModel } from "../users/user.model";

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
