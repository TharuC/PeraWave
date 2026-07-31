import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';
import '../styles/wiki.css';

interface Article {
  id: number;
  title: string;
  content: string;
  location?: string;
  imageUrls: string[];
  createdAt: string;
  author: { fullName: string; faculty: string };
}

const WikiList: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const token = getToken();
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${API_URL}/api/wiki`);
        if (res.ok) {
          setArticles(await res.json());
        }
      } catch (err) {
        console.error('Failed to load wiki articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.location ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const excerpt = (text: string, max = 120) =>
    text.length > max ? text.slice(0, max) + '...' : text;

  return (
    <div className="wiki-page">
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={() => { clearToken(); navigate('/'); }}
        userName=""
        userAvatar=""
        notifications={[]}
        unreadCount={0}
        onMarkAllRead={() => {}}
        userRole="USER"
      />

      <div className="wiki-container">
        {/* Page Header */}
        <div className="wiki-page-header">
          <div className="wiki-badge">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Pera Wiki
          </div>
          <h1>University Heritage &amp; Places</h1>
          <p>
            Discover the rich history and iconic landmarks of the University of Peradeniya,
            documented by our community.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="wiki-actions-bar">
          <input
            className="wiki-search-input"
            type="text"
            placeholder="Search articles or locations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="wiki-search"
          />
          {isLoggedIn ? (
            <button
              id="wiki-create-btn"
              className="wiki-create-btn"
              onClick={() => navigate('/create-wiki')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Write an Article
            </button>
          ) : (
            <p className="wiki-login-hint">
              <a href="/login">Log in</a> to contribute an article
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="wiki-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="wiki-article-card" style={{ cursor: 'default' }}>
                <div className="wiki-skeleton" style={{ height: 200 }} />
                <div className="wiki-card-body">
                  <div className="wiki-skeleton" style={{ height: 14, width: '40%', marginBottom: 10 }} />
                  <div className="wiki-skeleton" style={{ height: 20, marginBottom: 8 }} />
                  <div className="wiki-skeleton" style={{ height: 14, marginBottom: 4 }} />
                  <div className="wiki-skeleton" style={{ height: 14, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="wiki-empty-state">
            <div className="wiki-empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3>{search ? 'No articles matched your search.' : 'No articles yet.'}</h3>
            <p>{search ? 'Try different keywords.' : 'Be the first to document a piece of university history!'}</p>
          </div>
        ) : (
          <div className="wiki-grid">
            {filtered.map(article => (
              <div
                key={article.id}
                className="wiki-article-card"
                onClick={() => navigate(`/wiki/${article.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/wiki/${article.id}`)}
              >
                {article.imageUrls.length > 0 ? (
                  <img
                    src={article.imageUrls[0]}
                    alt={article.title}
                    className="wiki-card-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="wiki-card-image-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                )}

                <div className="wiki-card-body">
                  {article.location && (
                    <div className="wiki-card-location">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {article.location}
                    </div>
                  )}
                  <h3 className="wiki-card-title">{article.title}</h3>
                  <p className="wiki-card-excerpt">{excerpt(article.content)}</p>
                  <div className="wiki-card-footer">
                    <span className="wiki-card-date">{formatDate(article.createdAt)}</span>
                    <span className="wiki-read-more">
                      Read more →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WikiList;
