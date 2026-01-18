import { useEffect, useMemo, useState } from "react";
import ChannelRow from "./components/ChannelRow";
import SectionHeader from "./components/SectionHeader";
import StatCard from "./components/StatCard";
import { DashboardData } from "./data/types";
import { dashboardMock } from "./data/mock";
import { fetchDashboardData } from "./data/twitchClient";

const App = () => {
  const [data, setData] = useState<DashboardData>(dashboardMock);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await fetchDashboardData({ useMock: true });
      setData(response);
      setLoading(false);
    };

    load();
  }, []);

  const trendMax = useMemo(
    () => Math.max(...data.trends.map((point) => point.value), 1),
    [data.trends]
  );

  return (
    <div className="app">
      <header className="hero">
        <nav className="hero__nav">
          <div className="logo">PulseTTV</div>
          <div className="hero__nav-links">
            <button className="ghost-button">Overview</button>
            <button className="ghost-button">Channels</button>
            <button className="ghost-button">Reports</button>
          </div>
          <button className="primary-button">Export Insights</button>
        </nav>
        <div className="hero__content">
          <div>
            <p className="hero__eyebrow">Twitch Intelligence Platform</p>
            <h1>Track performance, trends, and community momentum in real time.</h1>
            <p className="hero__subtitle">
              Build a trusted snapshot of Twitch channel health with actionable
              benchmarks, viewer sentiment, and growth forecasting.
            </p>
            <div className="hero__actions">
              <button className="primary-button">Connect Twitch API</button>
              <button className="secondary-button">View live demo</button>
            </div>
            <div className="hero__badges">
              <span>Multi-region insights</span>
              <span>AI growth scoring</span>
              <span>Customizable alerts</span>
            </div>
          </div>
          <div className="hero__panel">
            <div className="panel__header">
              <p>Live pulse score</p>
              <span className="status-pill">{loading ? "Syncing" : "Updated"}</span>
            </div>
            <div className="panel__score">
              <h2>84</h2>
              <p>out of 100</p>
            </div>
            <div className="panel__footer">
              <div>
                <p>Chat velocity</p>
                <strong>+18%</strong>
              </div>
              <div>
                <p>Retention</p>
                <strong>76%</strong>
              </div>
              <div>
                <p>Subscription</p>
                <strong>+4.1%</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="content">
        <section className="overview">
          <SectionHeader
            title="Performance overview"
            description="Monitor rolling KPIs across viewership, retention, and engagement."
          />
          <div className="stat-grid">
            {data.overview.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        <section className="trends">
          <SectionHeader
            title="Weekly viewer momentum"
            description="Daily peaks mapped to viewer activity across priority segments."
          />
          <div className="trend-card">
            <div className="trend-card__graph">
              {data.trends.map((point) => (
                <div key={point.label} className="trend-card__bar">
                  <span
                    style={{
                      height: `${Math.round((point.value / trendMax) * 100)}%`
                    }}
                  />
                  <p>{point.label}</p>
                </div>
              ))}
            </div>
            <div className="trend-card__insight">
              <h3>Insight</h3>
              <p>
                Weekend co-streams are driving the biggest lift. Consider
                scheduling premium drops between Friday and Saturday for maximum
                conversion.
              </p>
              <button className="secondary-button">Generate report</button>
            </div>
          </div>
        </section>

        <section className="channels">
          <SectionHeader
            title="Channel intelligence"
            description="Compare top performers and identify growth opportunities."
          />
          <div className="channel-table">
            {data.channels.map((channel) => (
              <ChannelRow key={channel.name} {...channel} />
            ))}
          </div>
        </section>

        <section className="activity">
          <SectionHeader
            title="Recent activity"
            description="Automated alerts and milestones captured from the last 24 hours."
          />
          <div className="activity-grid">
            {data.activity.map((item) => (
              <article key={item.title} className="activity-card">
                <span className={`activity-card__accent is-${item.accent}`} />
                <div>
                  <p className="activity-card__time">{item.time}</p>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
