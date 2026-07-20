import { useEffect, useState } from "react";

function Recommendations() {

const [level, setLevel] = useState("");
const [topics, setTopics] = useState([]);

useEffect(() => {

const username =
  localStorage.getItem("username");

fetch(
  `http://127.0.0.1:8000/progress/${username}`
)
  .then((res) => res.json())
  .then((data) => {

    setLevel(data.level);

    const score = data.score || 0;

    if (score < 5) {

      setTopics([
        {
          title: "Variables",
          icon: "📘",
          description:
            "Strengthen Python fundamentals."
        },
        {
          title: "Data Types",
          icon: "🔢",
          description:
            "Practice strings, integers and floats."
        }
      ]);

    }
    else if (score <= 10) {

      setTopics([
        {
          title: "Loops",
          icon: "🔄",
          description:
            "Improve iteration skills."
        },
        {
          title: "Functions",
          icon: "⚙️",
          description:
            "Learn reusable code blocks."
        }
      ]);

    }
    else {

      setTopics([
        {
          title: "OOP",
          icon: "🏗️",
          description:
            "Learn classes and objects."
        },
        {
          title: "File Handling",
          icon: "📂",
          description:
            "Read and write files efficiently."
        },
        {
          title: "Projects",
          icon: "🚀",
          description:
            "Build real-world Python projects."
        }
      ]);

    }

  })
  .catch((err) => console.log(err));

}, []);

return (

<div className="container mt-4">

  <h1 className="text-center mb-3">
    🤖 AI Recommendations
  </h1>

  <h4 className="text-center text-muted mb-3">
    Your Current Level: {level}
  </h4>

  <h5 className="text-center mb-5">
    Personalized Learning Path 🚀
  </h5>

  <div className="row">

    {topics.map((topic, index) => (

      <div
        className="col-md-4 mb-4"
        key={index}
      >

        <div
          className="card shadow border-0 h-100"
          style={{
            borderRadius: "15px"
          }}
        >

          <div className="card-body text-center">

            <h1>{topic.icon}</h1>

            <h5 className="mt-3">
              {topic.title}
            </h5>

            <p className="text-muted">
              {topic.description}
            </p>

          </div>

        </div>

      </div>

    ))}

  </div>

</div>

);
}

export default Recommendations;