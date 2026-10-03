# 🎯 Navigation Guide - New Pages

## All Available URLs

### 1. **Your Policies (Insurance Management)** ⭐ NEW
```
http://localhost:3000/user/policies
```
- View all your insurance policies
- Load demo policies (Motor, Health, Travel, Home)
- Add new policies
- Click "File Claim" to go to AI assistant

### 2. **AI Claim Assistant** ⭐ NEW - MAIN FEATURE
```
http://localhost:3000/user/claim-assistant?policyId=YOUR_POLICY_ID
```
- Conversational AI claim filing
- Chat with AI to describe your incident
- Smart follow-up questions
- Document upload with camera
- Review and submit

**Note**: You need a policyId parameter. Get it by:
1. Go to `/user/policies`
2. Load demo policies
3. Click "File Claim" button on any policy

### 3. **Policy Details** ⭐ NEW
```
http://localhost:3000/user/policies/[id]
```
- View complete policy information
- See coverage, premium, dates
- Type-specific details (vehicle, health, etc.)
- "File a Claim" button

### 4. **Claims** (Enhanced)
```
http://localhost:3000/user/claims
```
- View all submitted claims
- Enhanced navigation
- Links to policies

### 5. **Old Claim Submission** (Still works)
```
http://localhost:3000/user/submit-claim
```
- Your previous claim form
- Still functional
- Can be used alongside new system

### 6. **Policy Chat** (Existing - PDF based)
```
http://localhost:3000/user/policy
```
- Upload PDF policies
- Chat about policy documents
- Different from policy management

## 🚀 Quick Start Flow

### Step 1: Go to Your Policies
```
http://localhost:3000/user/policies
```

### Step 2: Load Demo Data
Click the **"✨ Load Demo Policies"** button

### Step 3: View a Policy
Click **"View Details"** on any policy card

### Step 4: File a Claim
Click **"File Claim"** button
- This opens the AI Claim Assistant

### Step 5: Chat with AI
Type something like:
- "My car was hit from behind yesterday"
- "I need to claim for hospital bills"
- "Storm damaged my roof last week"

### Step 6: Answer Questions
- AI will ask follow-up questions
- Use quick buttons or type answers

### Step 7: Upload Documents
- Click "Upload Documents" stage
- Take photos or upload files

### Step 8: Review & Submit
- Review your claim
- Submit to existing API

### Step 9: View Claims
Go to `/user/claims` to see your submitted claim

## 🎨 Visual Comparison

### OLD SUBMIT CLAIM PAGE
- `/user/submit-claim`
- Large text area form
- Manual file upload
- Simple "Load Demo" button

### NEW AI CLAIM ASSISTANT
- `/user/claim-assistant`
- Conversational chat interface
- Smart questions
- Policy-aware
- Document requirements
- Progress tracking
- Review screen

### NEW YOUR POLICIES
- `/user/policies`
- Professional policy cards
- Demo data loader
- File claim buttons

## 🔍 How to Test

1. **Start server**: `npm run dev`
2. **Login**: Go to `/login`
3. **Navigate to**: `http://localhost:3000/user/policies`
4. **Click**: "✨ Load Demo Policies"
5. **Result**: 4 policies appear (Motor, Health, Travel, Home)
6. **Click**: "File Claim" on Motor policy
7. **Result**: AI Claim Assistant opens
8. **Type**: "My car was hit from behind"
9. **Result**: AI extracts info and asks questions

## 🐛 Troubleshooting

### "Getting same page"
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check you're going to the right URL
- Restart dev server: `npm run dev`

### "Page not found"
- Make sure server is running
- Check the URL is correct
- Verify files exist in `app/user/` folders

### "No policies showing"
- Click "Load Demo Policies" button
- Check browser console for errors
- Verify MongoDB connection

## 📁 File Locations

```
app/user/
├── claim-assistant/
│   └── page.js          ⭐ NEW - AI Chat Interface
├── policies/
│   ├── page.js          ⭐ NEW - Your Policies List
│   └── [id]/
│       └── page.js      ⭐ NEW - Policy Details
├── claims/
│   └── page.js          ✏️ UPDATED - Enhanced navigation
├── submit-claim/
│   └── page.js          📝 EXISTING - Old form (still works)
└── policy/
    └── page.js          📝 EXISTING - PDF chat (different feature)
```

## 🎯 URL Cheat Sheet

| Feature | URL | Status |
|---------|-----|--------|
| Your Policies | `/user/policies` | ⭐ NEW |
| AI Claim Assistant | `/user/claim-assistant?policyId=X` | ⭐ NEW |
| Policy Details | `/user/policies/[id]` | ⭐ NEW |
| Claims List | `/user/claims` | ✏️ Enhanced |
| Old Claim Form | `/user/submit-claim` | Still works |
| PDF Policy Chat | `/user/policy` | Existing feature |
| Dashboard | `/dashboard` | Existing |
| Login | `/login` | Existing |

## 💡 Pro Tips

1. **Always start at** `/user/policies` to see the new interface
2. **Load demo data first** - Click the demo button to get 4 policies
3. **Use "File Claim" buttons** - They automatically pass the policy ID
4. **Try the AI chat** - Type naturally, like you're talking to a person
5. **Mobile friendly** - Try it on your phone, camera upload works!

## ✅ Success Checklist

- [ ] Can see Your Policies page at `/user/policies`
- [ ] Can load 4 demo policies
- [ ] Can view policy details
- [ ] Can click "File Claim" button
- [ ] AI Claim Assistant opens
- [ ] Can chat with AI
- [ ] Can upload documents
- [ ] Can submit claim
- [ ] Claim appears in `/user/claims`

If all boxes are checked, everything is working! 🎉
