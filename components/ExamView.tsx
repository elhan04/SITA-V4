
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

// Mapping Juz to Pages (Madani Mushaf Standard)
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

  useEffect(() => {
    const savedSession = localStorage.getItem('sita_live_exam_session_v1');
    if (savedSession) {
      try {
        const data = JSON.parse(savedSession);
        const studentExists = students.find(s => s.id === data.currentSession?.student?.id);
        if (data.viewMode === 'live' && data.currentSession && studentExists) {
            setCurrentSession(data.currentSession);
            setCurrentPage(data.currentPage);
            setScore(data.score);
            setMistakes(data.mistakes);
            setMistakeHistory(data.mistakeHistory || []);
            setIsFullScreen(data.isFullScreen || false);
            setImageBrightness(data.imageBrightness || 100);
            setZoomLevel(data.zoomLevel || 1);
            setViewMode('live');
        } else localStorage.removeItem('sita_live_exam_session_v1');
      } catch (e) { localStorage.removeItem('sita_live_exam_session_v1'); }
    }
  }, [students]);

  useEffect(() => {
    if (viewMode === 'live' && currentSession) {
      localStorage.setItem('sita_live_exam_session_v1', JSON.stringify({
        viewMode, currentSession, currentPage, score, mistakes, mistakeHistory, isFullScreen, imageBrightness, zoomLevel
      }));
    } else if (viewMode === 'list') localStorage.removeItem('sita_live_exam_session_v1');
  }, [viewMode, currentSession, currentPage, score, mistakes, mistakeHistory, isFullScreen, imageBrightness, zoomLevel]);

  const calculateScore = (currentMistakes: { dibantu: number, ditegur: number, berhenti: number }) => {
    const penalty = (currentMistakes.dibantu * 2) + (currentMistakes.ditegur * 1) + (currentMistakes.berhenti * 0.5);
    return Math.max(0, 100 - penalty);
  };

  const handleStartExam = () => {
    if (!selectedStudentId) return alert("Pilih santri");
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    const juzInfo = JUZ_PAGES[selectedJuz];
    const label = `Juz ${selectedJuz}`;

    setCurrentSession({ 
      id: Math.random().toString(36).substr(2, 9),
      student, 
      juz: selectedJuz,
      start: juzInfo.start, 
      end: juzInfo.end, 
      label: label, 
      examiners: [user.name],
      startBlockPage: juzInfo.start 
    });
    setCurrentPage(juzInfo.start);
    setScore(100);
    setMistakes({ dibantu: 0, ditegur: 0, berhenti: 0 });
    setMistakeHistory([]);
    setIsFullScreen(false);
    setZoomLevel(1);
    setViewMode('live');
  };

  const handleResumeExam = (exam: Exam) => {
    const student = students.find(s => s.id === exam.studentId);
    if (!student) return;
    
    const currentExaminers = exam.notes.split(', ').filter(Boolean);
    if (!currentExaminers.includes(user.name)) {
        currentExaminers.push(user.name);
    }

    const pages = exam.details?.halaman?.split('-') || ['1', '604'];
    const start = parseInt(pages[0]);
    const end = parseInt(pages[1]);

    setCurrentSession({
        id: exam.id,
        student,
        juz: parseInt(exam.juz?.replace('Juz ', '') || '30'),
        start: start,
        end: end,
        label: exam.category,
        examiners: currentExaminers,
        startBlockPage: start 
    });
    
    setCurrentPage(start);
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

  const handleUndoMistake = () => {
    if (mistakeHistory.length === 0) return;
    const newHistory = [...mistakeHistory];
    const lastMistake = newHistory.pop();
    if (lastMistake) {
        const newMistakes = { ...mistakes, [lastMistake]: Math.max(0, mistakes[lastMistake] - 1) };
        setMistakes(newMistakes);
        setMistakeHistory(newHistory);
        setScore(calculateScore(newMistakes));
    }
  };

  const handlePageNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'prev' && currentPage > currentSession.start) {
        setImgLoading(true);
        setCurrentPage(c => c - 1);
    } else if (direction === 'next') {
        const progressInBlock = currentPage - currentSession.startBlockPage + 1;
        if (progressInBlock >= 10 && currentPage < currentSession.end) {
            setShowBlockLock(true);
        } else if (currentPage < currentSession.end) {
            setImgLoading(true);
            setCurrentPage(c => c + 1);
        } else {
            handleFinishExam();
        }
    }
  };

  const handleSaveProgress = async (status: 'remedial' | 'pass' | 'fail' = 'remedial') => {
    setIsSaving(true);
    const finalScore = parseFloat(score.toFixed(1));
    const juzString = `Juz ${currentSession.juz}`;
    
    const examData: Exam = {
      id: currentSession.id,
      studentId: currentSession.student.id,
      date: new Date().toISOString().split('T')[0],
      category: currentSession.label,
      score: finalScore,
      examiner: currentSession.examiners.join(', '),
      status: status,
      notes: status === 'remedial' ? currentSession.examiners.join(', ') : `${status.toUpperCase()} (Penguji: ${currentSession.examiners.join(', ')})`,
      juz: juzString,
      class: currentSession.student.class,
      details: { 
          juz: juzString, 
          surat: `Halaman ${currentPage}`, 
          halaman: `${currentPage}-${currentSession.end}`, 
          mistakes 
      }
    };

    onAddExam(examData);
    
    setTimeout(() => {
        setIsSaving(false);
        localStorage.removeItem('sita_live_exam_session_v1');
        if (status !== 'remedial') {
            setCurrentSession(null);
        }
        setShowBlockLock(false);
        setViewMode('list');
        alert(status === 'remedial' ? "Progres 10 halaman berhasil dikunci." : "Ujian Selesai. Nilai akhir disimpan.");
    }, 1000);
  };

  const handleContinueAfterLock = () => {
    setCurrentSession({ ...currentSession, startBlockPage: currentPage + 1 });
    setShowBlockLock(false);
    setImgLoading(true);
    setCurrentPage(c => c + 1);
  };

  const handleFinishExam = () => {
    if (!confirm("Selesaikan ujian dan simpan nilai akhir?")) return;
    handleSaveProgress(score >= 70 ? 'pass' : 'fail');
  };

  const renderLiveExam = () => {
    const imageUrl = `https://android.quran.com/data/width_1024/page${currentPage.toString().padStart(3, '0')}.png`;
    const progressInBlock = currentPage - currentSession.startBlockPage + 1;

    const ScoringButtons = () => (
         <div className="flex flex-col gap-3 w-full md:flex-1">
            <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleMistake('dibantu')} className="flex flex-col items-center p-2 rounded-lg border bg-white shadow-sm hover:bg-red-50 active:scale-95 transition-all">
                    <span className="text-xl font-bold text-gray-800">{mistakes.dibantu}</span>
                    <span className="text-[10px] text-red-500 uppercase font-bold">DIBANTU (-2)</span>
                </button>
                <button onClick={() => handleMistake('ditegur')} className="flex flex-col items-center p-2 rounded-lg border bg-white shadow-sm hover:bg-yellow-50 active:scale-95 transition-all">
                    <span className="text-xl font-bold text-gray-800">{mistakes.ditegur}</span>
                    <span className="text-[10px] text-yellow-600 uppercase font-bold">DITEGUR (-1)</span>
                </button>
                <button onClick={() => handleMistake('berhenti')} className="flex flex-col items-center p-2 rounded-lg border bg-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                    <span className="text-xl font-bold text-gray-800">{mistakes.berhenti}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">STOP (-0.5)</span>
                </button>
            </div>
            {mistakeHistory.length > 0 && (
                <button onClick={handleUndoMistake} className="flex items-center justify-center gap-2 py-1.5 px-4 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                    <Undo2 size={14} /> URUNGKAN PENILAIAN
                </button>
            )}
        </div>
    );

    const NavigationButtons = () => (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 w-full">
            <button onClick={() => handlePageNavigation('prev')} disabled={currentPage <= currentSession.start} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50"><ChevronLeft size={20} /> <span className="hidden md:inline">Sebelumnya</span></button>
            <button onClick={() => handlePageNavigation('next')} className="flex-[2] flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg shadow-sm hover:bg-emerald-700 font-bold italic">
                {currentPage >= currentSession.end ? 'SELESAI' : `LANJUT (${progressInBlock}/10)`} <ChevronRight size={20} />
            </button>
        </div>
      </div>
    );

    return (
      <div className="relative h-[calc(100vh-160px)]">
        {showBlockLock && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                    <div className="bg-amber-500 p-6 text-white text-center">
                        <Lock size={48} className="mx-auto mb-3 opacity-90" />
                        <h3 className="text-xl font-bold leading-tight">Kunci Nilai 10 Halaman</h3>
                        <p className="text-sm opacity-90 mt-1">Selesaikan blok atau simpan progres</p>
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg border mb-4">
                            <div className="flex justify-between text-xs text-gray-500 font-bold uppercase mb-1"><span>Target Blok</span><span>Skor</span></div>
                            <div className="flex justify-between items-end">
                                <span className="text-gray-800 font-bold">Hal {currentSession.startBlockPage} - {currentPage}</span>
                                <span className="text-2xl font-black text-primary">{score.toFixed(1)}</span>
                            </div>
                        </div>
                        <button onClick={handleContinueAfterLock} className="w-full flex items-center justify-center gap-3 py-3 bg-primary text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md">
                            <Play size={18}/> KUNCI & LANJUTKAN
                        </button>
                        <button onClick={() => handleSaveProgress('remedial')} className="w-full flex items-center justify-center gap-3 py-3 bg-amber-100 text-amber-700 rounded-xl font-bold hover:bg-amber-200">
                            <PauseCircle size={18}/> KUNCI & SIMPAN SEMENTARA
                        </button>
                        <button onClick={() => handleSaveProgress(score >= 70 ? 'pass' : 'fail')} className="w-full flex items-center justify-center gap-3 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">
                            <CheckCircle size={18}/> KUNCI & SELESAI UJIAN
                        </button>
                        <button onClick={() => setShowBlockLock(false)} className="w-full py-2 text-xs text-gray-400 font-medium hover:text-gray-600 uppercase">Kembali</button>
                    </div>
                </div>
            </div>
        )}

        {isFullScreen ? (
            <div className="fixed inset-0 z-50 bg-white flex flex-col h-[100dvh] animate-fade-in">
              <div className="bg-white/95 backdrop-blur shadow-sm border-b px-4 py-2 flex justify-between items-center z-20 shrink-0">
                 <div className="flex items-center gap-3">
                     <div>
                        <h2 className="font-bold text-gray-800 text-lg leading-none truncate max-w-[150px]">{currentSession.student.name}</h2>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">JUZ {currentSession.juz} • HAL {currentPage} ({progressInBlock}/10)</p>
                     </div>
                     <div className="bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200">
                        <div className="text-[10px] text-emerald-800 font-bold leading-none">NILAI</div>
                        <div className="text-xl font-black text-emerald-700 leading-none">{score.toFixed(1)}</div>
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1 mr-2">
                        <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))} className="p-1 hover:bg-white rounded"><ZoomOut size={16} /></button>
                        <span className="text-xs font-mono w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <button onClick={() => setZoomLevel(z => Math.min(3, z + 0.1))} className="p-1 hover:bg-white rounded"><ZoomIn size={16} /></button>
                     </div>
                     <button onClick={() => setIsFullScreen(false)} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200"><Minimize2 size={16} /></button>
                 </div>
              </div>
              <div className="flex-1 relative overflow-auto bg-gray-50 flex items-start justify-center p-4">
                 {imgLoading && <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
                 <div style={{ width: `${zoomLevel * 100}%`, transition: 'width 0.2s ease-out' }} className="flex justify-center min-h-full">
                    <img src={imageUrl} alt={`Page ${currentPage}`} className="w-full h-auto shadow-lg bg-white" onLoad={() => setImgLoading(false)} style={{ filter: `brightness(${imageBrightness}%) contrast(1.1)` }} />
                 </div>
              </div>
              <div className="bg-white border-t p-3 md:p-4 pb-8 z-20 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                 <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start gap-4">
                    <ScoringButtons />
                    <div className="w-full md:w-80"><NavigationButtons /></div>
                 </div>
              </div>
            </div>
        ) : (
            <div className="flex flex-col lg:flex-row h-full gap-4 animate-fade-in">
              <div className="relative bg-amber-50 rounded-xl overflow-hidden shadow-inner border border-amber-100 flex-1 flex flex-col group">
                <button onClick={() => setIsFullScreen(true)} className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur p-2 rounded-full shadow-md text-gray-700 hover:text-primary"><Maximize2 size={20} /></button>
                <div className="flex-1 overflow-y-auto flex items-start justify-center p-4">
                   {imgLoading && <div className="absolute inset-0 flex items-center justify-center bg-amber-50 z-10"><div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
                   <img src={imageUrl} alt={`Page ${currentPage}`} className="shadow-lg rounded max-w-full h-auto" onLoad={() => setImgLoading(false)} style={{ display: imgLoading ? 'none' : 'block' }} />
                </div>
                <div className="bg-white p-3 border-t text-center text-sm font-bold text-gray-500">Hal {currentPage} (Blok: {progressInBlock}/10)</div>
              </div>
              <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col shrink-0">
                <div className="p-4 border-b bg-gray-50 rounded-t-xl flex justify-between items-center"><div><h2 className="font-bold text-gray-800 leading-tight">{currentSession.student.name}</h2><p className="text-xs text-gray-500 mt-1">{currentSession.label}</p></div><div className="text-right"><div className="text-[10px] text-gray-400 font-bold">NILAI</div><div className="text-3xl font-black text-primary">{score.toFixed(1)}</div></div></div>
                <div className="p-4 space-y-4">
                   <div className="text-xs text-gray-400 mb-1">Penguji: {currentSession.examiners.join(', ')}</div>
                   <ScoringButtons />
                </div>
                <div className="flex-1"></div>
                <div className="p-4 border-t space-y-3"><NavigationButtons /><button onClick={() => { if(confirm("Batal?")) setViewMode('list'); }} className="w-full text-xs text-red-500 hover:text-red-700">Batalkan Ujian</button></div>
              </div>
            </div>
        )}
      </div>
    );
  };

  const renderSetup = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Award className="text-primary"/> Mulai Ujian Juz</h3>
        <button onClick={() => setViewMode('list')} className="text-gray-500">Batal</button>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-bold text-gray-600 mb-1">Pilih Kelas</label><select className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-primary outline-none" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}><option value="">Pilih...</option>{Array.from(new Set(students.map(s => s.class))).map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="block text-sm font-bold text-gray-600 mb-1">Nama Santri</label><select className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-primary outline-none" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}><option value="">Pilih...</option>{students.filter(s => !selectedClass || s.class === selectedClass).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Pilih Materi Juz</label>
            <div className="grid grid-cols-5 gap-2">
                {Array.from({length: 30}, (_, i) => i + 1).map(j => (
                    <button 
                        key={j} 
                        onClick={() => setSelectedJuz(j)}
                        className={`p-3 rounded-xl border font-bold transition-all ${selectedJuz === j ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 hover:border-primary'}`}
                    >
                        {j}
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-3 mb-2">
                <Book className="text-primary" size={20} />
                <h4 className="font-bold text-emerald-800">Detail Ujian: Juz {selectedJuz}</h4>
            </div>
            <div className="flex justify-between text-sm text-emerald-700">
                <span>Rentang Halaman:</span>
                <span className="font-mono font-bold">{JUZ_PAGES[selectedJuz].start} - {JUZ_PAGES[selectedJuz].end}</span>
            </div>
            <p className="text-[11px] text-emerald-600 mt-2 italic">*Kunci nilai otomatis akan muncul setiap 10 halaman hafalan.</p>
        </div>

        <button onClick={handleStartExam} className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-emerald-800 transition-all active:scale-95">
            MULAI UJIAN SEKARANG <Award size={22} />
        </button>
      </div>
    </div>
  );

  const filteredExams = exams
    .filter(e => {
        const student = students.find(s => s.id === e.studentId);
        const matchesSearch = student?.name.toLowerCase().includes(historySearchTerm.toLowerCase()) || 
                              e.studentId.toLowerCase().includes(historySearchTerm.toLowerCase());
        const matchesClass = !historyFilterClass || (student?.class === historyFilterClass);
        return matchesSearch && matchesClass && e.status !== 'remedial';
    })
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeExamSessions = exams.filter(e => e.status === 'remedial');
  const distinctExamClasses = Array.from(new Set(students.map(s => s.class))).sort();

  return <div className="min-h-[500px]">{viewMode === 'list' && (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h2 className="text-xl font-bold text-gray-800">Ujian & Penilaian</h2></div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Cari santri..." value={historySearchTerm} onChange={(e) => setHistorySearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-primary outline-none" />
          </div>
          <div className="relative w-full md:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select value={historyFilterClass} onChange={(e) => setHistoryFilterClass(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-primary outline-none bg-white"><option value="">Kelas</option>{distinctExamClasses.map(c => <option key={c} value={c}>{c}</option>)}</select>
          </div>
          {user.role === 'teacher' && <button onClick={() => setViewMode('setup')} className="bg-primary text-white px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:bg-emerald-800"><Play size={18} /> Ujian Baru</button>}
        </div>
      </div>

      {activeExamSessions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2"><PauseCircle size={20} /> Ujian Berlangsung / Tersimpan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeExamSessions.map(sess => {
                      const s = students.find(st => st.id === sess.studentId);
                      return (
                          <div key={sess.id} className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm flex flex-col justify-between">
                              <div><div className="flex justify-between items-start"><p className="font-bold text-gray-800">{s?.name}</p><span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">SESI AKTIF</span></div><p className="text-xs text-gray-500 mt-1">{sess.category} | Nilai: {sess.score}</p><p className="text-[10px] text-gray-400 mt-2">Penguji: {sess.examiner}</p></div>
                              <button onClick={() => handleResumeExam(sess)} className="mt-4 w-full bg-amber-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-amber-700 flex items-center justify-center gap-2"><Play size={14} /> LANJUTKAN UJIAN</button>
                          </div>
                      );
                  })}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.length === 0 ? <div className="col-span-full text-center py-12 text-gray-400">Belum ada data.</div> : filteredExams.map(exam => {
            const s = students.find(st => st.id === exam.studentId);
            return (
              <div key={exam.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`h-1.5 w-full ${exam.score >= 70 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2"><div><h3 className="font-bold text-gray-800 text-lg">{s?.name || 'Santri'}</h3><p className="text-sm font-medium text-primary mt-0.5">{s?.class || '-'} | {exam.category}</p></div><div className={`text-right font-black text-2xl ${exam.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>{exam.score}</div></div>
                  <div className="text-xs text-gray-500 flex justify-between mt-4 border-t pt-3"><span>{new Date(exam.date).toLocaleDateString('id-ID')}</span><span className="max-w-[120px] truncate">{exam.examiner}</span></div>
                  {(user.role === 'admin' || user.role === 'teacher') && onDeleteExam && (
                      <button onClick={() => onDeleteExam(exam.id)} className="w-full mt-3 pt-2 border-t border-dashed text-xs text-red-500 flex items-center justify-center gap-1 hover:text-red-700"><Trash2 size={12}/> Hapus</button>
                  )}
                </div>
              </div>
            );
        })}
      </div>
    </div>
  )}{viewMode === 'setup' && renderSetup()}{viewMode === 'live' && renderLiveExam()}</div>;
};

export default ExamView;
