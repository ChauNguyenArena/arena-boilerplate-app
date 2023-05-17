import PropTypes from 'prop-types'
import { Button, Card, Checkbox, DisplayText, Stack, TextField } from '@shopify/polaris'
import { useEffect, useState } from 'react'
import AppHeader from '../../components/AppHeader'
import ValidateForm from '../../helpers/validateForm'
import FormControl from '../../components/FormControl'
import ProductApi from '../../apis/product'
import ImageApi from '../../apis/image'
import Variants from './Variants'
import { filterValidOptions, generateBase64Image } from './actions'
import Images from './Images'
import axios from 'axios'

CreateForm.propTypes = {
  // ...appProps,
  created: PropTypes.object,
  onDiscard: PropTypes.func,
  onSubmited: PropTypes.func,
}

CreateForm.defaultProps = {
  created: {},
  onDiscard: () => null,
  onSubmited: () => null,
}

const InitFormData = {
  title: {
    type: 'text',
    label: 'Title',
    value: '',
    error: '',
    required: true,
    validate: {
      trim: true,
      required: [true, 'Required!'],
      minlength: [2, 'Too short!'],
      maxlength: [200, 'Too long!'],
    },
    focused: true,
  },
  body_html: {
    type: 'text',
    label: 'Description',
    value: '',
    error: '',
    required: true,
    validate: {},
    multiline: 6,
  },
  status: {
    type: 'select',
    label: 'Status',
    value: 'active',
    error: '',
    options: [
      { label: 'ACTIVE', value: 'active' },
      { label: 'DRAFT', value: 'draft' },
    ],
  },
  vendor: {
    type: 'autocomplete',
    label: 'Vendor',
    value: '',
    error: '',
    options: [],
  },
  product_type: {
    type: 'autocomplete',
    label: 'Product type',
    value: '',
    error: '',
    options: [],
  },
  options: {
    type: '',
    label: '',
    value: null,
    error: '',
    enabled: false,
    variants: [],
  },
  images: {
    name: 'images',
    type: 'file',
    label: '',
    value: [],
    allowMultiple: true,
    originalValue: [],
    removeValue: [],
    error: '',
    required: false,
    validate: {},
  },
}

