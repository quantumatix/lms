import { useState } from "react";

function AdminLessonGenerator() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setSuccess("");
    setError("");

    // Validate that Topic is not empty
    if (!topic.trim()) {
      setError("Topic cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/admin/generate-lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: topic,
          difficulty: difficulty
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned error status code ${response.status}`);
      }

      const data = await response.json();
      setSuccess(data.message || "Lesson Generated Successfully");
      setTopic(""); // Clear the Topic input after success
    } catch (err) {
      setError(err.message || "Something went wrong while generating the lesson.");
    } finally {
      setLoading(false); // Re-enable the button after completion
    }
  };

  return (
    <div className="container mt-4">

      <h2>Generate Lesson with AI</h2>

      {/* Display a Bootstrap success alert if generation succeeds */}
      {success && (
        <div className="alert alert-success mt-3" role="alert">
          {success}
        </div>
      )}

      {/* Display a Bootstrap error alert if generation fails */}
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      <input
        className="form-control mt-3"
        placeholder="Enter Topic"
        value={topic}
        onChange={(e)=>setTopic(e.target.value)}
        disabled={loading}
      />

      <select
        className="form-select mt-3"
        value={difficulty}
        onChange={(e)=>setDifficulty(e.target.value)}
        disabled={loading}
      >
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>

      <button 
        className="btn btn-primary mt-3"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Generating...
          </>
        ) : (
          "Generate with AI"
        )}
      </button>

    </div>
  );
}

export default AdminLessonGenerator;