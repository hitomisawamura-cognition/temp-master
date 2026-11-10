export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(API_URL + path, init);
  if (!response.ok) throw new Error('Request failed (' + response.status + ')');
  return response.json() as Promise<T>;
}
export async function downloadBackup() {
  const response = await fetch(API_URL + '/api/backup');
  if (response.status === 401 || response.status === 403)
    throw new Error('バックアップには認証が必要です');
  if (!response.ok) throw new Error('Backup failed (' + response.status + ')');
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download =
    'switchbot_backup_' + new Date().toISOString().slice(0, 10) + '.db';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
