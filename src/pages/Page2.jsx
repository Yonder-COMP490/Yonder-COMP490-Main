import { Link } from "react-router-dom";

function Page2() {
  return (
    <div>
      <h1>Page 2</h1>
      <Link to="/">
        <button>Home</button>
      </Link>
    </div>
  );
}

export default Page2;
