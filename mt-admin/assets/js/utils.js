// 숫자 타입에서 쓸 수 있도록 format() 함수 추가
Number.prototype.format = function(){
    if(this==0) return 0;

    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (this + '');

    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');

    return n;
};

// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
String.prototype.format = function(){
    var num = parseFloat(this);
    if( isNaN(num) ) return "0";

    return num.format();
};

function Proper(value) {
    return value.replace(
        /\w\S*/g,
        function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

async function postData(url = '', data = {}) {
    // Default options are marked with *
    return await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    .then(response => response.json()); // parses JSON response into native JavaScript objects
}

async function getData(url = '') {
    // Default options are marked with *
    return await fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
    })
    .then(response => response.json()); // parses JSON response into native JavaScript objects
}

function getPlaneText(htmlText) {
    const text = htmlText.replace(/(<([^>]+)>)/gi, "");
    return text;
}

// 공백을 제외한 모든 특수문자 제거
function getPlainTextTag(text) {
    let regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    let plainText = text.replace(regExp, "");

    return plainText;
}

function getTextWidth(text, font, scale) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    canvas.style.transform = `scale(${scale})`;
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width * 1.2;
}     

function getValueFromPxString(value) {
    let clearValue = value.replace("px", "");
    return parseFloat(clearValue);
}

function showElement(className, value) {
    document.querySelector(`.${className}`).style.display = value ? 'block' : 'none';
}

function createPagerHTML(totalCount, rowPerPage, currentPage, pageBlockCount, callBack) {
    let totalPage = Math.floor(totalCount / rowPerPage);  //전체 페이지 개수: 전체 개시물 개수/row카운트 +1
    if (totalCount % rowPerPage > 0) totalPage++;
    let startPage = pageBlockCount * Math.floor((currentPage - 1) / pageBlockCount) + 1; //페이저의 시작 페이지
    let currentBlock= Math.floor((currentPage - 1) / pageBlockCount) + 1;     //현재 페이지 블락
    let lastBlock= Math.floor((totalPage - 1) / pageBlockCount) + 1;    //마지막 페이지 블락
    let hasBeforeBlock = (currentBlock <= 1 ? false : true);    //이전 블락 존부
    let hasNextBlock = (currentBlock >= lastBlock ? false : true);  //다음 블락 존부
    
    let callBacks = callBack.split(":");
    let callBacksArg = "";
    if (callBacks.length > 1) {
        for (let i = 1; i < callBacks.length; i++) {
            callBacksArg += `, '${callBacks[i]}' `;
        }
    }
    let pageHtml = '';
    if (hasBeforeBlock)  {
        pageHtml += `<li class="page-item"><a class="page-link" href="#" onclick="${callBacks[0]}(${startPage - 1},${rowPerPage}${(callBacksArg != "") ? callBacksArg : ''})">이전</a></li>`;
    }else {
        pageHtml += `<li class="page-item disabled"><a class="page-link" href="#">이전</a></li>`;
    }
    for (var pg = 0; pg < pageBlockCount; pg++) {
        if (startPage + pg > totalPage) break;
        var bpage = startPage + pg;
        if (currentPage == bpage) {
            pageHtml += `<li class="page-item active"><a class="page-link">${bpage}</a></li>`;
        } else {
            pageHtml += `<li class="page-item"><a class="page-link" href="#" onclick="${callBacks[0]}(${bpage},${rowPerPage}${(callBacksArg != "") ? callBacksArg : ''})">${bpage}</a></li>`;
        }
    }
    if (hasNextBlock) {
        pageHtml += `<li class="page-item"><a class="page-link" href="#" onclick="${callBacks[0]}(${startPage + pageBlockCount},${rowPerPage}${(callBacksArg != "") ? callBacksArg : ''})">다음</a></li>`;
    } else {
        pageHtml += `<li class="page-item disabled"><a class="page-link" href="#">다음</a></li>`;
    }
    return pageHtml;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

// RGB 포맷을 #FFFFFF 형태로 바꾸기 위함
function getRGBColor(value) {
    if (value.indexOf("#") != -1 && value.length == 4) {
        const r = value.slice(1, 2);
        const g = value.slice(2, 3);
        const b = value.slice(3, 4);
        return `#${r}${r}${g}${g}${b}${b}`;
    } if (value.indexOf("#") != -1 && value.length == 7) {
        return value;
    } else {
        const rgb = value.replace( /[^%,.\d]/g, "" ).split( "," ); 

        rgb.forEach(function (str, x, arr){ 
            /* 컬러값이 "%"일 경우, 변환하기. */ 
            if (str.indexOf( "%" ) > -1) str = Math.round(parseFloat(str) * 2.55);           
            /* 16진수 문자로 변환하기. */ 
            str = parseInt(str, 10).toString(16); 
            if (str.length === 1) str = "0" + str;            
            arr[x] = str; 
        });
        return "#" + rgb.join(""); 
    }

}

const imageDimensions = srcURL => 
    new Promise((resolve, reject) => {
        const img = new Image()

        // the following handler will fire after the successful loading of the image
        img.onload = () => {
            const { naturalWidth: width, naturalHeight: height } = img
            resolve({ width, height })
        }

        // and this handler will fire if there was an error with the image (like if it's not really an image or a corrupted one)
        img.onerror = () => {
            reject('There was some problem with the image.')
        }
    
        img.src = srcURL
})

function isImageFile(fileName) {
    try {
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext == "psd") return true;
        return false;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function validateEmail(mail) {
    if (/^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(mail))
        return true;
    return false;
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {

    options = {
      path: '/',
      // 필요한 경우, 옵션 기본값을 설정할 수도 있습니다.
      ...options
    };
  
    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString();
    }
  
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  
    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }
  
    document.cookie = updatedCookie;
  }

  function fn_checkByte(domElement){
    const text_val = domElement.value; //입력한 문자
    const text_len = text_val.length; //입력한 문자수
    
    let totalByte = 0;
    for(let i = 0; i < text_len; i++){
    	const each_char = text_val.charAt(i);
        const uni_char = escape(each_char); //유니코드 형식으로 변환
        if(uni_char.length>4){
        	// 한글 : 2Byte
            totalByte += 2;
        }else{
        	// 영문,숫자,특수문자 : 1Byte
            totalByte += 1;
        }
    }
    return totalByte ;
}

Number.prototype.AddZero= function(b,c){
    var  l= (String(b|| 10).length - String(this).length)+1;
    return l> 0? new Array(l).join(c|| '0')+this : this;
 }