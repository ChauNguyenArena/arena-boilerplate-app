export const filterValidOptions = (options) => {
  if (!options) return []
  return options.filter((item) => item.name && item.values.length > 0)
}

export const generateVariantsFromOptions = (options) => {
  let _options = filterValidOptions(options)

  let option1 = _options[0]
  let option2 = _options[1]
  let option3 = _options[2]

  let variants = []

  if (option1 && option2 && option3) {
    for (let i = 0; i < option1.values.length; i++) {
      for (let j = 0; j < option2.values.length; j++) {
        for (let k = 0; k < option3.values.length; k++) {
          variants.push({
            option1: option1.values[i],
            option2: option2.values[j],
            option3: option3.values[k],
          })
        }
      }
    }
  } else if (option1 && option2) {
    for (let i = 0; i < option1.values.length; i++) {
      for (let j = 0; j < option2.values.length; j++) {
        variants.push({
          option1: option1.values[i],
          option2: option2.values[j],
          option3: null,
        })
      }
    }
  } else {
    for (let i = 0; i < option1.values.length; i++) {
      variants.push({
        option1: option1.values[i],
        option2: null,
        option3: null,
      })
    }
  }

  return variants
}

export const getVariantTitle = (item) => {
  let title = item.option1
  title += item.option2 ? ` / ${item.option2}` : ``
  title += item.option3 ? ` / ${item.option3}` : ``
  return title
}

export const getVariantsChange = (variants1, variants2) => {
  const result = variants1.filter(
    (elem) =>
      !variants2.find(
        ({ option1, option2, option3 }) =>
          elem.option1 === option1 && elem.option2 === option2 && elem.option3 === option3
      )
  )
  return result
}

export const getSameVariants = (variants1, variants2) => {
  const result = variants1.filter((elem) =>
    variants2.find(
      ({ option1, option2, option3 }) =>
        elem.option1 === option1 && elem.option2 === option2 && elem.option3 === option3
    )
  )
  return result.length > 0
}

export function generateBase64Image(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}
