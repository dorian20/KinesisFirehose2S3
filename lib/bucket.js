/**
 * Author: @nadir93
 * Date 2018.7.18
 */
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  apiVersion: '2006-03-01'
});
const log = require('./log');
const crypto = require('crypto');
const secret = 'abcdefg';

const create = () => {}

const upload = (contents) => {
  return new Promise((resolve, reject) => {
    // Create S3 service object
    // call S3 to retrieve upload file to specified bucket
    const uploadParams = {
      Bucket: 'elltdev.data.lotte.net/KinesisFireHose/GD_GSRV',
      Key: '',
      Body: ''
    };

    let body = '';
    for (let i = 0; i < contents.length; i++) {
      body += contents[i];
    }

    uploadParams.Body = body;
    //JSON.stringify(contents);

    const key = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(contents))
      .digest('hex');

    uploadParams.Key = key;

    // call S3 to retrieve upload file to specified bucket
    s3.upload(uploadParams, (err, data) => {
      if (err) {
        log.error('Error', err);
        return reject(err);
      }

      if (data) {
        log.debug('Upload Success', data.Location);
        resolve();
      }
    });
  });
}

module.exports.create = create;
module.exports.upload = upload;