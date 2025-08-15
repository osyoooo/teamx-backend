import 'dotenv/config';

const BASE = 'https://api.figma.com/v1';

function headers() {
  const token = process.env.FIGMA_TOKEN;
  if (!token) throw new Error('FIGMA_TOKEN is not set');
  return { 'X-Figma-Token': token };
}

export async function getFileJson(fileKey) {
  const res = await fetch(`${BASE}/files/${fileKey}`, { headers: headers() });
  if (!res.ok) throw new Error(`Figma /files error: ${res.status}`);
  return res.json();
}

export async function getNodesJson(fileKey, ids) {
  const url = new URL(`${BASE}/files/${fileKey}/nodes`);
  url.searchParams.set('ids', ids.join(','));
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Figma /nodes error: ${res.status}`);
  return res.json();
}
