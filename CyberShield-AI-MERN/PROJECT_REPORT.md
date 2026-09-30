# CyberShield AI - Project Report

## Problem
Phishing attacks use fake websites, emails and messages to trick users into revealing credentials, financial information or clicking malicious links.

## Proposed Solution
CyberShield AI gives users a simple interface to submit suspicious content and receive a risk score, classification, reasons and defensive recommendations.

## Modules
1. URL Scanner
2. Email/Message Scanner
3. Explainable Risk Engine
4. MongoDB Scan History
5. Analytics Dashboard
6. Cyber Safety Assistant

## MERN Architecture
React frontend -> Express/Node REST API -> Mongoose -> MongoDB.

## Detection
The included engine is a transparent baseline using URL and language indicators. It is intentionally free and explainable. For a research-grade ML version, replace/augment `server/services/analyzer.js` with a trained scikit-learn model and validated public dataset.

## Future Scope
- Public phishing datasets and model training
- Browser extension
- OCR screenshot scanning
- Threat intelligence feeds
- Email attachment analysis
- Organization-level admin dashboard
- Model monitoring and evaluation
