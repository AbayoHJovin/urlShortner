import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = sessionStorage.getItem("user");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  const [resp, setResp] = useState("");
  const [userData, setUserdata] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!token) {
      navigate("/start");
    }
  }, []);
  useEffect(() => {
    fetch(`http://localhost:1024/${user}`, {
      method: "GET",
      headers: { authorization: `Bearer ${token}` },
    })
      .then((data) => data.json())
      .then((userDetails) => {
        setUsername(userDetails.userData.username);
      })
      .catch((e) => console.log("error", e));
  }, []);
  function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/start");
  }
  function shorten() {
    fetch("http://localhost:1024/shortenUrl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        originalUrl: url,
        userId: user,
      }),
    })
      .then((data) => data.json())
      .then((response) => {
        const newUrl = response.url;
        setResp(newUrl);
      });
  }
  function showHistory() {
    fetch(`http://localhost:1024/all/${user}`)
      .then((data) => data.json())
      .then((response) => {
        setUserdata((prev) => [...prev, response.response]);
        userData[0].map((item) => {
          setTableRows((prev) => [...prev, item]);
        });
        setShow(true);
      })
      .catch((e) => console.log("error:", e));
  }
  const link = `http://localhost:1024/?short=${resp}`;
  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-center text-6xl">Hello {username}</h1>
      <h2 className="text-center mt-12">Are you ready to shorten your URL?</h2>
      <div className="max-sm:flex-col md:flex justify-center items-center mt-10">
        <input
          type="text"
          className="px-5 py-2 rounded-md text-black w-full max-w-lg"
          placeholder="Type or paste a link here"
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={shorten}
          className="bg-green-900 px-5 py-2 rounded-md ml-4"
        >
          Shorten
        </button>
      </div>
      <h1 className="text-center mt-10">
        This is the short link:{" "}
        <a href={link} target="_blank">
          {resp}
        </a>
      </h1>
      <button
        onClick={showHistory}
        className="bg-green-900 px-5 py-2 rounded-md mx-auto mt-4 block"
      >
        See History
      </button>
      {show ? (
        <div>
          <table className="border w-3/4 ml-10 mt-10 table-auto">
            <tr className="border">
              <th className="border">Full url</th>
              <th className="border">Short url</th>
            </tr>
            {tableRows.map((item) => (
              <tr key={item.shortenedCode} className="border">
                <td className="border">{item.originalUrl}</td>
                <td>
                  <a
                    href={`http://localhost:1024/?short=${item.shortenedCode}`}
                    target="_blank"
                  >
                    {item.shortenedCode}
                  </a>
                </td>
              </tr>
            ))}
          </table>
        </div>
      ) : null}
      <button
        onClick={logout}
        className="bg-red-900 px-5 py-2 rounded-md mx-auto mt-4 block"
      >
        Logout
      </button>
    </div>
  );
}
