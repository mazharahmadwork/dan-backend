import { randomUUID } from "crypto";
import {
  EventOption,
  CreateEventOptionDTO,
  UpdateEventOptionDTO
} from "./event-option.types";
import { EventOptionModel } from "./event-option.model";
import { EventModel } from "../events/events.model";

export const EventOptionService = {
  async getEventOptions(): Promise<EventOption[]> {
    return EventOptionModel.findAll();
  },

  async getEventOptionById(id: string): Promise<EventOption | null> {
    return EventOptionModel.findById(id);
  },

  async getOptionsByEventId(event_id: string): Promise<EventOption[]> {
    return EventOptionModel.findByEventId(event_id);
  },

  async createEventOption(data: CreateEventOptionDTO): Promise<EventOption> {
    const event = await EventModel.findById(data.event_id);
    if (!event) {
      throw new Error("INVALID_EVENT");
    }

    const option: EventOption = {
      id: randomUUID(),
      event_id: data.event_id,
      name: data.name,
      description: data.description ?? ""
    };

    return EventOptionModel.create(option);
  },

  async updateEventOption(
    id: string,
    data: UpdateEventOptionDTO
  ): Promise<EventOption | null> {
    const existing = await EventOptionModel.findById(id);
    if (!existing) return null;

    const updated: EventOption = {
      ...existing,
      name: data.name ?? existing.name,
      description: data.description ?? existing.description
    };

    return EventOptionModel.update(id, updated);
  },

  async deleteEventOption(id: string): Promise<boolean> {
    return EventOptionModel.delete(id);
  }
};
