export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
}

export interface CreateOrganizationMemberDTO {
  organization_id: string;
  user_id: string;
  role: string;
}

export interface UpdateOrganizationMemberDTO {
  role?: string;
}
