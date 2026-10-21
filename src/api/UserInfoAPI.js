const API_URL = "http://localhost:8080/api/auth";

class UserInfoAPI {
  async register(userInfo) {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Failed to register user (${response.status}): ${details}`
      );
    }

    return await response.json();
  }
}

export default new UserInfoAPI();