import { getDb } from '@/lib/db';

export interface CurriculumSource {
  isConnected(): boolean;
  requestAccess(): Promise<boolean>;
  listCurricula(): Promise<string[]>;
  readFile(relativePath: string): Promise<string | null>;
  getFileHash(content: string): string;
}

const REPO_OWNER = 'kevinmilly';
const REPO_NAME = 'mastery-engine';
const BRANCH = 'master';
const CURRICULA_PATH = 'curricula';
const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

/** djb2 hash — fast, no crypto needed */
function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash.toString(16);
}

export type PrefetchProgressCallback = (fetched: number, total: number) => void;

interface GitHubTreeItem {
  path: string;
  type: string;
  sha: string;
  url: string;
}

interface GitHubContentsItem {
  name: string;
  type: string;
  path: string;
}

class GitHubSource implements CurriculumSource {
  onProgress?: PrefetchProgressCallback;

  isConnected(): boolean {
    return true;
  }

  async requestAccess(): Promise<boolean> {
    return true;
  }

  async listCurricula(): Promise<string[]> {
    try {
      const res = await fetch(`${API_BASE}/contents/${CURRICULA_PATH}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!res.ok) return [];
      const items: GitHubContentsItem[] = await res.json();
      return items
        .filter((item) => item.type === 'dir')
        .map((item) => item.name)
        .sort();
    } catch {
      return [];
    }
  }

  async readFile(relativePath: string): Promise<string | null> {
    const url = `${RAW_BASE}/${CURRICULA_PATH}/${relativePath}`;
    try {
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  }

  getFileHash(content: string): string {
    return djb2(content);
  }

  async prefetchAll(
    _folderNames: string[],
    onProgress?: PrefetchProgressCallback
  ): Promise<void> {
    // Use the git trees API — single request to get all file paths
    const treeRes = await fetch(
      `${API_BASE}/git/trees/${BRANCH}?recursive=1`,
      { headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    if (!treeRes.ok) {
      console.warn('GitHub trees API failed:', treeRes.status);
      return;
    }

    const treeData: { tree: GitHubTreeItem[] } = await treeRes.json();
    const mdPaths = treeData.tree
      .filter(
        (item) =>
          item.type === 'blob' &&
          item.path.startsWith(`${CURRICULA_PATH}/`) &&
          item.path.endsWith('.md')
      )
      .map((item) => item.path);

    const total = mdPaths.length;
    let fetched = 0;
    onProgress?.(fetched, total);

    const db = await getDb();

    // Fetch in batches of 10 to avoid overwhelming the browser
    const BATCH_SIZE = 10;
    for (let i = 0; i < mdPaths.length; i += BATCH_SIZE) {
      const batch = mdPaths.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async (fullPath) => {
          // fullPath is like "curricula/folder/file.md"
          // We store it in the cache as "folder/file.md" (relative to curricula/)
          const relativePath = fullPath.slice(`${CURRICULA_PATH}/`.length);
          try {
            const res = await fetch(`${RAW_BASE}/${fullPath}`);
            if (res.ok) {
              const content = await res.text();
              await db.put('file_cache', {
                path: relativePath,
                content,
                cachedAt: Date.now(),
              });
            }
          } catch {
            // Non-fatal
          } finally {
            fetched++;
            onProgress?.(fetched, total);
          }
        })
      );
    }
  }
}

export const gitHubSource: CurriculumSource & {
  prefetchAll: (
    folderNames: string[],
    onProgress?: PrefetchProgressCallback
  ) => Promise<void>;
} = new GitHubSource();
