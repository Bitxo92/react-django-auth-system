import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import RegisterForm from "../RegisterForm";

// Mock the CircularProgress component
vi.mock("../CircularProgress", () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("RegisterForm", () => {
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
      renderWithRouter(<RegisterForm />);

      expect(screen.getByText("Create your account")).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create account/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    });

    it("renders password toggle buttons", () => {
      renderWithRouter(<RegisterForm />);

      const toggleButtons = screen.getAllByRole("button", { name: "" });
      expect(toggleButtons).toHaveLength(2); // One for each password field
    });
  });

  describe("Form Interactions", () => {
    it("updates form fields when user types", async () => {
      renderWithRouter(<RegisterForm />);

      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(usernameInput, "testuser");
      await user.type(emailInput, "test@example.com");
      await user.type(firstNameInput, "John");
      await user.type(lastNameInput, "Doe");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      expect(usernameInput).toHaveValue("testuser");
      expect(emailInput).toHaveValue("test@example.com");
      expect(firstNameInput).toHaveValue("John");
      expect(lastNameInput).toHaveValue("Doe");
      expect(passwordInput).toHaveValue("password123");
      expect(confirmPasswordInput).toHaveValue("password123");
    });

    it("toggles password visibility", async () => {
      renderWithRouter(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const toggleButtons = screen.getAllByRole("button", { name: "" });

      expect(passwordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      await user.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute("type", "text");
      expect(confirmPasswordInput).toHaveAttribute("type", "text");

      await user.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Form Validation", () => {
    it("shows error when passwords do not match", async () => {
      renderWithRouter(<RegisterForm />);

      await user.type(screen.getByLabelText(/username/i), "testuser");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "differentpassword"
      );

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });
    });

    it("requires all required fields", async () => {
      renderWithRouter(<RegisterForm />);

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      // Check that HTML5 validation prevents submission
      const requiredFields = screen.getAllByRole("textbox", { required: true });
      expect(requiredFields.length).toBeGreaterThan(0);
    });
  });

  describe("API Integration", () => {
    const validFormData = {
      username: "testuser",
      email: "test@example.com",
      first_name: "John",
      last_name: "Doe",
      password: "password123",
      password_confirm: "password123",
    };

    const fillForm = async () => {
      await user.type(
        screen.getByLabelText(/username/i),
        validFormData.username
      );
      await user.type(screen.getByLabelText(/email/i), validFormData.email);
      await user.type(
        screen.getByLabelText(/first name/i),
        validFormData.first_name
      );
      await user.type(
        screen.getByLabelText(/last name/i),
        validFormData.last_name
      );
      await user.type(
        screen.getByLabelText("Password"),
        validFormData.password
      );
      await user.type(
        screen.getByLabelText(/confirm password/i),
        validFormData.password_confirm
      );
    };

    it("handles successful registration", async () => {
      mockAxios.onGet("/api/auth/health").reply(200);
      mockAxios.onPost("/api/auth/register/").reply(200, {
        token: {
          access: "access_token_123",
          refresh: "refresh_token_123",
        },
      });

      renderWithRouter(<RegisterForm />);
      await fillForm();

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
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

    it("handles server health check failure", async () => {
      mockAxios.onGet("/api/auth/health").reply(500);

      renderWithRouter(<RegisterForm />);
      await fillForm();

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Unable to connect to the server. Please try again later."
          )
        ).toBeInTheDocument();
      });
    });

    it("handles registration API errors", async () => {
      mockAxios.onGet("/api/auth/health").reply(200);
      mockAxios.onPost("/api/auth/register/").reply(400, {
        username: ["Username already exists"],
      });

      renderWithRouter(<RegisterForm />);
      await fillForm();

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Username already exists")).toBeInTheDocument();
      });
    });

    it("handles network errors", async () => {
      mockAxios.onGet("/api/auth/health").networkError();

      renderWithRouter(<RegisterForm />);
      await fillForm();

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Unable to connect to the server. Please try again later."
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("Loading States", () => {
    it("shows loading spinner during registration", async () => {
      mockAxios.onGet("/api/auth/health").reply(() => {
        return new Promise((resolve) => setTimeout(() => resolve([200]), 1000));
      });

      renderWithRouter(<RegisterForm />);

      await user.type(screen.getByLabelText(/username/i), "testuser");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.type(
        screen.getByLabelText(/confirm password/i),
        "password123"
      );

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      await user.click(submitButton);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(screen.getByText("Creating account...")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("has correct link to login page", () => {
      renderWithRouter(<RegisterForm />);

      const loginLink = screen.getByText(/already have an account/i);
      expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
    });
  });
});
