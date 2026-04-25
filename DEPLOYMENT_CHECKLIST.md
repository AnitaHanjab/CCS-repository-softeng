# Pre-Deployment Checklist

## 📋 Complete Checklist Before Going Live

Use this checklist to ensure everything is ready for production deployment.

---

## ✅ Phase 1: Code Review (Before Deployment)

### Backend Changes Review
```
[ ] Read backend/routes/papers.js - upload endpoint section
[ ] Verify crypto import is present at line 4
[ ] Check calculateFileHash function exists (line 84)
[ ] Check validateFile function exists (line 89)  
[ ] Verify fileHash stored in metadata (line 153)
[ ] Check duplicate detection logic (line 128)
[ ] Verify admin stats endpoint has SDG breakdown
[ ] Confirm download endpoint increments count
[ ] Confirm preview endpoint increments count
```

### Frontend Changes Review
```
[ ] Check frontend/src/services/service.js for previewPaper
[ ] Verify AdminDashboard.jsx has SDG section
[ ] Check SDG section rendering logic
[ ] Verify stat cards display properly
```

### Documentation Review
```
[ ] Read DEPLOYMENT_READY.md
[ ] Review IMPLEMENTATION_GUIDE.md
[ ] Scan API_REFERENCE.md for endpoints
[ ] Check ARCHITECTURE.md for data flow
```

---

## ✅ Phase 2: Environment Setup

### Backend Environment
```
[ ] Navigate to backend directory: cd backend
[ ] Check Node.js version: node --version (should be 14+)
[ ] Verify package.json has all dependencies
[ ] Install dependencies: npm install (if not done)
[ ] Verify MongoDB Atlas connection string in .env
[ ] Test connection: Try running npm start
[ ] Stop server: Ctrl+C
```

### Frontend Environment  
```
[ ] Navigate to frontend directory: cd frontend
[ ] Check Node.js version: node --version
[ ] Verify package.json dependencies
[ ] Install dependencies: npm install (if not done)
[ ] Verify Vite config: vite.config.js exists
[ ] Check API URL in environment: VITE_API_URL
[ ] Verify .env.local or environment config
```

### Database
```
[ ] MongoDB Atlas account accessible
[ ] Database cluster running
[ ] Connection string valid
[ ] Read/write permissions configured
[ ] Network access whitelist updated (if needed)
[ ] Backup created before deployment
```

---

## ✅ Phase 3: Local Testing

### Feature 1: Duplicate Detection
```
[ ] Upload valid PDF file successfully (check response)
[ ] Try uploading same file again (should fail)
[ ] Verify error message matches expected
[ ] Check duplicate file NOT stored in database
[ ] Try uploading different file (should succeed)
```

### Feature 2: Blank File Detection
```
[ ] Create empty file (0 bytes)
[ ] Try uploading empty file (should fail with size message)
[ ] Create small file (500 bytes)
[ ] Try uploading (should fail)
[ ] Create 5KB+ valid PDF
[ ] Upload succeeds
```

### Feature 3: Preview Functionality  
```
[ ] Upload a valid PDF
[ ] Note the fileId from response
[ ] Use preview endpoint: GET /papers/preview/{fileId}?userId={userId}
[ ] File should stream to browser
[ ] Check Content-Disposition is "inline"
[ ] Verify download count incremented in database
```

### Feature 4: SDG Statistics
```
[ ] Upload 3 papers with SDGs: [4, 9]
[ ] Upload 2 papers with SDGs: [4, 13]
[ ] Upload 1 paper with SDGs: [9, 17]
[ ] Call: GET /api/papers/admin/stats
[ ] Verify response includes sdgBreakdown
[ ] Check SDG 4 has count 5
[ ] Check SDG 9 has count 5
[ ] Check SDG 13 has count 2
[ ] Check SDG 17 has count 1
```

### Feature 5: CS/IT Statistics
```
[ ] Create/login with Computer Science user
[ ] Upload 2 papers
[ ] Create/login with IT user
[ ] Upload 3 papers
[ ] Call: GET /api/papers/admin/stats
[ ] Verify computerSciencePapers: 2
[ ] Verify informationTechnologyPapers: 3
```

