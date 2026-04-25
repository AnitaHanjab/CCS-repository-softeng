# Frontend Integration Guide - Button Updates & UI Enhancements

## Overview
This guide shows optional frontend updates to improve the user experience for the new features. These changes are **recommended but not required** for functionality.

---

## 1. Update ManagePapers.jsx - Add Preview Button

### Current State
- Papers page has download functionality
- No dedicated preview button

### Recommended Change

**Add this function to ManagePapers.jsx:**

```javascript
// Add near the handleDownload function (around line 589)
const handlePreview = async (paper) => {
  try {
    const user = localStorage.getItem('user');
    if (!user) {
      showMessage('Please sign in to preview papers', 'error');
      return;
    }

    const userData = JSON.parse(user);
    const userId = userData.id || userData._id;

    if (!userId) {
      showMessage('User information not found', 'error');
      return;
    }

    showMessage('Opening preview...', 'info');
    const response = await paperService.previewPaper(paper.id, userId);
    
    // Create blob and open in new tab/window
    const pdfBlob = new Blob([response.data], { 
      type: response.data.type || 'application/pdf' 
    });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Open in new window for better viewing
    window.open(pdfUrl, paper.title || 'Paper Preview', 'width=1200,height=800');
  } catch (error) {
    console.error('Preview error:', error);
    showMessage(
      error.message || 'Failed to preview paper', 
      'error'
    );
  }
};
```

**Import Statements to Add (at top of file):**
```javascript
import { 
  FiEye,  // Add this for preview icon
  FiDownload 
} from 'react-icons/fi';
```

**Update the Paper Card Button Area:**

Find the button section (around line 915-920) and replace with:

```jsx
<div style={{ display: 'flex', gap: '10px' }}>
  {/* PREVIEW BUTTON - PRIMARY ACTION */}
  <button
    style={{
      padding: '8px 12px',
      backgroundColor: '#0066cc',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '14px',
      fontWeight: '500'
    }}
    onClick={() => handlePreview(paper)}
    title="Preview paper in browser"
  >
    <FiEye size={16} />
    Preview
  </button>

  {/* DOWNLOAD BUTTON - SECONDARY ACTION */}
  <button
    style={{
      padding: '8px 12px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '14px',
      fontWeight: '500'
    }}
    onClick={() => handleDownload(paper)}
    title="Download paper to computer"
  >
    <FiDownload size={16} />
    Download
  </button>
</div>
```

---

## 2. Update AdminManagePapers.jsx - Similar Changes

### Add Preview Function

```javascript
// Add near existing handleDownload (around line 248)
const handlePreview = async (paper) => {
  try {
    const user = localStorage.getItem('user');
    if (!user) {
      showMessage('Please sign in to preview papers', 'error');
      return;
    }

    const userData = JSON.parse(user);
    const userId = userData.id || userData._id;

    if (!['admin', 'moderator'].includes(userData.role)) {
      showMessage('Admin or moderator role required to preview papers', 'error');
      return;
    }

    showMessage('Opening preview...', 'info');
    const response = await paperService.previewPaper(paper.id, userId);
    
    const pdfBlob = new Blob([response.data], { 
      type: response.data.type || 'application/pdf' 
    });
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, paper.title || 'Paper Preview', 'width=1200,height=800');
  } catch (error) {
    console.error('Preview error:', error);
    showMessage(error.message || 'Failed to preview paper', 'error');
  }
};
```

### Update Button Section

Locate the button area where download is called and update similarly:

```jsx
<div style={{ display: 'flex', gap: '8px' }}>
  <button 
    className="action-btn preview-btn"
    onClick={() => handlePreview(paper)}
    title="Preview paper"
  >
    <FiEye size={16} /> Preview
  </button>
  <button 
    className="action-btn download-btn"
    onClick={() => handleDownload(paper)}
    title="Download paper"
  >
    <FiDownload size={16} /> Download
  </button>
</div>
```

---

## 3. Handle Upload Error Messages

### Update ManagePapers - Upload Handling

The upload endpoint now returns structured error information. Update error handling:

```javascript
// Find the upload attempt section (around line 430)
// Replace the existing error handling with:

const handleUpload = async () => {
  // ... existing validation code ...

  try {
    setUploading(true);

    const uploadPromise = selectedFiles.length > 1 
      ? paperService.uploadMultiple(
          selectedFiles,
          userId,
          title,
          abstract,
          additionalData
        )
      : paperService.upload(
          selectedFiles[0],
          userId,
          title,
          abstract,
          additionalData
        );

    const response = await uploadPromise;

    // NEW: Handle file-level errors in response
    if (response.files) {
      const failedFiles = response.files.filter(f => !f.success);
      const successFiles = response.files.filter(f => f.success);

      if (failedFiles.length > 0) {
        // Show details about failed files
        const errorDetails = failedFiles
          .map(f => `${f.filename}: ${f.error}`)
          .join('\n');
        
        showMessage(
          `Upload partially failed:\n${errorDetails}`,
          'warning'
        );
      }

      if (successFiles.length > 0) {
        showMessage(
          `Successfully uploaded ${successFiles.length} file(s)`,
          'success'
        );
        
        // Reload papers list
        loadPapers();
        setShowUploadModal(false);
        resetUploadForm();
      }
    } else {
      showMessage(response.message || 'Upload successful', 'success');
      loadPapers();
      setShowUploadModal(false);
      resetUploadForm();
    }
  } catch (error) {
    console.error('Upload error:', error);
    
    // Show structured error messages
    if (error.files) {
      const errorDetails = error.files
        .filter(f => !f.success)
        .map(f => `${f.filename}: ${f.error}`)
        .join('\n');
      showMessage(errorDetails || 'Upload failed', 'error');
    } else {
      showMessage(error.message || 'Upload failed', 'error');
    }
  } finally {
    setUploading(false);
  }
};
```

