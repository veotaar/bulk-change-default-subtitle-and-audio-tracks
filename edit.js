const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

/* ************ START EDITING ************ */
// analyze your videos with 'npm run list' first and decide which streams you want
// after that, edit these values:
const PREFERRED_DEFAULT_AUDIO_INDEX = 0; // your desired audio index
const PREFERRED_DEFAULT_SUBTITLE_INDEX = 0; // your desired subtitle index

const OUTPUT_VIDEO_PREFIX = 'v2_'; // replace with empty string if you don't want updated file names in 'output' folder
/* ************ STOP EDITING ************ */

const PREFERRED_DEFAULT_VIDEO_INDEX = 0; // most likely this will not change, leave it at 0

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
const outputPath = path.resolve(__dirname, 'output');

function getOutputOptions (filePath, preferredVideoIndex, preferredAudioIndex, preferredSubtitleIndex) {
  const outputOptions = ['-map 0', '-c copy'];

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

      videoStreams.forEach((stream, index) => {
        if (index === preferredVideoIndex) {
          outputOptions.push(`-disposition:v:${index} default`);
        } else {
          outputOptions.push(`-disposition:v:${index} 0`);
        }

        if (stream.forced) {
          outputOptions.push(`-disposition:v:${index} -forced`);
        }
      });

      audioStreams.forEach((stream, index) => {
        if (index === preferredAudioIndex) {
          outputOptions.push(`-disposition:a:${index} default`);
        } else {
          outputOptions.push(`-disposition:a:${index} 0`);
        }

        if (stream.forced) {
          outputOptions.push(`-disposition:a:${index} -forced`);
        }
      });

      subtitleStreams.forEach((stream, index) => {
        if (index === preferredSubtitleIndex) {
          outputOptions.push(`-disposition:s:${index} default`);
        } else {
          outputOptions.push(`-disposition:s:${index} 0`);
        }

        if (stream.forced) {
          outputOptions.push(`-disposition:s:${index} -forced`);
        }
      });

      resolve(outputOptions);
    });
  });
}

function updateVideoTracks (inputFile, outputFile, optionsArray) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputFile)
      .outputOptions(optionsArray)
      .output(outputFile)
      .on('end', () => {
        console.log(`Updated: ${outputFile}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Error processing ${inputFile}:`, err.message);
        reject(err);
      }).run();
  });
}

async function processVideos (directory, videoIndex, audioIndex, subtitleIndex) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const ext = path.extname(file).toLowerCase();

    if (videoFormats.includes(ext)) {
      const outputFilePath = path.join(outputPath, `${OUTPUT_VIDEO_PREFIX}${file}`);
      try {
        const options = await getOutputOptions(filePath, videoIndex, audioIndex, subtitleIndex);
        await updateVideoTracks(filePath, outputFilePath, options);
      } catch (err) {
        console.error(`Failed to process ${file}:`, err.message);
      }
    }
  }

  console.log('Processing complete.');
}

processVideos(videosPath, PREFERRED_DEFAULT_VIDEO_INDEX, PREFERRED_DEFAULT_AUDIO_INDEX, PREFERRED_DEFAULT_SUBTITLE_INDEX);
