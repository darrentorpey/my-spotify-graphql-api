import axios from 'axios'
import URL from 'url'

export async function createResource(resourceName, data) {
  await axios({
    url: `http://localhost:3004/${resourceName}s/`,
    method: 'post',
    data,
  })
}

export async function getItems(resourceName, { songId }) {
  const params = new URL.URLSearchParams([['songId', songId]])
  const items = await axios.get(`http://localhost:3004/${resourceName}s?${params.toString()}`)
  return items.data
}

export async function resourceExists(resourceName, fieldName, fieldValue) {
  const items = await axios.get(`http://localhost:3004/${resourceName}s?${fieldName}=${fieldValue}`)

  return items.data.length > 0
}

export async function getResource(resourceName, resourceId) {
  try {
    const it = await axios.get(`http://localhost:3004/${resourceName}s/${resourceId}`)
    return it.data
  } catch (e) {
    if (e.response.status === 404) {
      return null
    }

    throw e
  }
}

export async function updateResource(resourceName, resourceId, data) {
  await axios({
    url: `http://localhost:3004/${resourceName}s/${resourceId}`,
    method: 'put',
    data,
  })
}

export async function upsertResource(resourceName, data, key = 'id') {
  const [{ id } = {}] = await getItems(resourceName, {
    [key]: data[key],
  })

  if (id) {
    await updateResource(resourceName, id, data)
  } else {
    await createResource(resourceName, data)
  }

  return data
}
