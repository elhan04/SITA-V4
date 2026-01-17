
function setup() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Sheet Users
  var userHeaders = ['id', 'name', 'role', 'username', 'password', 'phoneNumber', 'childId', 'email', 'avatar'];
  createSheetIfNeeded(doc, 'Users', userHeaders);
  
  // 2. Sheet Students
  var studentHeaders = ['id', 'name', 'nis', 'class', 'halaqah', 'teacherId', 'totalJuz', 'username', 'password'];
  createSheetIfNeeded(doc, 'Students', studentHeaders);
  
  // 3. Records
  createSheetIfNeeded(doc, 'Records', ['id', 'studentId', 'date', 'type', 'surah', 'ayahStart', 'ayahEnd', 'grade', 'notes', 'class']);
  
  // 4. Attendance
  createSheetIfNeeded(doc, 'Attendance', ['id', 'userId', 'date', 'session', 'status', 'approvalStatus', 'type', 'class']);
  
  // 5. Exams (Lengkap dengan Detail)
  createSheetIfNeeded(doc, 'Exams', ['id', 'studentId', 'StudentName', 'date', 'category', 'score', 'examiner', 'status', 'notes', 'juz', 'class', 'details_json']);
  
  // Dummy Admin
  var userSheet = doc.getSheetByName('Users');
  if (userSheet.getLastRow() === 1) {
     userSheet.appendRow(['u1', 'Super Admin', 'admin', "'admin", "'123", "'6281234567890", "", "", ""]);
  }
}

function createSheetIfNeeded(doc, sheetName, headers) {
  var sheet = doc.getSheetByName(sheetName);
  if (!sheet) {
    sheet = doc.insertSheet(sheetName);
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold").setBackground("#dcfce7");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var data = {
    users: getSheetData(doc, 'Users'),
    students: getSheetData(doc, 'Students'),
    records: getSheetData(doc, 'Records'),
    attendance: getSheetData(doc, 'Attendance'),
    exams: getSheetData(doc, 'Exams')
  };
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(doc, sheetName) {
  var sheet = doc.getSheetByName(sheetName);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  var result = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = rows[i][j];
      if (val instanceof Date) val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      // Parse details_json back to object if exists
      if (headers[j] === 'details_json' && val) {
        try { obj['details'] = JSON.parse(val); } catch(e) { obj['details'] = null; }
      } else {
        obj[headers[j]] = val;
      }
    }
    result.push(obj);
  }
  return result;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try { lock.tryLock(30000); } catch (e) { return ContentService.createTextOutput(JSON.stringify({result: 'error'})).setMimeType(ContentService.MimeType.JSON); }
  
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var jsonData = JSON.parse(e.postData.contents);
    var action = jsonData.action;
    var data = jsonData.data;
    
    if (action == 'addExam') {
      var sheet = doc.getSheetByName('Exams');
      var values = sheet.getDataRange().getValues();
      var foundRow = -1;
      for (var i = 1; i < values.length; i++) {
        if (values[i][0] == data.id) { foundRow = i + 1; break; }
      }
      
      var detailsJson = JSON.stringify(data.details || {});
      var rowData = [
        data.id, data.studentId, data.studentName || '-', data.date, 
        data.category, data.score, data.examiner, data.status, 
        data.notes, data.juz || '-', data.class || '-', detailsJson
      ];
      
      if (foundRow > 0) {
        sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
    } else if (action == 'addUser') {
      doc.getSheetByName('Users').appendRow([data.id, data.name, data.role, "'" + data.username, "'" + data.password, "'" + data.phoneNumber, data.childId || '', '', '']);
    } else if (action == 'addStudent') {
      doc.getSheetByName('Students').appendRow([data.id, data.name, "'" + data.nis, data.class, data.halaqah, data.teacherId, 0, "'" + data.username, "'" + data.password]);
    } else if (action == 'addRecord') {
      doc.getSheetByName('Records').appendRow([data.id, data.studentId, data.date, data.type, data.surah, data.ayahStart, data.ayahEnd, data.grade, data.notes, data.class || '']);
    } else if (action == 'markAttendance') {
      doc.getSheetByName('Attendance').appendRow([data.id, data.userId, data.date, data.session, data.status, data.approvalStatus, data.type, data.class || '']);
    } else if (action == 'deleteData') {
       var sheet = doc.getSheetByName(data.sheetName);
       var values = sheet.getDataRange().getValues();
       for (var i = 1; i < values.length; i++) {
         if (values[i][0] == data.id) { sheet.deleteRow(i + 1); break; }
       }
    }
    return ContentService.createTextOutput(JSON.stringify({result: 'success'})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
