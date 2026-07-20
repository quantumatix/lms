import React, { useEffect, useState } from "react";

function DailyReview() {

const [questions, setQuestions] = useState([]);
const [answers, setAnswers] = useState({});
const [score, setScore] = useState(null);

const username = localStorage.getItem("username");

useEffect(() => {


fetch(
  `http://127.0.0.1:8000/daily-review/${username}`
)
  .then((res) => res.json())
  .then((data) => setQuestions(data));


}, [username]);

const handleAnswer = (id, option) => {


setAnswers({
  ...answers,
  [id]: option,
});


};

const submitReview = async () => {


let total = 0;

questions.forEach((q, index) => {

  if (
    answers[index] === q.correct_answer
  ) {
    total++;
  }

});

setScore(total);

await fetch(
  `http://127.0.0.1:8000/add-xp/${username}/10`
);

alert("🎉 Daily Review Completed! +10 XP");


};

return (


<div>

  <h1>🔥 Daily Review</h1>

  {questions.map((q, index) => (

    <div key={index}>

      <h3>{q.question}</h3>

      {q.options.map((option) => (

        <div key={option}>

          <input
            type="radio"
            name={`question-${index}`}
            value={option}
            onChange={() =>
              handleAnswer(index, option)
            }
          />

          {option}

        </div>

      ))}

      <br />

    </div>

  ))}

  <button onClick={submitReview}>
    Submit Review
  </button>

  {score !== null && (

    <h2>
      Score: {score}/{questions.length}
    </h2>

  )}

</div>


);
}

export default DailyReview;
