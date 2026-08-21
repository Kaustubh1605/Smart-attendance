import React, { useState } from 'react';
import { StudyMaterial, SubjectAttendance, StudentProfile } from '../types';
import { MOCK_SUBJECTS, LOGO_URL, CURRENT_STUDENT } from '../data/mockData';

interface StudentStudyMaterialsProps {
  student?: StudentProfile;
  materials: StudyMaterial[];
  initialSubjectCode?: string;
  onNavigateHome?: () => void;
  onNavigateHistory?: () => void;
  onNavigateProfile?: () => void;
  onBack?: () => void;
}

export const StudentStudyMaterials: React.FC<StudentStudyMaterialsProps> = ({
  student = CURRENT_STUDENT,
  materials,
  initialSubjectCode,
  onNavigateHome,
  onBack,
}) => {
  const handleGoBack = onNavigateHome || onBack;
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubjectCode || 'all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
    new Set(['mat-db-01', 'mat-dsa-02', 'mat-math-02'])
  );
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('Removed from saved bookmarks');
      } else {
        next.add(id);
        showToast('Saved to offline study bookmarks');
      }
      return next;
    });
  };

  const handleDownload = (mat: StudyMaterial, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    showToast(`Downloading "${mat.fileName}" (${mat.fileSize || 'PDF'})...`);

    // Create a dummy file blob download simulation
    try {
      const blob = new Blob(
        [
          `--- SmartAttend Academic Resource ---\nSubject: ${mat.subjectName} (${mat.subjectCode})\nTopic: ${mat.unitOrTopic}\nInstructor: ${mat.instructor}\nClass: ${mat.className}\nDate: ${mat.uploadedAt}\n\n${mat.description || 'Comprehensive lecture study notes and reference material.'}`
        ],
        { type: 'text/plain;charset=utf-8' }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = mat.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // fallback
    }
  };

  // Filter materials
  const filteredMaterials = materials.filter((mat) => {
    if (selectedSubject !== 'all' && mat.subjectCode !== selectedSubject) return false;
    if (selectedType !== 'all' && mat.type !== selectedType) return false;
    if (onlyBookmarked && !bookmarkedIds.has(mat.id)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = mat.title.toLowerCase().includes(q);
      const matchSubject = mat.subjectName.toLowerCase().includes(q) || mat.subjectCode.toLowerCase().includes(q);
      const matchTopic = mat.unitOrTopic.toLowerCase().includes(q);
      const matchDesc = mat.description?.toLowerCase().includes(q) || false;
      const matchTags = mat.tags?.some((t) => t.toLowerCase().includes(q)) || false;
      return matchTitle || matchSubject || matchTopic || matchDesc || matchTags;
    }
    return true;
  });

  const getFormatBadge = (type: StudyMaterial['type']) => {
    switch (type) {
      case 'pdf':
        return {
          label: 'PDF Document',
          short: 'PDF',
          color: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]',
          icon: 'picture_as_pdf'
        };
      case 'ppt':
        return {
          label: 'Presentation Slides',
          short: 'PPTX',
          color: 'bg-[#ffdcc6] text-[#723600] border-[#ffdcc6]',
          icon: 'slideshow'
        };
      case 'lab':
        return {
          label: 'Lab Manual',
          short: 'LAB',
          color: 'bg-[#d8e2ff] text-[#031635] border-[#d8e2ff]',
          icon: 'biotech'
        };
      case 'notes':
        return {
          label: 'Lecture Notes',
          short: 'NOTES',
          color: 'bg-[#a0f399]/40 text-[#005312] border-[#a0f399]',
          icon: 'description'
        };
      case 'assignment':
        return {
          label: 'Assignment / Problem Set',
          short: 'TASK',
          color: 'bg-[#e8def8] text-[#4a4458] border-[#e8def8]',
          icon: 'assignment'
        };
      case 'link':
      default:
        return {
          label: 'External Reference',
          short: 'LINK',
          color: 'bg-[#f3f4f5] text-[#191c1d] border-[#e1e3e4]',
          icon: 'link'
        };
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f3f4f5] text-[#191c1d] pb-24 font-sans">
      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#031635] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-white/20 text-[13px] font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="material-symbols-outlined text-[18px] text-[#a0f399]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-xl border-b border-[#e1e3e4] shadow-xs">
        <div className="h-16 px-4 max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {handleGoBack ? (
              <button
                onClick={handleGoBack}
                className="w-9 h-9 rounded-full bg-[#f8f9fa] hover:bg-[#eef2ff] text-[#031635] flex items-center justify-center transition-colors cursor-pointer border border-[#e1e3e4]"
                title="Back to Dashboard"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
            ) : (
              <img alt="SmartAttend" className="h-7 w-auto shrink-0" src={LOGO_URL} />
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#75777f] uppercase tracking-wider">
                Academic Resources
              </span>
              <h1 className="text-sm md:text-base font-bold text-[#031635]">Study Materials & Notes</h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`p-2 rounded-full transition-all cursor-pointer border ${
                onlyBookmarked
                  ? 'bg-[#ffdcc6] text-[#723600] border-[#ffdcc6]'
                  : 'bg-[#f8f9fa] text-[#75777f] hover:text-[#031635] border-[#e1e3e4]'
              }`}
              title={onlyBookmarked ? 'Show All Materials' : 'Show Saved Bookmarks'}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: onlyBookmarked ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 flex flex-col gap-4">
        {/* Info & Fast Search Banner */}
        <div className="bg-gradient-to-br from-[#031635] to-[#12284c] text-white p-4.5 rounded-3xl shadow-md relative overflow-hidden flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Course Hub
                </span>
                <span className="text-[11px] text-[#b6c6ef]">Class: {student?.batch || 'BCA Sem 3'}</span>
              </div>
              <h2 className="text-[17px] font-bold text-white mt-1">Syllabus, Slides & Notes</h2>
              <p className="text-[11px] text-[#b6c6ef]">
                Access faculty-verified PPTs, PDF lecture notes, and lab manuals.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[22px]">menu_book</span>
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#75777f] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search topics, units, keywords (e.g. SQL, Trees, OS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white text-[#191c1d] rounded-2xl text-[12px] placeholder:text-[#75777f] font-medium outline-none shadow-sm focus:ring-2 focus:ring-[#a0f399]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#75777f] hover:text-[#191c1d]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10 text-center">
            <div className="flex flex-col items-center">
              <span className="text-[14px] font-extrabold text-[#a0f399]">{materials.length}</span>
              <span className="text-[9px] text-[#b6c6ef] uppercase font-semibold">Total Files</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[14px] font-extrabold text-white">{MOCK_SUBJECTS.length}</span>
              <span className="text-[9px] text-[#b6c6ef] uppercase font-semibold">Subjects</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[14px] font-extrabold text-[#ffdcc6]">{bookmarkedIds.size}</span>
              <span className="text-[9px] text-[#b6c6ef] uppercase font-semibold">Saved Notes</span>
            </div>
          </div>
        </div>

        {/* Subject Filter Carousel */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center px-1">
            <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">
              Filter by Subject
            </span>
            {selectedSubject !== 'all' && (
              <button
                onClick={() => setSelectedSubject('all')}
                className="text-[11px] font-bold text-[#031635] hover:underline cursor-pointer"
              >
                View All
              </button>
            )}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedSubject === 'all'
                  ? 'bg-[#031635] text-white shadow-xs'
                  : 'bg-white text-[#44474e] border border-[#e1e3e4] hover:bg-[#f8f9fa]'
              }`}
            >
              All Subjects ({materials.length})
            </button>
            {MOCK_SUBJECTS.map((subj) => {
              const count = materials.filter((m) => m.subjectCode === subj.code).length;
              return (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubject(subj.code)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    selectedSubject === subj.code
                      ? 'bg-[#031635] text-white shadow-xs'
                      : 'bg-white text-[#44474e] border border-[#e1e3e4] hover:bg-[#f8f9fa]'
                  }`}
                >
                  <span>{subj.code}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedSubject === subj.code ? 'bg-white/20 text-white' : 'bg-[#f3f4f5] text-[#75777f]'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Type Selector Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Types', icon: 'apps' },
            { id: 'pdf', label: 'PDFs & Notes', icon: 'picture_as_pdf' },
            { id: 'ppt', label: 'PPT Slides', icon: 'slideshow' },
            { id: 'lab', label: 'Lab Manuals', icon: 'biotech' },
            { id: 'assignment', label: 'Assignments', icon: 'assignment' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 border ${
                selectedType === t.id
                  ? 'bg-[#d8e2ff] text-[#031635] border-[#d8e2ff] shadow-xs'
                  : 'bg-white text-[#75777f] border-[#e1e3e4] hover:text-[#191c1d]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Materials List */}
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex justify-between items-center px-1">
            <span className="text-[12px] font-bold text-[#031635]">
              {filteredMaterials.length} {filteredMaterials.length === 1 ? 'Resource' : 'Resources'} Found
            </span>
            {onlyBookmarked && (
              <span className="text-[11px] font-semibold text-[#723600] bg-[#ffdcc6] px-2 py-0.5 rounded-full">
                Saved Bookmarks Only
              </span>
            )}
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-[#e1e3e4] text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#f3f4f5] text-[#75777f] flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px]">folder_off</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-[#031635]">No Study Materials Found</h3>
                <p className="text-[12px] text-[#75777f] max-w-xs">
                  {searchQuery || selectedType !== 'all' || selectedSubject !== 'all'
                    ? 'Try clearing your search query or selecting a different subject/type filter.'
                    : 'Your faculty has not uploaded study materials for this category yet.'}
                </p>
              </div>
              {(searchQuery || selectedType !== 'all' || selectedSubject !== 'all' || onlyBookmarked) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('all');
                    setSelectedType('all');
                    setOnlyBookmarked(false);
                  }}
                  className="px-4 py-2 bg-[#031635] text-white rounded-xl text-[12px] font-bold hover:bg-[#12284c] transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            filteredMaterials.map((mat) => {
              const badge = getFormatBadge(mat.type);
              const isSaved = bookmarkedIds.has(mat.id);

              return (
                <div
                  key={mat.id}
                  onClick={() => setPreviewMaterial(mat)}
                  className="bg-white rounded-2xl p-4 border border-[#e1e3e4] hover:border-[#c5c6cf] shadow-xs transition-all cursor-pointer flex flex-col gap-2.5 relative group"
                >
                  {/* Top Bar: Subject & Badges */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-[#031635] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        {mat.subjectCode}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.color}`}>
                        <span className="material-symbols-outlined text-[13px]">{badge.icon}</span>
                        <span>{badge.short}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-[#75777f] truncate max-w-[150px]">
                        {mat.subjectName}
                      </span>
                    </div>

                    <button
                      onClick={(e) => toggleBookmark(mat.id, e)}
                      className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        isSaved ? 'text-[#723600] bg-[#ffdcc6]' : 'text-[#75777f] hover:text-[#031635] hover:bg-[#f3f4f5]'
                      }`}
                      title={isSaved ? 'Remove bookmark' : 'Save for offline'}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        bookmark
                      </span>
                    </button>
                  </div>

                  {/* Title & Unit */}
                  <div className="flex flex-col">
                    <h3 className="text-[13px] font-bold text-[#031635] leading-snug group-hover:text-[#0b57d0] transition-colors">
                      {mat.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#75777f] mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">topic</span>
                      <span>{mat.unitOrTopic}</span>
                    </span>
                  </div>

                  {/* Description preview */}
                  {mat.description && (
                    <p className="text-[11px] text-[#44474e] line-clamp-2 leading-relaxed bg-[#f8f9fa] p-2 rounded-xl border border-[#f3f4f5]">
                      {mat.description}
                    </p>
                  )}

                  {/* Tag Chips */}
                  {mat.tags && mat.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {mat.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="bg-[#f3f4f5] text-[#5c5f62] text-[9px] font-semibold px-2 py-0.5 rounded-md"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer & Action Buttons */}
                  <div className="flex justify-between items-center pt-2 border-t border-[#f3f4f5] text-[11px] text-[#75777f]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#44474e]">{mat.instructor}</span>
                      <span>•</span>
                      <span>{mat.fileSize || '3.2 MB'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewMaterial(mat);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#031635] bg-[#eef2ff] hover:bg-[#d8e2ff] transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={(e) => handleDownload(mat, e)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white bg-[#031635] hover:bg-[#12284c] transition-all flex items-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Interactive Document Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#e1e3e4] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-[#e1e3e4] bg-[#031635] text-white flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[24px]">
                    {getFormatBadge(previewMaterial.type).icon}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      {previewMaterial.subjectCode}
                    </span>
                    <span className="text-[11px] text-[#b6c6ef]">{previewMaterial.subjectName}</span>
                  </div>
                  <h2 className="text-[15px] md:text-[16px] font-bold text-white mt-1 leading-snug">
                    {previewMaterial.title}
                  </h2>
                  <span className="text-[11px] text-[#b6c6ef]">{previewMaterial.unitOrTopic}</span>
                </div>
              </div>

              <button
                onClick={() => setPreviewMaterial(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 md:p-5 overflow-y-auto flex flex-col gap-4 text-[#191c1d]">
              {/* Document Metadata Pill Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#f8f9fa] p-3 rounded-2xl border border-[#e1e3e4] text-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#75777f] uppercase">Format</span>
                  <span className="text-[12px] font-bold text-[#031635] uppercase">
                    {previewMaterial.type}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#75777f] uppercase">File Size</span>
                  <span className="text-[12px] font-bold text-[#031635]">
                    {previewMaterial.fileSize || '3.5 MB'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#75777f] uppercase">Instructor</span>
                  <span className="text-[12px] font-bold text-[#031635]">
                    {previewMaterial.instructor}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#75777f] uppercase">Uploaded</span>
                  <span className="text-[12px] font-bold text-[#031635]">
                    {previewMaterial.uploadedAt}
                  </span>
                </div>
              </div>

              {/* Document Summary / Description */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">
                  Resource Overview & Syllabus Mapping
                </span>
                <p className="text-[12px] text-[#44474e] leading-relaxed bg-[#f8f9fa] p-3 rounded-2xl border border-[#e1e3e4]">
                  {previewMaterial.description ||
                    'Official academic lecture companion material published by faculty for classroom instruction and semester review.'}
                </p>
              </div>

              {/* Document Interactive Viewer Canvas Mockup */}
              <div className="border border-[#e1e3e4] rounded-2xl overflow-hidden bg-[#fafafa]">
                <div className="bg-[#eef2ff] px-3 py-2 border-b border-[#d8e2ff] flex justify-between items-center text-[11px] font-bold text-[#031635]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#031635]">auto_stories</span>
                    <span>Document Content Preview (Page 1 of 8)</span>
                  </div>
                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-[#d8e2ff]">
                    {previewMaterial.fileName}
                  </span>
                </div>

                <div className="p-4 space-y-3 font-serif text-[12px] text-[#2d3133] leading-relaxed bg-white min-h-[160px]">
                  <div className="border-b border-[#e1e3e4] pb-2 font-sans font-bold text-[13px] text-[#031635]">
                    {previewMaterial.subjectName} — {previewMaterial.unitOrTopic}
                  </div>
                  <p>
                    <strong>1. Core Concepts & Objectives:</strong> This reference module provides the theoretical foundations and implementation benchmarks required for {previewMaterial.subjectCode}. Students should review key definitions, theorems, and practical examples.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-[#555]">
                    <li>Detailed architectural breakdown and structural models.</li>
                    <li>Step-by-step problem-solving heuristics and case analysis.</li>
                    <li>Examination focus areas and common pitfall highlights.</li>
                  </ul>
                  <div className="mt-2 p-2 bg-[#f3f4f5] rounded-lg font-mono text-[10px] text-[#555]">
                    [ Verified Official University Courseware • SHA256 Verified ]
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f8f9fa] border-t border-[#e1e3e4] flex justify-between items-center flex-wrap gap-2">
              <button
                onClick={(e) => toggleBookmark(previewMaterial.id, e)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  bookmarkedIds.has(previewMaterial.id)
                    ? 'bg-[#ffdcc6] text-[#723600] border border-[#ffdcc6]'
                    : 'bg-white text-[#44474e] border border-[#e1e3e4] hover:bg-[#f3f4f5]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {bookmarkedIds.has(previewMaterial.id) ? 'bookmark_added' : 'bookmark_add'}
                </span>
                <span>{bookmarkedIds.has(previewMaterial.id) ? 'Saved' : 'Save Bookmark'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold text-[#44474e] bg-white border border-[#e1e3e4] hover:bg-[#f3f4f5] cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload(previewMaterial)}
                  className="px-4.5 py-2 rounded-xl text-[12px] font-bold text-white bg-[#031635] hover:bg-[#12284c] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
