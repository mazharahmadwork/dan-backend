export interface EventInvitation {
  id: string;
  event_id: string;
  email: string;
  invite_token: string;
  status: string;
  created_at: string;
}

export interface CreateEventInvitationDTO {
  event_id: string;
  email: string;
  status?: string;
}

export interface UpdateEventInvitationDTO {
  status?: string;
}
