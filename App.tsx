
import React, { useState, useEffect } from 'react';
import { User, Role, Student, TahfidzRecord, Attendance, Exam } from './types';
import { MOCK_USERS, MOCK_STUDENTS, MOCK_RECORDS, MOCK_ATTENDANCE, MOCK_EXAMS, LOGO_URL, GOOGLE_SCRIPT_URL } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TahfidzLog from './components/TahfidzLog';
import AttendanceView from './components/Attendance';
import ExamView from './components/ExamView';
import AdminPanel from './components/AdminPanel';
import ReportsView from './components/ReportsView';
import ProfileSettings from './components/ProfileSettings';
import TutorialGuide from './components/TutorialGuide';
import { User as UserIcon, Lock, AlertCircle, ArrowRight, CheckCircle2, XCircle, Loader2, WifiOff, Database } from 'lucide-react';
import { api } from './api';

const LoginScreen = ({ onLogin, users, students, isLoadingData, connectionError }: { onLogin: (user: User) => void, users: User[], students: Student[], isLoadingData: boolean, connectionError: string | null }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
      return;
    } 
    const student = students.find(s => s.username === username && s.password === password);
    if (student) {
        const studentUser: User = {
            id: student.id,
            name: student.name,
            role: 'parent',
            childId: student.id,
            username: student.username
        };
        onLogin(studentUser);
        return;
    }
    setError('Username atau password salah.');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 relative bg-gray-50 rounded-full p-2 flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
             <img 
                src={LOGO_URL} 
                alt="Logo" 
                className="w-full h-full object-contain" 
                onError={(e) => { 
                    // Fallback to a safe icon if logo fails
                    (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/3063/3063206.png'; 
                }} 
             />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Darul Abror IBS</h1>
          <p className="text-emerald-600 font-medium text-sm mt-1">Sistem Informasi Tahfidz</p>
        </div>
        {connectionError && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <WifiOff className="text-orange-500 shrink-0 mt-0.5" size={20} />
                <div>
                    <h3 className="font-bold text-orange-700 text-sm">Mode Offline</h3>
                    <p className="text-xs text-orange-600 mt-1 leading-relaxed">{connectionError === 'no_url' ? "Aplikasi berjalan di penyimpanan lokal." : "Gagal sinkron data cloud."}</p>
                </div>
            </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username / NIS</label>
                <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Username atau NIS Santri" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Masukkan password" required />
                </div>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
            <button type="submit" disabled={isLoadingData && !users.length} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70">
                {isLoadingData ? <><Loader2 size={20} className="animate-spin" /> Memuat...</> : <>Masuk Sistem <ArrowRight size={20} /></>}
            </button>
        </form>
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400 font-medium">© 2025. Darul Abror IBS V.1</p>
        </div>
      </div>
    </div>
  );
};

const ActionResult = ({ action, teacherName }: { action: string, teacherName: string }) => {
    const isApproved = action === 'approve';
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100 text-center">
                 <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}><CheckCircle2 size={40} /></div>
                 <h2 className="text-xl font-bold text-gray-800 mb-2">{isApproved ? 'Izin Disetujui' : 'Izin Ditolak'}</h2>
                 <p className="text-gray-500 mb-6">Pengajuan izin atas nama <strong>{teacherName}</strong> telah berhasil {isApproved ? 'disetujui' : 'ditolak'}.</p>
                 <button onClick={() => window.location.href = window.location.pathname} className="w-full bg-gray-800 text-white py-3 rounded-xl font-medium">Kembali</button>
            </div>
        </div>
    );
};

