import { Card, Pagination, Stack } from '@shopify/polaris'
import { useEffect, useState } from 'react'
import AppHeader from '../../components/AppHeader'
import { ImagesMajor, EditMinor, DeleteMinor, ViewMinor } from '@shopify/polaris-icons'
import Table from './Table'
import { useSearchParams } from 'react-router-dom'
import ConfirmModal from '../../components/ConfirmModal'
import ProductGraphQLApi from '../../apis/product_graphql'
import ProductApi from '../../apis/product'

function ProductsPage(props) {
  const { actions, location } = props
  const [searchParams, setSearchParams] = useSearchParams()
  const [count, setCount] = useState(null)
  const [products, setProducts] = useState(null)
  const [deleted, setDeleted] = useState(null)

  const getProductsCount = async () => {
    try {
      let res = await ProductApi.count()
      if (!res.success) throw res.error

      setCount(res.data.count)
    } catch (error) {
      console.log(error)
      actions.showNotify({ message: error.message, error: true })
    }
  }

  useEffect(() => {
    getProductsCount()
  }, [])

  const getProducts = async (query) => {
    try {
      setProducts(null)

      let res = await ProductGraphQLApi.find(query)
      if (!res.success) throw res.error
      const { edges, pageInfo } = res.data.products

      let _products = edges.map((value) => {
        const images = value.node.images.edges.map((value) => value.node)
        const variants = value.node.variants.edges.map((value) => value.node)
        const id = value.node.id.substring(value.node.id.lastIndexOf('/') + 1, value.node.id.length)
        const product = {
          ...value.node,
          id,
          images,
          variants,
        }
        return product
      })

      let _pageInfo = pageInfo

      res.data = { products: _products, pageInfo: _pageInfo }

      setProducts(res.data)
    } catch (error) {
      console.log(error)
      actions.showNotify({ message: error.message, error: true })
    }
  }

  useEffect(() => {
    getProducts(location.search)
  }, [location.search])

  const handleDelete = async (selected) => {
    try {
      actions.showAppLoading()

      let res = await ProductGraphQLApi.delete(selected.id)
      if (!res.success) throw res.error

      actions.showNotify({ message: 'Deleted' })

      getProducts(location.search)
    } catch (error) {
      console.log(error)
      actions.showNotify({ message: error.message, error: true })
    } finally {
      actions.hideAppLoading()
    }
  }

  return (
    <Stack vertical alignment="fill">
      <AppHeader
        {...props}
        title="Products"
        primaryActions={[
          {
            label: 'Add product',
            onClick: () => props.navigate('products-graphql/new'),
            primary: true,
          },
        ]}
        onBack={() => props.navigate('')}
      />

      <div>
        Total items: <b>{count || 'loading..'}</b>
      </div>

      <Card>
        <Table
          {...props}
          items={products?.products}
          onEdit={(item) => props.navigate(`products-graphql/${item.id}`)}
          onDelete={(item) => setDeleted(item)}
        />
      </Card>

      {products?.products?.length > 0 && (
        <Stack distribution="center">
          <Pagination
            hasPrevious={products.pageInfo.hasPreviousPage}
            onPrevious={() => setSearchParams({ previousPage: products.pageInfo.startCursor })}
            hasNext={products.pageInfo.hasNextPage}
            onNext={() => setSearchParams({ nextPage: products.pageInfo.endCursor })}
          />
        </Stack>
      )}

      {deleted && (
        <ConfirmModal
          title="Delete confirmation"
          content="Are you sure want to delete? This cannot be undone."
          onClose={() => setDeleted(null)}
          secondaryActions={[
            {
              content: 'Discard',
              onAction: () => setDeleted(null),
            },
            {
              content: 'Delete now',
              onAction: () => handleDelete(deleted) & setDeleted(null),
              destructive: true,
            },
          ]}
        />
      )}
    </Stack>
  )
}

export default ProductsPage
