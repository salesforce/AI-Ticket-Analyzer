# AI Ticket Analyzer for Salesforce

A production-ready unlocked package for Field Service Lightning that enables field technicians to photograph handwritten delivery tickets and service receipts, then automatically extract structured data using Agentforce AI.

[![Salesforce API](https://img.shields.io/badge/Salesforce%20API-v61.0-blue)](https://developer.salesforce.com/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE.txt)

## 🎯 Overview

This package solves the common field service challenge of manually transcribing handwritten tickets into Salesforce. Field technicians can:

- 📸 Take photos of handwritten receipts directly from their mobile device
- 🤖 Automatically extract customer, delivery, and service data using Agentforce AI
- ✍️ Handle poor handwriting quality ("chicken scratch")
- 📱 Offline detection with graceful UI degradation (requires connection for AI processing)
- ✅ Reduce manual data entry errors by 80-90%
- ⚡ Speed up ticket processing from 5-10 minutes to 30 seconds

---

## 🚀 Quick Start

### Installation Links

**Production Orgs:**
```
https://login.salesforce.com/packaging/installPackage.apexp?p0=04tKj000000fTEtIAM
```

**Sandbox Orgs:**
```
https://test.salesforce.com/packaging/installPackage.apexp?p0=04tKj000000fTEtIAM
```

### CLI Installation

**Prerequisites:** Authenticate to your org first:
```bash
sf org login web --alias YourOrgAlias
```

Then install the package (replace `YourOrgAlias` with your actual org alias):
```bash
sf package install --package 04tKj000000fTEtIAM --target-org YourOrgAlias --wait 20
```

---

## 📌 Installation Methods Comparison

| Feature | Package Installation | Manual Deployment |
|---------|---------------------|-------------------|
| **Ease of Use** | ✅ One-click install | ❌ Requires CLI/DevOps |
| **FSL Mobile Setup** | ⚠️ Manual page layout configuration required | ⚠️ Manual page layout configuration required |
| **Version Management** | ✅ Built-in | ❌ Manual tracking |
| **Upgrades** | ✅ Simple package update | ❌ Redeploy all files |
| **Distribution** | ✅ Share install link | ❌ Share source code |
| **Best For** | Production orgs, customers | Development, customization |

**Note:** Both installation methods require adding the Quick Action to the Work Order page layout (Step 3).

**Recommendation:** Use package installation for production. Use manual deployment only if you need to customize the code.

---

## 📦 What's Included

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| **aiTicketAnalyzer** | Lightning Web Component | Mobile-optimized file upload and AI analysis UI |
| **FileUploadAIProcessor** | Apex Controller | Handles file uploads and Agentforce API integration |
| **FileUploadAIProcessorTest** | Apex Test Class | Provides code coverage for packaging |
| **Read Handwriting - Delivery Tickets** | GenAI Prompt Template | AI instructions for extracting structured data from handwritten tickets |
| **Analyze_Ticket_with_AI** | Quick Action | One-tap access from Work Order records |
| **AI Ticket Analyzer User** | Permission Set | Grants Lightning SDK for FSL Mobile and required object/Apex access |

### Key Features

- ✅ **Mobile-First Design** - Touch-optimized for FSL Mobile App
- ✅ **Offline Detection** - Real-time status monitoring with graceful UI degradation
- ✅ **Smart Validation** - File type (.jpg, .png, .pdf) and size checking (up to 15MB)
- ✅ **AI-Powered OCR** - Handles messy handwriting with confidence scoring
- ✅ **Structured Markdown Output** - Readable format for clipboard copy (customizable to JSON for automation)

---

## 💼 Use Cases

### Fuel Delivery Industry (Primary)
- Extract delivery ticket data: customer info, gallons delivered, tank levels
- Process service inspections: leak checks, certifications, connected appliances
- Monitor driver notes and safety concerns
- Track tank specifications and inspection history

### General Field Service
- Process handwritten work order notes
- Extract time, materials, and labor data
- Capture customer signatures and approvals
- Document service completion details

---

## 📋 Requirements

### Salesforce Edition
- ✅ Enterprise Edition or higher
- ✅ Field Service Lightning (FSL) enabled

### Required Features
- ✅ **Agentforce for Field Service** or **Agentforce AI Platform**
- ✅ **Prompt Builder** enabled
- ✅ **Flex Credits** available (contact Salesforce Account Team)
- ✅ **WorkOrder** object accessible

### User Permissions
- Read/Write access to WorkOrder
- Create/Read access to ContentVersion and ContentDocumentLink
- Execute Apex permission
- Access to Agentforce Prompt Templates

---

## 🔧 Installation & Setup

### Prerequisites Checklist

Before installing, verify:

- [ ] Salesforce Enterprise Edition or higher
- [ ] Field Service Lightning enabled
- [ ] System Administrator permissions
- [ ] Agentforce Platform enabled
- [ ] Prompt Builder feature enabled
- [ ] Flex Credits available

### Step 1: Install the Package

**Option A: Click Installation Link (Easiest)**

Click the appropriate link above for Production or Sandbox, then:
1. Choose **Install for Admins Only** (recommended for testing)
2. Click **Install**
3. Wait 2-5 minutes for installation

**Option B: Use Salesforce CLI**

```bash
sf package install --package 04tKj000000fTEtIAM --target-org YourOrgAlias --wait 20 --security-type AdminsOnly
```

**Note:** Replace `YourOrgAlias` with your org alias from `sf org login web --alias YourOrgAlias`

---

**⚠️ IMPORTANT:** After package installation completes, you MUST complete Steps 2 and 3 below:
- **Step 2:** Activate the prompt template "Read Handwriting - Delivery Tickets"
- **Step 3:** Add the Quick Action to the Work Order page layout

### Step 2: Enable and Activate Prompt Template (**REQUIRED**)

**⚠️ CRITICAL POST-DEPLOYMENT STEP:** The prompt template must be activated after installation.

1. Navigate to **Setup** → **Einstein Setup**
2. Ensure **Prompt Builder** is enabled
3. Navigate to **Setup** → **Prompt Builder**
4. Locate the prompt template named **"Read Handwriting - Delivery Tickets"**
5. **If status shows "Draft":** Click on the template → Click **Activate** button
6. **Verify:** Status should now show **"Active"** (active and ready to use)

**Note:** The package deploys the template in Published status, but you must verify it's active in your org.

### Step 3: Add Quick Action to Work Order Page Layout (**REQUIRED**)

**⚠️ CRITICAL:** The AI Ticket Analyzer must be added to the Work Order page layout for field technicians to access it.

**Configure the Quick Action:**

1. Navigate to **Setup** in Salesforce
2. In the **Quick Find** box, type `Object Manager` and select it
3. Find and click on **Work Order**
4. Click **Page Layouts** from the left sidebar
5. Click on the page layout used by your field technicians (typically **Work Order Layout** or **FSL Work Order Layout**)
6. Find the **Salesforce Mobile and Lightning Experience Actions** section (usually at the top of the layout editor)
7. In the action palette on the left, locate **Analyze Ticket with AI** under Quick Actions
8. **Drag and drop** the **Analyze Ticket with AI** action into the **Mobile & Lightning Actions** section
9. Position it near the top for easy access by field technicians
10. Click **Save**

**📱 Pro Tip for Mobile Users:**

After adding the Quick Action to the page layout, mobile users may need to **log out and log back in** to the Field Service Mobile app to see the new action appear. Simply pulling down to refresh or syncing may not be sufficient due to mobile session caching.

**Verify Quick Action Setup:**
1. Open any **Work Order** record in Salesforce
2. Look for the **Analyze Ticket with AI** button in the highlights panel or actions menu
3. In the **Field Service Mobile App**, open a Work Order and verify the action appears in the action bar

### Step 4: Assign Permission Set (**REQUIRED for FSL Mobile App**)

**⚠️ CRITICAL:** Users must have the "Lightning SDK for Field Service Mobile" permission for the LWC component to work properly in the FSL Mobile App. Without this permission, clicking the action will redirect users to the standard Salesforce app instead of staying in FSL Mobile.

**The package includes a ready-to-use permission set:**

1. Navigate to **Setup** → **Permission Sets**
2. Find **"AI Ticket Analyzer User"** (installed with the package)
3. Click **Manage Assignments**
4. Click **Add Assignments**
5. Select all field technicians and service managers who will use the FSL Mobile App
6. Click **Assign**

**What this permission set includes:**
- ✅ **Lightning SDK for Field Service Mobile** (enables LWC in FSL Mobile App)
- ✅ **Custom Applications for Field Service Mobile** (required for custom app extensions)
- ✅ **WorkOrder** read access
- ✅ **ContentVersion/ContentDocument** create and read access
- ✅ **ContentDocumentLink** create and read access

**⚠️ IMPORTANT:** After assigning the permission set, users MUST log out and log back in to the FSL Mobile App for the changes to take effect. Simply pulling down to refresh will not work.

### Step 5: Test the Installation

1. Open any Work Order record
2. Click **Analyze Ticket with AI** quick action
3. Upload a test image of handwritten text
4. Verify AI analysis completes and returns structured JSON
5. Check that file attaches to the Work Order

---

## 🎓 Usage Guide

### For Field Technicians

1. **Open Work Order** in FSL Mobile App
2. **Tap "Analyze Ticket with AI"** quick action
3. **Take photo** or select from gallery
4. **Wait for AI processing** (10-30 seconds)
5. **Review extracted data** in structured Markdown format
6. **Copy to clipboard** or manually enter into fields

**Output Format:** The AI returns well-formatted Markdown for easy reading and clipboard copying. The prompt template can be customized to output JSON instead if you need structured data for automated record creation or updates.

### Data Extracted

The AI automatically extracts:

- ✅ Customer information (name, account, address, phone)
- ✅ Delivery details (date, time, driver, truck number)
- ✅ Product information (type, gallons, price, total cost)
- ✅ Tank data (size, levels, totalizer readings)
- ✅ Service information (work order, inspections, leak checks)
- ✅ Connected appliances (heating, water heater, generator, etc.)
- ✅ Safety alerts and follow-up requirements

---

## 🛠️ Technical Specifications

| Aspect | Details |
|--------|---------|
| **API Version** | 61.0 |
| **Package Type** | Unlocked (namespace-free) |
| **Package ID** | 0HoKj000000XuZsKAK |
| **Version** | 1.3.0-1 (Released) |
| **AI Model** | OpenAI GPT-4 Omni (vision-capable) |
| **Supported Files** | .jpg, .png, .pdf (Note: .jpeg not supported) |
| **Max File Size** | 15 MB |
| **Code Coverage** | Packaging-validated |
| **Security** | `with sharing` on Apex, Einstein Trust Layer for AI |

---

## 🔐 Security & Compliance

- **Sharing Model**: `with sharing` enforced on Apex controller
- **File Access**: Automatically linked to parent Work Order
- **Data Privacy**: Files stored in Salesforce Files with standard encryption
- **AI Processing**: Uses Salesforce Einstein Trust Layer (data not used for model training)
- **Audit Trail**: All file uploads logged in ContentVersion history

---

## 🐛 Troubleshooting

### "No response received from AI model"
**Cause:** Agentforce not enabled or no Flex credits available

**Solution:**
1. Verify Agentforce is enabled in Setup → Einstein Setup
2. Check Flex credit balance
3. Contact Salesforce Account Team for credit allocation

### "Prompt template not found"
**Cause:** Template didn't deploy or isn't activated

**Solution:**
1. Navigate to Setup → Prompt Builder
2. Verify **"Read Handwriting - Delivery Tickets"** template exists
3. Check Status is **"Active"** (if showing "Draft", click template and click **Activate**)
4. If template is missing entirely, redeploy the package

### Quick Action Not Appearing
**Cause:** Page layout not updated

**Solution:**
1. Verify page layout includes the action
2. Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
3. Check user has WorkOrder object access

### File Upload Fails
**Cause:** File size, type, or permissions

**Solution:**
1. Verify file is under 15MB
2. Check file extension is .jpg, .png, or .pdf (Note: .jpeg files are not supported by the AI model)
3. Confirm user has ContentVersion create permission
4. Review Apex debug logs for details

### Quick Action Not Appearing in FSL Mobile App
**Cause:** Quick Action not added to Work Order page layout

**Solution:**

The **Analyze Ticket with AI** Quick Action must be added to the Work Order page layout. Follow Step 3 in the installation instructions above to add the Quick Action through Setup → Object Manager → Work Order → Page Layouts.

**Mobile users:** After the admin adds the Quick Action to the page layout, you may need to **log out and log back in** to the Field Service Mobile app for the action to appear.

### Quick Action Opens in Browser Instead of FSL Mobile App
**Cause:** User missing required FSL Mobile permissions

**Solution:**

Two critical permissions are required for LWC components to function properly within the FSL Mobile App:
1. **Lightning SDK for Field Service Mobile** (FieldServiceAccess)
2. **Custom Applications for Field Service Mobile** (CustomMobileAppsAccess)

**Steps to fix:**
1. Navigate to **Setup** → **Permission Sets**
2. Find **"AI Ticket Analyzer User"** permission set
3. Click **Manage Assignments**
4. Verify the affected user is assigned to this permission set
5. If not assigned: Click **Add Assignments** → Select the user → Click **Assign**
6. **CRITICAL:** Have the user **log out and log back in** to the FSL Mobile App (pulling down to refresh is NOT sufficient)

---

## 🛠️ Manual Deployment (Alternative to Package)

If you prefer to deploy the source code directly instead of installing the package:

### Deploy Source Code

```bash
# Clone the repository
git clone https://github.com/amurthi-salesforce/AI_Ticket_Analyzer.git
cd AI_Ticket_Analyzer

# Deploy the components (replace YourOrgAlias with your actual org alias)
sf project deploy start --source-dir force-app --target-org YourOrgAlias --test-level RunLocalTests
```

### Configure Quick Action on Page Layout (Manual Setup Required)

**IMPORTANT:** After deploying the source code, you MUST add the Quick Action to the Work Order page layout through the Salesforce UI (see Step 3 in the Installation section above). Also ACTIVATE the deployed prompt template.

Follow the page layout configuration steps to add the "Analyze Ticket with AI" Quick Action to the Work Order layout used by field technicians.

---

## 🤝 Support

For issues, questions, or feature requests:

1. **Review Documentation** - Check this README and troubleshooting section
2. **Debug Logs** - Setup → Debug Logs (enable for your user)
3. **GitHub Issues** - File an issue in the repository
4. **Salesforce Support** - Contact for Agentforce enablement questions

---

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE.txt).

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and our [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request. All contributors must sign the [Salesforce CLA](https://cla.salesforce.com/sign-cla).

## 🔒 Security

Please review our [Security Policy](SECURITY.md) for guidance on reporting vulnerabilities. Do not file public GitHub issues for security concerns.

---

## 🔗 Resources

- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta)
- [Agentforce Documentation](https://help.salesforce.com/s/articleView?id=sf.prompt_builder.htm)
- [Field Service Lightning](https://help.salesforce.com/s/articleView?id=sf.fs_overview.htm)
- [Lightning Web Components](https://developer.salesforce.com/docs/component-library/documentation/en/lwc)

---

**Package Version:** 1.3.0-1
**Last Updated:** March 8, 2026
**Status:** ✅ Production Ready
