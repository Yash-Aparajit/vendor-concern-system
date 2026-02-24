# VendorConcern

### Automated Vendor Concern Reporting & Inspection System

![Google Apps Script](https://img.shields.io/badge/Google-Apps%20Script-4285F4?logo=google\&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google-Sheets-34A853?logo=google-sheets\&logoColor=white)
![Google Drive](https://img.shields.io/badge/Google-Drive-4285F4?logo=google-drive\&logoColor=white)
![Status](https://img.shields.io/badge/status-production-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Overview

VendorConcern is a production-ready inward inspection and vendor escalation system built using Google Apps Script, Google Sheets, and Google Drive.

It enables inspection teams to log inward material concerns, attach image evidence, and automatically notify vendors and stakeholders via structured email reports.

The system ensures accountability, traceability, and rapid communication in supply chain quality management.

---

## Key Features

* Vendor Code based lookup
* Automatic vendor email notification
* Image capture and evidence storage
* Structured inspection logging
* Real-time vendor validation
* Part ID description auto-fetch
* Concern categorization
* Audit-ready data storage
* Duplicate prevention using script locking
* Production-grade reliability

---

## System Architecture

```
Operator → Web App → Apps Script → Google Sheets → Google Drive → Vendor Email
```

---

## Folder Structure

```
VendorConcern/
│
├── Code.gs
├── index.html
├── README.md
└── .gitignore
```

---

## Google Sheets Structure

### Master_Vendor

| Vendor Code | Vendor Name | To Email | CC Email |

### Master_Part

| Part ID | Description |

### Master_Name

| Checker Name |

### Inward_Log

| Timestamp | Vendor Code | Vendor Name | Dock | Part ID | Description | Checker | Shift | Concern | Driver | Image Link | Image Preview | Remark |

---

## Deployment Guide

1. Create Google Sheet
2. Create required sheets
3. Add Apps Script
4. Deploy as Web App
5. Share with operators

---

## Email Features

Automatically sends structured email with:

* Vendor details
* Inspection details
* Concern description
* Image evidence link
* Stakeholder CC

---

## Reliability Features

* Script locking prevents duplicate entries
* Vendor validation prevents incorrect reporting
* Image upload verification
* Error handling and logging
* Production deployment safe

---

## Technology Stack

* Google Apps Script
* Google Sheets
* Google Drive
* HTML / CSS / JavaScript
* Gmail API

---

## Use Cases

* Manufacturing inward inspection
* Supplier quality control
* Warehouse receiving inspection
* Vendor escalation tracking
* Audit traceability systems

---

## Author

Schnellecke Jeena Pvt Ltd

---

## License

MIT License
