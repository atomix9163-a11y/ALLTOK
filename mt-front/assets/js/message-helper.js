function getSendType(sendType) {
    if (sendType) {
        let sendTypeValue = parseInt(sendType);
        switch (sendTypeValue) {
            case 1 : return "SMS";
            case 2 : return "MMS";
            case 3 : return "RCS";
            case 5 : return "AT";
            default: return "";
        }
    } else {
        return ""
    }
}

function getSendResult(RSLT) {
    if (RSLT) {
        if (RSLT == "C") return "취소";
        let result = parseInt(RSLT); 
        switch (result) {
            case 0: return "대기";
            case 1: return "발송중";
            case 2: return "결과대기";
            case 3: return "완료";
        }
    } else {
        return ""
    }
}

// 메시지 발송 규칙 번호를 얻는다.
// DB에 있으며, 변경 시 여기도 함께 변경해야만 한다
function getMessagePolicyCode(useAT, useFT, useRCSSMS, useRCSLMS, useSMS, useLMS) {
    console.log(useAT, useFT, useRCSSMS, useRCSLMS, useSMS, useLMS)
    if (!useAT && !useFT && !useRCSSMS && !useRCSLMS && !useSMS && !useLMS) return "MP000"; 
    if (useAT && !useFT && !useRCSSMS && !useRCSLMS && !useSMS && !useLMS) return "MP001"; 
    if (useAT && !useFT && useRCSSMS && !useRCSLMS && !useSMS && !useLMS) return "MP002";
    if (useAT && !useFT && useRCSSMS && !useRCSLMS && useSMS && !useLMS) return "MP003";
    if (useAT && !useFT && !useRCSSMS && !useRCSLMS && useSMS && !useLMS) return "MP004";
    if (useAT && !useFT && !useRCSSMS && !useRCSLMS && !useSMS && useLMS) return "MP005";
    if (!useAT && !useFT && useRCSSMS && !useRCSLMS && useSMS && !useLMS) return "MP006";
    if (!useAT && !useFT && useRCSSMS && !useRCSLMS && !useSMS && !useLMS) return "MP007";
    if (!useAT && !useFT && !useRCSSMS && !useRCSLMS && useSMS && !useLMS) return "MP008";
    if (!useAT && useFT && !useRCSSMS && !useRCSLMS && !useSMS && !useLMS) return "MP009";
    if (!useAT && useFT && !useRCSSMS && !useRCSLMS && useSMS && !useLMS) return "MP010";
    if (!useAT && useFT && !useRCSSMS && !useRCSLMS && !useSMS && useLMS) return "MP011";
    if (!useAT && !useFT && !useRCSSMS && useRCSLMS && !useSMS && useLMS) return "MP012";
    if (!useAT && !useFT && !useRCSSMS && useRCSLMS && !useSMS && !useLMS) return "MP013";
    if (!useAT && !useFT && !useRCSSMS && useRCSLMS && useSMS && !useLMS) return "MP014";
    if (!useAT && !useFT && !useRCSSMS && !useRCSLMS && !useSMS && useLMS) return "MP015";
    if (!useAT && !useFT && useRCSSMS && !useRCSLMS && !useSMS && useLMS) return "MP016";

    // if (useAT) {
    //     if (useRCSSMS) {
    //         if (useSMS) {
    //             // useAT/Y, useRCSSMS/Y, useSMS/Y
    //             return "MP003";
    //         } else {
    //             // useAT/Y, useRCSSMS/Y, useSMS/N
    //             return "MP002";
    //         }
    //     } else {
    //         if (useSMS) {
    //             // useAT/Y, useRCSSMS/N, useSMS/Y
    //             return "MP004";
    //         } else {
    //             // useAT/Y, useRCSSMS/N, useSMS/N
    //             return "MP001";
    //         }
    //     }
    // } else {
    //     if (useRCSSMS) {
    //         if (useSMS) {
    //             // useAT/N, useRCSSMS/Y, useSMS/Y
    //             return "MP005";
    //         } else {
    //             // useAT/N, useRCSSMS/Y, useSMS/N
    //             return "MP006";
    //         }
    //     } else {                    
    //         if (useSMS) {
    //             // useAT/N, useRCSSMS/N, useSMS/Y
    //             return "MP007";
    //         } else {
    //             // useAT/N, useRCSSMS/N, useSMS/N
    //             return "MP000";
    //         }
    //     }                
    // }

}

function getMessageProcessJSON(usePush, useFT, unitPriceFT, useAT, unitPriceAT, useRCSSMS, unitPriceRCSSMS, useRCSLMS, unitPriceRCSLMS, useSMS, unitPriceSMS, useLMS, unitPriceLMS) {
    let dataJSON = [];
    
    let order = 1;
    if (usePush) {
        let JSON = {
            seq: order++,
            method: 'PUSH',
            unitPrice: 0
        }
        dataJSON.push(JSON);
    }
    if (useFT) {
        let JSON = {
            seq: order++,
            method: 'FT',
            unitPrice: unitPriceFT
        }
        dataJSON.push(JSON);
    }
    if (useAT) {
        let JSON = {
            seq: order++,
            method: 'AT',
            unitPrice: unitPriceAT
        }
        dataJSON.push(JSON);
    }
    if (useRCSSMS) {
        let JSON = {
            seq: order++,
            method: 'RCSSMS',
            unitPrice: unitPriceRCSSMS
        }
        dataJSON.push(JSON);
    }
    if (useRCSLMS) {
        let JSON = {
            seq: order++,
            method: 'RCSLMS',
            unitPrice: unitPriceRCSLMS
        }
        dataJSON.push(JSON);
    }
    if (useSMS) {
        let JSON = {
            seq: order++,
            method: 'SMS',
            unitPrice: unitPriceSMS
        }
        dataJSON.push(JSON);
    }
    if (useLMS == 'Y') {
        let JSON = {
            seq: order++,
            method: 'LMS',
            unitPrice: unitPriceLMS
        }
        dataJSON.push(JSON);
    }
    return dataJSON;
}

const appPush = {
    pushTarget: 'N',
    pushTargetScreenCode: '',
    appPushName: '',
    appPushIcon: '',
    appPushText: ''
}

// <!-- 페이지 로드 완료 시 실행 -->
document.addEventListener("DOMContentLoaded", async function(){
    if (martCode && martCode != "" && (service.allowAppPush && service.allowAppPush == 'Y')) {
        // 앱푸시 발송용 정보 가져오기        
        console.log("슈켓 푸시 정보 얻기")
        await getPushInfo(martCode);
    }
})

const getPushNameAndIcon = async (martCode) => {
    let callApi = `${apiServer}/message/apiAppMartInfo`;
    let callResult = await axios.post(callApi, {
        martCode: martCode
    }, {
        headers: {
            xtoken: getCookie("xToken")
        }
    })
    .then(response => {
        console.log("마트정보", response);
        if (response.data.data.resultCode == 200 && response.data.data.resultData.data) {
            const appMartInfo = response.data.data.resultData.data;
            appPush.appPushName = appMartInfo.M_NAME;
            appPush.appPushIcon = appMartInfo.M_LOGO_PUSH;

            return true;
        } else {
            return false;
        }
    })
    .catch(error => { 
        console.log(error); 
        alert(`앱 푸시 정보를 가져올 때 오류가 발생했습니다. 잠시 후 다시 시도하거나 문의하여 주십시오.`); 
        return false; 
    });
    return callResult;
}

const getLeaftlet = async (storeCode) => {
    const callApi = `${apiServer}/leaflet/apiGetUseLeaflet`;
    const result = axios.post(callApi, {
        storeCode: storeCode
    }).then(response => {
        console.log(storeCode, response.data.data)
        if (response.data.data) {
            // 한 세트이므로, 시작 날짜가 가장 나중인 1개의 리플렛만 표시한다
            const leaflets = response.data.data;
            return leaflets.length > 0 ? leaflets[0] : null;
        }
        else
            return null;
    }).catch(error => {
        console.log(error);
        return null;
    })
    return result;
}

const getPushInfo = async (martCode) => {
    console.log("푸시 정보 가져오기", martCode, shopType)
    if (shopType == "L") {
        console.log("연동푸시")
        // 마트 정보에서 앱에 설정된 명칭과 아이콘을 얻는다

        const callResult = await getPushNameAndIcon(martCode);
        console.log("푸시", callResult)
        if (callResult) {
            // 푸시 보낼 내용 얻기
            let callApi = `${apiServer}/message/apiAppPushProducts`;
            await axios.post(callApi, {
                martCode: martCode
            }, {
                headers: {
                    xtoken: getCookie("xToken")
                }
            })
            .then(response => {                
                // console.log("푸시")
                console.log("푸시", response)
                if (response.data.data.resultCode == 200) {
                    let pushText = `<div style='padding-bottom:20px'>${response.data.data.resultData.templateIntro ? response.data.data.resultData.templateIntro : ''}</div>`;
                    if (response.data.data.resultData.data) {
                        for (let categoryData of response.data.data.resultData.data) {
                            pushText += `<div>
    <div style='font-size:120%;font-weight:900;padding-bottom:10px;color:#be493b;padding-top:10px;border-top:2px solid #DDDDDD'>${categoryData.cate_name}</div>
    <table style='width:100%;font-size:100%;font-weight:700;margin-bottom:20px;' border='0'>`;
                            if (categoryData.list) {
                                for (let product of categoryData.list) {
                                    if (product) {
                                        pushText += `<tr><td style='text-align:left;padding-left:10px;'>${product.productName}</td><td style='text-align:center'>${product.productUnit}</td><td style='text-align:right;'><span style='color:#ff0000'>${numeral(product.productPrice).format("0,0")}</span>원</td></tr>`;
                                    }
                                }
                            }
                            pushText += "</table></div>";
                        }
                    }
                    appPush.pushTarget = response.data.data.resultData.pushTarget;
                    appPush.pushTargetScreenCode = response.data.data.resultData.pushTargetScreenCode;
                    appPush.appPushText = pushText;
                    // return pushText;
                } else {
                    appPush.pushTarget = "N";
                    appPush.pushTargetScreenCode = "";
                    appPush.appPushText = "";
                    // return "";
                }
            })
            .catch(error => { 
                console.log(error); 
                alert(`앱 마트 정보를 가져올 때 오류가 발생했습니다. 잠시 후 다시 시도하거나 문의하여 주십시오.`); 
                return ""; 
            });
        }
    } else {
        console.log("단독 푸시")
        // const callResult = await getPushNameAndIcon(martCode);

        let dataJSON = await getLeaftlet(storeCode);
        if (dataJSON){
            dataJSON = JSON.parse(dataJSON.DATA)
            console.log(dataJSON)
            dataJSON.topNotice = dataJSON.topNotice.replaceAll("text-align:center;", "text-align:center;font-size:14px")
            dataJSON.topNotice = dataJSON.topNotice.replaceAll('class="text-huge"', "style='font-size:180%'")
            dataJSON.topNotice = dataJSON.topNotice.replaceAll('class="text-big"', "style='font-size:140%'")
            dataJSON.topNotice = dataJSON.topNotice.replaceAll('class="text-small"', "style='font-size:80%'")
            dataJSON.topNotice = dataJSON.topNotice.replaceAll('class="text-tiny"', "style='font-size:60%'")
            let pushText = `<div style='padding-bottom:20px'>${dataJSON.topNotice}</div>`;
            if (dataJSON.section.length > 0) {
                for (let section of dataJSON.section) {
                    pushText += `<div style='font-size:120%;padding-bottom:10px'>${section.title}</div>`;
                    if (section.product.length > 0) {
                        pushText += `<table style='width:100%;font-size:100%;font-weight:100;margin-bottom:20px' border='0'>`;
                        for (let product of section.product) {
                            pushText += `<tr><td style='text-align:left;padding-left:10px'>${product.tmpl_dt_tl}</td><td style='text-align:center'>${product.tmpl_dt_unit}</td><td style='text-align:right;'>${numeral(product.tmpl_dt_sale_price).format("0,0")}원</td></tr>`;
                        }
                        pushText += `</table>`;
                    }
                }
            }
            appPush.appPushText = pushText;
        }


    }
    // console.log(appPush)
}

const showAppPushReview = async () => {
    // console.log(martCode)

    const modal_appPushReview = new bootstrap.Modal(document.getElementById('modal-app-push-review'));
    modal_appPushReview.show();        

    await getPushInfo(martCode)


    let appPushTitleHTML = `<img src='${appPush.appPushIcon}' class='appPushTitleIcon' > ${storeName}`;
    document.getElementById("appPush-review-title").innerHTML = appPushTitleHTML;

    document.getElementById("appPush-review-text").innerHTML = appPush.appPushText;
}

// 모바일페이지 미리보기
const showReviewOnRCS = (shopUri) => {
    window.open(shopUri, "_blank", "toolbar=no,scrollbars=yes,resizable=no,width=430,height=932")
}

