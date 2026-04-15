export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  is_public: boolean;
  is_white_label: boolean;
  category_id: string;
  created_by: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

/** Event with category name included (for API responses) */
export type EventStatus = "upcoming" | "active" | "completed";

export interface EventWithCategoryName extends Event {
  category_name: string;
  status: EventStatus;
}

export interface CreateEventDTO {
  title: string;
  description?: string;
  event_type: string;
  is_public?: boolean;
  is_white_label?: boolean;
  category_id: string;
  created_by: string;
  start_date: string;
  end_date: string;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  event_type?: string;
  is_public?: boolean;
  is_white_label?: boolean;
  category_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface EventOptionWithVotes {
  id: string;
  event_id: string;
  name: string;
  description: string;
  votes_count: number;
}

export interface EventDetailResponse extends EventWithCategoryName {
  options: EventOptionWithVotes[];
  total_votes_cast: number;
  country_participated_total: number;
  avg_age: number | null;
}

export interface CountryOptionVoteCount {
  option_id: string;
  option_name: string;
  votes_count: number;
}

export interface EventVotesByCountry {
  country_id: string;
  country_name: string;
  options: CountryOptionVoteCount[];
}
