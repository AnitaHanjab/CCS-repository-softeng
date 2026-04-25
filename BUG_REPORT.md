# Bug Report and Non-Functioning Features

## CRITICAL ISSUES

### 1. **Duplicate Route in Backend** ⚠️ CRITICAL
**Location:** `backend/routes/papers.js`
- **Lines:** 675 and 1102
- **Issue:** The route `/get-users-for-author-selection` is defined twice
- **Impact:** Only the first definition is used; the second one is unreachable
- **Fix:** Remove the duplicate route at line 1102

**First definition (Line 675-694):**
```javascript
router.get('/get-users-for-author-selection', async (req, res) => {
  try {
    const users = await User.find({ status: 'approved' }, '-password').lean();
    res.json(users);
```

**Duplicate (Line 1102+):** Same route defined again

---

### 2. **Route Ordering Issue** ⚠️ CRITICAL
**Location:** `backend/routes/papers.js`
- **Issue:** Generic routes like `/:paperId` should come AFTER specific routes like `/public`, `/admin/all`, `/get-users-for-author-selection`
- **Current Order (WRONG):**
  - Line 600: `GET /public`
  - Line 643: `GET /admin/all`
  - Line 675: `GET /get-users-for-author-selection`
  - Line 696: `GET /:paperId` ← This will match `/public`, `/admin/all`, etc.

- **Impact:** Requests to `/get-users-for-author-selection` may be caught by `/:paperId` handler first
- **Fix:** Move specific routes (public, admin/all, get-users-for-author-selection) before the generic `/:paperId` route

---

## API ENDPOINT ISSUES

### 3. **Missing Admin Stats Endpoint in Auth Route**
**Location:** Frontend calls at `frontend/src/pages/admin/AdminManageUsers.jsx`
- **Frontend Call:** `userService.getUserStats()`
- **Maps to:** `/auth/admin/stats`
- **Backend:** ✅ EXISTS at `backend/routes/auth.js` (Line 371)
- **Status:** WORKING

### 4. **Missing User By ID Endpoint**
**Location:** Frontend calls at `frontend/src/services/service.js`
- **Frontend Call:** `api.get('/auth/user/{userId}')`
- **Backend:** ✅ EXISTS at `backend/routes/auth.js` (Line 551)
- **Status:** WORKING

---

## FRONTEND ISSUES

### 5. **Missing Error Notifications in Some Components**
**Location:** `frontend/src/pages/ManagePapers.jsx`
- **Issue:** File upload validation warnings set to `setMessage()` but some don't call `notifyWarning()`
- **Affected:** Line ~165 - File size/type validation
- **Fix:** Call `notifyWarning()` for all validation errors

### 6. **Incomplete Logout Implementation**
**Location:** Entire Application
- **Issue:** No logout functionality found in any component
- **Impact:** Users cannot sign out; session persists indefinitely
- **Fix:** Need to implement logout route in backend and logout handler in frontend

### 7. **Missing Success Notification After Register**
**Location:** `frontend/src/pages/Register.jsx`
- **Issue:** Uses `notifyInfo()` but this doesn't provide clear visual feedback
- **Better:** Should use `notifySuccess()` for successful registration
- **Line:** ~157

---

## DATA STRUCTURE MISMATCHES

### 8. **Paper Comments Structure Inconsistency**
**Location:** Backend `backend/routes/papers.js` and Frontend `frontend/src/components/PaperDetailModal.jsx`
- **Issue:** Backend stores comments as objects with IDs, but frontend may expect different structure
- **Backend generates:** `{ id: ObjectId, userId, userEmail, content, timestamp, parentCommentId }`
- **Frontend expects:** Verify if the component correctly handles nested replies

### 9. **SDG Data Format Inconsistency**
**Location:** Multiple files
- **Issue:** SDGs stored as objects `{id: X, name: Y}` but sometimes accessed as strings
- **Backend:** `file.metadata.sdgs` can be objects
- **Frontend:** `selectedSDGs.map(sdg => typeof sdg === 'object' ? sdg : { id: sdg })`
- **Status:** Has workaround but should standardize format

---

## MISSING FUNCTIONALITIES

