@liinkiing/ytomp3
======

A simple tool to export a YouTube video to a mp3

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@liinkiing/ytomp3.svg)](https://npmjs.org/package/@liinkiing/ytomp3)
[![Downloads/week](https://img.shields.io/npm/dw/@liinkiing/ytomp3.svg)](https://npmjs.org/package/@liinkiing/ytomp3)
[![License](https://img.shields.io/npm/l/@liinkiing/ytomp3.svg)](https://github.com/Liinkiing/@liinkiing/ytomp3/blob/master/package.json)

# Installation
```bash
# with npm
$ npm i -g @liinkiing/ytomp3

# with yarn
$ yarn global add @liinkiing/ytomp3

# with npx
$ npx @liinkiing/ytomp3
```

# Usage
```
USAGE
  $ ytomp3 [YOUTUBE_URL] # Convert a YouTube video to a mp3 file

ARGUMENTS
  YOUTUBE_URL  The youtube video URL

OPTIONS
    -b, --bitrate=128|256|320  (required) [default: 128] Set the bitrate of the sound
    -n, --noThumbnail          Don't attach a thumbnail in the sound ID3 tags
    -o, --output=output        (required) [default: exported.mp3] The output file
```
