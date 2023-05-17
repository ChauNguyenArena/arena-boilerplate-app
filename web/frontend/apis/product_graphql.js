import apiCaller from '../helpers/apiCaller'

const ProductGraphQLApi = {
  getProductTypes: async () => await apiCaller(`/api/products-graphql/product-types`),
  getProductVendors: async () => await apiCaller(`/api/products-graphql/product-vendors`),
  find: async (query) => await apiCaller(`/api/products-graphql${query || ''}`),
  findById: async (id) => await apiCaller(`/api/products-graphql/${id}`),
  create: async (data) => await apiCaller(`/api/products-graphql`, 'POST', data),
  update: async (id, data) => await apiCaller(`/api/products-graphql/${id}`, 'PUT', data),
  delete: async (id) => await apiCaller(`/api/products-graphql/${id}`, 'DELETE'),
}

export default ProductGraphQLApi
