const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://backend-port-folio.onrender.com'
).replace(/\/+$/, '')

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch {
    throw new Error(
      'Cannot connect to the donation server. Check your internet connection and try again.'
    )
  }

  const result = await response.json().catch(() => ({}))

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Request failed with status ${response.status}.`
    )
  }

  return result
}

export function createDonation(data) {
  return request('/api/donations', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getDonation(id) {
  return request(`/api/donations/${encodeURIComponent(id)}`)
}