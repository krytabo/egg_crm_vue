export function cn(...inputs) {
  const flattened = inputs.flat ? inputs.flat(Infinity) : flatten(inputs)
  return flattened.filter(Boolean).join(' ')
}

function flatten(items, acc = []) {
  for (const item of items) {
    if (Array.isArray(item)) {
      flatten(item, acc)
    } else {
      acc.push(item)
    }
  }
  return acc
}
