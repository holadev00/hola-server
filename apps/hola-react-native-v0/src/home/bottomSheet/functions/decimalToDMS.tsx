
export function decimalToDMS(decimal, isLatitude = true) {
    const direction = isLatitude
        ? (decimal >= 0 ? "N" : "S")
        : (decimal >= 0 ? "E" : "W");

    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutesFloat = (abs - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);

    return `${degrees}°${minutes}'${seconds}" ${direction}`;
}
