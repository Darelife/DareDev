export async function checkAuth() {
  try {
    const res = await fetch('/api/auth/check');
    const data = await res.json();
    return data.authenticated || false;
  } catch (error) {
    console.error('Check auth error:', error);
    return false;
  }
}

export async function login(password: string) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }

    return { success: true };
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

export async function loadCanvas() {
  try {
    const res = await fetch('/api/canvas');

    if (res.status === 401) {
      throw new Error('Unauthorized');
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

export async function saveCanvas(elements: any[], appState: any, files: any) {
  try {
    const res = await fetch('/api/canvas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elements, appState, files }),
    });

    if (res.status === 401) {
      throw new Error('Unauthorized');
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
