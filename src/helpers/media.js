import ffprobe from "node-ffprobe";
import { spawn } from "child_process";

const getVideoCodecInfo = path => new Promise((resolve, reject) => {
    ffprobe(path, (err, info) => {
        if (err) {
            return reject(err);
        }

        resolve(info.streams.find(({ codec_type }) => codec_type === 'video'));
    });
});

const getVideoPoster = (path, thumbnailPath, time) => new Promise((resolve, reject) => {
    spawn('ffmpeg', [
        '-i', path,
        '-ss', time,
        '-vframes', '1',
        thumbnailPath,
        '-y'
    ]).on('error', reject).on('close', resolve);
});

const getVideoThumbnail = (path, thumbnailPath, time) => new Promise((resolve, reject) => {
    spawn('ffmpeg', [
        '-i', path,
        '-ss', time,
        '-vframes', '1',
        '-vf', "scale='if(gt(iw,ih),-1,640):if(gt(iw,ih),640,-1)', crop=640:640:exact=1",
        thumbnailPath,
        '-y'
    ]).on('error', reject).on('close', resolve);
});

const getImageThumbnail = (path, thumbnailPath) => new Promise((resolve, reject) => {
    spawn('ffmpeg', [
        '-i', path,
        '-vf', "scale='if(gt(iw,ih),-1,640):if(gt(iw,ih),640,-1)', crop=640:640:exact=1",
        thumbnailPath,
        '-y'
    ]).on('error', err => console.log(err)).on('close', resolve);
});

const getImageScale = (path, thumbnailPath) => new Promise((resolve, reject) => {
    spawn('ffmpeg', [
        '-i', path,
        '-vf', "scale=1080:-1",
        thumbnailPath,
        '-y'
    ]).on('error', err => console.log(err)).on('close', resolve);
});

export { getVideoCodecInfo, getVideoPoster, getVideoThumbnail, getImageThumbnail, getImageScale };