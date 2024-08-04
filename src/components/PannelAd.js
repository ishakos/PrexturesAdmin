import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";

export default function PannelAd() {
  const [fixtures, setFixtures] = useState([]);
  //teams data without logo
  const [getClubs, setGetClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setlectedFixture, setSelectedFixture] = useState(1);
  const [inputs, setInputs] = useState(
    Array.from({ length: 10 }, () => ({ input1: "", input2: "" }))
  );
  const [error, setError] = useState("Fill the slots");
  const [token, setToken] = useState(sessionStorage.getItem("adminAccess"));
  let navigate = useNavigate();

  const increment = () => {
    if (setlectedFixture < 38) {
      setSelectedFixture((prevCount) => prevCount + 1);
      setError("Fill the slots");
    }
  };

  const decrement = () => {
    if (setlectedFixture > 1) {
      setSelectedFixture((prevCount) => prevCount - 1);
      setError("Fill the slots");
    }
  };

  const handleInputChange = (index, inputKey, value) => {
    if (/^\d{0,2}$/.test(value)) {
      const newInputs = [...inputs];
      newInputs[index] = { ...newInputs[index], [inputKey]: value };
      setInputs(newInputs);
    }
  };

  //Verifying the token (1st render)
  useEffect(() => {
    const token = sessionStorage.getItem("adminAccess");
    if (!token) {
      alert("Admin Not Logged In");
      navigate("/");
    }
  }, [navigate]);

  //getting (clubs + fixtures) data
  useEffect(() => {
    axios
      .get(
        "https://api.render.com/deploy/srv-cqnc7p2j1k6c73antgmg?key=Ge-HqoTj4OY/scores/teams"
      )
      .then((response) => {
        if (response.data.teams) {
          setGetClubs(response.data.teams);
        }
      });
    axios
      .get(
        "https://api.render.com/deploy/srv-cqnc7p2j1k6c73antgmg?key=Ge-HqoTj4OY/scores/fixtures"
      )
      .then((response) => {
        if (response.data.fixtures) {
          setFixtures(response.data.fixtures);
        }
      });
  }, []);

  //whenever token is deleted we perform an action
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.storageArea === sessionStorage && event.key === "adminAccess") {
        if (event.newValue === null) {
          setToken(null);
          alert("Admin Not Logged In");
          navigate("/");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    //cleanup function
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [token, navigate]);

  //the loading state
  useEffect(() => {
    if (fixtures.length === 38 && getClubs.length === 20) {
      setLoading(false);
    }
  }, [fixtures, getClubs]);

  //managing the defaults values of the inputs
  useEffect(() => {
    let initialInputs = Array.from({ length: 10 }, () => ({
      input1: "",
      input2: "",
    }));
    setInputs(initialInputs);
  }, [setlectedFixture]);

  //to fill the options available f select (from 1 to 38)
  const options = Array.from({ length: 38 }, (_, i) => i + 1);

  const onUpdate = () => {
    let playerData = [];
    for (let i = 0; i < inputs.length; i++) {
      //if not valid, nothing will happen
      if (
        !inputs[i].input1 ||
        !inputs[i].input2 ||
        isNaN(inputs[i].input1) ||
        isNaN(inputs[i].input2) ||
        inputs[i].input1 === "" ||
        inputs[i].input2 === ""
      ) {
        //if the inputs are not valid, were gonna send a request with this playerData
        playerData = ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
        break;
      } else {
        //incase user type starting with digit 0, "01" = "1"
        let L = inputs[i].input1,
          R = inputs[i].input2;
        if (L[0] === "0" && L.length > 1) {
          L = L[1];
        }
        if (R[0] === "0" && R.length > 1) {
          R = R[1];
        }
        playerData.push(`${L}-${R}`);
      }
    }
    //function to check the pattern: "10-1" or "2-3"
    function isValidDigitDashDigit(str) {
      const regex = /^\d{1,2}-\d{1,2}$/;
      return regex.test(str);
    }
    //function to check the pattern for each string in the array
    function allStringsMatchSchema(arr) {
      for (let i = 0; i < arr.length; i++) {
        if (!isValidDigitDashDigit(arr[i])) {
          return false;
        }
      }
      return true;
    }
    if (!allStringsMatchSchema(playerData)) {
      setError("invalid inputs, please enter proper digits");
    }
    const token = sessionStorage.getItem("adminAccess");
    if (!token) {
      alert("Admin Not Logged In");
      navigate("/");
    }
    //if all inputs valid we will send the request
    const data = {
      number: setlectedFixture,
      arrayData: playerData,
    };
    const config = {
      headers: {
        adminAccess: token || "",
      },
    };
    axios
      .post(
        "https://api.render.com/deploy/srv-cqnc7p2j1k6c73antgmg?key=Ge-HqoTj4OY/admin/fulltime",
        data,
        config
      )
      .then((response) => {
        if (response.data.error) {
          setError(response.data.error);
        } else {
          //checks if inputs are valid to update the error message
          let updatedFixturePrediction = [];
          for (let index = 0; index < inputs.length; index++) {
            if (inputs[index].input1 === "-" || inputs[index].input2 === "-") {
              //invalid
              updatedFixturePrediction = [
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                setError("invalid inputs, please enter proper digits"),
              ];
              break;
            } else {
              updatedFixturePrediction.push(
                `${inputs[index].input1}-${inputs[index].input2}`
              );
            }
          }
          if (!updatedFixturePrediction.includes("-")) {
            setError("Updated");
          }
        }
      });
  };

  return (
    <>
      {loading ? (
        <p>fixtures loading...</p>
      ) : (
        <MainPage
          setlectedFixture={setlectedFixture}
          options={options}
          increment={increment}
          decrement={decrement}
          fixtures={fixtures}
          handleInputChange={handleInputChange}
          inputs={inputs}
          onUpdate={onUpdate}
          clubs={getClubs}
          error={error}
        />
      )}
    </>
  );
}