function getSMSResult(RSLT) {
    if (RSLT) {
        let result = parseInt(RSLT); 
        let rslt_msg = `(${result})`;
        switch (result) {
            case 0: rslt_msg += " 성공"; break;
            case 1: rslt_msg += " 시스템장애"; break;
            case 2: rslt_msg += " 인증실패"; break;
            case 3: rslt_msg += " 메시지형식오류"; break;
            case 4: rslt_msg += " BIND 안됨"; break;
            case 5: rslt_msg += " 인증티켓유효성오류"; break;
            case 6: rslt_msg += " SP(가입자) 존재하지않음"; break;
            case 7: rslt_msg += " SP(가입자) 패스워드틀림"; break;
            case 8: rslt_msg += " SP(가입자) 일시정지"; break;
            case 9: rslt_msg += " SP(가입자) 해지됨"; break;
            case 10: rslt_msg += " EU(사용자) 존재하지않음, 해지, 정지"; break;
            case 11: rslt_msg += " EU(사용자) 이미연결되어있음"; break;
            case 12: rslt_msg += " 지원하지않는메시지버전"; break;
            case 13: rslt_msg += " 서버처리용량초과"; break;
            case 14: rslt_msg += " 서버와소켓연결되지않음"; break;
            case 15: rslt_msg += " 일시적인오류"; break;
            case 16: rslt_msg += " 시간종료"; break;
            case 17: rslt_msg += " 권한없음"; break;
            case 18: rslt_msg += " 다른네트워크로중복접속됨"; break;
            case 19: rslt_msg += " 번호가할당되어있지않음"; break;
            case 20: rslt_msg += " 이미존재함"; break;
            case 21: rslt_msg += " 파일을읽을수없음"; break;
            case 22: rslt_msg += " 변환실패(팩스)"; break;
            case 23: rslt_msg += " 인자값이올바르지않음"; break;
            case 24: rslt_msg += " 초기화되지않음"; break;
            case 25: rslt_msg += " 메모리버퍼가작음"; break;
            case 26: rslt_msg += " VCID 를찾을수없음"; break;
            case 27: rslt_msg += " 가입되지않은상품"; break;
            case 28: rslt_msg += " 가입된초당메시지전송갯수초과"; break;
            case 29: rslt_msg += " 인증티켓만료"; break;
            case 30: rslt_msg += " 데이터복호화에러"; break;
            case 31: rslt_msg += " 데이터암호화에러"; break;
            case 32: rslt_msg += " 변환실패(음성)"; break;
            case 33: rslt_msg += " 가입된월간메시지전송갯수초과"; break;
            case 34: rslt_msg += " 메시지길이오류"; break;
            case 35: rslt_msg += " 전화번호오류"; break;
            case 36: rslt_msg += " 과금아이디(사용자) 존재하지않음, 해지, 정지"; break;
            case 37: rslt_msg += " 가입상품 정보 변경됨"; break;
            case 38: rslt_msg += " CustommMessageID 가 중복됨"; break;
            case 39: rslt_msg += " 이통사 시스템 장애"; break;
            case 40: rslt_msg += " 잘못된 MSG SUB TYPE(MMS)"; break;
            case 41: rslt_msg += " MMS Content 생성 실패 - 이미지, 동영상, 음성의 경우 ICS 에서 파일이 없는경우 발생"; break;
            case 42: rslt_msg += " MMS Response code parsing 에러(잘못된 이통사 응답코드)"; break;
            case 50: rslt_msg += " 스토리지에러"; break;
            case 51: rslt_msg += " 스토리지파일오류"; break;
            case 52: rslt_msg += " 스토리지서비스오류"; break;
            case 53: rslt_msg += " 스토리지접근실패"; break;
            case 54: rslt_msg += " 스토리지처리용량초과"; break;
            case 55: rslt_msg += " 스토리지의파일존재하지않음"; break;
            case 56: rslt_msg += " 할당용량초과"; break;
            case 57: rslt_msg += " 파일이이미존재함"; break;
            case 90: rslt_msg += " 동보갯수초과 (Agent)"; break;
            case 91: rslt_msg += " 데이터 형식 오류"; break;
            case 92: rslt_msg += " 첨부파일 오류"; break;
            case 93: rslt_msg += " 파일 업로드 실패"; break;
            case 94: rslt_msg += " Convert 타임아웃"; break;
            case 95: rslt_msg += " 첨부파일 제한용량 초과"; break;
            case 100: rslt_msg += " 동보처리갯수초과"; break;
            case 101: rslt_msg += " 메시지내용스팸"; break;
            case 102: rslt_msg += " 발신자스팸"; break;
            case 103: rslt_msg += " 착신자스팸"; break;
            case 104: rslt_msg += " 회신번호스팸"; break;
            case 105: rslt_msg += " 메시지데이터오류"; break;
            case 106: rslt_msg += " 메시지길이초과"; break;
            case 107: rslt_msg += " 동일착번금지"; break;
            case 108: rslt_msg += " 동일메시지제한"; break;
            case 109: rslt_msg += " callback url 스팸"; break;
            case 110: rslt_msg += " 메시지재전송실패"; break;
            case 111: rslt_msg += " 동일착번제한"; break;
            case 112: rslt_msg += " 레포트수신시간만료"; break;
            case 113: rslt_msg += " 중복된 요청"; break;
            case 114: rslt_msg += " KISA 피싱 회신번호스팸"; break;
            case 115: rslt_msg += " 미등록 회신번호 차단됨"; break;
            case 116: rslt_msg += " 회신번호 길이 오류"; break;
            case 200: rslt_msg += " 통화중"; break;
            case 201: rslt_msg += " 무응답"; break;
            case 202: rslt_msg += " 착신가입자없음"; break;
            case 203: rslt_msg += " 비가입자, 결번,  서비스정지"; break;
            case 204: rslt_msg += " 단말기 Power-off"; break;
            case 205: rslt_msg += " 음영지역"; break;
            case 206: rslt_msg += " 단말기메시지 FULL"; break;
            case 207: rslt_msg += " UNKNOWN/단말기형식오류"; break;
            case 208: rslt_msg += " 메시지가 Overflow 되어받지못함"; break;
            case 209: rslt_msg += " 번호이동된가입자"; break;
            case 210: rslt_msg += " SMS 착신전환회수초과"; break;
            case 211: rslt_msg += " 기간만료"; break;
            case 212: rslt_msg += " NPDB 가입자없음(Undeliverable)"; break;
            case 213: rslt_msg += " NPDB 오류"; break;
            case 214: rslt_msg += " SUB TYPE 오류"; break;
            case 215: rslt_msg += " 한글/영문외의가입자일경우"; break;
            case 216: rslt_msg += " 수신번호가오류인경우자리수부족혹은자리수초과"; break;
            case 217: rslt_msg += " URL sms 가입자동의 DB 에등록되어있지않은경우이면과금됨"; break;
            case 218: rslt_msg += " CID 가등록되어있지않은경우"; break;
            case 219: rslt_msg += " MsgCode 가등록되어있지않은경우"; break;
            case 220: rslt_msg += " MsgSubCode 가등록되어있지않은경우"; break;
            case 221: rslt_msg += " Message Sequence Number 가틀릴경우"; break;
            case 222: rslt_msg += " 잘못된 Data type 인경우"; break;
            case 223: rslt_msg += " 시간당보낼수있는용량을넘었을경우"; break;
            case 224: rslt_msg += " SM Receiver 내부의 Queue 가차서 더이상처리가불가능할때시스템이 장애상태이므로 메시지가처리되지않음"; break;
            case 225: rslt_msg += " ISMC(전송실패)"; break;
            case 226: rslt_msg += " CallbackURL 사용자 아님"; break;
            case 227: rslt_msg += " 착신번호 에러(자리수에러)"; break;
            case 228: rslt_msg += " 착신번호 에러(없는 번호)"; break;
            case 229: rslt_msg += " 수신거부 메시지 없음"; break;
            case 230: rslt_msg += " 21 시 이후 광고"; break;
            case 231: rslt_msg += " 성인광고,  대출광고등 기타 제한"; break;
            case 232: rslt_msg += " 단말기 착신 거부(스팸등)"; break;
            case 233: rslt_msg += " 결과 수신 대기"; break;
            case 244: rslt_msg += " 접속시도 DELAY 충분치 않음"; break;
            case 245: rslt_msg += " 메시지 전송불가(단말기에서 착신 거부)"; break;
            case 246: rslt_msg += " URL SMS 미지원 폰으로 메시지 전송불가"; break;
            case 247: rslt_msg += " 스팸 부가서비스 가입자(스팸 차단)"; break;
            case 248: rslt_msg += " 중복 메시지(시리얼 번호)"; break;
            case 249: rslt_msg += " 순간 전송량 제한 초과"; break;
            case 250: rslt_msg += " 월 전송량 제한 초과"; break;
            case 251: rslt_msg += " RESOURCE 제한에 의한 전송 제어"; break;
            case 252: rslt_msg += " RESOURCE FULL"; break;
            case 253: rslt_msg += " 전송 실패(무선망),  단말기 일시정지"; break;
            case 254: rslt_msg += " 전송 실패(무선망 -> 단말기단) 가입자 VLR 없음"; break;
            case 258: rslt_msg += " 메시지 삭제됨"; break;
            case 259: rslt_msg += " 번호이동된 가입자"; break;
            case 260: rslt_msg += " SKT 로 번호이동된 가입자"; break;
            case 261: rslt_msg += " LGT 로 번호이동된 가입자"; break;
            case 262: rslt_msg += " 번호이동 DB 조회 불가"; break;
            case 263: rslt_msg += " 메시지 타입 오류"; break;
            case 264: rslt_msg += " 해외 로밍 실패"; break;
            case 265: rslt_msg += " W2P 협약되지 않은 사업자"; break;
            case 266: rslt_msg += " 통합 한도 error"; break;
            case 267: rslt_msg += " 통합 한도 부족"; break;
            case 268: rslt_msg += " CAS,  MGW SYNC ERROR"; break;
            case 269: rslt_msg += " MGW SYSTEM ERROR"; break;
            case 270: rslt_msg += " G/W MGW 전송 ERRROR"; break;
            case 271: rslt_msg += " CAS 연동 실패"; break;
            case 300: rslt_msg += " 복수선택"; break;
            case 301: rslt_msg += " 영구이동"; break;
            case 302: rslt_msg += " 임시이동"; break;
            case 305: rslt_msg += " 프록시사용"; break;
            case 380: rslt_msg += " 대체서비스"; break;
            case 400: rslt_msg += " 잘못된요청"; break;
            case 401: rslt_msg += " 권한없음: 등록기관만사용가능. 프록시는프록시인증 407 을사용해야합니다."; break;
            case 402: rslt_msg += " 요금청구됨(향후사용을위해예약) "; break;
            case 403: rslt_msg += " 금지"; break;
            case 404: rslt_msg += " 찾을수없음: 사용자를찾을수없음"; break;
            case 405: rslt_msg += " 메소드가허용되지않음"; break;
            case 406: rslt_msg += " 수락할수없음"; break;
            case 407: rslt_msg += " 프록시인증필요"; break;
            case 408: rslt_msg += " 요청시간종료: 시간내에사용자를찾을수없음"; break;
            case 410: rslt_msg += " 없음: 사용자가일시존재하였으나더이상사용할수없음. "; break;
            case 413: rslt_msg += " 요청엔티티가너무큼"; break;
            case 414: rslt_msg += " 요구-URI 가너무김"; break;
            case 415: rslt_msg += " 지원되지않은매체유형"; break;
            case 416: rslt_msg += " 지원되지않는 URI 체계"; break;
            case 420: rslt_msg += " 잘못된확장자: 잘못된 SIP 프로토콜확장자가사용됨,  서버가인식하지못함"; break;
            case 421: rslt_msg += " 확장자필요"; break;
            case 423: rslt_msg += " 간격이너무짧음"; break;
            case 480: rslt_msg += " 일시적인사용불능"; break;
            case 481: rslt_msg += " 통화/트랜젝션이존재하지않음"; break;
            case 482: rslt_msg += " 루프가검출됨"; break;
            case 483: rslt_msg += " 홉이너무많음"; break;
            case 484: rslt_msg += " 불완전한주소"; break;
            case 485: rslt_msg += " 모호함"; break;
            case 486: rslt_msg += " 사용중"; break;
            case 487: rslt_msg += " 요청이종료됨"; break;
            case 488: rslt_msg += " 여기서수락할수없음(A 가던진 codec 이 B 에없을때,  B 가 A 에게답하는 Response)"; break;
            case 491: rslt_msg += " 요청보류중"; break;
            case 493: rslt_msg += " 복호화할수없음: S/MIME 본문부분의암호를풀수없음"; break;
            case 500: rslt_msg += " 서버내부오류"; break;
            case 501: rslt_msg += " 구현되지않음: SIP 요청메소드가구현되지않음"; break;
            case 502: rslt_msg += " 잘못된게이트웨이"; break;
            case 503: rslt_msg += " 서비스를사용할수없음"; break;
            case 504: rslt_msg += " 서버시간종료"; break;
            case 505: rslt_msg += " 지원되지않은버전: 서버가이버전의 SIP 프로토콜을지원하지않음"; break;
            case 513: rslt_msg += " 메시지가너무큼"; break;
            case 600: rslt_msg += " 모두사용중"; break;
            case 603: rslt_msg += " 거부"; break;
            case 604: rslt_msg += " 어디에도존재하지않음"; break;
            case 606: rslt_msg += " 수락할수없음"; break;
            case 1007: rslt_msg += " 세션이 존재하지 않음"; break;
            case 1012: rslt_msg += " 중복 접속"; break;
            case 1013: rslt_msg += " 로그인 되어 있지 않음"; break;
            case 1016: rslt_msg += " 레포트 전달 오류"; break;
            case 1017: rslt_msg += " 강제 로그아웃 실패"; break;
            case 1018: rslt_msg += " DB 오류"; break;
            case 1100: rslt_msg += " 메시지가 부분적으로 실행 되었으나 일부는 처리되지 못했음"; break;
            case 2000: rslt_msg += " Client 가 잘못된 응답을 보냄"; break;
            case 2001: rslt_msg += " 허용되지 않은 Command 실행에 의해 메시지가 거부된"; break;
            case 2002: rslt_msg += " 메시지에 있는 주소가 잘못된 형식이거나 유효하지 않음,  메시지 수신자가 다수일 경우 적어도 한 개의 주소가 잘못되어도 응답을 줌"; break;
            case 2003: rslt_msg += " 메시지에 있는 주소를 MMS Relay/Server 가 찾을수 없음. 이 코드는 메시지가 전송될 주소를 찾을 수 없을 때 리턴 됨,  LGT 비가입자"; break;
            case 2004: rslt_msg += " SOAP 메시지에 포함된 MIME content 의 요소나 크기,  타입이 불분명함"; break;
            case 2005: rslt_msg += " MMS Relay/Server 가 이전에 전송된 메시지에 대한 message ID 를 찾을 수 없거나, VASP 로부터 받은 응답에서 message ID 를 찾을 수 없음"; break;
            case 2006: rslt_msg += " MMS Relay/Server 가 메시지에 있는 LinkedID 를 찾을 수 없음"; break;
            case 2007: rslt_msg += " 메시지가 규격에 맞지 않거나 부적당함 / 메시지 ELEMENT 포맷 에러(파싱오류)"; break;
            case 2008: rslt_msg += " Media Conversion Error"; break;
            case 2100: rslt_msg += " 메시지 포맷 오류"; break;
            case 2101: rslt_msg += " 올바른 컨텐츠가 아님"; break;
            case 2102: rslt_msg += " SOAP 포맷 오류"; break;
            case 2103: rslt_msg += " 미지원 단말"; break;
            case 2104: rslt_msg += " 컨텐츠 크기가 커서 처리할 수 없음"; break;
            case 2105: rslt_msg += " Message Class 정보 오류"; break;
            case 2106: rslt_msg += " 발신번호 오류"; break;
            case 2107: rslt_msg += " 착신번호 오류"; break;
            case 2108: rslt_msg += " VASPID 정보 오류"; break;
            case 2109: rslt_msg += " VASID 정보 오류"; break;
            case 2110: rslt_msg += " Callback 번호 오류"; break;
            case 2111: rslt_msg += " 착신번호 오류"; break;
            case 2112: rslt_msg += " TIMESTAMP 정보 오류"; break;
            case 2113: rslt_msg += " Subject 정보 오류"; break;
            case 2114: rslt_msg += " Transaction ID 정보 오류"; break;
            case 2115: rslt_msg += " Message ID 정보 오류"; break;
            case 2116: rslt_msg += " MessageType 정보 오류"; break;
            case 2150: rslt_msg += " Mime 메시지 포맷 오류"; break;
            case 2151: rslt_msg += " Boundary 오류"; break;
            case 2152: rslt_msg += " Content-Type 오류"; break;
            case 2154: rslt_msg += " Content 오류"; break;
            case 2155: rslt_msg += " Content Encoding 오류"; break;
            case 2160: rslt_msg += " 지원하지 않는 Content 오류"; break;
            case 2161: rslt_msg += " 변환을 지원하지 않는 CONTENT 오류 수신단말이 지원할 수 없는 CONTENT 포함이 된 경우 발생"; break;
            case 2162: rslt_msg += " CONTENT ID 오류"; break;
            case 2163: rslt_msg += " TRANSACTION ID 가 중복"; break;
            case 3000: rslt_msg += " 서버에서 올바른 요청에 대한 처리를 실패함 / MMSS G/W Exception 발생"; break;
            case 3001: rslt_msg += " 메시지 처리가 불가능함,  이 코드는 메시지가 더 이상 유효하지 않거나 취소된 것에 대한 결과임,   메시지가 이미 처리 되었거나 더 이상 유효하지 않아서 MMS Relay/Server 가 처리할 수 없음"; break;
            case 3002: rslt_msg += " 서버에서 메시지를 받아들일 수 없음"; break;
            case 3003: rslt_msg += " MMS Relay/Server 가 multiple recipients 를 지원하지 않음"; break;
            case 3400: rslt_msg += " LMSC 네트워크 문제(LMSC)"; break;
            case 3430: rslt_msg += " 메시지 포맷 오류(LMSC)"; break;
            case 3505: rslt_msg += " 필수 헤더 정보가 없을 시"; break;
            case 4000: rslt_msg += " 요구된 서비스가 실행될 수 없음"; break;
            case 4001: rslt_msg += " 메시지의 Indentification header 가 client 를 확인할 수 없음 / 서비스 거부(KT)"; break;
            case 4002: rslt_msg += " 메시지에 있는 MM7 version 이 지원되지 않는 version 임"; break;
            case 4003: rslt_msg += " 메시지 헤더에 있는 Message Type 이 서버에서 지원되지 않음"; break;
            case 4004: rslt_msg += " 필수적인 FIELD 가 빠졌거나 MESSAGE-FORMAT 이 맞지 않아 XML 로 된 SOAP 메시지를 PARSING 할 수 없음"; break;
            case 4005: rslt_msg += " 일반적인 서비스 에러 / MMS G/W 내부 처리 중 처리 실패,  SKT 회신번호 없음"; break;
            case 4006: rslt_msg += " 사용자가 많아 일시적인 서비스 불가(TIME OUT)"; break;
            case 4007: rslt_msg += " 서비스를 요청한 클라이언트가 permission 이 없는 경우 / 미지원 단말 / 전송 실패 / 패스워드 인증 실패로 전송제한 - LGT"; break;
            case 4008: rslt_msg += " 서버의 용량 초과 또는 CID 별 최대 전송량 초과로 인한 과부하 제어기능 동작으로 전송 불가한 경우"; break;
            case 4100: rslt_msg += " HUBSP 인증 오류"; break;
            case 4101: rslt_msg += " HUBSP 없음 오류 / 서비스 점검중"; break;
            case 4102: rslt_msg += " HUBSP 정지 오류"; break;
            case 4103: rslt_msg += " HUBSP 폐기 오류"; break;
            case 4104: rslt_msg += " HUBSP IP 오류"; break;
            case 4200: rslt_msg += " Service Limit"; break;
            case 4201: rslt_msg += " 동보 전송 건수 초과 오류"; break;
            case 4202: rslt_msg += " 허용 트래픽 초과 오류"; break;
            case 4203: rslt_msg += " 허용 메시지 SIZE 초과 오류"; break;
            case 4300: rslt_msg += " 가입자 인증 에러 오류"; break;
            case 4301: rslt_msg += " 미 가입자 에러 오류"; break;
            case 4302: rslt_msg += " 타사 가입자(SKT) 오류"; break;
            case 4303: rslt_msg += " 타사 가입자(LGT) 오류"; break;
            case 4304: rslt_msg += " 성인 인증 실패 오류"; break;
            case 4305: rslt_msg += " 비가용폰 오류"; break;
            case 4306: rslt_msg += " 동일 메시지에 중복 수신자 오류"; break;
            case 4307: rslt_msg += " 일시정지 가입자 오류"; break;
            case 4400: rslt_msg += " 스팸 처리 오류"; break;
            case 4401: rslt_msg += " 제목 스팸 처리 오류"; break;
            case 4402: rslt_msg += " 파일명 스팸 처리 오류"; break;
            case 4403: rslt_msg += " SUB CP 스팸 처리 오류"; break;
            case 4404: rslt_msg += " 수신자별 CALLBACK 스팸 처리 오류"; break;
            case 5000: rslt_msg += " 메시지 MIME 에러 (LGT)"; break;
            case 5001: rslt_msg += " SOAP 메시지 FORMAT 에러"; break;
            case 5003: rslt_msg += " CALLBACK 번호 FORMAT 에러"; break;
            case 5010: rslt_msg += " 소켓 READ 에러"; break;
            case 5011: rslt_msg += " 소켓 WRITE 에러"; break;
            case 5014: rslt_msg += " 소켓 생성 실패"; break;
            case 5015: rslt_msg += " 형식 오류 RESPONSE 수신"; break;
            case 5016: rslt_msg += " RESPONSE 메시지를 읽지 못함"; break;
            case 5200: rslt_msg += " LMSC 전송 시 알 수 없는 오류"; break;
            case 5300: rslt_msg += " 알 수 없는 단말기 문제로 수신 불가 오류"; break;
            case 5310: rslt_msg += " 전체 메모리가 수신할 용량보다 부족함"; break;
            case 5320: rslt_msg += " 수신할 메시지를 저장할 메모리가 부족함"; break;
            case 5330: rslt_msg += " 인출 시간 초과 오류"; break;
            case 5401: rslt_msg += " 인증 실패(AAA/JUICE)"; break;
            case 5403: rslt_msg += " 재전송 실패"; break;
            case 5409: rslt_msg += " 수신자가 메시지 메니저 가입자로써 발신자 번호가 차단되어 더 이상 호 진행 안됨"; break;
            case 6000: rslt_msg += " DB 연동 실패,  QUERY 실패"; break;
            case 6010: rslt_msg += " 수신 메시지에 recipient CTN 이 없음"; break;
            case 6011: rslt_msg += " nCAS 에 없는 CTN(LGT 고객 아님)"; break;
            case 6013: rslt_msg += " 서비스 이용이 정지된 CTN (LGT)"; break;
            case 6014: rslt_msg += " 수신자가 착신거절 신청자임"; break;
            case 6021: rslt_msg += " 서비스 제공이 정지된 CP"; break;
            case 6022: rslt_msg += " 서비스 제공 기간 초과"; break;
            case 6023: rslt_msg += " CP 상태가 INVALID 로 등록되어 있음(서비스 불가)"; break;
            case 6024: rslt_msg += " CP 보안 인증 실패"; break;
            case 6025: rslt_msg += " CP 인증 PASSWORD 유효 기간 만료"; break;
            case 6030: rslt_msg += " NAS 에 있는 RAW DATA FILE 을 찾지 못함"; break;
            case 6040: rslt_msg += " NCAS 연동 실패"; break;
            case 6061: rslt_msg += " CONTENTS FILENAME 에 허용되지 않은 단어 포함"; break;
            case 6062: rslt_msg += " SUBJECT 에 허용되지 않은 단어 포함"; break;
            case 6072: rslt_msg += " MMS 비가용 단말"; break;
            case 7010: rslt_msg += " BIZ2P CP 로 등록되어 있지 않음"; break;
            case 7103: rslt_msg += " 1:1 메시지 전송 시 허용된 트래픽을 초과하여 전송하는 경우"; break;
            case 7400: rslt_msg += " MMSC 네트워크 문제(MMSC)"; break;
            case 7505: rslt_msg += " MMSC_NO_HEADER"; break;
            case 8001: rslt_msg += " MMSC 의 MM7 연동 프로세스 오동작"; break;
            case 8004: rslt_msg += " VALIDATION FAIL"; break;
            case 8005: rslt_msg += " XML VALIDATION FAIL"; break;
            case 8200: rslt_msg += " MMSC 전송 시 알 수 없는 오류"; break;
            case 8300: rslt_msg += " 알 수 없는 단말기 문제로 수신 불가 오류"; break;
            case 8310: rslt_msg += " 전체 메모리가 수신할 용량보다 부족함 오류"; break;
            case 8320: rslt_msg += " 수신할 메시지를 저장할 메모리가 부족함 오류"; break;
            case 8330: rslt_msg += " Pull 인출 시간 초과 오류"; break;
            case 8401: rslt_msg += " 인증실패"; break;
            case 8403: rslt_msg += " MAX 재전송 실패"; break;
            case 8408: rslt_msg += " 수신자가 메시지 메니저 가입자로써 발신자 번호가 차단되어 더 이상 호 진행 안됨"; break;
            case 9000: rslt_msg += " 데이터망 인증 실패"; break;
            case 9001: rslt_msg += " 데이터망 전송 실패"; break;
            case 9999: rslt_msg += " 알 수 없는 에러"; break;
            case 8888: rslt_msg += " 비인증 데이터"; break;
            default: rslt_msg += " 지정되지 않은 오류";
        }
        return rslt_msg;
    } else {
        return "";
    }
}

