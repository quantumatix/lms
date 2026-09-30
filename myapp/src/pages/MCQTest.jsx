import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw,
  ChevronRight,
  BrainCircuit
} from "lucide-react";
import { useCourse } from "../context/CourseContext";

function MCQTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { selectedCourse } = useCourse();

  useEffect(() => {
    setLoading(true);
    const courseParam = selectedCourse?.id ? `?course_id=${selectedCourse.id}` : "";
    fetch(`http://127.0.0.1:8000/mcq${courseParam}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedCourse]);

  const handleAnswer = (questionId, answer) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const submitTest = async () => {
    const username = localStorage.getItem("username");
    let totalScore = 0;

    const courseId = selectedCourse?.id || "python-core";

    // First calculate score and save mistakes
    for (const q of questions) {
      if (answers[q.id] === q.answer) {
        totalScore++;
      } else {
        await fetch("http://127.0.0.1:8000/save-mistake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username,
            course_id: courseId,
            question: q.question,
            options: q.options,
            correct_answer: q.answer,
            user_answer: answers[q.id] || "No Answer"
          }),
        });
      }
    }

    setScore(totalScore);
    setSubmitted(true);

    // Save final stats
    try {
      await fetch("http://127.0.0.1:8000/save-mcq-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          course_id: courseId,
          score: totalScore,
          total: questions.length,
        }),
      });

      if (totalScore > 0) {
        await fetch(`http://127.0.0.1:8000/add-xp/${username}/20?course_id=${courseId}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: "260px", padding: "40px" }}>
        <div className="container-fluid" style={{ maxWidth: "900px" }}>
          
          <div className="d-flex align-items-center justify-content-between mb-5">
            <div>
              <h1 className="display-6 fw-bold text-dark mb-2">{selectedCourse?.name || "Python Core"} Knowledge Check</h1>
              <p className="text-muted">Test your understanding with these multiple-choice questions.</p>
            </div>
            <div className="bg-white p-3 rounded-4 shadow-sm border d-flex align-items-center gap-3">
              <div className="bg-warning-light text-warning p-2 rounded-3">
                <ClipboardList size={24} />
              </div>
              <div className="fw-bold text-dark">{questions.length} Questions</div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
               <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4 mb-5">
              {questions.map((q, idx) => (
                <div key={q.id} className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="card-header bg-white border-bottom-0 pt-4 px-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                       <span className="badge bg-light text-muted border">Question {idx + 1}</span>
                       {submitted && (
                         answers[q.id] === q.answer ? 
                         <span className="badge bg-success-subtle text-success d-flex align-items-center gap-1"><CheckCircle2 size={12}/> Correct</span> :
                         <span className="badge bg-danger-subtle text-danger d-flex align-items-center gap-1"><XCircle size={12}/> Incorrect</span>
                       )}
                    </div>
                    <h5 className="fw-bold text-dark">{q.question}</h5>
                  </div>
                  <div className="card-body px-4 pb-4">
                    <div className="d-flex flex-column gap-2">
                      {q.options.map((option) => {
                        const isSelected = answers[q.id] === option;
                        const isCorrect = option === q.answer;
                        let className = "p-3 rounded-3 border transition-all cursor-pointer d-flex align-items-center justify-content-between ";
                        
                        if (submitted) {
                          if (isCorrect) className += "bg-success-light border-success text-success fw-bold";
                          else if (isSelected) className += "bg-danger-light border-danger text-danger";
                          else className += "bg-light text-muted opacity-50";
                        } else {
                          className += isSelected ? "bg-primary-light border-primary text-primary fw-bold" : "bg-white hover-bg-light";
                        }

                        return (
                          <div 
                            key={option} 
                            className={className}
                            onClick={() => handleAnswer(q.id, option)}
                            style={{ cursor: submitted ? "default" : "pointer" }}
                          >
                            <span>{option}</span>
                            {submitted && isCorrect && <CheckCircle2 size={18} />}
                            {submitted && isSelected && !isCorrect && <XCircle size={18} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!submitted && !loading && (
            <div className="sticky-bottom bg-white border-top p-4 shadow-lg rounded-top-4 d-flex justify-content-between align-items-center mx-n4">
              <div className="text-muted small">
                {Object.keys(answers).length} of {questions.length} questions answered
              </div>
              <button 
                onClick={submitTest}
                disabled={Object.keys(answers).length < questions.length}
                className="btn btn-primary px-5 py-2.5 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2"
              >
                Submit Assessment <ChevronRight size={18} />
              </button>
            </div>
          )}

          {submitted && (
            <div className="card border-0 shadow-lg rounded-4 bg-dark text-white p-5 text-center mb-5">
              <Award size={64} className="text-warning mx-auto mb-4" />
              <h2 className="display-5 fw-bold mb-2">Results: {score} / {questions.length}</h2>
              <p className="text-secondary mb-4">You've earned {score * 5} XP for this challenge!</p>
              <div className="d-flex gap-3 justify-content-center">
                <button onClick={() => window.location.reload()} className="btn btn-outline-light rounded-pill px-4 d-flex align-items-center gap-2">
                  <RotateCcw size={18} /> Retake Test
                </button>
                <button onClick={() => window.location.href='/dashboard'} className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2">
                  Go to Dashboard <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MCQTest;
