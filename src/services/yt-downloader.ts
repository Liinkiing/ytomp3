import ffpmegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
import ytdl from 'ytdl-core'

interface DownloadParams {
  uri: string;
  output: string;
  bitrate?: number;
}

class YTDownloader {
  constructor(options: { ffmpeg: { path: string; version: string } }) {
    ffmpeg
    .setFfmpegPath(options.ffmpeg.path)
  }

  public export = async ({uri, output, bitrate = 128}: DownloadParams) => {
    return new Promise((resolve, reject) => {
      const video = ytdl(uri)
      ffmpeg(video)
      .on('progress', progress => {
        console.log(`Processed ${progress.timemark}`)
      })
      .on('end', () => {
        resolve()
      })
      .on('error', error => {
        reject(error.message)
      })
      .audioBitrate(bitrate)
      .save(output)
    })
  }
}

export default new YTDownloader({
  ffmpeg: {
    path: ffpmegInstaller.path,
    version: ffpmegInstaller.version,
  },
})
