export interface EventOption {
  id: string;
  event_id: string;
  name: string;
  description: string;
}

export interface CreateEventOptionDTO {
  event_id: string;
  name: string;
  description?: string;
}

export interface UpdateEventOptionDTO {
  name?: string;
  description?: string;
}
