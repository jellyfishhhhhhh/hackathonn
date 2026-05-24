export type CerereStatus =
  | "Draft"
  | "Trimisă"
  | "În verificare"
  | "Aprobată"
  | "Respinsă"
  | "Necesită completări";

export type DocStatus = "Verificat de școală" | "În așteptare" | "Necesită actualizare";

export type Copil = {
  id: string;
  prenume: string;
  nume: string;
  scoala: string;
  localitate: string;
  clasa: string;
  status: "confirmat" | "in_verificare";
  cnpMasked?: string;
  parinte: string;
};

export const copiiInitiali: Copil[] = [
  {
    id: "andrei-popescu",
    prenume: "Andrei",
    nume: "Popescu",
    scoala: "Liceul Teoretic Onisifor Ghibu",
    localitate: "Cluj-Napoca",
    clasa: "a IX-a",
    status: "confirmat",
    cnpMasked: "5•••••••••••42",
    parinte: "Maria Popescu",
  },
];

export type CerereRecenta = {
  id: string;
  tip: string;
  elevId: string;
  elev: string;
  institutie: string;
  data: string;
  status: CerereStatus;
};

export const cereriRecente: CerereRecenta[] = [
  {
    id: "cr1",
    tip: "Voucher cultural 700 lei",
    elevId: "andrei-popescu",
    elev: "Andrei Popescu",
    institutie: "Autoritate locală — Cluj-Napoca",
    data: "12.09.2026",
    status: "În verificare",
  },
  {
    id: "cr2",
    tip: "Adeverință elev",
    elevId: "andrei-popescu",
    elev: "Andrei Popescu",
    institutie: "Liceul Teoretic Onisifor Ghibu",
    data: "10.09.2026",
    status: "Aprobată",
  },
  {
    id: "cr3",
    tip: "Scutire medicală",
    elevId: "andrei-popescu",
    elev: "Andrei Popescu",
    institutie: "Diriginte",
    data: "08.09.2026",
    status: "Necesită completări",
  },
  {
    id: "cr4",
    tip: "Învoire 14.09",
    elevId: "andrei-popescu",
    elev: "Andrei Popescu",
    institutie: "Liceul Teoretic Onisifor Ghibu",
    data: "06.09.2026",
    status: "Trimisă",
  },
];

export type Beneficiu = {
  id: string;
  titlu: string;
  descriere: string;
  status: "Eligibil" | "Neeligibil pentru clasa curentă" | "Aplicat";
  suma?: string;
};

// Catalog de beneficii pe localitate. Detaliile (operator transport, programe locale)
// trebuie să fie corecte pentru orașul real al elevului.
type BeneficiuTemplate = Omit<Beneficiu, "status"> & {
  // Clase eligibile (ex: ["a IX-a", "a X-a", ...]). Dacă lipsește → toți elevii sunt eligibili.
  claseEligibile?: string[];
};

const beneficiiNationale: BeneficiuTemplate[] = [
  {
    id: "voucher-cultural",
    titlu: "Voucher cultural",
    suma: "700 lei",
    descriere: "Pentru elevii de clasa a IX-a — cărți, muzee, evenimente culturale.",
    claseEligibile: ["a IX-a"],
  },
  {
    id: "voucher-sportiv",
    titlu: "Voucher sportiv",
    suma: "700 lei",
    descriere: "Pentru elevii de clasa a III-a — echipament și activități sportive.",
    claseEligibile: ["a III-a"],
  },
];

export const beneficiiPeLocalitate: Record<string, BeneficiuTemplate[]> = {
  "Cluj-Napoca": [
    ...beneficiiNationale,
    {
      id: "transport-cluj",
      titlu: "Decont transport local",
      descriere: "Abonament gratuit CTP Cluj-Napoca pentru elevi.",
    },
    {
      id: "bursa-cluj",
      titlu: "Bursa „Cluj merită burse”",
      suma: "în funcție de medie",
      descriere: "Program local al Primăriei Cluj-Napoca pentru elevi cu rezultate deosebite.",
    },
  ],
  "București": [
    ...beneficiiNationale,
    {
      id: "transport-bucuresti",
      titlu: "Decont transport local",
      descriere: "Abonament gratuit STB București pentru elevi (autobuz, tramvai, troleibuz).",
    },
    {
      id: "metrou-bucuresti",
      titlu: "Abonament Metrorex",
      descriere: "Abonament redus la metrou pentru elevi, București.",
    },
  ],
  "Timișoara": [
    ...beneficiiNationale,
    {
      id: "transport-timisoara",
      titlu: "Decont transport local",
      descriere: "Abonament gratuit STPT Timișoara pentru elevi.",
    },
  ],
  "Iași": [
    ...beneficiiNationale,
    {
      id: "transport-iasi",
      titlu: "Decont transport local",
      descriere: "Abonament gratuit CTP Iași pentru elevi.",
    },
  ],
  "Brașov": [
    ...beneficiiNationale,
    {
      id: "transport-brasov",
      titlu: "Decont transport local",
      descriere: "Abonament gratuit RATBV Brașov pentru elevi.",
    },
  ],
};

