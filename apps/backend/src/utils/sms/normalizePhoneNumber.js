
export default function normalizePhoneNumber(phoneNumber) {
    let number = String(phoneNumber).replace(/[\s\-().]/g, "");

    if (number.startsWith("+")) {
        number = number.slice(1);
    } else if (number.startsWith("00")) {
        number = number.slice(2);
    }

    if (number.startsWith("0") && number.length === 10) {
        number = `254${number.slice(1)}`;
    } else if (
        number.length === 9 &&
        (number.startsWith("7") || number.startsWith("1"))
    ) {
        number = `254${number}`;
    }

    return /^\d{10,15}$/.test(number) ? number : null;
}
