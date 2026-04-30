export function simpleYamlParse(text) {
  const result = {};
  let current = result;
  const stack = [{ key: null, obj: result }];
  let currentKey = null;

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.search(/\S/);
    const depth = Math.floor(indent / 2);

    while (stack.length - 1 > depth) {
      stack.pop();
      current = stack[stack.length - 1].obj;
      currentKey = stack[stack.length - 1].key;
    }

    if (trimmed.includes(':') && !trimmed.startsWith('- ')) {
      const colonMatch = trimmed.match(/^([^:]+?):\s*/);
      if (!colonMatch) continue;
      const key = colonMatch[1].trim();
      let value = trimmed.substring(colonMatch[0].length).trim();

      if (value === '' || value === '|' || value === '>') {
        current[key] = value === '' ? {} : value;
        currentKey = key;
        if (typeof current[key] === 'object' && value === '') {
          stack.push({ key, obj: current[key] = {} });
          current = current[key];
        }
      } else {
        current[key] = parseValue(value);
        currentKey = key;
      }
    } else if (trimmed.startsWith('- ')) {
      const itemStr = trimmed.substring(2).trim();
      const listKey = currentKey || '_items';
      if (!Array.isArray(current[listKey])) current[listKey] = [];
      if (itemStr.includes(':')) {
        const itemColonMatch = itemStr.match(/^([^:]+?):\s*/);
        if (itemColonMatch) {
          const k = itemColonMatch[1].trim();
          const v = itemStr.substring(itemColonMatch[0].length).trim();
          const obj = {};
          obj[k] = parseValue(v);
          current[listKey].push(obj);
        } else {
          current[listKey].push(parseValue(itemStr));
        }
      } else {
        current[listKey].push(parseValue(itemStr));
      }
    }
  }
  return result;
}

export function parseValue(v) {
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~' || v === '') return null;
  if (/^\d+$/.test(v)) return parseInt(v, 10);
  if (/^[\d.]+$/.test(v)) return parseFloat(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  if (v.startsWith('[')) {
    try { return JSON.parse(v.replace(/'/g, '"')); } catch { return v; }
  }
  return v;
}

export function yamlVal(v) {
  if (v === true) return 'true';
  if (v === false) return 'false';
  if (v === null) return 'null';
  if (typeof v === 'string') {
    if (v.includes(':') || v.includes('#') || v.includes('\n') || v.startsWith('[') || v.includes('{')) {
      return `"${v}"`;
    }
    return v;
  }
  return String(v);
}

export function yamlStringify(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const lines = [];

  if (obj === null || obj === undefined) {
    return `${pad}null`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${pad}[]`;
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        const inner = yamlStringify(item, indent + 1).split('\n');
        lines.push(`${pad}- ${inner[0].trimStart()}`);
        for (let i = 1; i < inner.length; i++) lines.push(inner[i]);
      } else {
        lines.push(`${pad}- ${yamlVal(item)}`);
      }
    }
  } else if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) return `${pad}{}`;
    for (const [key, val] of entries) {
      if (val === null || val === undefined) {
        lines.push(`${pad}${key}: null`);
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          lines.push(`${pad}${key}: []`);
        } else {
          lines.push(`${pad}${key}:`);
          lines.push(yamlStringify(val, indent + 1));
        }
      } else if (typeof val === 'object') {
        const inner = yamlStringify(val, indent + 1);
        if (inner.trim() === '{}' || inner.trim() === '') {
          lines.push(`${pad}${key}: {}`);
        } else {
          lines.push(`${pad}${key}:`);
          lines.push(inner);
        }
      } else {
        lines.push(`${pad}${key}: ${yamlVal(val)}`);
      }
    }
  }
  return lines.join('\n');
}
