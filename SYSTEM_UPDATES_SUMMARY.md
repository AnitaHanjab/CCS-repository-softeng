# System Code Updates - Summary

## Overview
Implemented comprehensive changes to your repository system according to the 4 requirements:

1. ✅ View-only mode for papers
2. ✅ Multiple file upload support with SDG retention
3. ✅ Paper upload approval workflow (Admin/Moderator only)
4. ✅ Removed download permission request system

---

## Detailed Changes

### 1. BACKEND - Paper Approval Workflow

#### File: `backend/routes/papers.js`

**New Fields Added to Paper Metadata:**
- `approvalStatus`: 'pending' | 'approved' | 'rejected'
- `approvedBy`: User ID of approving admin/moderator
- `approvalDate`: Timestamp of approval
- `rejectionReason`: Reason if rejected

**Modified Endpoints:**

- **POST /papers/upload** 
  - Papers now upload with `approvalStatus: 'pending'`
  - Requires admin/moderator approval before visibility

- **GET /papers/user/:userId**
  - Only returns papers owned by user or where user is co-author
  - Co-authored papers must be 'approved'
  - Returns approval status in response

- **GET /papers/public**
  - New filter: `'metadata.approvalStatus': 'approved'`
  - Only approved papers visible to public

- **GET /papers/download/:fileId**
  - Simplified permission logic (removed paper request check)
  - Allows download for:
    - Paper owner
    - Co-authors
    - Admin/Moderator
  - Denies all others

- **GET /papers/preview/:fileId**
  - VIEW-ONLY MODE: No permission check required
  - Anyone can view paper in preview mode
  - Does not require signed-in status

- **GET /papers/:paperId/download-permission**
  - Updated logic (removed paper request check)
  - Returns permission status for download

**New Admin Endpoints:**

- **GET /papers/admin/pending-approval**
  - Lists all pending papers awaiting approval
  - Admin/Moderator only

- **PUT /papers/admin/papers/:paperId/approve**
  - Approves a paper
  - Sets approval status to 'approved'
  - Sends email notification to paper owner
  - Requires: `adminId`, optional `adminMessage`

- **PUT /papers/admin/papers/:paperId/reject**
  - Rejects a paper
  - Sets approval status to 'rejected'
  - Sends email notification with rejection reason
  - Requires: `adminId`, `reason`

---

### 2. FRONTEND - Service Updates

#### File: `frontend/src/services/service.js`

**New Service Methods:**

```javascript
// Get pending papers for approval
getPendingPapersForApproval: async () => { ... }

// Approve a paper
approvePaper: async (paperId, adminId, adminMessage) => { ... }

// Reject a paper  
rejectPaper: async (paperId, adminId, reason) => { ... }
```

---

### 3. FRONTEND - New Admin Page

#### File: `frontend/src/pages/admin/AdminPaperApproval.jsx`
**New file created** - Paper Approval Management interface

**Features:**
- Lists all pending papers awaiting approval
- Modal with full paper details
- Approve/Reject buttons
- Optional admin message on approval
- Required rejection reason field
- Email notifications to authors
- Real-time status updates

#### File: `frontend/src/pages/admin/AdminPaperApproval.css`
**New file created** - Styling for paper approval interface

---

### 4. FRONTEND - UI Updates

#### File: `frontend/src/components/AdminLayout.jsx`
- Added "Paper Approval" navigation item for Admin/Moderator
- Routes to: `/admin/paper-approval`

#### File: `frontend/src/App.jsx`
- Imported `AdminPaperApproval` component
- Added route: `<Route path="/admin/paper-approval" element={<AdminPaperApproval />} />`

#### File: `frontend/src/components/PaperDetailModal.jsx`

**Removed:**
- Import of `PaperRequestModal`
- `isRequestModalOpen` state
- `handleRequestSubmit` function
- `<PaperRequestModal />` JSX element
- Paper request modal rendering

**Updated:**
- `handlePreview()`: Removed download permission check
  - Now anyone signed in can preview papers
  - VIEW-ONLY mode implemented
- Preview button: No longer disabled based on download permission
- Download button: Still respects permission checks
- Message on download restriction remains for non-permitted users

#### File: `frontend/src/pages/ManagePapers.jsx`

**Updated Paper List Table:**
- **NEW COLUMN**: "Status" with approval badges
  - Pending Review (warning - yellow)
  - Approved (success - green)
  - Rejected (danger - red)
