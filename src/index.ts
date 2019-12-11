import 'url-polyfill'
import {Command, flags} from '@oclif/command'
import chalk from 'chalk'
import ytdl from 'ytdl-core'
import {validateYTUri} from './utils'
import YTDownloader from './services/yt-downloader'

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
  }

  async run() {
    try {
      const {args: {youtubeUrl}, flags: {bitrate, output}} = this.parse(Ytomp3)
      const bitrateKbps = `${bitrate}kbps`
      const infos = await ytdl.getBasicInfo(youtubeUrl)
      const thumbnail = infos.player_response.videoDetails.thumbnail.thumbnails.last()
      this.log(`
======================
Title: ${chalk.blue(infos.media.song ?? infos.title)}
Artist: ${chalk.yellow(infos.media.artist ?? 'No artist found')}
Thumbnail: ${chalk.yellow(thumbnail.url)}
======================
`)
      this.log(`
Exporting ${chalk.green(output)} with a bitrate of ${chalk.yellow(bitrateKbps)}...
`)
      const start = Date.now()
      await YTDownloader.download({uri: youtubeUrl, output, bitrate})
      const duration = (Date.now() - start) / 1000
      this.log(`
Successfully saved ${chalk.green(output)} with a bitrate of ${chalk.yellow(bitrateKbps)} in ${chalk.blue(`~${duration}s`)}
`)
    } catch (error) {
      this.error(error.message)
    }
  }
}

export = Ytomp3
