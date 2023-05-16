import apiCaller from '../helpers/apiCaller.js'
import graphqlCaller from '../helpers/graphqlCaller.js'

const getProductTypes = async ({ shop, accessToken }) => {
  let query = `
    query productTypes {
      shop {
        productTypes(first: 250) {
          edges {
            node
          }
        }
      }
    }
  `

  let res = await graphqlCaller({
    shop,
    accessToken,
    query,
  })

  return res.shop['productTypes'].edges.map((item) => item.node)
}

const getProductVendors = async ({ shop, accessToken }) => {
  let query = `
    query productVendors {
      shop {
        productVendors(first: 250) {
          edges {
            node
          }
          pageInfo {
            hasNextPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    }
  `

  let res = await graphqlCaller({
    shop,
    accessToken,
    query,
  })

  return res.shop['productVendors'].edges.map((item) => item.node)
}

// const getAll = async ({ shop, accessToken, count }) => {
//   let items = []
//   let res = null
//   let hasNextPage = true
//   let nextPageInfo = ''

//   while (hasNextPage) {
//     res = await apiCaller({
//       shop,
//       accessToken,
//       endpoint: `products.json?limit=250&page_info=${nextPageInfo}`,
//       pageInfo: true,
//     })

//     items = items.concat(res.products)

//     hasNextPage = res.pageInfo.hasNext
//     nextPageInfo = res.pageInfo.nextPageInfo

//     if (!isNaN(count) && parseInt(count) && items.length >= parseInt(count)) {
//       hasNextPage = false
//       nextPageInfo = ''

//       items = items.slice(0, count)
//     }
//   }

//   return items
// }

const getAll = async ({ shop, accessToken }) => {
  let query = `
  query {
    products(first: 1) {
      edges {
        node {
          id
          title
          handle
          status
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`
  let res = await graphqlCaller({ shop, accessToken, query })
  let hasNextPage = res.products.pageInfo.hasNextPage
  let nextPageInfo = res.products.edges[0].cursor
  let items = res.products.edges.map((item) => item.node)

  while (hasNextPage) {
    query = `query {
      products(first: 250, after: ${nextPageInfo}) {
        edges {
          node {
            id
            title
            handle
            status
          }
          cursor
        }
        pageInfo {
          hasNextPage
        }
      }
    }`
    res = await apiCaller({
      shop,
      accessToken,
      query,
    })

    items = items.concat(res.products.edges.map((item) => item.node))
    let len = items.length(items)
    hasNextPage = res.products.pageInfo.hasNextPage
    nextPageInfo = res.products.edges[len - 1].cursor
  }

  return items
}

const count = async ({ shop, accessToken }) => {
  return await apiCaller({ shop, accessToken, endpoint: `products/count.json` })
}

// const find = async ({ shop, accessToken, limit, pageInfo, order, filter }) => {
//   let _limit = limit ? parseInt(limit) : 20

//   let endpoint = `products.json?limit=${_limit}${filter || ''}`
//   if (pageInfo) {
//     endpoint += `&page_info=${pageInfo}`
//   } else {
//     if (order) {
//       endpoint += `&order=${order}`
//     } else {
//       endpoint += `&order=updated_at+desc`
//     }
//   }

//   return await apiCaller({
//     shop,
//     accessToken,
//     endpoint,
//     pageInfo: true,
//   })
// }

const find = async ({ shop, accessToken, limit, order, filter, nextPage, previousPage }) => {
  let _limit = limit ? parseInt(limit) : 20

  let variables = ``

  if (nextPage) {
    variables += `first: ${_limit}, after: "${nextPage}"`
  } else if (previousPage) {
    variables += `last: ${_limit}, before: "${previousPage}"`
  } else {
    variables += `first: ${_limit}`
  }

  if (order) {
    variables += `reverse: ${false}`
  } else variables += `reverse: ${true}`

  if (filter) {
    variables += `, query: "${filter}"`
  }

  let query = `query {
    products(${variables}) {
      edges {
        node {
          id 
          title
          handle
          status
          description
          vendor
          productType
          options {
            id
            name
            position
            values
          }
          variants(first: 10) {
            edges {
              node{
                id
                title
                price
                compareAtPrice
                selectedOptions {
                  name
                  value
                }
              }
            }
          } 
          images(first: 10) {
            edges {
              node {
                id
                src
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }

  }`

  // console.log('query', query)
  // console.log('variables', variables)
  let res = await graphqlCaller({
    shop,
    accessToken,
    query,
  })
  // let items = res.products.edges.map((item) => item.node)
  // console.log('items', items)
  return res
}

