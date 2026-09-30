import { createContext, useContext, useState, useEffect } from "react";

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

  // Fetch all published courses on mount
  useEffect(() => {
    fetch("http://127.0.0.1:8000/courses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data);
          // If current selected course no longer exists in the list, reset
          const stillExists = data.find((c) => c.id === selectedCourse.id);
          if (!stillExists) {
            setSelectedCourseState(data[0]);
          }
        }
      })
      .catch(() => {
        // Backend not reachable — keep defaults
      });
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
    <CourseContext.Provider value={{ selectedCourse, setSelectedCourse, courses }}>
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
