import type { Activity } from "@/features/activity/types";
import type { Client, StatusKey } from "@/features/clients/types";
import type { Note } from "@/features/notes/types";
import { DAY_MS } from "@/lib/constants";

// Demo data: fictional people and companies from around the world.
// Phone numbers use ranges reserved for fiction where they exist (US/CA 555-01xx, UK 020 7946 0xxx).

type Row = [name: string, company: string, email: string, phone: string, status: StatusKey, daysAgo: number];

const ROWS: Row[] = [
  ["Olivia Bennett", "Northwind Analytics", "olivia@northwind.io", "+1 415 555 0132", "lead", 1],
  ["Lucas Moreau", "Atelier Lumen", "lucas@atelierlumen.fr", "+33 1 70 18 99 42", "active", 4],
  ["Aziz Karimov", "Silk Road Logistics", "aziz@silkroadlog.uz", "+998 90 123 45 67", "active", 2],
  ["Hannah Schmidt", "Brückner Maschinenbau", "h.schmidt@brueckner.de", "+49 30 901820 41", "closed", 38],
  ["Priya Raman", "Kaveri Software", "priya@kaverisoft.in", "+91 80 4719 2280", "lead", 0],
  ["James Whitaker", "Harbour & Finch", "james@harbourfinch.co.uk", "+44 20 7946 0123", "active", 12],
  ["Sofia Rossi", "Vela Design Studio", "sofia@veladesign.it", "+39 02 8734 5521", "lead", 3],
  ["Mateo García", "Sierra Foods", "mateo@sierrafoods.es", "+34 91 456 78 12", "active", 9],
  ["Emma de Vries", "Polder Energy", "emma@polderenergy.nl", "+31 20 794 3381", "closed", 45],
  ["Omar Haddad", "Dune Ventures", "omar@duneventures.ae", "+971 4 555 0198", "active", 15],
  ["Chen Wei", "Lotus Robotics", "chen.wei@lotusrobotics.sg", "+65 6714 2208", "lead", 5],
  ["Isabella Costa", "Rio Verde Agro", "isabella@rioverde.com.br", "+55 11 3456 7821", "active", 18],
  ["Noah Fischer", "", "noah@fischer-consulting.ch", "+41 44 668 1820", "lead", 6],
  ["Aigerim Sadykova", "Steppe Digital", "aigerim@steppedigital.kz", "+7 727 355 0412", "active", 22],
  ["Ethan Clarke", "Maple Ridge Realty", "ethan@mapleridge.ca", "+1 604 555 0177", "closed", 52],
  ["Yuki Tanaka", "Kumo Cloud", "yuki@kumocloud.jp", "+81 3 4578 1290", "active", 10],
  ["Zeynep Aydın", "Boğaz Textiles", "zeynep@bogaztextiles.com.tr", "+90 212 555 0143", "lead", 2],
  ["Liam O'Connor", "Emerald Health", "liam@emeraldhealth.ie", "+353 1 437 2219", "active", 25],
  ["Ava Thompson", "Bright Path Learning", "ava@brightpath.edu", "+1 312 555 0164", "closed", 33],
  ["Mohammed Al-Farsi", "Gulf Marine Services", "m.alfarsi@gulfmarine.om", "+968 2450 1187", "lead", 8],
  ["Charlotte Martin", "Maison Claire", "charlotte@maisonclaire.fr", "+33 4 91 55 20 76", "active", 14],
  ["Dilnoza Yusupova", "Bright Media", "dilnoza@brightmedia.uz", "+998 91 234 56 78", "active", 7],
  ["Jack Wilson", "Southern Cross Solar", "jack@southerncross.au", "+61 2 5550 1234", "lead", 11],
  ["Mia Johansson", "Nordic Pulse", "mia@nordicpulse.se", "+46 8 503 112 40", "closed", 41],
  ["Daniel Kowalski", "Wisła Software House", "daniel@wislasoft.pl", "+48 22 380 1255", "active", 19],
  ["Amara Okafor", "Lagos Fintech Hub", "amara@lagosfintech.ng", "+234 1 277 4410", "lead", 4],
  ["Benjamin Lee", "Pacific Craft Coffee", "ben@pacificcraft.com", "+1 206 555 0121", "active", 27],
  ["Elena Popescu", "Carpathia Travel", "elena@carpathia.ro", "+40 21 312 4478", "closed", 48],
  ["Rustam Aliev", "Tashkent Logistics", "rustam@tashlog.uz", "+998 97 111 22 33", "active", 30],
  ["Grace Kim", "Seoul Spark Labs", "grace@seoulspark.kr", "+82 2 3142 7781", "lead", 13],
  ["Henry Adams", "Adams & Partners Law", "henry@adamslaw.com", "+1 617 555 0145", "active", 20],
  ["Fatima Zahra", "Atlas Ceramics", "fatima@atlasceramics.ma", "+212 522 47 18 30", "closed", 36],
  ["Oliver Brown", "Thames Data Co.", "oliver@thamesdata.co.uk", "+44 20 7946 0187", "active", 16],
  ["Lena Fischer", "", "hello@lenafischer.design", "+49 89 4520 7731", "lead", 1],
  ["Ricardo Silva", "Lisboa Digital", "ricardo@lisboadigital.pt", "+351 21 845 3320", "active", 23],
  ["Nora Hansen", "Fjord Outdoor", "nora@fjordoutdoor.no", "+47 22 81 45 90", "closed", 55],
  ["Sardor Nazarov", "", "sardor@nazarov.dev", "+998 93 345 67 89", "lead", 9],
  ["Chloe Dubois", "Petit Pain Bakery", "chloe@petitpain.be", "+32 2 513 77 41", "active", 6],
  ["William Turner", "Turner Logistics", "will@turnerlogistics.com", "+1 713 555 0108", "closed", 29],
  ["Ana Kovač", "Adriatic Yachts", "ana@adriaticyachts.hr", "+385 1 4820 663", "lead", 17],
  ["Samuel Mensah", "Accra Build Group", "samuel@accrabuild.gh", "+233 30 278 1134", "active", 31],
  ["Isla Campbell", "Highland Distillers", "isla@highlanddistillers.co.uk", "+44 20 7946 0154", "active", 35],
  ["Arjun Mehta", "Mehta Pharma", "arjun@mehtapharma.in", "+91 22 6180 4402", "closed", 44],
  ["Laura Bianchi", "Milano Moda", "laura@milanomoda.it", "+39 02 4479 2016", "lead", 21],
  ["Kenji Sato", "Sakura Games", "kenji@sakuragames.jp", "+81 6 6312 4458", "active", 40],
  ["Victoria Novak", "Prague Print Works", "victoria@pragueprint.cz", "+420 222 513 840", "closed", 47],
  ["Malika Tosheva", "UzInvest Group", "malika@uzinvest.uz", "+998 94 456 78 90", "active", 50],
  ["Diego Fernández", "Andes Coffee Traders", "diego@andescoffee.co", "+57 1 744 2290", "lead", 26],
  ["Sophie Laurent", "Laurent Architecture", "sophie@laurentarch.fr", "+33 1 42 68 53 07", "closed", 58],
  ["Thomas Becker", "Becker Automotive", "thomas@becker-auto.de", "+49 711 2205 318", "active", 63],
];

