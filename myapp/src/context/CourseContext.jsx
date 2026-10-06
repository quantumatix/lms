import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../config";

const CourseContext = createContext(null);

const DEFAULT_COURSE = {
  id: "python-core",
  name: "Python Core",
  technology: "Python",
  level: "Beginner",
  status: "published",
};

export function CourseProvider({ children }) {
  const [selectedCourse, setSelectedCourseState] = useState(() => {
    try {
      const stored = localStorage.getItem("selectedCourse");
      return stored ? JSON.parse(stored) : DEFAULT_COURSE;
    } catch {
      return DEFAULT_COURSE;
    }
  });

  const [courses, setCourses] = useState([DEFAULT_COURSE]);

  const fetchCourseList = () => {
    fetch(API_BASE + "/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
          setSelectedCourseState((current) => {
            const stillExists = data.find((c) => c.id === current.id);
            if (!stillExists) {
              const fallback = data[0];
              try {
                localStorage.setItem("selectedCourse", JSON.stringify(fallback));
              } catch {}
              return fallback;
            }
            return current;
          });
        }
      })
      .catch(() => {
        // Backend not reachable — keep defaults
      });
  };

  // Fetch all published courses on mount and listen to updates
  useEffect(() => {
    fetchCourseList();

    const handleCoursesUpdated = () => {
      fetchCourseList();
    };

    window.addEventListener("courses-updated", handleCoursesUpdated);
    window.addEventListener("focus", handleCoursesUpdated);

    return () => {
      window.removeEventListener("courses-updated", handleCoursesUpdated);
      window.removeEventListener("focus", handleCoursesUpdated);
    };
  }, []);

  const setSelectedCourse = (course) => {
    setSelectedCourseState(course);
    try {
      localStorage.setItem("selectedCourse", JSON.stringify(course));
    } catch {
      // ignore storage errors
    }
  };

  return (
    <CourseContext.Provider value={{ selectedCourse, setSelectedCourse, courses, refreshCourses: fetchCourseList }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error("useCourse must be used inside a CourseProvider");
  }
  return ctx;
}

export default CourseContext;
