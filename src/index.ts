import 'url-polyfill'
import {Command, flags} from '@oclif/command'
import chalk from 'chalk'
import ytdl from 'ytdl-core'
import fetch from 'node-fetch'
import {validateYTUri} from './utils'
import YTDownloader from './services/yt-downloader'
import ID3Writer from './services/id3-tag-writer'
import {Tags} from 'node-id3'

class Ytomp3 extends Command {
  static description = 'Convert a YouTube video to a mp3 file'

  static args = [{name: 'youtubeUrl', required: true, parse: validateYTUri}]

  static flags = {
    bitrate: flags.integer({
      char: 'b',
      required: true,
      description: 'Set the bitrate of the sound',
      options: ['128', '256', '320'],
      default: 128,
      parse: input => Number(input),
    }),
    output: flags.string({
      char: 'o',
      required: true,
      default: 'exported.mp3',
      description: 'The output file',
    }),
    noThumbnail: flags.boolean({
      char: 'n',
      description: "Don't attach a thumbnail in the sound ID3 tags",
    }),
  }

  async run() {
    try {
      const {args: {youtubeUrl}, flags: {bitrate, output}} = this.parse(Ytomp3)
      const bitrateKbps = `${bitrate}kbps`
      const infos = await ytdl.getBasicInfo(youtubeUrl)
      const thumbnail = infos.player_response.videoDetails.thumbnail.thumbnails.last()
      const artist = infos.media.artist
      const title = infos.media.song ?? infos.title
      this.getAudioTags(title, thumbnail.url, artist)
      this.log(`
======================
Title: ${chalk.blue(title)}
Artist: ${chalk.yellow(artist ?? 'No artist found')}
Thumbnail: ${chalk.yellow(thumbnail.url)}
======================
`)
      this.log(`
Exporting ${chalk.green(output)} with a bitrate of ${chalk.yellow(bitrateKbps)}...
`)
      const start = Date.now()
      await YTDownloader.export({uri: youtubeUrl, output, bitrate})
      await ID3Writer.write(
        await this.getAudioTags(title, thumbnail.url, artist)
        , output)
      const duration = (Date.now() - start) / 1000
      this.log(`
Successfully saved ${chalk.green(output)} with a bitrate of ${chalk.yellow(bitrateKbps)} in ${chalk.blue(`~${duration}s`)}
`)
    } catch (error) {
      this.error(error.message)
    }
  }

  private getAudioTags = async (title: string, thumbnailUrl: string, artist?: string): Promise<Tags> => {
    const {flags: {noThumbnail}} = this.parse(Ytomp3)
    if (noThumbnail) {
      return {
        artist,
        title,
      }
    }
    const response = (await fetch(thumbnailUrl))
    const mime = response.headers.get('Content-Type')
    const imageBuffer = Buffer.from(await response.arrayBuffer())
    return {
      artist,
      title,
      image: {
        mime,
        type: {id: 3, name: 'front cover'},
        imageBuffer,
      },
    }
  }
}

export = Ytomp3
