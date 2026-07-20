import { useEffect, useState } from "react";

function TestHistory() {

  const [history, setHistory] = useState([]);

  useEffect(() => {

    const username =
      localStorage.getItem("username");

    fetch(
      `http://127.0.0.1:8000/history/${username}`
    )
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.log(err));

  }, []);

  return (
    <div className="container mt-4">

      <h1 className="mb-4">
        Test History
      </h1>

      {history.length === 0 ? (

        <div className="alert alert-info">
          No Test History Found
        </div>

      ) : (

        history.map((item, index) => (

          <div
            key={index}
            className="card shadow p-3 mb-3"
          >

            <h4>
              Test {index + 1}
            </h4>

            <p>
              <strong>Username:</strong>{" "}
              {item.username}
            </p>

            <p>
              <strong>Score:</strong>{" "}
              {item.score}/{item.total}
            </p>

          </div>

        ))

      )}

    </div>
  );
}

export default TestHistory;