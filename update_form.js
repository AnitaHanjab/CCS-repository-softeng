const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/ManagePapers.jsx', 'utf8');

// 1. Add states
code = code.replace(
  "const [authorSearchTerm, setAuthorSearchTerm] = useState(''); // New state for author search",
  "const [authorSearchTerm, setAuthorSearchTerm] = useState(''); // New state for author search\n  const [paperQueue, setPaperQueue] = useState([]);\n  const [category, setCategory] = useState('');\n  const [editingQueueIndex, setEditingQueueIndex] = useState(null);"
);

// 2. Add Category Radio Buttons
const categoryHtml = `{/* Category */}
                  <div className="form-group">
                    <label className="form-label">
                      Category <span className="required">*</span>
                    </label>
                    <div className="radio-group" style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="category"
                          value="Computer Science"
                          checked={category === 'Computer Science'}
                          onChange={() => setCategory('Computer Science')}
                          required
                        />
                        Computer Science
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="category"
                          value="Information Technology"
                          checked={category === 'Information Technology'}
                          onChange={() => setCategory('Information Technology')}
                          required
                        />
                        Information Technology
                      </label>
                    </div>
                  </div>

                  {/* Keywords */}`;

// Only replace the first occurrence (Upload form) and second occurrence (Edit form)
// Wait, I should just replace both occurrences of {/* Keywords */} with the category + keywords
code = code.replace(/\{\/\* Keywords \*\/\}/g, categoryHtml);

// 3. Reset form should also clear category and editingQueueIndex
code = code.replace(
  "setSelectedUserId('');\n  };",
  "setSelectedUserId('');\n    setCategory('');\n    setEditingQueueIndex(null);\n  };"
);

// 4. Update the handleAddAnother function (insert before handleUpload)
const handleAddAnotherStr = `
  const handleAddAnother = () => {
    // Validation
    if (!title.trim() || !abstract.trim() || !category || keywordsList.length === 0 || selectedFiles.length === 0) {
      const msg = 'Please complete and upload the current research paper before adding another.';
      setMessage(msg);
      notifyError(msg);
      return;
    }
    
    // Create paper object
    const newPaper = {
      title,
      abstract,
      category,
      keywords: [...keywordsList],
      sdgs: [...selectedSDGs],
      authors: [...authorsList],
      files: [...selectedFiles],
      isPublished,
      journal,
      year,
      publisher,
      doi,
      references,
      hasPublisher,
      hasDoi,
      hasConference,
      conferenceProceeding
    };

    if (editingQueueIndex !== null) {
      // Update existing
      const newQueue = [...paperQueue];
      newQueue[editingQueueIndex] = newPaper;
      setPaperQueue(newQueue);
    } else {
      // Add to queue
      setPaperQueue([...paperQueue, newPaper]);
    }
    
    resetForm();
  };

  const handleEditQueueItem = (index) => {
    const p = paperQueue[index];
    setTitle(p.title);
    setAbstract(p.abstract);
    setCategory(p.category);
    setKeywordsList([...p.keywords]);
    setSelectedSDGs([...p.sdgs]);
    setAuthorsList([...p.authors]);
    setSelectedFiles([...p.files]);
    setIsPublished(p.isPublished);
    setJournal(p.journal);
    setYear(p.year);
    setPublisher(p.publisher);
    setDoi(p.doi);
    setReferences(p.references);
    setHasPublisher(p.hasPublisher);
    setHasDoi(p.hasDoi);
    setHasConference(p.hasConference);
    setConferenceProceeding(p.conferenceProceeding);
    setEditingQueueIndex(index);
  };

  const handleDeleteQueueItem = (index) => {
    const newQueue = paperQueue.filter((_, i) => i !== index);
    setPaperQueue(newQueue);
    if (editingQueueIndex === index) {
      resetForm();
    } else if (editingQueueIndex > index) {
      setEditingQueueIndex(editingQueueIndex - 1);
    }
  };

  const handleSubmitAll = async (event) => {
    if (event) event.preventDefault();
    
    let finalQueue = [...paperQueue];
    
    // If the current form has enough data, automatically add it
    if (title.trim() && abstract.trim() && category && keywordsList.length > 0 && selectedFiles.length > 0) {
      const currentPaper = {
        title, abstract, category, keywords: [...keywordsList], sdgs: [...selectedSDGs], authors: [...authorsList],
        files: [...selectedFiles], isPublished, journal, year, publisher, doi, references,
        hasPublisher, hasDoi, hasConference, conferenceProceeding
      };
      if (editingQueueIndex !== null) {
        finalQueue[editingQueueIndex] = currentPaper;
      } else {
        finalQueue.push(currentPaper);
      }
    } else if (finalQueue.length === 0) {
      const msg = 'Please complete the form before submitting.';
      setMessage(msg);
      notifyError(msg);
      return;
    }
    
    setUploading(true);
    try {
      let totalFiles = 0;
      for (const paper of finalQueue) {
        const additionalData = {
          journal: paper.isPublished ? paper.journal : '',
          isPublished: paper.isPublished,
          year: paper.year,
          publisher: paper.isPublished && paper.hasPublisher ? paper.publisher : '',
          authors: paper.authors,
          tags: paper.keywords,
          sdgs: paper.sdgs.map(sdg => typeof sdg === 'object' ? sdg : { id: sdg }),
          doi: paper.isPublished && paper.hasDoi ? paper.doi : '',
          references: paper.references,
          conferenceProceeding: paper.isPublished && paper.hasConference,
          category: paper.category
        };
        
        await paperService.uploadMultiple(paper.files, userId, paper.title, paper.abstract, additionalData);
        totalFiles += paper.files.length;
      }
      setMessage(\`\${finalQueue.length} paper(s) uploaded successfully!\`);
      setPaperQueue([]);
      closeUploadModal();
      loadPapers(); // Refresh the list
    } catch (error) {
      setMessage('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };
`;

