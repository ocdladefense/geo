


export function formatTime(duration) {
    const Hr = Math.floor(duration / 3600);
    const Min = Math.floor((duration % 3600) / 60);
    const Sec = Math.floor(duration % 60);

    const paddedMin = Min.toString().padStart(2, '0');
    const paddedSec = Sec.toString().padStart(2, '0');

    if (Hr > 0) {
        return `${Hr}:${paddedMin}:${paddedSec}`;
    } else {
        return `${Min}:${paddedSec}`;
    }
}

/*
export function convertISODurationToSeconds(ISODuration) {
    if (typeof ISODuration === 'number' && !isNaN(ISODuration)) {
        return NaN;
    }
    return moment.duration(ISODuration).asSeconds();
}
*/
