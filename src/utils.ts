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
  // eslint-disable-next-line prefer-regex-literals
  const YOUTUBE_REGEX = new RegExp(
    '((^(http(s)?:\\/\\/)?((w){3}.)?youtube.com?\\/watch\\?v=.+)|(^(http(s)?:\\/\\/)?((w){3}.)?youtu.be?\\/.+))',
  )
  const matches = uri.match(YOUTUBE_REGEX)
  if (matches?.length === 0) {
    throw new Error('Invalid YouTube url')
  }

  return uri
}
