import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import "../styles/welcome.css";
import "../styles/wiki.css";

interface WikiPreviewArticle {
  id: number;
  title: string;
  location?: string;
  imageUrls: string[];
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [wikiArticles, setWikiArticles] = useState<WikiPreviewArticle[]>([]);
  const [wikiLoading, setWikiLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/wiki/recent`);
        if (res.ok) setWikiArticles(await res.json());
      } catch {
        // silently fail — show empty state instead
      } finally {
        setWikiLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "var(--bg-main, #f6f8fa)" }}>

      {/* ── Fixed-height hero section ──────────────────────────────── */}
      <div className="welcome-page-container">
        <Navbar />
        <HeroSection />
        <Footer />
      </div>

      {/* ── Pera Wiki preview section — ALWAYS VISIBLE ─────────────── */}
      <section className="wiki-welcome-outer">
        <div className="wiki-welcome-section">

          {/* Section header */}
          <div className="wiki-welcome-header">
            <div className="wiki-welcome-header-left">
              <div className="wiki-welcome-badge">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Pera Wiki
              </div>
              <h2>University Heritage &amp; Places</h2>
              <p>Explore historical &amp; important places within the University of Peradeniya, documented by our community.</p>
            </div>
            <button
              className="wiki-view-all-btn"
              onClick={() => navigate('/wiki')}
              id="wiki-view-all"
            >
              Explore Wiki →
            </button>
          </div>

          {/* Article cards */}
          {wikiLoading ? (
            /* Skeleton loading state */
            <div className="wiki-welcome-grid">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="wiki-welcome-card" style={{ cursor: 'default', pointerEvents: 'none' }}>
                  <div className="wiki-skeleton" style={{ height: 170 }} />
                  <div className="wiki-welcome-card-body">
                    <div className="wiki-skeleton" style={{ height: 16, marginBottom: 8 }} />
                    <div className="wiki-skeleton" style={{ height: 12, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : wikiArticles.length > 0 ? (
            /* Article cards */
            <div className="wiki-welcome-grid">
              {wikiArticles.map(article => (
                <div
                  key={article.id}
                  className="wiki-welcome-card"
                  onClick={() => navigate(`/wiki/${article.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/wiki/${article.id}`)}
                >
                  {article.imageUrls.length > 0 ? (
                    <img
                      src={article.imageUrls[0]}
                      alt={article.title}
                      className="wiki-welcome-card-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="wiki-welcome-card-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                  )}
                  <div className="wiki-welcome-card-body">
                    <h3 className="wiki-welcome-card-title">{article.title}</h3>
                    {article.location && (
                      <div className="wiki-welcome-card-location">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {article.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state — shown when no approved articles yet */
            <div className="wiki-welcome-empty">
              <div className="wiki-welcome-empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3>Be the First to Contribute!</h3>
              <p>
                No articles yet. This section will showcase historical and important places
                within the University of Peradeniya, documented by our community.
              </p>
              <div className="wiki-welcome-empty-actions">
                <button
                  className="wiki-welcome-cta-btn"
                  onClick={() => navigate('/wiki')}
                  id="wiki-browse-btn"
                >
                  Browse Wiki
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Page footer ────────────────────────────────────────────── */}
      <div className="welcome-scroll-footer">
        © {new Date().getFullYear()} PeraWave. All rights reserved. &nbsp;·&nbsp;
        <a href="mailto:support.perawave@gmail.com">support@perawave.com</a>
      </div>
    </div>
  );
};

export default Welcome;