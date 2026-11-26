import React, { useState, useEffect } from 'react';
import { 
  Trophy, Calendar, Users, MapPin, Phone, Shield, ChevronRight, 
  Search, Award, Clock, CheckCircle2, AlertCircle, Image as ImageIcon, 
  Lock, Settings, Plus, Trash2, Edit3, X, Menu, Send, Sparkles, 
  Flame, ExternalLink, Filter, Check, Eye, Download, FileSpreadsheet, LogOut, Activity, User, BookOpen
} from 'lucide-react';

// Interfaces
interface Match {
  id: string;
  sport: string;
  category: string; // Keterangan
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  time: string; // Jam
  date: string; // Tanggal (dd-mm-yyyy)
  status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';
  venue: string;
  // Sport-specific details
  scorersA?: string; // Pencetak gol Futsal Anak Tim A
  scorersB?: string; // Pencetak gol Futsal Anak Tim B
  setsVoli?: { set1A: number | null; set1B: number | null; set2A: number | null; set2B: number | null; set3A: number | null; set3B: number | null };
  badmintonDetails?: { 
    g1A: number | null; g1B: number | null; 
    g2A: number | null; g2B: number | null; 
    g3A: number | null; g3B: number | null;
    players1A?: string; players1B?: string;
    players2A?: string; players2B?: string;
    players3A?: string; players3B?: string;
  };
}

interface Standing {
  rw: string;
  name: string;
  gold: number;
  silver: number;
  bronze: number;
  points: number;
}

interface SportTeamStanding {
  rw: string;
  name: string;
  m: number;
  w: number;
  d: number;
  l: number;
  ga: number;
  gf: number;
  gd: number;
  pts: number;
}

interface SportStanding {
  sport: string;
  group: string;
  teams: SportTeamStanding[];
}

interface Registration {
  id: string;
  nama: string;
  rw: string;
  sport: string;
  kategori: string;
  phone: string;
  date: string;
}

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  url: string;
  desc: string;
}

// Initial Data
const INITIAL_RW_LIST = [
  { rw: "RW 013", name: "Vila Mutiara Jaya", logo: "/assets/aistudio/RW_013_583b7ba0.png" },
  { rw: "RW 015", name: "Pesona Gading Cibitung", logo: "/assets/aistudio/RW_015_c16704bb.png" },
  { rw: "RW 016", name: "Pesona Gading Cibitung", logo: "/assets/aistudio/RW_016_a75017a9.png" },
  { rw: "RW 017", name: "Pesona Gading Cibitung", logo: "/assets/aistudio/RW_017_60fa63df.png" },
  { rw: "RW 021", name: "Griya Wanajaya Asri", logo: "/assets/aistudio/RW_021_17619a57.png" },
  { rw: "RW 022", name: "Kirana Cibitung", logo: "/assets/aistudio/RW_022_db67f49a.png" },
  { rw: "RW 025", name: "Graha Persada", logo: "/assets/aistudio/RW_025_9bdc4357.png" },
  { rw: "RW 030", name: "Golden Cibitung", logo: "/assets/aistudio/RW_030_47463b60.png" },
];

const INITIAL_SPORTS = [
  { id: "futsal", name: "Futsal Anak", icon: "⚽", desc: "Kompetisi futsal anak antar RW. Sistem round robin tanpa pembagian grup. Bersifat eksebisi (juara tidak masuk hitungan juara umum).", quota: "Eksebisi" },
  { id: "voli-pa", name: "Bola Voli Putra", icon: "🏐", desc: "Grup A: RW 013, 016, 025, 030 | Grup B: RW 015, 017, 021, 022.", quota: "2 Grup" },
  { id: "voli-pi", name: "Bola Voli Putri", icon: "🏐", desc: "Sistem round robin murni tanpa pembagian grup. Juara ditentukan dari peringkat akhir klasemen.", quota: "Round Robin" },
  { id: "badminton-pa", name: "Bulu Tangkis Putra", icon: "🏸", desc: "Grup A: RW 013, 017, 030 | Grup B: RW 015, 016, 022, 025. Rally point max 42.", quota: "2 Grup" },
  { id: "badminton-pi", name: "Bulu Tangkis Putri", icon: "🏸", desc: "Grup A: RW 016, 022, 030 | Grup B: RW 013, 015, 017, 025. Rally point max 42.", quota: "2 Grup" },
  { id: "tenis-meja", name: "Tenis Meja", icon: "🏓", desc: "Grup A: RW 013, 017, 022, 025 | Grup B: RW 015, 016, 021, 030. Poin 11.", quota: "2 Grup" },
];

const INITIAL_STANDINGS: Standing[] = [
  { rw: "RW 017", name: "Pesona Gading Cibitung", gold: 4, silver: 2, bronze: 1, points: 19 },
  { rw: "RW 015", name: "Pesona Gading Cibitung", gold: 3, silver: 3, bronze: 2, points: 17 },
  { rw: "RW 013", name: "Vila Mutiara Jaya", gold: 2, silver: 3, bronze: 4, points: 14 },
  { rw: "RW 021", name: "Griya Wanajaya Asri", gold: 2, silver: 1, bronze: 2, points: 10 },
  { rw: "RW 022", name: "Kirana Cibitung", gold: 1, silver: 2, bronze: 3, points: 9 },
  { rw: "RW 016", name: "Pesona Gading Cibitung", gold: 1, silver: 1, bronze: 2, points: 7 },
  { rw: "RW 025", name: "Graha Persada", gold: 0, silver: 1, bronze: 2, points: 4 },
  { rw: "RW 030", name: "Golden Cibitung", gold: 0, silver: 0, bronze: 1, points: 1 },
];

const INITIAL_SPORT_STANDINGS: SportStanding[] = [
  {
    sport: "Bola Voli Putra",
    group: "Grup A",
    teams: [
      { rw: "RW 013", name: "Vila Mutiara Jaya", m: 3, w: 2, d: 0, l: 1, ga: 6, gf: 3, gd: 3, pts: 6 },
      { rw: "RW 016", name: "Pesona Gading Cibitung", m: 3, w: 2, d: 0, l: 1, ga: 5, gf: 4, gd: 1, pts: 6 },
      { rw: "RW 030", name: "Golden Cibitung", m: 3, w: 1, d: 0, l: 2, ga: 4, gf: 5, gd: -1, pts: 3 },
      { rw: "RW 025", name: "Graha Persada", m: 3, w: 1, d: 0, l: 2, ga: 3, gf: 6, gd: -3, pts: 3 },
    ]
  },
  {
    sport: "Bola Voli Putra",
    group: "Grup B",
    teams: [
      { rw: "RW 017", name: "Pesona Gading Cibitung", m: 3, w: 3, d: 0, l: 0, ga: 9, gf: 1, gd: 8, pts: 9 },
      { rw: "RW 021", name: "Griya Wanajaya Asri", m: 3, w: 2, d: 0, l: 1, ga: 6, gf: 4, gd: 2, pts: 6 },
      { rw: "RW 022", name: "Kirana Cibitung", m: 3, w: 1, d: 0, l: 2, ga: 4, gf: 6, gd: -2, pts: 3 },
      { rw: "RW 015", name: "Pesona Gading Cibitung", m: 3, w: 0, d: 0, l: 3, ga: 1, gf: 9, gd: -8, pts: 0 },
    ]
  },
  {
    sport: "Bulu Tangkis Putra",
    group: "Grup A",
    teams: [
      { rw: "RW 017", name: "Pesona Gading Cibitung", m: 2, w: 2, d: 0, l: 0, ga: 6, gf: 1, gd: 5, pts: 6 },
      { rw: "RW 013", name: "Vila Mutiara Jaya", m: 2, w: 1, d: 0, l: 1, ga: 4, gf: 3, gd: 1, pts: 3 },
      { rw: "RW 030", name: "Golden Cibitung", m: 2, w: 0, d: 0, l: 2, ga: 0, gf: 6, gd: -6, pts: 0 },
    ]
  },
  {
    sport: "Bulu Tangkis Putra",
    group: "Grup B",
    teams: [
      { rw: "RW 015", name: "Pesona Gading Cibitung", m: 3, w: 2, d: 0, l: 1, ga: 7, gf: 4, gd: 3, pts: 6 },
      { rw: "RW 022", name: "Kirana Cibitung", m: 3, w: 2, d: 0, l: 1, ga: 6, gf: 5, gd: 1, pts: 6 },
      { rw: "RW 016", name: "Pesona Gading Cibitung", m: 3, w: 1, d: 0, l: 2, ga: 4, gf: 6, gd: -2, pts: 3 },
      { rw: "RW 025", name: "Graha Persada", m: 3, w: 1, d: 0, l: 2, ga: 3, gf: 5, gd: -2, pts: 3 },
    ]
  },
  {
    sport: "Bulu Tangkis Putri",
    group: "Grup A",
    teams: [
      { rw: "RW 016", name: "Pesona Gading Cibitung", m: 2, w: 2, d: 0, l: 0, ga: 6, gf: 2, gd: 4, pts: 6 },
      { rw: "RW 030", name: "Golden Cibitung", m: 2, w: 1, d: 0, l: 1, ga: 3, gf: 4, gd: -1, pts: 3 },
      { rw: "RW 022", name: "Kirana Cibitung", m: 2, w: 0, d: 0, l: 2, ga: 2, gf: 5, gd: -3, pts: 0 },
    ]
  },
  {
    sport: "Bulu Tangkis Putri",
    group: "Grup B",
    teams: [
      { rw: "RW 017", name: "Pesona Gading Cibitung", m: 3, w: 3, d: 0, l: 0, ga: 9, gf: 2, gd: 7, pts: 9 },
      { rw: "RW 013", name: "Vila Mutiara Jaya", m: 3, w: 2, d: 0, l: 1, ga: 6, gf: 4, gd: 2, pts: 6 },
      { rw: "RW 015", name: "Pesona Gading Cibitung", m: 3, w: 1, d: 0, l: 2, ga: 4, gf: 6, gd: -2, pts: 3 },
      { rw: "RW 025", name: "Graha Persada", m: 3, w: 0, d: 0, l: 3, ga: 1, gf: 9, gd: -8, pts: 0 },
    ]
  },
  {
    sport: "Tenis Meja",
    group: "Grup A",
    teams: [
      { rw: "RW 017", name: "Pesona Gading Cibitung", m: 3, w: 3, d: 0, l: 0, ga: 12, gf: 3, gd: 9, pts: 9 },
      { rw: "RW 013", name: "Vila Mutiara Jaya", m: 3, w: 2, d: 0, l: 1, ga: 9, gf: 7, gd: 2, pts: 6 },
      { rw: "RW 022", name: "Kirana Cibitung", m: 3, w: 1, d: 0, l: 2, ga: 6, gf: 9, gd: -3, pts: 3 },
      { rw: "RW 025", name: "Graha Persada", m: 3, w: 0, d: 0, l: 3, ga: 2, gf: 12, gd: -10, pts: 0 },
    ]
  },
  {
    sport: "Tenis Meja",
    group: "Grup B",
    teams: [
      { rw: "RW 015", name: "Pesona Gading Cibitung", m: 3, w: 3, d: 0, l: 0, ga: 11, gf: 4, gd: 7, pts: 9 },
      { rw: "RW 016", name: "Pesona Gading Cibitung", m: 3, w: 2, d: 0, l: 1, ga: 9, gf: 6, gd: 3, pts: 6 },
      { rw: "RW 021", name: "Griya Wanajaya Asri", m: 3, w: 1, d: 0, l: 2, ga: 6, gf: 9, gd: -3, pts: 3 },
      { rw: "RW 030", name: "Golden Cibitung", m: 3, w: 0, d: 0, l: 3, ga: 3, gf: 12, gd: -9, pts: 0 },
    ]
  },
  {
    sport: "Bola Voli Putri",
    group: "Round Robin",
    teams: [
      { rw: "RW 017", name: "Pesona Gading Cibitung", m: 4, w: 4, d: 0, l: 0, ga: 12, gf: 2, gd: 10, pts: 12 },
      { rw: "RW 013", name: "Vila Mutiara Jaya", m: 4, w: 3, d: 0, l: 1, ga: 10, gf: 5, gd: 5, pts: 9 },
      { rw: "RW 015", name: "Pesona Gading Cibitung", m: 4, w: 2, d: 0, l: 2, ga: 7, gf: 7, gd: 0, pts: 6 },
      { rw: "RW 021", name: "Griya Wanajaya Asri", m: 4, w: 1, d: 0, l: 3, ga: 4, gf: 10, gd: -6, pts: 3 },
      { rw: "RW 030", name: "Golden Cibitung", m: 4, w: 0, d: 0, l: 4, ga: 1, gf: 12, gd: -11, pts: 0 },
    ]
  },
  {
    sport: "Futsal Anak",
    group: "Round Robin (Eksebisi)",
    teams: [
      { rw: "RW 017", name: "Pesona Gading Cibitung", m: 4, w: 4, d: 0, l: 0, ga: 16, gf: 4, gd: 12, pts: 12 },
      { rw: "RW 013", name: "Vila Mutiara Jaya", m: 4, w: 3, d: 0, l: 1, ga: 13, gf: 7, gd: 6, pts: 9 },
      { rw: "RW 015", name: "Pesona Gading Cibitung", m: 4, w: 2, d: 0, l: 2, ga: 10, gf: 9, gd: 1, pts: 6 },
      { rw: "RW 016", name: "Pesona Gading Cibitung", m: 4, w: 1, d: 0, l: 3, ga: 6, gf: 12, gd: -6, pts: 3 },
      { rw: "RW 022", name: "Kirana Cibitung", m: 4, w: 0, d: 0, l: 4, ga: 3, gf: 16, gd: -13, pts: 0 },
    ]
  }
];

