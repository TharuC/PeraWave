import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  status: string;
  createdAt: string;
  updatedAt: string;
  author: { fullName: string; faculty: string };
}

const WikiArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const token = getToken();
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`${API_URL}/api/wiki/${id}`);
        if (res.ok) {
          setArticle(await res.json());
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  if (loading) {
    return (
      <div className="wiki-detail-page">
        <Navbar isLoggedIn={isLoggedIn} onLogout={() => { clearToken(); navigate('/'); }} userName="" userAvatar="" notifications={[]} unreadCount={0} onMarkAllRead={() => {}} userRole="USER" />
        <div className="wiki-detail-container">
          <div className="wiki-skeleton" style={{ height: 40, width: '30%', marginBottom: 32 }} />
          <div className="wiki-detail-card">
            <div className="wiki-skeleton" style={{ height: 380 }} />
            <div style={{ padding: '40px' }}>
              <div className="wiki-skeleton" style={{ height: 20, width: '50%', marginBottom: 20 }} />
              <div className="wiki-skeleton" style={{ height: 40, marginBottom: 24 }} />
              <div className="wiki-skeleton" style={{ height: 16, marginBottom: 8 }} />
              <div className="wiki-skeleton" style={{ height: 16, marginBottom: 8 }} />
              <div className="wiki-skeleton" style={{ height: 16, width: '70%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="wiki-detail-page">
        <Navbar isLoggedIn={isLoggedIn} onLogout={() => { clearToken(); navigate('/'); }} userName="" userAvatar="" notifications={[]} unreadCount={0} onMarkAllRead={() => {}} userRole="USER" />
        <div className="wiki-detail-container" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div className="wiki-empty-icon" style={{ margin: '0 auto 24px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#24292f', margin: '0 0 8px' }}>Article Not Found</h3>
          <p style={{ color: '#57606a', marginBottom: '24px' }}>This article may have been removed or is awaiting approval.</p>
          <button className="wiki-btn-primary" onClick={() => navigate('/wiki')}>Browse Wiki</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wiki-detail-page">
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

      <div className="wiki-detail-container">
        <button
          className="wiki-detail-back"
          onClick={() => navigate('/wiki')}
          id="wiki-back-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Wiki
        </button>

        <div className="wiki-detail-card">
          {/* Hero image */}
          {article.imageUrls.length > 0 ? (
            <>
              <img
                src={article.imageUrls[activeImg]}
                alt={article.title}
                className="wiki-detail-hero-img"
              />
              {article.imageUrls.length > 1 && (
                <div className="wiki-detail-gallery">
                  {article.imageUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Image ${idx + 1}`}
                      className={activeImg === idx ? 'active' : ''}
                      onClick={() => setActiveImg(idx)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : null}

          <div className="wiki-detail-body">
            {/* Meta */}
            <div className="wiki-detail-meta">
              {article.location && (
                <span className="wiki-detail-location-tag">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {article.location}
                </span>
              )}
              <span className="wiki-detail-date">Published {formatDate(article.createdAt)}</span>
              <span className="wiki-detail-author">
                by <strong>{article.author?.fullName || 'Unknown'}</strong>
                {article.author?.faculty ? ` · ${article.author.faculty}` : ''}
              </span>
            </div>

            {/* Title */}
            <h1 className="wiki-detail-title">{article.title}</h1>

            {/* Content */}
            <div className="wiki-detail-content">{article.content}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WikiArticleDetail;