### Feature 6: Multiple Operations
```
[ ] Upload 3 files at once (using array)
[ ] Verify all 3 get fileIds
[ ] Try uploading 1 duplicate + 2 new (mixed)
[ ] Check response shows 2 success, 1 failed
[ ] Verify download count for each paper independently
```

---

## ✅ Phase 4: Integration Testing

### Cross-Feature Testing
```
[ ] Upload 10 files across CS/IT departments
[ ] All with different SDGs
[ ] Check stats show correct counts
[ ] Try uploading duplicates (all rejected)
[ ] Preview one paper (verify tracking)
[ ] Download one paper (verify tracking)
[ ] Check total downloads in stats increased
```

### Error Scenarios
```
[ ] Send upload without userId (should fail)
[ ] Send upload with invalid MIME type (should fail)
[ ] Send preview without authentication (should be rejected)
[ ] Send preview with invalid fileId (404)
[ ] Send upload with file > 500MB (should fail)
[ ] Send malformed JSON (should fail gracefully)
```

### Performance Testing
```
[ ] Time upload of 10 files: Should be < 5 seconds
[ ] Time duplicate check: Should be < 100ms
[ ] Time admin stats calculation: Should be < 3 seconds
[ ] Monitor memory during operations (no leaks)
[ ] Check database query times (should be < 100ms each)
```

---

## ✅ Phase 5: Security Testing

### Authentication & Authorization
```
[ ] User cannot preview others' papers (403 error)
[ ] Moderator can preview any paper
[ ] Admin can preview any paper
[ ] User cannot download others' papers
[ ] Co-authors can access shared papers
```

### Input Validation
```
[ ] Non-PDF/DOCX files rejected
[ ] Oversized files rejected (> 500MB)
[ ] No SQL injection possible (MongoDB injection checks)
[ ] No XSS in error messages
[ ] Special characters in filenames handled safely
```

### Data Protection
```
[ ] File hashes not exposed in API responses
[ ] No sensitive data in error messages
[ ] Passwords not logged
[ ] User data properly isolated
[ ] No timing attacks possible
```

---

## ✅ Phase 6: Database Verification

### Schema Check
```
[ ] GridFS files collection exists
[ ] GridFS chunks collection exists
[ ] Papers.files has metadata field
[ ] fileHash field properly stored
[ ] isValidPaper field properly stored
[ ] Download count stored correctly
```

### Index Verification  
```
[ ] Check if fileHash index exists:
    db.papers.files.getIndexes()
[ ] If not, create it:
    db.papers.files.createIndex({ "metadata.fileHash": 1 })
[ ] Check SDG index (optional but recommended)
[ ] Verify indexes are being used (use explain())
```

### Backup Verification
```
[ ] Database backup created
[ ] Backup can be restored (test restore process)
[ ] Backup location documented
[ ] Backup schedule set up (if applicable)
[ ] Restore procedure documented
```

---

## ✅ Phase 7: Performance Testing

### Load Testing
```
[ ] Test with 100 concurrent uploads: No errors?
[ ] Test with 1000 papers in database: Stats still fast?
[ ] Test duplicate check with 10,000 files: < 100ms?
[ ] Monitor server memory: No spike?
[ ] Check database connections: Within limits?
```

### Browser Compatibility
```
[ ] Test in Chrome 90+ ✅
[ ] Test in Firefox 88+ ✅
[ ] Test in Safari 14+ ✅
[ ] Test in Edge 90+ ✅
[ ] Test on mobile browser ✅
```

---

## ✅ Phase 8: Documentation Verification

### User Documentation
```
[ ] Users know about duplicate prevention
[ ] Users understand file size requirements
[ ] Users know how to preview papers
[ ] Users told about SDG classifications
[ ] Help documentation updated
```

### Developer Documentation
```
[ ] API documentation is current
[ ] Installation guide is accurate
[ ] Configuration options documented
[ ] Troubleshooting guide complete
[ ] Code comments are clear
```

---

## ✅ Phase 9: Staging Deployment

