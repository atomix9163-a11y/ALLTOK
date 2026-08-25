const validation = (P_CODE, P_BARCODE, P_PROVIDER, P_NAME, P_CAT_CODE, P_MCAT_CODE, P_CAT_SUB, P_LIST_PRICE, P_SALE_PRICE, P_STATUS, P_STOCK, P_MIN_STOCK, P_TAGS) => {
    // if (P_CODE == "") {
    //     alert("상품 코드는 반드시 입력해야 합니다.");
    //     return false;
    // }
    // if (P_BARCODE == "") {
    //     alert("바코드는 반드시 입력해야 합니다.");
    //     return false;
    // }
    if (P_NAME == "") {
        alert("상품명은 반드시 입력해야 합니다.");
        return false;
    }
    if (P_LIST_PRICE == "") {
        alert("판매 가격은 반드시 입력해야 합니다.");
        return false;
    }
    // if (P_STOCK == "") {
    //     alert("판매 수량은 반드시 입력해야 합니다.");
    //     return false;
    // }
    // if (P_CAT_CODE == "0") {
    //     alert("1차 카테고리는 반드시 선택해야 합니다.");
    //     return false;
    // }
    
    return true;
}

const saveProductFull = async () => {
    // let SEQ = document.getElementById("product-SEQ").value;
    let P_CODE = document.getElementById("P_CODE").value;
    let P_BARCODE = document.getElementById("P_BARCODE").value;
    let P_PROVIDER = document.getElementById("P_PROVIDER").value;
    let P_NAME = document.getElementById("P_NAME").value;
    let P_UNIT = document.getElementById("P_UNIT").value;
    let P_CAT_SEQNO = "";
    let P_CAT_CODE = document.getElementById("P_CAT_CODE").value;
    let P_CAT = document.getElementById("P_CAT_CODE").selectedOptions[0].text;        
    if (P_CAT_CODE != "0") {
        P_CAT_SEQNO = P_CAT.split(",")[0];             
        P_CAT = P_CAT.split("|")[1];
    }
    let P_MCAT_CODE = document.getElementById("P_MCAT_CODE").value;
    let P_MCAT = document.getElementById("P_MCAT_CODE").selectedOptions[0].text;
    if (P_MCAT_CODE != "0") {
        P_CAT_SEQNO = P_MCAT.split("|")[0];             
        P_MCAT = P_MCAT.split("|")[1];
    }
    let P_CAT_SUB = document.getElementById("P_CAT_SUB").selectedOptions[0].text;
    if (P_CAT_SUB != "선택 안함") {
        P_CAT_SEQNO = P_CAT_SUB.split("|")[0]; 
        P_CAT_SUB = P_CAT_SUB.split("|")[1];
    }
    let P_LIST_PRICE = document.getElementById("P_LIST_PRICE").value;
    let P_SALE_PRICE = document.getElementById("P_SALE_PRICE").value;
    let P_STATUS = document.getElementById("P_STATUS").value;
    let P_STOCK = document.getElementById("P_STOCK").value;
    let P_MIN_STOCK = document.getElementById("P_MIN_STOCK").value;
    let P_TAGS = document.getElementById("P_TAGS").value;

    // console.log(P_MCAT_CODE, P_MCAT, P_CAT_SUB, P_CAT_SEQNO)

    if (!validation(P_CODE, P_BARCODE, P_PROVIDER, P_NAME, P_CAT_CODE, P_MCAT_CODE, P_CAT_SUB, P_LIST_PRICE, P_SALE_PRICE, P_STATUS, P_STOCK, P_MIN_STOCK, P_TAGS)) return null;

    // 이미 있는 상품인지 검사
    let callApi = `${apiServer}/products/apiFind`;
    let findInfo = await axios.post(callApi, {
        P_CODE: P_CODE,
        P_BARCODE: P_BARCODE
    }, {
        headers: {
            xtoken: getCookie("xToken")
        }
    })
    .then(response => {
        return response.data.data;        
    })
    .catch(error => {
        console.log(error)
        return null;
    })
    if (findInfo) {
        if (!confirm("동일한 코드 혹은 바코드를 가진 상품이 이미 있습니다. 해당 상품 정보를 변경하시겠습니까?")) return null;
        P_CODE = findInfo.P_CODE;
    }

    callApi = (findInfo) ? `${apiServer}/products/apiUpdate` : `${apiServer}/products/apiCreate`;
    let response = await axios.post(callApi, {
        // SEQ: SEQ,
        P_CODE: P_CODE,
        P_BARCODE: P_BARCODE,
        P_PROVIDER: P_PROVIDER,
        P_NAME: P_NAME,
        P_UNIT: P_UNIT,
        P_CAT_CODE: P_CAT_CODE,
        P_CAT: P_CAT,
        P_MCAT_CODE: P_MCAT_CODE,
        P_MCAT: P_MCAT,
        P_CAT_SUB: P_CAT_SUB,
        P_CAT_SEQNO: P_CAT_SEQNO,
        P_LIST_PRICE: P_LIST_PRICE,
        P_SALE_PRICE: P_SALE_PRICE,
        P_STATUS: P_STATUS,
        P_STOCK: P_STOCK,
        P_MIN_STOCK: P_MIN_STOCK,
        P_TAGS: P_TAGS
    }, {
        headers: {
            xtoken: getCookie("xToken")
        }
    })
    .then(response => {
        
        if (response.data.result && response.data.data) {
            return response.data.data;
        } else {
            alert(`상품 정보를 변경하지 못했습니다`); 
            return null;
        }
    })
    .catch(error => { 
        console.log(error); 
        alert(`상품 정보를 변경하지 못했습니다`); 
        return null;
    });
    // console.log(response)
    if (response) {
        response.P_ISUPDATE = (findInfo) ? 'Y' : 'N';
    } 
    return response;
}

