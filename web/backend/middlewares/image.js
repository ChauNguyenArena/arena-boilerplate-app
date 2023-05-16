import apiCaller from '../helpers/apiCaller.js'
import graphqlCaller from '../helpers/graphqlCaller.js'

const findById = async ({ shop, accessToken, idProduct, id }) => {
  return await apiCaller({ shop, accessToken, endpoint: `products/${idProduct}/images/${id}.json` })
}

const create = async ({ shop, accessToken, data, idProduct }) => {
  return await apiCaller({
    shop,
    accessToken,
    endpoint: `products/${idProduct}/images.json`,
    method: 'POST',
    data,
  })
}

const _delete = async ({ shop, accessToken, idProduct, id }) => {
  return await apiCaller({
    shop,
    accessToken,
    endpoint: `products/${idProduct}/images/${id}.json`,
    method: 'DELETE',
  })
}

const createUrlImage = async ({ shop, accessToken, data }) => {
  let query = `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
    }
  }`
  let variables = { input: [data] }

  return await graphqlCaller({ shop, accessToken, query, variables })
}

const Image = {
  findById,
  create,
  createUrlImage,
  delete: _delete,
}

export default Image
