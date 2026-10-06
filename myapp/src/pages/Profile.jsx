import { useEffect, useState } from "react";
import { useCourse } from "../context/CourseContext";
import { API_BASE } from "../config";

function Profile() {
  const [profile, setProfile] = useState({});
  const { selectedCourse } = useCourse();

  useEffect(() => {
    const username = localStorage.getItem("username");

    fetch(`${API_BASE}/progress/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">👤 Student Profile</h1>

      <div className="card shadow border-0 p-4">
        <div className="text-center">
          <h2>{profile.username || "Loading..."}</h2>
          <p className="text-muted">{selectedCourse?.name || "LMS"} Student</p>
        </div>

        <hr />

        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm text-center p-3">
              <h4>🏆 Level</h4>
              <h5>{profile.level || "Beginner"}</h5>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow-sm text-center p-3">
              <h4>⭐ Score</h4>
              <h5>{profile.score ?? 0}</h5>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow-sm text-center p-3">
              <h4>📈 Progress</h4>
              <h5>{profile.progress ?? 0}%</h5>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow-sm text-center p-3">
              <h4>🏅 Badge</h4>
              <h5>
                {(profile.score ?? 0) >= 25
                  ? `🥇 Gold ${selectedCourse?.technology || "Course"} Master`
                  : (profile.score ?? 0) >= 10
                  ? "🥈 Silver Coder"
                  : "🥉 Bronze Learner"}
              </h5>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow-sm text-center p-3">
              <h4>🏆 Rank</h4>
              <h5>Top {(profile.score ?? 0) > 10 ? "10%" : "50%"}</h5>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow-sm text-center p-3">
              <h4>🔥 Streak</h4>
              <h5>{profile.streak ?? 1} Days</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
