import { Link } from "react-router-dom";

function Page1() {
  return (
    <div>
      <h1>Page 1</h1>
      <Link to="/">
        <button>Home</button>
      </Link>
    </div>
  );
}

export default Page1;
