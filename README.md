# Elimisha 🎓

## Overview

Elimisha is an AI-powered scholarship and bursary matching platform designed to help students discover educational funding opportunities that align with their academic, financial, and personal circumstances.

Many students miss out on scholarships and bursaries because information is scattered across multiple websites, eligibility requirements are difficult to interpret, and finding relevant opportunities is time-consuming. Elimisha addresses this challenge by centralizing funding opportunities and automatically matching students with opportunities they are likely to qualify for.

---

## Problem Statement

Students often face the following challenges when searching for educational funding:

* Scholarship and bursary information is fragmented across multiple platforms.
* Eligibility requirements are difficult to understand and compare.
* Students spend significant time manually searching for opportunities.
* Many students miss opportunities they qualify for simply because they never discover them.
* Existing platforms rarely provide personalized recommendations.

---

## Solution

Elimisha simplifies the scholarship discovery process by allowing students to create a profile and receive personalized funding recommendations.

The platform analyzes factors such as:

* County or region of residence
* Institution and course of study
* Year of study
* Household income
* Disability status
* Orphan or vulnerable student status
* Other eligibility requirements

Based on these factors, Elimisha generates a match score and explains why a particular bursary or scholarship is relevant to the student.

---

## Key Features

### Student Profiles

Students can create and maintain a profile containing academic, demographic, and financial information.

### Scholarship & Bursary Database

A centralized repository of funding opportunities from:

* Government programs
* County bursaries
* NGOs
* Foundations
* Corporate sponsorship programs
* International scholarship providers

### Intelligent Matching Engine

Automatically compares student profiles against eligibility requirements and ranks opportunities based on suitability.

### Match Explanations

Provides transparency by explaining why a student qualifies for a particular opportunity.

Example:

Match Score: 92%

Reasons:

* Resident of Nairobi County
* Household income below required threshold
* First-year undergraduate student

### Search & Filtering

Students can search and filter opportunities based on:

* Deadline
* Funding provider
* Amount
* Location
* Category

### Saved Opportunities

Students can bookmark opportunities for future reference.

---

## System Architecture

```text
Student Profile
       │
       ▼
Eligibility Engine
       │
       ▼
Matching Algorithm
       │
       ▼
Ranked Opportunities
       │
       ▼
Match Explanations
```

---

## Technology Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Vite

### Backend

* FastAPI
* Python

### Database

* PostgreSQL

### AI & Recommendation Layer

* Rule-based eligibility matching
* Explainable recommendation scoring
* Future machine learning enhancements

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: PostgreSQL / Neon

---

## Database Overview

Core entities include:

* Users
* Student Profiles
* Bursaries
* Eligibility Rules
* Applications
* Saved Opportunities

The system stores eligibility requirements separately from bursary records, allowing flexible and scalable matching logic.

---

## Future Enhancements

* Machine learning–based recommendation engine
* Scholarship deadline reminders
* Email notifications
* Scholarship application tracking
* OCR document verification
* AI-powered scholarship assistant chatbot
* Mobile application
* Analytics dashboard for funding organizations

---

## Project Goals

The primary objectives of Elimisha are:

1. Improve access to educational funding opportunities.
2. Reduce the time students spend searching for scholarships.
3. Increase awareness of bursaries and scholarships.
4. Provide transparent and explainable recommendations.
5. Promote educational equity through technology.

---

## Project Status

🚧 Currently in development

Planned MVP Features:

* Student registration
* Profile creation
* Scholarship database
* Eligibility matching engine
* Recommendation dashboard
* Opportunity bookmarking

---
Live Project Link :
https://elimisha-xi.vercel.app/
*This project was deployed on Vercel.
## Author

Catherine Mutheu Muindi

Bachelor of Business Information Technology (BBIT)
Strathmore University

Focused on Software Engineering, Artificial Intelligence, and Machine Learning.