const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });
  useEffect(() => { window.localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
      const savedUser = window.localStorage.getItem('sita_current_user_v1');
      return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeTab, setActiveTab] = useState(() => window.localStorage.getItem('sita_active_tab_v1') || 'dashboard');

  useEffect(() => {
    if (user) window.localStorage.setItem('sita_current_user_v1', JSON.stringify(user));
    else window.localStorage.removeItem('sita_current_user_v1');
  }, [user]);

  useEffect(() => { window.localStorage.setItem('sita_active_tab_v1', activeTab); }, [activeTab]);
  
  const [users, setUsers] = useStickyState<User[]>(MOCK_USERS, 'sita_users_v1');
  const [students, setStudents] = useStickyState<Student[]>(MOCK_STUDENTS, 'sita_students_v1');
  const [records, setRecords] = useStickyState<TahfidzRecord[]>(MOCK_RECORDS, 'sita_records_v1');
  const [attendance, setAttendance] = useStickyState<Attendance[]>(MOCK_ATTENDANCE, 'sita_attendance_v1');
  const [exams, setExams] = useStickyState<Exam[]>(MOCK_EXAMS, 'sita_exams_v1');

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [urlAction, setUrlAction] = useState<{ type: string, name: string } | null>(null);

  // Helper to extract clean ID if Sheet has "ID | Name" format
  const cleanId = (id: string) => {
      if (!id) return '';
      // Split by " | " and take the first part
      return id.toString().split(' | ')[0].trim();
  };

  useEffect(() => {
     const fetchData = async () => {
        if (!GOOGLE_SCRIPT_URL) { setConnectionError('no_url'); return; }
        setIsLoadingData(true);
        const data = await api.load();
        if (data) {
           if(data.users?.length) setUsers(data.users);
           if(data.students) setStudents(data.students);
           
           // Clean IDs when loading records from Sheet (in case they are stored as "ID | Name")
           if(data.records) {
               const cleanedRecords = data.records.map((r: any) => ({
                   ...r,
                   studentId: cleanId(r.studentId)
               }));
               setRecords(cleanedRecords);
           }
           
           if(data.attendance) {
               const cleanedAttendance = data.attendance.map((a: any) => ({
                   ...a,
                   userId: cleanId(a.userId)
               }));
               setAttendance(cleanedAttendance);
           }

           if(data.exams) {
               const cleanedExams = data.exams.map((e: any) => ({
                   ...e,
                   studentId: cleanId(e.studentId)
               }));
               setExams(cleanedExams);
           }
        } else setConnectionError('fetch_failed');
        setIsLoadingData(false);
     };
     fetchData();
  }, []);

  const handleAddRecord = (newRecord: TahfidzRecord) => {
    setRecords([newRecord, ...records]);
    const student = students.find(s => s.id === newRecord.studentId);
    // STORE "ID | NAME" IN SHEET BUT KEEP ID IN APP
    const payload = { 
        ...newRecord, 
        studentId: student ? `${student.id} | ${student.name}` : newRecord.studentId,
        class: student?.class || '-'
    };
    api.send('addRecord', payload);
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('Hapus data ini?')) {
      setRecords(records.filter(r => r.id !== id));
      api.send('deleteData', { id, sheetName: 'Records' });
    }
  };

  const handleMarkAttendance = (newAtt: Attendance) => {
    const exists = attendance.findIndex(a => a.userId === newAtt.userId && a.date === newAtt.date && a.type === newAtt.type && a.session === newAtt.session);
    if (exists >= 0) {
      const updated = [...attendance];
      updated[exists] = newAtt;
      setAttendance(updated);
    } else setAttendance([...attendance, newAtt]);
    
    const target = newAtt.type === 'student' ? students.find(s => s.id === newAtt.userId) : users.find(u => u.id === newAtt.userId);
    const payload = {
        ...newAtt,
        userId: target ? `${target.id} | ${target.name}` : newAtt.userId,
        class: (newAtt.type === 'student' ? (target as Student)?.class : 'GURU') || '-'
    };
    api.send('markAttendance', payload);
  };

  const handleAddExam = (newExam: Exam) => {
    setExams([newExam, ...exams]);
    const student = students.find(s => s.id === newExam.studentId);
    
    // PAYLOAD MODIFIED: Sending "StudentName" as extra field
    const payload = {
        ...newExam,
        studentId: student ? student.id : newExam.studentId,
        studentName: student ? student.name : '-',
        class: student?.class || '-'
    };
    api.send('addExam', payload);
  };

  const handleBulkAddUsers = (newUsers: User[]) => {
      setUsers(prev => [...prev, ...newUsers]);
      newUsers.forEach(u => api.send('addUser', u));
  };

  const handleBulkAddStudents = (newStudents: Student[]) => {
      setStudents(prev => [...prev, ...newStudents]);
      newStudents.forEach(s => api.send('addStudent', s));
  };

  const handleDeleteUser = (id: string) => {
    if(confirm("Hapus user ini?")) {
        setUsers(users.filter(u => u.id !== id));
        api.send('deleteData', { id, sheetName: 'Users' });
    }
  };

  const handleDeleteStudent = (id: string) => {
    if(confirm("Hapus santri ini?")) {
        setStudents(students.filter(s => s.id !== id));
        api.send('deleteData', { id, sheetName: 'Students' });
    }
  };

  const handleDeleteExam = (id: string) => {
    if(confirm("Hapus data ujian?")) {
        setExams(exams.filter(e => e.id !== id));
        api.send('deleteData', { id, sheetName: 'Exams' });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user!} students={students} records={records} exams={exams} connectionError={connectionError} onNavigate={setActiveTab} />;
      case 'hafalan': return <TahfidzLog user={user!} students={students} records={records} onAddRecord={handleAddRecord} onDeleteRecord={handleDeleteRecord} />;
      case 'master_data': return <AdminPanel users={users} students={students} onAddUser={(u) => { setUsers([...users, u]); api.send('addUser', u); }} onDeleteUser={handleDeleteUser} onAddStudent={(s) => { setStudents([...students, s]); api.send('addStudent', s); }} onDeleteStudent={handleDeleteStudent} onBulkAddStudents={handleBulkAddStudents} onBulkAddUsers={handleBulkAddUsers} />;
      case 'reports': return <ReportsView user={user!} students={students} records={records} users={users} attendance={attendance} />;
      case 'attendance_student': return <AttendanceView user={user!} students={students} users={users} attendance={attendance} onMarkAttendance={handleMarkAttendance} type="student" />;
      case 'attendance_teacher': case 'attendance_self': return <AttendanceView user={user!} students={students} users={users} attendance={attendance} onMarkAttendance={handleMarkAttendance} type="teacher" />;
      case 'exam': return <ExamView user={user!} students={students} exams={exams} onAddExam={handleAddExam} onDeleteExam={handleDeleteExam} />;
      case 'profile': return <ProfileSettings user={user!} onUpdateUser={(d) => { const updated = {...user!, ...d}; setUser(updated); api.send('updateUser', updated); }} />;
      case 'tutorial': return <TutorialGuide />;
      default: return <Dashboard user={user!} students={students} records={records} exams={exams} connectionError={connectionError} />;
    }
  };

  if (urlAction) return <ActionResult action={urlAction.type} teacherName={urlAction.name} />;
  if (!user) return <LoginScreen onLogin={setUser} users={users} students={students} isLoadingData={isLoadingData} connectionError={connectionError} />;

  return <Layout user={user} onLogout={() => setUser(null)} activeTab={activeTab} onTabChange={setActiveTab}>{renderContent()}</Layout>;
};

export default App;
