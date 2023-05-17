import Controller from './../controllers/product_graphql.js'

export default function productGraphQLRoute(app) {
  app.get('/api/products-graphql/product-types', Controller.getProductTypes)
  app.get('/api/products-graphql/product-vendors', Controller.getProductVendors)
  app.get('/api/products-graphql', Controller.find)
  app.get('/api/products-graphql/:id', Controller.findById)
  app.post('/api/products-graphql', Controller.create)
  app.put('/api/products-graphql/:id', Controller.update)
  app.delete('/api/products-graphql/:id', Controller.delete)
}
