import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useCourse } from "../context/CourseContext";
import { 
  ClipboardCheck, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  HelpCircle,
  BarChart
} from "lucide-react";
import { API_BASE } from "../config";

function Assessment() {
  const { selectedCourse } = useCourse();
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState("");
  const [answers, setAnswers] = useState({});

  const questions = [
    { id: 1, text: "Do you know Variables and Data Types?", topic: "Fundamentals" },
    { id: 2, text: "Are you comfortable with for/while Loops?", topic: "Control Flow" },
    { id: 3, text: "Can you define and use Functions?", topic: "Functions" },
    { id: 4, text: "Do you understand Classes and Inheritance?", topic: "OOP" },
    { id: 5, text: "Have you worked with external Modules or APIs?", topic: "Advanced" }
  ];

  const handleAnswer = (qid, val) => {
     const newAnswers = {...answers, [qid]: val};
     setAnswers(newAnswers);
     
     // Recalculate score based on 'yes' answers
     const newScore = Object.values(newAnswers).filter(v => v === true).length;
     setScore(newScore);
  };

  const calculateLevel = async () => {
    let studentLevel = "Beginner";
    if (score >= 4) studentLevel = "Advanced";
    else if (score >= 2) studentLevel = "Intermediate";

    setLevel(studentLevel);

    try {
      const username = localStorage.getItem("username") || "Learner";
      await fetch(API_BASE + "/save-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          level: studentLevel,
        }),
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: "260px", padding: "40px" }}>
        <div className="container-fluid" style={{ maxWidth: "800px" }}>
          
          <div className="text-center mb-5">
            <div className="bg-primary-light text-primary p-3 rounded-circle d-inline-flex mb-3 shadow-sm">
              <ClipboardCheck size={32} />
            </div>
            <h1 className="display-6 fw-bold text-dark mb-2">Initial Assessment</h1>
            <p className="text-muted">Tell us what you already know so we can customize your {selectedCourse?.name || "learning"} path.</p>
          </div>

          <div className="d-flex flex-column gap-3 mb-5">
            {questions.map((q) => (
              <div key={q.id} className="card border-0 shadow-sm rounded-4 p-4 hover-lift">
                 <div className="d-flex align-items-center justify-content-between">
                    <div>
                       <div className="text-primary small fw-bold mb-1">{q.topic}</div>
                       <h5 className="fw-bold text-dark mb-0">{q.text}</h5>
                    </div>
                    <div className="d-flex gap-2">
                       <button 
                         onClick={() => handleAnswer(q.id, true)} 
                         className={`btn rounded-pill px-4 btn-sm fw-bold ${answers[q.id] === true ? 'btn-primary' : 'btn-outline-primary'}`}
                       >
                         Yes
                       </button>
                       <button 
                         onClick={() => handleAnswer(q.id, false)} 
                         className={`btn rounded-pill px-4 btn-sm fw-bold ${answers[q.id] === false ? 'btn-dark' : 'btn-outline-dark'}`}
                       >
                         No
                       </button>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          <div className="text-center">
             <button 
               onClick={calculateLevel} 
               disabled={Object.keys(answers).length < questions.length}
               className="btn btn-primary px-5 py-3 rounded-pill fw-bold shadow-lg d-inline-flex align-items-center gap-2"
             >
               Finalize Assessment <ChevronRight size={20} />
             </button>
          </div>

          {level && (
            <div className="mt-5 card border-0 shadow-lg rounded-4 p-5 bg-dark text-white text-center animate-fade-in">
               <BarChart size={48} className="text-primary mx-auto mb-3" />
               <h6 className="text-secondary fw-bold text-uppercase small mb-2">Recommended Path</h6>
               <h2 className="display-5 fw-bold mb-4">Your Level: <span className="text-primary">{level}</span></h2>
               <p className="text-secondary mb-4">We've tailored the curriculum to match your profile. Start with the recommended lessons to optimize your progress.</p>
               <button onClick={() => window.location.href='/lessons'} className="btn btn-primary rounded-pill px-5 fw-bold">
                 Start Learning
               </button>
            </div>
          )}

          <div className="mt-5 bg-light-subtle p-4 rounded-4 border border-light d-flex align-items-start gap-3">
             <HelpCircle size={24} className="text-muted mt-1" />
             <div>
                <h6 className="fw-bold text-dark mb-1">Why this assessment?</h6>
                <p className="text-muted small mb-0">This helps our AI prioritize specific topics for you. Don't worry, you can still access the complete {selectedCourse?.name || "course"} syllabus at any level.</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Assessment;
