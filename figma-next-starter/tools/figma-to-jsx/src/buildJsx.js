import fs from 'node:fs';
import path from 'node:path';

/**
 * domainHints: { screen, entities, actions }
 * elements: array of { entity, field, text } for a screen
 */
export function buildJsx(domainHints, elements) {
  const hint = JSON.stringify({
    screen: domainHints.screen,
    entities: domainHints.entities || [],
    actions: domainHints.actions || [],
  }, null, 2);

  const body = elements.map(el => {
    const e = el.entity || 'Unknown';
    const f = el.field || 'text';
    const t = (el.text ?? '').replace(/\n/g, ' ');
    return `  <div data-entity="${e}" data-field="${f}">{\`${t}\`}</div>`;
  }).join('\n');

  return `\
/* domain-hints:
${hint}
*/
export default function ${toSafeName(domainHints.screen)}() {
  return (
    <div className="screen ${domainHints.screen}">
${body}
    </div>
  );
}
`;
}

function toSafeName(name) {
  // まず非英数字をアンダースコアに変換
  let safe = (name || 'Screen').replace(/[^a-zA-Z0-9_]/g, '_');
  // 数字で始まっている場合は Screen_ を先頭に追加
  if (/^[0-9]/.test(safe)) {
    safe = `Screen_${safe}`;
  }
  return safe;
}
