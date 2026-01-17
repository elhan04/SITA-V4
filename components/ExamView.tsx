
import React, { useState, useEffect } from 'react';
import { User, Student, Exam } from '../types';
import { QURAN_CHAPTERS } from '../constants';
import { Award, Play, ChevronLeft, ChevronRight, Maximize2, Minimize2, Sun, ZoomIn, ZoomOut, Save, Trash2, Search, Filter, PauseCircle, RefreshCw, Undo2, Lock, CheckCircle, Book } from 'lucide-react';

interface ExamViewProps {
  user: User;
  students: Student[];
  exams: Exam[];
  onAddExam: (exam: Exam) => void;
  onDeleteExam?: (id: string) => void;
}

type ViewMode = 'list' | 'setup' | 'live';

const JUZ_PAGES: Record<number, { start: number, end: number }> = {
  1: { start: 2, end: 21 }, 2: { start: 22, end: 41 }, 3: { start: 42, end: 61 },
  4: { start: 62, end: 81 }, 5: { start: 82, end: 101 }, 6: { start: 102, end: 121 },
  7: { start: 122, end: 141 }, 8: { start: 142, end: 161 }, 9: { start: 162, end: 181 },
  10: { start: 182, end: 201 }, 11: { start: 202, end: 221 }, 12: { start: 222, end: 241 },
  13: { start: 242, end: 261 }, 14: { start: 262, end: 281 }, 15: { start: 282, end: 301 },
  16: { start: 302, end: 321 }, 17: { start: 322, end: 341 }, 18: { start: 342, end: 361 },
  19: { start: 362, end: 381 }, 20: { start: 382, end: 401 }, 21: { start: 402, end: 421 },
  22: { start: 422, end: 441 }, 23: { start: 442, end: 461 }, 24: { start: 462, end: 481 },
  25: { start: 482, end: 501 }, 26: { start: 502, end: 521 }, 27: { start: 522, end: 541 },
  28: { start: 542, end: 561 }, 29: { start: 562, end: 581 }, 30: { start: 582, end: 604 }
};

