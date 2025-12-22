import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://poshmark.ca/create-listing*"],
  run_at: "document_idle"
};

interface ListingData {
  title: string;
  price: string;
  description: string;
}

// Listen for data from background/popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FILL_POSHMARK_LISTING" && message.data) {
    const data: ListingData = message.data;
    fillPoshmarkForm(data);
    sendResponse({ success: true });
  }
  return true;
});

const fillPoshmarkForm = (data: ListingData) => {
  // Title
  const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
  if (titleInput) titleInput.value = data.title;

  // Price
  const priceInput = document.querySelector('input[name="listing_price"]') as HTMLInputElement;
  if (priceInput) priceInput.value = data.price.replace('$', '').trim();

  // Description
  const descTextarea = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
  if (descTextarea) descTextarea.value = data.description;

  // Category: Accessories > Sunglasses (example; make dynamic later)
  // Poshmark uses a multi-step category selector – we trigger clicks
  setTimeout(() => {
    const categoryButton = Array.from(document.querySelectorAll('button')).find(
      btn => btn.textContent?.trim() === "Accessories"
    );
    if (categoryButton) (categoryButton as HTMLElement).click();

    setTimeout(() => {
      const subcategoryButton = Array.from(document.querySelectorAll('button')).find(
        btn => btn.textContent?.trim() === "Sunglasses"
      );
      if (subcategoryButton) (subcategoryButton as HTMLElement).click();
    }, 1000);
  }, 800);

  // Brand: Other (common for generic items)
  setTimeout(() => {
    const brandInput = document.querySelector('input[placeholder="Search brands"]') as HTMLInputElement;
    if (brandInput) {
      brandInput.focus();
      brandInput.value = "Other";
      brandInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, 1500);

  // Condition: New with tags (or New without tags)
  setTimeout(() => {
    const conditionButton = Array.from(document.querySelectorAll('button')).find(
      btn => btn.textContent?.includes("New with tags")
    );
    if (conditionButton) (conditionButton as HTMLElement).click();
  }, 1200);

  // Notify user via overlay
  const overlay = document.createElement("div");
  overlay.innerHTML = `
    <div style="position:fixed;top:10px;left:50%;transform:translateX(-50%);
                background:#000;color:#fff;padding:15px 25px;border-radius:8px;
                font-size:16px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.5);">
      My Crosslister: Form pre-filled! <br>
      Please upload photos and click "Next" → "Post".
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => overlay.remove(), 10000);
};

export {};