---

## 4. Display SDG Info in Paper Cards

### Update Paper Display Component

Add SDG badges to paper cards for better visibility:

```jsx
{/* In the paper card, after title */}
{paper.sdgs && paper.sdgs.length > 0 && (
  <div style={{ 
    display: 'flex', 
    flexWrap: 'wrap', 
    gap: '5px', 
    marginTop: '8px' 
  }}>
    {paper.sdgs.map((sdgId, idx) => (
      <span 
        key={idx}
        style={{
          display: 'inline-block',
          backgroundColor: '#e7f3ff',
          color: '#0066cc',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500'
        }}
      >
        SDG {sdgId}
      </span>
    ))}
  </div>
)}
```

---

## 5. Add File Validation Alert for Users

### Show Upload Tips Modal

Create a component to help users understand validation:

```jsx
const UploadValidationTips = () => {
  return (
    <div style={{
      backgroundColor: '#f0f7ff',
      border: '1px solid #0066cc',
      borderRadius: '5px',
      padding: '12px',
      marginBottom: '15px',
      fontSize: '14px'
    }}>
      <strong>✓ Upload Requirements:</strong>
      <ul style={{ marginTop: '8px', marginBottom: '0' }}>
        <li>File must be a valid PDF or DOCX file</li>
        <li>Minimum file size: 1KB</li>
        <li>Minimum viable paper: 5KB (prevents blank files)</li>
        <li>Maximum file size: 500MB</li>
        <li>Duplicate files will be rejected</li>
      </ul>
    </div>
  );
};

// Add to upload modal
<UploadValidationTips />
```

---

## 6. Update AdminDashboard Display

### Enhance SDG Section Layout

The SDG section was added to AdminDashboard. If you want better styling:

```jsx
// Replace the SDG section code with improved styling:

{stats.sdgBreakdown && stats.sdgBreakdown.length > 0 && (
  <div className="admin-card">
    <div className="admin-card-header">
      <h2 className="admin-card-title">
        <FiBarChart2 size={20} />
        Papers by Sustainable Development Goals (SDG)
      </h2>
    </div>
    <div className="sdg-breakdown">
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '12px',
        padding: '15px'
      }}>
        {stats.sdgBreakdown.map((sdg, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '12px', 
              backgroundColor: '#f9f9f9',
              border: '1px solid #ddd',
              borderRadius: '6px', 
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f0f7ff';
              e.target.style.borderColor = '#0066cc';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f9f9f9';
              e.target.style.borderColor = '#ddd';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '4px'
            }}>
              SDG {sdg.id}
            </div>
            <div style={{ 
              fontSize: '24px', 
              color: '#0066cc', 
              fontWeight: 'bold' 
            }}>
              {sdg.count}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#666',
              marginTop: '4px'
            }}>
              {sdg.count === 1 ? 'Paper' : 'Papers'}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
```

---

## 7. CSS Classes for Buttons (Optional)

If you want to add to your CSS file:

```css
/* Button Styling */
.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.preview-btn {
  background-color: #0066cc;
  color: white;
}

.preview-btn:hover {
  background-color: #0052a3;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 102, 204, 0.3);
}

.download-btn {
  background-color: #28a745;
  color: white;
}

.download-btn:hover {
  background-color: #218838;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(40, 167, 69, 0.3);
}

.validation-alert {
  background-color: #f0f7ff;
  border: 1px solid #0066cc;
  border-radius: 5px;
  padding: 12px;
  margin-bottom: 15px;
  font-size: 14px;
}

.sdg-badge {
  display: inline-block;
  background-color: #e7f3ff;
  color: #0066cc;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  margin: 2px;
}
```

---

## Implementation Steps

### Option 1: Minimal (Backend Only - Already Done ✅)
- Backend changes implemented
- System works without frontend changes
- Users need to manually call preview endpoint if they know about it

### Option 2: Recommended (Add Preview Button)
1. Add `handlePreview` function to ManagePapers.jsx
2. Add preview button next to download button
3. Import `FiEye` icon from react-icons
4. Test preview functionality

### Option 3: Complete (Full UI Enhancement)
1. Follow all steps above
2. Add validation tips modal
3. Update error handling for upload responses
4. Add SDG badges to paper cards
5. Enhance AdminDashboard styling

---

## Testing Frontend Changes

### Before Making Changes
```bash
npm test
# or test manually in browser
```

### After Making Changes
1. **Test Preview Button**:
   - Click preview on a paper
   - Paper should open in new window/tab

2. **Test Download Button**:
   - Click download on a paper
   - File should download to computer

3. **Test Upload Errors**:
   - Try uploading blank file
   - Try uploading duplicate file
   - Should see specific error messages

4. **Test SDG Display**:
   - Upload papers with SDGs
   - Go to Admin Dashboard
   - Should see SDG breakdown

---

## Browser Compatibility

All changes are compatible with:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (responsive)

---

## Performance Considerations

- Preview opens in new window (no load time on current page)
- Upload progress tracking works with individual file status
- SDG section renders efficiently with grid layout
- Button hover effects use CSS transitions (GPU accelerated)

---

## Deployment Notes

1. **No Database Migration Required**: Works with existing data
2. **Backward Compatibility**: Old papers without hashes still work
3. **Progressive Enhancement**: Features work independently
4. **Testing**: No breaking changes to existing functionality

---

**Ready to implement!** Choose your option (1, 2, or 3) and follow the steps above.

