const logger = require('../../config/logger.js');

module.exports = class sanitizeService {

    static sanitizeHtmlForMySQL = (input) => {
        if (input == null) return input;

        let s = String(input);
        // 1) 깨진 surrogate 제거 (MySQL Incorrect string value 주요 원인)
        s = s.replace(/[\uD800-\uDFFF]/g, '');
        // 2) zero-width / invisible 제거
        s = s.replace(/[\u200B-\u200F\u2060\uFEFF]/g, '');
        // 3) 제어문자 제거 (탭/개행 제외)
        s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        // 4) NBSP -> 일반 공백
        s = s.replace(/\u00A0/g, ' ');

        return s;
    }

    static sanitizeHtmlForMySQL_keepEmoji = (input) => {
        if (input == null) return input;

        let s = String(input);

        // 1) 정상 surrogate pair(이모지 등)는 유지하고,
        //    "단독" surrogate만 제거한다.
        //
        // - high surrogate 다음에 low surrogate가 오면 pair -> 유지
        // - low surrogate 앞에 high surrogate가 없으면 단독 -> 제거
        // - high surrogate 뒤에 low surrogate가 없으면 단독 -> 제거
        s = s
            // (a) high surrogate 단독 제거: 다음 문자가 low surrogate가 아니면 제거
            .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '')
            // (b) low surrogate 단독 제거: 앞 문자가 high surrogate가 아니면 제거
            .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');

        // 2) zero-width / invisible 문자 제거 (원하면 일부는 유지 가능)
        s = s.replace(/[\u200B-\u200F\u2060\uFEFF]/g, '');

        // 3) 위험한 제어문자 제거 (탭/개행 제외)
        s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        // 4) NBSP -> 일반 공백
        s = s.replace(/\u00A0/g, ' ');

        return s;
    }

    static detectBadChars(str) {
        const s = String(str ?? '');
        return {
            surrogate: /[\uD800-\uDFFF]/.test(s),
            zeroWidth: /[\u200B-\u200F\u2060\uFEFF]/.test(s),
            control: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s),
            length: s.length,
        };
    }

}