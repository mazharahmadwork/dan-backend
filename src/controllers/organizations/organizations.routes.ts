import { Router } from "express";
import {
  getOrganizations,
  getOrganizationById,
  getOrganizationByIdWithMembers,
  getOrganizationsByOwnerId,
  createOrganization,
  updateOrganization,
  deleteOrganization
} from "./organizations.controller";

const router = Router();

// GET /api/organizations
router.get("/", getOrganizations);

// GET /api/organizations/by-owner?owner_id=<user-uuid>
router.get("/by-owner", getOrganizationsByOwnerId);

// GET /api/organizations/by-organization-id/:id (organization + total_members + members)
router.get("/by-organization-id/:id", getOrganizationByIdWithMembers);

// GET /api/organizations/:id
router.get("/:id", getOrganizationById);

// POST /api/organizations
router.post("/", createOrganization);

// PUT /api/organizations/:id
router.put("/:id", updateOrganization);

// DELETE /api/organizations/:id
router.delete("/:id", deleteOrganization);

export default router;
