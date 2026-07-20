import { useEffect, useState } from "react";

function MistakeAnalysis() {

  const [mistakes, setMistakes] = useState([]);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/daily-review/ayush")
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA:", data);
        setMistakes(data);
      })
      .catch((err) => console.log(err));

  }, []);

  return (
    <div style={{ padding: "20px" }}>

      <h1>Debug Page</h1>

      <h2>Total: {mistakes.length}</h2>

      <pre>
        {JSON.stringify(mistakes, null, 2)}
      </pre>

    </div>
  );
}

export default MistakeAnalysis;