function getRCSResult(RSLT) {
    if (RSLT) {
        let result = parseInt(RSLT); 
        let rslt_msg = `(${result})`;
        switch (result) {
            case 0: rslt_msg += " 성공"; break;
            case 40001: rslt_msg += " Authorization Header 가 누락됨"; break;
            case 40002: rslt_msg += " 접근 토큰이 누락됨"; break;
            case 40003: rslt_msg += " 접근 토큰이 유효하지 않음"; break;
            case 40004: rslt_msg += " 접근 토큰의 유효기간이 만료됨"; break;
            case 40005: rslt_msg += " Malformed token playload"; break;
            case 40006: rslt_msg += " 접근 토큰 내 client_id가 유효하지 않음"; break;
            case 40007: rslt_msg += " 접근 토큰 내 scope이 유효하지 않음"; break;
            case 41000: rslt_msg += " Internal Server Error"; break;
            case 41001: rslt_msg += " RCS Request Timeout"; break;
            case 41002: rslt_msg += " 송신 요청한 메시지의 상태가 전달됨(delivered)로 변경되기 전에 송신 요청을 취소하거나, expiry 시점에 송신 요청을 취소한 결과"; break;
            case 41003: rslt_msg += " Throttled by message rate"; break;
            case 41004: rslt_msg += " RCS Server Busy"; break;
            case 41005: rslt_msg += " RCS Server Temporarily unavailable"; break;
            case 41006: rslt_msg += " Session does not exist"; break;
            case 41007: rslt_msg += " Expired before session establishment"; break;
            case 41008: rslt_msg += " Session already expired"; break;
            case 41009: rslt_msg += " Device not support revocation"; break;
            case 41010: rslt_msg += " IMDN received even already revoked"; break;
            case 41011: rslt_msg += " Message was already revoked"; break;
            case 41100: rslt_msg += " RCS 서버 연결이 실패함"; break;
            case 41101: rslt_msg += " RCS 서버 연결이 지연됨"; break;
            case 41102: rslt_msg += " RCS 서버 요청 처리가 실패함"; break;
            case 41103: rslt_msg += " RCS 서버 요청 처리가 지연됨"; break;
            case 41104: rslt_msg += " RCS 메시지 처리 서비스(IM) 연결이 실패함"; break;
            case 41105: rslt_msg += " RCS 메시지 처리 서비스(IM) 연결이 지연됨"; break;
            case 41106: rslt_msg += " RCS 메시지 처리 서비스(IM) 요청 처리가 실패함"; break;
            case 41107: rslt_msg += " RCS 메시지 처리 서비스(IM) 요청 처리가 지연됨"; break;
            case 41108: rslt_msg += " RCS 메시지 처리 서비스(IM) 요청 처리 수행 중 실패함"; break;
            case 41109: rslt_msg += " RCS 메시지 처리 서비스(IM) 내부 오류"; break;
            case 41111: rslt_msg += " RCS 사용자 상태 서버 연결이 실패함"; break;
            case 41112: rslt_msg += " RCS 사용자 상태 서버 연결이 지연됨"; break;
            case 41113: rslt_msg += " RCS 사용자 상태 서버 요청이 실패함"; break;
            case 41114: rslt_msg += " RCS 사용자 상태 서버 요청 처리가 지연됨"; break;
            case 41115: rslt_msg += " 챗봇 정보 서버 요청이 실패함"; break;
            case 41116: rslt_msg += " 챗봇 정보 서버 요청 처리가 지연됨"; break;
            case 41117: rslt_msg += " 송신 메시지 취소 요청 처리가 실패함. 해당 메시지가 RCS 사용자에게 전달 되었는지 알 수 없음."; break;
            case 41118: rslt_msg += " 송신 요청한 파일 메시지의 파일을 삼성전자 MaaP 서비스 저장소에 저장 실패함."; break;
            case 41200: rslt_msg += " RCS 가입자가 아님, 요청한 MSISDN을 사용하는 RCS 사용자가 없음"; break;
            case 41210: rslt_msg += " RCS 사용자가 텍스트 메시지를 수신할 수 없음"; break;
            case 41211: rslt_msg += " RCS 사용자가 파일 메시지를 수신할 수 없음"; break;
            case 41212: rslt_msg += " RCS 사용자가 Richcard 메시지를 수신할 수 없음 * FNW. 11[1] 참고"; break;
            case 41220: rslt_msg += " RCS 사용자가 Extended bot message version 1.0 항목이 포함된 메시지를 수신할 수 없음 * FNW. 11[1] 참고"; break;
            case 41221: rslt_msg += " RCS 사용자가 Extended bot message version 1.1 항목이 포함된 메시지를 수신할 수 없음 * TTAK.KO-06.0410/R5 [3] 참고"; break;
            case 41222: rslt_msg += " RCS 사용자가 Extended bot message version 1.2 항목이 포함된 메시지를 수신할 수 없음 * TTAK.KO-06.0410/R5 [3] 참고"; break;
            case 41230: rslt_msg += " RCS 사용자가 Openrichcard version 1.0 항목이 포함된 메시지를 수신할 수 없음 * TTAK.KO-06.0410/R5 [3] 참고"; break;
            case 41231: rslt_msg += " RCS 사용자가 Openrichcard version 1.1 항목이 포함된 메시지를 수신할 수 없음 * TTAK.KO-06.0410/R5 [3] 참고"; break;
            case 41232: rslt_msg += " RCS 사용자가 Openrichcard version 1.2 항목이 포함된 메시지를 수신할 수 없음 * TTAK.KO-06.0410/R5 [3] 참고"; break;
            case 41240: rslt_msg += " RCS 사용자가 위치 정보 요청 메시지를 수신할 수 없음 * FNW. 11[1] 참고"; break;
            case 41250: rslt_msg += " Failed to get message content type"; break;
            case 41300: rslt_msg += " File download failed"; break;
            case 42001: rslt_msg += " BotServiceId를 사용하는 챗봇의 정보를 찾을 수 없음"; break;
            case 42002: rslt_msg += " 요청 parameter 에 Message ID 누락"; break;
            case 42003: rslt_msg += " 요청 parameter 에 Bot ID 누락"; break;
            case 42004: rslt_msg += " 요청 parameter RCS 사용자 MSISDN 누락"; break;
            case 42005: rslt_msg += " 요청 parameter의 RCS 사용자 MSISDN 포맷 오류 (+82) 포함 확인 필요함"; break;
            case 42006: rslt_msg += " Emulator access only"; break;
            case 42007: rslt_msg += " 챗봇 상용화 전 테스트 시점에 수신 가능한 RCS 사용자 목록에 없는 RCS 사용자에게 메시지 송신 시도함"; break;
            case 42008: rslt_msg += " 요청 본문(Body)이 누락됨"; break;
            case 42009: rslt_msg += " 요청 메시지 필수 항목이 누락됨. 메시지가 isTyping, status, textMessage, audioMessage, fileMessage, geolocationPushMessage, openrichcardMessage, richcardMessage 중 하나가 아님."; break;
            case 42010: rslt_msg += " 요청 메시지 중복 항목이 포함됨. RCS Message 본문에 하나이상의 message 종류가 포함됨."; break;
            case 42011: rslt_msg += " 조회/변경 하려는 메시지ID를 가진 메시지가 없거나 상태 변경이 불가함"; break;
            case 42012: rslt_msg += " 타이핑 메시지 포맷이 잘못됨"; break;
            case 42013: rslt_msg += " trafficType에 예약되지 않은 타입이 포함됨."; break;
            case 42014: rslt_msg += " Suggested chiplist를 사용할 수 없는 메시지에 포함됨"; break;
            case 42015: rslt_msg += " Text 메시지가 비어 있음 (최소 1)"; break;
            case 42031: rslt_msg += " richcardMessage내부에 richcard 혹은 richcardcarousel이 없음"; break;
            case 42032: rslt_msg += " richcardMessage내부에 richcard 와 richcardcarousel이 모두 존재함"; break;
            case 42033: rslt_msg += " Too many richcards"; break;
            case 42034: rslt_msg += " Richcard layout이 없음"; break;
            case 42035: rslt_msg += " Richcard content가 없음"; break;
            case 42036: rslt_msg += " Richcard layout에 방향정보가 없거나 잘못됨. (“HORIZONTAL”과 “VERTICAL”만 허용함)"; break;
            case 42037: rslt_msg += " Missing image alignment"; break;
            case 42038: rslt_msg += " Richcard 내 이미지 정렬 기준이 잘못됨. (layout 방향이 “HORIZONTAL”인 경우, “LEFT”, “RIGHT”만 허용함)"; break;
            case 42039: rslt_msg += " Richcard 내 이미지 정렬 기준이 잘못됨. (layout 방향이 “VERTICAL”인 경우, 정력 기준 허용하지 않음."; break;
            case 42040: rslt_msg += " Richcard carousel의 카드넓이가 없거나 잘못됨. (“SMALL_WIDTH”, “MEDIUM_WIDTH”만 허용함)"; break;
            case 42041: rslt_msg += " Richcard carousel의 카드넓이가 “SMALL_WIDTH”인 경우 모든 미디어의 높이가 “TALL_HEIGHT”가 아님."; break;
            case 42042: rslt_msg += " Richcard에 media, description, title이 모두 없음. Richcard Title이 없거나 200자 이상임. Richcard Description이 없거나 2000자 이상임."; break;
            case 42043: rslt_msg += " SuggestedChipList에 Suggestion 이 없음"; break;
            case 42044: rslt_msg += " SuggestedChipList에 Suggestion 이 11개를 초과함"; break;
            case 42045: rslt_msg += " Suggestion에 action과 reply가 없음"; break;
            case 42046: rslt_msg += " Suggestion이 action과 reply를 모두 가짐."; break;
            case 42047: rslt_msg += " Suggestion의 action내 action이 1개 이상임"; break;
            case 42048: rslt_msg += " Richcard에 Suggestion이 4개를 초과함"; break;
            case 42049: rslt_msg += " Suggestion의 action 혹은 reply의 postback data 길이가 2048을 초과함"; break;
            case 42050: rslt_msg += " Suggestion의 action 혹은 reply의 display text가 25자를 초과함"; break;
            case 42051: rslt_msg += " Map Action에 포함된 Location 오류 "; break;
            case 42052: rslt_msg += " Map Action에 포함된 Location 내 query 혹은 latitude/longitude 만 허용함. 모두 포함됨"; break;
            case 42053: rslt_msg += " Map Action에 showLocation 혹은 requestLocationPush가 없음"; break;
            case 42054: rslt_msg += " Map Action에 showLocation 과 requestLocationPush가 모두 있음."; break;
            case 42055: rslt_msg += " Dialer Action에 phone number, enriched call, video call이 모두 없음"; break;
            case 42056: rslt_msg += " Dialer Action에 phone number, enriched call, video call 중 두 가지가 있음."; break;
            case 42057: rslt_msg += " Compose Action에 text나 recording message가 없음"; break;
            case 42058: rslt_msg += " Compose Action에 text와 recording message가 모두 존재함"; break;
            case 42059: rslt_msg += " Settings Action에 항목이 존재하지 않음"; break;
            case 42060: rslt_msg += " Settings Action에 항목이 중복됨."; break;
            case 42061: rslt_msg += " Clipboard Action에 복사할 text가 없음."; break;
            case 42062: rslt_msg += " Local browser Action에 url 이 없음"; break;
            case 42063: rslt_msg += " Share Action에 공유할 text 가 없음."; break;
            case 42064: rslt_msg += " Calendar Action에 createCalendarEvent가 없음"; break;
            case 42064: rslt_msg += " Ambiguous ShareAction"; break;
            case 42065: rslt_msg += " Calendar Action의 createCalendarEvent 내에 startTime, endTime, title 중 하나라도 없음"; break;
            case 42066: rslt_msg += " Calendar Action의 createCalendarEvent의 title이 최소 1자 최대 100자를 넘어섬"; break;
            case 42067: rslt_msg += " Calendar Action의 createCalendarEvent의 description이 최소 1자 최대 500자를 넘어섬"; break;
            case 42068: rslt_msg += " Compose Action의 composeTextMessage 내에 전화번호가 없거나 text가 최소 1자 최대 100자를 넘어섬"; break;
            case 42069: rslt_msg += " Compose Action의 composeRecodingMessage 내에 전화번호가 없거나 type이 “AUDIO” 혹은 “VIDEO” 가 아님 (대문자)"; break;
            case 42070: rslt_msg += " Device Action에 requestDeviceSpecifics 가 비어있음"; break;
            case 42071: rslt_msg += " Dialer Action에 전화번호가 없거나 DialEnrichedCall 내의 subject 가 60자를 초과함"; break;
            case 42072: rslt_msg += " Map Action의 showLocation 내에 location 이 없음"; break;
            case 42073: rslt_msg += " Url Action의 openUrl이 없음"; break;
            case 42100: rslt_msg += " Richcard media thumbnail URL이 있으나 content type, file size 가 없음"; break;
            case 42101: rslt_msg += " File 메시지에 file URL이 없음"; break;
            case 42102: rslt_msg += " 오디오 메시지에 file URL이 없음"; break;
            case 42103: rslt_msg += " Geolocation push 메시지에 pos 정보가 없음"; break;
            case 42104: rslt_msg += " Richcard Media내 URL이 없음"; break;
            case 42105: rslt_msg += " Richcard Media내 content type이 없음"; break;
            case 42106: rslt_msg += " Richcard Media내 file size가 없음"; break;
            case 42107: rslt_msg += " Richcard Media내 높이가 없거나 잘못됨. “SHORT_HEIGHT”, “MEDIUM_HEIGHT”, “TALL_HEIGHT” 만 허용함."; break;
            case 42108: rslt_msg += " Suggestion의 action 혹은 reply의 postback data가 없음"; break;
            case 42200: rslt_msg += " URL 형태의 항목에 prefix가 없거나 (http:, https:, etc.) URI 포맷에 맞지않음"; break;
            case 42201: rslt_msg += " Geolocation push 메시지에 label 길이가 200을 초과함"; break;
            case 42202: rslt_msg += " Richcard content description 길이가 200자를 초과함"; break;
            case 42203: rslt_msg += " Invalid media title"; break;
            case 42204: rslt_msg += " Invalid media description"; break;
            case 42205: rslt_msg += " Richcard carousel content가 10개를 초과함"; break;
            case 42206: rslt_msg += " Richcard Media내 file size가 잘못됨 (0이하)"; break;
            case 42207: rslt_msg += " Expiry 포맷이 RFC3339를 따르지 않음."; break;
            case 42208: rslt_msg += " Expiry 시각이 현재시각 이전임."; break;
            case 42301: rslt_msg += " Openrichcard에 layout이 없음"; break;
            case 42302: rslt_msg += " Openrichcard에 card가 없음"; break;
            case 42303: rslt_msg += " Openrichcard에 layout widget이 없음 (View, LinearLayout, TextView, ImageView 중 하나가 필수)"; break;
            case 42304: rslt_msg += " Openrichcard View의 width/height가 누락됨"; break;
            case 42305: rslt_msg += " Openrichcard LinearLayout 필수 항목이 누락됨"; break;
            case 42306: rslt_msg += " Missing Openrichcard Textview Content"; break;
            case 42307: rslt_msg += " Openrichcard TextView 필수 항목이 누락됨"; break;
            case 42308: rslt_msg += " Openrichcard TextView 텍스트 길이가 2000자를 초과함"; break;
            case 42309: rslt_msg += " Openrichcard ImageView 필수 항목이 누락됨"; break;
            case 42310: rslt_msg += " Openrichcard ImageView 미디어 파일 사이즈가 0 이하임"; break;
            case 42311: rslt_msg += " Openrichcard ImageView Scaletype에 허가되지 않은 문자열이 포함됨"; break;
            case 42312: rslt_msg += " Openrichcard content의 width/height가 누락됨"; break;
            case 42313: rslt_msg += " Openrichcard content의 width/height에 허가되지 않은 문자열이 포함됨"; break;
            case 42314: rslt_msg += " Openrichcard 공통 항목 오류 (Weight, Visibility, Background, Padding, PaddingTop, PaddingLeft, PaddingRight, PaddingBottom, Margin, MarginTop, MarginLeft, MarginRight, MarginBottom, CornerRadius)"; break;
            case 42315: rslt_msg += " Openrichcard depth가 10을 초과함"; break;
            case 42316: rslt_msg += " Button widget의 필수 항목인 Click이 누락됨."; break;
            case 42401: rslt_msg += " Invalid file type"; break;
            case 42402: rslt_msg += " 파일 메시지에 포함된 파일 URL로 다운로드 실패함"; break;
            case 42501: rslt_msg += " Missing contact"; break;
            case 42502: rslt_msg += " Missing content"; break;
            case 42503: rslt_msg += " Missing title"; break;
            case 42504: rslt_msg += " Missing description"; break;
            case 42505: rslt_msg += " Missing image url"; break;
            case 42506: rslt_msg += " Missing image type"; break;
            case 42507: rslt_msg += " Missing button link"; break;
            case 42508: rslt_msg += " Missing button text"; break;
            case 42509: rslt_msg += " Invalid title"; break;
            case 42510: rslt_msg += " Invalid description"; break;
            case 42511: rslt_msg += " Invalid image url address"; break;
            case 42512: rslt_msg += " Invalid button url address"; break;
            case 42513: rslt_msg += " Invalid button text"; break;
            case 42514: rslt_msg += " seqID와 동일한 messageID를 가진 이전 메시지가 존재함. 중복된 메시지 전송일 가능성이 있음."; break;
            case 42601: rslt_msg += " 삼성전자 MaaP 서비스가 제공하는 봇 메시지 처리량을 초과함"; break;
            case 42602: rslt_msg += " SPAM 메시지로 판정된 메시지(trafficType: advertisement-filtered, filtered)를 수신하여 CDR 생성 후 응답함."; break;
            case 45000: rslt_msg += " Internal Server Error"; break;
            case 45001: rslt_msg += " 봇 정보 parsing 오류"; break;
            case 45002: rslt_msg += " RCS 사용자 혹은 봇 capability parsing 오류"; break;
            case 45003: rslt_msg += " 파일 메시지(xml) parsing 오류"; break;
            case 45004: rslt_msg += " 봇/사용자 메시지 remote cache 접근 실패"; break;
            case 45005: rslt_msg += " ChatID remote cache 접근 실패"; break;
            case 45006: rslt_msg += " 봇 정보 서버 접근을 위한 HTTP client 생성 실패"; break;
            case 45007: rslt_msg += " 챗봇 접근을 위한 HTTP client 생성 실패"; break;
            case 50001: rslt_msg += " Authorization 헤더 파라미터 누락"; break;
            case 50002: rslt_msg += " Authorization 헤더 값 누락"; break;
            case 50003: rslt_msg += " 토큰이 일치하지 않습니다."; break;
            case 50004: rslt_msg += " 토큰이 만료되었습니다."; break;
            case 50005: rslt_msg += " 인증 토큰 에러"; break;
            case 50006: rslt_msg += " 요청된 계정 정보를 찾을 수 없습니다(BP ID)"; break;
            case 50007: rslt_msg += " 요청된 중계사 전송 계정을 찾을 수 없습니다(RCS ID)"; break;
            case 50008: rslt_msg += " 잘못된 패스워드"; break;
            case 50009: rslt_msg += " 접근 허용된 IP가 아닙니다"; break;
            case 50100: rslt_msg += " 메시지 전송을 할 수 없는 상태입니다. (서버의 요청 거부)"; break;
            case 50201: rslt_msg += " RCS 메시지 TPS가 초과되었습니다."; break;
            case 50202: rslt_msg += " RCS 메시지 Quota가 초과되었습니다."; break;
            case 51001: rslt_msg += " 시스템 에러"; break;
            case 51002: rslt_msg += " IO 에러 발생"; break;
            case 51003: rslt_msg += " 중복 Key 오류"; break;
            case 51004: rslt_msg += " 요청 파라미터 형식 오류"; break;
            case 51005: rslt_msg += " 요청 Body JSON 파싱 에러"; break;
            case 51006: rslt_msg += " 데이터를 찾을 수 없음"; break;
            case 51007: rslt_msg += " 이미 사용 중인 자동응답 메시지 ID입니다."; break;
            case 51008: rslt_msg += " 이미 사용 중인 Postback ID입니다."; break;
            case 51900: rslt_msg += " 잘못된 요청입니다."; break;
            case 51901: rslt_msg += " 삼성 MaaP Gateway NB API 연동 에러"; break;
            case 51902: rslt_msg += " 삼성 MaaP Registry Chatbot API 연동 에러"; break;
            case 51903: rslt_msg += " Capri 연동 에러"; break;
            case 51904: rslt_msg += " Webhook 처리 불가 상태 오류가 발생했습니다."; break;
            case 51905: rslt_msg += " Webhook 메시지 전송 과금 이력 작성을 실패했습니다."; break;
            case 51906: rslt_msg += " 잘못된 Webhook Url 입니다."; break;
            case 51907: rslt_msg += " 만료된 메시지 입니다."; break;
            case 51908: rslt_msg += " 재시도 횟수 초과로 인해 메시지 전송을 실패했습니다."; break;
            case 51909: rslt_msg += " Webhook 발송 메시지가 존재하지 않습니다."; break;
            case 51910: rslt_msg += " Webhook 발송 중계사 정보가 존재하지 않습니다."; break;
            case 51911: rslt_msg += " 계약관계가 없습니다."; break;
            case 51912: rslt_msg += " 삼성 시뮬레이터 연동 오류"; break;
            case 51912: rslt_msg += " Webhook 발송 준비 수행 중 오류가 발생 했습니다."; break;
            case 51913: rslt_msg += " Webhook 발송 결과 상태 갱신 중 오류가 발생 했습니다."; break;
            case 51914: rslt_msg += " CDR 생성 결과 상태 갱신 중 오류가 발생 했습니다."; break;
            case 51915: rslt_msg += " 완료 처리 결과 상태 갱신 중 오류가 발생했습니다."; break;
            case 51916: rslt_msg += " 만료 처리 결과 상태 갱신 중 오류가 발생했습니다."; break;
            case 51917: rslt_msg += " 메시지 이력 생성 작업중 오류가 발생했습니다."; break;
            case 51918: rslt_msg += " 메시지 이력 생성 작업을 실패했습니다."; break;
            case 51919: rslt_msg += " 잘못된 Webhook 요청 오류 "; break;
            case 51920: rslt_msg += " 요청 양뱡향 챗봇에 대한 정보가 존재하지 않습니다"; break;
            case 51921: rslt_msg += " 사용 불가 챗봇 상태 오류입니다"; break;
            case 51922: rslt_msg += " 요청 양방향 챗봇에 대한 양방향 중계사 정보가 존재하지 않습니다."; break;
            case 51923: rslt_msg += " 챗봇 Mo 발송 Url 정보가 미 정의 상태 입니다."; break;
            case 51924: rslt_msg += " Webhook 수신 Gateway 수행 오류"; break;
            case 51925: rslt_msg += " 미 허용 Webhook 이벤트 요청 오류"; break;
            case 51926: rslt_msg += " Webhook 수신 처리 수행 오류"; break;
            case 51927: rslt_msg += " Webhook 수신 처리 비동기 수행 오류"; break;
            case 51928: rslt_msg += " 중계사 CID Webhook 발송 Url 정보가 미 정의 상태 입니다."; break;
            case 51929: rslt_msg += " 과금 미 처리 대상 중계사 입니다."; break;
            case 51930: rslt_msg += " 수행 명령 객체 미 전달 오류입니다."; break;
            case 51931: rslt_msg += " Mo 메시지 DB 등록 오류가 발생했습니다."; break;
            case 51932: rslt_msg += " Mo 메시지 DB 등록 작업을 실패했습니다."; break;
            case 51933: rslt_msg += " 자동 응답 메시지 발송 수행 오류가 발생했습니다."; break;
            case 51934: rslt_msg += " 처리 미 대상 서비스 입니다."; break;
            case 51935: rslt_msg += " 삼성 MaaP Core 파일 서버 연결 오류가 발생했습니다."; break;
            case 51936: rslt_msg += " 파일 메시지 이벤트의 파일 메시지 다운로드 수행 오류가 발생했습니다."; break;
            case 51937: rslt_msg += " 파일 메시지 이벤트의 파일 메시지 다운로드 수행 오류가 발생했습니다."; break;
            case 51938: rslt_msg += " 파일 메시지 이벤트의 파일 정보 DB 등록 오류가 발생했습니다."; break;
            case 51939: rslt_msg += " 파일 메시지 이벤트의 파일 정보 DB 등록 작업을 실패 했습니다."; break;
            case 51950: rslt_msg += " Webhook 스케줄러 비동기 수행 오류."; break;
            case 51951: rslt_msg += " Webhook 스케줄러 DB 수행 오류."; break;
            case 51952: rslt_msg += " Webhook 스케줄러 DB 수행 실패."; break;
            case 51953: rslt_msg += " Webhook 스케줄러 프로세스 수행 오류."; break;
            case 51954: rslt_msg += " Webhook 스케줄러 프로세스 수행 실패."; break;
            case 51955: rslt_msg += " Webhook 스케줄러 프로세서 수행 오류."; break;
            case 51956: rslt_msg += " Webhook 스케줄러 프로세서 수행 실패."; break;
            case 51957: rslt_msg += " Mo 메시지가 존재하지 않습니다."; break;
            case 51958: rslt_msg += " 미 정의 Webhook 스케줄러 유형 오류"; break;
            case 52001: rslt_msg += " 전화번호 형식이 일치하지 않습니다"; break;
            case 52002: rslt_msg += " 요청을 처리할 수 없는 상태입니다."; break;
            case 52003: rslt_msg += " 이미 사용 중인 챗봇 ID입니다."; break;
            case 52004: rslt_msg += " 챗봇을 생성할 수 없습니다."; break;
            case 52005: rslt_msg += " 챗봇 정보를 변경할 수 없습니다."; break;
            case 52006: rslt_msg += " 챗봇이 있는 브랜드는 삭제 할수 없습니다."; break;
            case 52007: rslt_msg += " 챗봇 Type은 a2p, chatbot 로 설정해야 함"; break;
            case 52008: rslt_msg += " 요청 URL Parameter의 챗봇 Id와 Body Parameter 불일치"; break;
            case 52009: rslt_msg += " Persistent Menu 등록이 허용되지 않습니다."; break;
            case 52010: rslt_msg += " Persistent menu JSON 데이터 오류"; break;
            case 52016: rslt_msg += " 실시간 메시지 인입 후 10초안에 삼성으로 전달되지 못함"; break;
            case 52023: rslt_msg += " 메시지 베이스의 상태가 'pause'인 메시지 베이스 메시지로 전문 구성하여 전송 시도 시"; break;
            case 52101: rslt_msg += " 잘못된 Webhook 중계사 요청 파라미터 입니다."; break;
            case 52102: rslt_msg += " Webhook 중계 시스템 연결 오류"; break;
            case 52103: rslt_msg += " 중계사 Webhook 전송 요청을 실패 했습니다."; break;
            case 52104: rslt_msg += " 중계사 Webhook 처리 응답 수신 오류가 발생 했습니다."; break;
            case 52105: rslt_msg += " Webhook 메시지 미 수신 오류가 발생 했습니다."; break;
            case 52106: rslt_msg += " Webhook 메시지 처리 오류가 발생 했습니다."; break;
            case 52107: rslt_msg += " Webhook 메시지 발송 a2p Status 역전 현상 오류가 발생 했습니다"; break;
            case 52108: rslt_msg += " Response 이벤트 포스트백 통계 로그 데이터 생성 오류"; break;
            case 52109: rslt_msg += " Response 이벤트 포스트백 통계 로그 데이터 생성 실패"; break;
            case 52201: rslt_msg += " 자동응답 메시지 ID가 존재하지 않습니다."; break;
            case 52202: rslt_msg += " 자동응답 메시지 내용 중 누락된 필수 항목이 있습니다."; break;
            case 53001: rslt_msg += " 요청을 처리할 수 없는 파일 유형입니다."; break;
            case 53002: rslt_msg += " 파일 속성 오류"; break;
            case 53003: rslt_msg += " fileID가 없거나 ID형식에 맞지 않음"; break;
            case 53004: rslt_msg += " File 저장 오류"; break;
            case 53005: rslt_msg += " Multipart 데이터 전송 오류"; break;
            case 53006: rslt_msg += " 업로드 파일 크기 초과"; break;
            case 53007: rslt_msg += " 파일 정보 추출 오류"; break;
            case 53008: rslt_msg += " 파일 사이즈 속성 포맷 오류"; break;
            case 53009: rslt_msg += " OpenrichCard mms 메시지 파일 검증 수행 오류"; break;
            case 53010: rslt_msg += " 유효하지 않은 Openrichcard mms 메시지 이미지 파일 오류"; break;
            case 53011: rslt_msg += " 유효하지 않은 Openrichcard mms 메시지 이미지 파일 사이즈"; break;
            case 53012: rslt_msg += " 유효하지 않은 Openrichcard IframeplayB 미디어 유형 오류"; break;
            case 53013: rslt_msg += " OpenRichcard IframeplayB 미디어 구축 오류"; break;
            case 53014: rslt_msg += " Openrichcard mms 메시지베이스 미 존재 오류"; break;
            case 53015: rslt_msg += " Openrichcard mms 메시지베이스 파라미터 미 존재 오류"; break;
            case 53016: rslt_msg += " Openrichcard mms 메시지 Media 데이터 미 존재 오류"; break;
            case 53017: rslt_msg += " OpenRichCard MMS Media MessagebaseId 불일치 오류"; break;
            case 54001: rslt_msg += " 자사 고객이 아닙니다."; break;
            case 54002: rslt_msg += " 자사 고객이지만, RCS메시지를 수신할 수 있는 가입자가 아닙니다."; break;
            case 54003: rslt_msg += " 단말기기로 RCS 메시지를 전송할 수 없습니다."; break;
            case 54004: rslt_msg += " MaaP 시스템 혹은 RCS 프로토콜 상의 이슈로 발송 실패되었음 (삼성 에러 40001 ~ 41100, 42601)"; break;
            case 55001: rslt_msg += " 기업 정보 내용이 누락된 필수항목이 있습니다."; break;
            case 55002: rslt_msg += " 필수 파라미터 검증 오류"; break;
            case 55101: rslt_msg += " 대행사 정보 내용이 누락된 필수 항목이 있습니다."; break;
            case 55102: rslt_msg += " AgencyID가 존재하지 않습니다."; break;
            case 55103: rslt_msg += " BrandID에 대행 권한이 없는 AgencyID"; break;
            case 55104: rslt_msg += " 계약 정보 내용이 부정확하거나 누락된 필수 항목이 있습니다."; break;
            case 55201: rslt_msg += " 브랜드 정보 내용이 누락된 필수항목이 있습니다."; break;
            case 55202: rslt_msg += " 브랜드 명이 누락되어 있습니다."; break;
            case 55203: rslt_msg += " 브랜드 프로필 이미지가 누락되어 있습니다."; break;
            case 55204: rslt_msg += " 브랜드 CS번호가 누락되어 있습니다."; break;
            case 55205: rslt_msg += " 브랜드 메뉴 최대 개수를 초과하였거나 부정확합니다. "; break;
            case 55206: rslt_msg += " 브랜드 카테고리 설정이 잘못되어 있습니다. "; break;
            case 55207: rslt_msg += " 브랜드 홈페이지 설정이 잘못되어 있습니다."; break;
            case 55208: rslt_msg += " 브랜드 이메일 설정이 잘못되어 있습니다."; break;
            case 55209: rslt_msg += " 브랜드 주소가 잘못되어 있습니다."; break;
            case 55210: rslt_msg += " 브랜드ID가 존재하지 않음"; break;
            case 55301: rslt_msg += " 챗봇 정보 내용이 부정확하거나 누락된 필수항목이 있습니다."; break;
            case 55302: rslt_msg += " BotID(발신번호)가 전화번호 형식에 맞지 않음"; break;
            case 55303: rslt_msg += " BrandID에 존재하지 않는 BotID"; break;
            case 55501: rslt_msg += " 메시지베이스 내용이 부정확하거나 누락된 필수항목이 있습니다."; break;
            case 55502: rslt_msg += " MessagebaseID가 존재하지 않음"; break;
            case 55503: rslt_msg += " BrandID에 존재하지 않는 MessagebaseID입니다."; break;
            case 55504: rslt_msg += " messagebase의 formatstring 누락된 필수 항목이 있습니다."; break;
            case 55505: rslt_msg += " messagebase의 policy Info가 부정확하거나 누락된 필수 항목이 있습니다."; break;
            case 55506: rslt_msg += " messagebase의 param 부정확하거나 누락된 필수 항목이 있습니다."; break;
            case 55507: rslt_msg += " messagebase의 attribute 부정확하거나 누락된 필수 항목이 있습니다."; break;
            case 55508: rslt_msg += " messagebase의 type 부정확하거나 누락된 필수 항목이 있습니다."; break;
            case 55509: rslt_msg += " messagebaseID의 product type과 일치하지 않음"; break;
            case 55510: rslt_msg += " Messagebase 의 Policy 미 존재(정의) 오류"; break;
            case 55511: rslt_msg += " Messagebase 의 Param 미 존재(정의) 오류"; break;
            case 55512: rslt_msg += " 메시지베이스 서비스 불가 상태 오류"; break;
            case 55513: rslt_msg += " 메시지 상품 버전 검증 오류"; break;
            case 55601: rslt_msg += " MessagebaseForm 내용이 부정확하거나 누락된 필수항목이 있습니다."; break;
            case 55602: rslt_msg += " messagebaseformID가 존재하지 않습니다."; break;
            case 55603: rslt_msg += " messaegBase의 상품코드 에러"; break;
            case 55701: rslt_msg += " (광고)를 사용할 수 없음"; break;
            case 55702: rslt_msg += " Action button이 허용되지 않는 messagebaseID에서 Action button을 사용하였음"; break;
            case 55703: rslt_msg += " 허용되지 않은 header 값 사용"; break;
            case 55704: rslt_msg += " header 값과 일치 하지 않은 footer 사용 (ex. header가 0 인데, footer 가 있음)"; break;
            case 55705: rslt_msg += " footer값이 누락되어 있습니다 (ex. header가 1 인데, footer 가 없음)"; break;
            case 55706: rslt_msg += " footer validation 오류 (ex. 숫자, 하이픈만 가능. 20자리)"; break;
            case 55707: rslt_msg += " 등록한 패턴과 일치 하지 않음"; break;
            case 55708: rslt_msg += " title 최대글자수를 초과했습니다."; break;
            case 55709: rslt_msg += " description 최대글자수를 초과했습니다."; break;
            case 55710: rslt_msg += " 최대 버튼수를 초과했습니다."; break;
            case 55711: rslt_msg += " messagebaseID의 number of card 와 입력이 일치하지 않음"; break;
            case 55712: rslt_msg += " 최대 미디어 용량을 초과했습니다."; break;
            case 55713: rslt_msg += " Reply ID의 사용횟수 초과했습니다."; break;
            case 55714: rslt_msg += " Reply ID의 유효시간이 만료되었습니다."; break;
            case 55715: rslt_msg += " Reply ID가 존재하지 않음"; break;
            case 55716: rslt_msg += " 메시지 발송 요청 정보 유효성 검증 오류."; break;
            case 55717: rslt_msg += " 양방향 서비스 챗봇에 Bot Agency Id 미 정의 상태 오류."; break;
            case 55718: rslt_msg += " 양방향 서비스 챗봇 Bot Agency Id 와 요청 AgencyId 불일치 오류."; break;
            case 55719: rslt_msg += " 중계사/CID 정보 미 존재 오류."; break;
            case 55720: rslt_msg += " 양방향 서비스 요청 Gw Vendor Cid 불일치 오류."; break;
            case 55721: rslt_msg += " 중계사 CID 중복 상태 오류."; break;
            case 55722: rslt_msg += " 개별 미디어 허용 용량을 초과했습니다."; break;
            case 55723: rslt_msg += " 양방향 메시지 처리 데이터 상태 오류."; break;
            case 55730: rslt_msg += " RCS 메시지 검증 체크 오류"; break;
            case 55731: rslt_msg += " 오픈리치카드 mms 상품 요청 정책 검증 오류"; break;
            case 55732: rslt_msg += " 오픈리치카드 mms 상품 couplingId 미 정의 오류"; break;
            case 55733: rslt_msg += " 오픈리치카드 mms 상품 parameter 미 정의 오류"; break;
            case 55734: rslt_msg += " 오픈리치카드 mms 상품 coupled 파라미터 값 검증 오류"; break;
            case 55735: rslt_msg += " 오픈리치카드 mms 상품 visiblity 설정 오류"; break;
            case 55736: rslt_msg += " 오픈리치카드 mms 메시지 Media 포맷 유효성 오류"; break;
            case 55737: rslt_msg += " 오픈리치카드 mms 메시지 Media 파일 변환 오류"; break;
            case 55738: rslt_msg += " 오픈리치카드 mms 메시지 포맷 오류"; break;
            case 55739: rslt_msg += " 오픈리치카드 mms 메시지 Media Url 구축 실패"; break;
            case 55740: rslt_msg += " 오픈리치카드 mms 메시지 Media Url 구축 오류"; break;
            case 55741: rslt_msg += " 오픈리치카드 mms 메시지 버튼 미 존재 오류"; break;
            case 55742: rslt_msg += " 오픈리치카드 mms 미 허용 파라미터 오류"; break;
            case 55743: rslt_msg += " 오픈리치카드 mms 선택 옵션 정책 검증 오류"; break;
            case 55744: rslt_msg += " 오픈리치카드 mms 컨텐츠 구축 오류"; break;
            case 55745: rslt_msg += " 오픈리치카드 mms 메시지 파라미터 검증 오류"; break;
            case 55801: rslt_msg += " 중계사 정보가 부정확하거나 누락된 필수 항목이 있습니다."; break;
            case 55802: rslt_msg += " 메시지 형식이 부정확하거나 누락된 필수항목이 있습니다."; break;
            case 55803: rslt_msg += " 메시지 기술방법이 잘못되었습니다."; break;
            case 55804: rslt_msg += " 메시지 내용이 누락되었거나 부정확합니다."; break;
            case 55805: rslt_msg += " 요청을 처리할 수 없는 메시지 유형입니다."; break;
            case 55806: rslt_msg += " 같은 메시지 ID로 두번 이상 메시지 발송이 요청됨"; break;
            case 55807: rslt_msg += " 챗봇 권한 오류"; break;
            case 55808: rslt_msg += " 발신 가능한 챗봇 상태가 아님"; break;
            case 55809: rslt_msg += " 대행사 권한 오류"; break;
            case 55810: rslt_msg += " 메시지 유효기간 입력값 오류"; break;
            case 55811: rslt_msg += " 메시지베이스 파라미터의 길이가 한계값 이상"; break;
            case 55812: rslt_msg += " 버튼 필드를 받을 수 없는 메시지베이스 입니다."; break;
            case 55813: rslt_msg += " 최대 버튼 글자수 초과"; break;
            case 55814: rslt_msg += " 버튼 형식 오류"; break;
            case 55815: rslt_msg += " 존재하지 않는 File이거나 usageType 오류"; break;
            case 55816: rslt_msg += " Empty suggestions array 허용 안함"; break;
            case 55817: rslt_msg += " 수신 번호 형식 오류"; break;
            case 55818: rslt_msg += " 메세지베이스 ID가 존재하지 않음"; break;
            case 55819: rslt_msg += " 챗봇ID가 존재하지 않음"; break;
            case 55820: rslt_msg += " Webhook Revoked 메시지"; break;
            case 55821: rslt_msg += " 전송 성공 불확실함 (revocation fail 등)"; break;
            case 55822: rslt_msg += " 메시지 취소되어, 전송안됨"; break;
            case 55822: rslt_msg += " 양방향 서비스 사용불가"; break;
            case 55823: rslt_msg += " Empty suggestedChipList array 허용 안함"; break;
            case 55824: rslt_msg += " 칩리스트 필드를 사용할 수 없습니다."; break;
            case 55825: rslt_msg += " 버튼 필드에 Reply를 사용할 수 없습니다."; break;
            case 55880: rslt_msg += " 메시지카드 버튼 갯수 상이"; break;
            case 55881: rslt_msg += " 칩리스트 개수 초과"; break;
            case 55882: rslt_msg += " ChipList 발송 가능하지 않음"; break;
            case 55883: rslt_msg += " 유효한 replyId 아님"; break;
            case 55884: rslt_msg += " replyId 값 누락 됨"; break;
            case 55885: rslt_msg += " replyId 와 일치하는 수신번호가 아님"; break;
            case 55886: rslt_msg += " replyId 와 일치하는 Chatbot ID 아님"; break;
            case 55887: rslt_msg += " messagebase 상품 코드가 세션 메시지 가능하지 않음"; break;
            case 55888: rslt_msg += " Chatbot 이 세션 메시지 가능하지 않음"; break;
            case 55900: rslt_msg += " 잘못된 메시지 형식으로 인해 발송 실패되었고 재시도 가능하지 않음 (삼성 에러 42001 ~ 42514)"; break;
            case 56002: rslt_msg += " 메시지 회수 실패 (삼성 에러 41002)"; break;
            case 56007: rslt_msg += " RCS 세션 연결 전 만료되어 발송 실패 (삼성 에러 41007)"; break;
            case 57001: rslt_msg += " Limit 범위를 초과하였습니다."; break;
            case 57002: rslt_msg += " Offset 범위가 부정확합니다."; break;
            case 57003: rslt_msg += " 잘못된 통계 타입 입니다."; break;
            case 59001: rslt_msg += " 시스템 에러"; break;
            case 59002: rslt_msg += " IO 에러 발생"; break;
            case 59002: rslt_msg += " Backend(삼성 MaaP G/W) 서버 내부 에러"; break;
            case 59003: rslt_msg += " Backend(삼성 MaaP G/W) 서버 타임 아웃 발생"; break;
            case 59999: rslt_msg += " 기타 정의되지 않은 Error (Webhook Cancelled 메시지 등)"; break;
            case 60004: rslt_msg += " 요청을 성공적으로 처리했으나 데이터가 없음"; break;
            case 61001: rslt_msg += " Authorization 헤더 파라미터 누락"; break;
            case 61002: rslt_msg += " Authorization 헤더 값(Token) 누락"; break;
            case 61003: rslt_msg += " 유효하지 않은 Token"; break;
            case 61004: rslt_msg += " Token 만료"; break;
            case 61005: rslt_msg += " 유효하지 않은 client id"; break;
            case 61006: rslt_msg += " 유효하지 않은 secret key"; break;
            case 63001: rslt_msg += " 브랜드에 대한 권한 없음"; break;
            case 64001: rslt_msg += " X-RCS-BrandKey 헤더 누락"; break;
            case 64002: rslt_msg += " X-RCS-BrandKey 의 Brand Key 오류"; break;
            case 64101: rslt_msg += " URL 내 Brand ID 오류"; break;
            case 64102: rslt_msg += " URL 내 Agency ID 오류"; break;
            case 64103: rslt_msg += " URL 내 사업자등록번호 오류"; break;
            case 64104: rslt_msg += " URL 내 Person ID 오류"; break;
            case 64105: rslt_msg += " URL 내 chatbot ID 오류"; break;
            case 64106: rslt_msg += " URL 내 messagebase ID 오류"; break;
            case 64107: rslt_msg += " URL 내 messagebaseform ID 오류"; break;
            case 64201: rslt_msg += " 유효하지 않은 Query 파라미터 : (해당 파라미터)"; break;
            case 64202: rslt_msg += " Query 파라미터 값 오류 : (오류발생 값)"; break;
            case 64203: rslt_msg += " 필수 Query 파라미터 누락 : (누락된 파라미터)"; break;
            case 64301: rslt_msg += " Body Data 누락"; break;
            case 64302: rslt_msg += " Body Data JSON 형식 오류"; break;
            case 64303: rslt_msg += " Attribute type 오류 : (오류 발생 attribute)"; break;
            case 64304: rslt_msg += " 지정된 사이즈 초과 : (사이즈 초과된 attribute)"; break;
            case 64305: rslt_msg += " 발신번호 등록 시 통신서비스이용증명원 파일 누락"; break;
            case 64306: rslt_msg += " 발신번호 등록 시 발신번호 등록 개수 초과"; break;
            case 64307: rslt_msg += " 발신번호 등록 시 발신번호 누락"; break;
            case 64308: rslt_msg += " 발신번호 등록 시 발신번호 형식 오류"; break;
            case 64309: rslt_msg += " 발신번호 등록 시 챗봇이름 누락"; break;
            case 64310: rslt_msg += " 발신번호 등록 시 display 설정 형식 오류"; break;
            case 64311: rslt_msg += " 발신번호 등록 시 smsmo 형식 오류"; break;
            case 64312: rslt_msg += " 템플릿 등록 시 템플릿 양식 ID 누락"; break;
            case 64313: rslt_msg += " 템플릿 등록 시 템플릿 양식 ID 오류"; break;
            case 64314: rslt_msg += " 템플릿 등록 시 템플릿명 누락"; break;
            case 64315: rslt_msg += " 템플릿 등록 시 브랜드 ID 누락"; break;
            case 64316: rslt_msg += " 템플릿 등록 시 브랜드 ID 오류"; break;
            case 64317: rslt_msg += " 템플릿 등록 시 대행사 ID 오류"; break;
            case 64318: rslt_msg += " 템플릿 등록 시 formattedString 형식 오류"; break;
            case 70001: rslt_msg += " HTTP 요청 헤더에 인증 정보가 없습니다."; break;
            case 70002: rslt_msg += " 인증정보에 토큰이 없습니다."; break;
            case 70003: rslt_msg += " 토큰이 일치하지 않습니다."; break;
            case 70004: rslt_msg += " 토큰이 만료되었습니다."; break;
            case 70005: rslt_msg += " 인증에 실패하였습니다."; break;
            case 70006: rslt_msg += " 요청된 계정 정보를 찾을 수 없습니다(BP ID)"; break;
            case 70007: rslt_msg += " 요청된 중계사 전송 계정을 찾을 수 없습니다(RCS ID)"; break;
            case 70008: rslt_msg += " 잘못된 패스워드"; break;
            case 70009: rslt_msg += " 접근 허용된 IP가 아닙니다 "; break;
            case 71001: rslt_msg += " 시스템 에러"; break;
            case 71002: rslt_msg += " IO 에러 발생"; break;
            case 71003: rslt_msg += " 중복 Key 오류"; break;
            case 71004: rslt_msg += " 요청 파라미터 형식 오류"; break;
            case 71005: rslt_msg += " 요청 Body JSON 파싱 에러"; break;
            case 71006: rslt_msg += " 데이터를 찾을 수 없음"; break;
            case 71007: rslt_msg += " 잘못된 요청입니다."; break;
            case 71008: rslt_msg += " 필수 파라미터가 누락되었습니다."; break;
            case 71009: rslt_msg += " 잘못된 데이터 상태입니다."; break;
            case 71010: rslt_msg += " MAAP-FE API 연동 에러"; break;
            case 71011: rslt_msg += " KISA GW 연동 에러"; break;
            case 72100: rslt_msg += " 메시지 전송을 할 수 없는 상태입니다. (서버의 요청 거부)"; break;
            case 72101: rslt_msg += " 공통 메시지 정보가 부정확하거나 누락된 필수 항목이 있습니다."; break;
            case 72102: rslt_msg += " Legacy 메시지 정보가 부정확하거나 누락된 필수 항목이 있습니다."; break;
            case 72103: rslt_msg += " RCS 메시지 정보가 부정확하거나 누락된 필수 항목이 있습니다."; break;
            case 72104: rslt_msg += " RCS 메세지 TPS가 초과되었습니다."; break;
            case 72105: rslt_msg += " RCS 메세지 Quota가 초과되었습니다."; break;
            case 72106: rslt_msg += " 미디어 파일을 찾을수 없습니다."; break;
            case 72107: rslt_msg += " 요청을 처리할 수 없는 파일 유형입니다."; break;
            case 72108: rslt_msg += " 메시지 형식오류(메시지 규격에 맞지 않을 경우)"; break;
            case 72109: rslt_msg += " 올바른 컨텐츠가 아님"; break;
            case 72110: rslt_msg += " 동보 갯수초과 (Agent 내부)"; break;
            case 72111: rslt_msg += " 데이터 형식 오류 (Agent 내부)"; break;
            case 72112: rslt_msg += " 첨부파일 오류 (Agent 내부)"; break;
            case 72113: rslt_msg += " 파일 업로드 실패"; break;
            case 72114: rslt_msg += " Convert 타입 아웃"; break;
            case 72115: rslt_msg += " 첨부파일 용량 오류 "; break;
            case 72116: rslt_msg += " 웹파일 다운로드 오류"; break;
            case 72117: rslt_msg += " 메시지가 Overflow 되어 받지 못함"; break;
            case 72118: rslt_msg += " Sub Type 오류 (전송 실패)"; break;
            case 72119: rslt_msg += " 잘못된 Data Type인 경우"; break;
            case 72120: rslt_msg += " 메시지 포맷 오류"; break;
            case 72121: rslt_msg += " 컨텐츠 크기가 커서 처리할 수 없음"; break;
            case 72122: rslt_msg += " 계약관계가 없거나 해당 챗봇이 존재하지 않음"; break;
            case 72123: rslt_msg += " 올바른 메시지 서비스 타입이 아님"; break;
            case 72124: rslt_msg += " 해당 메시지 서비스 타입에 권한이 없어 전송 불가"; break;
            case 72125: rslt_msg += " 올바른 메시지 Expiry Option이 아님"; break;
            case 72126: rslt_msg += " 올바른 메시지 Header가 아님"; break;
            case 72127: rslt_msg += " 올바른 메시지 Footer가 아님"; break;
            case 72128: rslt_msg += " SMS 발송 수량 초과"; break;
            case 72129: rslt_msg += " LMS 발송 수량 초과"; break;
            case 72130: rslt_msg += " MMS 발송 수량 초과"; break;
            case 72131: rslt_msg += " TMPLT 발송 수량 초과"; break;
            case 72132: rslt_msg += " CHAT 발송 수량 초과"; break;
            case 72133: rslt_msg += " 칩리스트를 사용할 수 없습니다."; break;
            case 72134: rslt_msg += " 양방향 챗봇에 대한 권한이 없습니다."; break;
            case 72135: rslt_msg += " 양방향 기업 데이터가 존재하지 않습니다."; break;
            case 72136: rslt_msg += " 양방향 서비스에 대한 권한이 없습니다."; break;
            case 72137: rslt_msg += " Reply ID가 존재하지 않습니다."; break;
            case 72138: rslt_msg += " Reply ID 유효시간이 만료되었습니다."; break;
            case 73001: rslt_msg += " 가입되지 않은 상품 발송"; break;
            case 73002: rslt_msg += " Legacyinfo가 있지만 청약 정보내 크로샷 ID가 없는 경우"; break;
            case 74001: rslt_msg += " 메시지 내용 스팸"; break;
            case 74002: rslt_msg += " 발신자 스팸"; break;
            case 74003: rslt_msg += " 착신자 스팸"; break;
            case 74004: rslt_msg += " 회신 번호 스팸"; break;
            case 74005: rslt_msg += " 동일 메시지 제한"; break;
            case 74006: rslt_msg += " 동일 착신번호 제한"; break;
            case 74007: rslt_msg += " 번호도용/변작방지 차단"; break;
            case 74008: rslt_msg += " 미등록 회신번호 차단"; break;
            case 74009: rslt_msg += " 번호세칙 위반 차단"; break;
            case 75001: rslt_msg += " 번호 이동된 가입자 (전송 실패)"; break;
            case 75002: rslt_msg += " 가입자 없음"; break;
            case 75003: rslt_msg += " NPDB 오류"; break;
            case 75004: rslt_msg += " End-User(사용자) 존재하지 않음, 해지, 정지"; break;
            case 75005: rslt_msg += " 착신번호 에러 (자리수에러, 없는 번호)"; break;
            case 75006: rslt_msg += " 발신번호 오류"; break;
            case 75007: rslt_msg += " 자사 고객이지만, RCS메시지를 수신할 수 있는 가입자가 아닙니다."; break;
            case 75008: rslt_msg += " 잘못된 규격의 착신번호"; break;
            case 76001: rslt_msg += " CAPRI 연동 실패"; break;
            case 76002: rslt_msg += " Schedule Manager 내부 에러"; break;
            case 76003: rslt_msg += " RCS 가입 정보 없음"; break;
            case 76004: rslt_msg += " Xroshot Sender 내부 에러"; break;
            case 76005: rslt_msg += " Xroshot Manager 내부 에러"; break;
            case 77001: rslt_msg += " Legacy : 레포트 수신 시간 만료 (메시지 전송 후, 24시간 레포트 못받는 경우) RCS  3일"; break;
            case 77002: rslt_msg += " Message Sequence Number가 틀린 경우"; break;
            case 77003: rslt_msg += " Webhook 발송 메시지가 존재하지 않습니다"; break;
            case 77004: rslt_msg += " 잘못된 Webhook 발송 메시지입니다."; break;
            case 77005: rslt_msg += " Webhook 회사 정보가 존재하지 않습니다."; break;
            case 77006: rslt_msg += " Webhook 메시지 전송 이력 정보 작성을 실패 했습니다."; break;
            case 77007: rslt_msg += " 해당 RCS ID의 webhook 발송 설정이 꺼져있습니다."; break;
            case 77008: rslt_msg += " Webhook 상태 코드 실패 수신"; break;
            case 77009: rslt_msg += " Webhook 메시지가 유효하지 않습니다."; break;
            case 77010: rslt_msg += " Webhook EventType이 유효하지 않습니다."; break;
            case 77011: rslt_msg += " Webhook Message Status type이 유효하지 않습니다."; break;
            case 77012: rslt_msg += " 대행사 정보가 존재하지 않습니다."; break;
            case 77013: rslt_msg += " MO 메시지가 존재하지 않습니다"; break;
            case 78001: rslt_msg += " 미지원 단말"; break;
            case 78002: rslt_msg += " 통화중"; break;
            case 78003: rslt_msg += " 무응답 (단말기 무응답)"; break;
            case 78004: rslt_msg += " 단말기 전원 꺼짐"; break;
            case 78005: rslt_msg += " 음영 지역"; break;
            case 78006: rslt_msg += " 단말 메시지 Full"; break;
            case 78007: rslt_msg += " SMS 착신전환 회수 초과"; break;
            case 78008: rslt_msg += " 한글/영문외의 가입자 일 경우"; break;
            case 78009: rslt_msg += " CallbackURL 사용자 아님"; break;
            case 78010: rslt_msg += " 비가용폰 오류"; break;
            case 79001: rslt_msg += " 재시도 횟수를 초과하였습니다."; break;
            case 79002: rslt_msg += " 최대 동시 접속 수 초과"; break;
            case 79003: rslt_msg += " RCS ID 불일치 오류"; break;
            case 79004: rslt_msg += " 잘못된 메시지 결과 요청"; break;
            case 79005: rslt_msg += " 메시지 조회 횟수 한도 초과"; break;
            case 79006: rslt_msg += " 요청 수행 실패"; break;
            case 79007: rslt_msg += " 요청 ID 중복 오류"; break;
            case 79008: rslt_msg += " 유효하지 않는 서버로의 요청"; break;
            case 79009: rslt_msg += " Reserved"; break;
            case 79010: rslt_msg += " 결과 메시지 조회 정책 미 유효"; break;
            case 79011: rslt_msg += " 요청 ID 미 존재 오류"; break;
            case 79994: rslt_msg += " KT 통신사 장애로 실패"; break;
            case 79995: rslt_msg += " SKT 통신사 장애로 실패"; break;
            case 79996: rslt_msg += " LGU 통신사 장애로 실패"; break;
            case 79997: rslt_msg += " 전송 실패 (expiryOption TimeOut 등)"; break;
            case 79998: rslt_msg += " 전송 성공 불확실함 (expiryOption TimeOut 등)"; break;
            case 79999: rslt_msg += " Unknown Error"; break;
            case 77701: rslt_msg += " 전달된 Webhook 메시지에 대한 메시지가 존재하지 않습니다."; break;
            case 77702: rslt_msg += " 잘못된 Webhook 발송 메시지입니다."; break;
            case 77703: rslt_msg += " Webhook 발송 중계사 정보가 존재하지 않습니다."; break;
            case 77704: rslt_msg += " 잘못된 Webhook 발송 중계사 입니다."; break;
            case 77705: rslt_msg += " Webhook 메시지 전송 과금 이력 작성을 실패했습니다."; break;
            case 77706: rslt_msg += " Webhook 메시지 전송 이력 정보 작성을 실패 했습니다."; break;
            case 77707: rslt_msg += " 전달된 Webhook 메시지에 대한 상태 변경 작업을 실패했습니다."; break;
            case 77708: rslt_msg += " 잘못된 Webhook 중계사 요청 파라미터 입니다."; break;
            case 77709: rslt_msg += " 발송 중계 시스템 연결 오류"; break;
            case 77710: rslt_msg += " 발송 Webhook 전송 요청을 실패 했습니다."; break;
            case 77711: rslt_msg += " 발송 Webhook 처리 응답 수신 오류가 발생 했습니다."; break;
            case 77712: rslt_msg += " 잘못된 Webhook Url 입니다."; break;
            case 77713: rslt_msg += " 만료된 메시지 입니다."; break;
            case 77714: rslt_msg += " 재시도 횟수 초과로 인해 메시지 전송을 실패했습니다."; break;
            case 77715: rslt_msg += " MaaP Core로의 메시지 전송을 실패했습니다."; break;
            case 77716: rslt_msg += " 브랜드 포탈 연동 수행을 실패했습니다."; break;
            case 77717: rslt_msg += " 접근 허용된 IP가 아닙니다."; break;
            case 77718: rslt_msg += " 기업/대행사 웹훅 수신 오류"; break;
            case 77719: rslt_msg += " 결과 메시지 RCS 매핑 미 존재 오류"; break;
            case 77720: rslt_msg += " 결과 조회 메시지 미 존재 오류"; break;
            case 77721: rslt_msg += " 결과 조회 메시지 등록 실패"; break;
            case 77800: rslt_msg += " 과금 생성 대상 메시지가 존재하지 않습니다"; break;
            case 77801: rslt_msg += " 알림 요청 Parameter 오류 입니다"; break;
            case 77802: rslt_msg += " 브랜드포탈 인증 토큰 오류가 발생했습니다."; break;
            case 77803: rslt_msg += " 브랜드 포탈 Host 연결 실패 오류가 발생 했습니다."; break;
            case 77804: rslt_msg += " 브랜드 포탈 인증 토큰 요청 중 오류가 발생 했습니다."; break;
            case 77805: rslt_msg += " 브랜드 포탈 인증 토큰 응답 수신 중 오류가 발생 했습니다."; break;
            case 77806: rslt_msg += " 브랜드 포탈 API 연동 요청 포맷 오류가 발생했습니다."; break;
            case 77807: rslt_msg += " 브랜드 포탈 API 연동 인증 토큰 오류가 발생했습니다."; break;
            case 77808: rslt_msg += " 브랜드 포탈 API 연동 요청 오류가 발생했습니다."; break;
            case 77809: rslt_msg += " 브랜드 포탈 API 연동 응답 오류가 발생했습니다."; break;
            case 77810: rslt_msg += " 브랜드 포탈 API 연동 수행 오류가 발생했습니다."; break;
            case 77811: rslt_msg += " 브랜드 포탈 API 응답 결과 값이 없습니다."; break;
            case 77812: rslt_msg += " Notification 내부 작업 수행중 오류가 발생하였습니다."; break;
            case 77813: rslt_msg += " Notification Hist 등록 작업중 오류가 발생하였습니다."; break;
            case 77814: rslt_msg += " 잘못된 Notification Method 입니다."; break;
            case 77815: rslt_msg += " 잘못된 Notification Type 입니다."; break;
            case 71816: rslt_msg += " 홀세일 시뮬레이터 연동 오류"; break;
            case 71817: rslt_msg += " 동시 접속 세션 수 초과 (100개)"; break;
            case 71818: rslt_msg += " 유효하지 않은 요청"; break;
            case 71819: rslt_msg += " Server - busy(내부자원 부족)"; break;
            case 71820: rslt_msg += " Health check 무응답"; break;
            case 71821: rslt_msg += " STR 수신"; break;
            case 72822: rslt_msg += " 동일 ID 사용중"; break;
            case 71823: rslt_msg += " 세션 유실 (기타)"; break;
            case 71824: rslt_msg += " DB연동오류"; break;
            default: rslt_msg += " 지정되지 않은 오류";
        }
        return rslt_msg;
    } else {
        return "";
    }
}

