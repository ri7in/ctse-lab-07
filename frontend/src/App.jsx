import { useState, useEffect } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const FLAG_EMOJI = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
  AUD: "🇦🇺", SGD: "🇸🇬", CAD: "🇨🇦", CHF: "🇨🇭",
};

function App() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [ratesRes, healthRes] = await Promise.all([
          fetch(`${API_URL}/api/rates`),
          fetch(`${API_URL}/health`),
        ]);
        const ratesData = await ratesRes.json();
        const healthData = await healthRes.json();
        setRates(ratesData.rates);
        setLastUpdated(new Date(ratesData.updatedAt).toLocaleString());
        setHealth(healthData);
      } catch (err) {
        setError("Cannot connect to gateway service.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <div>
              <h1>FX Rate Dashboard</h1>
              <p>Live Exchange Rates · LKR Base</p>
            </div>
          </div>
          <div className="status-badge">
            <span className={`dot ${health ? "green" : "red"}`}></span>
            {health ? "Gateway Online" : "Gateway Offline"}
          </div>
        </div>
      </header>

      <main className="main">
        {loading && <div className="state-msg">⏳ Loading rates...</div>}
        {error && <div className="state-msg error">⚠️ {error}</div>}

        {rates && (
          <>
            <div className="meta">
              <span>Last updated: {lastUpdated}</span>
              <span className="tag">Base currency: LKR</span>
            </div>

            <div className="grid">
              {Object.entries(rates).map(([currency, data]) => (
                <div className="card" key={currency}>
                  <div className="card-header">
                    <span className="flag">{FLAG_EMOJI[currency] || "🌐"}</span>
                    <span className="currency-code">{currency}</span>
                  </div>
                  <div className="mid-rate">{data.mid.toFixed(2)}</div>
                  <div className="sub-rates">
                    <div className="sub-rate buying">
                      <label>BUY</label>
                      <span>{data.buying.toFixed(2)}</span>
                    </div>
                    <div className="sub-rate selling">
                      <label>SELL</label>
                      <span>{data.selling.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <p>Azure Microservices Lab · SLIIT SE4010 · Deployed on Azure Container Apps + Static Web Apps</p>
      </footer>
    </div>
  );
}

export default App;
