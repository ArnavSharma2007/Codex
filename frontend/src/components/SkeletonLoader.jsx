import React from 'react';

/**
 * Shimmer skeleton loader for cards, text lines, etc.
 *
 * @param {'card'|'text'|'title'|'grid'} type
 * @param {number} count - number of items (for 'text' and 'grid')
 */
export default function SkeletonLoader({ type = 'card', count = 3 }) {
  if (type === 'grid') {
    return (
      <div className="notes-grid" style={{ marginTop: 24 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="note-card" style={{ pointerEvents: 'none' }}>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" style={{ width: '90%' }} />
            <div className="skeleton skeleton-text" style={{ width: '75%' }} />
            <div className="skeleton skeleton-text" style={{ width: '60%' }} />
            <div className="skeleton skeleton-text" style={{ width: '40%', marginTop: 20 }} />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="skeleton skeleton-text"
            style={{ width: `${80 - i * 10}%` }}
          />
        ))}
      </div>
    );
  }

  if (type === 'title') {
    return <div className="skeleton skeleton-title" />;
  }

  // Default: single card
  return <div className="skeleton skeleton-card" />;
}