function getATResult(RSLT) {
    if (RSLT) {
        let result = parseInt(RSLT); 
        let rslt_msg = `(${result})`;
        switch (result) {
            case 0: rslt_msg += " 성공"; break;
            case 1001: rslt_msg += "Request Body가 Json형식이 아님"; break;
            case 1002: rslt_msg += "허브 파트너 키가 유효하지 않음"; break;
            case 1003: rslt_msg += "발신 프로필 키가 유효하지 않음"; break;
            case 1004: rslt_msg += "Request Body(Json)에서 name을 찾을 수 없음"; break;
            case 1006: rslt_msg += "삭제된 발신프로필. (메시지 사업 담당자에게 문의)"; break;
            case 1007: rslt_msg += "차단 상태의 발신프로필. (메시지 사업 담당자에게 문의)"; break;
            case 1011: rslt_msg += "계약정보를 찾을 수 없음. (메시지 사업 담당자에게 문의)"; break;
            case 1012: rslt_msg += "잘못된 형식의 유저키 요청"; break;
            case 1013: rslt_msg += "유효하지 않은 app연결"; break;
            case 1014: rslt_msg += "유효하지 않은 사업자번호"; break;
            case 1015: rslt_msg += "유효하지 않은 app user id 요청"; break;
            case 1016: rslt_msg += "사업자등록번호 불일치"; break;
            case 1012: rslt_msg += "잘못된 형식의 유저키 요청"; break;
            case 1020: rslt_msg += "전화번호 or app user id가 유효하지 않거나 미입력 요청"; break;
            case 1021: rslt_msg += "차단 상태의 카카오톡 채널 (카카오톡 채널 운영툴에서 확인)"; break;
            case 1022: rslt_msg += "닫힘 상태의 카카오톡 채널 (카카오톡 채널 운영툴에서 확인)"; break;
            case 1023: rslt_msg += "삭제된 카카오톡 채널 (카카오톡 채널 운영툴에서 확인)"; break;
            case 1024: rslt_msg += "삭제대기 상태의 카카오톡 채널 (카카오톡 채널 운영툴에서 확인)"; break;
            case 1025: rslt_msg += "메시지차단 상태의 카카오톡 채널 (카카오톡 채널 운영툴에서 확인)"; break;
            case 1026: rslt_msg += "해당 message_type에서 사용할 수 없는 response_method로 요청 (이미지알림톡(AI)는 realtime으로 발송 불가)"; break;
            case 1030: rslt_msg += "잘못된 파라메터 요청"; break;
            case 2003: rslt_msg += "(테스트 발송) 카카오톡 채널을 추가하지 않았음"; break;
            case 2004: rslt_msg += "템플릿 일치 확인시 오류 발생(내부 오류 발생)"; break;
            case 2006: rslt_msg += "<4.2 메시지 전송 요청>에 명시된 시리얼넘버 형식 불일치"; break;
            case 3000: rslt_msg += "예기치 않은 오류 발생"; break;
            case 3005: rslt_msg += "메시지를 발송했으나 수신확인 안됨 (성공불확실) - 서버에는 암호화 되어 보관되며 3일 이내 수신 가능"; break;
            case 3006: rslt_msg += "내부 시스템 오류로 메시지 전송 실패"; break;
            case 3008: rslt_msg += "전화번호 오류 "; break;
            case 3010: rslt_msg += "Json 파싱 오류"; break;
            case 3011: rslt_msg += "메시지가 존재하지 않음"; break;
            case 3012: rslt_msg += "메시지 일련번호가 중복됨 - 메시지 일련번호는 CS처리를 위해 고유한 값이 부여되어야 함."; break;
            case 3013: rslt_msg += "메시지가 비어 있음"; break;
            case 3014: rslt_msg += "메시지 길이 제한 오류 (템플릿별 제한 길이 또는 1000자 초과)"; break;
            case 3015: rslt_msg += "템플릿을 찾을 수 없음"; break;
            case 3016: rslt_msg += "메시지 내용이 템플릿과 일치하지 않음"; break;
            case 3018: rslt_msg += "메시지를 전송할 수 없음"; break;
            case 3025: rslt_msg += "변수 글자수 제한 초과"; break;
            case 3026: rslt_msg += "상담/봇 전환 버튼 extra, event 글자수 제한 초과"; break;
            case 3027: rslt_msg += "메시지 버튼/바로연결이 템플릿과 일치하지 않음"; break;
            case 3028: rslt_msg += "메시지 강조 표기 타이틀이 템플릿과 일치하지 않음"; break;
            case 3029: rslt_msg += "메시지 강조 표기 타이틀 길이 제한 초과 (50자)"; break;
            case 3030: rslt_msg += "메시지 타입과 템플릿 강조유형이 일치하지 않음"; break;
            case 3031: rslt_msg += "헤더가 템플릿과 일치하지 않음"; break;
            case 3032: rslt_msg += "헤더 길이 제한 초과(16자)"; break;
            case 3033: rslt_msg += "아이템 하이라이트가 템플릿과 일치하지 않음"; break;
            case 3034: rslt_msg += "아이템 하이라이트 타이틀 길이 제한 초과(이미지 없는 경우 30자, 이미지 있는 경우 21자)"; break;
            case 3035: rslt_msg += "아이템 하이라이트 디스크립션 길이 제한 초과(이미 지 없는 경우 19자, 이미지 있는 경우 13자)"; break;
            case 3036: rslt_msg += "아이템 리스트가 템플릿과 일치하지 않음 "; break;
            case 3037: rslt_msg += "아이템 리스트의 아이템의 디스크립션 길이 제한 초과(23자)"; break;
            case 3038: rslt_msg += "아이템 요약정보가 템플릿과 일치하지 않음"; break;
            case 3039: rslt_msg += "아이템 요약정보의 디스크립션 길이 제한 초과(14자)"; break;
            case 3040: rslt_msg += "아이템 요약정보의 디스크립션에 허용되지 않은 문자 포함(통화기호/코드, 숫자, 콤마, 소수점, 공백을 제외한 문자 포함)"; break;
            case 4000: rslt_msg += "메시지 전송 결과를 찾을 수 없음 "; break;
            case 4001: rslt_msg += "알 수 없는 메시지 상태"; break;
            case 5000: rslt_msg += "(테스트 발송) 관리자 혹은 일회성 인증을 받은 사용자가 아님"; break;
            case 5001: rslt_msg += "(테스트 발송) 일일 발송량 초과"; break;
            case 9998: rslt_msg += " 현재 서비스를 제공하고 있지 않습니다. 시스템에 문제가 발생하여 담당자가 확인하고 있는 경우"; break;
            case 9999: rslt_msg += " 시스템에서 알 수 없는 문제가 발생하였습니다.담당자가 확인 중입니다. 시스템에 문제가 발생하여 담당자가 확인하고 있는 경우"; break;
            default: rslt_msg += " 지정되지 않은 오류";
        }
        return rslt_msg;
    } else {
        return "";
    }
}

