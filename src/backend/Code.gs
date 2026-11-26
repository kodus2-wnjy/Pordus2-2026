/**
 * Google Apps Script untuk Backend & Sinkronisasi Jadwal & Hasil PORDUS Dusun II Wanajaya 2026
 * Format Kolom Jadwal: Tanggal | Jam | Cabor | Tim A | Tim B | Keterangan | Skor A | Skor B | Status | Venue | Detail Tambahan
 */

const SHEET_JADWAL = "Jadwal";
const SHEET_KLASEMEN = "Klasemen";
const SHEET_PENDAFTARAN = "Pendaftaran";

/**
 * Fungsi setup otomatis untuk membuat lembar kerja (Sheet) di Spreadsheet.
 */
function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Jadwal sesuai format permintaan
  let sheetJadwal = ss.getSheetByName(SHEET_JADWAL);
  if (!sheetJadwal) {
    sheetJadwal = ss.insertSheet(SHEET_JADWAL);
    sheetJadwal.appendRow(["ID", "Tanggal", "Jam", "Cabor", "Tim A", "Tim B", "Keterangan", "Skor A", "Skor B", "Status", "Venue", "Detail Tambahan"]);
    sheetJadwal.getRange(1, 1, 1, 12).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 2. Sheet Klasemen Medali
  let sheetKlasemen = ss.getSheetByName(SHEET_KLASEMEN);
  if (!sheetKlasemen) {
    sheetKlasemen = ss.insertSheet(SHEET_KLASEMEN);
    sheetKlasemen.appendRow(["RW", "Nama Wilayah", "Emas", "Perak", "Perunggu", "Total Poin"]);
    sheetKlasemen.getRange(1, 1, 1, 6).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  }

  // 3. Sheet Pendaftaran
  let sheetPendaftaran = ss.getSheetByName(SHEET_PENDAFTARAN);
  if (!sheetPendaftaran) {
    sheetPendaftaran = ss.insertSheet(SHEET_PENDAFTARAN);
    sheetPendaftaran.appendRow(["ID", "Nama Tim", "Asal RW", "Cabang Lomba", "Kategori", "No HP", "Tanggal Daftar"]);
    sheetPendaftaran.getRange(1, 1, 1, 7).setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
  }
  
  Logger.log("Setup Spreadsheet PORDUS Berhasil!");
}

/**
 * Handle GET request untuk mengambil data dari Google Sheets
 */
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e && e.parameter && e.parameter.action ? e.parameter.action : "all";
  
  let result = {};
  
  if (action === "matches" || action === "all") {
    const sheet = ss.getSheetByName(SHEET_JADWAL);
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1);
    
    result.matches = rows.map(row => ({
      id: row[0],
      date: row[1],
      time: row[2],
      sport: row[3],
      teamA: row[4],
      teamB: row[5],
      category: row[6],
      scoreA: row[7] !== "" ? Number(row[7]) : null,
      scoreB: row[8] !== "" ? Number(row[8]) : null,
      status: row[9],
      venue: row[10],
      detail: row[11]
    }));
  }
  
  if (action === "standings" || action === "all") {
    const sheet = ss.getSheetByName(SHEET_KLASEMEN);
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1);
    
    result.standings = rows.map(row => ({
      rw: row[0],
      name: row[1],
      gold: Number(row[2]),
      silver: Number(row[3]),
      bronze: Number(row[4]),
      points: Number(row[5])
    }));
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST request untuk menerima input jadwal baru atau update hasil pertandingan
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = data.action;
    
    if (action === "addMatch") {
      const sheet = ss.getSheetByName(SHEET_JADWAL);
      const match = data.match;
      sheet.appendRow([
        match.id || "m-" + Date.now(),
        match.date,
        match.time,
        match.sport,
        match.teamA,
        match.teamB,
        match.category,
        match.scoreA ?? "",
        match.scoreB ?? "",
        match.status || "Akan Datang",
        match.venue || "Sarana Olahraga RW 017",
        match.detail || ""
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Jadwal dan detail berhasil ditambahkan ke Spreadsheet" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === "updateScore") {
      const sheet = ss.getSheetByName(SHEET_JADWAL);
      const rows = sheet.getDataRange().getValues();
      const matchId = data.matchId;
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === matchId) {
          sheet.getRange(i + 1, 8).setValue(data.scoreA); // Skor A (Kolom 8)
          sheet.getRange(i + 1, 9).setValue(data.scoreB); // Skor B (Kolom 9)
          sheet.getRange(i + 1, 10).setValue(data.status); // Status (Kolom 10)
          sheet.getRange(i + 1, 12).setValue(data.detail || ""); // Detail Tambahan (Kolom 12)
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Hasil pertandingan berhasil diperbarui di Spreadsheet" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "registerTeam") {
      const sheet = ss.getSheetByName(SHEET_PENDAFTARAN);
      const reg = data.registration;
      sheet.appendRow([
        reg.id || "reg-" + Date.now(),
        reg.nama,
        reg.rw,
        reg.sport,
        reg.kategori,
        reg.phone,
        reg.date
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Pendaftaran berhasil disimpan ke Spreadsheet" })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Action tidak dikenali" })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
