
import { User, Student, TahfidzRecord, Attendance, Exam, Grade } from './types';

// CONFIGURATION & TUTORIAL SETUP
// ---------------------------------------------------------------------------
// 1. SETUP DATABASE (GOOGLE SHEETS)
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzPU0-1zQBdk7bq28vUkyUfqqtQnOyE3N4eRD3VwetYH9pI1ncYlmMxCZ3_A9mzri09/exec"; 

// ---------------------------------------------------------------------------
// 2. SETUP LOGO (GOOGLE DRIVE DIRECT LINK)
// ---------------------------------------------------------------------------
// Ganti ID di bawah ini dengan ID file Google Drive Anda
export const LOGO_URL = "https://lh3.googleusercontent.com/u/0/d/1TVfDQ2RysRmOgfIr0hUL9H1l7Rth_AsK"; 

// WhatsApp Number for Admin
export const ADMIN_PHONE = "6281234567890"; 

export const SURAH_LIST = [
  "Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa'", "Al-Ma'idah", 
  "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus", "Hud", 
  "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra'", 
  "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya'", "Al-Hajj", "Al-Mu'minun",
  "An-Nur", "Al-Furqan", "Asy-Syu'ara'", "An-Naml", "Al-Qasas", "Al-Ankabut",
  "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba'", "Fatir", "Ya-Sin",
  "As-Saffat", "Sad", "Az-Zumar", "Gafir", "Fussilat", "Asy-Sura", 
  "Az-Zukhruf", "Ad-Dukhan", "Al-Jasiyah", "Al-Ahqaf", "Muhammad", "Al-Fath",
  "Al-Hujurat", "Qaf", "Az-Zariyat", "At-Tur", "An-Najm", "Al-Qamar", 
  "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadilah", "Al-Hasyr", 
  "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Tagabun", 
  "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
  "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddassir", "Al-Qiyamah", "Al-Insan",
  "Al-Mursalat", "An-Naba'", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar",
  "Al-Mutaffifin", "Al-Insyiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", 
  "Al-Gasyiyah", "Al-Fajr", "Al-Balad", "Asy-Syams", "Al-Lail", "Ad-Duha",
  "Al-Insyirah", "At-Tin", "Al-'Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah",
  "Al-'Adiyat", "Al-Qari'ah", "At-Takasur", "Al-'Asr", "Al-Humazah", "Al-Fil",
  "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun", "An-Nasr", "Al-Lahab",
  "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

export const QURAN_CHAPTERS: [number, string, number][] = [
    [1, "Al-Fatihah", 1], [2, "Al-Baqarah", 2], [3, "Ali 'Imran", 50], [4, "An-Nisa'", 77],
    [5, "Al-Ma'idah", 106], [6, "Al-An'am", 128], [7, "Al-A'raf", 151], [8, "Al-Anfal", 177],
    [9, "At-Taubah", 187], [10, "Yunus", 208], [11, "Hud", 221], [12, "Yusuf", 235],
    [13, "Ar-Ra'd", 249], [14, "Ibrahim", 255], [15, "Al-Hijr", 262], [16, "An-Nahl", 267],
    [17, "Al-Isra'", 282], [18, "Al-Kahf", 293], [19, "Maryam", 305], [20, "Ta-Ha", 312],
    [21, "Al-Anbiya'", 322], [22, "Al-Hajj", 332], [23, "Al-Mu'minun", 342], [24, "An-Nur", 350],
    [25, "Al-Furqan", 359], [26, "Asy-Syu'ara'", 367], [27, "An-Naml", 377], [28, "Al-Qasas", 385],
    [29, "Al-Ankabut", 396], [30, "Ar-Rum", 404], [31, "Luqman", 411], [32, "As-Sajdah", 415],
    [33, "Al-Ahzab", 418], [34, "Saba'", 428], [35, "Fatir", 434], [36, "Ya-Sin", 440],
    [37, "As-Saffat", 446], [38, "Sad", 453], [39, "Az-Zumar", 458], [40, "Gafir", 467],
    [41, "Fussilat", 477], [42, "Asy-Syura", 483], [43, "Az-Zukhruf", 489], [44, "Ad-Dukhan", 496],
    [45, "Al-Jasiyah", 499], [46, "Al-Ahqaf", 502], [47, "Muhammad", 507], [48, "Al-Fath", 511],
    [49, "Al-Hujurat", 515], [50, "Qaf", 518], [51, "Az-Zariyat", 520], [52, "At-Tur", 523],
    [53, "An-Najm", 526], [54, "Al-Qamar", 528], [55, "Ar-Rahman", 531], [56, "Al-Waqi'ah", 534],
    [57, "Al-Hadid", 537], [58, "Al-Mujadalah", 542], [59, "Al-Hasyr", 545], [60, "Al-Mumtahanah", 549],
    [61, "As-Saff", 551], [62, "Al-Jumu'ah", 553], [63, "Al-Munafiqun", 554], [64, "At-Tagabun", 556],
    [65, "At-Talaq", 558], [66, "At-Tahrim", 560], [67, "Al-Mulk", 562], [68, "Al-Qalam", 564],
    [69, "Al-Haqqah", 566], [70, "Al-Ma'arij", 568], [71, "Nuh", 570], [72, "Al-Jinn", 572],
    [73, "Al-Muzzammil", 574], [74, "Al-Muddassir", 575], [75, "Al-Qiyamah", 577], [76, "Al-Insan", 578],
    [77, "Al-Mursalat", 580], [78, "An-Naba'", 582], [79, "An-Nazi'at", 583], [80, "Abasa", 585],
    [81, "At-Takwir", 586], [82, "Al-Infitar", 587], [83, "Al-Mutaffifin", 587], [84, "Al-Insyiqaq", 589],
    [85, "Al-Buruj", 590], [86, "At-Tariq", 591], [87, "Al-A'la", 591], [88, "Al-Gasyiyah", 592],
    [89, "Al-Fajr", 593], [90, "Al-Balad", 594], [91, "Asy-Syams", 595], [92, "Al-Lail", 595],
    [93, "Ad-Duha", 596], [94, "Asy-Syarh", 596], [95, "At-Tin", 597], [96, "Al-'Alaq", 597],
    [97, "Al-Qadr", 598], [98, "Al-Bayyinah", 598], [99, "Az-Zalzalah", 599], [100, "Al-'Adiyat", 599],
    [101, "Al-Qari'ah", 600], [102, "At-Takasur", 600], [103, "Al-'Asr", 601], [104, "Al-Humazah", 601],
    [105, "Al-Fil", 601], [106, "Quraisy", 602], [107, "Al-Ma'un", 602], [108, "Al-Kausar", 602],
    [109, "Al-Kafirun", 603], [110, "An-Nasr", 603], [111, "Al-Lahab", 603], [112, "Al-Ikhlas", 604],
    [113, "Al-Falaq", 604], [114, "An-Nas", 604]
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Super Admin', role: 'admin', username: 'admin', password: '123', phoneNumber: '62811111111' },
  { id: 'u2', name: 'Ust. Abdullah', role: 'teacher', username: 'guru', password: '123', phoneNumber: '62822222222' },
  { id: 'u3', name: 'Pak Ahmad (Wali)', role: 'parent', username: 'wali', password: '123', phoneNumber: '62833333333', childId: 's1' },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Fulan bin Ahmad',
    nis: '2024001',
    class: '7A',
    halaqah: 'Halaqah 1',
    teacherId: 'u2',
    totalJuz: 2,
    username: 'santri',
    password: '123'
  },
  {
    id: 's2',
    name: 'Zaid bin Khalid',
    nis: '2024002',
    class: '7A',
    halaqah: 'Halaqah 1',
    teacherId: 'u2',
    totalJuz: 1,
    username: 'zaid',
    password: '123'
  }
];

export const MOCK_RECORDS: TahfidzRecord[] = [
  {
    id: 'r1',
    studentId: 's1',
    date: new Date().toISOString().split('T')[0],
    type: 'ziyadah',
    surah: 'Al-Baqarah',
    ayahStart: 1,
    ayahEnd: 5,
    grade: Grade.LANCAR,
    notes: 'Bagus'
  }
];

export const MOCK_ATTENDANCE: Attendance[] = [];
export const MOCK_EXAMS: Exam[] = [];
