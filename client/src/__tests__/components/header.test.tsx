import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Header } from "@/components/core/header";
import { useWebSocket } from "@/contexts/ws.provider";

vi.mock("@/contexts/ws.provider", () => ({
  useWebSocket: vi.fn(),
}));

vi.mock("@/components/core/mode-toggle", () => ({
  ModeToggle: () => <div data-testid="mode-toggle" />,
}));

const mockPause = vi.fn();
const mockResume = vi.fn();

function setup(status: "connected" | "connecting" | "disconnected" | "paused") {
  vi.mocked(useWebSocket).mockReturnValue({ status, pause: mockPause, resume: mockResume });
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Navigation ──────────────────────────────────────────────────────────

  it("renders the brand name and navigation links", () => {
    setup("connected");
    expect(screen.getByText("Crypto Alerts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Monitor" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Alerts" })).toBeInTheDocument();
  });

  // ── Connection status labels ─────────────────────────────────────────────

  it.each([
    ["connecting", "Connecting"],
    ["connected", "Connected"],
    ["disconnected", "Disconnected"],
    ["paused", "Paused"],
  ] as const)('shows "%s" label when status is %s', (status, label) => {
    setup(status);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  // ── Pause / Resume button ────────────────────────────────────────────────

  it('shows "Pause" button when not paused', () => {
    setup("connected");
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it('shows "Resume" button when paused', () => {
    setup("paused");
    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
  });

  it("calls pause() when the Pause button is clicked", () => {
    setup("connected");
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(mockPause).toHaveBeenCalledOnce();
    expect(mockResume).not.toHaveBeenCalled();
  });

  it("calls resume() when the Resume button is clicked", () => {
    setup("paused");
    fireEvent.click(screen.getByRole("button", { name: "Resume" }));
    expect(mockResume).toHaveBeenCalledOnce();
    expect(mockPause).not.toHaveBeenCalled();
  });

  // ── ModeToggle ───────────────────────────────────────────────────────────

  it("renders the mode toggle", () => {
    setup("connected");
    expect(screen.getByTestId("mode-toggle")).toBeInTheDocument();
  });
});
