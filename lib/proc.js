/**
 * Author: @nadir93
 * Date 2018.6.17
 */
const log = require('./log');
const message = require('./message');
const bucket = require('./bucket');

const upload = async (data) => {
  if (data.length === 0) {
    return;
  }
  await bucket.upload(data);
}

const proc = (event) => {
  return new Promise(async (resolve, reject) => {
    let success = 0; // Number of valid entries found
    let failure = 0; // Number of invalid entries found
    //const output = event.records.map((record) => {
    const output = [];
    const subOutput = [];

    try {
      for (let i = 0; i < event.records.length; i++) {
        const entry = (new Buffer(event.records[i].data, 'base64')).toString('utf8');
        var rec = JSON.parse(entry);
        log.debug('Decoded payload:', entry);

        const data = message.unmarshall(rec);
        log.debug('unmarshall data:', data);

        if (message.validate(data)) {

          let eventType;
          if (data.eventName === 'MODIFY') {
            eventType = 'U';
          } else if (data.eventName === 'INSERT') {
            eventType = 'I';
          } else if (data.eventName === 'REMOVE') {
            eventType = 'D';
          } else {
            eventType = 'UNKNOWN';
          }
          //${rec.page_id.S},${payl.Hits},${payl.session.start_timestamp},${payl.session.stop_timestamp},${payl.device.location.country}
          const result = `${eventType},${data.GOODS_NO},${data.GSRV_NO},${data.MORD_GOODS_NO},${data.MORD_SL_CNDT_NO},,,,,,,,,,,,,,,,,,,,,\n`;
          const payload = (new Buffer(result, 'utf8')).toString('base64');
          log.debug('payload', payload);
          success++;

          output.push({
            recordId: event.records[i].recordId,
            result: 'Ok',
            data: payload,
          });

          log.debug('data.GSRV_CONTS.length:', data.GSRV_CONTS.length);

          if (data.GSRV_CONTS && data.GSRV_CONTS.length > 0) {
            for (let j = 0; j < data.GSRV_CONTS.length; j++) {
              subOutput.push(`${eventType},${data.GOODS_NO},${data.GSRV_NO},${data.GSRV_CONTS[j].RGST_DTTM},${data.GSRV_CONTS[j].GSRV_IMG_FILE_NM},${data.GSRV_CONTS[j].MODI_DTTM},${data.GSRV_CONTS[j].MODR_ID},${data.GSRV_CONTS[j].GSRV_IMG_SEQ},${data.GSRV_CONTS[j].GSRV_IMG_DISP_YN},${data.GSRV_CONTS[j].RGSTR_ID},${data.GSRV_CONTS[j].GSRV_IMG_ROUTE_NM}\n`);
            }
          }
        } else {
          failure++;
          output.push({
            recordId: event.records[i].recordId,
            result: 'ProcessingFailed',
            data: event.records[i].data,
          });
        }
      }
      //upload subOutput
      await bucket.upload(subOutput);

      log.debug(`Processing completed.  Successful records ${success}, Failed records ${failure}.`);
      resolve({
        records: output
      });
    } catch (e) {
      reject(e);
    }
  })
};

module.exports = proc;