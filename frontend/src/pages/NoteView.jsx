import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { authFetch } from '../authFetch';

export default function NoteView() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/notes/' + id;
        let res = await fetch(base);
        if (res.status === 403) {
          res = await authFetch(base);
        }
        const data = await res.json();
        if (res.ok) setNote(data);
        else setMessage(data.message || 'Error');
      } catch (e) {
        setMessage('Error: ' + e.message);
      }
    })();
  }, [id]);

  const handleShare = async () => {
    setMessage('');
    try {
      const res = await authFetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/notes/' + id + '/share', {
        method: 'POST',
        body: JSON.stringify({ email: shareEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Share failed');
      setMessage('Shared successfully with ' + data.sharedWith);
    } catch (e) {
      setMessage(e.message);
    }
  };

  if (!note) return <div>Loading...</div>;

  return (
    <div>
      <h2>{note.title}</h2>
      <div style={{marginBottom:12}}>
        {note.quillDelta ? (
          <ReactQuill value={note.quillDelta} readOnly={true} theme="bubble" />
        ) : <div>No content</div>}
      </div>
      <div style={{marginTop:20}}>
        <h3>Share this note</h3>
        <input placeholder="user@example.com" value={shareEmail} onChange={e=>setShareEmail(e.target.value)} />
        <button onClick={handleShare}>Share</button>
        {message && <div style={{marginTop:8,color:'green'}}>{message}</div>}
        <div style={{marginTop:12}}>
          Shareable link: <code>{window.location.origin + '/notes/' + id}</code>
        </div>
      </div>
    </div>
  );
}