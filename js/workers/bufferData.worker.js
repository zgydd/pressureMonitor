'use strict';
var _paddingMark = function(value, mark, length, paddingLeft) {
    var paddingLength = length - value.toString().length;
    var markContext = '';
    for (var i = 0; i < paddingLength; i++) markContext += mark;
    if (paddingLeft) return (markContext + value.toString());
    else return (value.toString() + markContext);
};
var _serialization = function(sourceData) {
    if (typeof sourceData !== 'number') sourceData = parseInt(sourceData);
    var src = _paddingMark(sourceData.toString(2), '0', 8, true);
    return [src.substring(0, 4), src.substring(4, 8)];
};
var _formatABufferData = function(recordBuffer, refResult) {
    if (recordBuffer.length < 10) return;
    refResult.origin.push(recordBuffer[0] * 256 + recordBuffer[1]);
    refResult.heart.push(recordBuffer[2] * 256 + recordBuffer[3]);
    refResult.breath.push(recordBuffer[4] * 256 + recordBuffer[5]);
    if (recordBuffer[6] < 255) refResult.rHeart = recordBuffer[6];
    if (recordBuffer[7] < 255) refResult.rBreath = recordBuffer[7];

    var motionGrp = _serialization(recordBuffer[8]);
    refResult.motion = motionGrp[1];
    refResult.pdType = motionGrp[0];

    var statusGrp = _serialization(recordBuffer[9]);
    refResult.status = statusGrp[1];
    refResult.sitStatus = statusGrp[0];
};

onmessage = function(event) {
    var message = JSON.parse(event.data);
    var buffer = message.data;

    var result = {
        origin: [],
        heart: [],
        breath: [],
        rHeart: '--',
        rBreath: '--',
        motion: '0001',
        status: '0000',
        pdType: '0001',
        sitStatus: '0000'
    };

    while (buffer.length > 2) {
        var cursor = 0;
        for (cursor = 0; cursor < buffer.length - 1; cursor++) {
            if (buffer[cursor] === 253 && buffer[cursor + 1] === 223) break;
        }
        if (cursor >= buffer.length - 1) break;
        buffer.splice(0, cursor + 2);
        //var recordLength = buffer[0];
        var record = buffer.splice(0, 10);
        //if (record.length < recordLength - 3) break;
        _formatABufferData(record, result);
    }
    postMessage(JSON.stringify(result));
};