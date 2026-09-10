import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api";

function App() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "Road",
    description: "",
    location: "",
  });

  const fetchComplaints = async () => {
    try {
      const response = await fetch(`${API_URL}/complaints`);
      const data = await response.json();

      setComplaints(data);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      setMessage("Unable to connect to backend");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to create complaint");
        return;
      }

      setMessage("Complaint submitted successfully");

      setForm({
        title: "",
        category: "Road",
        description: "",
        location: "",
      });

      fetchComplaints();
    } catch (error) {
      console.error("Failed to create complaint:", error);
      setMessage("Unable to connect to backend");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Complaint System</h1>
        <p>Report and track municipal complaints</p>
      </header>

      <main className="container">
        <section className="card">
          <h2>Submit a Complaint</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Complaint title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="Road">Road</option>
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
              <option value="Garbage">Garbage</option>
              <option value="Other">Other</option>
            </select>

            <textarea
              name="description"
              placeholder="Describe the problem"
              value={form.description}
              onChange={handleChange}
              rows="4"
              required
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
            />

            <button type="submit">Submit Complaint</button>
          </form>

          {message && <p className="message">{message}</p>}
        </section>

        <section className="card">
          <div className="section-header">
            <h2>Complaints</h2>

            <button onClick={fetchComplaints}>
              Refresh
            </button>
          </div>

          {complaints.length === 0 ? (
            <p>No complaints found.</p>
          ) : (
            <div className="complaint-list">
              {complaints.map((complaint) => (
                <article className="complaint" key={complaint.id}>
                  <h3>{complaint.title}</h3>

                  <p>
                    <strong>Category:</strong>{" "}
                    {complaint.category}
                  </p>

                  <p>
                    <strong>Description:</strong>{" "}
                    {complaint.description}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    {complaint.location}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {complaint.status}
                  </p>

                  <p>
                    <strong>Priority:</strong>{" "}
                    {complaint.priority}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;