const ExamView: React.FC<ExamViewProps> = ({ user, students, exams, onAddExam, onDeleteExam }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedJuz, setSelectedJuz] = useState<number>(30);

  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [historyFilterClass, setHistoryFilterClass] = useState('');

  const [currentSession, setCurrentSession] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [score, setScore] = useState<number>(100);
  const [mistakes, setMistakes] = useState({ dibantu: 0, ditegur: 0, berhenti: 0 });
  const [mistakeHistory, setMistakeHistory] = useState<('dibantu' | 'ditegur' | 'berhenti')[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [imageBrightness, setImageBrightness] = useState(100);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showBlockLock, setShowBlockLock] = useState(false);

  // Persistence to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sita_live_session_v1');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.viewMode === 'live') {
        setCurrentSession(data.currentSession);
        setCurrentPage(data.currentPage);
        setScore(data.score);
        setMistakes(data.mistakes);
        setMistakeHistory(data.mistakeHistory || []);
        setViewMode('live');
      }
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'live' && currentSession) {
      localStorage.setItem('sita_live_session_v1', JSON.stringify({
        viewMode, currentSession, currentPage, score, mistakes, mistakeHistory
      }));
    } else {
      localStorage.removeItem('sita_live_session_v1');
    }
  }, [viewMode, currentSession, currentPage, score, mistakes, mistakeHistory]);

  const calculateScore = (m: { dibantu: number, ditegur: number, berhenti: number }) => {
    const penalty = (m.dibantu * 2) + (m.ditegur * 1) + (m.berhenti * 0.5);
    return Math.max(0, 100 - penalty);
  };

  const handleStartExam = () => {
    if (!selectedStudentId) return alert("Pilih santri");
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    const juzInfo = JUZ_PAGES[selectedJuz];
    setCurrentSession({
      id: Math.random().toString(36).substr(2, 9),
      student,
      juz: selectedJuz,
      start: juzInfo.start,
      end: juzInfo.end,
      label: `Juz ${selectedJuz}`,
      examiners: [user.name],
      startBlockPage: juzInfo.start
    });
    setCurrentPage(juzInfo.start);
    setScore(100);
    setMistakes({ dibantu: 0, ditegur: 0, berhenti: 0 });
    setMistakeHistory([]);
    setViewMode('live');
  };

  const handleResumeExam = (exam: Exam) => {
    const student = students.find(s => s.id === exam.studentId);
    if (!student) return;

    // Accumulate examiners correctly
    let currentExaminers = exam.examiner.split(', ').filter(Boolean);
    if (!currentExaminers.includes(user.name)) {
      currentExaminers.push(user.name);
    }

    const pages = exam.details?.halaman?.split('-') || ['1', '604'];
    setCurrentSession({
      id: exam.id,
      student,
      juz: parseInt(exam.juz?.replace('Juz ', '') || '30'),
      start: parseInt(pages[0]),
      end: parseInt(pages[1]),
      label: exam.category,
      examiners: currentExaminers,
      startBlockPage: parseInt(pages[0])
    });

    setCurrentPage(parseInt(pages[0]));
    setScore(exam.score);
    setMistakes(exam.details?.mistakes || { dibantu: 0, ditegur: 0, berhenti: 0 });
    setMistakeHistory([]);
    setViewMode('live');
  };

  const handleMistake = (type: 'dibantu' | 'ditegur' | 'berhenti') => {
    const newMistakes = { ...mistakes, [type]: mistakes[type] + 1 };
    setMistakes(newMistakes);
    setMistakeHistory([...mistakeHistory, type]);
    setScore(calculateScore(newMistakes));
  };

  const handleUndo = () => {
    if (mistakeHistory.length === 0) return;
    const history = [...mistakeHistory];
    const last = history.pop();
    if (last) {
      const newMistakes = { ...mistakes, [last]: Math.max(0, mistakes[last] - 1) };
      setMistakes(newMistakes);
      setMistakeHistory(history);
      setScore(calculateScore(newMistakes));
    }
  };

  const handlePageNav = (dir: 'next' | 'prev') => {
    if (dir === 'prev' && currentPage > currentSession.start) {
      setImgLoading(true);
      setCurrentPage(c => c - 1);
    } else if (dir === 'next') {
      const progress = currentPage - currentSession.startBlockPage + 1;
      if (progress >= 10 && currentPage < currentSession.end) {
        setShowBlockLock(true);
      } else if (currentPage < currentSession.end) {
        setImgLoading(true);
        setCurrentPage(c => c + 1);
      } else {
        handleFinish();
      }
    }
  };

  const handleSave = async (status: 'remedial' | 'pass' | 'fail') => {
    setIsSaving(true);
    const examData: Exam = {
      id: currentSession.id,
      studentId: currentSession.student.id,
      date: new Date().toISOString().split('T')[0],
      category: currentSession.label,
      score: parseFloat(score.toFixed(1)),
      examiner: currentSession.examiners.join(', '),
      status: status,
      notes: status === 'remedial' ? 'SIMPAN SEMENTARA' : `HASIL: ${status.toUpperCase()}`,
      juz: `Juz ${currentSession.juz}`,
      class: currentSession.student.class,
      details: {
        juz: `Juz ${currentSession.juz}`,
        surat: `Halaman ${currentPage}`,
        halaman: `${currentPage}-${currentSession.end}`,
        mistakes
      }
    };

    onAddExam(examData);
    setTimeout(() => {
      setIsSaving(false);
      setShowBlockLock(false);
      setViewMode('list');
      setCurrentSession(null);
    }, 1000);
  };

  const handleFinish = () => {
    if (confirm("Selesaikan ujian ini?")) {
      handleSave(score >= 70 ? 'pass' : 'fail');
    }
  };

  const renderLive = () => {
    const imageUrl = `https://android.quran.com/data/width_1024/page${currentPage.toString().padStart(3, '0')}.png`;
    const progress = currentPage - currentSession.startBlockPage + 1;

    return (
      <div className="relative h-[calc(100vh-160px)]">
        {showBlockLock && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
              <Lock size={48} className="mx-auto text-amber-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Kunci Nilai Blok</h3>
              <p className="text-sm text-gray-500 mb-6">Anda telah menyelesaikan 10 halaman. Apa tindakan selanjutnya?</p>
              <div className="space-y-3">
                <button onClick={() => { setCurrentSession({...currentSession, startBlockPage: currentPage + 1}); setShowBlockLock(false); setCurrentPage(c => c+1); }} className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <Play size={18}/> LANJUTKAN BLOK BARU
                </button>
                <button onClick={() => handleSave('remedial')} className="w-full bg-amber-50 text-amber-700 py-3 rounded-xl font-bold border border-amber-200">
                  SIMPAN SEMENTARA
                </button>
                <button onClick={() => setShowBlockLock(false)} className="w-full text-gray-400 text-xs py-2 uppercase font-bold">KEMBALI KE HALAMAN</button>
              </div>
            </div>
          </div>
        )}

        <div className={`flex flex-col lg:flex-row h-full gap-4 ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-0' : ''}`}>
          <div className="flex-1 bg-amber-50 rounded-xl border border-amber-100 relative overflow-hidden flex flex-col">
            <button onClick={() => setIsFullScreen(!isFullScreen)} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full shadow-md">
              {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <div className="flex-1 overflow-auto flex items-start justify-center p-4">
              {imgLoading && <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50"><RefreshCw className="animate-spin text-primary" size={32}/></div>}
              <img src={imageUrl} className="max-w-full h-auto shadow-xl bg-white" onLoad={() => setImgLoading(false)} style={{ filter: `brightness(${imageBrightness}%)` }} />
            </div>
            {!isFullScreen && <div className="bg-white p-2 text-center text-xs font-bold text-gray-500 border-t">Halaman {currentPage} (Progres: {progress}/10)</div>}
          </div>

          <div className={`w-full lg:w-96 bg-white border border-gray-100 flex flex-col shrink-0 ${isFullScreen ? 'h-48 border-t-4' : 'rounded-xl shadow-sm'}`}>
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <div><h2 className="font-bold text-gray-800 truncate w-48">{currentSession.student.name}</h2><p className="text-xs text-gray-500">{currentSession.label}</p></div>
              <div className="text-right"><div className="text-[10px] font-bold text-gray-400">SKOR</div><div className="text-3xl font-black text-primary">{score.toFixed(1)}</div></div>
            </div>
            <div className="p-4 flex-1 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleMistake('dibantu')} className="flex flex-col items-center p-2 rounded-lg border bg-white hover:bg-red-50">
                  <span className="text-xl font-bold">{mistakes.dibantu}</span>
                  <span className="text-[9px] font-bold text-red-500 uppercase">DIBANTU</span>
                </button>
                <button onClick={() => handleMistake('ditegur')} className="flex flex-col items-center p-2 rounded-lg border bg-white hover:bg-yellow-50">
                  <span className="text-xl font-bold">{mistakes.ditegur}</span>
                  <span className="text-[9px] font-bold text-yellow-600 uppercase">DITEGUR</span>
                </button>
                <button onClick={() => handleMistake('berhenti')} className="flex flex-col items-center p-2 rounded-lg border bg-white hover:bg-gray-50">
                  <span className="text-xl font-bold">{mistakes.berhenti}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">STOP</span>
                </button>
              </div>
              {mistakeHistory.length > 0 && <button onClick={handleUndo} className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-200"><Undo2 size={14}/> URUNGKAN SALAH</button>}
            </div>
            <div className="p-4 border-t space-y-3">
              <div className="flex gap-2">
                <button onClick={() => handlePageNav('prev')} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center"><ChevronLeft/></button>
                <button onClick={() => handlePageNav('next')} className="flex-[3] py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2">
                  {currentPage >= currentSession.end ? 'SELESAI' : `HAL BERIKUTNYA (${progress}/10)`} <ChevronRight size={20}/>
                </button>
              </div>
              <button onClick={() => handleSave('remedial')} disabled={isSaving} className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                {isSaving ? <RefreshCw className="animate-spin" size={16}/> : <PauseCircle size={16}/>} SIMPAN SEMENTARA
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSetup = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h3 className="text-xl font-bold flex items-center gap-2"><Award className="text-primary"/> Setup Ujian Baru</h3>
        <button onClick={() => setViewMode('list')} className="text-gray-400 hover:text-red-500">Batal</button>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-bold text-gray-600 mb-1">Kelas</label><select className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-primary outline-none" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}><option value="">Pilih...</option>{Array.from(new Set(students.map(s => s.class))).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-bold text-gray-600 mb-1">Santri</label><select className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-primary outline-none" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}><option value="">Pilih...</option>{students.filter(s => !selectedClass || s.class === selectedClass).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">Pilih Juz</label>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({length: 30}, (_, i) => i + 1).map(j => (
              <button key={j} onClick={() => setSelectedJuz(j)} className={`p-2.5 rounded-lg border font-bold text-sm transition-all ${selectedJuz === j ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-500 hover:border-primary'}`}>{j}</button>
            ))}
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
          <Book className="text-primary" size={24} />
          <div><h4 className="font-bold text-emerald-900 leading-tight italic text-sm">Target: Juz {selectedJuz}</h4><p className="text-[10px] text-emerald-600 font-medium">Halaman {JUZ_PAGES[selectedJuz].start} s/d {JUZ_PAGES[selectedJuz].end}</p></div>
        </div>
        <button onClick={handleStartExam} className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-800 active:scale-95 transition-all">MULAI UJIAN <Award size={22}/></button>
      </div>
    </div>
  );

  const activeSessions = exams.filter(e => e.status === 'remedial');
  const finishedExams = exams.filter(e => e.status !== 'remedial')
    .filter(e => {
      const s = students.find(st => st.id === e.studentId);
      return (s?.name.toLowerCase().includes(historySearchTerm.toLowerCase()) || e.studentId.includes(historySearchTerm)) && (!historyFilterClass || s?.class === historyFilterClass);
    })
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-[500px]">
      {viewMode === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Ujian & Penilaian</h2>
            <div className="flex gap-2 w-full md:w-auto">
              <input type="text" placeholder="Cari santri..." value={historySearchTerm} onChange={e => setHistorySearchTerm(e.target.value)} className="flex-1 md:w-64 border rounded-lg px-4 py-2 text-sm focus:ring-primary outline-none" />
              {user.role === 'teacher' && <button onClick={() => setViewMode('setup')} className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm"><Play size={18}/> Ujian Baru</button>}
            </div>
          </div>

          {activeSessions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
              <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2"><PauseCircle size={18}/> Ujian Simpan Sementara</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeSessions.map(s => {
                  const student = students.find(st => st.id === s.studentId);
                  return (
                    <div key={s.id} className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2"><p className="font-bold text-gray-800 truncate">{student?.name}</p><span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">{s.juz}</span></div>
                      <p className="text-[10px] text-gray-400 mb-3">Penguji: {s.examiner}</p>
                      <button onClick={() => handleResumeExam(s)} className="w-full bg-amber-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-amber-700 flex items-center justify-center gap-2"><Play size={14}/> LANJUTKAN</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finishedExams.length === 0 ? <div className="col-span-full text-center py-20 text-gray-400 font-medium">Belum ada riwayat ujian.</div> : finishedExams.map(exam => (
              <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className={`h-1.5 w-full ${exam.score >= 70 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3"><div><h3 className="font-bold text-gray-800 text-lg truncate w-40">{students.find(s => s.id === exam.studentId)?.name}</h3><p className="text-xs text-primary font-bold">{exam.juz}, {exam.category}</p></div><div className={`text-2xl font-black ${exam.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>{exam.score}</div></div>
                  <div className="text-[10px] text-gray-400 flex justify-between border-t pt-3"><span>{new Date(exam.date).toLocaleDateString('id-ID')}</span><span className="truncate w-32 text-right">{exam.examiner}</span></div>
                  {onDeleteExam && (user.role === 'admin' || user.role === 'teacher') && <button onClick={() => onDeleteExam(exam.id)} className="w-full mt-3 pt-2 border-t border-dashed text-xs text-red-500 flex items-center justify-center gap-1 hover:text-red-700 transition-colors"><Trash2 size={12}/> Hapus Riwayat</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}{viewMode === 'setup' && renderSetup()}{viewMode === 'live' && renderLive()}</div>
  );
};

export default ExamView;