const getSMSResultMTS = (RSLT) => {
    if (RSLT) {
        let result = parseInt(RSLT); 
        let rslt_msg = `(${result})`;
        switch (result) {
            case 0: rslt_msg += " 성공"; break;
            case 10	: rslt_msg += " 한도초과 발신 제한"; break;
            case 11	: rslt_msg += " 수신번호 정합성 오류"; break;
            case 14	: rslt_msg += " 단말기메시지FULL"; break;
            case 18	: rslt_msg += " 인증실패,직후연결을끊음"; break;
            case 55	: rslt_msg += " 레포트 수신시간 만료"; break;
            case 3	: rslt_msg += " 스팸"; break;
            case 31	: rslt_msg += " Timeout, 음영지역, 파워오프"; break;
            case 33	: rslt_msg += " 기타오류(이통사 문의 필요)"; break;
            case 34	: rslt_msg += " 결번"; break;
            case 35	: rslt_msg += " 단말기 파워오프"; break;
            case 36	: rslt_msg += " 음영지역"; break;
            case 37	: rslt_msg += " 기타오류(이통사 문의 필요)"; break;
            case 40	: rslt_msg += " 발신번호 세칙오류"; break;
            case 41	: rslt_msg += " 발신번호 변작으로 등록된 발신번호 사용"; break;
            case 50	: rslt_msg += " 사전 미등록 발신번호사용"; break;
            default: rslt_msg += " 지정되지 않은 오류";
        }
        return rslt_msg;
    } else {
        return "";
    }
}

