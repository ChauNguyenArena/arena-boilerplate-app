import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  AlphaCard,
  Button,
  Checkbox,
  Divider,
  LegacyCard,
  LegacyStack,
  Text,
  TextField,
  Thumbnail,
} from '@shopify/polaris'
import FormControl from '../../components/FormControl'
import ConfirmModal from '../../components/ConfirmModal'

function Images(props) {
  const { formData, setFormData } = props
  const [showAddImageForm, setShowAddImageForm] = useState(false)
  const [urlImage, setUrlImage] = useState('')

  return (
    <AlphaCard>
      <LegacyStack>
        <LegacyStack.Item fill>
          <Text variant="headingMd" as="h2">
            Images
          </Text>
        </LegacyStack.Item>
        {formData.images.removeValue.length > 0 && (
          <LegacyStack.Item>
            <Button
              plain
              destructive
              onClick={() => {
                let _formData = { ...formData }
                let _filter = [..._formData['images'].removeValue]
                let result = formData['images'].originalValue.filter(
                  (elem) => !_filter.includes(elem)
                )

                _formData['images'].originalValue = result
                setFormData(_formData)
              }}
            >
              Delete all
            </Button>
          </LegacyStack.Item>
        )}

        <LegacyStack.Item>
          <Button plain onClick={() => setShowAddImageForm(true)}>
            Add Image with url
          </Button>
        </LegacyStack.Item>
      </LegacyStack>

      <div style={{ margin: '1rem 0' }}>
        <Divider />
      </div>

      <LegacyStack>
        {formData.images.originalValue.length > 0 &&
          formData.images.originalValue.map((item, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <div
                id={index}
                style={{
                  position: 'absolute',
                  right: '13px',
                  top: '0px',
                  height: '10px',
                  width: '10px',
                }}
              >
                <Checkbox
                  checked={formData.images.removeValue.includes(item)}
                  onChange={() => {
                    let _formData = { ...formData }
                    let _filter = [..._formData['images'].removeValue]
                    _filter = !_filter.includes(item)
                      ? [..._filter, item]
                      : _filter.filter((_item) => _item !== item)

                    _formData['images'].removeValue = _filter
                    setFormData(_formData)
                  }}
                />
              </div>

              <img
                width="100px"
                height="100px"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: '10px',
                  border: 'dashed gray',
                  borderWidth: '1px',
                }}
                src={item.src ? item.src : window.URL.createObjectURL(item)}
              />
            </div>
          ))}
        <FormControl
          {...formData['images']}
          onChange={(value) => {
            let _formData = { ...formData }
            _formData['images'].originalValue = [...formData['images'].originalValue, ...value]
            setFormData(_formData)
          }}
        />
      </LegacyStack>
      {showAddImageForm && (
        <ConfirmModal
          title="Add file from URL"
          content={
            <TextField
              label="Image, YouTube, or Vimeo URL"
              placeholder="https://"
              value={urlImage}
              onChange={(value) => setUrlImage(value)}
              autoComplete="off"
            />
          }
          onClose={() => setShowAddImageForm(false)}
          secondaryActions={[
            {
              content: 'Discard',
              onAction: () => setShowAddImageForm(false),
            },
            {
              content: 'Add file',
              onAction: () => {
                let _formData = { ...formData }
                _formData['images'].originalValue = [
                  ...formData['images'].originalValue,
                  { src: urlImage },
                ]

                setFormData(_formData)
                setUrlImage('')
                setShowAddImageForm(false)
              },
              disabled: urlImage === '',
            },
          ]}
        />
      )}
    </AlphaCard>
  )
}

Images.propTypes = {}

export default Images
