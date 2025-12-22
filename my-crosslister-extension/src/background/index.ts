import { Storage } from "@plasmohq/storage";

const storage = new Storage({ area: "local" });

const API_BASE = "http://localhost:5000/api";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      console.log("[Background] Received message:", request.type);

      if (request.type === "ADD_INVENTORY_TO_BACKEND") {
        const token = await storage.get("jwtToken");
        if (!token) throw new Error("No authentication token found");

        console.log("[Background] Adding inventory item...");
        const response = await fetch(`${API_BASE}/inventory`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(request.data)
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("[Background] Add inventory failed:", response.status, errText);
          throw new Error(`Server error: ${response.status}`);
        }

        console.log("[Background] Inventory added successfully");
        sendResponse({ success: true });
      } 
      else if (request.type === "GET_INVENTORY_FROM_BACKEND") {
        const token = await storage.get("jwtToken");
        if (!token) throw new Error("No authentication token found");

        console.log("[Background] Fetching inventory...");
        const response = await fetch(`${API_BASE}/inventory`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("[Background] Fetch inventory failed:", response.status, errText);
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log("[Background] Inventory fetched:", data.length, "items");
        sendResponse({ data });
      } 
      else if (request.type === "LOGIN" || request.type === "REGISTER") {
        const endpoint = request.type === "LOGIN" ? "login" : "register";
        console.log(`[Background] Attempting ${request.type} to ${endpoint}`);

        const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request.data)
        });

        console.log("[Background] Response status:", response.status);

        if (!response.ok) {
          const errText = await response.text();
          console.error("[Background] Auth failed:", response.status, errText);
          throw new Error(errText || `${request.type} failed`);
        }

        const { token } = await response.json();
        await storage.set("jwtToken", token);
        console.log("[Background] Authentication successful, token stored");

        sendResponse({ success: true });
      } 
      else {
        console.warn("[Background] Unknown message type:", request.type);
        sendResponse({ error: "Unknown message type" });
      }
    } catch (error: any) {
      console.error("[Background] Error:", error.message || error);
      sendResponse({ success: false, error: error.message || "Network error" });
    }
  })();

  return true;
});