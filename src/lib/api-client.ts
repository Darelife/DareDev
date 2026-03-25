export type AuthUser = {
  id: string;
  username: string;
  role: 'admin' | 'user';
};

export type AuthCheckResult = {
  authenticated: boolean;
  user?: AuthUser;
};

export type DrawingSummary = {
  id: string;
  title: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export async function createDrawing(title?: string) {
  const res = await fetch('/api/admin/drawings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: (title ?? '').trim() || null,
      data: {
        elements: [],
        appState: {},
        files: {},
      },
      userIds: [],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to create drawing');
  }

  return data.drawing as DrawingSummary;
}

export async function checkAuth() {
  try {
    const res = await fetch('/api/auth/check');
    const data = await res.json();
    return data as AuthCheckResult;
  } catch (error) {
    console.error('Check auth error:', error);
    return { authenticated: false } as AuthCheckResult;
  }
}

export async function login(username: string, password: string) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

export async function listDrawings() {
  const res = await fetch('/api/canvas');
  const data = await res.json();

  if (res.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    throw new Error(data.error || 'Failed to list drawings');
  }

  return (data.drawings ?? []) as DrawingSummary[];
}

export async function loadCanvas(drawingId: string) {
  try {
    const res = await fetch(`/api/canvas?id=${encodeURIComponent(drawingId)}`);

    if (res.status === 401) {
      throw new Error('Unauthorized');
    }

    if (res.status === 403) {
      throw new Error('Forbidden');
    }

    if (!res.ok) {
      throw new Error('Failed to load canvas');
    }

    const data = await res.json();
    return data.drawing;
  } catch (error) {
    throw error;
  }
}

export async function saveCanvas(
  drawingId: string,
  elements: any[],
  appState: any,
  files: any
) {
  try {
    const res = await fetch('/api/canvas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawingId, elements, appState, files }),
    });

    if (res.status === 401) {
      throw new Error('Unauthorized');
    }

    if (res.status === 403) {
      throw new Error('Forbidden');
    }

    if (!res.ok) {
      throw new Error('Failed to save canvas');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw error;
  }
}
