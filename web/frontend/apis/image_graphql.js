import apiCaller from '../helpers/apiCaller'

const ImageGraphQLApi = {
  create: async (idProduct, data) =>
    await apiCaller(`/api/products/${idProduct}/images-graphql`, 'POST', data),
  createUrlImage: async (data) => await apiCaller(`/api/upload/images-graphql`, 'POST', data),

  delete: async (idProduct, id) =>
    await apiCaller(`/api/products/${idProduct}/images-graphql/${id}`, 'DELETE'),
}

export default ImageGraphQLApi