code = code.replace('const handleUpload = async (event) => {', handleAddAnotherStr + '\n  const handleUpload = async (event) => {');

// 5. Replace Upload modal submit button with "Add Another Research" and "Submit All Papers"
const formActionsRegex = /<div className="form-actions">\s*<button\s*type="button"\s*onClick=\{closeUploadModal\}\s*className="cancel-button"\s*>\s*Cancel\s*<\/button>\s*<button\s*type="submit"\s*disabled=\{[^\}]+\}\s*className="upload-button"\s*>\s*\{uploading \?\s*<><i className="fas fa-spinner fa-spin"><\/i> Uploading...<\/> :\s*<><i className="fas fa-cloud-upload-alt"><\/i> Upload Paper<\/>\s*\}\s*<\/button>\s*<\/div>/g;

const newFormActions = `<div className="form-actions" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <button
                      type="button"
                      onClick={closeUploadModal}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={handleAddAnother}
                        className="upload-button"
                        style={{ backgroundColor: '#4a5568' }}
                      >
                        <i className="fas fa-plus"></i> Add Another Research
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitAll}
                        disabled={uploading || (paperQueue.length === 0 && (!title || !abstract || !category || selectedFiles.length === 0))}
                        className="upload-button"
                      >
                        {uploading ? 
                          <><i className="fas fa-spinner fa-spin"></i> Submitting...</> : 
                          <><i className="fas fa-paper-plane"></i> Submit All Papers</>
                        }
                      </button>
                    </div>
                  </div>`;

// Only replace the first occurrence (which is the upload modal, not the edit modal)
code = code.replace(formActionsRegex, (match, offset) => {
  if (offset < code.indexOf('Edit Modal')) {
    return newFormActions;
  }
  return match;
});

// 6. Add Queue UI to the top of Upload form
const queueUI = `
                {paperQueue.length > 0 && (
                  <div className="paper-queue-section" style={{ padding: '15px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#2d3748' }}>Added Papers ({paperQueue.length})</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {paperQueue.map((p, idx) => (
                        <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'white', borderRadius: '6px', marginBottom: '8px', border: '1px solid #e2e8f0', borderLeft: editingQueueIndex === idx ? '4px solid var(--royal-velvet)' : '1px solid #e2e8f0' }}>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontWeight: '500', color: '#1a202c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                            <div style={{ fontSize: '12px', color: '#718096' }}>{p.category} • {p.files.length} file(s)</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" onClick={() => handleEditQueueItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a5568', padding: '5px' }} title="Edit">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button type="button" onClick={() => handleDeleteQueueItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', padding: '5px' }} title="Delete">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
`;

code = code.replace('<form onSubmit={handleUpload} className="upload-form">', queueUI + '\n                <form onSubmit={handleSubmitAll} className="upload-form">');

fs.writeFileSync('frontend/src/pages/ManagePapers.jsx', code);
console.log('Update complete.');