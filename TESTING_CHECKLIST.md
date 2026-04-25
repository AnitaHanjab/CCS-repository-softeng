# Implementation Checklist & Testing Guide

## Pre-Deployment Checklist

### Backend (Node.js + MongoDB)

- [ ] Install updated packages if needed
  ```bash
  cd backend
  npm install
  ```

- [ ] Verify MongoDB connection working
  - [ ] Papers collection accessible
  - [ ] GridFS working for file storage

- [ ] Test new backend endpoints:
  ```bash
  # Terminal 1 - Start backend
  cd backend
  npm start
  # Expected: Server running on port 3000
  ```

- [ ] Check email service configured
  - [ ] EmailService.js has valid SMTP settings
  - [ ] Test sender email configured
  - [ ] Email templates look correct

### Frontend (React + Vite)

- [ ] Install/update packages
  ```bash
  cd frontend
  npm install
  ```

- [ ] Build frontend
  ```bash
  npm run build
  ```

- [ ] Verify no build errors
  - [ ] No TypeScript/ESLint errors
  - [ ] All imports resolve correctly

- [ ] Test frontend in development
  ```bash
  npm run dev
  # Visit http://localhost:5173
  ```

---

## Functional Testing

### 1. Paper Upload & Approval Workflow

#### Test Case 1.1: Single Paper Upload
- [ ] Log in as regular user
- [ ] Navigate to Manage Papers
- [ ] Click "Upload New Paper"
- [ ] Fill form:
  - Title: "Test Paper 1"
  - Abstract: "Test abstract"
  - Keywords: "test, paper, ai"
  - Author: Self + Co-author
  - SDGs: 2-3 selected
  - Journal: "Test Journal"
- [ ] Select 1 PDF file
- [ ] Click Upload
- [ ] Verify paper appears with "Pending Review" badge
- [ ] Check:
  - [ ] Paper invisible on homepage
  - [ ] Paper visible in user's Manage Papers
  - [ ] Approval status shows "Pending Review"

#### Test Case 1.2: Multiple Paper Upload
- [ ] Upload 5 papers at once:
  - Select 5 different PDF files
  - Fill title, abstract, keywords, etc.
  - Submit
- [ ] Verify:
  - [ ] All 5 appear in list
  - [ ] All have "Pending Review" status
  - [ ] SDGs retained for all 5
  - [ ] Each has unique ID but same metadata

#### Test Case 1.3: Admin Paper Approval
- [ ] Log out, log in as admin
- [ ] Navigate to Admin → Paper Approval
- [ ] Verify pending papers listed
- [ ] Click "Review & Decide" on first paper
- [ ] In modal:
  - [ ] All paper details visible
  - [ ] Can see title, authors, abstract, keywords
  - [ ] Can enter optional message
  - [ ] Can see/edit rejection reason field
- [ ] Click "Approve Paper"
- [ ] Verify:
  - [ ] Paper removed from pending list
  - [ ] Paper owner receives approval email
  - [ ] (Check email inbox/log)

#### Test Case 1.4: Admin Paper Rejection
- [ ] Navigate to Paper Approval (still have pending papers?)
- [ ] Click "Review & Decide" on a paper
- [ ] Enter rejection reason: "Poor abstract quality"
- [ ] Click "Reject Paper"
- [ ] Verify:
  - [ ] Paper removed from pending list
  - [ ] Paper owner receives reject email
  - [ ] Email contains rejection reason

#### Test Case 1.5: User Sees Approved Papers
- [ ] Log in as original user
- [ ] Manage Papers page:
  - [ ] Approved papers show "Approved" badge (green)
  - [ ] Rejected papers show "Rejected" badge (red)
  - [ ] Can download approved papers
  - [ ] Can download own papers (even if pending)
- [ ] Log in as different user
- [ ] Homepage:
  - [ ] Only approved papers visible
  - [ ] Can see details of approved papers

---

### 2. View-Only Mode Testing

