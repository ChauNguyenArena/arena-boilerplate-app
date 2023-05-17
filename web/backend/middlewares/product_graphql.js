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

const getAll = async ({ shop, accessToken }) => {
  let hasNextPage = true
  let nextPageInfo = ''

  while (hasNextPage) {
    let variables = nextPageInfo ? `first:20` : `first: 20, after: ${nextPageInfo}`
    query = `query {
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
        }
      }
    }`
    let res = await graphqlCaller({
      shop,
      accessToken,
      query,
    })

    items = items.concat(res.products.edges.map((item) => item.node))
    hasNextPage = res.products.pageInfo.hasNextPage
    nextPageInfo = res.products.pageInfo.endCursor
  }

  return items
}

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

  let res = await graphqlCaller({
    shop,
    accessToken,
    query,
  })

  return res
}

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
        compareAtPrice: parseInt(item.compareAtPrice) || 0,
      }
    })
  }

  let variables = { input: _data }

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
      compareAtPrice: parseInt(item.compareAtPrice) || 0,
    }
  })
  let variables = { input: _data }

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

const _delete = async ({ shop, accessToken, id }) => {
  let query = `mutation {
    productDelete(input: {id: "gid://shopify/Product/${id}"}) {
      deletedProductId
    }
  }`
  return await graphqlCaller({ shop, accessToken, query })
}

const Product = {
  getProductTypes,
  getProductVendors,
  getAll,
  find,
  findById,
  create,
  update,
  delete: _delete,
}

export default Product
