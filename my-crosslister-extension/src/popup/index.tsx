import React, { useState, useEffect } from "react";
import { Storage } from "@plasmohq/storage";
import "./styles.css";
import type { InventoryItem } from "~/types";

const storage = new Storage({ area: "local" });

const Popup: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = await storage.get("jwtToken");
      setIsAuthenticated(!!token);
      setLoading(false);
      if (token) fetchInventory();
    };
    init();
  }, []);

  const handleAuth = () => {
    chrome.runtime.sendMessage(
      { type: isRegister ? "REGISTER" : "LOGIN", data: { email, password } },
      (response) => {
        if (response?.success) {
          setIsAuthenticated(true);
          fetchInventory();
        } else {
          alert(response?.error || "Authentication failed");
        }
      }
    );
  };

  const fetchInventory = () => {
    chrome.runtime.sendMessage({ type: "GET_INVENTORY_FROM_BACKEND" }, (response) => {
      if (response?.data) {
        setInventory(response.data);
      } else {
        alert(response?.error || "Failed to load inventory");
      }
    });
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    setSelectedItems(new Set(inventory.map((item) => item._id)));
  };

  const handleCrossList = async () => {
    if (selectedItems.size === 0) return;

    const selected = inventory.filter((item) => selectedItems.has(item._id));

    // Simple confirmation for Poshmark.ca
    const confirm = window.confirm(
      `Cross-list ${selected.length} item(s) to Poshmark.ca?\n\n` +
      "A new tab will open for each item with the form pre-filled.\n" +
      "You will need to upload photos and click Post."
    );

    if (!confirm) return;

    for (const item of selected) {
      const tab = await chrome.tabs.create({ url: "https://poshmark.ca/create-listing" });

      // Wait for tab to load, then send data
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === "complete") {
          chrome.tabs.sendMessage(tabId, {
            type: "FILL_POSHMARK_LISTING",
            data: {
              title: item.title,
              price: item.price,
              description: item.description
            }
          });
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    }

    alert(`Opened ${selected.length} tab(s) for Poshmark.ca cross-listing!`);
  };

  if (loading) return <div className="popup-container">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="popup-container">
        <header className="header">My Crosslister</header>
        <h2>{isRegister ? "Register" : "Login"}</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleAuth}>{isRegister ? "Register" : "Login"}</button>
        <p onClick={() => setIsRegister(!isRegister)} style={{ cursor: "pointer", textDecoration: "underline" }}>
          {isRegister ? "Already have an account? Login" : "New user? Register"}
        </p>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <header className="header">My Crosslister</header>
      <div className="actions">
        <button onClick={handleCrossList} disabled={selectedItems.size === 0}>
          Cross-List ({selectedItems.size}) → Poshmark.ca
        </button>
      </div>
      <div className="inventory-panel">
        <h2>Inventory ({inventory.length} items)</h2>
        <button onClick={selectAll}>Select All</button>
        <ul>
          {inventory.map((item) => (
            <li key={item._id}>
              <input
                type="checkbox"
                checked={selectedItems.has(item._id)}
                onChange={() => toggleSelect(item._id)}
              />
              <strong>{item.title}</strong> - {item.price}
            </li>
          ))}
        </ul>
      </div>
      <footer>v1.0.0</footer>
    </div>
  );
};

export default Popup;