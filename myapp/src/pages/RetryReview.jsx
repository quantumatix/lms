import { useEffect, useState } from "react";
import { API_BASE } from "../config";

function RetryReview() {

  const [mistakes, setMistakes] = useState([]);

  useEffect(() => {

    const username = "ayush";

    fetch(
      `${API_BASE}/retry-review/${username}`
    )
      .then((res) => res.json())
      .then((data) => setMistakes(data))
      .catch((err) => console.log(err));

  }, []);

  return (

    <div className="container mt-4">

      <h1>Retry Review</h1>

      {mistakes.map((item, index) => (

        <div
          key={index}
          className="card shadow p-3 mb-3"
        >

          <h5>{item.question}</h5>

          <p>
            Your Answer:
            {item.user_answer}
          </p>

          <p>
            Correct Answer:
            {item.correct_answer}
          </p>

          <button className="btn btn-warning">
            Retry Question
          </button>

        </div>

      ))}

    </div>

  );
}

export default RetryReview;