#### Test Case 2.1: Paper Preview (View-Only)
- [ ] Navigate to approved paper on homepage
- [ ] Click paper to open modal
- [ ] Click "Open Preview"
- [ ] Verify:
  - [ ] Preview opens in iframe
  - [ ] Can scroll through PDF
  - [ ] Preview is read-only (can't select/copy)
  - [ ] Works without special permissions

#### Test Case 2.2: Preview Without Login
- [ ] Log out completely
- [ ] HomePage - find approved paper
- [ ] Click paper modal
- [ ] Click "Open Preview"
- [ ] Verify:
  - [ ] Preview opens WITHOUT asking to sign in
  - [ ] Can view paper anonymously
  - [ ] Paper content visible in read-only mode

#### Test Case 2.3: Preview vs Download
- [ ] With pending/non-approved paper
- [ ] Log in as non-owner
- [ ] Try "Open Preview":
  - [ ] Should WORK (allowed)
  - [ ] Paper visible
- [ ] Try "Download PDF":
  - [ ] Should FAIL (not allowed)
  - [ ] Shows lock message

---

### 3. Download Permissions Testing

#### Test Case 3.1: Owner Download
- [ ] Owner uploads paper
- [ ] Before approval: Can download? YES ✓
- [ ] After approval: Can download? YES ✓

#### Test Case 3.2: Co-Author Download
- [ ] Paper uploaded with 2 co-authors
- [ ] Admin approves
- [ ] Log in as co-author
- [ ] Can download? YES ✓ (should work)

#### Test Case 3.3: Non-Owner, Non-Approved
- [ ] Paper pending approval
- [ ] Log in as different user
- [ ] Try download: Should show permission denied ✓

#### Test Case 3.4: Admin Download
- [ ] Any paper (approved/pending/rejected)
- [ ] Log in as admin
- [ ] Can download? YES ✓ (should always work)

#### Test Case 3.5: Moderator Download
- [ ] Any paper
- [ ] Log in as moderator
- [ ] Can download? YES ✓ (should work like admin)

---

### 4. SDG Functionality Testing

#### Test Case 4.1: SDGs in Upload
- [ ] Upload paper with 3 SDGs selected
- [ ] Wait for approval
- [ ] Verify SDGs appear on approved paper

#### Test Case 4.2: SDGs in Multiple Upload
- [ ] Upload 3 papers with same 2 SDGs selected
- [ ] Approve all 3
- [ ] Each paper shows same SDGs? YES ✓
- [ ] Can they be edited individually? YES ✓
- [ ] Do changes affect only 1 paper? YES ✓

#### Test Case 4.3: SDG Filtering (if exists)
- [ ] Homepage filters by SDG?
  - [ ] Filter by "No Poverty"
  - [ ] Papers with that SDG show?
  - [ ] Papers without don't show?

---

### 5. Email Notifications Testing

#### Test Case 5.1: Approval Email
- [ ] Admin approves paper
- [ ] Author receives email with:
  - [ ] "Paper Approved" subject
  - [ ] Paper title
  - [ ] Optional reviewer message
  - [ ] Link to repository (if configured)

#### Test Case 5.2: Rejection Email  
- [ ] Admin rejects paper with reason
- [ ] Author receives email with:
  - [ ] "Paper Rejected" subject
  - [ ] Rejection reason visible
  - [ ] Paper title
  - [ ] Instructions to resubmit

#### Test Case 5.3: Email Sending
- [ ] Check email logs
- [ ] Verify 2+ emails per cycle
- [ ] No delivery errors

---

### 6. Edge Cases & Error Handling

#### Test Case 6.1: Large Files
- [ ] Upload file near 500MB limit
- [ ] Should work? YES ✓
- [ ] Upload file over 500MB
- [ ] Should error? YES ✓ ("exceeds limit")

#### Test Case 6.2: Invalid File Types
- [ ] Try uploading .txt, .jpg, .xlsx
- [ ] Should reject? YES ✓

#### Test Case 6.3: Duplicate Files
- [ ] Upload same PDF twice
- [ ] Second should be rejected? YES ✓ ("already exists")

#### Test Case 6.4: Concurrent Operations
- [ ] Two admins approve same paper
- [ ] Shouldn't break? YES ✓
- [ ] One completes, second shows error? YES ✓

#### Test Case 6.5: Database Consistency
- [ ] Approve paper A
- [ ] Before email send, approve paper B
- [ ] Both get settings correct? YES ✓

---

## Performance Testing

### Load Testing Scenarios

- [ ] Upload 10 files simultaneously
  - Time to complete: < 30 seconds
  - No files lost: YES
  
- [ ] List 1000 papers in Manage Papers
  - Page loads: < 3 seconds
  - Sorting works: YES
  
- [ ] Approve 50 papers rapidly
  - No errors: YES
  - Database consistent: YES

- [ ] 100 concurrent users viewing preview
  - Server response: < 2 seconds
  - Memory stable: YES

---

## Browser Compatibility Testing

Test in each browser:

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

For each, test:
- [ ] File upload (drag-drop + click)
- [ ] Preview modal opens
- [ ] Form validation works
- [ ] Email links work

---

## Mobile Testing

- [ ] iPhone view
  - [ ] Upload form responsive
  - [ ] Paper list readable
  - [ ] Preview works (if supported)
  
- [ ] Android view
  - [ ] Same as iPhone

---

## Deployment Testing

### Staging Environment

- [ ] Deploy frontend to staging
- [ ] Deploy backend to staging
- [ ] Test full workflow end-to-end
- [ ] Email delivery working
- [ ] Database transactions logged

### Production Deployment

- [ ] Backup database before deployment
- [ ] Deploy backend first (backwards compatible)
- [ ] Verify backend endpoints responding
- [ ] Deploy frontend
- [ ] Smoke test:
  - [ ] Can upload paper
  - [ ] Can approve paper
  - [ ] Can view paper
  - [ ] Can download paper
- [ ] Monitor error logs for 24 hours

---

## Rollback Plan

If issues discovered:

1. **Quick Rollback (< 15 min)**
   - Revert frontend deployment
   - Keep backend (backward compatible)
   
2. **Full Rollback (< 1 hour)**
   - Restore database backup
   - Revert backend changes
   - Revert frontend changes

3. **Hotfix (if partial failure)**
   - Identify affected feature
   - Deploy targeted fix
   - Monitor closely

---

## Post-Deployment Verification

Day 1 checks:
- [ ] All endpoints responding
- [ ] Database running smoothly
- [ ] Emails sending without errors
- [ ] UI displays correctly
- [ ] No JavaScript console errors
- [ ] Performance metrics normal

Week 1 checks:
- [ ] User feedback positive
- [ ] No critical bugs reported
- [ ] Approval system working well
- [ ] Email functionality reliable
- [ ] Database optimization needed? No/Yes
- [ ] Any UI/UX improvements? List them

---

## Documentation Updates Needed

- [ ] Update API documentation
- [ ] Update admin user guide
- [ ] Update FAQ for email notifications
- [ ] Update database schema docs
- [ ] Add approval workflow diagram
- [ ] Add email template samples

---

## Known Limitations & Future Work

### Current Limitations
- [ ] Max 10 files per upload (backend: `upload.array('papers', 10)`)
- [ ] Max 500MB per file (backend: `limits: { fileSize: 500 * 1024 * 1024 }`)
- [ ] Approval must be per-paper (no bulk approve)
- [ ] Can't see approval history (auditing)

### Future Enhancements
- [ ] Bulk approve/reject papers
- [ ] Approval workflow notifications (email to admins)
- [ ] Paper revision tracking
- [ ] Approval timeout (auto-approve after X days)
- [ ] Approval comments visible to authors
- [ ] Paper approval analytics dashboard

---

## Success Criteria

✅ All 4 requirements met:
1. [x] View-only mode for papers
2. [x] Multiple file upload with SDG retention  
3. [x] Paper approval workflow (admin/moderator)
4. [x] Removed download permission requests

✅ System stability:
- [ ] No critical errors in logs
- [ ] All emails sent successfully
- [ ] Database transactions consistent
- [ ] Performance acceptable

✅ User experience:
- [ ] Admin workflow intuitive
- [ ] Users understand approval status
- [ ] Email notifications clear
- [ ] No confusion with old system

---

## Support & Troubleshooting

### Common Issues

**"Paper not visible after approval"**
- [ ] Check admin approved it
- [ ] Check `approvalStatus` in database
- [ ] Clear browser cache
- [ ] Restart backend

**"Email not received"**
- [ ] Check email service configured
- [ ] Check SMTP credentials
- [ ] Check spam folder
- [ ] Check backend logs

**"Can't upload more than 1 file"**
- [ ] Ensure `multiple` attribute on file input
- [ ] Check backend accepts array
- [ ] Check browser not blocking

**"approval status shows null"**
- [ ] Backfill existing papers with status
  ```javascript
  db.papers.files.updateMany(
    { 'metadata.approvalStatus': { $exists: false } },
    { $set: { 'metadata.approvalStatus': 'approved' } }
  )
  ```

---

## Sign-Off

- [ ] Backend developer tested and approved
- [ ] Frontend developer tested and approved
- [ ] QA tested and approved
- [ ] Admin user tested and approved
- [ ] Product owner approved for deployment
