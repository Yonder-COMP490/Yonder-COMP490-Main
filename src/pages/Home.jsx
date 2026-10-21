import { Link } from "react-router-dom";

function Home() {
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
      </header>

      <nav>
        <Link to="/userinfo">
          <button>User Registration</button>
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