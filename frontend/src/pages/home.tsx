import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <section>
      <h2>Welcome to Speech Dojo</h2>
      <p>Choose a topic, start a realtime coaching session, then review your history and replay recordings.</p>
      <div style={{ marginTop: "1rem" }}>
        <Link to="/session">
          <button>Start a Session</button>
        </Link>{" "}
        <Link to="/history">
          <button>View History</button>
        </Link>
      </div>
    </section>
  );
}
