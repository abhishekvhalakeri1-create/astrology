import { BirthProfile, BirthChart, PlanetPosition, House, DashaInfo } from './types';
import { getZodiacFromDate } from './utils';

const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const nakshatras = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const planets = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];

const planetDescriptions: Record<string, string> = {
  Sun: "Represents soul, vitality and authority. Strong Sun gives leadership and confidence.",
  Moon: "Mind and emotions. Indicates emotional nature and mental peace.",
  Mars: "Energy, courage and passion. Shows drive and determination.",
  Mercury: "Intelligence, communication and wit. Governs learning and speech.",
  Jupiter: "Wisdom, wealth and fortune. Most benefic planet for growth.",
  Venus: "Love, beauty and luxury. Indicates relationships and comforts.",
  Saturn: "Discipline, karma and longevity. Teaches patience and hard work.",
  Rahu: "Ambition and illusion. Brings sudden changes and foreign connections.",
  Ketu: "Spirituality and detachment. Indicates past life karma and moksha."
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function calculateBirthChart(profile: BirthProfile): BirthChart {
  const seedBase = new Date(profile.dob).getTime() + profile.tob.split(':').reduce((a,b)=>a+parseInt(b),0);
  const sunSign = getZodiacFromDate(profile.dob);
  const moonIndex = Math.floor(seededRandom(seedBase) * 12);
  const ascIndex = Math.floor(seededRandom(seedBase * 1.3) * 12);
  const nakIndex = Math.floor(seededRandom(seedBase * 0.7) * 27);

  const planetPositions: PlanetPosition[] = planets.map((planet, idx) => {
    const r = seededRandom(seedBase + idx * 100);
    const signIdx = Math.floor(r * 12);
    const house = Math.floor(seededRandom(seedBase + idx * 200) * 12) + 1;
    const degree = Math.floor(seededRandom(seedBase + idx * 300) * 30);
    const nak = nakshatras[Math.floor(seededRandom(seedBase + idx * 400) * 27)];
    return {
      planet,
      sign: signs[signIdx],
      house,
      degree,
      nakshatra: nak,
      isRetrograde: seededRandom(seedBase + idx * 500) > 0.8,
      description: planetDescriptions[planet]
    };
  });

  const houses: House[] = Array.from({length:12}, (_, i) => {
    const signIdx = (ascIndex + i) % 12;
    const lordMap: Record<string,string> = {
      Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
      Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
      Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter"
    };
    const sign = signs[signIdx];
    return {
      house: i+1,
      sign,
      lord: lordMap[sign],
      description: `House ${i+1} represents ${["Self","Wealth","Courage","Home","Children","Enemies","Partnership","Longevity","Fortune","Career","Gains","Expenses"][i]}.`
    };
  });

  const dashas = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];
  const currentIdx = Math.floor(seededRandom(seedBase * 2) * 9);
  const dasha: DashaInfo = {
    currentDasha: dashas[currentIdx],
    currentAntardasha: dashas[(currentIdx + 2) % 9],
    mahadashaEnd: new Date(Date.now() + seededRandom(seedBase) * 1000*60*60*24*365*5).toISOString().split('T')[0],
    nextDasha: dashas[(currentIdx + 1) % 9]
  };

  return {
    sunSign,
    moonSign: signs[moonIndex],
    ascendant: signs[ascIndex],
    nakshatra: nakshatras[nakIndex],
    planets: planetPositions,
    houses,
    dasha,
    kundliData: { ascendant: signs[ascIndex], generatedAt: new Date().toISOString() }
  };
}

export const zodiacInfo: Record<string, {symbol: string, element: string, lord: string, dates: string}> = {
  Aries: { symbol: "♈", element: "Fire", lord: "Mars", dates: "Mar 21 - Apr 19" },
  Taurus: { symbol: "♉", element: "Earth", lord: "Venus", dates: "Apr 20 - May 20" },
  Gemini: { symbol: "♊", element: "Air", lord: "Mercury", dates: "May 21 - Jun 20" },
  Cancer: { symbol: "♋", element: "Water", lord: "Moon", dates: "Jun 21 - Jul 22" },
  Leo: { symbol: "♌", element: "Fire", lord: "Sun", dates: "Jul 23 - Aug 22" },
  Virgo: { symbol: "♍", element: "Earth", lord: "Mercury", dates: "Aug 23 - Sep 22" },
  Libra: { symbol: "♎", element: "Air", lord: "Venus", dates: "Sep 23 - Oct 22" },
  Scorpio: { symbol: "♏", element: "Water", lord: "Mars", dates: "Oct 23 - Nov 21" },
  Sagittarius: { symbol: "♐", element: "Fire", lord: "Jupiter", dates: "Nov 22 - Dec 21" },
  Capricorn: { symbol: "♑", element: "Earth", lord: "Saturn", dates: "Dec 22 - Jan 19" },
  Aquarius: { symbol: "♒", element: "Air", lord: "Saturn", dates: "Jan 20 - Feb 18" },
  Pisces: { symbol: "♓", element: "Water", lord: "Jupiter", dates: "Feb 19 - Mar 20" },
};
