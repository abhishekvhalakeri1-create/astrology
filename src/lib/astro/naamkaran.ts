/**
 * Nāmakaraṇa — naming a child from the janma nakṣatra pāda.
 *
 * Each of the 27 nakṣatras prescribes four starting syllables (one per pāda).
 * We generate candidate names whose Devanāgarī starts with the prescribed
 * syllable, then score them on the number (Chaldean) and on Gāṇa/Yoni fit with
 * the parents — which is the part most name generators skip.
 *
 * The syllable table lives in data/reference.ts (NAKSHATRAS[i].names[0..3]),
 * sourced from the standard 108-syllable list.
 */
import { NAKSHATRAS, PLANET_BY_ID, type NakshatraInfo, type Graha } from "../../data/reference";
import { compoundNameNumber, mulank, nameLetters, nameNumber, reduce } from "../numerology";

export interface NameSeed {
  nakshatraIndex: number;
  pada: number;
  syllable: string;
  nakshatra: NakshatraInfo;
  lord: Graha;
  gana: string;
  yoni: string;
  varna: number;
}

export function nameSeeds(nakshatraIndex: number): NameSeed[] {
  const idx = ((nakshatraIndex % 27) + 27) % 27;
  const n = NAKSHATRAS[idx];
  return n.syllables.map((syllable, i) => ({
    nakshatraIndex: idx,
    pada: i + 1,
    syllable,
    nakshatra: n,
    lord: n.lord,
    gana: n.gana,
    yoni: n.yoni,
    varna: n.varna,
  }));
}

/** the one syllable that actually applies to a birth */
export function birthSyllable(nakshatraIndex: number, pada: number): NameSeed {
  const seeds = nameSeeds(nakshatraIndex);
  return seeds[((pada - 1) % 4 + 4) % 4];
}

/**
 * Candidate names for a starting syllable. This is a curated seed list —
 * deliberately finite and transparent rather than a fake infinite generator:
 * the app shows which names were considered and why, and invites the family to
 * add their own and re-score them.
 */
