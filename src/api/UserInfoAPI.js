const API_URL = "http://localhost:8080/api/userinfo";

class UserInfoAPI {
  async submit(userInfo) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo),
    });

    if (!response.ok) {
      const details = await response.text();

      throw new Error(
        `Failed to submit user information (${response.status}): ${details}`
      );
    }

    return await response.json();
  }
}

export default new UserInfoAPI();