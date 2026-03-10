// import "dotenv/config";
// import healthRoutes from "./src/routes/health.routes";
import userRoutes from "./src/controllers/users/user.routes";
import countryRoutes from "./src/controllers/countries/country.routes";
import categoryRoutes from "./src/controllers/categories/categories.routes";
import organizationRoutes from "./src/controllers/organizations/organizations.routes";
import organizationMemberRoutes from "./src/controllers/organization-members/organization-member.routes";
import eventRoutes from "./src/controllers/events/events.routes";
import eventInvitationRoutes from "./src/controllers/event-invitations/event-invitation.routes";
import eventOptionRoutes from "./src/controllers/event-options/event-option.routes";
import voteRoutes from "./src/controllers/votes/vote.routes";
import authRoutes from "./src/controllers/auth/auth.routes";
import app from "./src/app";
// Initialize database connection
import "./src/db";
const PORT = process.env.PORT || 3000;

// Routes
app.use("/api/users", userRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/organization-members", organizationMemberRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/event-invitations", eventInvitationRoutes);
app.use("/api/event-options", eventOptionRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/auth", authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
