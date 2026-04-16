export function getToken(){ return localStorage.getItem('devcodex_token'); }
export function setToken(t){ localStorage.setItem('devcodex_token', t); }
export function clearToken(){ localStorage.removeItem('devcodex_token'); }
export async function authFetch(url, opts = {}){
  const token = getToken();
  const headers = opts.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) clearToken();
  return res;
}
