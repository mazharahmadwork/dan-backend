import type { OrganizationMember } from "../organization-members/organization-member.types";

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
}

/** Organization with total_members and members list */
export interface OrganizationWithMembers extends Organization {
  total_members: number;
  members: OrganizationMember[];
}

export interface CreateOrganizationDTO {
  name: string;
  owner_id: string;
  is_active?: boolean;
}

export interface UpdateOrganizationDTO {
  name?: string;
  owner_id?: string;
  is_active?: boolean;
}
