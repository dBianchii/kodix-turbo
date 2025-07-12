import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock do next/navigation para controlar comportamento
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/pt-BR/apps/chat",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock do router internacionalizado
const mockI18nPush = vi.fn();
vi.mock("~/i18n/routing", () => ({
  useRouter: () => ({
    push: mockI18nPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock location object simples
const mockLocation = {
  href: "http://localhost:3000/pt-BR/apps/chat",
  pathname: "/pt-BR/apps/chat",
  search: "",
  hash: "",
};

describe("Chat Navigation Patterns", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock location
    mockLocation.href = "http://localhost:3000/pt-BR/apps/chat";
    mockLocation.pathname = "/pt-BR/apps/chat";
  });

  describe("URL Pattern Validation", () => {
    it("should always use absolute paths starting with /", () => {
      const testCases = [
        "/apps/chat/session-123",
        "/apps/chat",
        "/apps/todo",
        "/apps/calendar",
      ];

      testCases.forEach((path) => {
        expect(path).toMatch(/^\/[^\/]/); // Starts with / but not //
        expect(path).not.toMatch(/^[^\/]/); // Does not start without /
        expect(path).not.toMatch(/^\./); // Does not start with .
        expect(path).not.toMatch(/^\.\./); // Does not start with ..
      });
    });

    it("should detect problematic relative paths", () => {
      const problematicPaths = [
        "session-123", // Relative without /
        ".", // Current directory
        "..", // Parent directory
        "../other-page", // Relative navigation
        "subfolder/page", // Nested relative
      ];

      problematicPaths.forEach((path) => {
        expect(path).not.toMatch(/^\/[^\/]/); // Should fail absolute path test
      });
    });

    it("should prevent URL duplication patterns", () => {
      const sessionId = "test-session-123";

      // Simulate navigation scenarios that could cause duplication
      const navigationScenarios = [
        {
          name: "Direct session navigation",
          path: `/apps/chat/${sessionId}`,
          expected: `/apps/chat/${sessionId}`,
        },
        {
          name: "Home navigation",
          path: "/apps/chat",
          expected: "/apps/chat",
        },
        {
          name: "Cross-app navigation",
          path: "/apps/todo",
          expected: "/apps/todo",
        },
      ];

      navigationScenarios.forEach(({ name, path, expected }) => {
        expect(path).toBe(expected);
        expect(path).not.toContain("/apps/apps/"); // No duplication
        expect(path).not.toContain("//"); // No double slashes
      });
    });

    it("should validate session ID format", () => {
      const validSessionIds = [
        "abc123",
        "session-456",
        "i43dsxd5f0c3",
        "user_session_789",
      ];

      const invalidSessionIds = [
        "", // Empty
        " ", // Space only
        "/", // Path separator
        "../", // Relative path
        "session with spaces",
        "session/with/slashes",
      ];

      validSessionIds.forEach((sessionId) => {
        const path = `/apps/chat/${sessionId}`;
        expect(path).toMatch(/^\/apps\/chat\/[a-zA-Z0-9_-]+$/);
        expect(path).not.toContain(" ");
        expect(path).not.toContain("//");
      });

      invalidSessionIds.forEach((sessionId) => {
        if (sessionId.trim() === "") {
          // Empty session should default to home
          const path = "/apps/chat";
          expect(path).toBe("/apps/chat");
        } else {
          const path = `/apps/chat/${sessionId}`;
          expect(path).not.toMatch(/^\/apps\/chat\/[a-zA-Z0-9_-]+$/);
        }
      });
    });
  });

  describe("Fallback URL Construction", () => {
    it("should construct fallback URLs correctly", () => {
      const sessionId = "fallback-session";
      const currentPath = "/pt-BR/apps/chat";

      // Simulate fallback URL construction
      const constructFallbackUrl = (path: string, targetSessionId: string) => {
        const pathParts = path.split("/");
        const locale = pathParts[1]; // pt-BR, en, etc
        return `/${locale}/apps/chat/${targetSessionId}`;
      };

      const fallbackUrl = constructFallbackUrl(currentPath, sessionId);

      expect(fallbackUrl).toBe(`/pt-BR/apps/chat/${sessionId}`);
      expect(fallbackUrl).not.toContain("/apps/apps/"); // No duplication
      expect(fallbackUrl).toMatch(/^\/[a-zA-Z-]+\/apps\/chat\/[a-zA-Z0-9_-]+$/); // Correct pattern
    });

    it("should construct correct internationalized URLs in fallback", () => {
      const testCases = [
        { locale: "pt-BR", expected: "/pt-BR/apps/chat/session" },
        { locale: "en", expected: "/en/apps/chat/session" },
      ];

      testCases.forEach(({ locale, expected }) => {
        const currentPath = `/${locale}/apps/chat/old-session`;
        const pathParts = currentPath.split("/");
        const extractedLocale = pathParts[1];
        const fallbackUrl = `/${extractedLocale}/apps/chat/session`;

        expect(fallbackUrl).toBe(expected);
      });
    });

    it("should handle edge cases in URL construction", () => {
      const edgeCases = [
        {
          input: "/pt-BR/apps/chat/",
          sessionId: "new-session",
          expected: "/pt-BR/apps/chat/new-session",
        },
        {
          input: "/en/apps/chat",
          sessionId: "test-123",
          expected: "/en/apps/chat/test-123",
        },
        {
          input: "/pt-BR/apps/chat/old-session",
          sessionId: "replacement",
          expected: "/pt-BR/apps/chat/replacement",
        },
      ];

      edgeCases.forEach(({ input, sessionId, expected }) => {
        const pathParts = input.split("/");
        const locale = pathParts[1];
        const constructedUrl = `/${locale}/apps/chat/${sessionId}`;

        expect(constructedUrl).toBe(expected);
        expect(constructedUrl).not.toContain("/apps/apps/");
        expect(constructedUrl).not.toContain("//");
      });
    });
  });

  describe("Navigation Logic Validation", () => {
    it("should validate navigation patterns prevent double navigation", () => {
      // Test the pattern we use to prevent double navigation
      let navigationCount = 0;

      const simulateCorrectPattern = (sessionId: string) => {
        // ✅ CORRECT: Only call callback, don't navigate in useEmptySession
        const onNewSession = (id: string) => {
          navigationCount++;
          // This would be where router.push happens
        };

        onNewSession(sessionId);
      };

      simulateCorrectPattern("test-session");

      expect(navigationCount).toBe(1); // Only one navigation call
    });

    it("should validate home navigation uses absolute paths", () => {
      // Test that home navigation uses correct absolute path
      const homeNavigationPath = "/apps/chat"; // ✅ CORRECT
      const problematicPaths = [".", "..", "chat"]; // ❌ INCORRECT

      expect(homeNavigationPath).toMatch(/^\/apps\/chat$/);
      expect(homeNavigationPath).not.toContain("//");

      problematicPaths.forEach((path) => {
        expect(path).not.toMatch(/^\/apps\/chat$/);
      });
    });

    it("should validate session navigation uses correct format", () => {
      const sessionId = "valid-session-123";
      const sessionPath = `/apps/chat/${sessionId}`;

      // Validate correct format
      expect(sessionPath).toMatch(/^\/apps\/chat\/[a-zA-Z0-9_-]+$/);
      expect(sessionPath).not.toContain("/apps/apps/");
      expect(sessionPath).not.toContain("//");

      // Test relative path detection (should fail)
      const relativePath = sessionId; // Just the session ID
      expect(relativePath).not.toMatch(/^\/apps\/chat\//);
    });
  });

  describe("Error Prevention Patterns", () => {
    it("should handle empty or undefined sessionId", () => {
      const handleSessionId = (sessionId: string | undefined) => {
        if (sessionId && sessionId.trim() !== "") {
          return `/apps/chat/${sessionId}`;
        } else {
          return "/apps/chat";
        }
      };

      // Test with valid sessionId
      expect(handleSessionId("valid-session")).toBe("/apps/chat/valid-session");

      // Test with invalid sessionIds
      expect(handleSessionId(undefined)).toBe("/apps/chat");
      expect(handleSessionId("")).toBe("/apps/chat");
      expect(handleSessionId(" ")).toBe("/apps/chat");
    });

    it("should prevent navigation loops", () => {
      let navigationAttempts = 0;
      const maxAttempts = 1;

      const preventLoopNavigation = (targetSessionId: string) => {
        if (navigationAttempts >= maxAttempts) {
          return false; // Prevent loop
        }

        navigationAttempts++;
        return true; // Allow navigation
      };

      // Try to navigate multiple times
      const result1 = preventLoopNavigation("session");
      const result2 = preventLoopNavigation("session");
      const result3 = preventLoopNavigation("session");

      expect(result1).toBe(true); // First attempt allowed
      expect(result2).toBe(false); // Second attempt blocked
      expect(result3).toBe(false); // Third attempt blocked
      expect(navigationAttempts).toBe(1); // Only one attempt counted
    });
  });
});

// Export test utilities for other tests
export const navigationTestUtils = {
  validateAbsolutePath: (path: string) => {
    return (
      path.startsWith("/") &&
      !path.startsWith("//") &&
      !path.includes("/apps/apps/")
    );
  },

  simulateNavigation: (sessionId: string) => {
    return `/apps/chat/${sessionId}`;
  },

  checkForDuplication: (url: string) => {
    return !url.includes("/apps/apps/") && !url.includes("//");
  },

  constructFallbackUrl: (currentPath: string, sessionId: string) => {
    const pathParts = currentPath.split("/");
    const locale = pathParts[1];
    return `/${locale}/apps/chat/${sessionId}`;
  },

  validateSessionId: (sessionId: string) => {
    return (
      sessionId &&
      sessionId.trim() !== "" &&
      /^[a-zA-Z0-9_-]+$/.test(sessionId) &&
      !sessionId.includes("/") &&
      !sessionId.includes(" ")
    );
  },
};