const saveProduct = async () => {
    // let SEQ = document.getElementById("product-SEQ").value;
    let P_CODE = document.getElementById("P_CODE").value;
    let P_BARCODE = document.getElementById("P_BARCODE").value;
    let P_PROVIDER = document.getElementById("P_PROVIDER").value;
    let P_NAME = document.getElementById("P_NAME").value;
    let P_UNIT = document.getElementById("P_UNIT").value;
    let P_CAT_SEQNO = "";
    let P_CAT_CODE = document.getElementById("P_CAT_CODE").value;
    let P_CAT = document.getElementById("P_CAT_CODE").options[document.getElementById("P_CAT_CODE").selectedIndex].text;
    let P_MCAT_CODE = document.getElementById("P_MCAT_CODE").value;
    // let P_MCAT = document.getElementById("P_MCAT_CODE").options[document.getElementById("P_MCAT_CODE").selectedIndex].text;
    let P_MCAT = '';
    let P_CAT_SUB = document.getElementById("P_CAT_SUB").value;
    let P_LIST_PRICE = document.getElementById("P_LIST_PRICE").value;
    let P_SALE_PRICE = document.getElementById("P_SALE_PRICE").value;
    let P_STATUS = document.getElementById("P_STATUS").value;
    let P_STOCK = document.getElementById("P_STOCK").value;
    let P_MIN_STOCK = document.getElementById("P_MIN_STOCK").value;
    let P_TAGS = document.getElementById("P_TAGS").value;

    // console.log(P_MCAT_CODE, P_MCAT, P_CAT_SUB, P_CAT_SEQNO)

    if (!validation(P_CODE, P_BARCODE, P_PROVIDER, P_NAME, P_CAT_CODE, P_MCAT_CODE, P_CAT_SUB, P_LIST_PRICE, P_SALE_PRICE, P_STATUS, P_STOCK, P_MIN_STOCK, P_TAGS)) return null;

    // 이미 있는 상품인지 검사
    // let callApi = `${apiServer}/products/apiFind`;
    // let findInfo = await axios.post(callApi, {
    //     P_CODE: P_CODE,
    //     P_BARCODE: P_BARCODE
    // }, {
    //     headers: {
    //         xtoken: getCookie("xToken")
    //     }
    // })
    // .then(response => {
    //     return response.data.data;        
    // })
    // .catch(error => {
    //     console.log(error)
    //     return null;
    // })
    // if (findInfo) {
    //     if (!confirm("동일한 코드 혹은 바코드를 가진 상품이 이미 있습니다. 해당 상품 정보를 변경하시겠습니까?")) return null;
    //     P_CODE = findInfo.P_CODE;
    // }

    callApi = (P_CODE != "") ? `${apiServer}/products/apiUpdate` : `${apiServer}/products/apiCreate`;
    let response = await axios.post(callApi, {
        // SEQ: SEQ,
        P_CODE: P_CODE,
        P_BARCODE: P_BARCODE,
        P_PROVIDER: P_PROVIDER,
        P_NAME: P_NAME,
        P_UNIT: P_UNIT,
        P_CAT_CODE: P_CAT_CODE,
        P_CAT: P_CAT,
        P_MCAT_CODE: P_MCAT_CODE,
        P_MCAT: P_MCAT,
        P_CAT_SUB: P_CAT_SUB,
        P_CAT_SEQNO: P_CAT_SEQNO,
        P_LIST_PRICE: P_LIST_PRICE,
        P_SALE_PRICE: P_SALE_PRICE,
        P_STATUS: P_STATUS,
        P_STOCK: P_STOCK,
        P_MIN_STOCK: P_MIN_STOCK,
        P_TAGS: P_TAGS
    }, {
        headers: {
            xtoken: getCookie("xToken")
        }
    })
    .then(response => {
        // console.log(response.data.data)
        if (response.data.result && response.data.data) {
            return response.data.data;
        } else {
            alert(`상품 정보를 변경하지 못했습니다`); 
            return null;
        }
    })
    .catch(error => { 
        console.log(error); 
        alert(`상품 정보를 변경하지 못했습니다`); 
        return null;
    });
    // console.log(response)
    if (response) {
        response.P_ISUPDATE = (P_CODE != "") ? 'Y' : 'N';
    } 
    return response;
}

