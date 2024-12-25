flvtool2 or flvmeta

# bulk-change-default-subtitle-and-audio-tracks

I needed a way to bulk edit default subtitle and audio tracks for video files so I made this to help with that.

# Use Case

You have some video files that have multiple audio and subtitle tracks, but the default selected tracks are not the ones you want and you have to change them every time you want to watch those videos. You can use this program to save an edited copy of multiple video files at once, with your preferred audio and subtitle tracks set as default.

# You Might Not Need This

Some video players have settings for preferred audio and subtitle languages. If that won't suffice, you can use this program. For example, what if there are multiple English subtitles and you want to select a specific one?

# Prerequisites

- Node.js and npm (tested on Node 23.5.0 on Windows)
- ffmpeg, ffprobe and flvtool2 or flvmeta binaries in `bin` folder. More info on [fluent-ffmpeg github page](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg).

# Usage

- Clone or download this repository.
- Put ffmpeg, ffprobe and flvmeta binaries in `bin` directory.
- Put your video files in `videos` directory. Ideally, these video files should have the same audio track and subtitle track structure as one preferred setting will be applied to all of the videos.
- Navigate to the repository in your terminal.
- Run `npm install` to install dependencies.
- Edit the `list.js` file if necessary. The file is commented clearly.
- Run `npm run list` to analyze your videos. Make note of the subtitle and audio track indices that you want to make default.
- Edit the `edit.js` file. Input your indices here. The file is commented clearly. Example:

```
...

const PREFERRED_DEFAULT_AUDIO_INDEX = 3; // your desired audio index
const PREFERRED_DEFAULT_SUBTITLE_INDEX = 2; // your desired subtitle index

...
```

- Run `npm run edit`
- Edited video files with your preferences will be copied to the `output` folder.

# ⚠️ Storage Space Warning

Make sure to have enough space in your computer. This program will save an edited copy of your videos, not change the videos in-place.
