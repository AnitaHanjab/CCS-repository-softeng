# User & Admin Behavior Guide

## For Regular Users (Uploading Papers)

### Upload Process
1. Click "Upload New Paper"
2. Select up to 10 PDF/DOCX files
3. Enter: Title, Abstract, Keywords, Authors, SDGs, Journal info
4. **All files uploaded will share the same metadata**
5. Click "Upload"
6. Papers appear in your list with "Pending Review" status

### What Happens Next
- ⏳ Papers are NOT visible to others yet
- 👨‍💼 Admin/Moderator reviewed in Paper Approval section
- ✉️ You receive email approval/rejection notification
- ✅ Once approved, papers are visible publicly
- 👀 Users can view your papers in read-only mode

### Viewing Your Papers
- In "Manage Papers" page, you see all your papers
- Status column shows: Pending Review, Approved, or Rejected
- Can only download papers that are approved or that you own
- Can edit any approved paper
- Can delete your own papers

---

## For Admins/Moderators

### Paper Approval Workflow
1. Navigate to **Paper Approval** page
2. See list of all papers awaiting approval
3. Click "Review & Decide" on any paper
4. Review paper details:
   - Title, Authors, Abstract
   - Keywords, Upload date, File size
5. Choose action:
   - **Approve**: Optional message to author, email sent
   - **Reject**: Must provide rejection reason, email sent
6. Paper status updated immediately
7. Author receives notification

### Key Points
- ✅ Only you (Admin/Moderator) can approve/reject papers
- 📧 Authors automatically notified via email
- 💬 You can add optional messages on approval
- ⚠️ Rejection reason is required and sent to author
- 📋 "Paper Requests" page still exists (legacy feature)
- 🔍 "Manage Papers" shows all papers with approval status

---

## For All Users (Viewing Papers)

### Reading Papers
1. **Click "Open Preview"** on any paper
   - No login required
   - View-only mode
   - Can't download or modify
   - Perfect for reading research

2. **Click "Download PDF"** (if you have permission)
   - You own the paper, OR
   - You're a co-author, OR
   - You're admin/moderator
   - Others see lock icon: "You don't have permission"

### Paper Visibility
- ✅ Only APPROVED papers are visible on homepage
- ✅ Only approved papers in public search
- ✅ Pending/Rejected papers only visible to owner

---

## What's Changed vs Before

### Removed Features
❌ Download Access Request system
- No more "Request Access" button
- No more waiting for permission emails
- No more hidden papers after upload

### New Features
✅ Paper Approval System
- All new papers need admin approval
- Approval controls visibility (all-or-nothing)
- Automatic email notifications

✅ View-Only Mode
- Anyone can preview papers
- Perfect for discovering research
- Doesn't require special permissions

✅ Multiple File Upload
- Upload up to 10 papers at once
- Save time with batch uploads
- All get same metadata (keywords, authors, etc.)

---

## Multiple File Upload - Details

### Scenario: Upload 5 Papers at Once

**What's the same for all 5:**
- Title: "My Research Collection"
- Abstract
- Keywords: AI, Machine Learning, Data Science
- Authors: You + Co-authors
- SDGs: No Poverty, Quality Education, etc.
- Journal: IEEE Transactions
- Publication Year: 2024

**What's different:**
- Each file is separate (different PDFs/DOCXs)
- Each gets unique file ID
- Each tracked separately for downloads/citations
- Each can be edited/deleted individually

**After upload:**
- All 5 show in your papers list
- All 5 have "Pending Review" status
- Admin approves/rejects each individually
- If approved, 5 separate papers visible to public

### Multiple Upload Use Cases
- 📚 Conference proceedings (multiple papers from same conference)
- 🔄 Paper revisions (upload multiple versions)
- 📖 Paper series (chapter-by-chapter uploads)
- 🏢 Institutional bulk uploads (multiple department papers)

---

## Email Notifications

### When You Upload
- No notification (you know you uploaded!)

### When Paper is Approved
```
Subject: Paper Approved

Dear [Author Name],

Your paper "[Paper Title]" has been approved and is now visible 
in the research repository.

Paper Details:
- Title: [Title]
- Upload Date: [Date]

[Optional admin message]

Best regards,
CCS Research Repository Team
```

### When Paper is Rejected
```
Subject: Paper Rejected

Dear [Author Name],

Your paper "[Paper Title]" has been reviewed and rejected.

Rejection Reason: [Reason provided by reviewer]

You may modify your paper based on this feedback and resubmit it.

Best regards,
CCS Research Repository Team
```

---

## Common Questions

**Q: I uploaded a paper but can't see it on the homepage?**
A: It's pending admin approval. Check "Manage Papers" to see status.

**Q: Can I upload 20 files at once?**
A: No, maximum 10 files per upload. You can upload again after.

**Q: If I change authors, do I need to reupload?**
A: No, edit the paper and update authors. Changes apply immediately.

**Q: Someone can see my paper without asking permission?**
A: Yes! In "view-only" mode. Download is restricted, but viewing isn't.

**Q: What if admin rejects my paper?**
A: Email explains why. Update based on feedback and resubmit new version.

**Q: Do SDGs stay when uploading multiple files?**
A: Yes! All 10 files get the same SDGs you selected.

**Q: Can I download my own papers?**
A: Yes, always. Even if pending approval or rejected.

---

## Approval Timeline Example

### Time: 2:00 PM
- User uploads 5 papers
- Status: All show "Pending Review"
- Visibility: Only user can see them

### Time: 2:05 PM
- Admin notified about 5 new submissions
- Navigates to Paper Approval page

### Time: 2:15 PM
- Admin reviews all 5 papers
- Approves 4, rejects 1 (due to format)

### Time: 2:16 PM
- User receives 2 emails:
  - 4 papers approved + optional message
  - 1 paper rejected + reason
- Approved papers now visible publicly
- Rejected paper shows error explaining why

### Time: 2:30 PM
- User fixes rejected paper
- Reuploads it
- Starts pending review cycle again

---

## Admin Dashboard View

```
Paper Approval │ Pending: 12
─────────────────────────────────────────
Paper Title                │ Upload Date  │ Authors │ Size
─────────────────────────────────────────
AI in Healthcare           │ 2m ago       │ 2       │ 2.5MB
Machine Learning Basics    │ 5m ago       │ 1       │ 1.2MB
Climate Change Study       │ 10m ago      │ 3       │ 8.4MB
...
─────────────────────────────────────────

[Review & Decide] buttons for each paper
```

---

## Technical Notes for Developers

- New papers default to `approvalStatus: 'pending'`
- Existing papers in DB default to `approvalStatus: 'approved'` (backward compat)
- Preview endpoint has no auth check (intentional for view-only)
- Download endpoint checks role + status (restrictive)
- SDGs stored with each file independently
- All 10 files in batch get same metadata but separate tracking