const INITIAL_MATCHES: Match[] = [
  { 
    id: "m1", 
    sport: "Futsal Anak", 
    category: "Grup A - Babak Penyisihan", 
    teamA: "RW 017", 
    teamB: "RW 013", 
    scoreA: 3, 
    scoreB: 2, 
    time: "15:30 WIB", 
    date: "10-07-2026", 
    status: "Selesai", 
    venue: "Sarana Olahraga RW 017",
    scorersA: "Rian (12'), Dimas (20', 35')",
    scorersB: "Bagas (15'), Rizky (28')"
  },
  { 
    id: "m2", 
    sport: "Bola Voli Putra", 
    category: "Penyisihan Grup", 
    teamA: "RW 015", 
    teamB: "RW 021", 
    scoreA: 2, 
    scoreB: 1, 
    time: "16:30 WIB", 
    date: "10-07-2026", 
    status: "Selesai", 
    venue: "Sarana Olahraga RW 017",
    setsVoli: { set1A: 25, set1B: 22, set2A: 20, set2B: 25, set3A: 15, set3B: 12 }
  },
  { 
    id: "m3", 
    sport: "Bulu Tangkis Putra", 
    category: "Babak 16 Besar", 
    teamA: "RW 022", 
    teamB: "RW 025", 
    scoreA: 2, 
    scoreB: 1, 
    time: "19:30 WIB", 
    date: "10-07-2026", 
    status: "Selesai", 
    venue: "GOR RW 017",
    badmintonDetails: { 
      g1A: 42, g1B: 38, 
      g2A: 35, g2B: 42, 
      g3A: 42, g3B: 39,
      players1A: "Budi & Joko", players1B: "Andi & Doni",
      players2A: "Rian & Tono", players2B: "Eko & Feri",
      players3A: "Dani & Yoga", players3B: "Hadi & Roni"
    }
  },
  { 
    id: "m4", 
    sport: "Tenis Meja", 
    category: "Perempat Final", 
    teamA: "RW 017", 
    teamB: "RW 030", 
    scoreA: 3, 
    scoreB: 1, 
    time: "15:00 WIB", 
    date: "11-07-2026", 
    status: "Akan Datang", 
    venue: "Aula RW 017"
  }
];

