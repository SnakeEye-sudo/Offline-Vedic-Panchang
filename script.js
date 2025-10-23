// Offline Vedic Panchang - Pure JavaScript Implementation
// No external APIs - All calculations done locally

// Constants
const TITHIS = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
];

const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
    'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
    'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
    'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati'
];

const RASHIS = [
    'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)',
    'Karka (Cancer)', 'Simha (Leo)', 'Kanya (Virgo)',
    'Tula (Libra)', 'Vrishchika (Scorpio)', 'Dhanu (Sagittarius)',
    'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
];

const YOGAS = [
    'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
    'Atiganda', 'Sukarman', 'Dhriti', 'Shula', 'Ganda',
    'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
    'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
    'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
    'Indra', 'Vaidhriti'
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Calculate Julian Day Number
function getJulianDay(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    
    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;
    
    let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
              Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    
    return jdn + (hour - 12) / 24;
}

// Calculate Sun's position (simplified)
function getSunPosition(jd) {
    const n = jd - 2451545.0;
    const L = (280.460 + 0.9856474 * n) % 360;
    const g = (357.528 + 0.9856003 * n) % 360;
    const lambda = (L + 1.915 * Math.sin(g * Math.PI / 180) + 
                   0.020 * Math.sin(2 * g * Math.PI / 180)) % 360;
    return lambda;
}

// Calculate Moon's position (simplified)
function getMoonPosition(jd) {
    const n = jd - 2451545.0;
    const L = (218.316 + 13.176396 * n) % 360;
    const M = (134.963 + 13.064993 * n) % 360;
    const F = (93.272 + 13.229350 * n) % 360;
    
    const lambda = (L + 6.289 * Math.sin(M * Math.PI / 180)) % 360;
    return lambda;
}

// Calculate Tithi
function getTithi(jd) {
    const sunLong = getSunPosition(jd);
    const moonLong = getMoonPosition(jd);
    let elongation = (moonLong - sunLong + 360) % 360;
    
    const tithiNum = Math.floor(elongation / 12);
    const tithiIndex = tithiNum % 15;
    const paksha = tithiNum < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
    
    return {
        name: TITHIS[tithiIndex],
        paksha: paksha,
        number: (tithiIndex + 1)
    };
}

// Calculate Nakshatra
function getNakshatra(jd) {
    const moonLong = getMoonPosition(jd);
    const nakshatraIndex = Math.floor(moonLong / 13.333333);
    return NAKSHATRAS[nakshatraIndex % 27];
}

// Calculate Rashi (Moon sign)
function getRashi(jd) {
    const moonLong = getMoonPosition(jd);
    const rashiIndex = Math.floor(moonLong / 30);
    return RASHIS[rashiIndex % 12];
}

// Calculate Yoga
function getYoga(jd) {
    const sunLong = getSunPosition(jd);
    const moonLong = getMoonPosition(jd);
    const yogaValue = (sunLong + moonLong) % 360;
    const yogaIndex = Math.floor(yogaValue / 13.333333);
    return YOGAS[yogaIndex % 27];
}

// Calculate Moon Phase
function getMoonPhase(jd) {
    const sunLong = getSunPosition(jd);
    const moonLong = getMoonPosition(jd);
    const phase = (moonLong - sunLong + 360) % 360;
    
    if (phase < 22.5 || phase >= 337.5) return '🌑 New Moon';
    if (phase < 67.5) return '🌒 Waxing Crescent';
    if (phase < 112.5) return '🌓 First Quarter';
    if (phase < 157.5) return '🌔 Waxing Gibbous';
    if (phase < 202.5) return '🌕 Full Moon';
    if (phase < 247.5) return '🌖 Waning Gibbous';
    if (phase < 292.5) return '🌗 Last Quarter';
    return '🌘 Waning Crescent';
}

// Calculate Sunrise/Sunset (simplified for latitude 28°N - Delhi)
function getSunTimes(date) {
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const declination = 23.45 * Math.sin((360/365) * (dayOfYear - 81) * Math.PI / 180);
    const latitude = 28; // Default latitude
    
    const hourAngle = Math.acos(-Math.tan(latitude * Math.PI / 180) * 
                      Math.tan(declination * Math.PI / 180)) * 180 / Math.PI;
    
    const sunriseTime = 12 - hourAngle / 15;
    const sunsetTime = 12 + hourAngle / 15;
    
    return {
        sunrise: formatTime(sunriseTime),
        sunset: formatTime(sunsetTime),
        dayLength: formatDuration(2 * hourAngle / 15)
    };
}

// Format time
function formatTime(hours) {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Format duration
function formatDuration(hours) {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
}

// Update all panchang data
function updatePanchang() {
    const now = new Date();
    const jd = getJulianDay(now);
    const sunTimes = getSunTimes(now);
    const tithi = getTithi(jd);
    
    // Update Date & Time
    document.getElementById('date').textContent = now.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('time').textContent = now.toLocaleTimeString('en-IN');
    document.getElementById('day').textContent = DAYS[now.getDay()];
    
    // Update Sun Data
    document.getElementById('sunrise').textContent = sunTimes.sunrise;
    document.getElementById('sunset').textContent = sunTimes.sunset;
    document.getElementById('daylength').textContent = sunTimes.dayLength;
    
    // Update Lunar Data
    document.getElementById('tithi').textContent = tithi.name;
    document.getElementById('paksha').textContent = tithi.paksha;
    document.getElementById('moonphase').textContent = getMoonPhase(jd);
    
    // Update Rashi & Nakshatra
    document.getElementById('rashi').textContent = getRashi(jd);
    document.getElementById('nakshatra').textContent = getNakshatra(jd);
    document.getElementById('yoga').textContent = getYoga(jd);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updatePanchang();
    // Update time every second
    setInterval(() => {
        const now = new Date();
        document.getElementById('time').textContent = now.toLocaleTimeString('en-IN');
    }, 1000);
    // Update panchang data every minute
    setInterval(updatePanchang, 60000);
});

console.log('✨ Offline Vedic Panchang loaded successfully!');
