import { useEffect, useState } from "react";

function Leaderboard() {

const [students, setStudents] = useState([]);

useEffect(() => {


fetch("http://127.0.0.1:8000/leaderboard")
  .then((res) => res.json())
  .then((data) => {
    setStudents(data);
  })
  .catch((err) => console.log(err));


}, []);

return (


<div className="container mt-4">

<div className="text-center mb-4">

  <i
    className="bi bi-trophy-fill"
    style={{
      fontSize: "70px",
      color: "gold"
    }}
  ></i>

  <h1 className="mt-2">
    Leaderboard
  </h1>

</div>

  <div className="card shadow">

    <div className="card-body">

      <table className="table table-striped">

        <thead>

          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Score</th>
            <th>Level</th>
          </tr>

        </thead>

        <tbody>

          {students.map((student, index) => (

            <tr key={index}>

              <td>#{index + 1}</td>

              <td>
                {student.username}
              </td>

              <td>
                {student.score}
              </td>

              <td>
                {student.level}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>

</div>


);

}

export default Leaderboard;