const INITIAL_GALLERY: GalleryItem[] = [
  { id: "g1", title: "Pembukaan PORDUS 2026", category: "Seremoni", url: "https://images.unsplash.com/photo-1517649763962-0c6232660102?auto=format&fit=crop&w=800&q=80", desc: "Suasana meriah pembukaan Pekan Olahraga Dusun II Desa Wanajaya dihadiri seluruh ketua RW." },
  { id: "g2", title: "Aksi Seru Futsal Anak RW 017 vs RW 013", category: "Futsal", url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80", desc: "Pertandingan penuh semangat dan sportif di kategori Futsal Anak." },
  { id: "g3", title: "Smash Keras Bola Voli Putra", category: "Voli", url: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80", desc: "Duel sengit tim voli putra memperbutkan tiket semifinal." },
  { id: "g4", title: "Konsentrasi Penuh Bulu Tangkis", category: "Bulu Tangkis", url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80", desc: "Atmosfer kompetitif di cabang olahraga bulu tangkis." },
  { id: "g5", title: "Dukungan Suporter RW 015", category: "Suporter", url: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=800&q=80", desc: "Warga antusias memberikan yel-yel dukungan untuk kebanggaan wilayah mereka." },
  { id: "g6", title: "Sinergi Panitia & Karang Taruna", category: "Panitia", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80", desc: "Panitia pelaksana memastikan seluruh rangkaian acara berjalan lancar dan sukses." }
];

export default function App() {
  // State with LocalStorage persistence
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('pordus_matches');
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  });

  const [standings, setStandings] = useState<Standing[]>(() => {
    const saved = localStorage.getItem('pordus_standings');
    return saved ? JSON.parse(saved) : INITIAL_STANDINGS;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('pordus_registrations');
    return saved ? JSON.parse(saved) : [];
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('pordus_gallery');
    return saved ? JSON.parse(saved) : INITIAL_GALLERY;
  });

  const [sportStandings, setSportStandings] = useState<SportStanding[]>(() => {
    const saved = localStorage.getItem('pordus_sport_standings');
    return saved ? JSON.parse(saved) : INITIAL_SPORT_STANDINGS;
  });

  const [selectedSportForStanding, setSelectedSportForStanding] = useState<string>("Bola Voli Putra");

  useEffect(() => {
    localStorage.setItem('pordus_sport_standings', JSON.stringify(sportStandings));
  }, [sportStandings]);

  useEffect(() => {
    setSportStandings(prev => {
      return prev.map(group => {
        let hasMatchData = false;
        const updatedTeams = group.teams.map(team => {
          let m = 0, w = 0, d = 0, l = 0, ga = 0, gf = 0, pts = 0;
          
          matches.forEach(match => {
            const isMatchForSport = match.sport.toLowerCase().trim() === group.sport.toLowerCase().trim();
            if (isMatchForSport && match.status === 'Selesai' && match.scoreA !== null && match.scoreB !== null) {
              if (match.teamA === team.rw) {
                hasMatchData = true;
                m += 1;
                const scoreFor = match.scoreA;
                const scoreAgainst = match.scoreB;
                ga += scoreFor;
                gf += scoreAgainst;
                if (scoreFor > scoreAgainst) {
                  w += 1;
                  pts += 3;
                } else if (scoreFor < scoreAgainst) {
                  l += 1;
                } else {
                  d += 1;
                  pts += 1;
                }
              } else if (match.teamB === team.rw) {
                hasMatchData = true;
                m += 1;
                const scoreFor = match.scoreB;
                const scoreAgainst = match.scoreA;
                ga += scoreFor;
                gf += scoreAgainst;
                if (scoreFor > scoreAgainst) {
                  w += 1;
                  pts += 3;
                } else if (scoreFor < scoreAgainst) {
                  l += 1;
                } else {
                  d += 1;
                  pts += 1;
                }
              }
            }
          });

          if (!hasMatchData && team.m > 0) {
            return team;
          }

          const gd = ga - gf;
          return {
            ...team,
            m,
            w,
            d,
            l,
            ga,
            gf,
            gd,
            pts
          };
        });

        updatedTeams.sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.ga - a.ga;
        });

        return {
          ...group,
          teams: updatedTeams
        };
      });
    });
  }, [matches]);

  // UI States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTabSchedule, setActiveTabSchedule] = useState<string>('Semua');
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<GalleryItem | null>(null);
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    nama: '',
    rw: 'RW 017 - Pesona Gading Cibitung',
    sport: 'Futsal Anak',
    kategori: 'Tim Utama',
    phone: ''
  });
  const [regSuccess, setRegSuccess] = useState(false);

  // Admin Modal State
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminTab, setAdminTab] = useState<'matches' | 'standings' | 'registrations'>('matches');
  const [pinError, setPinError] = useState(false);

  // New Match Form State (Format: Tanggal | Jam | Cabor | Tim A | Tim B | Keterangan)
  const [newMatch, setNewMatch] = useState({
    date: '12-07-2026',
    time: '15:00 WIB',
    sport: 'Futsal Anak',
    teamA: '',
    teamB: '',
    category: 'Penyisihan Grup',
    venue: 'Sarana Olahraga RW 017'
  });

  // Detailed Result Editor State for Admin
  const [activeResultMatchId, setActiveResultMatchId] = useState<string | null>(null);
  const [resultForm, setResultForm] = useState({
    scoreA: 0,
    scoreB: 0,
    status: 'Selesai' as 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai',
    scorersA: '',
    scorersB: '',
    // Voli sets
    set1A: 25, set1B: 20,
    set2A: 20, set2B: 25,
    set3A: 15, set3B: 10,
    // Badminton Ganda 1, Ganda 2, Ganda 3 (Max 42) & Players
    g1A: 42, g1B: 35,
    g2A: 38, g2B: 42,
    g3A: 42, g3B: 40,
    players1A: '', players1B: '',
    players2A: '', players2B: '',
    players3A: '', players3B: ''
  });

  useEffect(() => {
    localStorage.setItem('pordus_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('pordus_standings', JSON.stringify(standings));
  }, [standings]);

  useEffect(() => {
    localStorage.setItem('pordus_registrations', JSON.stringify(registrations));
  }, [registrations]);

  // Export to Spreadsheet CSV function
  const exportToSpreadsheet = (type: 'registrations' | 'matches' | 'standings') => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (type === 'registrations') {
      csvContent += "ID,Nama Tim,Asal RW,Cabang,Kategori,No HP,Tanggal Pendaftaran\n";
      registrations.forEach(r => {
        csvContent += `"${r.id}","${r.nama}","${r.rw}","${r.sport}","${r.kategori}","${r.phone}","${r.date}"\n`;
      });
    } else if (type === 'matches') {
      csvContent += "Tanggal|Jam|Cabor|Tim A|Tim B|Keterangan|Skor A|Skor B|Status|Venue\n";
      matches.forEach(m => {
        csvContent += `"${m.date}"|"${m.time}"|"${m.sport}"|"${m.teamA}"|"${m.teamB}"|"${m.category}"|"${m.scoreA ?? ''}"|"${m.scoreB ?? ''}"|"${m.status}"|"${m.venue}"\n`;
      });
    } else if (type === 'standings') {
      csvContent += "RW,Nama Wilayah,Emas,Perak,Perunggu,Total Poin\n";
      standings.forEach(s => {
        csvContent += `"${s.rw}","${s.name}","${s.gold}","${s.silver}","${s.bronze}","${s.points}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pordus_dusun2_${type}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Registration Submit
  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.nama || !regForm.phone) return;

    const newReg: Registration = {
      id: 'reg-' + Date.now(),
      ...regForm,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
    };

    const updated = [newReg, ...registrations];
    setRegistrations(updated);
    setRegSuccess(true);

    const waMessage = `Halo Panitia PORDUS Dusun II Wanajaya,%0A%0ASaya mendaftarkan peserta baru:%0A- Nama/Tim: *${regForm.nama}*%0A- Asal RW: *${regForm.rw}*%0A- Cabang: *${regForm.sport}*%0A- Kategori: *${regForm.kategori}*%0A- No HP: ${regForm.phone}%0A%0AMohon konfirmasinya. Terima kasih!`;
    
    setTimeout(() => {
      window.open(`https://wa.me/6281234567890?text=${waMessage}`, '_blank');
    }, 1200);

    setRegForm({
      nama: '',
      rw: 'RW 017 - Pesona Gading Cibitung',
      sport: 'Futsal Anak',
      kategori: 'Tim Utama',
      phone: ''
    });

    setTimeout(() => setRegSuccess(false), 5000);
  };

  // Admin Authentication
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'wanajaya2026') {
      setIsAdminAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Add Match following format: Tanggal | Jam | Cabor | Tim A | Tim B | Keterangan
  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.teamA || !newMatch.teamB || !newMatch.date || !newMatch.time) return;
    
    const matchObj: Match = {
      id: 'm-' + Date.now(),
      sport: newMatch.sport,
      category: newMatch.category,
      teamA: newMatch.teamA,
      teamB: newMatch.teamB,
      scoreA: null,
      scoreB: null,
      time: newMatch.time,
      date: newMatch.date,
      status: 'Akan Datang',
      venue: newMatch.venue
    };

    setMatches([matchObj, ...matches]);
    setNewMatch({
      date: '12-07-2026',
      time: '15:00 WIB',
      sport: 'Futsal Anak',
      teamA: '',
      teamB: '',
      category: 'Penyisihan Grup',
      venue: 'Sarana Olahraga RW 017'
    });
  };

  const handleDeleteMatch = (matchId: string) => {
    setMatches(matches.filter(m => m.id !== matchId));
  };

  const handleSaveDetailedResult = (matchId: string) => {
    setMatches(matches.map(m => {
      if (m.id === matchId) {
        let updated: Match = {
          ...m,
          scoreA: resultForm.scoreA,
          scoreB: resultForm.scoreB,
          status: resultForm.status
        };

        if (m.sport.includes('Futsal')) {
          updated.scorersA = resultForm.scorersA;
          updated.scorersB = resultForm.scorersB;
        } else if (m.sport.includes('Voli')) {
          updated.setsVoli = {
            set1A: resultForm.set1A, set1B: resultForm.set1B,
            set2A: resultForm.set2A, set2B: resultForm.set2B,
            set3A: resultForm.set3A, set3B: resultForm.set3B
          };
        } else if (m.sport.includes('Bulu Tangkis')) {
          updated.badmintonDetails = {
            g1A: resultForm.g1A, g1B: resultForm.g1B,
            g2A: resultForm.g2A, g2B: resultForm.g2B,
            g3A: resultForm.g3A, g3B: resultForm.g3B,
            players1A: resultForm.players1A, players1B: resultForm.players1B,
            players2A: resultForm.players2A, players2B: resultForm.players2B,
            players3A: resultForm.players3A, players3B: resultForm.players3B
          };
        }
        return updated;
      }
      return m;
    }));
    setActiveResultMatchId(null);
  };

  const handleDeleteReg = (id: string) => {
    setRegistrations(registrations.filter(r => r.id !== id));
  };

  const handleUpdateMedal = (rwCode: string, field: 'gold' | 'silver' | 'bronze', delta: number) => {
    setStandings(standings.map(s => {
      if (s.rw === rwCode) {
        const val = Math.max(0, s[field] + delta);
        const newObj = { ...s, [field]: val };
        newObj.points = (newObj.gold * 3) + (newObj.silver * 2) + (newObj.bronze * 1);
        return newObj;
      }
      return s;
    }).sort((a, b) => b.points - a.points || b.gold - a.gold));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden">
      
      {/* 1. STICKY NAVBAR */}
      <header className="sticky top-0 z-50 glass-panel border-b border-blue-900/30 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs font-semibold tracking-wider text-blue-400 uppercase leading-tight">PORDUS 2026</div>
              <div className="text-sm sm:text-lg font-bold text-white tracking-tight leading-tight whitespace-nowrap">Dusun II Wanajaya</div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-slate-300">
            <a href="#beranda" className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Beranda</a>
            <a href="#tentang" className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Tentang</a>
            <a href="#peraturan" className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Peraturan</a>
            <a href="#cabor" className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Cabang Lomba</a>
            <a href="#jadwal" className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Jadwal</a>
            <a href="#klasemen" className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Klasemen</a>
            <a href="#galeri" className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Galeri</a>
            <a href="#pendaftaran" className="hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Pendaftaran</a>
          </nav>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Panel</span>
            </button>
            <a 
              href="#pendaftaran" 
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:scale-[1.02] transition-all whitespace-nowrap shrink-0"
            >
              Daftar Tim
            </a>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-transform"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-16 sm:top-20 left-0 w-full max-h-[calc(100vh-4rem)] overflow-y-auto bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl px-5 py-4 flex flex-col gap-1 shadow-2xl">
            <a href="#beranda" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-blue-400 min-h-[44px] flex items-center border-b border-slate-900">Beranda</a>
            <a href="#tentang" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-blue-400 min-h-[44px] flex items-center border-b border-slate-900">Tentang Acara</a>
            <a href="#peraturan" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-blue-400 min-h-[44px] flex items-center border-b border-slate-900">Peraturan & Juknis</a>
            <a href="#cabor" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-blue-400 min-h-[44px] flex items-center border-b border-slate-900">Cabang Lomba & Grup</a>
            <a href="#jadwal" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-blue-400 min-h-[44px] flex items-center border-b border-slate-900">Jadwal & Hasil</a>
            <a href="#klasemen" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-blue-400 min-h-[44px] flex items-center border-b border-slate-900">Klasemen Cabor</a>
            <a href="#galeri" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-blue-400 min-h-[44px] flex items-center border-b border-slate-900">Galeri Foto</a>
            <a href="#pendaftaran" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-200 hover:text-blue-400 min-h-[44px] flex items-center border-b border-slate-900">Form Pendaftaran</a>
            <div className="grid grid-cols-2 gap-3 pt-3 pb-1">
              <button 
                onClick={() => { setIsAdminOpen(true); setMobileMenuOpen(false); }}
                className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
              >
                <Lock className="w-4 h-4 text-blue-400" />
                <span>Admin Panel</span>
              </button>
              <a 
                href="#pendaftaran"
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-blue-600/25"
              >
                Daftar Tim
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="beranda" className="relative overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-5 sm:mb-6">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Turnamen Olahraga Antar-RW Se-Dusun II</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.12] mb-4 sm:mb-6 text-balance">
                Pekan Olahraga Dusun <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
                  (PORDUS) Wanajaya
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-7 sm:mb-8 leading-relaxed">
                Ajang sportivitas, mempererat silaturahmi, dan mencari bibit atlet unggul antar RW di Dusun II Desa Wanajaya. Siapakah yang akan keluar sebagai juara umum tahun 2026?
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-9 sm:mb-12">
                <a 
                  href="#jadwal" 
                  className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:scale-[1.02] transition-all"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Lihat Jadwal Pertandingan</span>
                </a>
                <a 
                  href="#peraturan" 
                  className="w-full sm:w-auto min-h-[48px] flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-white font-semibold text-sm transition-all"
                >
                  <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Ringkasan Peraturan</span>
                </a>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 sm:pt-8 border-t border-slate-800/80">
                <div className="text-center lg:text-left">
                  <div className="text-xl sm:text-3xl font-extrabold text-white tabular-nums">8 RW</div>
                  <div className="text-[11px] sm:text-sm text-slate-400">Peserta Resmi</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-xl sm:text-3xl font-extrabold text-blue-400 tabular-nums">6 Cabor</div>
                  <div className="text-[11px] sm:text-sm text-slate-400">Cabang Lomba</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-xl sm:text-3xl font-extrabold text-indigo-400 tabular-nums">RW 017</div>
                  <div className="text-[11px] sm:text-sm text-slate-400">Tuan Rumah</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-40 animate-pulse"></div>
                <div className="relative glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-blue-500/20 shadow-2xl">
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-5 sm:mb-6">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] sm:text-xs text-slate-400">Lokasi Utama</div>
                        <div className="text-xs sm:text-sm font-bold text-white">Sarana Olahraga RW 017</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] sm:text-xs font-semibold border border-emerald-500/20">
                      Berlangsung
                    </span>
                  </div>

                  <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 mb-5 sm:mb-6">
                    <div className="flex flex-wrap justify-between items-center gap-1 text-[11px] sm:text-xs text-slate-400 mb-3">
                      <span>Futsal Anak • Grup A</span>
                      <span className="text-blue-400 font-medium">10-07-2026, 15:30 WIB</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-sm sm:text-base mb-2 gap-2">
                      <span className="text-white flex items-center gap-1.5 sm:gap-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                        RW 017
                      </span>
                      <span className="px-2.5 sm:px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 text-base sm:text-lg font-mono tabular-nums shrink-0">3 - 2</span>
                      <span className="text-slate-300 truncate">RW 013</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                      ⚽ Pencetak Gol: Dimas (20', 35'), Rian (12')
                    </div>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">RW Partisipan Dusun II:</div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {INITIAL_RW_LIST.map((rw, idx) => (
                        <span key={idx} className="text-[11px] sm:text-xs px-2.5 py-1 rounded-lg border bg-slate-900 border-slate-800 text-slate-300">
                          {rw.rw}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. TENTANG ACARA */}
      <section id="tentang" className="py-12 sm:py-20 bg-slate-900/50 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 sm:mb-3">Tentang PORDUS 2026</h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 sm:mb-6 text-balance">Membangun Sportivitas & Keakraban Warga Wanajaya</h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Pekan Olahraga Dusun (PORDUS) Dusun II Desa Wanajaya merupakan agenda turnamen multi-cabang olahraga bergengsi yang mempertemukan warga dari 8 RW di lingkungan Dusun II. Bertindak sebagai tuan rumah di RW 017 Pesona Gading Cibitung, event ini bertujuan untuk mempererat tali silaturahmi, menumbuhkan semangat sportivitas generasi muda, dan melahirkan atlet-atlet potensial tingkat desa.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800/80 text-center hover:border-blue-500/40 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-1 tabular-nums">8 RW</div>
              <div className="text-[11px] sm:text-xs text-slate-400">Wilayah Peserta Resmi</div>
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800/80 text-center hover:border-blue-500/40 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-1 tabular-nums">6 Cabor</div>
              <div className="text-[11px] sm:text-xs text-slate-400">Cabang Olahraga Dipertandingkan</div>
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800/80 text-center hover:border-blue-500/40 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-600/10 text-cyan-400 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-1 tabular-nums">120+</div>
              <div className="text-[11px] sm:text-xs text-slate-400">Atlet & Official Terdaftar</div>
            </div>

            <div className="glass-card p-4 sm:p-6 rounded-2xl border border-slate-800/80 text-center hover:border-blue-500/40 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-600/10 text-amber-400 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-1 tabular-nums">7 Hari</div>
              <div className="text-[11px] sm:text-xs text-slate-400">Durasi Penuh Keseruan</div>
            </div>
          </div>

          <div className="mt-10 sm:mt-16">
            <h4 className="text-center text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 sm:mb-8">Daftar RW Peserta Dusun II Wanajaya</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {INITIAL_RW_LIST.map((rw, index) => (
                <div key={index} className="p-3 sm:p-4 rounded-xl border bg-slate-900/60 border-slate-800/80 flex flex-col items-center text-center">
                  {rw.logo && (
                    <img src={rw.logo} alt={rw.rw} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-blue-500/40 mb-2.5 sm:mb-3 shadow-md bg-slate-950 p-0.5" />
                  )}
                  <span className="text-xs font-bold text-blue-400 mb-0.5 sm:mb-1">{rw.rw}</span>
                  <div className="text-xs sm:text-sm font-medium text-slate-200 leading-snug">{rw.name}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* NEW SECTION: RINGKASAN PERATURAN & JUKNIS (DARI PDF) */}
      <section id="peraturan" className="py-12 sm:py-20 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 sm:mb-3">Panduan Teknis Resmi</h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-4 text-balance">Ringkasan Peraturan PORDUS II 2026</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Berdasarkan dokumen panduan teknis resmi Komite Olahraga Dusun II Wanajaya.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Card 1: Ketentuan Umum & Peserta */}
            <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Ketentuan Peserta & Umum</h4>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>• Warga resmi berdomisili di wilayah RW masing-masing Dusun II Wanajaya.</li>
                <li>• Melampirkan identitas (KTP / KK / Kartu Pelajar / Surat Domisili RW).</li>
                <li>• Maksimal kuota peserta tiap cabang adalah 12 atlet + 2 ofisial.</li>
                <li>• Menjunjung tinggi asas kebersamaan, kejujuran, dan sportivitas.</li>
              </ul>
            </div>

            {/* Card 2: Pelaksanaan & Kedisiplinan */}
            <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Jadwal & Kedisiplinan (WO)</h4>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>• Peserta wajib hadir paling lambat 15 menit sebelum pertandingan dimulai.</li>
                <li>• Toleransi keterlambatan maksimal 10 menit setelah dipanggil 3 kali oleh panitia (dinyatakan WO/kalah tanpa bertanding).</li>
                <li>• Keputusan wasit & juri mengenai kejadian faktual wajib dihormati.</li>
              </ul>
            </div>

            {/* Card 3: Bulu Tangkis */}
            <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Aturan Bulu Tangkis</h4>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>• Format beregu menurunkan 3 pasang pemain ganda.</li>
                <li>• Sistem skor menggunakan <b>rally point 42 poin</b> tanpa deuce.</li>
                <li>• Pertukaran tempat dilakukan pada saat mencapai poin 21.</li>
              </ul>
            </div>

            {/* Card 4: Bola Voli */}
            <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Aturan Bola Voli</h4>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>• Menggunakan sistem rally point.</li>
                <li>• Set pertama dan kedua dimainkan sampai <b>25 poin</b>.</li>
                <li>• Set penentuan (set ketiga) dimainkan sampai <b>15 poin</b>.</li>
              </ul>
            </div>

            {/* Card 5: Tenis Meja */}
            <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Aturan Tenis Meja</h4>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>• Setiap tim terdiri dari 2 pemain tunggal dan 3 pasang ganda.</li>
                <li>• Susunan partai: Ganda 1 - Tunggal 1 - Ganda 2 - Tunggal 2 - Ganda 3 (Pemain tidak boleh main 2x).</li>
                <li>• Format 3 kemenangan per partai (1 gim 11 poin).</li>
              </ul>
            </div>

            {/* Card 6: Sistem Klasemen & Poin */}
            <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-3 sm:space-y-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                6
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Sistem Poin & Klasemen</h4>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>• Menang: <b>3 Poin</b> | Kalah: <b>0 Poin</b>.</li>
                <li>• Penentuan Peringkat: Jumlah poin tertinggi &rarr; Jumlah set kemenangan tertinggi &rarr; Jumlah skor tertinggi.</li>
                <li>• Sanksi tegas berlaku untuk pemalsuan identitas, kericuhan, atau pelanggaran disiplin.</li>
              </ul>
            </div>

          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <a 
              href="/public/assets/aistudio/Peraturan_dan_petunjuk_teknis_PORDUS_II_Wanajaya_dda23dce.pdf" 
              download
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-blue-400 hover:text-white transition-all shadow-md"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Download Dokumen Resmi Juknis PDF</span>
            </a>
          </div>

        </div>
      </section>

      {/* 4. CABANG LOMBA */}
      <section id="cabor" className="py-12 sm:py-20 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 sm:mb-3">Kompetisi Olahraga</h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-4 text-balance">Cabang Lomba PORDUS 2026</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Berbagai cabang olahraga yang dipertandingkan untuk memperebutkan piala bergilir Dusun II Wanajaya.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {INITIAL_SPORTS.map((sport, index) => (
              <div key={index} className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 hover:border-blue-500/50 transition-all group sm:hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="text-3xl sm:text-4xl p-2.5 sm:p-3 rounded-2xl bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform">
                      {sport.icon}
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      {sport.quota}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-2">{sport.name}</h4>
                  <p className="text-slate-300 text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed">{sport.desc}</p>
                </div>
                <a 
                  href="#pendaftaran" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors min-h-[36px]"
                >
                  <span>Daftar Cabang Ini</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          {/* Pembagian Grup & Format Cabang Olahraga (Di bawah Cabang Lomba PORDUS) */}
          <div className="mt-12 sm:mt-16 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-8 shadow-xl">
            <h4 className="text-xl sm:text-2xl font-extrabold text-white mb-2 text-center text-balance">Pembagian Grup & Format Cabang Olahraga</h4>
            <p className="text-center text-slate-400 text-xs mb-6 sm:mb-8">Distribusi peserta grup babak penyisihan dan aturan khusus cabor PORDUS II Wanajaya.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between hover:border-blue-500/40 transition-all">
                <div>
                  <div className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                    <span>🏐</span> Bola Voli Putra
                  </div>
                  <div className="space-y-2.5 sm:space-y-3 text-xs text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="font-bold text-blue-300 mb-1">Grup A</div>
                      <div className="text-slate-300 font-mono text-[11px] sm:text-xs leading-relaxed">RW 013, RW 016, RW 025, RW 030</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="font-bold text-blue-300 mb-1">Grup B</div>
                      <div className="text-slate-300 font-mono text-[11px] sm:text-xs leading-relaxed">RW 015, RW 017, RW 021, RW 022</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
                <div>
                  <div className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                    <span>🏸</span> Bulu Tangkis Putra
                  </div>
                  <div className="space-y-2.5 sm:space-y-3 text-xs text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="font-bold text-cyan-300 mb-1">Grup A</div>
                      <div className="text-slate-300 font-mono text-[11px] sm:text-xs leading-relaxed">RW 013, RW 017, RW 030</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="font-bold text-cyan-300 mb-1">Grup B</div>
                      <div className="text-slate-300 font-mono text-[11px] sm:text-xs leading-relaxed">RW 015, RW 016, RW 022, RW 025</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                <div>
                  <div className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
                    <span>🏸</span> Bulu Tangkis Putri
                  </div>
                  <div className="space-y-2.5 sm:space-y-3 text-xs text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="font-bold text-indigo-300 mb-1">Grup A</div>
                      <div className="text-slate-300 font-mono text-[11px] sm:text-xs leading-relaxed">RW 016, RW 022, RW 030</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="font-bold text-indigo-300 mb-1">Grup B</div>
                      <div className="text-slate-300 font-mono text-[11px] sm:text-xs leading-relaxed">RW 013, RW 015, RW 017, RW 025</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                <div>
                  <div className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <span>🏓</span> Tenis Meja
                  </div>
                  <div className="space-y-2.5 sm:space-y-3 text-xs text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="font-bold text-emerald-300 mb-1">Grup A</div>
                      <div className="text-slate-300 font-mono text-[11px] sm:text-xs leading-relaxed">RW 013, RW 017, RW 022, RW 025</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60">
                      <div className="font-bold text-emerald-300 mb-1">Grup B</div>
                      <div className="text-slate-300 font-mono text-[11px] sm:text-xs leading-relaxed">RW 015, RW 016, RW 021, RW 030</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs text-slate-300">
              <div className="p-3.5 sm:p-4 rounded-xl bg-blue-950/20 border border-blue-900/30 flex items-start gap-3">
                <span className="text-lg shrink-0">🏐</span>
                <div>
                  <span className="font-bold text-blue-400 block mb-1">Bola Voli Putri & Futsal Anak</span>
                  Memakai sistem <b>round robin</b> penuh tanpa pembagian grup. Juara ditentukan dari peringkat akhir klasemen.
                </div>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl bg-amber-950/20 border border-amber-900/30 flex items-start gap-3">
                <span className="text-lg shrink-0">⚽</span>
                <div>
                  <span className="font-bold text-amber-400 block mb-1">Catatan Futsal Anak (Eksebisi)</span>
                  Juara Futsal <b>tidak masuk hitungan</b> perolehan medali / juara umum karena bersifat eksebisi.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. JADWAL & HASIL PERTANDINGAN */}
      <section id="jadwal" className="py-12 sm:py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-5 sm:gap-6">
            <div>
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 sm:mb-3">Agenda & Skor</h2>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white">Jadwal & Hasil Pertandingan</h3>
            </div>

            <div className="flex overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap gap-2">
              {['Semua', 'Futsal Anak', 'Bola Voli Putra', 'Bola Voli Putri', 'Bulu Tangkis Putra', 'Bulu Tangkis Putri', 'Tenis Meja'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTabSchedule(tab)}
                  className={`px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${activeTabSchedule === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {matches
              .filter(m => activeTabSchedule === 'Semua' || m.sport === activeTabSchedule)
              .map((match) => (
                <div key={match.id} className="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] sm:text-xs font-bold text-blue-400 bg-blue-600/10 px-2.5 sm:px-3 py-1 rounded-full border border-blue-500/20 truncate">
                        {match.sport}
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${match.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : match.status === 'Sedang Berlangsung' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                        {match.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mb-3 sm:mb-4 font-medium">
                      📌 {match.category}
                    </div>

                    <div className="space-y-2.5 sm:space-y-3 my-3 sm:my-4">
                      <div className="flex items-center justify-between text-sm sm:text-base font-bold gap-2">
                        <span className="text-slate-200 truncate pr-2">{match.teamA}</span>
                        <span className="px-3 py-1 rounded-lg bg-slate-900 text-blue-400 font-mono tabular-nums text-sm sm:text-base border border-slate-800 shrink-0">
                          {match.scoreA !== null ? match.scoreA : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm sm:text-base font-bold gap-2">
                        <span className="text-slate-200 truncate pr-2">{match.teamB}</span>
                        <span className="px-3 py-1 rounded-lg bg-slate-900 text-blue-400 font-mono tabular-nums text-sm sm:text-base border border-slate-800 shrink-0">
                          {match.scoreB !== null ? match.scoreB : '-'}
                        </span>
                      </div>
                    </div>

                    {match.sport.includes('Futsal') && (match.scorersA || match.scorersB) && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                        {match.scorersA && <div>⚽ <b>{match.teamA}:</b> {match.scorersA}</div>}
                        {match.scorersB && <div>⚽ <b>{match.teamB}:</b> {match.scorersB}</div>}
                      </div>
                    )}

                    {match.sport.includes('Voli') && match.setsVoli && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] sm:text-[11px] text-slate-300">
                        <div className="font-semibold text-blue-400 mb-1.5">Detail Set Voli:</div>
                        <div className="grid grid-cols-3 gap-1.5 text-center font-mono tabular-nums">
                          <div className="bg-slate-950 p-1.5 rounded">Set 1: {match.setsVoli.set1A}-{match.setsVoli.set1B}</div>
                          <div className="bg-slate-950 p-1.5 rounded">Set 2: {match.setsVoli.set2A}-{match.setsVoli.set2B}</div>
                          <div className="bg-slate-950 p-1.5 rounded">Set 3: {match.setsVoli.set3A}-{match.setsVoli.set3B}</div>
                        </div>
                      </div>
                    )}

                    {match.sport.includes('Bulu Tangkis') && match.badmintonDetails && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-2">
                        <div className="font-semibold text-blue-400">Detail Bulu Tangkis (Max 42):</div>
                        <div className="space-y-2">
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-200 mb-1">
                              <span>Ganda 1</span>
                              <span className="font-mono tabular-nums text-blue-400">{match.badmintonDetails.g1A} - {match.badmintonDetails.g1B}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-start gap-1.5 leading-snug">
                              <User className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                              <span className="break-words">{match.teamA}: {match.badmintonDetails.players1A || '-'} vs {match.teamB}: {match.badmintonDetails.players1B || '-'}</span>
                            </div>
                          </div>

                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-200 mb-1">
                              <span>Ganda 2</span>
                              <span className="font-mono tabular-nums text-blue-400">{match.badmintonDetails.g2A} - {match.badmintonDetails.g2B}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-start gap-1.5 leading-snug">
                              <User className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                              <span className="break-words">{match.teamA}: {match.badmintonDetails.players2A || '-'} vs {match.teamB}: {match.badmintonDetails.players2B || '-'}</span>
                            </div>
                          </div>

                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-200 mb-1">
                              <span>Ganda 3</span>
                              <span className="font-mono tabular-nums text-blue-400">{match.badmintonDetails.g3A} - {match.badmintonDetails.g3B}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-start gap-1.5 leading-snug">
                              <User className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                              <span className="break-words">{match.teamA}: {match.badmintonDetails.players3A || '-'} vs {match.teamB}: {match.badmintonDetails.players3B || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3.5 mt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{match.date}, {match.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate max-w-[140px] sm:max-w-[150px]">{match.venue}</span>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. KLASEMEN PER CABANG OLAHRAGA */}
      <section id="klasemen" className="py-12 sm:py-20 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Klasemen Per Cabor */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 sm:mb-3">Statistik Turnamen</h2>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 text-balance">Klasemen Per Cabang Olahraga</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Pilih cabang olahraga di bawah untuk melihat posisi, perolehan partai (GA, GF, GD), dan statistik grup masing-masing RW.</p>
            </div>

            {/* Sport Selector Tabs (Swipeable on mobile) */}
            <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:justify-center gap-2 mb-6 sm:mb-8">
              {['Bola Voli Putra', 'Bulu Tangkis Putra', 'Bulu Tangkis Putri', 'Tenis Meja', 'Bola Voli Putri', 'Futsal Anak'].map((sportName) => (
                <button
                  key={sportName}
                  onClick={() => setSelectedSportForStanding(sportName)}
                  className={`px-3.5 sm:px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${selectedSportForStanding === sportName ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'}`}
                >
                  {sportName}
                </button>
              ))}
            </div>

            <div className="sm:hidden text-center text-[11px] text-slate-400 mb-3">
              Geser tabel ke samping untuk melihat detail lengkap &rarr;
            </div>

            {/* Sport Standings Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {sportStandings
                .filter(s => s.sport === selectedSportForStanding)
                .map((groupStanding, gIdx) => (
                  <div key={gIdx} className="glass-card rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                    <div className="bg-slate-900/90 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                        {groupStanding.sport} - {groupStanding.group}
                      </span>
                      {groupStanding.sport === 'Futsal Anak' && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                          Eksebisi (Non-Medali)
                        </span>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] text-left border-collapse tabular-nums">
                        <thead>
                          <tr className="bg-slate-950/50 text-slate-400 text-[10px] sm:text-[11px] uppercase tracking-wider border-b border-slate-800/80">
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 font-semibold text-center w-10">Pos</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 font-semibold">Wilayah RW</th>
                            <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-semibold w-9" title="Main">M</th>
                            <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-semibold w-9" title="Menang">W</th>
                            <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-semibold w-9" title="Seri">D</th>
                            <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-semibold w-9" title="Kalah">L</th>
                            <th className="py-2.5 sm:py-3 px-2 sm:px-3 text-center font-semibold w-10 text-emerald-400" title="GA (Jumlah Kemenangan Partai)">GA</th>
                            <th className="py-2.5 sm:py-3 px-2 sm:px-3 font-semibold text-center w-10 text-rose-400" title="GF (Jumlah Kalah Partai)">GF</th>
                            <th className="py-2.5 sm:py-3 px-2 sm:px-3 font-semibold text-center w-11 text-cyan-400" title="GD (Selisih GA-GF)">GD</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center font-bold text-blue-400 w-12" title="Poin">Pts</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-xs">
                          {groupStanding.teams.map((team, tIdx) => (
                            <tr key={tIdx} className={`hover:bg-slate-900/50 transition-colors ${tIdx === 0 ? 'bg-blue-600/10 font-medium' : ''}`}>
                              <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center font-bold">
                                <span className={`w-6 h-6 rounded-md inline-flex items-center justify-center text-[10px] ${tIdx === 0 ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                                  {tIdx + 1}
                                </span>
                              </td>
                              <td className="py-2.5 sm:py-3 px-2.5 sm:px-3">
                                <div className="font-bold text-white whitespace-nowrap">{team.rw}</div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[115px] sm:max-w-[135px]">{team.name}</div>
                              </td>
                              <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center text-slate-300 font-mono">{team.m}</td>
                              <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center text-emerald-400 font-mono font-bold">{team.w}</td>
                              <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center text-amber-400 font-mono">{team.d}</td>
                              <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center text-rose-400 font-mono">{team.l}</td>
                              <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center text-emerald-300 font-mono font-semibold">{team.ga}</td>
                              <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center text-rose-300 font-mono font-semibold">{team.gf}</td>
                              <td className={`py-2.5 sm:py-3 px-2 sm:px-3 text-center font-mono font-bold ${team.gd > 0 ? 'text-cyan-400' : team.gd < 0 ? 'text-rose-400' : 'text-slate-400'}`}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                              <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center font-black text-blue-400 font-mono text-sm">{team.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-5 text-center text-[11px] text-slate-400 leading-relaxed">
              Keterangan: <b>M</b> Main · <b>W</b> Menang · <b>D</b> Seri · <b>L</b> Kalah · <b>GA</b> Menang Partai · <b>GF</b> Kalah Partai · <b>GD</b> Selisih (GA-GF) · <b>Pts</b> Poin
            </div>
          </div>

        </div>
      </section>

      {/* 7. GALERI FOTO */}
      <section id="galeri" className="py-12 sm:py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 sm:mb-3">Dokumentasi</h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-4">Galeri Momen Keseruan</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Potret kebersamaan, aksi pertandingan, dan kemeriahan suporter di ajang PORDUS Dusun II Wanajaya.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {gallery.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedGalleryImg(item)}
                className="group relative rounded-2xl overflow-hidden glass-card border border-slate-800 cursor-pointer hover:border-blue-500/50 transition-all"
              >
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={item.url} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                  
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-blue-400 border border-blue-500/30">
                    {item.category}
                  </span>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/50 backdrop-blur-xs">
                    <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                      <Eye className="w-4 h-4" /> Perbesar Foto
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <h4 className="text-sm sm:text-base font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {selectedGalleryImg && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4">
          <div className="relative max-w-4xl w-full glass-card rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800">
            <button 
              onClick={() => setSelectedGalleryImg(null)}
              aria-label="Tutup Foto"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-slate-900/90 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="aspect-video w-full">
              <img src={selectedGalleryImg.url} alt={selectedGalleryImg.title} className="w-full h-full object-contain bg-slate-950" />
            </div>
            <div className="p-4 sm:p-6">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{selectedGalleryImg.category}</span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1 mb-2">{selectedGalleryImg.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300">{selectedGalleryImg.desc}</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. KONTAK & PENDAFTARAN */}
      <section id="pendaftaran" className="py-12 sm:py-20 bg-slate-900/40 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 sm:mb-3">Pendaftaran & Sekretariat</h2>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-4 text-balance">Daftarkan Tim RW Anda Sekarang!</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Batas akhir pendaftaran tim selambat-lambatnya 3 hari sebelum jadwal pertandingan cabang dimulai. Pastikan data perwakilan dan nomor WhatsApp aktif.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 flex items-center gap-3.5 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs text-slate-400">Lokasi Sekretariat Panitia</div>
                    <div className="text-xs sm:text-sm font-bold text-white">Sarana Olahraga RW 017 Pesona Gading Cibitung</div>
                  </div>
                </div>

                <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 flex items-center gap-3.5 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs text-slate-400">Narahubung Panitia (WhatsApp)</div>
                    <div className="text-xs sm:text-sm font-bold text-white">0812-3456-7890 (Bpk. Ahmad Fauzi)</div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/30">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                  Catatan Penting Pendaftaran
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Setiap peserta wajib membawa kartu identitas (KTP/KIA) warga Dusun II Desa Wanajaya pada saat technical meeting dan daftar ulang di lokasi pertandingan.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-800 shadow-2xl">
                <h4 className="text-lg sm:text-xl font-bold text-white mb-5 sm:mb-6">Formulir Pendaftaran Tim / Atlet</h4>

                {regSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-bold">Pendaftaran Berhasil Dikirim!</div>
                      <div className="text-xs text-emerald-300/80">WhatsApp panitia akan otomatis terbuka untuk konfirmasi.</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegSubmit} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nama Tim / Nama Perwakilan</label>
                    <input 
                      type="text" 
                      required
                      value={regForm.nama}
                      onChange={(e) => setRegForm({...regForm, nama: e.target.value})}
                      placeholder="Contoh: FC Garuda RW 017"
                      className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-base sm:text-sm transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Asal RW Dusun II</label>
                      <select 
                        value={regForm.rw}
                        onChange={(e) => setRegForm({...regForm, rw: e.target.value})}
                        className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-blue-500 focus:outline-none text-base sm:text-sm transition-all"
                      >
                        {INITIAL_RW_LIST.map((r, i) => (
                          <option key={i} value={`${r.rw} - ${r.name}`}>{r.rw} - {r.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Cabang Lomba</label>
                      <select 
                        value={regForm.sport}
                        onChange={(e) => setRegForm({...regForm, sport: e.target.value})}
                        className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-blue-500 focus:outline-none text-base sm:text-sm transition-all"
                      >
                        <option value="Futsal Anak">Futsal Anak</option>
                        <option value="Bola Voli Putra">Bola Voli Putra</option>
                        <option value="Bola Voli Putri">Bola Voli Putri</option>
                        <option value="Bulu Tangkis Putra">Bulu Tangkis Putra</option>
                        <option value="Bulu Tangkis Putri">Bulu Tangkis Putri</option>
                        <option value="Tenis Meja">Tenis Meja</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Kategori Lomba</label>
                      <select 
                        value={regForm.kategori}
                        onChange={(e) => setRegForm({...regForm, kategori: e.target.value})}
                        className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-blue-500 focus:outline-none text-base sm:text-sm transition-all"
                      >
                        <option value="Tim Utama">Tim Utama</option>
                        <option value="Tim Cadangan / B">Tim Cadangan / B</option>
                        <option value="Tunggal (Singles)">Tunggal (Singles)</option>
                        <option value="Ganda (Doubles)">Ganda (Doubles)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">No. WhatsApp Aktif</label>
                      <input 
                        type="tel" 
                        required
                        value={regForm.phone}
                        onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
                        placeholder="Contoh: 08123456789"
                        className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none text-base sm:text-sm transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full min-h-[48px] py-3.5 sm:py-4 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4 shrink-0" />
                    <span>Kirim Pendaftaran & Hubungi WhatsApp Panitia</span>
                  </button>
                </form>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. ADMIN PANEL MODAL */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative max-w-4xl w-full glass-card rounded-2xl sm:rounded-3xl border border-slate-800 p-4 sm:p-8 shadow-2xl my-2 sm:my-8">
            <button 
              onClick={() => setIsAdminOpen(false)}
              aria-label="Tutup Admin Panel"
              className="absolute top-3 right-3 sm:top-6 sm:right-6 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-900 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {!isAdminAuthenticated ? (
              <div className="max-w-md mx-auto py-6 sm:py-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-5 sm:mb-6">
                  <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Panel Admin Panitia</h3>
                <p className="text-slate-400 text-xs sm:text-sm mb-6">Masukkan PIN keamanan panitia untuk memperbarui jadwal, skor spesifik cabor, dan ekspor spreadsheet.</p>
                
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input 
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Masukkan PIN (wanajaya2026)"
                    className="w-full min-h-[46px] px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-center font-mono tracking-widest text-base sm:text-sm focus:border-blue-500 focus:outline-none"
                  />
                  {pinError && <p className="text-xs text-red-400">PIN salah! Gunakan: wanajaya2026</p>}
                  <button 
                    type="submit"
                    className="w-full min-h-[46px] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
                  >
                    Masuk Panel Admin
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-slate-800 gap-4 pr-10 sm:pr-12">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">Dashboard Kontrol Panitia</h3>
                      <p className="text-xs text-slate-400">PORDUS Dusun II Wanajaya 2026</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={() => setAdminTab('matches')}
                      className={`px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold ${adminTab === 'matches' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                    >
                      Kelola Pertandingan
                    </button>
                    <button 
                      onClick={() => setAdminTab('standings')}
                      className={`px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold ${adminTab === 'standings' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                    >
                      Klasemen Medali
                    </button>
                    <button 
                      onClick={() => setAdminTab('registrations')}
                      className={`px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold ${adminTab === 'registrations' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400'}`}
                    >
                      Data Pendaftar ({registrations.length})
                    </button>
                    <button 
                      onClick={() => { setIsAdminAuthenticated(false); setAdminPin(''); }}
                      className="flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-all"
                      title="Keluar dari Panel Admin"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: MATCHES */}
                {adminTab === 'matches' && (
                  <div className="space-y-6 sm:space-y-8">
                    {/* Add Match Form with format: Tanggal | Jam | Cabor | Tim A | Tim B | Keterangan */}
                    <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <h4 className="text-xs sm:text-sm font-bold text-white flex items-start sm:items-center gap-2">
                          <Plus className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
                          <span>Tambah Jadwal Pertandingan (Tanggal | Jam | Cabor | Tim A | Tim B | Keterangan)</span>
                        </h4>
                        <button 
                          onClick={() => exportToSpreadsheet('matches')}
                          className="w-full sm:w-auto min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all shrink-0"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Simpan ke Spreadsheet (.csv)</span>
                        </button>
                      </div>

                      <form onSubmit={handleAddMatch} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tanggal (dd-mm-yyyy)</label>
                          <input 
                            type="text" 
                            required
                            placeholder="12-07-2026" 
                            value={newMatch.date}
                            onChange={(e) => setNewMatch({...newMatch, date: e.target.value})}
                            className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-base sm:text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Jam</label>
                          <input 
                            type="text" 
                            required
                            placeholder="15:00 WIB" 
                            value={newMatch.time}
                            onChange={(e) => setNewMatch({...newMatch, time: e.target.value})}
                            className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-base sm:text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cabang Lomba (Cabor)</label>
                          <select 
                            value={newMatch.sport}
                            onChange={(e) => setNewMatch({...newMatch, sport: e.target.value})}
                            className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-base sm:text-xs"
                          >
                            <option value="Futsal Anak">Futsal Anak</option>
                            <option value="Bola Voli Putra">Bola Voli Putra</option>
                            <option value="Bola Voli Putri">Bola Voli Putri</option>
                            <option value="Bulu Tangkis Putra">Bulu Tangkis Putra</option>
                            <option value="Bulu Tangkis Putri">Bulu Tangkis Putri</option>
                            <option value="Tenis Meja">Tenis Meja</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tim A</label>
                          <input 
                            type="text" 
                            required
                            placeholder="RW 017" 
                            value={newMatch.teamA}
                            onChange={(e) => setNewMatch({...newMatch, teamA: e.target.value})}
                            className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-base sm:text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Tim B</label>
                          <input 
                            type="text" 
                            required
                            placeholder="RW 013" 
                            value={newMatch.teamB}
                            onChange={(e) => setNewMatch({...newMatch, teamB: e.target.value})}
                            className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-base sm:text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Keterangan / Babak</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Penyisihan Grup A" 
                            value={newMatch.category}
                            onChange={(e) => setNewMatch({...newMatch, category: e.target.value})}
                            className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-base sm:text-xs"
                          />
                        </div>
                        <div className="sm:col-span-3 flex justify-end">
                          <button 
                            type="submit"
                            className="w-full sm:w-auto min-h-[42px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                          >
                            Tambah Jadwal Pertandingan
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Matches List with Sport-Specific Result Editors */}
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 sm:pr-2">
                      {matches.map((m) => (
                        <div key={m.id} className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-3 sm:gap-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-bold text-blue-400">{m.sport} • {m.category}</div>
                              <div className="text-sm font-bold text-white mt-1">{m.teamA} vs {m.teamB}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{m.date}, {m.time} | Venue: {m.venue}</div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                              <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-blue-400 font-mono text-sm font-bold">
                                {m.scoreA !== null ? m.scoreA : '-'} : {m.scoreB !== null ? m.scoreB : '-'}
                              </span>

                              <button 
                                onClick={() => {
                                  setActiveResultMatchId(activeResultMatchId === m.id ? null : m.id);
                                  setResultForm({
                                    scoreA: m.scoreA || 0,
                                    scoreB: m.scoreB || 0,
                                    status: m.status,
                                    scorersA: m.scorersA || '',
                                    scorersB: m.scorersB || '',
                                    set1A: m.setsVoli?.set1A || 25, set1B: m.setsVoli?.set1B || 20,
                                    set2A: m.setsVoli?.set2A || 20, set2B: m.setsVoli?.set2B || 25,
                                    set3A: m.setsVoli?.set3A || 15, set3B: m.setsVoli?.set3B || 10,
                                    g1A: m.badmintonDetails?.g1A || 42, g1B: m.badmintonDetails?.g1B || 35,
                                    g2A: m.badmintonDetails?.g2A || 38, g2B: m.badmintonDetails?.g2B || 42,
                                    g3A: m.badmintonDetails?.g3A || 42, g3B: m.badmintonDetails?.g3B || 40,
                                    players1A: m.badmintonDetails?.players1A || '', players1B: m.badmintonDetails?.players1B || '',
                                    players2A: m.badmintonDetails?.players2A || '', players2B: m.badmintonDetails?.players2B || '',
                                    players3A: m.badmintonDetails?.players3A || '', players3B: m.badmintonDetails?.players3B || ''
                                  });
                                }}
                                className="flex-1 sm:flex-none min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Input Hasil Cabor</span>
                              </button>

                              <button 
                                onClick={() => handleDeleteMatch(m.id)}
                                aria-label="Hapus Pertandingan"
                                className="min-h-[38px] min-w-[38px] flex items-center justify-center p-2 rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Sport-Specific Result Input Modal/Form inside Match Item */}
                          {activeResultMatchId === m.id && (
                            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-950 border border-blue-500/40 space-y-4 mt-2">
                              <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                                Input Hasil Pertandingan: {m.sport} ({m.teamA} vs {m.teamB})
                              </h5>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[11px] text-slate-400 mb-1">Skor Akhir {m.teamA}</label>
                                  <input 
                                    type="number" 
                                    value={resultForm.scoreA}
                                    onChange={(e) => setResultForm({...resultForm, scoreA: parseInt(e.target.value) || 0})}
                                    className="w-full min-h-[40px] px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-base sm:text-xs font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-slate-400 mb-1">Skor Akhir {m.teamB}</label>
                                  <input 
                                    type="number" 
                                    value={resultForm.scoreB}
                                    onChange={(e) => setResultForm({...resultForm, scoreB: parseInt(e.target.value) || 0})}
                                    className="w-full min-h-[40px] px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-base sm:text-xs font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] text-slate-400 mb-1">Status Pertandingan</label>
                                  <select 
                                    value={resultForm.status}
                                    onChange={(e) => setResultForm({...resultForm, status: e.target.value as any})}
                                    className="w-full min-h-[40px] px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-base sm:text-xs"
                                  >
                                    <option value="Akan Datang">Akan Datang</option>
                                    <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                                    <option value="Selesai">Selesai</option>
                                  </select>
                                </div>
                              </div>

                              {/* FUTSAL: Pencetak Gol */}
                              {m.sport.includes('Futsal') && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                                  <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">⚽ Pencetak Gol {m.teamA}</label>
                                    <input 
                                      type="text"
                                      placeholder="Contoh: Dimas (15', 30')"
                                      value={resultForm.scorersA}
                                      onChange={(e) => setResultForm({...resultForm, scorersA: e.target.value})}
                                      className="w-full min-h-[40px] px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-base sm:text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] text-slate-400 mb-1">⚽ Pencetak Gol {m.teamB}</label>
                                    <input 
                                      type="text"
                                      placeholder="Contoh: Rian (22')"
                                      value={resultForm.scorersB}
                                      onChange={(e) => setResultForm({...resultForm, scorersB: e.target.value})}
                                      className="w-full min-h-[40px] px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-base sm:text-xs"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* BOLA VOLI: Set 1 | Set 2 | Set 3 */}
                              {m.sport.includes('Voli') && (
                                <div className="space-y-2 pt-2 border-t border-slate-900">
                                  <label className="block text-[11px] font-semibold text-blue-400 uppercase">Format Hasil Voli (Set 1 | Set 2 | Set 3)</label>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="p-2.5 bg-slate-900 rounded-lg">
                                      <div className="text-[10px] text-slate-400 mb-1">Set 1 ({m.teamA} - {m.teamB})</div>
                                      <div className="flex gap-2">
                                        <input type="number" value={resultForm.set1A} onChange={(e) => setResultForm({...resultForm, set1A: parseInt(e.target.value)||0})} className="w-1/2 min-h-[38px] p-1.5 bg-slate-950 rounded text-center text-base sm:text-xs font-mono" />
                                        <input type="number" value={resultForm.set1B} onChange={(e) => setResultForm({...resultForm, set1B: parseInt(e.target.value)||0})} className="w-1/2 min-h-[38px] p-1.5 bg-slate-950 rounded text-center text-base sm:text-xs font-mono" />
                                      </div>
                                    </div>
                                    <div className="p-2.5 bg-slate-900 rounded-lg">
                                      <div className="text-[10px] text-slate-400 mb-1">Set 2 ({m.teamA} - {m.teamB})</div>
                                      <div className="flex gap-2">
                                        <input type="number" value={resultForm.set2A} onChange={(e) => setResultForm({...resultForm, set2A: parseInt(e.target.value)||0})} className="w-1/2 min-h-[38px] p-1.5 bg-slate-950 rounded text-center text-base sm:text-xs font-mono" />
                                        <input type="number" value={resultForm.set2B} onChange={(e) => setResultForm({...resultForm, set2B: parseInt(e.target.value)||0})} className="w-1/2 min-h-[38px] p-1.5 bg-slate-950 rounded text-center text-base sm:text-xs font-mono" />
                                      </div>
                                    </div>
                                    <div className="p-2.5 bg-slate-900 rounded-lg">
                                      <div className="text-[10px] text-slate-400 mb-1">Set 3 ({m.teamA} - {m.teamB})</div>
                                      <div className="flex gap-2">
                                        <input type="number" value={resultForm.set3A} onChange={(e) => setResultForm({...resultForm, set3A: parseInt(e.target.value)||0})} className="w-1/2 min-h-[38px] p-1.5 bg-slate-950 rounded text-center text-base sm:text-xs font-mono" />
                                        <input type="number" value={resultForm.set3B} onChange={(e) => setResultForm({...resultForm, set3B: parseInt(e.target.value)||0})} className="w-1/2 min-h-[38px] p-1.5 bg-slate-950 rounded text-center text-base sm:text-xs font-mono" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* BULU TANGKIS: Ganda 1, Ganda 2, Ganda 3 (Dengan Nama Pemain) */}
                              {m.sport.includes('Bulu Tangkis') && (
                                <div className="space-y-4 pt-2 border-t border-slate-900">
                                  <label className="block text-[11px] font-semibold text-blue-400 uppercase">Format Hasil Bulu Tangkis (Rally Poin Max 42 Tanpa Deuce + Nama Pemain)</label>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Ganda 1 */}
                                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                                      <div className="text-xs font-bold text-white">Ganda 1</div>
                                      <div>
                                        <label className="block text-[10px] text-slate-400 mb-0.5">Pemain {m.teamA}</label>
                                        <input type="text" placeholder="Nama Pemain" value={resultForm.players1A} onChange={(e) => setResultForm({...resultForm, players1A: e.target.value})} className="w-full min-h-[36px] p-1.5 bg-slate-950 rounded text-base sm:text-xs text-white mb-1" />
                                        <input type="number" max="42" value={resultForm.g1A} onChange={(e) => setResultForm({...resultForm, g1A: parseInt(e.target.value)||0})} className="w-full min-h-[36px] p-1 bg-slate-950 rounded text-center text-base sm:text-xs font-mono text-white" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-slate-400 mb-0.5">Pemain {m.teamB}</label>
                                        <input type="text" placeholder="Nama Pemain" value={resultForm.players1B} onChange={(e) => setResultForm({...resultForm, players1B: e.target.value})} className="w-full min-h-[36px] p-1.5 bg-slate-950 rounded text-base sm:text-xs text-white mb-1" />
                                        <input type="number" max="42" value={resultForm.g1B} onChange={(e) => setResultForm({...resultForm, g1B: parseInt(e.target.value)||0})} className="w-full min-h-[36px] p-1 bg-slate-950 rounded text-center text-base sm:text-xs font-mono text-white" />
                                      </div>
                                    </div>

                                    {/* Ganda 2 */}
                                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                                      <div className="text-xs font-bold text-white">Ganda 2</div>
                                      <div>
                                        <label className="block text-[10px] text-slate-400 mb-0.5">Pemain {m.teamA}</label>
                                        <input type="text" placeholder="Nama Pemain" value={resultForm.players2A} onChange={(e) => setResultForm({...resultForm, players2A: e.target.value})} className="w-full min-h-[36px] p-1.5 bg-slate-950 rounded text-base sm:text-xs text-white mb-1" />
                                        <input type="number" max="42" value={resultForm.g2A} onChange={(e) => setResultForm({...resultForm, g2A: parseInt(e.target.value)||0})} className="w-full min-h-[36px] p-1 bg-slate-950 rounded text-center text-base sm:text-xs font-mono text-white" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-slate-400 mb-0.5">Pemain {m.teamB}</label>
                                        <input type="text" placeholder="Nama Pemain" value={resultForm.players2B} onChange={(e) => setResultForm({...resultForm, players2B: e.target.value})} className="w-full min-h-[36px] p-1.5 bg-slate-950 rounded text-base sm:text-xs text-white mb-1" />
                                        <input type="number" max="42" value={resultForm.g2B} onChange={(e) => setResultForm({...resultForm, g2B: parseInt(e.target.value)||0})} className="w-full min-h-[36px] p-1 bg-slate-950 rounded text-center text-base sm:text-xs font-mono text-white" />
                                      </div>
                                    </div>

                                    {/* Ganda 3 */}
                                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                                      <div className="text-xs font-bold text-white">Ganda 3</div>
                                      <div>
                                        <label className="block text-[10px] text-slate-400 mb-0.5">Pemain {m.teamA}</label>
                                        <input type="text" placeholder="Nama Pemain" value={resultForm.players3A} onChange={(e) => setResultForm({...resultForm, players3A: e.target.value})} className="w-full min-h-[36px] p-1.5 bg-slate-950 rounded text-base sm:text-xs text-white mb-1" />
                                        <input type="number" max="42" value={resultForm.g3A} onChange={(e) => setResultForm({...resultForm, g3A: parseInt(e.target.value)||0})} className="w-full min-h-[36px] p-1 bg-slate-950 rounded text-center text-base sm:text-xs font-mono text-white" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-slate-400 mb-0.5">Pemain {m.teamB}</label>
                                        <input type="text" placeholder="Nama Pemain" value={resultForm.players3B} onChange={(e) => setResultForm({...resultForm, players3B: e.target.value})} className="w-full min-h-[36px] p-1.5 bg-slate-950 rounded text-base sm:text-xs text-white mb-1" />
                                        <input type="number" max="42" value={resultForm.g3B} onChange={(e) => setResultForm({...resultForm, g3B: parseInt(e.target.value)||0})} className="w-full min-h-[36px] p-1 bg-slate-950 rounded text-center text-base sm:text-xs font-mono text-white" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3">
                                <button 
                                  onClick={() => setActiveResultMatchId(null)}
                                  className="min-h-[40px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                                >
                                  Batal
                                </button>
                                <button 
                                  onClick={() => handleSaveDetailedResult(m.id)}
                                  className="min-h-[40px] px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                                >
                                  Simpan Hasil Pertandingan
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: STANDINGS */}
                {adminTab === 'standings' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <p className="text-xs text-slate-400">Gunakan tombol + / - untuk memperbarui perolehan medali masing-masing RW secara real-time.</p>
                      <button 
                        onClick={() => exportToSpreadsheet('standings')}
                        className="w-full sm:w-auto min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all shrink-0"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Simpan ke Spreadsheet (.csv)</span>
                      </button>
                    </div>

                    <div className="space-y-3 sm:space-y-4 max-h-[450px] overflow-y-auto pr-1 sm:pr-2">
                      {standings.map((s, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-white">{s.rw} - {s.name}</div>
                            <div className="text-xs text-blue-400 font-medium">Total Poin: {s.points}</div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-amber-400 font-semibold">🥇 Emas: {s.gold}</span>
                              <div className="flex gap-1">
                                <button onClick={() => handleUpdateMedal(s.rw, 'gold', 1)} className="w-8 h-8 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white">+</button>
                                <button onClick={() => handleUpdateMedal(s.rw, 'gold', -1)} className="w-8 h-8 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white">-</button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-300 font-semibold">🥈 Perak: {s.silver}</span>
                              <div className="flex gap-1">
                                <button onClick={() => handleUpdateMedal(s.rw, 'silver', 1)} className="w-8 h-8 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white">+</button>
                                <button onClick={() => handleUpdateMedal(s.rw, 'silver', -1)} className="w-8 h-8 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white">-</button>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-amber-600 font-semibold">🥉 Perunggu: {s.bronze}</span>
                              <div className="flex gap-1">
                                <button onClick={() => handleUpdateMedal(s.rw, 'bronze', 1)} className="w-8 h-8 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white">+</button>
                                <button onClick={() => handleUpdateMedal(s.rw, 'bronze', -1)} className="w-8 h-8 sm:w-6 sm:h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white">-</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: REGISTRATIONS */}
                {adminTab === 'registrations' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <p className="text-xs text-slate-400">Daftar tim / atlet yang masuk melalui formulir pendaftaran.</p>
                      <button 
                        onClick={() => exportToSpreadsheet('registrations')}
                        className="w-full sm:w-auto min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all shrink-0"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Simpan ke Spreadsheet (.csv)</span>
                      </button>
                    </div>

                    <div className="space-y-3 sm:space-y-4 max-h-[450px] overflow-y-auto pr-1 sm:pr-2">
                      {registrations.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-sm">Belum ada pendaftar baru yang masuk.</div>
                      ) : (
                        registrations.map((r) => (
                          <div key={r.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-bold text-white">{r.nama}</div>
                              <div className="text-xs text-blue-400 font-medium">{r.rw} • {r.sport} ({r.kategori})</div>
                              <div className="text-xs text-slate-400 mt-1">No HP/WA: {r.phone} | Terdaftar: {r.date}</div>
                            </div>
                            <button 
                              onClick={() => handleDeleteReg(r.id)}
                              aria-label="Hapus Pendaftar"
                              className="min-h-[38px] min-w-[38px] flex items-center justify-center p-2 rounded bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 sm:py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 sm:mb-12">
            
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">PORDUS Dusun II Wanajaya</div>
                  <div className="text-xs text-slate-400">Turnamen Olahraga Antar-RW 2026</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Wadah pemersatu warga Dusun II Desa Wanajaya melalui semangat sportivitas dan prestasi olahraga yang jujur, adil, dan meriah.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">Navigasi Cepat</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#beranda" className="hover:text-blue-400 transition-colors">Beranda</a></li>
                <li><a href="#tentang" className="hover:text-blue-400 transition-colors">Tentang Acara</a></li>
                <li><a href="#cabor" className="hover:text-blue-400 transition-colors">Cabang Lomba</a></li>
                <li><a href="#jadwal" className="hover:text-blue-400 transition-colors">Jadwal & Skor</a></li>
                <li><a href="#klasemen" className="hover:text-blue-400 transition-colors">Klasemen Cabor</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">Lokasi & Sekretariat</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Sarana Olahraga RW 017 Pesona Gading Cibitung, Dusun II Desa Wanajaya, Cibitung, Bekasi.
              </p>
              <div className="text-xs text-blue-400 font-semibold">
                Panitia Pelaksana PORDUS 2026
              </div>
            </div>

          </div>

          <div className="pt-6 sm:pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left">
            <div>&copy; 2026 Pekan Olahraga Dusun II Desa Wanajaya. Hak Cipta Dilindungi.</div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <span>Dikelola oleh Panitia & Karang Taruna Dusun II</span>
              <button onClick={() => setIsAdminOpen(true)} className="hover:text-blue-400 transition-colors py-1">Login Admin</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