- **Download Logic**: Papers pending approval can't be downloaded
- Shows approval status to paper owners

#### File: `frontend/src/styles/ManagePapers.css`

**New Badge Styles:**
```css
.badge-warning { background-color: #f59e0b; }  /* Pending */
.badge-success { background-color: #10b981; }  /* Approved */
.badge-danger { background-color: #ef4444; }   /* Rejected */
```

---

## Workflow Summary

### Paper Upload Flow
1. **User uploads paper** → Status: 'pending'
2. **Paper is NOT visible** to public or other users initially
3. **Admin/Moderator reviews** in Paper Approval page
4. **Admin approves/rejects** paper
5. **User notified via email** of decision
6. **If approved** → Paper visible to all (read-only view)
7. **If rejected** → Paper not visible (user can re-upload)

### Paper Viewing Flow
1. **Anyone can click "Open Preview"** → View-only mode (no permission needed)
2. **Download requires:**
   - User is paper owner, OR
   - User is co-author, OR
   - User is admin/moderator
3. **Non-permitted users** see lock icon and message

### Multiple File Upload
- **Already supported** by backend
- **Frontend UI shows:**
  - "Upload your research papers"
  - "Up to 10 files" capacity
  - Drag-and-drop support
  - Selected files list with remove buttons
  - All files uploaded with same metadata
  - SDG selections retained across all files

---

## Key Features Implemented

### ✅ View-Only Mode
- Preview endpoint allows unrestricted viewing
- No permission check required for viewing
- Only download requires permission
- Encourages paper discovery and reading

### ✅ Multiple File Upload
- Up to 10 files per upload
- Drag-and-drop support
- Individual file metadata display
- All files share: title, abstract, authors, keywords, SDGs, journal, year
- Backend processes each file independently

### ✅ Approval Workflow
- Admin/Moderator-only approval
- Pending status prevents visibility
- Email notifications on approval/rejection
- Optional reviewer messages
- Clear rejection reasons

### ✅ Removed Permission Requests
- No more "request access" modal
- No more PaperRequest model usage in UI
- No more email request workflow
- Access controlled at approval stage (not per-download)

---

## Admin Navigation

New menu item for Admins/Moderators:
```
Dashboard
├── Manage Users
├── Pending Approvals (User registration)
├── Paper Approval ⭐ NEW
├── Paper Requests
└── Manage Papers
```

---

## Email Notifications

### On Approval
- Subject: "Paper Approved"
- Content: Paper title, upload date, optional reviewer message
- Recipient: Paper owner

### On Rejection
- Subject: "Paper Rejected"
- Content: Paper title, rejection reason
- Recipient: Paper owner

---

## Database Changes

Papers Collection now includes:
```javascript
{
  ...existing_fields,
  approvalStatus: "pending|approved|rejected",
  approvedBy: ObjectId,
  approvalDate: Date,
  rejectionReason: String
}
```

---

## Testing Checklist

- [ ] Upload multiple papers with SDGs retained
- [ ] Verify papers show as "Pending Review" in user's list
- [ ] Access Paper Approval page as admin
- [ ] Approve a paper - verify email sent
- [ ] Reject a paper - verify email and reason
- [ ] Try to download unapproved paper - should be blocked
- [ ] Verify approved papers visible on homepage
- [ ] Try to preview paper without logging in - should work
- [ ] Try to download paper without permission - should show lock message
- [ ] Verify SDGs show correctly on approved papers
- [ ] Test multiple file drag-and-drop

---

## Files Modified/Created

### Created
- `frontend/src/pages/admin/AdminPaperApproval.jsx` (NEW)
- `frontend/src/pages/admin/AdminPaperApproval.css` (NEW)

### Modified
- `backend/routes/papers.js`
- `frontend/src/services/service.js`
- `frontend/src/components/AdminLayout.jsx`
- `frontend/src/App.jsx`
- `frontend/src/components/PaperDetailModal.jsx`
- `frontend/src/pages/ManagePapers.jsx`
- `frontend/src/styles/ManagePapers.css`

---

## Notes

1. **Paper requests system** is fully removed from frontend but still exists in backend (for backward compatibility if needed)
2. **Approval workflow** only affects NEW papers uploaded (existing papers default to 'approved')
3. **SDG functionality** is fully retained and expanded with new approval system
4. **Multiple uploads** are processed independently but share common metadata
5. **View-only mode** is read-only (users can't modify anything from preview)