function CreateForm(props) {
  const { actions, created, onDiscard, onSubmited, productVendors, productTypes } = props

  const [formData, setFormData] = useState(null)

  useEffect(() => {
    console.log('formData', formData)
  }, [formData])

  useEffect(() => {
    let _formData = JSON.parse(JSON.stringify(InitFormData))

    if (created.id) {
      Array.from(['title', 'body_html', 'status', 'vendor']).map(
        (key) => (_formData[key] = { ..._formData[key], value: created[key] || '' })
      )

      _formData['product_type'] = {
        ..._formData['product_type'],
        value: created['productType'] || '',
      }

      _formData.options = {
        ..._formData.options,
        enabled: true,
        value: created.options.map((item) => ({ name: item.name, values: item.values })),
        variants: created.variants.edges.map((item) => item.node),
      }
      if (_formData.options.value.length < 3) {
        _formData.options.value = _formData.options.value.concat(
          Array.from({ length: 3 - _formData.options.value.length }).map(() => ({
            name: '',
            values: [],
          }))
        )
      }
      _formData.images.originalValue = created.images.edges.map((item) => item.node)
    } else {
      /**
       * Sample data
       */
      _formData.title.value = `Sample product - ${new Date().toString()}`
      _formData.body_html.value = `Sample product`
    }

    setFormData(_formData)

    if (!productVendors) {
      actions.getProductVendors()
    }
    if (!productTypes) {
      actions.getProductTypes()
    }
  }, [])

  const handleChange = (name, value) => {
    let _formData = JSON.parse(JSON.stringify(formData))
    _formData[name] = { ..._formData[name], value, error: '' }
    setFormData(_formData)
  }

  const handleSubmit = async () => {
    try {
      let _formData = { ...formData }
      const { formValid, validFormData } = ValidateForm.validateForm(formData)

      if (!formValid) {
        setFormData(validFormData)
        throw new Error('Invalid form data')
      }

      actions.showAppLoading()

      let data = {
        title: validFormData.title.value,
        body_html: validFormData.body_html.value,
        vendor: validFormData.vendor.value,
        product_type: validFormData.product_type.value,
        status: validFormData.status.value,
      }

      let options = filterValidOptions(formData.options.value)
      if (options.length > 0) {
        data.options = options
        data.variants = formData.options.variants
      }
      console.log('data:>>', data)

      let res = null

      if (created.id) {
        // update
        // data.images = formData.images.originalValue.filter((item) => item.id)
        console.log('data:>>', data)
        res = await ProductApi.update(
          created.id.substring(created.id.lastIndexOf('/') + 1, created.id.length),
          { product: data }
        )
      } else {
        // create
        res = await ProductApi.create({ product: data })
      }

      if (!res.success) throw res.error
      let _id = res.data.productCreate
        ? res.data.productCreate.product.id
        : res.data.productUpdate.product.id
      let _images = formData.images.originalValue.filter((item) => !item.id)
      let _res = null

      if (_images.length > 0) {
        for (let _item of _images) {
          if (_item.name) {
            // REST API
            // const param = await generateBase64Image(_item)
            // let _param = param.split(',')

            // _res = await ImageApi.create(res.data.product.id, { image: { attachment: _param[1] } })

            //GraphQL
            let data = {
              filename: _item.name,
              mimeType: _item.type,
              fileSize: _item.size.toString(),
              resource: 'IMAGE',
              httpMethod: 'POST',
            }
            _res = await ImageApi.createUrlImage(data)

            const [{ url, parameters, resourceUrl }] = _res.data.stagedUploadsCreate.stagedTargets

            const _formImage = new FormData()

            parameters.forEach(({ name, value }) => {
              _formImage.append(name, value)
            })

            _formImage.append('file', _item)

            const resImage = await axios.post(url, _formImage)

            if (resImage.status === 201) {
              _res = await ImageApi.create(_id.substring(_id.lastIndexOf('/') + 1, _id.length), {
                src: resourceUrl,
                altText: _item.name,
              })
            }
          } else {
            // REST API
            // _res = await ImageApi.create(res.data.product.id, { image: _item })

            //GraphQL
            _res = await ImageApi.create(_id.substring(_id.lastIndexOf('/') + 1, _id.length), {
              ..._item,
              altText: _item.src.substring(_item.src.lastIndexOf('/') + 1, _item.src.length),
            })
          }
        }
      }
      let _removeImages = formData['images'].removeValue.filter((item) => item.id)

      //REST API
      // if (_removeImages.length > 0) {
      //   for (let _item of _removeImages) {
      //     _res = await ImageApi.delete(_id, _item.id)
      //   }
      // }

      // GraphQL
      if (_removeImages.length > 0) {
        for (let _item of _removeImages) {
          _res = await ImageApi.delete(
            _id.substring(_id.lastIndexOf('/') + 1, _id.length),
            _item.id.substring(_item.id.lastIndexOf('/') + 1, _item.id.length)
          )
        }
      }
      // return
      _formData['images'].removeValue = []
      //REST API
      // _res = await ProductApi.findById(res.data.product.id)
      _res = await ProductApi.findById(_id.substring(_id.lastIndexOf('/') + 1, _id.length))
      _formData['images'].originalValue = _res.data.product.images.edges.map((item) => item.node)

      setFormData(_formData)

      actions.showNotify({ message: created.id ? 'Saved' : 'Created' })
      // console.log('res.data.product>>', res)
      onSubmited(res.data.productCreate.product)
    } catch (error) {
      console.log(error)
      actions.showNotify({ error: true, message: error.message })
    } finally {
      actions.hideAppLoading()
    }
  }

  if (!formData) return null

  // console.log('formData:>>', formData)

  return (
    <Stack vertical alignment="fill">
      <Card sectioned>
        <Stack vertical alignment="fill">
          <FormControl {...formData['title']} onChange={(value) => handleChange('title', value)} />
          <FormControl
            {...formData['body_html']}
            onChange={(value) => handleChange('body_html', value)}
          />
          <Stack distribution="fillEvenly">
            <Stack.Item fill>
              <FormControl
                {...formData['status']}
                onChange={(value) => handleChange('status', value)}
              />
            </Stack.Item>
            <Stack.Item fill></Stack.Item>
          </Stack>
          <Stack distribution="fillEvenly">
            <Stack.Item fill>
              <FormControl
                {...formData['vendor']}
                onChange={(value) => handleChange('vendor', value)}
                options={productVendors?.map((item) => ({ label: item, value: item })) || []}
              />
            </Stack.Item>
            <Stack.Item fill>
              <FormControl
                {...formData['product_type']}
                onChange={(value) => handleChange('product_type', value)}
                options={productTypes?.map((item) => ({ label: item, value: item })) || []}
              />
            </Stack.Item>
          </Stack>
        </Stack>
      </Card>

      <Images formData={formData} setFormData={setFormData} />

      <Variants formData={formData} setFormData={setFormData} />

      <Stack distribution="trailing">
        <Button onClick={onDiscard}>Discard</Button>
        <Button primary onClick={handleSubmit}>
          {created.id ? 'Save' : 'Add'}
        </Button>
      </Stack>
    </Stack>
  )
}

export default CreateForm