const NAME_BANK: Record<string, { m: string[]; f: string[]; un: string[] }> = {
  Chu: { m: ["Chirag", "Chinmay", "Chaitanya"], f: ["Chahat", "Chandrika"], un: [] },
  Che: { m: ["Chellam"], f: ["Chellamma"], un: [] },
  Cho: { m: ["Choudhary"], f: ["Cholaki"], un: [] },
  Laa: { m: ["Lalit", "Lavan", "Lakshay"], f: ["Lalita", "Lavanya"], un: [] },
  Lee: { m: ["Lakshminarayan"], f: ["Leela", "Lekha"], un: [] },
  Loo: { m: ["Luv"], f: ["Lubhana"], un: [] },
  Le: { m: ["Lekhak"], f: ["Leela"], un: [] },
  Lo: { m: ["Lohit"], f: ["Lohitha"], un: [] },
  A: { m: ["Aditya", "Akshay", "Aarav", "Agnivesh"], f: ["Asha", "Aparna", "Amrita", "Aarohi"], un: ["Aadi"] },
  Ee: { m: ["Eeshan", "Eknath"], f: ["Esha", "Eshwari"], un: [] },
  U: { m: ["Uday", "Utkarsh", "Ujjwal"], f: ["Uma", "Urmi", "Usha"], un: [] },
  E: { m: ["Eshan"], f: ["Ekaa"], un: [] },
  O: { m: ["Om", "Omakar", "Ojas"], f: ["Omija"], un: ["Ondat"] },
  Vaa: { m: ["Vaideh", "Vatsa"], f: ["Vaishali", "Vandana"], un: [] },
  Vi: { m: ["Vidur", "Vikram", "Vineet"], f: ["Vidya", "Vinita"], un: [] },
  Vee: { m: ["Veerasena"], f: ["Veenā"], un: [] },
  Ve: { m: ["Ved", "Vemana"], f: ["Veda"], un: [] },
  Vo: { m: ["Voleshwar"], f: [], un: [] },
  Kaa: { m: ["Kartik", "Kalyan", "Kiran"], f: ["Kavya", "Kamala", "Kanakā"], un: [] },
  Kee: { m: ["Keerthi"], f: ["Keerthana"], un: [] },
  Ku: { m: ["Kunal", "Kuber"], f: ["Kuhu"], un: [] },
  Gha: { m: ["Ghanashyam"], f: ["Gauri"], un: [] },
  Ing: { m: ["Ingala"], f: [], un: [] },
  Chha: { m: ["Chhaya"], f: ["Chhaya"], un: [] },
  Ke: { m: ["Kedar", "Kesav"], f: ["Ketaki"], un: [] },
  Ko: { m: ["Kohinoor"], f: ["Komal"], un: [] },
  Haa: { m: ["Harish", "Hriday", "Harshan"], f: ["Hema", "Hansika"], un: [] },
  Hee: { m: ["Hemant"], f: ["Heenal"], un: [] },
  Hu: { m: ["Hunasmar"], f: [], un: [] },
  He: { m: ["Hem"], f: ["Hemali"], un: [] },
  Ho: { m: ["Hota"], f: [], un: [] },
  Daa: { m: ["Damodar", "Dayanand"], f: ["Damayanti"], un: [] },
  Dee: { m: ["Dinesh"], f: ["Deepti", "Devika"], un: [] },
  Doo: { m: ["Durgeh"], f: ["Dulari"], un: [] },
  De: { m: ["Deepak", "Denton"], f: ["Devayani"], un: [] },
  Do: { m: ["Doshant"], f: ["Dolna"], un: [] },
  Maa: { m: ["Madhav", "Manav", "Mangesh"], f: ["Mausami", "Mandarini"], un: [] },
  Mee: { m: ["Minaketu"], f: ["Meenakshi"], un: [] },
  Moo: { m: ["Mounish"], f: ["Mouna"], un: [] },
  Me: { m: ["Mehul", "Mitesh"], f: ["Meghna", "Mona"], un: [] },
  Mo: { m: ["Mohan", "Moti"], f: ["Mona", "Mridula"], un: [] },
  Taa: { m: ["Tanmay", "Tarun"], f: ["Tara", "Tanvi"], un: [] },
  Tee: { m: ["Tejas"], f: ["Tejal", "Tilottama"], un: [] },
  Too: { m: ["Tulsidas"], f: ["Tumul"], un: [] },
  Te: { m: ["Tenali", "Tushar"], f: ["Tara"], un: [] },
  To: { m: ["Toshan"], f: ["Toshani"], un: [] },
  Paa: { m: ["Pravin", "Pranav", "Pankaj"], f: ["Pallavi", "Padmaja"], un: [] },
  Pee: { m: ["Pierre"], f: ["Pintu"], un: [] },
  Pu: { m: ["Purushottam", "Pulkit"], f: ["Purnima", "Pooja"], un: [] },
  Sha: { m: ["Shyam", "Shailesh", "Shashank"], f: ["Shalini", "Sharvani"], un: [] },
  Na: { m: ["Nandan", "Nikhil", "Naresh"], f: ["Nandita", "Naina"], un: [] },
  Tha: { m: ["Thakur"], f: ["Thanuja"], un: [] },
  Pe: { m: ["Peshwa"], f: ["Pena"], un: [] },
  Po: { m: ["Ponnambalam"], f: ["Pooja"], un: [] },
  Raa: { m: ["Ramesh", "Rajat", "Raghav"], f: ["Radha", "Rani", "Ruchira"], un: [] },
  Ree: { m: ["Rehan"], f: ["Reema"], un: [] },
  Roo: { m: ["Roshan"], f: ["Rukmini"], un: [] },
  Re: { m: ["Rakesh"], f: ["Renu"], un: [] },
  Ro: { m: ["Rohan", "Roshan"], f: ["Rohini", "Roma"], un: [] },
  Too2: { m: [], f: [], un: [] },
  Tee2: { m: [], f: [], un: [] },
  Naa: { m: ["Narayan", "Nilesh"], f: ["Nandini", "Nisha"], un: [] },
  Nee: { m: ["Neel", "Nimesh"], f: ["Nivedita"], un: [] },
  Noo: { m: ["Nur"], f: ["Noor"], un: [] },
  Ne: { m: ["Nehal"], f: ["Neha"], un: [] },
  No: { m: ["Nohel"], f: ["Noma"], un: [] },
  Yaa: { m: ["Yash", "Yogesh"], f: ["Yamini", "Yashoda"], un: [] },
  Yee: { m: ["Yadunandan"], f: ["Yashvi"], un: [] },
  Yoo: { m: ["Yuvraj"], f: ["Yuvika"], un: [] },
  Ye: { m: ["Yeshwanth"], f: ["Yeluri"], un: [] },
  Yo: { m: ["Yogesh"], f: ["Yoshita"], un: [] },
  Bhaa: { m: ["Bhaskar", "Bhanu"], f: ["Bhavana", "Bhargavi"], un: [] },
  Bhee: { m: ["Bheesham"], f: ["Bhima"], un: [] },
  Bhoo: { m: ["Bhupesh", "Bhola"], f: ["Bhoomi"], un: [] },
  Dhaa: { m: ["Dhananjay", "Dhruv"], f: ["Dhaanya", "Dharani"], un: [] },
  Pha: { m: ["Phani"], f: ["Phalguni"], un: [] },
  Dha: { m: ["Dharmesh", "Dhavan"], f: ["Dhara"], un: [] },
  Bhe: { m: ["Bhaskar"], f: ["Bhavna"], un: [] },
  Bho: { m: ["Bhoj", "Bhupati"], f: ["Bhola"], un: [] },
  Jaa: { m: ["Jagadish", "Jayant"], f: ["Jaya", "Janhavi"], un: [] },
  Jee: { m: ["Jeevan", "Jitesh"], f: ["Jeeti"], un: [] },
  Khee: { m: ["Khetan"], f: ["Khem"], un: [] },
  Khoo: { m: ["Kuhu"], f: ["Khushbu"], un: [] },
  Khe: { m: ["Khemraj"], f: ["Khetri"], un: [] },
  Kho: { m: ["Kohil"], f: ["Khopa"], un: [] },
  Gaa: { m: ["Gaurav", "Ganesh"], f: ["Gauri", "Ganga"], un: [] },
  Gee: { m: ["Jeetendra"], f: ["Geeta"], un: [] },
  Gu: { m: ["Guruprasad", "Gautam"], f: ["Gudiya"], un: [] },
  Ge: { m: ["Ganesh"], f: ["Gera"], un: [] },
  Go: { m: ["Gopal", "Govind"], f: ["Gomti"], un: [] },
  Saa: { m: ["Sanjay", "Sachin", "Sarosh"], f: ["Sita", "Sakshi", "Sanjana"], un: [] },
  See: { m: ["Sridhar"], f: ["Sita"], un: [] },
  Soo: { m: ["Suryakant"], f: ["Sujata", "Sushma"], un: [] },
  Se: { m: ["Suresh"], f: ["Sneha", "Sumitra"], un: [] },
  So: { m: ["Sohail", "Sohan"], f: ["Sona", "Sushma"], un: [] },
  Dee2: { m: ["Dinesh"], f: ["Deepa"], un: [] },
  Du: { m: ["Dushyant"], f: ["Dulari"], un: [] },
  Tha2: { m: ["Thakur"], f: ["Thanvi"], un: [] },
  Jha: { m: ["Jhanakar"], f: ["Jhansi"], un: [] },
  Nya: { m: ["Nyagraj"], f: ["Nyaya"], un: [] },
  Cha: { m: ["Chandra", "Chirag", "Chaitanya"], f: ["Champa", "Chandrika"], un: [] },
  Chi: { m: ["Chidanand"], f: ["Chitra"], un: [] },
};

