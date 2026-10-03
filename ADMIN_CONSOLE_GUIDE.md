# AI Insurance Claim Investigation & Fraud Operations Console

## Overview

The Admin Dashboard has been completely redesigned as an **AI-powered claim investigation and fraud detection console** with a sophisticated multi-agent workflow system. This system ensures that claims are **never automatically processed** and always require explicit human oversight.

## Key Features

### 🎯 Claim Processing Workflow

**IMPORTANT:** Claims submitted by users start with status `AWAITING_PROCESSING`. They will **NOT** be automatically analyzed. An admin must explicitly click the **"Process Claim"** button to trigger the AI investigation pipeline.

### 🔄 Processing Flow

```
User Submits Claim
    ↓
AWAITING_PROCESSING (manual trigger required)
    ↓
Admin Clicks "Process Claim"
    ↓
PROCESSING (AI agents execute)
    ↓
Planner Agent → Security Agent → Coverage Agent → Weather Agent 
    → Fraud Detection → Payout Agent → Audit Agent
    ↓
AWAITING_REVIEW (human decision required)
    ↓
Admin Reviews & Decides
    ↓
APPROVED or REJECTED
```

### 🤖 AI Agent Workflow

The system employs **7 specialized AI agents** that execute sequentially:

1. **Planner Agent** 🎯
   - Routes claim to specialized agents
   - Orchestrates workflow execution
   - Monitors pipeline progress

2. **Security Agent** 🔒
   - Session validation
   - File sanitization checks
   - PII handling verification
   - Data handling policy enforcement

3. **Coverage Agent** 📋
   - Policy coverage evaluation
   - Coverage limits determination
   - Deductible calculation
   - Eligibility assessment

4. **Weather Agent** 🌤️
   - Incident weather verification
   - Location consistency checks
   - Event timeline validation
   - External data correlation (when available)

5. **Fraud Detection Agent** 🔍
   - **Multi-angle fraud analysis**
   - **Financial perspective**: amount anomalies, claim frequency
   - **Behavioral perspective**: timing patterns, history flags
   - **Documentary perspective**: document quality, tampering detection
   - **Leading indicators**: predictive fraud signals
   - **Lagging indicators**: historical pattern matching
   - ML-based fraud probability scoring

6. **Payout Agent** 💰
   - Claimed amount validation
   - Coverage limit enforcement
   - Risk-adjusted payout calculation
   - Fast-track eligibility determination

7. **Audit Agent** ✓
   - Comprehensive audit summary
   - Human recommendation generation
   - Key checks validation
   - Final confidence assessment

### 📊 Investigation Results Dashboard

After processing, the console displays:

- **Overall Recommendation**: APPROVE / MANUAL REVIEW / REJECT
- **Risk Score**: Low / Medium / High with fraud probability %
- **Fraud Indicators**: Leading and lagging indicators with detailed analysis
- **Coverage Results**: Eligibility, limits, deductibles
- **Payout Calculation**: Recommended amount with full breakdown
- **Agent Findings**: Expandable details from each agent
- **Evidence Summary**: Uploaded documents and metadata
- **Audit Trail**: Complete execution timeline with durations

### 🎨 Modern UI Features

- **Animated Workflow Graph**: Real-time agent execution visualization
- **Connected Node System**: Similar to workflow automation platforms
- **Color-Coded Agent Cards**: Each agent has distinct branding
- **Expandable Agent Details**: Click to view full output and reasoning
- **Responsive Layout**: Works on all screen sizes
- **Smooth Transitions**: Professional animations and micro-interactions
- **Status Indicators**: Clear visual feedback for each processing stage

## Fraud Detection Rules

The system implements insurance fraud investigation best practices:

### Financial Red Flags
- Claim amount significantly above average
- Claim near policy limits
- High-value claims requiring verification
- Multiple claims in short period
- Recent previous claim activity

### Behavioral Red Flags
- Significant reporting delay (> 7 days)
- Claim filed shortly after policy start (< 30 days)
- Historical fraud indicators
- Previous claim rejections
- High geographic risk location

