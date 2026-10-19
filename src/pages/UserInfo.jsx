import { useState } from "react";
import { Link } from "react-router-dom";
import UserInfoAPI from "../api/UserInfoAPI";

import "./UserInfo.css";

function UserInfo() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setResult("");

    const userInfo = {
      username,
      email,
      password,
    };

    try {
      const response = await UserInfoAPI.submit(userInfo);

      setResult(
        `Success! The backend received username: ${response.username}`
      );

      console.log("Received from Java:", response);
    } catch (error) {
      setResult(`Request failed: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="user-info-page">
      <section className="user-info-container">
        <Link to="/" className="home-button">
          <button type="button">← Home</button>
        </Link>

        <h1>User Information</h1>

        <p>Enter a username, email, and password to submit to the backend.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {result && (
          <p className="user-info-result" role="status">
            {result}
          </p>
        )}
      </section>
    </div>
  );
}

export default UserInfo;