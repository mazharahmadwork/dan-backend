export interface Vote {
  id: string;
  user_id: string;
  event_id: string;
  option_id: string;
  country_id: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface CreateVoteDTO {
  user_id: string;
  event_id: string;
  option_id: string;
  country_id: string;
  is_anonymous?: boolean;
}

export interface UpdateVoteDTO {
  is_anonymous?: boolean;
}

export interface EventOptionResult {
  option_id: string;
  name: string;
  description: string;
  count: number;
  percentage: number;
}

export type EventStatusTag = "upcoming" | "active" | "completed";

export interface EventResultsResponse {
  event_id: string;
  event_title: string;
  event_description: string;
  status: EventStatusTag;
  total_votes: number;
  options: EventOptionResult[];
}
