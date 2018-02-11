import { fetchItems as fetchSpotifyItems } from '../spotify'

export async function resolveRecentTracks() {
  const { items } = await fetchSpotifyItems(`me/player/recently-played`)

  if (!items) {
    throw Error('feck')
  }

  return items.map(item => item.track)
}
