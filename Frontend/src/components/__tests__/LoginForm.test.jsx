import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import LoginForm from "../LoginForm";

// Mock the CircularProgress component
vi.mock("../CircularProgress", () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("LoginForm", () => {
  let mockAxios;
  let user;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe("Form Rendering", () => {
    it("renders all form fields correctly", () => {
      renderWithRouter(<LoginForm />);

      expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    });

    it("renders password toggle button", () => {
      renderWithRouter(<LoginForm />);

      const toggleButtons = screen.getAllByRole("button", { name: "" });
      expect(toggleButtons).toHaveLength(1);
    });
  });

  describe("Form Interactions", () => {
    it("updates form fields when user types", async () => {
      renderWithRouter(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, "testuser");
      await user.type(passwordInput, "password123");

      expect(usernameInput).toHaveValue("testuser");
      expect(passwordInput).toHaveValue("password123");
    });

    it("toggles password visibility", async () => {
      renderWithRouter(<LoginForm />);

      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole("button", { name: "" });

      expect(passwordInput).toHaveAttribute("type", "password");

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "text");

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Form Validation", () => {
    it("requires username and password fields", async () => {
      renderWithRouter(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(usernameInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe("API Integration", () => {
    const validCredentials = {
      username: "testuser",
      password: "password123",
    };

    const fillForm = async () => {
      await user.type(
        screen.getByLabelText(/username/i),
        validCredentials.username
      );
      await user.type(
        screen.getByLabelText(/password/i),
        validCredentials.password
      );
    };

    it("handles successful login", async () => {
      mockAxios.onPost("/api/auth/login/").reply(200, {
        token: {
          access: "access_token_123",
          refresh: "refresh_token_123",
        },
      });

      renderWithRouter(<LoginForm />);
      await fillForm();

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "access_token",
          "access_token_123"
        );
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "refresh_token",
          "refresh_token_123"
        );
        expect(window.location.href).toBe("/home");
      });
    });

    it("handles login failure with invalid credentials", async () => {
      mockAxios.onPost("/api/auth/login/").reply(401, {
        detail: "Invalid credentials",
      });

      renderWithRouter(<LoginForm />);
      await fillForm();

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
    });

    it("handles server errors", async () => {
      mockAxios.onPost("/api/auth/login/").reply(500);

      renderWithRouter(<LoginForm />);
      await fillForm();

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Server error. Please try again later.")
        ).toBeInTheDocument();
      });
    });

    it("handles network errors", async () => {
      mockAxios.onPost("/api/auth/login/").networkError();

      renderWithRouter(<LoginForm />);
      await fillForm();

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Unable to connect to the server. Please try again later."
          )
        ).toBeInTheDocument();
      });
    });

    it("handles login failure without response", async () => {
      mockAxios.onPost("/api/auth/login/").reply(400);

      renderWithRouter(<LoginForm />);
      await fillForm();

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Login failed")).toBeInTheDocument();
      });
    });
  });

  describe("Loading States", () => {
    it("shows loading spinner during login", async () => {
      mockAxios.onPost("/api/auth/login/").reply(() => {
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve([200, { token: { access: "test", refresh: "test" } }]),
            1000
          )
        );
      });

      renderWithRouter(<LoginForm />);

      await user.type(screen.getByLabelText(/username/i), "testuser");
      await user.type(screen.getByLabelText(/password/i), "password123");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });

    it("clears error when starting new login attempt", async () => {
      // First, trigger an error
      mockAxios
        .onPost("/api/auth/login/")
        .reply(401, { detail: "Invalid credentials" });

      renderWithRouter(<LoginForm />);

      await user.type(screen.getByLabelText(/username/i), "testuser");
      await user.type(screen.getByLabelText(/password/i), "wrongpassword");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      // Then try again - error should clear
      mockAxios.reset();
      mockAxios.onPost("/api/auth/login/").reply(() => {
        return new Promise(() => {}); // Never resolves to keep loading state
      });

      await user.clear(screen.getByLabelText(/password/i));
      await user.type(screen.getByLabelText(/password/i), "correctpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.queryByText("Invalid credentials")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("has correct link to register page", () => {
      renderWithRouter(<LoginForm />);

      const registerLink = screen.getByText(/don't have an account/i);
      expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for form fields", () => {
      renderWithRouter(<LoginForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(usernameInput).toHaveAttribute("id");
      expect(passwordInput).toHaveAttribute("id");
    });

    it("has proper form submission behavior", async () => {
      mockAxios.onPost("/api/auth/login/").reply(200, {
        token: { access: "test", refresh: "test" },
      });

      renderWithRouter(<LoginForm />);

      const form = screen.getByTestId("login-form");
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, "testuser");
      await user.type(passwordInput, "password123");

      // Submit by pressing Enter
      await user.type(passwordInput, "{enter}");

      await waitFor(() => {
        expect(mockAxios.history.post).toHaveLength(1);
      });
    });
  });
});