function MainPage({
  setlectedFixture,
  error,
  increment,
  decrement,
  fixtures,
  handleInputChange,
  inputs,
  onUpdate,
  clubs,
}) {
  return (
    <section className="player">
      <div className="fixTable">
        <header>
          <button className="move" onClick={decrement}>
            Prev
          </button>
          <p>
            <span>Gameweek {setlectedFixture} : </span>
            {` ${new Date(
              fixtures[setlectedFixture - 1].deadline
            ).toLocaleString()}`}
          </p>
          <button className="move" onClick={increment}>
            Next
          </button>
        </header>
        <div className="footerP1">
          {fixtures[setlectedFixture - 1].matches.map((match, index) => {
            return (
              <div className="match" key={match.numM}>
                {clubs.map((team) => {
                  if (team.shortname === match.home) {
                    return (
                      <aside className="team" key={0}>
                        <p>{team.name}</p>
                      </aside>
                    );
                  } else {
                    return null;
                  }
                })}
                <div className="score">
                  <>
                    <input
                      className="num"
                      type="text"
                      value={inputs[index].input1}
                      onChange={(e) =>
                        handleInputChange(index, "input1", e.target.value)
                      }
                    />
                    <label> - </label>
                    <input
                      className="num"
                      type="text"
                      value={inputs[index].input2}
                      onChange={(e) =>
                        handleInputChange(index, "input2", e.target.value)
                      }
                    />
                  </>
                </div>
                {clubs.map((team) => {
                  if (team.shortname === match.away) {
                    return (
                      <aside className="team" key={1}>
                        <p>{team.name}</p>
                      </aside>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="save-button">
        <button className="move" onClick={onUpdate}>
          save
        </button>
      </div>
      <div className="welcome">
        <p>Fill everything then save - admin</p>
        <p>{error}</p>
      </div>
    </section>
  );
}
