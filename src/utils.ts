declare global {
  interface Array<T> {
    last(): T;

    first(): T;
  }
}

Array.prototype.last = function () {
  return this[this.length - 1]
}

Array.prototype.first = function () {
  return this[0]
}

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
