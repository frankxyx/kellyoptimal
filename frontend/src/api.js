// src/api.js
export async function getQuestion() {
  const res = await fetch('/api/question');
  console.log('[getQuestion] status', res.status);
  const text = await res.text();
  console.log('[getQuestion] body', text);
  return JSON.parse(text);
}
