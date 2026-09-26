export async function requestAdminUsers(accessToken) {
  const response = await fetch('/api/admin/users', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Tidak dapat memuat pengguna');
  return body.users;
}

export async function updateAdminUser(accessToken, id, update) {
  const response = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(update),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Tidak dapat memperbarui pengguna');
  return body;
}
