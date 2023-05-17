import { Stack } from '@shopify/polaris'
import React from 'react'
import AppHeader from '../../components/AppHeader'
import CreateForm from './CreateForm'

function NewPage(props) {
  return (
    <Stack vertical alignment="fill">
      <AppHeader
        {...props}
        title="Create new product"
        onBack={() => props.navigate(`products-graphql`)}
      />

      <CreateForm
        {...props}
        created={{}}
        onDiscard={() => props.navigate(`products-graphql`)}
        onSubmited={(data) =>
          props.navigate(
            `products-graphql/${data.id.substring(data.id.lastIndexOf('/') + 1, data.id.length)}`
          )
        }
      />
    </Stack>
  )
}

export default NewPage
