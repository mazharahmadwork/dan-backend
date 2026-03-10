import { randomUUID } from "crypto";
import {
  Organization,
  OrganizationWithMembers,
  CreateOrganizationDTO,
  UpdateOrganizationDTO
} from "./organizations.types";
import { OrganizationModel } from "./organizations.model";
import { UserModel } from "../users/user.model";
import { OrganizationMemberModel } from "../organization-members/organization-member.model";

export const OrganizationService = {
  async getOrganizations(): Promise<Organization[]> {
    return OrganizationModel.findAll();
  },

  async getOrganizationById(id: string): Promise<Organization | null> {
    return OrganizationModel.findById(id);
  },

  async getOrganizationByIdWithMembers(
    id: string
  ): Promise<OrganizationWithMembers | null> {
    const organization = await OrganizationModel.findById(id);
    if (!organization) return null;

    const members = await OrganizationMemberModel.findByOrganizationId(id);
    return {
      ...organization,
      total_members: members.length,
      members
    };
  },

  async getOrganizationsByOwnerId(owner_id: string): Promise<Organization[]> {
    return OrganizationModel.findByOwnerId(owner_id);
  },

  async createOrganization(data: CreateOrganizationDTO): Promise<Organization> {
    const owner = await UserModel.findById(data.owner_id);
    if (!owner) {
      throw new Error("INVALID_OWNER");
    }

    const organization: Organization = {
      id: randomUUID(),
      name: data.name,
      owner_id: data.owner_id,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString()
    };

    return OrganizationModel.create(organization);
  },

  async updateOrganization(
    id: string,
    data: UpdateOrganizationDTO
  ): Promise<Organization | null> {
    const existing = await OrganizationModel.findById(id);
    if (!existing) {
      return null;
    }

    if (data.owner_id != null && data.owner_id !== existing.owner_id) {
      const owner = await UserModel.findById(data.owner_id);
      if (!owner) {
        throw new Error("INVALID_OWNER");
      }
    }

    const updated: Organization = {
      ...existing,
      name: data.name ?? existing.name,
      owner_id: data.owner_id ?? existing.owner_id,
      is_active: data.is_active !== undefined ? data.is_active : existing.is_active
    };

    return OrganizationModel.update(id, updated);
  },

  async deleteOrganization(id: string): Promise<boolean> {
    return OrganizationModel.delete(id);
  }
};
