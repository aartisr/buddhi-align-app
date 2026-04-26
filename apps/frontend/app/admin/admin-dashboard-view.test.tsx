import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { profileAdminSpy } = vi.hoisted(() => ({
  profileAdminSpy: vi.fn(),
}));

vi.mock("@aartisr/autograph-feature/profile-components", () => ({
  AutographProfileAdminPanel: (props: Record<string, unknown>) => {
    profileAdminSpy(props);
    return <section data-testid="profile-admin-panel" />;
  },
}));

vi.mock("./AutographDiagnosticsPanel", () => ({
  default: () => <article data-testid="diagnostics-panel" />,
}));

import AdminDashboardView from "./AdminDashboardView";

const incident = {
  id: "incident-1",
  title: "Review auth denials",
  severity: "warning" as const,
  status: "open",
  createdAt: "2026-04-25T12:00:00.000Z",
};

function makeProps() {
  return {
    actorUserId: "admin-1",
    reliabilityScore: 88,
    errorBudgetRemaining: 88,
    activeExperiments: 1,
    totalCount: 24,
    observabilitySummary: {
      last24hEvents: 7,
      authDenials24h: 2,
      importIssues24h: 0,
      personalizationIssues24h: 1,
      weeklyAuthDenials: [{ day: "04/25", count: 2 }],
      weeklyImportIssues: [{ day: "04/25", count: 0 }],
      alerts: [
        {
          key: "auth-denial-spike",
          level: "critical" as const,
          category: "auth" as const,
          title: "Auth denial spike",
          detail: "2 auth denials in the last 24h.",
          owner: "Identity",
          runbook: "RB-OBS-AUTH-01",
        },
      ],
    },
    autoCreatedIncidents: [],
    errorLog: [],
    supportReports: [
      {
        id: "support-row-1",
        reportId: "BA-SUP-20260426-ABC12345",
        createdAt: "2026-04-26T12:00:00.000Z",
        updatedAt: "2026-04-26T12:00:00.000Z",
        status: "new" as const,
        category: "bug" as const,
        severity: "normal" as const,
        title: "Profile photo upload fails",
        pageUrl: "/profiles",
        tryingToDo: "Upload a profile photo.",
        actualBehavior: "The upload failed.",
        reproducibility: "always" as const,
        consentToDiagnostics: true,
      },
    ],
    observabilityEvents: [
      {
        id: "event-1",
        event: "admin_api_forbidden",
        source: "server",
        severity: "warning" as const,
        at: "2026-04-25T12:00:00.000Z",
      },
    ],
    practiceCounts: [{ module: "karma", count: 2 }],
    audits: [],
    incidentsWithAuto: [incident],
    autographProfiles: [
      {
        id: "profile-1",
        userId: "teacher@example.com",
        displayName: "Teacher One",
        role: "teacher" as const,
        updatedAt: "2026-04-25T12:00:00.000Z",
      },
    ],
    incidentFilter: "open" as const,
    observabilityFilter: "all" as const,
    incidentStats: {
      openCount: 1,
      resolvedCount: 0,
      visibleIncidents: [incident],
    },
    experiments: [],
    lockAdmin: "" as unknown as () => Promise<void>,
    logIncident: "" as unknown as (formData: FormData) => Promise<void>,
    createExperiment: "" as unknown as (formData: FormData) => Promise<void>,
    resolveIncident: "" as unknown as (formData: FormData) => Promise<void>,
    updateSupportReportStatus: "" as unknown as (formData: FormData) => Promise<void>,
  };
}

describe("AdminDashboardView", () => {
  beforeEach(() => {
    profileAdminSpy.mockReset();
  });

  it("renders the modular admin workspace and embeds profile handling", () => {
    render(<AdminDashboardView {...makeProps()} />);

    expect(screen.getByRole("navigation", { name: "Admin workspace" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Snapshot/i })).toHaveAttribute("href", "#admin-snapshot");
    expect(screen.getByRole("link", { name: /Profiles/i })).toHaveAttribute("href", "#admin-profiles");
    expect(screen.getByText("Operational snapshot")).toBeInTheDocument();
    expect(screen.getByText("Profile handling")).toBeInTheDocument();
    expect(screen.getAllByText(/Support reports/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId("profile-admin-panel")).toBeInTheDocument();
    expect(screen.getByTestId("diagnostics-panel")).toBeInTheDocument();
    expect(profileAdminSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        initialProfiles: [
          expect.objectContaining({
            id: "profile-1",
          }),
        ],
      }),
    );
  });
});
