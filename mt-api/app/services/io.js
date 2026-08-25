const fs = require('fs');
const appRoot = require('app-root-path');
const axios = require('axios');

module.exports = class ioService {
    static getSnapshotLocation(storeCode) {
        const snapShotLocation = `public/PDSdata/leaflet/${storeCode}/`;
        if (!fs.existsSync(snapShotLocation)) {
            fs.mkdirSync(snapShotLocation, { recursive: true });
        }
        return snapShotLocation;
    }
    
    static imageFileSaveFromBLOB(path, fileName, fileContent) {
        try {
            const fileExtension = fileContent.split(';')[0].match(/jpeg|png|gif/)[0];
            const fileData = fileContent.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(fileData, 'base64');
            const filePath = `${path}${fileName}.${fileExtension}`;
            // 비동기로 저장. 이 메서드는 리턴값이 undefined 뿐
            fs.writeFileSync(filePath, buffer);
            // 비동기로 저장된 파일이 존재하는지 확인해서 잘 저장되었으면 경로, 아니면 ""
            if (fs.existsSync(filePath)) return filePath; else return "";
        } catch {
            return "";
        }
    }
}