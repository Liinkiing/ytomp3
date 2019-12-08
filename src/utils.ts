export const validateYTUri = (uri: string) => {
  const matches = uri.match(/^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/)
  if (matches?.length === 0) {
    throw new Error('Invalid YouTube url')
  } else {
    // I'm using 'url-polyfill'
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    const url = new URL(uri)
    if (!url.searchParams.has('v')) {
      throw new Error('No video ID found')
    }
  }
  return uri
}
