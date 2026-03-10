import { randomUUID } from "crypto";
import {
  OrganizationMember,
  CreateOrganizationMemberDTO,
  UpdateOrganizationMemberDTO
} from "./organization-member.types";
import { OrganizationMemberModel } from "./organization-member.model";
import { OrganizationModel } from "../organizations/organizations.model";
import { UserModel } from "../users/user.model";

export const OrganizationMemberService = {
  async getOrganizationMembers(): Promise<OrganizationMember[]> {
    return OrganizationMemberModel.findAll();
  },

  async getOrganizationMemberById(
    id: string
  ): Promise<OrganizationMember | null> {
    return OrganizationMemberModel.findById(id);
  },

  async getMembersByOrganizationId(
    organization_id: string
  ): Promise<OrganizationMember[]> {
    return OrganizationMemberModel.findByOrganizationId(organization_id);
  },

  async getMembersByUserId(user_id: string): Promise<OrganizationMember[]> {
    return OrganizationMemberModel.findByUserId(user_id);
  },

  async createOrganizationMember(
    data: CreateOrganizationMemberDTO
  ): Promise<OrganizationMember> {
    const organization = await OrganizationModel.findById(data.organization_id);
    if (!organization) {
      throw new Error("INVALID_ORGANIZATION");
    }

    const user = await UserModel.findById(data.user_id);
    if (!user) {
      throw new Error("INVALID_USER");
    }

    const existing = await OrganizationMemberModel.findByOrganizationAndUser(
      data.organization_id,
      data.user_id
    );
    if (existing) {
      throw new Error("ALREADY_MEMBER");
    }

    const member: OrganizationMember = {
      id: randomUUID(),
      organization_id: data.organization_id,
      user_id: data.user_id,
      role: data.role
    };

    return OrganizationMemberModel.create(member);
  },

  async updateOrganizationMember(
    id: string,
    data: UpdateOrganizationMemberDTO
  ): Promise<OrganizationMember | null> {
    const existing = await OrganizationMemberModel.findById(id);
    if (!existing) {
      return null;
    }

    const updated: OrganizationMember = {
      ...existing,
      role: data.role ?? existing.role
    };

    return OrganizationMemberModel.update(id, updated);
  },

  async deleteOrganizationMember(id: string): Promise<boolean> {
    return OrganizationMemberModel.delete(id);
  }
};
