const axios = require("axios");

const API_BASE = "https://ai-caption-generator-3v6i.onrender.com";

async function testAuthentication() {
  try {
    console.log("🔐 Testing Authentication Flow...\n");

    // 1. Test registration
    console.log("1. Testing registration...");
    const registerResponse = await axios.post(
      `${API_BASE}/api/auth/register`,
      {
        username: "TestUser",
        password: "TestPassword123",
      },
      {
        withCredentials: true,
      }
    );

    console.log("✅ Registration successful!");
    console.log("Token received:", !!registerResponse.data.token);
    console.log("User:", registerResponse.data.user.username);

    const token = registerResponse.data.token;

    // 2. Test API call with Authorization header
    console.log("\n2. Testing API call with Authorization header...");
    const postsResponse = await axios.get(`${API_BASE}/api/posts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ API call with Authorization header successful!");
    console.log("Posts retrieved:", postsResponse.data.success);

    // 3. Test API call with cookies (for comparison)
    console.log("\n3. Testing API call with cookies...");
    const cookieHeader = registerResponse.headers["set-cookie"];
    const cookiesResponse = await axios.get(`${API_BASE}/api/posts`, {
      headers: {
        Cookie: cookieHeader ? cookieHeader.join("; ") : "",
      },
    });

    console.log("✅ API call with cookies also works!");
    console.log("Posts retrieved:", cookiesResponse.data.success);

    console.log("\n🎉 All authentication tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);

    if (error.response?.data?.debug) {
      console.log("Debug info:", error.response.data.debug);
    }
  }
}

testAuthentication();
