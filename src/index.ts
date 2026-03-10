// import "dotenv/config";
// import healthRoutes from "./routes/health.routes";
import userRoutes from "./controllers/users/user.routes";
import countryRoutes from "./controllers/countries/country.routes";
import categoryRoutes from "./controllers/categories/categories.routes";
import organizationRoutes from "./controllers/organizations/organizations.routes";
import organizationMemberRoutes from "./controllers/organization-members/organization-member.routes";
import eventRoutes from "./controllers/events/events.routes";
import eventInvitationRoutes from "./controllers/event-invitations/event-invitation.routes";
import eventOptionRoutes from "./controllers/event-options/event-option.routes";
import voteRoutes from "./controllers/votes/vote.routes";
import authRoutes from "./controllers/auth/auth.routes";
import app from "./app";
// Initialize database connection
import "./db";
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