const NOTES: [clientIndex: number, body: string, daysAfterCreated: number][] = [
  [0, "Intro call booked for Thursday. Interested in the analytics add-on for 25 seats.", 0],
  [1, "Signed the annual plan. Wants a quarterly review with their design lead.", 2],
  [1, "Sent onboarding checklist and invited three team members.", 3],
  [2, "Prefers Telegram for quick questions. Next step: integration with their WMS.", 1],
  [5, "Procurement asked for an updated security questionnaire.", 4],
  [5, "Questionnaire returned. Legal review expected next week.", 8],
  [7, "Expanding to two more warehouses in Q1 — upsell opportunity.", 5],
  [9, "Met at the Dubai SaaS summit. Decision maker is the COO.", 3],
  [13, "Pilot went well; asked for Kazakh-language invoices.", 10],
  [15, "Requested SSO before rolling out to the whole company.", 6],
  [21, "Renewal discussion in January. Happy with support response times.", 4],
  [3, "Deal closed. Handed over to account management.", 30],
];

const ACTOR = "Alex Morgan";
const HOUR_MS = 60 * 60 * 1000;

export function seedClients(now = Date.now()): Client[] {
  return ROWS.map(([name, company, email, phone, status, daysAgo], i) => ({
    id: `CL-${String(i + 1).padStart(3, "0")}`,
    name,
    company,
    email,
    phone,
    status,
    // Spread within the day so equal "days ago" still have a stable order
    createdAt: now - daysAgo * DAY_MS - i * 7 * 60 * 1000,
  }));
}

export function seedNotes(clients: Client[], now = Date.now()): Note[] {
  return NOTES.map(([index, body, days], i) => {
    const client = clients[index];
    return {
      id: `note-seed-${i + 1}`,
      clientId: client.id,
      body,
      author: ACTOR,
      createdAt: Math.min(client.createdAt + days * DAY_MS + 3 * HOUR_MS, now - (i + 1) * 60 * 1000),
    };
  });
}

/** History that matches the seed: every client was created, moved through the pipeline, got notes. */
export function seedActivity(clients: Client[], notes: Note[], now = Date.now()): Activity[] {
  const activity: Activity[] = [];
  const clamp = (t: number) => Math.min(t, now - 60 * 1000);

  clients.forEach((client, i) => {
    const base = { clientId: client.id, clientName: client.name, actor: ACTOR };
    activity.push({ ...base, id: `act-seed-c-${i}`, type: "created", createdAt: client.createdAt });

    const age = now - client.createdAt;
    if (client.status !== "lead") {
      activity.push({
        ...base,
        id: `act-seed-a-${i}`,
        type: "status_changed",
        from: "lead",
        to: "active",
        createdAt: clamp(client.createdAt + age * 0.3),
      });
    }
    if (client.status === "closed") {
      activity.push({
        ...base,
        id: `act-seed-x-${i}`,
        type: "status_changed",
        from: "active",
        to: "closed",
        createdAt: clamp(client.createdAt + age * 0.7),
      });
    }
  });

  notes.forEach((note, i) => {
    const client = clients.find((c) => c.id === note.clientId);
    activity.push({
      id: `act-seed-n-${i}`,
      type: "note_added",
      clientId: note.clientId,
      clientName: client?.name ?? "",
      actor: note.author,
      preview: note.body,
      createdAt: note.createdAt,
    });
  });

  return activity;
}

export const DEMO_USER_PROFILE = { id: "user-1", name: ACTOR, role: "Sales manager" } as const;
