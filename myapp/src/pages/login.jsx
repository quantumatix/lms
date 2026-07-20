import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const loginUser = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();
      if (data.message === "Login Successful") {
   
        localStorage.setItem("username", email);
        localStorage.setItem("userRole", data.role);

        console.log("Saved username:", email, "Role:", data.role);
        
        setMessage("Login Successful");

        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }

}  
 else {

        setMessage(data.message);

      }

    } catch (error) {

      console.log(error);

      setMessage("Backend Connection Error (Port 8000). Did you start the backend server?");

    }
  };

  return (
  <div className="container mt-5">

    <div className="row justify-content-center">

      <div className="col-md-5">

        <div className="card shadow p-4">

          <h2 className="text-center mb-4">
            AI-Powered Python LMS
          </h2>

          <input
            className="form-control mb-3"
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="form-control mb-3"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="btn btn-primary w-100"
            onClick={loginUser}
          >
            Login
          </button>

          <h5 className="text-center mt-3">
            {message}
          </h5>

        </div>

      </div>

    </div>

  </div>
);
}
export default Login;