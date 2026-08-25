module.exports = class ordersService {
    static getPaymentMethd(O_PAY_METHOD) {
        switch (O_PAY_METHOD) {
            case "SKP": return "간편결제 (슈켓 PAY)";
            case "BANK": return "계좌 이체";
            case "CARD": return "카드결제";
            case "KKP": return "카카오페이";
            case "NP": return "네이버페이";
            case "LP": return "리브페이";
            case "CCOD": return "현장카드결제";
            case "COD": return "현장현금결제";
        }
    }

    static getOrderSatatus(O_STATUS) {
        switch (O_STATUS) {
            // case 60: return "주문확인중";
            case 61: return "주문취소";
            case 70: return "주문접수";
            // case 71: return "결제확인중";
            // case 72: return "주문접수";
            // case 80: return "배송준비중";
            // case 81: return "배송중";
            case 82: return "주문완료";
            // case 83: return "배송취소";
            // case 90: return "픽업준비중";
            // case 91: return "픽업준비완료";
            // case 92: return "픽업완료";
            // case 93: return "픽업취소";
        }
    }
}