const getLMSResultMTS = (RSLT) => {
    if (RSLT) {
        let result = parseInt(RSLT); 
        let rslt_msg = `(${result})`;
        switch (result) {            
            case 3: rslt_msg += " 스팸"; break;
            case 10: rslt_msg += " 한도초과 발신제한"; break;
            case 11: rslt_msg += " 수신번호 정합성 오류"; break;
            case 26: rslt_msg += " 평생번호 전송실패"; break;
            case 40: rslt_msg += " 발신번호세칙 오류"; break;
            case 50: rslt_msg += " 사전 미등록 발신번호사용"; break;
            case 101: rslt_msg += " 메시지내용스팸"; break;
            case 103: rslt_msg += " 착신자스팸"; break;
            case 104: rslt_msg += " 회신번호스팸"; break;
            case 112: rslt_msg += " 레포트수신시간만료"; break;
            case 114: rslt_msg += " 문자피싱미등록으로 인한 차단"; break;
            case 116: rslt_msg += " 발신번호세칙 오류"; break;
            case 117: rslt_msg += " 수신번호 세칙 오류"; break;
            case 202: rslt_msg += " 착신가입자 없음"; break;
            case 203: rslt_msg += " 비가입자, 결번, 서비스정지"; break;
            case 211: rslt_msg += " 기간만료"; break;
            case 213: rslt_msg += " NPDB 오류"; break;
            case 229: rslt_msg += " 번호도용문자서비스  가입 발신번호  사용"; break;
            case 1000: rslt_msg += " 성공"; break;
            case 1013: rslt_msg += " 결번"; break;
            case 1026: rslt_msg += " 음영지역"; break;
            case 2003: rslt_msg += " 메시지에 있는 주소를 MMS Relay/Server가 찾을수 없음. 이 코드는 메시지가 전송될 주소를 찾을 수 없을 때 리턴 됨"; break;
            case 2007: rslt_msg += " 메시지가 규격에 맞지 않거나 부적당함 / 메시지 ELEMENT 포맷 에러(파싱오류)/번호 이동된 가입자. 전송 실패"; break;
            case 2101: rslt_msg += " 올바른 컨텐츠가 아님"; break;
            case 2103: rslt_msg += " 미지원 단말"; break;
            case 2107: rslt_msg += " 착신번호 오류"; break;
            case 4000: rslt_msg += " 요구된 서비스가 실행될 수 없음"; break;
            case 4005: rslt_msg += " 일반적인 서비스 에러 / MMS G/W 내부 처리 중 처리 실패"; break;
            case 4007: rslt_msg += " 서비스를 요청한 클라이언트가 permission이 없는 경우 / 미지원 단말 / 전송 실패 / 패스워드 인증 실패로 전송제한 - LGT"; break;
            case 4008: rslt_msg += " 이통사 일시적인 트래픽초과로 인한 실패"; break;
            case 4301: rslt_msg += " 미 가입자 에러 오류"; break;
            case 4305: rslt_msg += " 비 가용폰 오류"; break;
            case 4307: rslt_msg += " 일시정지 가입자 오류"; break;
            case 5101: rslt_msg += " 착신전환 조회실패"; break;
            case 5105: rslt_msg += " 착신전환 횟수 초과 오류코드"; break;
            case 6014: rslt_msg += " 수신자가 착신거절 신청자임"; break;
            case 6072: rslt_msg += " MMS 비가용 단말"; break;
            case 8011: rslt_msg += " SKT 단말기 응답없음"; break;
            case 8012: rslt_msg += " SKT 이통사오류(이통사 문의필요)"; break;
            case 8200: rslt_msg += " MMSC 전송 시 알 수 없는 오류"; break;
            case 9999: rslt_msg += " 패킷오류"; break;
            default: rslt_msg += " 지정되지 않은 오류";
        }
        return rslt_msg;
    } else {
        return "";
    }
}

