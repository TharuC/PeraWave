import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';
import '../styles/gallery.css';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  content: string;
  imageUrls: string[];
  createdAt: string;
  author: { fullName: string; email: string };
}

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const token = getToken();
  const isLoggedIn = !!token;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${API_URL}/api/gallery`);
        if (res.ok) {
          setItems(await res.json());
        }
      } catch (err) {
        console.error('Failed to load gallery items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filtered = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const excerpt = (text: string | undefined, max = 120) => {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '...' : text;
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'DRAWING': return 'gallery-category-drawing';
      case 'POEM': return 'gallery-category-poem';
      case 'STORY': return 'gallery-category-story';
      case 'OTHER': return 'gallery-category-other';
      default: return 'gallery-category-other';
    }
  };

  const categoryLabels: Record<string, string> = {
    ALL: 'All',
    DRAWING: 'Drawings',
    POEM: 'Poems',
    STORY: 'Stories',
    OTHER: 'Other',
  };

  return (
    <div className="gallery-page">
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

      <div className="gallery-container">
        {/* Page Header */}
        <div className="gallery-page-header">
          <div className="gallery-badge">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
            </svg>
            Art Gallery
          </div>
          <h1>Creative Expressions</h1>
          <p>
            Explore drawings, poems, stories, and other creative works shared by our university community.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="gallery-actions-bar">
          <div className="gallery-filters">
            {['ALL', 'DRAWING', 'POEM', 'STORY', 'OTHER'].map(cat => (
              <button
                key={cat}
                className={`gallery-filter-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              className="gallery-search-input"
              type="text"
              placeholder="Search by title…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              className="gallery-create-btn"
              onClick={() => {
                if (isLoggedIn) navigate('/create-gallery');
                else navigate('/login');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Share Your Creation
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="gallery-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="gallery-item-card" style={{ cursor: 'default' }}>
                <div className="gallery-skeleton" style={{ height: 220 }} />
                <div className="gallery-card-body">
                  <div className="gallery-skeleton" style={{ height: 20, width: '40%', marginBottom: 12, borderRadius: 999 }} />
                  <div className="gallery-skeleton" style={{ height: 24, marginBottom: 12 }} />
                  <div className="gallery-skeleton" style={{ height: 14, marginBottom: 6 }} />
                  <div className="gallery-skeleton" style={{ height: 14, width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="gallery-empty-state">
            <div className="gallery-empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3>{search || activeCategory !== 'ALL' ? 'No creations matched your search.' : 'No creations yet.'}</h3>
            <p>{search || activeCategory !== 'ALL' ? 'Try different filters.' : 'Be the first to share your creativity!'}</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {filtered.map(item => (
              <div
                key={item.id}
                className="gallery-item-card"
                onClick={() => navigate(`/gallery/${item.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate(`/gallery/${item.id}`)}
              >
                <div className="gallery-image-wrapper">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.title}
                      className="gallery-card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="gallery-card-image-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="gallery-card-body">
                  <span className={`gallery-card-category ${getCategoryClass(item.category)}`}>
                    {item.category}
                  </span>
                  
                  <h3 className="gallery-card-title">{item.title}</h3>
                  {item.content && (
                    <p className="gallery-card-excerpt">{excerpt(item.content)}</p>
                  )}
                  
                  <div className="gallery-card-footer">
                    <span className="gallery-card-author">
                      By {item.author?.fullName || 'Unknown'}
                    </span>
                    <span className="gallery-card-date">{formatDate(item.createdAt)}</span>
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

export default Gallery;
