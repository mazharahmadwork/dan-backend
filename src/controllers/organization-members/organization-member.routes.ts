import { Router } from "express";
import {
  getOrganizationMembers,
  getOrganizationMemberById,
  getMembersByOrganizationId,
  getMembersByUserId,
  createOrganizationMember,
  updateOrganizationMember,
  deleteOrganizationMember
} from "./organization-member.controller";

const router = Router();

// GET /api/organization-members
router.get("/", getOrganizationMembers);

// GET /api/organization-members/by-organization?organization_id=<uuid>
router.get("/by-organization", getMembersByOrganizationId);

// GET /api/organization-members/by-user?user_id=<uuid>
router.get("/by-user", getMembersByUserId);

// GET /api/organization-members/:id
router.get("/:id", getOrganizationMemberById);

// POST /api/organization-members
router.post("/", createOrganizationMember);

// PUT /api/organization-members/:id
router.put("/:id", updateOrganizationMember);

// DELETE /api/organization-members/:id
router.delete("/:id", deleteOrganizationMember);

export default router;
