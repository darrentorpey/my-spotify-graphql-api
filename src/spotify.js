import fetch from 'node-fetch'
import axios from 'axios'

import SECRETS from '../data/secrets.json'

const API_BASE_URL = 'https://api.spotify.com/v1/'

class AccessCodeExpired extends Error {}

async function fetchJson(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return response.json()
}

async function getRefreshedAccessToken() {
  try {
    const response = await axios({
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      params: {
        grant_type: 'refresh_token',
        refresh_token: SECRETS.SPOTIFY_REFRESH_TOKEN,
      },
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: SECRETS.SPOTIFY_CLIENT_ID,
        password: SECRETS.SPOTIFY_CLIENT_SECRET,
      },
    })

    return response.data.access_token
  } catch (e) {
    console.error('[Spotify] Failed to get new access token', e.response.data)
    throw e
  }
}

async function fetchItemsNaive(apiPath, accessToken) {
  const { items, total, error } = await fetchJson(`${API_BASE_URL}${apiPath}`, accessToken)

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

  // TODO: Store new access token for future requests

  return fetchItemsNaive(apiPath, newAccessToken)
}

export async function fetchItems(apiPath) {
  try {
    return await fetchItemsNaive(apiPath, SECRETS.SPOTIFY_ACCESS_TOKEN)
  } catch (e) {
    if (e instanceof AccessCodeExpired) {
      return tryFetchAgain(apiPath)
    }

    throw e
  }
}
