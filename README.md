# SkillTrack — Skill Development & Employment Outcome Tracking

**Tracking the journey from skill development to sustainable employment.**

SkillTrack is a web-based prototype designed to help monitor training outcomes and understand the long-term impact of skill development programs. It focuses on connecting training records with employment progress, job retention, and career outcomes through a centralized dashboard.

Developed as a team project in the context of **Smart India Hackathon (SIH) 2026**, SkillTrack explores how digital tools and AI-assisted analysis can improve visibility into skill development outcomes.

<p align="center">
  <a href="https://ais-dev-s2yq4lrtrikucekizg5owc-124946549547.asia-east1.run.app/">
    <strong>🚀 Explore the Live Demo</strong>
  </a>
</p>

---

## 📌 Table of Contents

* [Problem Statement](#-problem-statement)
* [Our Solution](#-our-solution)
* [Key Features](#-key-features)
* [How It Works](#-how-it-works)
* [AI-Powered Insights](#-ai-powered-insights)
* [Technology Stack](#️-technology-stack)
* [Project Architecture](#️-project-architecture)
* [Getting Started](#-getting-started)
* [Project Status](#-project-status)
* [Future Scope](#-future-scope)
* [Team](#-team)
* [Disclaimer](#️-disclaimer)

---

## 🎯 Problem Statement

Completing a training program does not necessarily mean that a trainee has secured employment or achieved sustainable career growth.

Traditional training records often focus on immediate outcomes, such as attendance, assessment scores, and certification. Tracking what happens after training can be more difficult.

Important questions include:

* Did the trainee secure employment after completing training?
* Is the trainee still employed after several months?
* Has their salary or career situation improved?
* Which skills may need further development?
* How effective are training programs over time?

Without structured follow-up, understanding these long-term outcomes becomes challenging.

## 💡 Our Solution

SkillTrack proposes a centralized platform for following a trainee's journey from registration and training to placement, employment, and long-term outcome assessment.

The platform brings together training records, employment information, follow-up milestones, and analytical insights to support more informed decision-making.

Its primary objective is to move beyond counting training completions and toward understanding the outcomes that training programs produce.

---

## ✨ Key Features

### 👤 1. Trainee Profile Management

* Maintain trainee profiles and unique SkillTrack identifiers.
* Organize relevant education, training, and profile information.
* Support structured tracking of individual trainee journeys.

### 📚 2. Training & Assessment Tracking

* Record training attendance and assessment information.
* Track skills and certification-related details.
* Organize training progress for outcome monitoring.

### 💼 3. Placement & Employment Tracking

* Track placement and employment status.
* Support employment and self-employment outcome monitoring.
* Organize information related to salary and job retention.

### 📅 4. Longitudinal Follow-ups

The proposed follow-up framework includes milestones at:

* 30 days
* 90 days
* 6 months
* 12 months
* 24 months

These milestones are intended to help monitor employment progress beyond the initial placement stage.

### 🤖 5. AI-Assisted Analysis

* Explore trainee-level skill-gap and career analysis.
* Generate program-level insights from trainee information.
* Support the interpretation of employment and training outcomes.

AI-generated insights should be treated as decision-support information rather than definitive predictions.

### 📊 6. Analytics & Reporting

* Present key information through a centralized dashboard.
* Support the exploration of training and employment outcomes.
* Help identify patterns that may inform future training decisions.

*Feature availability depends on the current prototype implementation and configuration.*

---

## 🔄 How It Works

The proposed SkillTrack workflow follows the trainee's journey across multiple stages:

```text
        TRAINEE REGISTRATION
                 |
                 v
        TRAINING & ATTENDANCE
                 |
                 v
       ASSESSMENT & CERTIFICATION
                 |
                 v
        PLACEMENT & EMPLOYMENT
                 |
                 v
       POST-TRAINING FOLLOW-UP
                 |
                 v
      EMPLOYMENT & SALARY TRACKING
                 |
                 v
        AI-ASSISTED ANALYSIS
                 |
                 v
         DASHBOARD & REPORTS
```

The objective is to connect these stages into a longitudinal view of skill development outcomes rather than treating training completion as the final result.

---

## 🤖 AI-Powered Insights

SkillTrack incorporates an AI-assisted analysis approach using Google's Gemini API.

The application server includes endpoints for two analysis workflows:

**Individual Trainee Analysis**

* Examines submitted trainee information.
* Supports skill-gap and career-risk analysis.

**Program-Level Analysis**

* Processes a group of trainee records.
* Generates aggregated program-level insights.

These workflows are implemented through server-side API routes. Actual results depend on API configuration, the supplied data, and the current implementation.

AI-generated outputs are informational and should be reviewed before being used for consequential decisions about individuals.

---

## 🛠️ Technology Stack

The repository's package configuration identifies the following technologies:

| Technology        | Purpose                                |
| ----------------- | -------------------------------------- |
| React             | User interface                         |
| TypeScript        | Typed application development          |
| Vite              | Frontend development and build tooling |
| Tailwind CSS      | Interface styling                      |
| Firebase          | Application backend services           |
| Google Gemini API | AI-assisted analysis                   |
| Express.js        | Server-side API handling               |
| Node.js           | JavaScript runtime                     |
| Git & GitHub      | Version control and collaboration      |

**Development tools:** Google AI Studio and AI-assisted development workflows.

---

## 🏗️ Project Architecture

At a high level, the application is organized into three areas:

```text
SkillTrack
    |
    |-- Frontend
    |     |-- React
    |     |-- TypeScript
    |     |-- Vite
    |     |-- Tailwind CSS
    |
    |-- Server
    |     |-- Node.js
    |     |-- Express.js
    |     |-- AI analysis endpoints
    |
    |-- Services
          |-- Firebase
          |-- Google Gemini API
```

The frontend provides the interface for interacting with the platform. The server handles application API requests and AI-assisted analysis, while configured external services support the corresponding application functionality.

---

## 🚀 Getting Started

### Prerequisites

Install the following before running the application locally:

* Node.js
* npm
* A Firebase project configured for the application
* A Google Gemini API key, if you want to use the AI analysis functionality

### 1. Clone the Repository

```bash
git clone https://github.com/pranavraut1402/SkillTrack.git
cd SkillTrack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Review the `.env.example` file in the repository and create a local environment configuration using the variables required by the application.

For example, if the project expects a Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Use the exact variable names required by the current code and configuration.

**Important:** Never commit real API keys, passwords, private credentials, or production environment files to GitHub.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local address displayed in your terminal.

### 5. Build the Application

```bash
npm run build
```

To run the production build, use the configured start script:

```bash
npm run start
```

Review the repository's scripts and environment configuration before deploying the application.

---

## 📍 Project Status

**Current stage: Working prototype / demonstration project**

SkillTrack is being developed to demonstrate a structured approach to training outcome tracking, employment follow-ups, and AI-assisted analysis.

The project is intended to demonstrate the proposed workflow and application experience. It should not be interpreted as a fully deployed government system or as a source of verified real-world employment statistics.

---

## 🔮 Future Scope

Potential improvements include:

* **Long-term Outcome Tracking:** Improve the recording and visualization of employment outcomes over time.
* **Advanced Analytics:** Introduce richer trend analysis across training programs and trainee groups.
* **Skill-Gap Insights:** Improve the identification of skills that may require additional training.
* **Reporting:** Expand analytical summaries and downloadable reports.
* **Data Quality:** Strengthen validation, consistency, and completeness of trainee records.
* **Security & Access Control:** Improve authentication, authorization, and protection of sensitive information.
* **Scalability:** Prepare the architecture for larger datasets and more users.
* **Evaluation:** Assess the accuracy and usefulness of AI-generated insights before using them in real-world decision-making.

These items represent potential future work, not a claim that every capability is already implemented.

---

## 👥 Team

**Project:** SkillTrack
**Institution:** Jawaharlal Darda Institute of Engineering and Technology (JDIET), Yavatmal
**Context:** Smart India Hackathon (SIH) 2026

### Contributors

* Vrinda Jaiswal
* Palak Kale
* Pranav Raut
* Bilal Ahmed
* Tanvi Kondekar
* Mohammed Nabil Noori

---

## ⚠️ Disclaimer

SkillTrack is an academic and hackathon-related prototype.

It is not an official government platform, and this repository does not imply authorization to access government databases, employment records, Aadhaar data, or EPFO services.

Any demonstration data should be treated as sample data unless its authenticity and source have been independently verified.

AI-generated analysis may be incomplete or inaccurate and should not replace appropriate human review.

---

## 📄 License

No license has been specified in this repository. Unless a license is added, reuse and redistribution are subject to applicable copyright law.

---

<p align="center">
  <strong>SkillTrack — From Training Completion to Long-Term Outcomes.</strong>
</p>
