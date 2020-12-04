import fs from 'fs';
import exiftool from 'node-exiftool';

export default async (path) => {
    const ep = new exiftool.ExiftoolProcess();
    const rs = fs.createReadStream(path);
    return ep.open().then(() => ep.readMetadata(rs, [ '-File:all' ]));
};
