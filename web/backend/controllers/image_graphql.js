import getCurrentSession from '../../auth/getCurrentSession.js'
import ResponseHandler from '../helpers/responseHandler.js'
import Image from '../middlewares/image_graphql.js'

export default {
  create: async (req, res) => {
    try {
      const { shop, accessToken } = getCurrentSession(req, res)
      const { idProduct } = req.params

      const data = await Image.create({ shop, accessToken, data: req.body, idProduct })

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },

  createUrlImage: async (req, res) => {
    try {
      const { shop, accessToken } = getCurrentSession(req, res)

      const data = await Image.createUrlImage({ shop, accessToken, data: req.body })

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },

  delete: async (req, res) => {
    try {
      const { shop, accessToken } = getCurrentSession(req, res)

      const { idProduct, id } = req.params

      const data = await Image.delete({ shop, accessToken, idProduct, id })

      return ResponseHandler.success(res, data)
    } catch (error) {
      return ResponseHandler.error(res, error)
    }
  },
}
