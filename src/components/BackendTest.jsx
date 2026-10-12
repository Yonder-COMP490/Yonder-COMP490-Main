
import { useEffect, useState } from "react";

function BackendTest() {
    const [message, setMessage] = useState("Connecting to Java...");
    const [error, setError] = useState("");

    useEffect(() => {
        fetch("http://localhost:8080/api/test")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Java returned an error.");
                }

                return response.text();
            })
            .then((data) => {
                setMessage(data);
            })
            .catch((err) => {
                setError(err.message);
                setMessage("");
            });
    }, []);

    return (
        <div>
            <h2>Java Backend Connection</h2>

            {error ? (
                <p>Connection failed: {error}</p>
            ) : (
                <p>{message}</p>
            )}
        </div>
    );
}

export default BackendTest;
