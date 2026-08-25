const jwt = require('jsonwebtoken');

//JWT토큰 생성
module.exports = class credentialService {     
    static getToken(connect, martCode) {
        return jwt.sign(
            {
                "name_connect": connect,
                "mapp_code_seqno": martCode,
                iat: 1616397394,
            }, 
            'eyJ0eXAiOiJKV1QiLOcMgo2o!)@)#)I1NiJ9IiRkYXRhIg'
        );
    }

    static async buildVerifyNumber() {
        // 랜덤번호를 만들고 리턴
        var min = 100000; // 최소값
        var max = 999999; // 최대값
        const radndomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

        return radndomNumber;
    }
}