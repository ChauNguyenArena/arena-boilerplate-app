import React from 'react'
import { DeleteMinor } from '@shopify/polaris-icons'
import { Button, Card, Checkbox, DataTable, Stack, TextField } from '@shopify/polaris'
import { generateVariantsFromOptions, getVariantTitle } from './actions'

let InitOptions = Array.from({ length: 3 }).map((item) => ({ name: '', values: [] }))
InitOptions[0].name = 'Size'
InitOptions[0].values = ['S', 'M', 'L']

function Variants(props) {
  const { formData, setFormData } = props

  return (
    <Card title="Variants">
      <Card.Section>
        <Checkbox
          checked={formData.options.enabled}
          label="Add options like size or color"
          onChange={() => {
            let _formData = { ...formData }
            let _enabled = !_formData.options.enabled
            _formData.options.enabled = _enabled
            _formData.options.value = _enabled ? InitOptions : null
            _formData.options.variants = _enabled
              ? generateVariantsFromOptions(_formData.options.value)
              : []
            setFormData(_formData)
          }}
        />
      </Card.Section>
      {formData.options.enabled &&
        formData.options.value.map((item, index) => (
          <Card.Section key={index} title={`Option ${index + 1}`}>
            <div style={{ marginLeft: 20 }}>
              <Stack vertical alignment="fill">
                <TextField
                  label="name"
                  value={item.name}
                  onChange={(value) => {
                    let _formData = { ...formData }
                    _formData.options.value[index].name = value
                    _formData.options.variants = generateVariantsFromOptions(
                      _formData.options.value
                    )
                    setFormData(_formData)
                  }}
                />
                <TextField
                  label="values"
                  value={item.values.join(',')}
                  onChange={(value) => {
                    let _formData = { ...formData }
                    _formData.options.value[index].values = value.split(',')
                    _formData.options.variants = generateVariantsFromOptions(
                      _formData.options.value
                    )
                    setFormData(_formData)
                  }}
                />
              </Stack>
            </div>
          </Card.Section>
        ))}

      {formData.options.variants.length > 0 && (
        <Card.Section title="Variants">
          <DataTable
            headings={['Variant', 'Price', 'Compare At Price', '']}
            columnContentTypes={['text', 'text', 'text', 'text']}
            rows={formData.options.variants.map((item, index) => [
              <div style={{ whiteSpace: 'nowrap' }}>{item.title || getVariantTitle(item)}</div>,
              <TextField
                prefix="$"
                value={item.price || ''}
                onChange={(value) => {
                  let _formData = { ...formData }
                  _formData.options.variants[index].price = value
                  setFormData(_formData)
                }}
              />,
              <TextField
                prefix="$"
                value={item.compareAtPrice || ''}
                onChange={(value) => {
                  let _formData = { ...formData }
                  _formData.options.variants[index].compareAtPrice = value
                  setFormData(_formData)
                }}
              />,
              <Button
                icon={DeleteMinor}
                onClick={() => {
                  let _formData = { ...formData }
                  _formData.options.variants = _formData.options.variants.filter(
                    (_item, _index) => _index !== index
                  )
                  setFormData(_formData)
                }}
              />,
            ])}
          />
        </Card.Section>
      )}
    </Card>
  )
}

Variants.propTypes = {}

export default Variants
