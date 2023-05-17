import apiCaller from '../helpers/apiCaller.js'
import graphqlCaller from '../helpers/graphqlCaller.js'

const findById = async ({ shop, accessToken, idProduct, id }) => {
  return await apiCaller({ shop, accessToken, endpoint: `products/${idProduct}/images/${id}.json` })
}

// const create = async ({ shop, accessToken, data, idProduct }) => {
//   return await apiCaller({
//     shop,
//     accessToken,
//     endpoint: `products/${idProduct}/images.json`,
//     method: 'POST',
//     data,
//   })
// }

const create = async ({ shop, accessToken, data, idProduct }) => {
  // console.log('idProduct', idProduct)
  // console.log('data', data)
  let query = `mutation productAppendImages($input: ProductAppendImagesInput!) {
    productAppendImages(input: $input) {
      newImages {
        id
        altText
      }
      product {
        id
      }
      userErrors {
        field
        message
      }
    }
  }`
  let variables = {
    input: {
      id: `gid://shopify/Product/${idProduct}`,
      images: [
        {
          ...data,
        },
      ],
    },
  }

  let res = await graphqlCaller({ shop, accessToken, query, variables })
  return res
  // console.log('res:>>', res)
}

// const _delete = async ({ shop, accessToken, idProduct, id }) => {
//   return await apiCaller({
//     shop,
//     accessToken,
//     endpoint: `products/${idProduct}/images/${id}.json`,
//     method: 'DELETE',
//   })
// }

const _delete = async ({ shop, accessToken, idProduct, id }) => {
  let query = `mutation productDeleteImages($id: ID!, $imageIds: [ID!]!) {
    productDeleteImages(id: $id, imageIds: $imageIds) {
      deletedImageIds
      product {
        id
        title
        images(first: 5) {
          nodes {
            id
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`

  let variables = {
    id: `gid://shopify/Product/${idProduct}`,
    imageIds: [`gid://shopify/ProductImage/${id}`],
  }

  return await graphqlCaller({ shop, accessToken, query, variables })
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
