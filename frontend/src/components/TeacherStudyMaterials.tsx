import React, { useState } from 'react';
import { StudyMaterial, Lecture } from '../types';
import { MOCK_SUBJECTS, generateUniqueId } from '../data/mockData';

interface TeacherStudyMaterialsProps {
  materials: StudyMaterial[];
  onAddMaterial: (material: StudyMaterial) => void;
  onUpdateMaterial: (material: StudyMaterial) => void;
  onDeleteMaterial: (materialId: string) => void;
  lectures?: Lecture[];
}

export const TeacherStudyMaterials: React.FC<TeacherStudyMaterialsProps> = ({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<StudyMaterial | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formSubjectCode, setFormSubjectCode] = useState<string>('BCA 301');
  const [formSubjectName, setFormSubjectName] = useState<string>('Database Systems');
  const [formClassName, setFormClassName] = useState<string>('BCA-A');
  const [formInstructor, setFormInstructor] = useState<string>('Prof. Sharma');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formType, setFormType] = useState<StudyMaterial['type']>('pdf');
  const [formUnitOrTopic, setFormUnitOrTopic] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formFileName, setFormFileName] = useState<string>('');
  const [formFileSize, setFormFileSize] = useState<string>('3.5 MB');
  const [formTags, setFormTags] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openAddModal = () => {
    setFormSubjectCode('BCA 301');
    setFormSubjectName('Database Systems');
    setFormClassName('BCA-A');
    setFormInstructor('Prof. Sharma');
    setFormTitle('');
    setFormType('pdf');
    setFormUnitOrTopic('Unit 1: Introduction');
    setFormDescription('');
    setFormFileName('');
    setFormFileSize('3.2 MB');
    setFormTags('');
    setFormError(null);
    setEditingMaterial(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (mat: StudyMaterial) => {
    setEditingMaterial(mat);
    setFormSubjectCode(mat.subjectCode);
    setFormSubjectName(mat.subjectName);
    setFormClassName(mat.className || 'BCA-A');
    setFormInstructor(mat.instructor);
    setFormTitle(mat.title);
    setFormType(mat.type);
    setFormUnitOrTopic(mat.unitOrTopic);
    setFormDescription(mat.description || '');
    setFormFileName(mat.fileName);
    setFormFileSize(mat.fileSize || '3.5 MB');
    setFormTags(mat.tags ? mat.tags.join(', ') : '');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSubjectSelect = (code: string) => {
    setFormSubjectCode(code);
    const found = MOCK_SUBJECTS.find((s) => s.code === code);
    if (found) {
      setFormSubjectName(found.name);
    }
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError('Please enter a descriptive resource title.');
      return;
    }
    if (!formUnitOrTopic.trim()) {
      setFormError('Please specify the syllabus Unit / Topic.');
      return;
    }

    const computedFileName =
      formFileName.trim() ||
      `${formSubjectCode.replace(/\s+/g, '_')}_${formUnitOrTopic.replace(/\s+/g, '_').slice(0, 20)}.${
        formType === 'ppt' ? 'pptx' : formType === 'pdf' ? 'pdf' : 'pdf'
      }`;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingMaterial) {
      // Update
      const updated: StudyMaterial = {
        ...editingMaterial,
        title: formTitle.trim(),
        subjectCode: formSubjectCode,
        subjectName: formSubjectName,
        className: formClassName,
        instructor: formInstructor,
        type: formType,
        unitOrTopic: formUnitOrTopic.trim(),
        description: formDescription.trim() || undefined,
        fileName: computedFileName,
        fileSize: formFileSize,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      };
      onUpdateMaterial(updated);
      showToast(`✓ Study material "${updated.title}" updated successfully`);
    } else {
      // Add New
      const newMaterial: StudyMaterial = {
        id: generateUniqueId('mat'),
        title: formTitle.trim(),
        subjectCode: formSubjectCode,
        subjectName: formSubjectName,
        className: formClassName,
        instructor: formInstructor,
        type: formType,
        unitOrTopic: formUnitOrTopic.trim(),
        description: formDescription.trim() || undefined,
        fileName: computedFileName,
        fileSize: formFileSize,
        uploadedAt: new Date().toISOString().slice(0, 10),
        downloadCount: 0,
        tags: tagsArray.length > 0 ? tagsArray : [formSubjectCode, formType],
      };
      onAddMaterial(newMaterial);
      showToast(`✓ Study material "${newMaterial.title}" published to ${formClassName}`);
    }

    setIsAddModalOpen(false);
    setEditingMaterial(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingMaterial) return;
    onDeleteMaterial(deletingMaterial.id);
    showToast(`✓ Material "${deletingMaterial.title}" removed`);
    setDeletingMaterial(null);
  };

  // Filter materials
  const filteredMaterials = materials.filter((mat) => {
    if (selectedSubject !== 'all' && mat.subjectCode !== selectedSubject) return false;
    if (selectedType !== 'all' && mat.type !== selectedType) return false;
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
          label: 'PDF Doc',
          short: 'PDF',
          color: 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]',
          icon: 'picture_as_pdf'
        };
      case 'ppt':
        return {
          label: 'Presentation PPT',
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
          label: 'Assignment Set',
          short: 'TASK',
          color: 'bg-[#e8def8] text-[#4a4458] border-[#e8def8]',
          icon: 'assignment'
        };
      case 'link':
      default:
        return {
          label: 'External Link',
          short: 'LINK',
          color: 'bg-[#f3f4f5] text-[#191c1d] border-[#e1e3e4]',
          icon: 'link'
        };
    }
  };

  const totalDownloads = materials.reduce((acc, m) => acc + (m.downloadCount || 0), 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#031635] text-white px-4.5 py-3 rounded-2xl shadow-2xl border border-white/20 text-[13px] font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="material-symbols-outlined text-[19px] text-[#a0f399]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Action Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#e1e3e4] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#031635] text-[#a0f399] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">folder_shared</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#75777f] uppercase tracking-wider">
                Courseware Repository
              </span>
              <span className="bg-[#eef2ff] text-[#031635] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Semester Active
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#031635] mt-0.5">Faculty Study Materials & Resources</h1>
            <p className="text-[13px] text-[#75777f]">
              Publish lecture slides, PDF notes, lab manuals, and assignments organized per subject.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-[#031635] hover:bg-[#12284c] text-white text-[13px] font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px] text-[#a0f399]">add_circle</span>
          <span>Add Study Material</span>
        </button>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d8e2ff] text-[#031635] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">description</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#75777f] uppercase">Total Files</span>
            <span className="text-xl font-extrabold text-[#031635]">{materials.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ffdcc6] text-[#723600] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">slideshow</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#75777f] uppercase">Presentations</span>
            <span className="text-xl font-extrabold text-[#031635]">
              {materials.filter((m) => m.type === 'ppt').length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#a0f399]/40 text-[#005312] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">download</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#75777f] uppercase">Total Downloads</span>
            <span className="text-xl font-extrabold text-[#031635]">{totalDownloads}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e1e3e4] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e8def8] text-[#4a4458] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">school</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#75777f] uppercase">Active Subjects</span>
            <span className="text-xl font-extrabold text-[#031635]">{MOCK_SUBJECTS.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#e1e3e4] shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#75777f] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search material title, topic, subject code, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] placeholder:text-[#75777f] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#031635]"
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

        {/* Subject and Type Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[12px] font-bold text-[#031635] outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-[#031635]"
          >
            <option value="all">All Subjects ({materials.length})</option>
            {MOCK_SUBJECTS.map((s) => (
              <option key={s.id} value={s.code}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[12px] font-bold text-[#031635] outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-[#031635]"
          >
            <option value="all">All Document Types</option>
            <option value="pdf">PDF Documents</option>
            <option value="ppt">PPT Presentations</option>
            <option value="notes">Lecture Notes</option>
            <option value="lab">Lab Manuals</option>
            <option value="assignment">Assignments</option>
          </select>
        </div>
      </div>

      {/* Materials Table & Grid */}
      <div className="bg-white rounded-3xl border border-[#e1e3e4] shadow-xs overflow-hidden">
        <div className="p-4 md:p-5 border-b border-[#e1e3e4] flex justify-between items-center bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[14px] text-[#031635]">Published Course Materials</span>
            <span className="text-[11px] font-extrabold bg-[#eef2ff] text-[#031635] px-2.5 py-0.5 rounded-full border border-[#d8e2ff]">
              {filteredMaterials.length} items
            </span>
          </div>

          <span className="text-[12px] text-[#75777f]">
            Target Classes: <strong className="text-[#031635]">BCA Sem 3 (Div A & B)</strong>
          </span>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#f3f4f5] text-[#75777f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">folder_off</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-bold text-[#031635]">No Study Materials Found</h3>
              <p className="text-[13px] text-[#75777f] max-w-md">
                No materials match your current subject or type filter. You can publish a new lecture PPT, PDF note, or lab guide.
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="mt-2 px-4 py-2 bg-[#031635] text-white rounded-xl text-[12px] font-bold hover:bg-[#12284c] transition-all cursor-pointer"
            >
              + Upload Study Material
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#e1e3e4]">
            {filteredMaterials.map((mat) => {
              const badge = getFormatBadge(mat.type);

              return (
                <div
                  key={mat.id}
                  className="p-4 md:p-5 hover:bg-[#f8f9fa] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  {/* Left Metadata */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#f3f4f5] text-[#031635] flex items-center justify-center shrink-0 border border-[#e1e3e4]">
                      <span className="material-symbols-outlined text-[22px]">{badge.icon}</span>
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#031635] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          {mat.subjectCode}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.color}`}>
                          {badge.short}
                        </span>
                        <span className="text-[11px] font-bold text-[#75777f]">{mat.subjectName}</span>
                        <span className="text-[11px] text-[#75777f]">•</span>
                        <span className="text-[11px] font-semibold text-[#005312] bg-[#a0f399]/30 px-2 py-0.2 rounded-md">
                          {mat.className || 'BCA-A'}
                        </span>
                      </div>

                      <h3 className="text-[14px] font-bold text-[#031635] mt-1 leading-snug truncate">
                        {mat.title}
                      </h3>

                      <div className="flex items-center gap-3 text-[11px] text-[#75777f] mt-1 flex-wrap">
                        <span className="font-semibold text-[#44474e] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">topic</span>
                          <span>{mat.unitOrTopic}</span>
                        </span>
                        <span>•</span>
                        <span>{mat.fileName}</span>
                        <span>•</span>
                        <span>{mat.fileSize || '3.5 MB'}</span>
                        <span>•</span>
                        <span>Uploaded {mat.uploadedAt}</span>
                        <span>•</span>
                        <span className="text-[#031635] font-semibold">
                          {mat.downloadCount || 0} student downloads
                        </span>
                      </div>

                      {mat.description && (
                        <p className="text-[12px] text-[#555] line-clamp-1 mt-1">{mat.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => setPreviewMaterial(mat)}
                      className="px-3 py-1.5 rounded-xl text-[12px] font-bold text-[#031635] bg-[#eef2ff] hover:bg-[#d8e2ff] transition-all flex items-center gap-1 cursor-pointer"
                      title="Preview Document"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => openEditModal(mat)}
                      className="px-3 py-1.5 rounded-xl text-[12px] font-bold text-[#44474e] bg-white border border-[#e1e3e4] hover:bg-[#f3f4f5] transition-all flex items-center gap-1 cursor-pointer"
                      title="Edit Material Metadata"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeletingMaterial(mat)}
                      className="p-1.5 rounded-xl text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-all cursor-pointer"
                      title="Delete Study Material"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Study Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-[#e1e3e4] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e1e3e4] bg-[#031635] text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#a0f399] text-[#005312] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">
                    {editingMaterial ? 'edit_document' : 'upload_file'}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingMaterial ? 'Edit Study Material' : 'Add New Study Material'}
                  </h2>
                  <p className="text-[12px] text-[#b6c6ef]">
                    Upload and publish course documents to student portal
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMaterial} className="p-5 overflow-y-auto flex flex-col gap-4 text-[#191c1d]">
              {formError && (
                <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-2xl text-[12px] font-bold flex items-center gap-2 border border-[#ffb4ab]">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Subject Selection & Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#75777f] uppercase">Course / Subject</label>
                  <select
                    value={formSubjectCode}
                    onChange={(e) => handleSubjectSelect(e.target.value)}
                    className="p-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] font-bold text-[#031635] outline-none focus:bg-white focus:ring-2 focus:ring-[#031635]"
                  >
                    {MOCK_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#75777f] uppercase">Target Class / Div</label>
                  <input
                    type="text"
                    value={formClassName}
                    onChange={(e) => setFormClassName(e.target.value)}
                    placeholder="e.g. BCA-A or All"
                    className="p-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:bg-white focus:ring-2 focus:ring-[#031635]"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#75777f] uppercase">
                  Resource Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Unit 2: SQL Optimization & Indexing Slides"
                  className="p-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] font-medium outline-none focus:bg-white focus:ring-2 focus:ring-[#031635]"
                  required
                />
              </div>

              {/* Resource Type & Unit/Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#75777f] uppercase">Resource Format</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as StudyMaterial['type'])}
                    className="p-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] font-bold text-[#031635] outline-none focus:bg-white focus:ring-2 focus:ring-[#031635]"
                  >
                    <option value="pdf">📄 PDF Document</option>
                    <option value="ppt">📊 Presentation PPT/Slides</option>
                    <option value="notes">📝 Lecture Notes</option>
                    <option value="lab">🧪 Lab Practical Manual</option>
                    <option value="assignment">📋 Assignment / Problem Set</option>
                    <option value="link">🔗 Reference Link</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#75777f] uppercase">
                    Syllabus Unit / Module <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formUnitOrTopic}
                    onChange={(e) => setFormUnitOrTopic(e.target.value)}
                    placeholder="e.g. Unit 2: Indexing & B+ Trees"
                    className="p-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:bg-white focus:ring-2 focus:ring-[#031635]"
                    required
                  />
                </div>
              </div>

              {/* File Attachment Simulation & File Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#75777f] uppercase">File Name</label>
                  <input
                    type="text"
                    value={formFileName}
                    onChange={(e) => setFormFileName(e.target.value)}
                    placeholder="e.g. DBMS_Unit2_Indexing_Slides.pptx"
                    className="p-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:bg-white focus:ring-2 focus:ring-[#031635]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-[#75777f] uppercase">Estimated Size</label>
                  <input
                    type="text"
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    placeholder="e.g. 4.8 MB"
                    className="p-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:bg-white focus:ring-2 focus:ring-[#031635]"
                  />
                </div>
              </div>

              {/* Description & Syllabus Notes */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#75777f] uppercase">
                  Description / Instructions for Students
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline topics covered, reading benchmarks, or exam preparation points..."
                  className="p-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:bg-white focus:ring-2 focus:ring-[#031635] resize-none"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#75777f] uppercase">
                  Search Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. SQL, Indexing, B+ Trees, Midterm"
                  className="p-2.5 bg-[#f8f9fa] border border-[#e1e3e4] rounded-xl text-[13px] text-[#191c1d] outline-none focus:bg-white focus:ring-2 focus:ring-[#031635]"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#e1e3e4] flex justify-end items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#44474e] bg-[#f8f9fa] hover:bg-[#e1e3e4] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#031635] hover:bg-[#12284c] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#a0f399]">
                    {editingMaterial ? 'check' : 'cloud_upload'}
                  </span>
                  <span>{editingMaterial ? 'Update Resource' : 'Publish Material'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#e1e3e4] p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#031635]">Delete Study Material?</h3>
              <p className="text-[13px] text-[#75777f]">
                Are you sure you want to permanently delete{' '}
                <strong className="text-[#031635]">"{deletingMaterial.title}"</strong> for{' '}
                {deletingMaterial.subjectCode}? Students will no longer be able to download or view this file.
              </p>
            </div>

            <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#e1e3e4]">
              <button
                onClick={() => setDeletingMaterial(null)}
                className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#44474e] bg-[#f8f9fa] hover:bg-[#e1e3e4] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#ba1a1a] hover:bg-[#93000a] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#e1e3e4] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#e1e3e4] bg-[#031635] text-white flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">
                    {getFormatBadge(previewMaterial.type).icon}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#a0f399] text-[#005312] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      {previewMaterial.subjectCode}
                    </span>
                    <span className="text-[11px] text-[#b6c6ef]">{previewMaterial.subjectName}</span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1 leading-snug">{previewMaterial.title}</h2>
                  <span className="text-[11px] text-[#b6c6ef]">{previewMaterial.unitOrTopic}</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-4 text-[#191c1d]">
              <div className="grid grid-cols-3 gap-2 bg-[#f8f9fa] p-3 rounded-2xl border border-[#e1e3e4] text-center">
                <div>
                  <span className="text-[10px] font-bold text-[#75777f] uppercase">Format</span>
                  <p className="text-[12px] font-bold text-[#031635] uppercase">{previewMaterial.type}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#75777f] uppercase">File Size</span>
                  <p className="text-[12px] font-bold text-[#031635]">{previewMaterial.fileSize || '3.5 MB'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#75777f] uppercase">Downloads</span>
                  <p className="text-[12px] font-bold text-[#031635]">{previewMaterial.downloadCount || 0}</p>
                </div>
              </div>

              {previewMaterial.description && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-[#75777f] uppercase">Description</span>
                  <p className="text-[12px] text-[#44474e] bg-[#f8f9fa] p-3 rounded-2xl border border-[#e1e3e4] leading-relaxed">
                    {previewMaterial.description}
                  </p>
                </div>
              )}

              <div className="p-4 bg-white border border-[#e1e3e4] rounded-2xl font-serif text-[12px] text-[#333] space-y-2">
                <div className="font-sans font-bold text-[13px] text-[#031635]">
                  {previewMaterial.subjectName} — Lecture Companion Outline
                </div>
                <p>
                  Official material published for {previewMaterial.className || 'BCA-A'} students. File:{' '}
                  <code>{previewMaterial.fileName}</code>
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#f8f9fa] border-t border-[#e1e3e4] flex justify-end gap-2">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 rounded-xl text-[12px] font-bold text-[#44474e] bg-white border border-[#e1e3e4] hover:bg-[#f3f4f5] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