const getATResultMTS = (RSLT) => {
    if (RSLT) {
        let result = parseInt(RSLT); 
        let rslt_msg = `(${result})`;
        switch (result) {
            case 1000: rslt_msg += " 성공(과금)"; break;
            case 1001: rslt_msg += " Request Body가 Json형식이 아님"; break;
            case 1002: rslt_msg += " 허브 파트너 키가 유효하지 않음"; break;
            case 1003: rslt_msg += " 발신 프로필 키가 유효하지 않음"; break;
            case 1004: rslt_msg += " Request Body(Json)에서 name을 찾을 수 없음"; break;
            case 1006: rslt_msg += " 삭제된 발신프로필. (메시지 사업 담당자에게 문의)"; break;
            case 1007: rslt_msg += " 차단 상태의 발신프로필. (메시지 사업 담당자에 게 문의)"; break;
            case 1011: rslt_msg += " 계약정보를 찾을 수 없음. (메시지 사업 담당자에 게 문의)"; break;
            case 1012: rslt_msg += " 잘못된 형식의 유저키 요청"; break;
            case 1013: rslt_msg += " 유효하지 않은 app연결"; break;
            case 1014: rslt_msg += " 유효하지 않은 사업자번호"; break;
            case 1015: rslt_msg += " 유효하지 않은 app user id 요청"; break;
            case 1016: rslt_msg += " 사업자등록번호 불일치"; break;
            case 1020: rslt_msg += " 올바른 유저 식별자 값이 하나도 없는 경우"; break;
            case 1021: rslt_msg += " 차단 상태의 카카오톡 채널 (카카오톡 채널 운영 툴에서 확인)"; break;
            case 1022: rslt_msg += " 닫힘 상태의 카카오톡 채널 (카카오톡 채널 운영 툴에서 확인)"; break;
            case 1023: rslt_msg += " 삭제된 카카오톡 채널 (카카오톡 채널 운영툴에서 확인)"; break;
            case 1024: rslt_msg += " 삭제대기 상태의 카카오톡 채널 (카카오톡 채널 운영 툴에서 확인)"; break;
            case 1025: rslt_msg += " 메시지차단 상태의 카카오톡 채널 (카카오톡 채널 운영 툴에서 확인)"; break;
            case 1026: rslt_msg += " 해당 message_type에서 사용할 수 없는 response_method로 요청 (이미지알림톡(AI)는 realtime으로 발송 불가)"; break;
            case 1027: rslt_msg += " 채널 메시지 제재 상태로 인한 메시지 전송 실패 (카카오톡 채널 운영툴에서 확인)"; break;
            case 1030: rslt_msg += " 잘못된 파라메터 요청"; break;
            case 2003: rslt_msg += " 메시지 전송 실패(테스트 서버에서 카카오톡 채널을 추가하지 않은 경우)"; break;
            case 2004: rslt_msg += " 템플릿 일치 확인시 오류 발생(내부 오류 발생)"; break;
            case 2006: rslt_msg += " <4.2 메시지 전송 요청>에 명시된 시리얼넘버 형식 불일치"; break;
            case 3000: rslt_msg += " 예기치 않은 오류 발생"; break;
            case 3005: rslt_msg += " 메시지를 발송했으나 수신확인 안됨 (성공불확실)- 서버에는 암호화 되어 보관되며 3일 이내 수신 가능"; break;
            case 3006: rslt_msg += " 내부 시스템 오류로 메시지 전송 실패"; break;
            case 3008: rslt_msg += " 전화번호 오류"; break;
            case 3010: rslt_msg += " Json 파싱 오류"; break;
            case 3011: rslt_msg += " 메시지가 존재하지 않음"; break;
            case 3012: rslt_msg += " 메시지 일련번호가 중복됨- 메시지 일련번호는 CS처리를 위해 고유한 값이 부여되어야 함."; break;
            case 3013: rslt_msg += " 메시지가 비어 있음"; break;
            case 3014: rslt_msg += " 메시지 길이 제한 오류(템플릿별 제한 길이 또는 1000자 초과)"; break;
            case 3015: rslt_msg += " 템플릿을 찾을 수 없음"; break;
            case 3016: rslt_msg += " 메시지 내용이 템플릿과 일치하지 않음"; break;
            case 3018: rslt_msg += " 메시지를 전송할 수 없음. 다음 중 하나의 이유 (올바른 번호가 아님, 카카오톡이 삭제되었음, 통신 음영지역)"; break;
            case 3019: rslt_msg += " 카카오톡 사용자가 아닙니다."; break;
            case 3020: rslt_msg += " 알림톡 채널이 수신 차단되어 있습니다."; break;
            case 3021: rslt_msg += " 카카오톡 버전이 너무 오래되어 수신할 수 없음"; break;
            case 3022: rslt_msg += " 메시지 발송 가능한 시간이 아님(친구톡 / 마케팅 메시지는 08시부터 20시 50분까지 발송 가능)"; break;
            case 3024: rslt_msg += " 메시지에 포함된 이미지를 전송할 수 없음(이미지주소 또는 링크가 올바르지 않거나 이미지가 규격에 맞지 않음)"; break;
            case 3025: rslt_msg += " 변수 글자수 제한 초과"; break;
            case 3026: rslt_msg += " 상담/봇 전환 버튼 extra, event 글자수 제한 초과"; break;
            case 3027: rslt_msg += " 메시지 버튼이 템플릿과 일치하지 않음"; break;
            case 3028: rslt_msg += " 메시지 강조 표기 타이틀이 템플릿과 일치하지 않음"; break;
            case 3029: rslt_msg += " 메시지 강조 표기 타이틀 길이 제한 초과 (50자)"; break;
            case 3030: rslt_msg += " 메시지 타입과 템플릿 강조유형이 일치하지 않음"; break;
            case 3031: rslt_msg += " 헤더가 템플릿과 일치하지 않음"; break;
            case 3032: rslt_msg += " 헤더 길이 제한 초과(16자)"; break;
            case 3033: rslt_msg += " 아이템 하이라이트가 템플릿과 일치하지 않음"; break;
            case 3034: rslt_msg += " 아이템 하이라이트 타이틀 길이 제한 초과(이미지 없는 경우 30자, 이미지 있는 경우 21자)"; break;
            case 3035: rslt_msg += " 아이템 하이라이트 디스크립션 길이 제한 초과(이미지 없는 경우 19자, 이미지 있는 경우 13자)"; break;
            case 3036: rslt_msg += " 아이템 리스트가 템플릿과 일치하지 않음"; break;
            case 3037: rslt_msg += " 아이템 리스트의 아이템의 디스크립션 길이 제한 초과(23자)"; break;
            case 3038: rslt_msg += " 아이템 요약정보가 템플릿과 일치하지 않음"; break;
            case 3039: rslt_msg += " 아이템 요약정보의 디스크립션 길이 제한 초과(14자)"; break;
            case 3040: rslt_msg += " 아이템 요약정보의 디스크립션에 허용되지 않은 문자 포함(통화기호/코드, 숫자, 콤마, 소수점, 공백을 제외한 문자 포함)"; break;
            case 3042: rslt_msg += " 대표링크가 템플릿과 일치하지 않음"; break;
            case 4000: rslt_msg += " 메시지 전송 결과를 찾을 수 없음"; break;
            case 4001: rslt_msg += " 알 수 없는 메시지 상태"; break;
            case 5000: rslt_msg += " (테스트 발송) 관리자 혹은 일회성 인증을 받은 사용자가 아님"; break;
            case 5001: rslt_msg += " (테스트 발송) 일일 발송량 초과"; break;
            case 6001: rslt_msg += " 첨부할 이미지가 존재하지 않음 "; break;
            case 8001: rslt_msg += " 카카오 서버로 전송 중 오류 발생"; break;
            case 8002: rslt_msg += " 전송하고 응답이 없음(NO RESPONSE)"; break;
            case 8003: rslt_msg += " 메시지 키 생성 오류"; break;
            case 8004: rslt_msg += " 메시지 DB 입력 오류"; break;
            case 8005: rslt_msg += " 메시지 DB 메모리 큐 입력 오류"; break;
            case 8006: rslt_msg += " 메시지 타입 생성 오류"; break;
            case 8007: rslt_msg += " 이미지 파일 사이즈 규격 오류 (Over)"; break;
            case 8008: rslt_msg += " 이미지 파일 파일 생성 오류"; break;
            case 8009: rslt_msg += " 이미지 파일 정보 DB 입력 오류"; break;
            case 8010: rslt_msg += " 이미지 파일 전송 오류"; break;
            case 9001: rslt_msg += " 네트워크 오류로 인하여 전송 실패"; break;
            case 9998: rslt_msg += " 시스템에 문제가 발생하여 담당자가 확인하고 있는 경우"; break;
            case 9999: rslt_msg += " 시스템에 문제가 발생하여 담당자가 확인하고 있는 경우"; break;
            case 200: rslt_msg += " 요청 성공"; break;
            case 400: rslt_msg += " Invalid Json ( 파싱에러 )"; break;
            case 403: rslt_msg += " 권한 없음"; break;
            case 405: rslt_msg += " 파라미터 오류"; break;
            case 600: rslt_msg += " 이미지 업로드 실패"; break;
            case 801: rslt_msg += " 발신프로필키 차단 상태"; break;
            case 802: rslt_msg += " 발신프로필키 차단 상태"; break;
            case 803: rslt_msg += " 발신프로필키 차단 상태"; break;
            case 804: rslt_msg += " 발신프로필키 차단 상태"; break;
            case 805: rslt_msg += " 발신프로필키 차단 상태"; break;
            default: rslt_msg += " 지정되지 않은 오류";
        }
        return rslt_msg;
    } else {
        return "";
    }
}

const checkAllowTime = (sendType, reserveTime) => {
    // 현재 시간 얻기
    const nowHour = sendType == 'I' ? moment().hour() : moment(reserveTime).hour();

    // console.log(nowHour, sendAllowTime.start, sendAllowTime.end)
    // 즉시 발송일 때, 현재 시간이 발송 허용 시간 안에 있으면 true, 아니면 false
    // 예약 발송일 때, 예약 시간이 허용 시간 안에 있으면 true, 아니면 false
    return (nowHour >= sendAllowTime.start && nowHour < sendAllowTime.end)
}