export interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export const players: Player[] = [
  { id: "kelly-parkinson", name: "Kelly Parkinson", email: "kp@herodesign.com", phone: "415-644-5206" },
  { id: "alexander-bingham", name: "Alexander Bingham", email: "gyrolazerbeam@gmail.com", phone: "530-723-4796" },
  { id: "joshua-cimpan", name: "Joshua Cimpan", email: "cimpanj@gmail.com", phone: "409-539-0035" },
  { id: "andrew-finkenbinder", name: "Andrew Finkenbinder", email: "andrew.finkenbinder@gmail.com", phone: "717-319-3325" },
  { id: "jaicee-gaffney", name: "Jaicee Gaffney", email: "jaiceegaffney@gmail.com", phone: "279-241-3687" },
  { id: "alex-che", name: "Alex Che", email: "chef2318@yahoo.com", phone: "913-953-0206" },
  { id: "james-cimino", name: "James Cimino", email: "jimcimino105@gmail.com", phone: "858-735-5622" },
  { id: "bruce-nye", name: "Bruce Nye", email: "bruce@nyeconinc.com", phone: "916-638-5252" },
  { id: "enrique-bravo", name: "Enrique Bravo", email: "ebrav92@gmail.com", phone: "661-332-2682" },
  { id: "joshua-caileanu", name: "Joshua Caileanu", email: "caileanujoshua@gmail.com", phone: "916-846-1512" },
  { id: "andrea-escamilla", name: "Andrea Escamilla", email: "andrea.escamilla2018@gmail.com", phone: "707-671-3713" },
  { id: "jim-xu", name: "Jim Xu", email: "xujs1995@gmail.com", phone: "301-454-9248" },
  { id: "homar-cisneros", name: "Homar Cisneros", email: "cisneros101088@gmail.com", phone: "559-793-8555" },
  { id: "dario-gonzalez", name: "Dario Gonzalez", email: "hinkaroo@gmail.com", phone: "916-753-3139" },
  { id: "graham-mcbain", name: "Graham McBain", email: "grahammcbain@gmail.com", phone: "480-717-7165" },
];

export function getPlayer(id: string): Player | undefined {
  return players.find(p => p.id === id);
}
