import NodeID3 from 'node-id3'
import sharp from 'sharp'

class Id3TagWriter {
  // eslint-disable-next-line no-useless-constructor
  constructor(private writer: typeof NodeID3) {}

  public write = async (tags: NodeID3.Tags, file: (Buffer | string)) => {
    if (tags.image && tags.image.imageBuffer) {
      const resized = await sharp(tags.image.imageBuffer)
      .resize({
        width: 400,
        height: 400,
        fit: 'contain',
      })
      .jpeg()
      .toBuffer()
      return this.writer.write({
        ...tags,
        image: {
          description: '',
          type: {id: 3, name: 'front cover'},
          mime: 'jpeg',
          imageBuffer: resized,
        },
      }, file as Buffer)
    }
    return this.writer.write(tags, file as string)
  }
}

export default new Id3TagWriter(NodeID3)
