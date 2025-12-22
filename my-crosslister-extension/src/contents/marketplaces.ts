import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: [
    "*://*.poshmark.com/*",
    "*://*.ebay.com/*",
    "*://*.mercari.com/*",
    "*://*.etsy.com/*",
    "*://*.depop.com/*"
  ],
  run_at: "document_idle"
};

const extractData = (): { title: string; price: string; description: string; url: string; timestamp: string } => {
  const title = document.querySelector('h1, [itemprop="name"], .it-ttl')?.textContent?.trim() || "Untitled";
  const price = document.querySelector('[itemprop="price"], .price, .notranslate')?.textContent?.trim() || "";
  const descriptionElements = document.querySelectorAll('.description p, #desc');
  const description = Array.from(descriptionElements)
    .map(el => el.textContent?.trim())
    .filter(text => text)
    .join("\n") || "";
  const url = window.location.href;
  const timestamp = new Date().toISOString();

  return { title, price, description, url, timestamp };
};

const createButton = () => {
  const button = document.createElement("button");
  button.textContent = "Add to My Crosslister";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.zIndex = "9999";
  button.style.padding = "10px 15px";
  button.style.background = "#007bff";
  button.style.color = "#fff";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.cursor = "pointer";
  button.style.fontSize = "14px";
  button.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";

  button.onclick = () => {
    const data = extractData();
    chrome.runtime.sendMessage({ type: "ADD_INVENTORY_TO_BACKEND", data }, (response) => {
      if (response?.success) {
        alert("Item successfully added to inventory!");
      } else {
        alert("Error: " + (response?.error || "Unknown"));
      }
    });
  };

  document.body.appendChild(button);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createButton);
} else {
  createButton();
}

export {};