// const findById = async ({ shop, accessToken, id }) => {
//   return await apiCaller({ shop, accessToken, endpoint: `products/${id}.json` })
// }

const findById = async ({ shop, accessToken, id }) => {
  let query = `query {product(id: "gid://shopify/Product/${id}"){
        id 
        title
        handle
        status
        description
        vendor
        productType
        options {
          id
          name
          position
          values
        }
        variants(first: 10) {
          edges {
            node{
              id
              title
              price
              compareAtPrice
              selectedOptions {
                name
                value
              }
            }
          }
        } 
        images(first: 10) {
          edges {
            node {
              id
              src
            }
          }
        }
      }
    }`

  let res = await graphqlCaller({
    shop,
    accessToken,
    query,
  })

  return res
}

// const create = async ({ shop, accessToken, data }) => {
//   return await apiCaller({ shop, accessToken, endpoint: `products.json`, method: 'POST', data })
// }

const create = async ({ shop, accessToken, data }) => {
  let _data = {}
  _data['title'] = data.product['title']
  _data['descriptionHtml'] = data.product['body_html']
  _data['vendor'] = data.product['vendor']
  _data['status'] = data.product['status'].toUpperCase()
  _data['productType'] = data.product['product_type']
  if (data.product['options']) {
    _data['options'] = data.product['options'].map((item) => item.name)
  }

  if (data.product['variants']) {
    _data['variants'] = data.product['variants'].map((item) => {
      return {
        options: [item.option1, item.option2, item.option3],
        price: parseInt(item.price) || 0,
        compareAtPrice: parseInt(item.compare_at_price) || 0,
      }
    })
  }

  let variables = { input: _data }
  // console.log('_data', variables)

  let query = `mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id 
          title
          handle
          status
          description
          vendor
          productType
          options {
            id
            name
            position
            values
          }
          variants(first: 10) {
            edges {
              node{
                id
                title
                price
                compareAtPrice
                selectedOptions {
                  name
                  value
                }
              }
            }
          } 
          images(first: 10) {
            edges {
              node {
                id
                src
              }
            }
          }
      }
      userErrors {
        message
        field
      }
    }
  }`

  let res = await graphqlCaller({ shop, accessToken, query, variables })

  return res
}

const update = async ({ shop, accessToken, id, data }) => {
  let _data = {}
  _data['id'] = `gid://shopify/Product/${id}`
  _data['title'] = data.product['title']
  _data['descriptionHtml'] = data.product['body_html']
  _data['vendor'] = data.product['vendor']
  _data['status'] = data.product['status'].toUpperCase()
  _data['productType'] = data.product['product_type']
  _data['options'] = data.product['options'].map((item) => item.name)
  _data['variants'] = data.product['variants'].map((item) => {
    return {
      options: item.option1
        ? [item.option1, item.option2, item.option3]
        : item.selectedOptions.map((_item) => _item.value),
      price: parseInt(item.price) || 0,
      compareAtPrice: parseInt(item.compare_at_price) || 0,
    }
  })
  let variables = { input: _data }
  // console.log('_data', variables)

  let query = `mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id 
          title
          handle
          status
          description
          vendor
          productType
          options {
            id
            name
            position
            values
          }
          variants(first: 10) {
            edges {
              node{
                id
                title
                price
                compareAtPrice
                selectedOptions {
                  name
                  value
                }
              }
            }
          } 
          images(first: 10) {
            edges {
              node {
                id
                src
              }
            }
          }
      }
      userErrors {
        message
        field
      }
    }
  }`

  let res = await graphqlCaller({ shop, accessToken, query, variables })
  return res
}

// const update = async ({ shop, accessToken, id, data }) => {
//   return await apiCaller({
//     shop,
//     accessToken,
//     endpoint: `products/${id}.json`,
//     method: 'PUT',
//     data,
//   })
// }

const _delete = async ({ shop, accessToken, id }) => {
  let query = `mutation {
    productDelete(input: {id: "gid://shopify/Product/${id}"}) {
      deletedProductId
    }
  }`
  return await graphqlCaller({ shop, accessToken, query })
}

// const _delete = async ({ shop, accessToken, id }) => {
//   return await apiCaller({
//     shop,
//     accessToken,
//     endpoint: `products/${id}.json`,
//     method: 'DELETE',
//   })
// }

const Product = {
  getProductTypes,
  getProductVendors,
  getAll,
  count,
  find,
  findById,
  create,
  update,
  delete: _delete,
}

export default Product