### Deploy to Staging
```
[ ] Copy backend files to staging
[ ] Copy frontend files to staging
[ ] Update configuration for staging
[ ] Run build: npm run build (frontend)
[ ] Start services: npm start (backend)
[ ] Verify services are running
[ ] Check logs for errors
```

### Staging Testing
```
[ ] Run same tests as local (Features 1-6)
[ ] Test with real network latency
[ ] Test with staging database
[ ] Verify all endpoints responding
[ ] Check frontend UI renders correctly
[ ] Test with multiple users simultaneously
```

### Staging Monitoring
```
[ ] Monitor CPU usage
[ ] Monitor memory usage
[ ] Monitor database connections
[ ] Monitor response times
[ ] Check error logs
[ ] No unexpected behaviors?
```

---

## ✅ Phase 10: Production Deployment

### Pre-Production Checklist
```
[ ] Backup production database
[ ] Notify stakeholders
[ ] Prepare rollback plan
[ ] Document deployment procedure
[ ] Set up monitoring alerts
[ ] Test deployment procedure on staging
```

### Deploy to Production
```
[ ] Stop backend server gracefully
[ ] Back up code (git tag current version)
[ ] Deploy new backend code
[ ] Deploy new frontend code
[ ] Restart backend server
[ ] Run verify checklist (below)
```

### Verify Deployment
```
[ ] Backend server running (curl http://localhost:3000/)
[ ] Frontend accessible (http://localhost:5173/)
[ ] Database connection working
[ ] All endpoints responding
[ ] Admin dashboard showing new SDG section
[ ] Upload with validation working
[ ] No errors in logs
```

---

## ✅ Phase 11: Post-Deployment

### Immediate Monitoring (First Hour)
```
[ ] Monitor error logs for issues
[ ] Monitor database performance
[ ] Check API response times
[ ] Verify user activity flows
[ ] No spike in errors?
[ ] Users can upload/preview/download?
```

### Extended Monitoring (First Day)
```
[ ] Check all 6 features working
[ ] Monitor performance metrics
[ ] Review user feedback
[ ] Check admin dashboard updating
[ ] Verify statistics calculating correctly
[ ] No data loss or corruption?
```

### Week 1 Follow-up
```
[ ] Analyze usage patterns
[ ] Check for duplicate attempts blocked
[ ] Verify SDG statistics accurate
[ ] Monitor download counts
[ ] Gather user feedback
[ ] Document any issues
```

---

## ❌ Rollback Procedure (If Needed)

### If Critical Issue Found
```
[ ] Stop the application
[ ] Restore database from backup
[ ] Revert code to previous version:
    git checkout <previous-tag>
[ ] Restart with old code
[ ] Verify services running
[ ] Notify users
[ ] Document what went wrong
```

### Prevention for Next Deployment
```
[ ] Review what went wrong
[ ] Add test case to prevent recurrence
[ ] Update documentation
[ ] Schedule deeper testing
[ ] Plan phased rollout approach
```

---

## 📞 Support Contacts

### In Case of Issues
```
Database Issues:
└─ Check MongoDB Atlas console
└─ Review connection logs
└─ Verify network whitelist

Backend Issues:
└─ Check Node.js error logs
└─ Review recent code changes
└─ Check system resources

Frontend Issues:
└─ Check browser console
└─ Clear cache (Ctrl+Shift+Delete)
└─ Check API connectivity

Getting Help:
└─ Check TROUBLESHOOTING section in docs
└─ Review API_REFERENCE.md
└─ Check DEPLOYMENT_READY.md
```

---

## ✅ Final Approval Sign-Off

```
Code Review:           ________  (Date)
Testing Complete:      ________  (Date)
Security Verified:     ________  (Date)
Performance OK:        ________  (Date)
Staging Approved:      ________  (Date)
Ready for Production:  ________  (Date)
```

---

## 🎯 Keep This Checklist

**Print or save this checklist** for future deployments:
- Keeps process consistent
- Prevents forgotten steps
- Documents what was checked
- Reduces deployment time

---

**Status**: ✅ **YOU ARE DEPLOYMENT READY**

🚀 When you're ready to deploy, follow this checklist top to bottom.

