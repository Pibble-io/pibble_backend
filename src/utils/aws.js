import * as AWS from 'aws-sdk';
import config from '../config';
import fs from 'fs';
import path from 'path';
import s3Zip from 's3-zip';

AWS.config.update({
    accessKeyId: config.AWS_KEY,
    secretAccessKey: config.AWS_SECRET,
    region: config.AWS_REGION
});

export const s3 = new AWS.S3();
export const sns = new AWS.SNS({ region: config.AWS_SNS_REGION });
export const ses = new AWS.SES({ apiVersion: '2010-12-01' });

export const s3ListObjectVersions = (key) => new Promise((resolve, reject) => {
    s3.listObjectVersions({
        Bucket: config.AWS_BUCKET,
        Prefix: key,
    }, async function (error, data) {
        if (error) {
            reject(error);
        } else {
            if (data.DeleteMarkers.length) {
                await s3RemoveVersionSource(key, data.DeleteMarkers[0].VersionId)
                resolve(true);
            }
            resolve(false);
        }
    });
});


export const s3RemoveTagging = (key) => new Promise((resolve, reject) => {
    s3.deleteObjectTagging({
        Bucket: config.AWS_BUCKET,
        Key: key,
    }, function (error, data) {
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    });
});


export const s3ZipFiles = (outputPath, files, folder = 'post-media-original/') => new Promise((resolve, reject) => {

    const output = fs.createWriteStream(outputPath);
    output.on('finish', resolve);
    output.on('error', reject);
    s3Zip.archive({ s3, bucket: config.AWS_BUCKET, debug: true }, folder, files)
        .on('error', reject)
        .pipe(output);

});


export const s3RemoveVersionSource = (key, VersionId) => new Promise((resolve, reject) => {
    s3.deleteObject({
        Bucket: config.AWS_BUCKET,
        Key: key,
        VersionId
    }, function (error, data) {
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    });
});

export const s3RemoveSource = (key) => new Promise((resolve, reject) => {
    s3.deleteObject({
        Bucket: config.AWS_BUCKET,
        Key: key
    }, function (error, data) {
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    });
});

export const s3UploadFile = (key, content) => new Promise((resolve, reject) => {
    s3.putObject({
        Bucket: config.AWS_BUCKET,
        Key: key,
        Body: new Buffer.from(content, 'binary'),
        ACL: 'public-read'
    }, function (error, data) {
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    });
});


export const s3UploadTempFile = (key, content) => new Promise((resolve, reject) => {
    s3.upload({
        Bucket: config.AWS_BUCKET,
        Key: key,
        Body: new Buffer.from(content, 'binary'),
        // Body: content,
        ACL: 'public-read'
    }, {
            tags: [
                {
                    Key: 'temp',
                    Value: 'true',
                }
            ],
        }, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        }).on('httpUploadProgress', function (progress) {
            // TODO: This lines for debugging purposes should be removed later.
            console.log('S3 Upload progress: ', progress);
        });
});

export const s3UploadPrivateFile = (key, content) => new Promise((resolve, reject) => {
    s3.putObject({
        Bucket: config.AWS_BUCKET,
        Key: key,
        Body: new Buffer.from(content, 'binary'),
        ACL: 'private'
    }, function (error, data) {
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    }).on('httpUploadProgress', function (progress) {
        // TODO: This lines for debugging purposes should be removed later.
        console.log('S3 Upload progress: ', progress);
    });
});

export const s3DownloadPrivateFile = (key, targetFolder = '/tmp') => new Promise((resolve, reject) => {
    const params = {
        Bucket: config.AWS_BUCKET,
        Key: key
    };

    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }
    const filePath = `${targetFolder}/${path.parse(key).base}`;

    const file = fs.createWriteStream(filePath);

    s3.getObject(params).createReadStream()
        .on('end', () => resolve(filePath))
        .on('error', reject)
        .pipe(file);
});

export const s3UploadBase64File = (key, content) => new Promise((resolve, reject) => {
    const base64Data = new Buffer.from(content.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const type = content.split(';')[0].split('/')[1];

    //TODO: add decode base64 to content.
    s3.upload({
        Bucket: config.AWS_BUCKET,
        Key: key,
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: 'image\\' + type
    }, {
            tags: [
                {
                    Key: 'temp',
                    Value: 'true',
                }
            ],
        }, function (error, data) {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        }).on('httpUploadProgress', function (progress) {
            // TODO: This lines for debugging purposes should be removed later.
            console.log('S3 Upload progress: ', progress);
        });
});

export const s3UploadIfNotExists = (key, content) => new Promise((resolve, reject) => {
    const params = {
        Bucket: config.AWS_BUCKET,
        Key: key
    };

    s3.headObject(params, function (err, data) {
        if (err) {
            s3.upload({ ...params, Body: new Buffer.from(content, 'binary'), ACL: 'public-read' }, function (error, data) {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            })
        }
        else {
            resolve(data);
        }
    });
});

export const s3DownloadFile = (key, targetFolder = '/tmp') => new Promise((resolve, reject) => {
    const params = {
        Bucket: config.AWS_BUCKET,
        Key: key
    };

    const filePath = `${targetFolder}/${path.parse(key).base}`;

    const file = fs.createWriteStream(filePath);

    s3.getObject(params).createReadStream()
        .on('end', () => resolve(filePath))
        .on('error', reject)
        .pipe(file);
});

export const copyFile = (from, to) => new Promise((resolve, reject) => {

    const params = {
        Bucket: config.AWS_BUCKET,
        CopySource: config.AWS_BUCKET + '/' + from,
        Key: to,
        ACL: 'public-read',
        TaggingDirective: 'REPLACE'  // copy without tag "temp"

    };
    s3.copyObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            reject(err);
        } else {
            console.log(data);
            resolve(data);
        }
    });
});

export const snsSendSms = (phone, message, subject = null) => new Promise((resolve, reject) => {

    // AWS.config.update({ region: config.AWS_SNS_REGION });

    sns.publish({
        PhoneNumber: phone,
        Subject: subject,
        Message: message,
        MessageStructure: 'string'
    }, function (err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data);           // successful response
        }
    });
});

export const sesSendEmail = (to, from, subject, text, html = null) => new Promise((resolve, reject) => {

    // AWS.config.update({ region: config.AWS_SES_REGION });

    const params = {
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Html: {
                    // HTML Format of the email
                    Charset: "UTF-8",
                    Data: html || text

                },
                Text: {
                    Charset: "UTF-8",
                    Data: text
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject
            }
        },
        Source: from
    };

    ses.sendEmail(params, function (err, data) {
        if (err) {
            reject(err);
        } else {
            resolve(data);           // successful response
        }
    });
});
