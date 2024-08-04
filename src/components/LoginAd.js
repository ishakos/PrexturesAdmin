import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";

export default function LoginAd() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error1, setError1] = useState(false);
  const [error2, setError2] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    sessionStorage.clear();
  }, []);

  const login = () => {
    const data = { username: username, password: password };
    axios
      .post("https://prexturesserver.onrender.com/admin/", data)
      .then((response) => {
        if (!response.data.error) {
          sessionStorage.setItem("adminAccess", response.data);
          navigate("/admin");
        } else {
          if (response.data.error === "Admin Does Not Exist!") {
            setError1(true);
          } else {
            setError2(true);
          }
        }
      });
  };

  return (
    <div className="login-page">
      <div className="form">
        <Form
          error1={error1}
          error2={error2}
          setError1={setError1}
          setError2={setError2}
          setUsername={setUsername}
          setPassword={setPassword}
          login={login}
        />
      </div>
    </div>
  );
}

function Form({
  error1,
  error2,
  setError1,
  setError2,
  setUsername,
  setPassword,
  login,
}) {
  return (
    <div className="login-form">
      <Hint1 error1={error1} />
      <input
        type="text"
        placeholder="username"
        onSelect={() => {
          setError1(() => !true);
          setError2(() => !true);
        }}
        onChange={(event) => {
          setUsername(event.target.value);
        }}
      />
      <Hint2 error2={error2} />
      <input
        type="password"
        placeholder="password"
        onSelect={() => {
          setError1(() => !true);
          setError2(() => !true);
        }}
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />
      <button style={{ background: "blue" }} onClick={login}>
        Login
      </button>
    </div>
  );
}

function Hint1({ error1 }) {
  return (
    <>
      {error1 ? (
        <span className="error-username">User Does Not Exist</span>
      ) : (
        <></>
      )}
    </>
  );
}

function Hint2({ error2 }) {
  return (
    <>
      {error2 ? <span className="error-username">Wrong Password</span> : <></>}
    </>
  );
}