const beneficiiFallback: BeneficiuTemplate[] = [
  ...beneficiiNationale,
  {
    id: "transport-local",
    titlu: "Decont transport local",
    descriere: "Decont abonament la operatorul local de transport, în funcție de localitate.",
  },
];

export function getBeneficiiPentruElev(copil: Pick<Copil, "localitate" | "clasa">): Beneficiu[] {
  const lista = beneficiiPeLocalitate[copil.localitate] ?? beneficiiFallback;
  return lista.map(({ claseEligibile, ...rest }) => {
    const eligibil = !claseEligibile || claseEligibile.includes(copil.clasa);
    return {
      ...rest,
      status: eligibil ? "Eligibil" : "Neeligibil pentru clasa curentă",
    } satisfies Beneficiu;
  });
}

// Alias retro-compatibil pentru elevul demo (Andrei, Cluj-Napoca, a IX-a).
export const beneficii: Beneficiu[] = getBeneficiiPentruElev(copiiInitiali[0]);


export type DocumentImportant = {
  id: string;
  titlu: string;
  categorie: "Istoric" | "Diplomă" | "Voluntariat" | "Adeverință" | "Admitere";
  data: string;
  status: DocStatus;
};

export const documenteImportante: DocumentImportant[] = [
  { id: "d1", titlu: "Istoric școlar 2025–2026", categorie: "Istoric", data: "15.06.2026", status: "Verificat de școală" },
  { id: "d2", titlu: "Foaie matricolă — clasa a VIII-a", categorie: "Istoric", data: "20.06.2025", status: "Verificat de școală" },
  { id: "d3", titlu: "Diplomă absolvire gimnaziu", categorie: "Diplomă", data: "25.06.2025", status: "Verificat de școală" },
  { id: "d4", titlu: "Certificat competențe digitale", categorie: "Diplomă", data: "01.07.2025", status: "În așteptare" },
  { id: "d5", titlu: "Certificat voluntariat — Crucea Roșie", categorie: "Voluntariat", data: "12.05.2026", status: "Verificat de școală" },
  { id: "d6", titlu: "Adeverință elev 2026/27", categorie: "Adeverință", data: "10.09.2026", status: "Necesită actualizare" },
];

export type MaterieMedie = { materie: string; nota: number };

export type IstoricAn = {
  id: string;
  an: string;
  clasa: string;
  scoala: string;
  medie: string;
  documente: number;
  diriginte?: string;
  purtare?: number;
  absenteNemotivate?: number;
  mediiTop?: MaterieMedie[];
  observatii?: string;
};

