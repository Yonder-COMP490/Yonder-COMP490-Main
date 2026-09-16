import { Link } from "react-router-dom";

function Page3() {
  return (
    <div>
      <h1>Page 3</h1>
      <Link to="/">
        <button>Home</button>
      </Link>
    </div>
  );
}

export default Page3;
