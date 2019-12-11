import NodeID3, {StaticNodeID3, Tags} from 'node-id3'
import sharp from 'sharp'

class Id3TagWriter {
  // eslint-disable-next-line no-useless-constructor
  constructor(private writer: StaticNodeID3) {}

  public write = async (tags: Tags, file: (Buffer | string)) => {
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
          mime: 'jpeg',
          imageBuffer: resized,
        },
      }, file)
    }
    return this.writer.write(tags, file)
  }
}

export default new Id3TagWriter(NodeID3)