export const istoricScolar: IstoricAn[] = [
  {
    id: "i1",
    an: "2025/26",
    clasa: "a IX-a",
    scoala: "Liceul Teoretic Onisifor Ghibu",
    medie: "în curs",
    documente: 2,
    diriginte: "prof. Andreea Mureșan",
    purtare: 10,
    absenteNemotivate: 0,
    mediiTop: [
      { materie: "Matematică", nota: 9.5 },
      { materie: "Limba română", nota: 9.7 },
      { materie: "Informatică", nota: 10 },
    ],
    observatii: "Profil matematică-informatică, intensiv engleză.",
  },
  {
    id: "i2",
    an: "2024/25",
    clasa: "a VIII-a",
    scoala: 'Școala Gimnazială „Ion Creangă"',
    medie: "9.78",
    documente: 5,
    diriginte: "prof. Cristina Pop",
    purtare: 10,
    absenteNemotivate: 1,
    mediiTop: [
      { materie: "Matematică", nota: 10 },
      { materie: "Limba română", nota: 9.85 },
      { materie: "Informatică", nota: 10 },
      { materie: "Engleză", nota: 9.9 },
    ],
    observatii: "Promovat în top 5% pe școală. Evaluare Națională: 9.65.",
  },
  {
    id: "i3",
    an: "2023/24",
    clasa: "a VII-a",
    scoala: 'Școala Gimnazială „Ion Creangă"',
    medie: "9.65",
    documente: 4,
    diriginte: "prof. Cristina Pop",
    purtare: 10,
    absenteNemotivate: 2,
    mediiTop: [
      { materie: "Matematică", nota: 9.8 },
      { materie: "Limba română", nota: 9.6 },
      { materie: "Informatică", nota: 10 },
    ],
  },
  {
    id: "i4",
    an: "2022/23",
    clasa: "a VI-a",
    scoala: 'Școala Gimnazială „Ion Creangă"',
    medie: "9.52",
    documente: 3,
    diriginte: "prof. Cristina Pop",
    purtare: 10,
    absenteNemotivate: 0,
  },
];

export type PremiuNivel = "Local" | "Județean" | "Național" | "Internațional";

export type Premiu = {
  id: string;
  an: string;
  disciplina: string;
  competitie: string;
  nivel: PremiuNivel;
  pozitie: string;
  organizator: string;
};

export const premiiSiOlimpiade: Premiu[] = [
  {
    id: "p1",
    an: "2024/25",
    disciplina: "Matematică",
    competitie: "Olimpiada Națională de Matematică",
    nivel: "Național",
    pozitie: "Mențiune",
    organizator: "Ministerul Educației",
  },
  {
    id: "p2",
    an: "2024/25",
    disciplina: "Informatică",
    competitie: "Olimpiada de Informatică",
    nivel: "Județean",
    pozitie: "Premiul II",
    organizator: "ISJ Cluj",
  },
  {
    id: "p3",
    an: "2023/24",
    disciplina: "Limba engleză",
    competitie: "Cambridge English — KET for Schools",
    nivel: "Internațional",
    pozitie: "Pass with Distinction",
    organizator: "Cambridge Assessment",
  },
  {
    id: "p4",
    an: "2023/24",
    disciplina: "Matematică",
    competitie: 'Concursul „Lumina Math"',
    nivel: "Județean",
    pozitie: "Premiul III",
    organizator: "Asociația Lumina",
  },
  {
    id: "p5",
    an: "2022/23",
    disciplina: "Limba română",
    competitie: 'Concursul „Comper"',
    nivel: "Local",
    pozitie: "Premiul I",
    organizator: "Fundația Comper",
  },
];

export type InboxRequestType =
  | "adeverinta"
  | "scutire-medicala"
  | "invoire"
  | "voucher-cultural"
  | "voucher-sportiv";

export type InboxItem = {
  id: string;
  type: InboxRequestType;
  tip: string;
  elev: string;
  clasa: string;
  solicitant: string;
  data: string;
  status: CerereStatus;
};

export const inboxSecretariat: InboxItem[] = [
  { id: "EE-2026-000184", type: "voucher-cultural", tip: "Voucher cultural — 700 lei", elev: "Andrei Popescu", clasa: "a IX-a", solicitant: "Maria Popescu", data: "23.05.2026", status: "În verificare" },
  { id: "EE-2026-000185", type: "adeverinta", tip: "Adeverință elev", elev: "Andrei Popescu", clasa: "a IX-a", solicitant: "Maria Popescu", data: "23.05.2026", status: "Aprobată" },
  { id: "EE-2026-000186", type: "invoire", tip: "Învoire / plecare din școală", elev: "Andrei Popescu", clasa: "a IX-a", solicitant: "Maria Popescu", data: "23.05.2026", status: "Necesită completări" },
  { id: "EE-2026-000182", type: "scutire-medicala", tip: "Scutire medicală", elev: "Andrei Popescu", clasa: "a IX-a", solicitant: "Maria Popescu", data: "21.05.2026", status: "În verificare" },
  { id: "EE-2026-000181", type: "voucher-sportiv", tip: "Voucher sportiv — 700 lei", elev: "Sofia Mureșan", clasa: "a III-a", solicitant: "Dan Mureșan", data: "19.05.2026", status: "Trimisă" },
];

