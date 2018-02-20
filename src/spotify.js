import fetch from 'node-fetch'
import axios from 'axios'

const {
  SPOTIFY_ACCESS_TOKEN,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
} = process.env

const API_BASE_URL = 'https://api.spotify.com/v1/'

class AccessCodeExpired extends Error {}

let currentAccessToken = SPOTIFY_ACCESS_TOKEN

async function fetchJson(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response.json()
}

export const fetchOther = async apiPath => {
  const results = await fetchJson(`${API_BASE_URL}${apiPath}`, currentAccessToken)
  return results['audio_features']
}

async function getRefreshedAccessToken() {
  try {
    const response = await axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      params: {
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: SPOTIFY_CLIENT_ID,
        password: SPOTIFY_CLIENT_SECRET,
      },
    })

    return response.data.access_token
  } catch (e) {
    console.error('[Spotify] Failed to get new access token', e.response.data)
    throw e
  }
}

async function fetchItemsNaive(apiPath, accessToken) {
  const url = apiPath.includes('http') ? apiPath : `${API_BASE_URL}${apiPath}`
  // console.log(`---URL---`, `${url}`)
  const { items, total, error } = await fetchJson(url, accessToken)

  if (error) {
    if (error.status === 401) {
      throw new AccessCodeExpired(error.message)
    } else {
      console.error(`[Spotify] Fetch items failed:`, error)
      throw Error(error.message)
    }
  }

  return { items, total }
}

export async function tryFetchAgain(apiPath) {
  console.log(`[Spotify Auth] Access token expired; getting new access token...`)

  const newAccessToken = await getRefreshedAccessToken()

  console.log('[Spotify Auth] New access token:\n', newAccessToken)

  currentAccessToken = newAccessToken

  return fetchItemsNaive(apiPath, newAccessToken)
}

export async function fetchItems(apiPath) {
  try {
    return await fetchItemsNaive(apiPath, currentAccessToken)
  } catch (e) {
    if (e instanceof AccessCodeExpired) {
      return tryFetchAgain(apiPath)
    }

    throw e
  }
}