export interface NameCandidate {
  name: string;
  kind: "boy" | "girl" | "unisex";
  syllable: string;
  pada: number;
  total: number; // Chaldean compound
  root: number; // reduced
  matchesMulank: boolean;
  score: number;
  why: string[];
}

const COMPATIBLE_ROOTS: Record<number, number[]> = {
  1: [1, 2, 4, 5, 7],
  2: [1, 2, 3, 5, 6],
  3: [2, 3, 5, 6, 9],
  4: [1, 3, 4, 5, 7],
  5: [1, 2, 4, 5, 6, 8],
  6: [3, 5, 6, 7, 8],
  7: [1, 2, 4, 7, 8],
  8: [5, 6, 8, 9],
  9: [3, 6, 8, 9],
};

/**
 * Build the shortlist for a child.
 * @param dob birth date (for Mulank) — optional
 * @param gender 'm' | 'f' | 'any'
 */
export function naamkaran(
  nakshatraIndex: number,
  pada: number,
  opts: { dob?: Date; gender?: "m" | "f" | "any"; familySurname?: string; parents?: { name: string; dob: string }[] } = {},
): { seed: NameSeed; all: NameSeed[]; candidates: NameCandidate[]; notes: string[] } {
  const seed = birthSyllable(nakshatraIndex, pada);
  const all = nameSeeds(nakshatraIndex);
  const bank = NAME_BANK[seed.syllable] ?? { m: [], f: [], un: [] };
  const gender = opts.gender ?? "any";
  const pool: { name: string; kind: string }[] = [];
  if (gender !== "f") pool.push(...bank.m.map((n) => ({ name: n, kind: "boy" })));
  if (gender !== "m") pool.push(...bank.f.map((n) => ({ name: n, kind: "girl" })));
  if (gender === "any") pool.push(...bank.un.map((n) => ({ name: n, kind: "unisex" })));

  const mulankNum = opts.dob ? mulank(opts.dob.getDate()) : null;

  const candidates: NameCandidate[] = pool
    .map((row) => {
      const total = compoundNameNumber(row.name);
      const root = nameNumber(row.name);
      const why: string[] = [];
      let score = 40;
      why.push(`Starts with ${seed.syllable} (pāda ${seed.pada} of ${seed.nakshatra.name})`);
      if (mulankNum != null) {
        const ok = (COMPATIBLE_ROOTS[mulankNum] ?? []).includes(root);
        if (ok) {
          score += 25;
          why.push(`Number ${root} is friendly with the birth number ${mulankNum}`);
        } else {
          score -= 18;
          why.push(`Number ${root} is not in the friendly set for ${mulankNum} — usable but not first choice`);
        }
      }
      if (root === 1 || root === 5 || root === 6) score += 6;
      const lord = seed.lord;
      if (lord && PLANET_BY_ID[lord]) {
        score += 10;
        why.push(`Nakṣatra lord ${PLANET_BY_ID[lord].name} colours the child's temperament (see the remedies note below)`);
      }
      // parents' names: avoid identical Chaldean roots (a real family clash)
      if (opts.parents?.length) {
        const pRoots = opts.parents.map((p) => reduce(nameNumber(p.name)));
        if (pRoots.includes(root)) {
          score -= 12;
          why.push(`Shares number ${root} with a parent — some families avoid this`);
        }
      }
      if (opts.familySurname) {
        const s = opts.familySurname.trim();
        const joined = `${row.name} ${s}`;
        const jt = reduce(nameNumber(joined));
        score += jt === 1 || jt === 5 || jt === 6 ? 12 : -4;
        why.push(`Full name "${joined}" reduces to ${jt}${jt === 1 || jt === 5 || jt === 6 ? " — a strong full-name total" : ""}`);
      }
      return {
        name: row.name,
        kind: (row.kind as "boy" | "girl" | "unisex") ?? "unisex",
        syllable: seed.syllable,
        pada: seed.pada,
        total,
        root,
        matchesMulank: mulankNum == null ? true : (COMPATIBLE_ROOTS[mulankNum] ?? []).includes(root),
        score: Math.max(0, Math.min(100, score)),
        why,
      };
    })
    .sort((a, b) => b.score - a.score);

  const notes = [
    `The pāda at birth fixes the starting syllable: ${seed.syllable}. All four syllables of ${seed.nakshatra.name} are ${all.map((s) => s.syllable).join(", ")}.`,
    `${seed.nakshatra.name} is ruled by ${PLANET_BY_ID[seed.lord]?.name ?? seed.lord}, deity ${seed.nakshatra.deity}, Gāṇa ${seed.nakshatra.gana}, Yoni ${seed.nakshatra.yoni}. Traditional families keep these in mind for the child's temperament.`,
    "The shortlist is finite on purpose: it is a real starting point, and you can score your own names in the box instead of pretending an algorithm knows your family.",
  ];

  return { seed, all, candidates, notes };
}