export type DocStare = "Opțional" | "Necesită verificare" | "Verificat";

export type CerereDocument = {
  nume: string;
  stare: DocStare;
};

export type CerereDetaliu = {
  id: string;
  campuri: { label: string; value: string; mono?: boolean }[];
  documente: CerereDocument[];
  confirmare: {
    solicitant: string;
    rol: string;
    declaratie: "Da";
    dataOra: string;
  };
  istoric: { when: string; text: string }[];
};

export const cereriDetalii: Record<string, CerereDetaliu> = {
  "EE-2026-000184": {
    id: "EE-2026-000184",
    campuri: [
      { label: "Localitate", value: "Cluj-Napoca" },
      { label: "Clasă eligibilă", value: "a IX-a" },
      { label: "Elev asociat contului", value: "Andrei Popescu" },
      { label: "IBAN părinte/tutore", value: "RO49 AAAA 1B31 0075 9384 0000", mono: true },
      { label: "Titular cont", value: "Maria Popescu" },
      { label: "Eligibilitate", value: "Verificată automat" },
    ],
    documente: [
      { nume: "extras_cont.pdf", stare: "Verificat" },
    ],
    confirmare: {
      solicitant: "Maria Popescu",
      rol: "Părinte / tutore legal",
      declaratie: "Da",
      dataOra: "23.05.2026 09:42",
    },
    istoric: [
      { when: "23.05.2026 09:38", text: "Cerere completată în platformă" },
      { when: "23.05.2026 09:39", text: "Date verificate automat (eligibilitate, IBAN)" },
      { when: "23.05.2026 09:40", text: "Document justificativ atașat — extras_cont.pdf" },
      { when: "23.05.2026 09:42", text: "Cerere confirmată electronic de solicitant prin ROeID" },
      { when: "23.05.2026 09:42", text: "Cerere trimisă către secretariat" },
      { when: "23.05.2026 10:15", text: "Status actualizat: În verificare" },
    ],
  },
  "EE-2026-000185": {
    id: "EE-2026-000185",
    campuri: [
      { label: "Tip adeverință", value: "Adeverință de elev" },
      { label: "Scopul adeverinței", value: "Medic de familie" },
      { label: "Instituția unde va fi folosită", value: "Cabinet Dr. Ionescu" },
      { label: "Format solicitat", value: "Digital" },
      { label: "Observații", value: "—" },
    ],
    documente: [],
    confirmare: {
      solicitant: "Maria Popescu",
      rol: "Părinte / tutore legal",
      declaratie: "Da",
      dataOra: "23.05.2026 08:14",
    },
    istoric: [
      { when: "23.05.2026 08:10", text: "Cerere completată în platformă" },
      { when: "23.05.2026 08:14", text: "Cerere confirmată electronic de solicitant prin ROeID" },
      { when: "23.05.2026 08:14", text: "Cerere trimisă către secretariat" },
      { when: "23.05.2026 11:02", text: "Status actualizat: Aprobată" },
    ],
  },
  "EE-2026-000186": {
    id: "EE-2026-000186",
    campuri: [
      { label: "Data plecării", value: "24.05.2026" },
      { label: "Ora plecării", value: "11:30" },
      { label: "Motiv", value: "Control medical programat" },
      { label: "Persoană care preia elevul", value: "Maria Popescu (părinte)" },
      { label: "Telefon contact părinte", value: "+40 7•• ••• 384", mono: true },
      { label: "Confirmare părinte", value: "Da" },
      { label: "Observații", value: "—" },
    ],
    documente: [],
    confirmare: {
      solicitant: "Maria Popescu",
      rol: "Părinte / tutore legal",
      declaratie: "Da",
      dataOra: "23.05.2026 14:08",
    },
    istoric: [
      { when: "23.05.2026 14:05", text: "Cerere completată în platformă" },
      { when: "23.05.2026 14:08", text: "Cerere confirmată electronic de solicitant prin ROeID" },
      { when: "23.05.2026 14:08", text: "Cerere trimisă către secretariat" },
      { when: "23.05.2026 15:30", text: "Status actualizat: Necesită completări — motiv neclar" },
    ],
  },
  "EE-2026-000182": {
    id: "EE-2026-000182",
    campuri: [
      { label: "Perioadă absență", value: "18.05.2026 – 20.05.2026" },
      { label: "Motiv", value: "Viroză respiratorie acută" },
      { label: "Document justificativ", value: "Scutire medicală atașată" },
      { label: "Observații părinte", value: "Eliberată de medicul de familie" },
    ],
    documente: [
      { nume: "scutire_medicala.jpg", stare: "Necesită verificare" },
    ],
    confirmare: {
      solicitant: "Maria Popescu",
      rol: "Părinte / tutore legal",
      declaratie: "Da",
      dataOra: "21.05.2026 19:22",
    },
    istoric: [
      { when: "21.05.2026 19:18", text: "Cerere completată în platformă" },
      { when: "21.05.2026 19:20", text: "Document justificativ atașat — scutire_medicala.jpg" },
      { when: "21.05.2026 19:22", text: "Cerere confirmată electronic de solicitant prin ROeID" },
      { when: "21.05.2026 19:22", text: "Cerere trimisă către secretariat" },
      { when: "22.05.2026 08:45", text: "Status actualizat: În verificare" },
    ],
  },
  "EE-2026-000181": {
    id: "EE-2026-000181",
    campuri: [
      { label: "Localitate", value: "Cluj-Napoca" },
      { label: "Clasă eligibilă", value: "a III-a" },
      { label: "Elev asociat contului", value: "Sofia Mureșan" },
      { label: "IBAN părinte/tutore", value: "RO12 BBBB 4456 7788 9900 1122", mono: true },
      { label: "Titular cont", value: "Dan Mureșan" },
      { label: "Eligibilitate", value: "Verificată automat" },
    ],
    documente: [
      { nume: "extras_cont.pdf", stare: "Opțional" },
    ],
    confirmare: {
      solicitant: "Dan Mureșan",
      rol: "Părinte / tutore legal",
      declaratie: "Da",
      dataOra: "19.05.2026 17:01",
    },
    istoric: [
      { when: "19.05.2026 16:58", text: "Cerere completată în platformă" },
      { when: "19.05.2026 16:59", text: "Date verificate automat (eligibilitate, IBAN)" },
      { when: "19.05.2026 17:01", text: "Cerere confirmată electronic de solicitant prin ROeID" },
      { when: "19.05.2026 17:01", text: "Cerere trimisă către secretariat" },
    ],
  },
};

