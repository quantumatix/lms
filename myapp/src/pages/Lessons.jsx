import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Search,
  Sword,
} from "lucide-react";
import { useCourse } from "../context/CourseContext";

function Lessons() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username");
  const { selectedCourse } = useCourse();

  useEffect(() => {
    setLoading(true);
    const courseParam = selectedCourse?.id ? `&course_id=${selectedCourse.id}` : "";
    fetch(`http://127.0.0.1:8000/lessons?username=${username}${courseParam}`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, [username, selectedCourse]);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar />
      <div className="flex-grow-1" style={{ marginLeft: "260px", padding: "40px" }}>
        <div className="container-fluid" style={{ maxWidth: "1200px" }}>
          
          <div className="mb-5 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="fw-bold text-dark mb-1 h2">Lessons</h1>
              <p className="text-muted mb-0">Explore all lessons for {selectedCourse?.name || "Python Core"}.</p>
            </div>
            <Link 
              to="/coding-practice" 
              className="btn text-white fw-bold px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2 border-0"
              style={{ backgroundColor: "#4f46e5" }}
            >
              <Sword size={18} /> Coding Challenges Lab
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : categories.length === 0 ? (
            <div className="bg-white rounded-4 shadow-sm border p-5 text-center my-4">
              <div className="bg-primary-light text-primary rounded-circle d-inline-flex p-3 mb-3" style={{ backgroundColor: '#eff6ff' }}>
                <BookOpen size={36} style={{ color: '#4f46e5' }} />
              </div>
              <h4 className="fw-bold text-dark mb-2">No Lessons Found</h4>
              <p className="text-muted mb-0" style={{ maxWidth: '480px', margin: '0 auto' }}>
                There are currently no lessons published for <strong>{selectedCourse?.name || 'this course'}</strong>. Please select another course or check back soon!
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-5">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <div className="d-flex align-items-center gap-2 mb-4">
                     <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px", fontSize: "12px", backgroundColor: "#4f46e5" }}>
                       {cat.title[0]}
                     </div>
                     <h4 className="fw-bold mb-0 text-dark">{cat.title}</h4>
                  </div>

                  <div className="row g-4">
                    {cat.lessons.map((lesson) => (
                      <div key={lesson.id} className="col-md-6 col-lg-4">
                        <Link to={`/lessons/${lesson.id}`} className="text-decoration-none">
                          <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift position-relative overflow-hidden">
                            <div className="card-body p-4">
                              <div className="d-flex justify-content-between mb-3">
                                <div className="bg-primary-light text-primary p-2 rounded-3" style={{ backgroundColor: "#eff6ff" }}>
                                  <BookOpen size={20} className="text-primary" style={{ color: "#4f46e5" }} />
                                </div>
                                <CheckCircle2 size={18} className={lesson.completed ? "text-success" : "text-light"} />
                              </div>
                              <h5 className="fw-bold mb-2" style={{ color: "#4f46e5", letterSpacing: "-0.5px" }}>{lesson.title}</h5>
                              <p className="text-muted small mb-3 line-clamp-2" style={{ height: "40px" }}>
                                {lesson.description || "Comprehensive guide to mastering this topic."}
                              </p>
                              <div className="d-flex align-items-center gap-1 text-muted small mb-4">
                                <Clock size={14} /> 10 min
                              </div>
                              
                              <div className="mb-3">
                                <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: "11px" }}>
                                  <span className="fw-bold uppercase">Progress</span>
                                  <span className="fw-bold">{lesson.completed ? "100%" : "0%"}</span>
                                </div>
                                <div className="progress overflow-hidden" style={{ height: "6px", backgroundColor: "#f1f5f9" }}>
                                  <div className="progress-bar bg-primary" style={{ width: lesson.completed ? "100%" : "0%", backgroundColor: "#4f46e5" }}></div>
                                </div>
                              </div>

                              <div className="row g-2 border-top pt-3">
                                <div className="col-6">
                                   <div className="text-muted small uppercase" style={{ fontSize: "10px", fontWeight: "700" }}>Accuracy</div>
                                   <div className="fw-bold text-dark small">{lesson.completed ? "85%" : "0%"}</div>
                                </div>
                                <div className="col-6">
                                   <div className="text-muted small uppercase" style={{ fontSize: "10px", fontWeight: "700" }}>1st Try</div>
                                   <div className="fw-bold text-dark small">{lesson.completed ? "100%" : "0%"}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Lessons;