### Documentary Red Flags
- Missing required documents
- Duplicate or recycled documents
- Document tampering or alteration detected
- Suspicious metadata or timestamps
- Inconsistent evidence quality

### Leading Indicators (Predictive)
- Policy timing anomalies
- Geographic risk patterns
- Claim amount outliers
- Reporting delay patterns

### Lagging Indicators (Historical)
- ML model confidence scores
- Historical pattern matching
- Previous fraud markers
- Risk classification trends

## API Endpoints

### Process Claim
```
POST /api/admin/claims/[id]/process
```
Triggers the complete AI agent workflow for a claim.

**Important:** This is the ONLY way to start claim processing. No automatic processing occurs.

### Get Claims
```
GET /api/admin/claims?status=AWAITING_PROCESSING
```
Retrieve claims filtered by status, risk level, etc.

### Approve Claim
```
POST /api/admin/claims/[id]/approve
```
Final human approval after AI analysis.

### Reject Claim
```
POST /api/admin/claims/[id]/reject
```
Final human rejection with reason notes.

## Claim Statuses

| Status | Description | Next Action |
|--------|-------------|-------------|
| `AWAITING_PROCESSING` | Newly submitted, not analyzed | Admin clicks "Process Claim" |
| `PROCESSING` | AI agents executing | Wait for completion |
| `AWAITING_REVIEW` | AI complete, needs human decision | Admin approves/rejects |
| `approved` | Final approval granted | Payout processing |
| `rejected` | Final rejection | Customer notification |
| `ERROR` | Processing failed | Admin investigation |

## Safety & Compliance

✅ **Manual Trigger Only**: No automatic claim processing  
✅ **Human Oversight Required**: Final decisions always require admin approval  
✅ **Audit Trail**: Complete logging of all agent decisions  
✅ **Transparent AI**: Expandable reasoning for every agent step  
✅ **Error Handling**: Failed processing doesn't approve/reject claims  
✅ **Reprocessing**: Admin can reprocess claims if needed  

## External Verification

The system labels unavailable external services appropriately:

- Weather verification: **Simulated** (no external API connected)
- Document OCR: Uses PDF text extraction
- Identity verification: **Not Checked** (placeholder)
- External fraud databases: **Unavailable**

These integrations can be added by connecting real APIs in the agent service files.

## File Structure

```
/app/admin/dashboard/page.js          # Main dashboard with claim list
/app/api/admin/claims/[id]/process/   # Processing orchestration endpoint
/components/admin/
  ├── ClaimInvestigationConsole.js    # Main console component
  ├── AgentWorkflowGraph.js           # Animated workflow visualization
  ├── ClaimDetailsPanel.js            # Claim information sidebar
  └── ProcessingResults.js            # Results & recommendations
/lib/nemo-agents-service.js           # Multi-agent orchestration
/lib/fraud-analysis-service.js        # Fraud detection logic
/lib/mongodb-claims.js                # Database operations
```

## Usage

1. Navigate to `/admin/dashboard`
2. View the claims queue with real-time status
3. Click on a claim to open the investigation console
4. Review claim details and evidence
5. Click **"Process Claim"** to start AI analysis
6. Watch agents execute in real-time (animated workflow)
7. Review detailed results in tabs: Summary / Fraud Analysis / Payout
8. Make final human decision: Approve or Reject

## Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **AI**: Groq (multi-agent orchestration)
- **Database**: MongoDB (claim persistence)
- **Models**: Gemini 2.0, GPT (fraud analysis)

## Performance

- Agent workflow typically completes in **5-15 seconds**
- Each agent execution logged with duration
- No blocking operations - async processing
- Optimized for large claim volumes

## Future Enhancements

- Real-time streaming of agent execution
- WebSocket support for live updates
- Integration with external verification APIs
- Advanced document OCR and analysis
- Automated evidence quality scoring
- Claimant risk profiling
- Geographic fraud heat maps
- Historical pattern analysis dashboard

---

**Note:** This system is designed for insurance fraud investigation and follows industry best practices from NICB (National Insurance Crime Bureau) and NAIC (National Association of Insurance Commissioners) guidelines.
