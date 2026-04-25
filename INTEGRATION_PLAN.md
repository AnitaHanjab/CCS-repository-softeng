# Research Repository System Integration Plan

## Overview
This document outlines the integration of 6 key features into the research repository system using MongoDB Atlas and Express backend with React frontend.

---

## Feature 1: No Duplication of Files (Prevent Upload of Same Paper)

### Implementation Strategy
- Generate MD5 hash of file content on upload
- Store hash in GridFS metadata
- Check existing hashes before accepting upload
- Return appropriate error if duplicate found

### Changes Required
1. **Backend** (`backend/routes/papers.js`):
   - Add crypto module for hashing
   - Calculate file hash before upload
   - Query existing hashes
   - Validate uniqueness

2. **Frontend** (`frontend/src/services/service.js`):
   - Handle duplicate error response
   - Display user-friendly message

---

## Feature 2: Auto-Detect Blank Files

### Implementation Strategy
- Check file size (reject if < 1KB)
- For PDFs: Check if file has actual content (not blank page)
- Store validation status in metadata

### Changes Required
1. **Backend** (`backend/routes/papers.js`):
   - Validate file size
   - Parse PDF to check for content
   - Reject blank files with clear message

---

## Feature 3: Replace Download PDF with Preview

### Status: PARTIALLY COMPLETE
- Preview endpoint already exists at `/papers/preview/:fileId`
- Need to update frontend UI to prioritize preview over download

### Changes Required
1. **Frontend Components**:
   - Update button styling in ManagePapers, AdminManagePapers
   - Make preview primary action, download secondary
   - Add proper icons and labels

---

## Feature 4: Make SDG Classifiable in Admin Dashboard

### Implementation Strategy
- Add SDG filtering/stats to admin stats endpoint
- Display SDG breakdown in admin dashboard
- Allow filtering papers by SDG

### Changes Required
1. **Backend** (`backend/routes/papers.js`):
   - Update `/admin/stats` endpoint to include SDG breakdown
   
2. **Frontend** (`frontend/src/pages/admin/AdminDashboard.jsx`):
   - Add SDG stats cards
   - Display papers by SDG

---

## Feature 5: Total of Computer Science/IT Papers Submitted

### Status: ALREADY IMPLEMENTED
- Stats endpoint shows `computerSciencePapers` and `informationTechnologyPapers`
- Already displayed in AdminDashboard
- No changes needed

---

## Feature 6: Enable Multiple Downloads and Uploads

### Status: PARTIALLY COMPLETE
- Multiple uploads: Already supported (multer array config)
- Multiple downloads: Need to enhance existing bulk-download endpoint

### Changes Required
1. **Backend** (`backend/routes/papers.js`):
   - Enhance bulk-download to return proper zip or manifest
   - Track download counts properly

2. **Frontend** (`frontend/src/services/service.js`):
   - Add bulk download with proper progress tracking

---

## Implementation Priority
1. **High**: File deduplication (Feature 1) + Blank file detection (Feature 2)
2. **Medium**: UI improvements for preview (Feature 3) + SDG dashboard (Feature 4)
3. **Low**: Multiple downloads enhancement (Feature 6)

---

## MongoDB Schema Changes (if needed)

### GridFS Metadata Structure
```javascript
{
  userId: String,
  title: String,
  description: String,
  journal: String,
  year: String,
  authors: Array,
  tags: Array,
  sdgs: Array, // Already exists
  doi: String,
  uploadDate: Date,
  contentType: String,
  size: Number,
  fileHash: String, // NEW - for deduplication
  isValidPaper: Boolean, // NEW - validation status
  downloadCount: Number,
  citationCount: Number
}
```

