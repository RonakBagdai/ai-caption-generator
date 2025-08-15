// Session Management Test Script
// Run this in browser console to test session persistence

console.log("=== Session Manager Test ===");

// Test 1: Check localStorage
console.log("1. Checking localStorage...");
const savedSettings = localStorage.getItem("session_settings");
console.log("Raw localStorage:", savedSettings);

if (savedSettings) {
  try {
    const parsed = JSON.parse(savedSettings);
    console.log("Parsed settings:", parsed);
  } catch (e) {
    console.error("Parse error:", e);
  }
} else {
  console.log("No settings found, setting test value...");
  localStorage.setItem(
    "session_settings",
    JSON.stringify({
      sessionTimeout: 10,
      showWarnings: true,
      autoLogoutOnClose: false,
      pauseWhenHidden: true,
    })
  );
  console.log("Test settings saved");
}

// Test 2: Check session manager
console.log("2. Checking session manager...");
if (typeof sessionManager !== "undefined") {
  console.log("Session manager exists");
  sessionManager.debugSettings();
} else {
  console.log("Session manager not found in global scope");
}

// Test 3: Check for click handlers
console.log("3. Checking for problematic click handlers...");
const clickEvents = [];
document.addEventListener(
  "click",
  (e) => {
    clickEvents.push({
      target: e.target.tagName,
      time: new Date().toISOString(),
    });
    if (clickEvents.length > 5) clickEvents.shift();
    console.log(
      "Click detected:",
      e.target.tagName,
      "Recent clicks:",
      clickEvents.length
    );
  },
  true
);

console.log("Test setup complete. Click around to see if events are tracked.");
console.log("Run sessionManager.debugSettings() to check session state.");