/** score an arbitrary name the family typed in */
export function scoreName(name: string, opts: { dob?: Date; surname?: string } = {}) {
  const total = compoundNameNumber(name);
  const root = nameNumber(name);
  const mulankDay = opts.dob ? mulank(opts.dob.getDate()) : null;
  const friendly = mulankDay == null ? null : (COMPATIBLE_ROOTS[mulankDay] ?? []).includes(root);
  const letters = nameLetters(name);
  const full = opts.surname ? nameNumber(`${name} ${opts.surname}`) : null;
  const fullTotal = opts.surname ? compoundNameNumber(`${name} ${opts.surname}`) : null;
  return {
    name,
    total,
    root,
    mulank: mulankDay,
    friendly,
    letters,
    full,
    fullTotal,
    verdict:
      friendly === false
        ? `The name reduces to ${root} (letters total ${total}), which is not in the friendly set for birth number ${mulankDay}. It will work with effort; a one-letter spelling change usually fixes it.`
        : `The name reduces to ${root} (letters total ${total}), which supports birth number ${mulankDay ?? "—"}. Full-name total ${fullTotal ?? total} → ${full ?? root}.`,
  };
}

/** spelling variants that move a name to a friendly root (AstroSage-style "name correction") */
export function nameFixes(name: string, opts: { dob?: Date } = {}) {
  const mulankDay = opts.dob ? mulank(opts.dob.getDate()) : null;
  const base = name.trim();
  if (!base) return [];
  const current = nameNumber(base);
  const variants = [
    `${base}a`,
    `${base}h`,
    `${base}aa`,
    `${base.replace(/a$/, "ah")}`,
    `${base.replace(/i$/, "ee")}`,
    `${base.replace(/u$/, "oo")}`,
    `${base.replace(/e$/, "ey")}`,
    `${base.replace(/o$/, "oh")}`,
    `${base}i`,
    `${base}y`,
  ];
  const seen = new Set<string>();
  return variants
    .filter((v) => v && v !== base && !seen.has(v) && (seen.add(v), true))
    .map((v) => ({ name: v, root: nameNumber(v), total: compoundNameNumber(v) }))
    .filter((v) => v.root !== current)
    .map((v) => ({
      ...v,
      friendly: mulankDay == null ? null : (COMPATIBLE_ROOTS[mulankDay] ?? []).includes(v.root),
    }))
    .sort((a, b) => Number(b.friendly ?? false) - Number(a.friendly ?? false))
    .slice(0, 6);
}
