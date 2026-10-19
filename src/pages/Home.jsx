import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function loadUserInfo() {
      try {
        const response = await fetch(
          "http://localhost:8080/api/userinfo"
        );

        if (!response.ok) {
          return;
        }

        const text = await response.text();

        if (!text.trim()) {
          return;
        }

        const userInfo = JSON.parse(text);

        if (userInfo?.username) {
          setUsername(userInfo.username);
        }
      } catch (error) {
        console.error("Could not load user information:", error);
      }
    }

    loadUserInfo();
  }, []);

  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
        }}
      >
        <h1>Yonder</h1>

        {username && (
          <div
            style={{
              fontSize: "16px",
              padding: "8px 14px",
              border: "1px solid #ddd",
              borderRadius: "20px",
            }}
          >
            {username}
          </div>
        )}
      </header>

      <nav>
        <Link to="/userinfo">
          <button>User Info</button>
        </Link>

        <Link to="/Activities">
          <button>Activities</button>
        </Link>

        <Link to="/Housing">
          <button>Housing</button>
        </Link>

        <Link to="/Calendar">
          <button>Calendar</button>
        </Link>

        <Link to="/page3">
          <button>Page 3</button>
        </Link>

        <Link to="/Budget">
          <button>Budget</button>
        </Link>

        <Link to="/maps">
          <button>Maps</button>
        </Link>
      </nav>
    </div>
  );
}

export default Home;