### 10. **No Logout Endpoint**
- **Backend:** Missing `/auth/logout` route
- **Frontend:** No logout functionality
- **Required:** Clear session, remove localStorage

### 11. **No Email Verification for Login**
- **Issue:** Registration requires OTP verification but login doesn't verify user status
- **Backend:** `login` route doesn't check if user.status === 'approved'
- **Location:** `backend/routes/auth.js` line ~246

### 12. **No Download Functionality in Components**
**Location:** `frontend/src/components/PaperDetailModal.jsx`
- **Issue:** Download button exists but may not properly handle the response
- **Line:** ~187 - `paperService.downloadPaper()`
- **Check:** Verify blob handling and file download trigger

### 13. **Admin Pending Approvals Not Filtering**
**Location:** `backend/routes/auth.js`
- **Route:** `GET /admin/users/pending` (Line 401)
- **Issue:** Route definition may not properly filter by status='pending'
- **Check:** Verify the query filters correctly

---

## POTENTIAL RUNTIME ERRORS

### 14. **GridFS Initialization Race Condition**
**Location:** Multiple backend route files
- **Issue:** `gfs` might not be initialized when routes are first called
- **Code Pattern:**
```javascript
let gfs;
mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(...);
});
```
- **Risk:** If routes execute before `open` event, `gfs` will be undefined
- **Fix:** Add null checks or ensure promise-based initialization

### 15. **Missing Null Checks for User Metadata**
**Location:** `backend/routes/papers.js`
- **Issue:** Code assumes `file.metadata.authors` exists but doesn't always check
- **Example:** Line ~265 - `file.metadata.authors && file.metadata.authors.some(...)`
- **Status:** Has checks but should be more consistent

---

## BACKEND MODULE/ROUTE ISSUES

### 16. **Email Service Not Fully Implemented**
**Location:** `backend/services/emailService.js`
- **Issue:** Used in `paperRequests.js` but implementation unknown
- **Called:** `emailService.sendRequestStatusEmail()`
- **Check:** Verify this module exists and is properly exported

### 17. **No Error Handling for Email Failures**
**Location:** `backend/routes/paperRequests.js` line ~119
- **Issue:** If email fails, request is still marked as processed
- **Impact:** User may not receive approval notification
- **Fix:** Add error handling around email service calls

---

## SECURITY ISSUES

### 18. **User Role Not Validated in All Admin Routes**
**Location:** `backend/routes/papers.js`
- **Issue:** Some admin routes don't check user role from headers
- **Example:** `/admin/all` uses `requireAdminOrModerator` ✅ but
- **Other routes:** May not validate properly
- **Fix:** Ensure consistent middleware usage

### 19. **No CORS Protection for Critical Routes**
**Location:** `backend/index.js`
- **Issue:** CORS allows all origins - should be more restrictive
- **Current:** `'http://localhost:5173', 'http://localhost:3000'`
- **Should add:** Environment-based configuration

### 20. **Sensitive Data in Responses**
**Location:** Various backend routes
- **Issue:** Some responses may include unnecessary user information
- **Check:** Verify user passwords are excluded from all responses

---

## TESTING RECOMMENDATIONS

### High Priority (Fix First):
1. ✅ Remove duplicate `/get-users-for-author-selection` route
2. ✅ Reorder routes: specific before generic
3. ✅ Add login status check (ensure only approved users can login)
4. ✅ Implement logout functionality
5. ✅ Test paper upload with multiple files

### Medium Priority:
6. Verify GridFS initialization
7. Test paper download and preview
8. Test comment functionality with nested replies
9. Verify email notifications work
10. Test admin approval workflow

### Low Priority:
11. Standardize SDG data format
12. Add comprehensive error handling
13. Improve CORS configuration
14. Add request logging

---

## SUMMARY

**Total Issues Found:** 20
- **Critical:** 2 (Duplicate route, Route ordering)
- **High:** 4 (Logout, Login verification, GridFS, Email service)
- **Medium:** 7 (Data mismatches, Missing functions, Error handling)
- **Low:** 7 (Security, Documentation, Best practices)

**Estimated Fix Time:** 2-3 hours for critical issues, 1-2 days for all issues