// 상품 엑셀로 업로드
async function uploadProducts(storeCode) {
    let uploadFile = document.getElementById("uploadFile");
    const formData = new FormData();
    formData.append("uploadFile", uploadFile.files[0]);
    formData.append("location", "products");

    let returnRespone = await axios.post(`${apiServer}/upload/uploadSingle`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
    .then(async response =>  {
        if (response.data.result === "success") {
            // 업로드한 파일로 업데이트 실시
            // console.log(response.data);
            let excelDataUpdateResponse = await axios.post(`${apiServer}/products/apiUploadExcel`, {
                store_code: storeCode,
                file: response.data.data.filename,
                path: response.data.data.path
            }, {
                headers: {
                    xtoken: getCookie("xToken")
                }
            }).then(async response => {
                // console.log(response)
                return response.data.data;
            })
            return excelDataUpdateResponse;
        } else {
            alert("파일 업로드를 실패했습니다.");
            return null;
        }
    });
    return returnRespone;
}

function showExcelUploadLog() {
    const modal_excelUpload_log = new bootstrap.Modal(document.getElementById('modal-excelUpload-log'));
    modal_excelUpload_log.show();
}

const imageUrilFromProdcut = (product) => {
    let imageJSON = JSON.parse(product.tmpl_dt_img);
    let imageUrl = (imageJSON[0].items[0].value) ? imageJSON[0].items[0].value : "https://s3.ap-northeast-2.amazonaws.com/moa.images/no-image.jpg";
    if (imageUrl) {
        // const url = imageUrl.split("/");
        // const newFileName = encodeURIComponent(url[url.length - 1]);
        // imageUrl = url.slice(0, url.length - 1).join("/") + "/" + newFileName;
        const url = imageUrl.split("/");
        const fileName = url[url.length - 1];
        const newFileName = (korean.test(fileName)) ? encodeURIComponent(fileName) : fileName;
        imageUrl = url.slice(0, url.length - 1).join("/") + "/" + newFileName;
    }
    return imageUrl;
}

const buildLeaflet = (mainCount, useSection, dataJSON, templateHTML) => {
    let tempHTML = templateHTML;

    // console.log(templateHTML)
    
    // 메인 상품 처리
    if (mainCount > 0) {
        // 메인 최대 상품수 또는 등록 상품 수까지만 반복
        // let mainCountValue = (dataJSON.data.main_product.length > mainCount) ? mainCount : dataJSON.data.main_product.length;
        let count = 1;
        for (let product of dataJSON.data.main_product) {            
            const listPrice = product.tmpl_dt_list_price;
            const salePrice = (product.tmpl_dt_sale_price != 0) ? product.tmpl_dt_sale_price: product.tmpl_dt_list_price;
            const discountPercent = ((listPrice - salePrice) / listPrice) * 100;
            
            tempHTML = tempHTML.replaceAll('${product_name_' + count + '}', product.tmpl_dt_tl);
            tempHTML = tempHTML.replaceAll('${product_unit_' + count + '}', product.tmpl_dt_unit);
            tempHTML = tempHTML.replaceAll('${product_price_' + count + '}', numeral(listPrice).format("0,0"));
            tempHTML = tempHTML.replaceAll('${product_price_discount_' + count + '}', numeral(salePrice).format("0,0"));
            tempHTML = tempHTML.replaceAll('${product_discount_price_' + count + '}', numeral(salePrice).format("0,0"));
            tempHTML = tempHTML.replaceAll('${product_imageUri_' + count + '}', imageUrilFromProdcut(product));
            tempHTML = tempHTML.replaceAll('${product_action_' + count + '}', `addToCart('${product.tmpl_dt_cd}', '${product.tmpl_dt_bcd}', ${(product.tmpl_dt_sale_price != 0) ? product.tmpl_dt_sale_price: product.tmpl_dt_list_price})`);
            tempHTML = tempHTML.replaceAll('${product_discount_percent_' + count + '}', numeral(discountPercent).format("0"));
            
            count++;
        }        
        if (count <= mainCount) {
            for (let i = count; i <= mainCount; i++) {                
                tempHTML = tempHTML.replaceAll('${product_name_' + i + '}', "");
                tempHTML = tempHTML.replaceAll('${product_unit_' + i + '}', "");
                tempHTML = tempHTML.replaceAll('${product_price_' + i + '}', "");
                tempHTML = tempHTML.replaceAll('${product_discount_price_' + count + '}', "");
                tempHTML = tempHTML.replaceAll('${product_imageUri_' + i + '}', "/assets/images/blank.png");
                tempHTML = tempHTML.replaceAll('${product_action_' + i + '}', `javascript:void(0)`);                
                tempHTML = tempHTML.replaceAll('${product_discount_percent_' + count + '}', "");
                count++;
            }
        }
    }        

    // 메인은 한덩어리이므로, 한꺼번에 엘리먼트로 처리
    let tempElement = document.createElement("div");
    tempElement.innerHTML = tempHTML;

    let discountElements = tempElement.querySelectorAll(".m-product-label-content");
    if (discountElements) {
        for (let discountElement of discountElements) {
            let spanElement = discountElement.querySelector("label");
            if (spanElement) {
                if (spanElement.innerText == "SALE0%" || spanElement.innerText == "SALE%") {
                    discountElement.classList.add("d-transparent");
                    spanElement.classList.add("d-transparent");
                }
            }
        }
    }
    tempHTML = tempElement.innerHTML;
    
    if (tempHTML.indexOf("$category{") <= 0) return tempHTML;

    // 서브 섹션 HTML 분리. tempHTML에 섹션 리스트가 들어갈 위치에 $category{ 가 남는다
    let sectionHTML = tempHTML.substring(tempHTML.indexOf("$category{") + 10, tempHTML.indexOf("}$category"));
    tempHTML = tempHTML.replace(sectionHTML, "");

    // 상품 HTML 분리, sectionHTML에 상품이 들어갈 위치에 $sub{가 남는다
    let sectionProductHTML = sectionHTML.substring(sectionHTML.indexOf("$sub{") + 5, sectionHTML.indexOf("}$sub"));
    sectionHTML = sectionHTML.replace(sectionProductHTML, "");
                
    // // 섹션 처리
    let sectionHTML_row = "";
    if (dataJSON) {
        for (let section of dataJSON.data.sub_product) {        
            let tempSectionHTML = sectionHTML;
            // console.log(tempSectionHTML)
            // 섹션을 사용하는 경우 정보를 업데이트
            if (useSection == 'Y') {
                tempSectionHTML = tempSectionHTML.replaceAll('${category_name}', section.title);
                tempSectionHTML = tempSectionHTML.replaceAll('#${category_color}', (section.bgcolor != "") ? section.bgcolor : "transparent");

                // 섹션 이미지 처리
                // 임시 컨테이너 생성해서 섹션 html을 넣는다
                const divContainer = document.createElement("div");
                divContainer.innerHTML = tempSectionHTML;

                // 섹션 이미지 엘리먼트
                let imageElement = divContainer.querySelector("img");
                // 섹션 타이틀 엘리먼트
                let titleElement = divContainer.querySelector("div.banner-cate");
                console.log(section)
                if (section.img != "") {
                    // 섹션 이미지 정보가 있으면 이미지를 남기고 설정, 타이틀을 삭제
                    imageElement.src = section.img;
                    divContainer.removeChild(titleElement);
                } else {
                    // 섹션 이미지 정보가 없으면 이미지를 삭제하고, 타이틀을 남기고 설정
                    let spanElement = titleElement.querySelector("span");
                    if (spanElement) spanElement.style.color = section.color;
                    divContainer.removeChild(imageElement);
                }
                tempSectionHTML = divContainer.innerHTML;
                // console.log(tempSectionHTML)
            }
            let sectionProductHTML_row = "";
            if (section.product.length > 0) {
                for (let product of section.product) {
                    console.log(product)
                    const listPrice = product.tmpl_dt_list_price;
                    const salePrice = (product.tmpl_dt_sale_price != 0) ? product.tmpl_dt_sale_price: product.tmpl_dt_list_price;
                    const discountPercent = ((listPrice - salePrice) / listPrice) * 100;

                    let tempProductHTML = sectionProductHTML;

                    tempProductHTML = tempProductHTML.replaceAll('${product_name}', product.tmpl_dt_tl);
                    tempProductHTML = tempProductHTML.replaceAll('${product_unit}', product.tmpl_dt_unit);                
                    tempProductHTML = tempProductHTML.replaceAll('${product_price}', numeral(listPrice).format("0,0"));
                    tempProductHTML = tempProductHTML.replaceAll('${product_price_discount}', numeral(salePrice).format("0,0"));
                    tempProductHTML = tempProductHTML.replaceAll('${product_discount_price}', numeral(salePrice).format("0,0"));
                    tempProductHTML = tempProductHTML.replaceAll('${product_discount}', numeral(salePrice).format("0,0"));
                    tempProductHTML = tempProductHTML.replaceAll('${product_imageUri}', imageUrilFromProdcut(product));
                    tempProductHTML = tempProductHTML.replaceAll('${product_discount_percent}', numeral(discountPercent).format("0"));
                    tempProductHTML = tempProductHTML.replaceAll('${product_action}', `addToCart('${product.tmpl_dt_cd}', '${product.tmpl_dt_bcd}', ${(product.tmpl_dt_sale_price != 0) ? product.tmpl_dt_sale_price: product.tmpl_dt_list_price})`);

                    let tempElement = document.createElement("div");
                    tempElement.innerHTML = tempProductHTML;
                    if (discountPercent == 0) {
                        let discountEelement = tempElement.querySelector(".s-product-discount");
                        if (discountEelement) discountEelement.classList.add("d-transparent");
                    }
                    sectionProductHTML_row += tempElement.innerHTML;
                }

            }
            tempSectionHTML = tempSectionHTML.replace("$sub{}$sub", sectionProductHTML_row);
            sectionHTML_row += tempSectionHTML;
        }        
    }
    tempHTML = tempHTML.replace("$category{}$category", sectionHTML_row);
    return tempHTML;
}

const convertCloundFront = (imageUrl) => {
    // alltokS3 -> alltokCF
    imageUrl = imageUrl.replace(s3Server, awsCFServer);
    // shuketS3 -> shuketCF
    imageUrl = imageUrl.replace(shuketS3Server, shuketCFServer);

    return imageUrl;
}