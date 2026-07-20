import { useState } from "react";

function Signup() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

 const signupUser = async () => {

  try {

    console.log("Signup button clicked");

    const response = await fetch(
      "http://127.0.0.1:8000/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    console.log(data);

    setMessage(data.message);

  } catch (error) {

    console.log("ERROR:", error);

    setMessage("Backend Connection Error (Port 8000). Did you start the backend server?");

  }

};

  return (

    <div>

      <h1>Signup Page</h1>

      <input
        type="text"
        placeholder="Enter Name"
        onChange={(e) => setName(e.target.value)}
      />

      <br /><br />

      <input
        type="email"
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Enter Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={signupUser}>
        Signup
      </button>

      <h2>{message}</h2>

    </div>
  );
}

export default Signup;