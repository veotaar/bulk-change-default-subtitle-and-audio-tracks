const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// change this to true if you want to see video track info
// this is not necessary as most video files will just have one single video track
// leave it at false
const displayVideoStreams = false;

/* ************ FFMPEG CONFIGURATION ************ */
// refer to fluent-ffmpeg npm page for more info on these
// you need to change the file names if you are not on windows (and use correct binaries in 'bin' folder)
// or you might just delete this section if ffmpeg and other tools are installed on your system
// https://www.npmjs.com/package/fluent-ffmpeg
const ffmpegPath = path.resolve(__dirname, 'bin', 'ffmpeg.exe');
const ffprobePath = path.resolve(__dirname, 'bin', 'ffprobe.exe');
const flvmetaPath = path.resolve(__dirname, 'bin', 'flvmeta.exe');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
ffmpeg.setFlvtoolPath(flvmetaPath);
/* ************ FFMPEG CONFIGURATION END ************ */

const videoFormats = ['.mp4', '.mkv', '.avi', '.flv'];

const videosPath = path.resolve(__dirname, 'videos');

function listStreams (filePath) {
  const audioStreams = [];
  const subtitleStreams = [];
  const videoStreams = [];

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(new Error(`Error processing file ${filePath}: ${err.message}`));
        return;
      }

      const streams = metadata.streams;

      streams.forEach((stream) => {
        if (stream.codec_type === 'audio') {
          audioStreams.push({
            language: stream.tags?.language || '',
            title: stream.tags?.title || '',
            default: stream.disposition.default,
            forced: stream.disposition.forced
          });
        } else if (stream.codec_type === 'subtitle') {
          subtitleStreams.push({
            language: stream.tags?.language || '',
            title: stream.tags?.title || '',
            default: stream.disposition.default,
            forced: stream.disposition.forced
          });
        } else if (stream.codec_type === 'video') {
          videoStreams.push({
            codec: stream.codec_name,
            width: stream.width,
            height: stream.height,
            default: stream.disposition.default,
            forced: stream.disposition.forced
          });
        }
      });

      console.log('Choose AUDIO index:');
      console.table(audioStreams);
      console.log('Choose SUBTITLE index:');
      console.table(subtitleStreams);
      if (displayVideoStreams) {
        console.log('Choose VIDEO index:');
        console.table(videoStreams);
      }
      console.log('+++++++++++++++++++++++++++++');

      resolve();
    });
  });
}

async function processStreams (directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const ext = path.extname(file).toLowerCase();

    if (videoFormats.includes(ext)) {
      console.log('+++++++++++++++++++++++++++++');
      console.log('File: ', file);
      try {
        await listStreams(filePath);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

processStreams(videosPath);
