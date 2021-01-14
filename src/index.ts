import {Command, flags} from '@oclif/command'
import chalk from 'chalk'
import fetch from 'node-fetch'
import {validateYTUri} from './utils'
import YTDownloader from './services/yt-downloader'
import ID3Writer from './services/id3-tag-writer'
import {Tags} from 'node-id3'
import ytdl from 'ytdl-core'
import ytpl, {Result} from 'ytpl'
import {VideoInformations} from './@types'
import os from 'os'
import AdmZip from 'adm-zip'
import * as fs from 'fs'
import * as path from 'path'

class Ytomp3 extends Command {
  static description = 'Convert a YouTube video to a mp3 file or a YouTube playlist to a zip file'

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
    name: flags.string({
      char: 'n',
      required: true,
      default: 'exported',
      description: 'The output file name',
    }),
    noThumbnail: flags.boolean({
      char: 't',
      description: "Don't attach a thumbnail in the sound ID3 tags",
    }),
  }

  async run() {
    try {
      const {args: {youtubeUrl}, flags: {bitrate, name}} = this.parse(Ytomp3)
      const uri = new URL(youtubeUrl)
      if (uri.pathname.includes('playlist')) {
        return this.handlePlaylistExport(youtubeUrl, bitrate, name)
      }

      return this.handleVideoExport(youtubeUrl, bitrate, name)
    } catch (error) {
      this.error(error.message)
    }
  }

  private exportVideo = async (uri: string, name: string, bitrate: number, infos: VideoInformations): Promise<string> => {
    this.log(`
======================
Title: ${chalk.blue(infos.title ?? 'No title found')}
Artist: ${chalk.yellow(infos.artist ?? 'No artist found')}
Thumbnail: ${chalk.yellow(infos.thumbnail.url)}
======================
`)
    const bitrateKbps = `${bitrate}kbps`
    const filename = `${name}.mp3`
    this.log(`
Exporting ${chalk.green(filename)} with a bitrate of ${chalk.yellow(bitrateKbps)}...
`)
    const start = Date.now()
    await YTDownloader.export({uri, name, bitrate})
    await ID3Writer.write(
      await this.getAudioTags(infos)
      , filename)
    const duration = (Date.now() - start) / 1000
    this.log(`
Successfully saved ${chalk.green(filename)} with a bitrate of ${chalk.yellow(bitrateKbps)} in ${chalk.blue(`~${duration}s`)}
`)

    return filename
  }

  private getVideoInformations = async (uri: string): Promise<VideoInformations> => {
    const infos = await ytdl.getBasicInfo(uri)

    return {
      thumbnail: infos.player_response.videoDetails.thumbnail.thumbnails.last(),
      url: infos.videoDetails.video_url,
      artist: infos.videoDetails.media.artist,
      title: (infos.videoDetails.media.song === '' || !infos.videoDetails.media.song) ? infos.videoDetails.title : infos.videoDetails.media.song,
    }
  }

  private getPlaylistInformations = async (uri: string): Promise<Omit<Result, 'items'> & { items: VideoInformations[] }> => {
    const infos = await ytpl(uri, {limit: Infinity})
    return {
      ...infos,
      items: infos.items
      .map(info => ({
        title: info.title,
        url: info.url,
        thumbnail: {
          width: 480,
          height: 360,
          url: info.bestThumbnail.url,
        },
        artist: info.author.name,
      })),
    }
  }

  private getAudioTags = async ({title, artist, thumbnail}: VideoInformations): Promise<Tags> => {
    const {flags: {noThumbnail}} = this.parse(Ytomp3)
    if (noThumbnail || !thumbnail.url) {
      return {
        artist,
        title,
      }
    }
    const response = (await fetch(thumbnail.url))
    const mime = response.headers.get('Content-Type')
    const imageBuffer = Buffer.from(await response.arrayBuffer())
    return {
      artist,
      title,
      image: {
        description: '',
        mime: mime ?? 'image/jpeg',
        type: {id: 3, name: 'front cover'},
        imageBuffer,
      },
    }
  }

  private handleVideoExport = async (youtubeUrl: string, bitrate: number, name: string) => {
    const infos = await this.getVideoInformations(youtubeUrl)
    this.exportVideo(youtubeUrl, name, bitrate, infos)
  }

  private handlePlaylistExport = async (youtubeUrl: string, bitrate: number, name: string) => {
    const playlist = await this.getPlaylistInformations(youtubeUrl)
    this.log(`
Processing "${playlist.title}" playlist with ${playlist.estimatedItemCount} items
`)
    const zip = new AdmZip()
    const promises = playlist.items.map(item =>
      new Promise<void>(resolve => {
        const entryName = item.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const exportPath = `${os.tmpdir()}${path.sep}${entryName}`
        this.exportVideo(item.url, exportPath, bitrate, item)
        .then(filename => {
          zip.addFile(`${entryName}.mp3`, fs.readFileSync(filename))
          fs.unlinkSync(filename)
          resolve()
        })
        .catch(error => {
          console.error(error)
          this.log(`Error while processing "${entryName}". Skipping it...`)
          resolve()
        })
      }))
    await Promise.all(promises)
    const archiveName = (name === 'exported' ? playlist.title : name) + '.zip'
    zip.writeZip(archiveName)
    this.log(`
Successfully saved archive "${chalk.green(archiveName)}"
`)
  }
}

export = Ytomp3
