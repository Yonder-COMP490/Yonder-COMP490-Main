import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Yonder</h1>
      <Link to="/Activities">
        <button>Activities</button>
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
    </div>
  );
}

export default Home;
