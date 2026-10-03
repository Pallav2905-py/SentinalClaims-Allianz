# Quick Start - Admin Console

## 🚀 Getting Started

### 1. Access the Console
```
http://localhost:3000/admin/dashboard
```

### 2. What You'll See
- **Stats Overview**: Total claims, pending review, risk distribution
- **Claims Queue**: List of all submitted claims
- **Status Badges**: Color-coded claim statuses

### 3. Process a Claim

#### Step 1: Select Claim
Click on any claim in the queue to open the investigation console.

#### Step 2: Review Details
Left sidebar shows:
- Claim description
- Submitted timestamp
- Claim type
- Form answers
- Uploaded evidence

#### Step 3: Process
Click the blue **"Process Claim"** button at the top right.

⚠️ **IMPORTANT**: Claims will NOT process automatically. You must click this button.

#### Step 4: Watch Workflow
Observe the animated agent workflow:
- 7 agents execute sequentially
- Each shows status, duration, and decision
- Click any agent card to see detailed output

#### Step 5: Review Results
Three tabs of results:
- **Summary**: Overall recommendation, risk score, key metrics
- **Fraud Analysis**: Multi-angle fraud assessment, indicators
- **Payout**: Recommended payout calculation, eligibility

#### Step 6: Make Decision
- Click **"Approve Claim"** (green button) to approve
- Click **"Reject Claim"** (red button) to reject
- Rejection requires entering a reason

---

## 📊 Understanding the Results

### Risk Levels
- 🟢 **Low Risk** (0-40%): Standard processing recommended
- 🟡 **Medium Risk** (40-70%): Enhanced review suggested
- 🔴 **High Risk** (70-100%): Detailed investigation required

### Recommendations
- **APPROVE**: Low risk, all checks passed
- **MANUAL REVIEW**: Medium risk, human judgment needed
- **REJECT**: High risk, fraud indicators present

### Payout Calculation
```
Claimed Amount: User's requested amount
- Deductible: Policy deductible amount
= Base Amount
× Risk Multiplier: (0.7 for high risk, 0.9 for medium, 1.0 for low)
= Recommended Payout
```

---

## 🎯 Agent Workflow Explained

1. **Planner Agent**: Routes claim through pipeline
2. **Security Agent**: Validates data and security
3. **Coverage Agent**: Checks policy eligibility
4. **Weather Agent**: Verifies incident conditions
5. **Fraud Detection**: Analyzes fraud risk (most important)
6. **Payout Agent**: Calculates recommended amount
7. **Audit Agent**: Provides final recommendation

Each agent shows:
- ✅ Success icon or ❌ failure icon
- Duration in milliseconds
- Expandable detailed output

---

## 🔍 Fraud Indicators to Watch

### High Priority Flags
- Multiple claims in short period
- Claim filed < 30 days after policy start
- Missing or tampered documents
- Amount significantly above average
- Historical fraud indicators

### Medium Priority Flags
- Reporting delay > 7 days
- Geographic risk location
- Claim near policy limit
- Previous rejection history

---

## ⚙️ Claim Statuses

| Status | What It Means |
|--------|---------------|
| 🟣 **AWAITING_PROCESSING** | Just submitted, needs processing |
| 🔵 **PROCESSING** | AI agents currently running |
| 🟡 **AWAITING_REVIEW** | AI complete, needs your decision |
| 🟢 **approved** | Final approval granted |
| 🔴 **rejected** | Final rejection issued |
| ⚠️ **ERROR** | Processing failed, can reprocess |

---

## 💡 Tips & Best Practices

### Before Approving
✅ Check fraud probability is < 40%  
✅ Review all agent findings  
✅ Verify evidence completeness  
✅ Confirm payout calculation  
✅ Check for behavioral red flags  

### Before Rejecting
✅ Document specific fraud indicators  
✅ Review comprehensive analysis  
✅ Provide clear rejection reason  
✅ Check if reprocessing might help  

### General
- Higher risk claims need more scrutiny
- Trust the AI but verify key details
- Document your reasoning in notes
- Reprocess if results seem off
- Review evidence files carefully

---

## 🛠️ Troubleshooting

### Claim Won't Process
- Check if status is ERROR → can reprocess
- Verify claim has description
- Check for uploaded files
- Review error message if shown

### Wrong Results
- Click "Reprocess" button
- Agent might have had timeout
- Check internet connectivity
- Review claim description quality

### Missing Information
- Some external APIs are simulated
- Document verification is basic PDF parsing
- Weather data is narrative-based
- No identity verification connected yet

---

## 📞 Support

For issues or questions:
1. Check ADMIN_CONSOLE_GUIDE.md for detailed documentation
2. Review ADMIN_CONSOLE_FEATURES.md for technical details
3. Check agent logs in expanded view
4. Review database claim record

---

**Remember**: The AI provides recommendations. **You make the final decision.** Always use human judgment, especially for edge cases.
