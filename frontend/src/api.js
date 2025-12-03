// frontend/src/api.js

// helper: resuelve JSON o lanza con {status, message}
async function handle(res) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.message ?? 'error';
      const err = new Error(message);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  }
  
  export const list = () =>
    fetch('/api/books').then(handle);
  
  export const create = (b) =>
    fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    }).then(handle);
  
  export const update = (id, b) =>
    fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    }).then(handle);
  
  export const remove = (id) =>
    fetch(`/api/books/${id}`, { method: 'DELETE' }).then(handle);
  
  // objeto por defecto (para tests que hacen expect(API).toHaveProperty('list'))
  const API = { list, create, update, remove };
  export default API;
  export { API };
  