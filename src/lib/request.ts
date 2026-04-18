export function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
