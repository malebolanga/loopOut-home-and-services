// moderation.js – front‑end script for the premium demo UI

// Ensure a persistent anonymous user identifier (UUID v4 style)
function getUserId() {
  let uid = localStorage.getItem('moderationUserId');
  if (!uid) {
    // simple random hex string; replace with proper UUID generator if needed
    uid = 'uid_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('moderationUserId', uid);
  }
  return uid;
}

function showResult(data) {
  const resultDiv = document.getElementById('result');
  resultDiv.classList.remove('hidden');
  const { flagged, categories, riskScore, action } = data;
  const flaggedText = flagged ? '🚩 Flagged' : '✅ Clean';
  const catList = Object.entries(categories || {})
    .filter(([_, val]) => val)
    .map(([cat]) => `<li>${cat}</li>`)
    .join('') || '<li>None</li>';
  resultDiv.innerHTML = `
    <h3>Result: ${flaggedText}</h3>
    <p><strong>Risk score:</strong> ${riskScore}</p>
    <p><strong>Suggested action:</strong> ${action}</p>
    <p><strong>Categories:</strong></p>
    <ul>${catList}</ul>
  `;
}

async function callApi(endpoint, payload) {
  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error('Server error: ' + resp.status);
    const json = await resp.json();
    showResult(json);
  } catch (e) {
    alert('Error: ' + e.message);
    console.error(e);
  }
}

document.getElementById('moderateImageBtn').addEventListener('click', () => {
  const url = document.getElementById('imageUrl').value.trim();
  if (!url) return alert('Please enter an image URL');
  callApi('/api/moderate/image', { imageUrl: url, userId: getUserId() });
});

document.getElementById('moderateTextBtn').addEventListener('click', () => {
  const txt = document.getElementById('textInput').value.trim();
  if (!txt) return alert('Please enter some text');
  callApi('/api/moderate/text', { text: txt, userId: getUserId() });
});
