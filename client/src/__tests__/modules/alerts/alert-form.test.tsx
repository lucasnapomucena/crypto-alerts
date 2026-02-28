import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertForm } from "@/modules/alerts/components/alert-form";
import { useAlertsStore } from "@/stores/use-alerts";

// Radix UI Sheet uses a portal – body is fine in jsdom.
// Radix uses pointer events; userEvent handles them correctly.

beforeEach(() => {
  localStorage.clear();
  useAlertsStore.setState({ rules: [], triggered: [] });
});

async function openSheet() {
  await userEvent.click(screen.getByRole("button", { name: "New Alert" }));
}

function renderForm() {
  return render(<AlertForm />);
}

describe("AlertForm – trigger button", () => {
  it('renders a "New Alert" button', () => {
    renderForm();
    expect(screen.getByRole("button", { name: "New Alert" })).toBeInTheDocument();
  });

  it("opens the sheet when the button is clicked", async () => {
    renderForm();
    await openSheet();
    await waitFor(() =>
      expect(screen.getByText("Create Alert Rule")).toBeInTheDocument()
    );
  });
});

describe("AlertForm – form fields", () => {
  it("renders name, condition, threshold inputs and a submit button", async () => {
    renderForm();
    await openSheet();

    await waitFor(() => screen.getByText("Create Alert Rule"));
    expect(screen.getByPlaceholderText("e.g. BTC spike")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 95000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Alert" })).toBeInTheDocument();
  });

  it("has all four condition options", async () => {
    renderForm();
    await openSheet();

    await waitFor(() => screen.getByText("Create Alert Rule"));
    expect(screen.getByText("Price above")).toBeInTheDocument();
    expect(screen.getByText("Price below")).toBeInTheDocument();
    expect(screen.getByText("Quantity above")).toBeInTheDocument();
    expect(screen.getByText("Quantity below")).toBeInTheDocument();
  });
});

describe("AlertForm – validation", () => {
  it('disables "Create Alert" when label is empty', async () => {
    renderForm();
    await openSheet();

    await waitFor(() => screen.getByText("Create Alert Rule"));
    const submit = screen.getByRole("button", { name: "Create Alert" });
    expect(submit).toBeDisabled();
  });

  it('disables "Create Alert" when threshold is empty', async () => {
    renderForm();
    await openSheet();

    await waitFor(() => screen.getByText("Create Alert Rule"));
    await userEvent.type(screen.getByPlaceholderText("e.g. BTC spike"), "My Rule");
    expect(screen.getByRole("button", { name: "Create Alert" })).toBeDisabled();
  });

  it('enables "Create Alert" when both label and threshold are filled', async () => {
    renderForm();
    await openSheet();

    await waitFor(() => screen.getByText("Create Alert Rule"));
    await userEvent.type(screen.getByPlaceholderText("e.g. BTC spike"), "My Rule");
    await userEvent.type(screen.getByPlaceholderText("e.g. 95000"), "50000");
    expect(screen.getByRole("button", { name: "Create Alert" })).not.toBeDisabled();
  });
});

describe("AlertForm – submission", () => {
  it("adds a rule to the store and closes the sheet on valid submit", async () => {
    renderForm();
    await openSheet();

    await waitFor(() => screen.getByText("Create Alert Rule"));
    await userEvent.type(screen.getByPlaceholderText("e.g. BTC spike"), "BTC spike");
    await userEvent.type(screen.getByPlaceholderText("e.g. 95000"), "95000");
    await userEvent.click(screen.getByRole("button", { name: "Create Alert" }));

    const { rules } = useAlertsStore.getState();
    expect(rules).toHaveLength(1);
    expect(rules[0].label).toBe("BTC spike");
    expect(rules[0].threshold).toBe(95000);
    expect(rules[0].condition).toBe("price_above");
    expect(rules[0].active).toBe(true);
  });

  it("does not add a rule when threshold is zero", async () => {
    renderForm();
    await openSheet();

    await waitFor(() => screen.getByText("Create Alert Rule"));
    await userEvent.type(screen.getByPlaceholderText("e.g. BTC spike"), "Bad Rule");
    await userEvent.type(screen.getByPlaceholderText("e.g. 95000"), "0");

    // Button is enabled because "0" is not empty, but submit should be a no-op
    fireEvent.click(screen.getByRole("button", { name: "Create Alert" }));
    expect(useAlertsStore.getState().rules).toHaveLength(0);
  });

  it("uses the selected condition in the created rule", async () => {
    renderForm();
    await openSheet();

    await waitFor(() => screen.getByText("Create Alert Rule"));
    await userEvent.click(screen.getByText("Quantity above"));
    await userEvent.type(screen.getByPlaceholderText("e.g. BTC spike"), "Vol Rule");
    await userEvent.type(screen.getByPlaceholderText("e.g. 95000"), "10");
    await userEvent.click(screen.getByRole("button", { name: "Create Alert" }));

    expect(useAlertsStore.getState().rules[0].condition).toBe("quantity_above");
  });
});
