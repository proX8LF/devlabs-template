import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main id="main" className="wrap" style={{ paddingTop: 96, paddingBottom: 96 }}>
      <p className="tech-label">404</p>
      <h1 className="display">Not found.</h1>
      <Link to="/" className="btn" style={{ marginTop: 24 }}>← Home</Link>
    </main>
  );
}