export type AsociereCerere = {
  id: string;
  parinte: string;
  elev: string;
  cnpElev: string;
  clasa: string;
  data: string;
};

export const asocieriDePerfectat: AsociereCerere[] = [
  { id: "a1", parinte: "Dan Mureșan", elev: "Sofia Mureșan", cnpElev: "6•••••••••••11", clasa: "a IX-a", data: "11.09.2026" },
  { id: "a2", parinte: "Elena Cristea", elev: "Tudor Cristea", cnpElev: "5•••••••••••03", clasa: "a IX-a", data: "10.09.2026" },
];

export type InscriereNoua = {
  id: string;
  parinte: string;
  elev: string;
  cnpElev: string;
  clasa: string;
  data: string;
};

export const inscrieriNoi: InscriereNoua[] = [
  { id: "in1", parinte: "Dan Mureșan", elev: "Sofia Mureșan", cnpElev: "6•••••••••••11", clasa: "a IX-a", data: "11.09.2026" },
  { id: "in2", parinte: "Elena Cristea", elev: "Tudor Cristea", cnpElev: "5•••••••••••03", clasa: "a IX-a", data: "10.09.2026" },
];

export type TransferPlecare = {
  id: string;
  elev: string;
  clasa: string;
  parinte: string;
  motiv: "Transfer" | "Retragere";
  institutieDestinatara?: string;
  data: string;
  status: "În verificare" | "Necesită completări";
};

export const transferuriPlecari: TransferPlecare[] = [
  { id: "tp1", elev: "Andrei Popescu", clasa: "a IX-a", parinte: "Maria Popescu", motiv: "Transfer", institutieDestinatara: "Liceul Teoretic Avram Iancu", data: "15.09.2026", status: "În verificare" },
  { id: "tp2", elev: "Radu Ionescu", clasa: "a X-a", parinte: "Mihai Ionescu", motiv: "Retragere", data: "12.09.2026", status: "În verificare" },
];
