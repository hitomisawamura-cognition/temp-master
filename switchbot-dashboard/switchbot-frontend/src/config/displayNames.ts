export type DisplayNameMap = Record<string, string>;

/** Raw SwitchBot device name -> industrial plant terminology shown in the UI. */
export const DEFAULT_DISPLAY_NAMES: DisplayNameMap = {
  'Bedroom Meter': '第1蒸留塔 (T-101)',
  'Living Meter': '第2蒸留塔 (T-102)',
  '2世': '反応器 (R-201)',
  '夢男': '熱交換器 (E-301)',
  '夢': '熱交換器 (E-302)',
  'アワコ': '冷却塔 (CT-401)',
  'ジャガ百万石': '加熱炉 (H-501)',
  'ネズミ': 'コンプレッサー (C-601)',
  'バロン': '遠心分離機 (S-701)',
  'ゴンタ': '混合槽 (M-801)',
  '蛇棚': '貯蔵タンク (TK-901)',
  '中華棚': '貯蔵タンク (TK-902)',
  'へておケージ': '配管ライン (PL-1001)',
  '外': '屋外モニター (EM-1101)',
  'インキュベーター': '乾燥機 (D-1201)',
  'ビアク': '吸収塔 (A-1301)',
  'ブロッチ Hot Spot': 'フレアスタック (FS-1401)',
  'マダラアオジタ': 'ボイラー (B-1501)',
};

/** Keeps only string -> string entries; anything else yields an empty map. */
export function parseDisplayNames(value: unknown): DisplayNameMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: DisplayNameMap = {};
  for (const [key, name] of Object.entries(value)) {
    if (typeof name === 'string') result[key] = name;
  }
  return result;
}

export function parseDisplayNamesJson(json: string | undefined): DisplayNameMap {
  if (!json || !json.trim()) return {};
  try {
    return parseDisplayNames(JSON.parse(json));
  } catch {
    console.warn('VITE_DISPLAY_NAMES is not valid JSON; ignoring it.');
    return {};
  }
}

/** Defaults overridden by the build-time `VITE_DISPLAY_NAMES` JSON. */
export const BUILD_DISPLAY_NAMES: DisplayNameMap = {
  ...DEFAULT_DISPLAY_NAMES,
  ...parseDisplayNamesJson(import.meta.env.VITE_DISPLAY_NAMES),
};

/** Optional runtime JSON file (same shape) merged over the build-time map. */
export const DISPLAY_NAMES_URL = (import.meta.env.VITE_DISPLAY_NAMES_URL ?? '').trim();

export function getDisplayName(deviceName: string, names: DisplayNameMap = BUILD_DISPLAY_NAMES): string {
  return Object.prototype.hasOwnProperty.call(names, deviceName) ? names[deviceName] : deviceName;
}
