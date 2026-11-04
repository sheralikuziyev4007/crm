import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { useAuthStore } from "@/store/authStore";
import { renderApp } from "@/test/utils";

describe("authentication flow", () => {
  it("sends a signed-out visitor to the login page and back to where they were going", async () => {
    const { user, router } = renderApp({ route: "/clients", signedIn: false });

    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    // The demo account is pre-filled
    expect(screen.getByLabelText("Email")).toHaveValue("demo@pipelinecrm.app");

    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: "Clients" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/clients");
    expect(useAuthStore.getState().user?.name).toBe("Alex Morgan");
  });

  it("validates the form before calling the API", async () => {
    const { user } = renderApp({ route: "/login", signedIn: false });
    const email = await screen.findByLabelText("Email");
    await user.clear(email);
    await user.type(email, "not-an-email");
    await user.clear(screen.getByLabelText("Password"));
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Password must be at least 6 characters")).toBeInTheDocument();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveFocus();
  });

  it("shows the server's message for wrong credentials", async () => {
    const { user } = renderApp({ route: "/login", signedIn: false });
    const password = await screen.findByLabelText("Password");
    await user.clear(password);
    await user.type(password, "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid email or password.")).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("can reveal the password", async () => {
    const { user } = renderApp({ route: "/login", signedIn: false });
    const password = await screen.findByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
  });

  it("logs out from the account menu", async () => {
    const { user, router } = renderApp({ route: "/" });
    await user.click(await screen.findByRole("button", { name: "Alex Morgan" }));
    await user.click(await screen.findByRole("menuitem", { name: "Log out" }));

    expect(await screen.findByText("You have been signed out.")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
    expect(useAuthStore.getState().token).toBeNull();
  });

  it("signs the user out with an explanation when the session has expired", async () => {
    useAuthStore.setState({
      token: "mock.expired-token",
      user: { id: "u", name: "Alex Morgan", email: "x@y.z", role: "" },
    });
    const { router } = renderApp({ route: "/clients", signedIn: false });

    expect(await screen.findByText("Your session has expired. Please sign in again.")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/login");
  });

  it("keeps a signed-in user away from the login page", async () => {
    const { router } = renderApp({ route: "/login" });
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");
    expect(
      within(screen.getByRole("navigation", { name: "Main" })).getByRole("link", { name: "Dashboard" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
