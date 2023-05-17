import Controller from './../controllers/image_graphql.js'

export default function imageGraphQLRoute(app) {
  app.post('/api/products/:idProduct/images-graphql', Controller.create)
  app.post('/api/upload/images-graphql', Controller.createUrlImage)
  app.delete('/api/products/:idProduct/images-graphql/:id', Controller.delete)
}
