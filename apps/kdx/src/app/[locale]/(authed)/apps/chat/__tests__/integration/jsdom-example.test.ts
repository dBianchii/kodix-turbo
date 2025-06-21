import { beforeEach, describe, expect, it } from "vitest";

describe("🌐 jsdom Examples - Browser APIs em Testes", () => {
  beforeEach(() => {
    // Reset DOM state
    document.body.innerHTML = "";
    document.title = "Test App";
    localStorage.clear();
  });

  describe("📄 DOM Manipulation", () => {
    it("deve criar e manipular elementos DOM", () => {
      // Arrange
      const button = document.createElement("button");
      button.textContent = "Clique aqui";
      button.id = "test-button";
      button.className = "btn btn-primary";

      // Act
      document.body.appendChild(button);

      // Assert
      const foundButton = document.getElementById("test-button");
      expect(foundButton).toBeTruthy();
      expect(foundButton?.textContent).toBe("Clique aqui");
      expect(foundButton?.className).toBe("btn btn-primary");
    });

    it("deve simular eventos DOM", () => {
      // Arrange
      let clicked = false;
      const button = document.createElement("button");
      button.addEventListener("click", () => {
        clicked = true;
      });
      document.body.appendChild(button);

      // Act
      button.click();

      // Assert
      expect(clicked).toBe(true);
    });

    it("deve manipular document.title", () => {
      // Act
      document.title = "Chat - Conversa sobre React";

      // Assert
      expect(document.title).toBe("Chat - Conversa sobre React");
    });
  });

  describe("💾 Web Storage APIs", () => {
    it("deve usar localStorage", () => {
      // Act
      localStorage.setItem("sessionId", "chat-123");
      localStorage.setItem("userPrefs", JSON.stringify({ theme: "dark" }));

      // Assert
      expect(localStorage.getItem("sessionId")).toBe("chat-123");

      const prefs = JSON.parse(localStorage.getItem("userPrefs") || "{}");
      expect(prefs.theme).toBe("dark");
    });

    it("deve usar sessionStorage", () => {
      // Act
      sessionStorage.setItem("tempData", "temporary-value");

      // Assert
      expect(sessionStorage.getItem("tempData")).toBe("temporary-value");
    });
  });

  describe("🌍 Window & Location APIs", () => {
    it("deve acessar window.location", () => {
      // Assert - jsdom fornece uma location padrão
      expect(window.location.hostname).toBe("localhost");
      expect(window.location.protocol).toBe("http:");
    });

    it("deve simular mudanças em window.location", () => {
      // Arrange
      const mockLocation = {
        ...window.location,
        pathname: "/apps/chat/session-123",
        search: "?tab=messages",
      };

      // Act
      Object.defineProperty(window, "location", {
        value: mockLocation,
        writable: true,
      });

      // Assert
      expect(window.location.pathname).toBe("/apps/chat/session-123");
      expect(window.location.search).toBe("?tab=messages");
    });
  });

  describe("🎯 Query Selectors", () => {
    it("deve usar querySelector e querySelectorAll", () => {
      // Arrange
      document.body.innerHTML = `
        <div class="chat-container">
          <div class="message" data-id="1">Mensagem 1</div>
          <div class="message" data-id="2">Mensagem 2</div>
          <input class="chat-input" placeholder="Digite..." />
        </div>
      `;

      // Act & Assert
      const container = document.querySelector(".chat-container");
      expect(container).toBeTruthy();

      const messages = document.querySelectorAll(".message");
      expect(messages.length).toBe(2);

      const input = document.querySelector(".chat-input")!;
      expect((input as HTMLInputElement)?.placeholder).toBe("Digite...");
    });

    it("deve usar getElementById e getElementsByClassName", () => {
      // Arrange
      document.body.innerHTML = `
        <div id="main-chat" class="active">
          <span class="status">Online</span>
          <span class="status">Typing...</span>
        </div>
      `;

      // Act & Assert
      const mainChat = document.getElementById("main-chat");
      expect(mainChat?.className).toBe("active");

      const statusElements = document.getElementsByClassName("status");
      expect(statusElements.length).toBe(2);
      expect(statusElements[0]?.textContent).toBe("Online");
    });
  });

  describe("📐 CSS & Styling", () => {
    it("deve manipular estilos CSS", () => {
      // Arrange
      const div = document.createElement("div");
      document.body.appendChild(div);

      // Act
      div.style.backgroundColor = "red";
      div.style.width = "100px";
      div.style.height = "50px";

      // Assert
      expect(div.style.backgroundColor).toBe("red");
      expect(div.style.width).toBe("100px");
      expect(div.style.height).toBe("50px");
    });

    it("deve adicionar e remover classes CSS", () => {
      // Arrange
      const element = document.createElement("div");
      document.body.appendChild(element);

      // Act & Assert
      element.classList.add("active", "visible");
      expect(element.classList.contains("active")).toBe(true);
      expect(element.classList.contains("visible")).toBe(true);

      element.classList.remove("active");
      expect(element.classList.contains("active")).toBe(false);
      expect(element.classList.contains("visible")).toBe(true);
    });
  });

  describe("📋 Forms & Input", () => {
    it("deve manipular formulários", () => {
      // Arrange
      document.body.innerHTML = `
        <form id="chat-form">
          <input name="message" value="Hello World" />
          <select name="priority">
            <option value="low">Baixa</option>
            <option value="high" selected>Alta</option>
          </select>
          <input type="checkbox" name="urgent" checked />
        </form>
      `;

      // Act
      const form = document.getElementById("chat-form") as HTMLFormElement;
      const formData = new FormData(form);

      // Assert
      expect(formData.get("message")).toBe("Hello World");
      expect(formData.get("priority")).toBe("high");
      expect(formData.get("urgent")).toBe("on"); // checkbox checked
    });

    it("deve simular input de usuário", () => {
      // Arrange
      const input = document.createElement("input");
      input.type = "text";
      document.body.appendChild(input);

      let inputValue = "";
      input.addEventListener("input", (e) => {
        inputValue = (e.target as HTMLInputElement).value;
      });

      // Act
      input.value = "Nova mensagem";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      // Assert
      expect(inputValue).toBe("Nova mensagem");
    });
  });

  describe("⏰ Timers & Async", () => {
    it("deve simular setTimeout e setInterval", async () => {
      // Arrange
      let counter = 0;

      // Act
      setTimeout(() => {
        counter = 1;
      }, 100);

      // Aguardar timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Assert
      expect(counter).toBe(1);
    });
  });
});
