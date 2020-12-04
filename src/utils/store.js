import { s3UploadTempFile, copyFile, s3UploadFile } from "./aws";
import { pick } from 'lodash';
import fs from 'fs';

const uuidv4 = require('uuid/v4');

export const storeTempFile = async (file) => {

    const uuid = uuidv4();
    const tempCloudPath = 'temp/test/' + uuid + '.' + file.name.split('.').pop();
    const tempCloudPathJson = 'temp/test/' + uuid + '.json';
    const fileMeta = pick(file, ['name', 'mimetype', 'encoding', 'truncated', 'uuid']);

    fileMeta.uuid = uuid;
    fileMeta.path = tempCloudPath;

    (async () => {
        await s3UploadTempFile(tempCloudPathJson, Buffer.from(JSON.stringify({ ...fileMeta, status: 'uploading' })));
        await s3UploadTempFile(tempCloudPath, file.data);
        await s3UploadTempFile(tempCloudPathJson, Buffer.from(JSON.stringify({ ...fileMeta, status: 'completed' })));
    })();

    return fileMeta;
};

export const moveFromTempToStable = (from, to) => {
    copyFile(from, to);
};