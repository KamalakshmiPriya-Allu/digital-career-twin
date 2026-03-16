PRODUCT REQUIREMENTS DOCUMENT
Digital Career Twin
Agentic AI-Powered Career Mentoring Platform
 

Version 1.0  ·  March 2026  ·  Confidential

Document Type  |  Product Requirements Document (PRD)
Product  |  Digital Career Twin
Version  |  1.0 — Initial Release
Build Stack  |  Antigravity + Claude API + Framer GDS
Plugins  |  Ralph Loop · CodeRabbit · GDS
Status  |  Draft — Ready for Development
Date  |  March 2026
Audience  |  Founders, Designers, Developers


Table of Contents

1  Executive Summary	3
2  Product Vision & Goals	4
3  Target Users & Personas	5
4  Tool Stack & Plugin Architecture	6
5  System Architecture Overview	7
6  Feature Specifications	8
  6.1  Authentication & Onboarding	8
  6.2  Digital Twin Profile	9
  6.3  AI-Powered Dashboard	10
  6.4  Skill Assessment Engine	11
  6.5  AI Career Mentor (Claude API)	12
  6.6  Learning Resource Engine	13
  6.7  YouTube Integration	14
  6.8  Resume Builder & Parser	14
  6.9  Academic Calendar	15
  6.10  Career Prediction Engine	15
7  Antigravity Build Guide	16
8  Plugin Integration: GDS, Ralph Loop, CodeRabbit	18
9  Claude API Integration Specs	19
10  UI/UX Design System	20
11  User Flows & Wireframe Notes	21
12  Data Models	22
13  API Reference	23
14  Security & Compliance	24
15  Build Phases & Timeline	25
16  Acceptance Criteria	26
17  Risks & Mitigations	27
18  Glossary	28

1. Executive Summary

Digital Career Twin (DCT) is an AI-powered SaaS platform that creates a personalized virtual representation of a student's academic profile, skills, and career aspirations. Powered by Claude API and built on Antigravity, the platform acts as an autonomous career mentor — continuously analyzing the user's growth, predicting career outcomes, and delivering actionable learning roadmaps.

Unlike static career guidance tools, DCT is adaptive. As the student progresses, the AI evolves its recommendations in real time. The platform integrates Claude API for reasoning, YouTube Data API for video discovery, and a modular knowledge base for contextual answers.

Core Value Proposition
Pillar  |  What It Does  |  Why It Matters
Digital Twin  |  Creates a live model of the student  |  Personalization at scale
Agentic AI  |  Plans, executes, adapts autonomously  |  No passive tool — active mentor
Claude API  |  Deep reasoning + contextual suggestions  |  Premium AI quality
Skill Tracking  |  Tracks skill growth over time  |  Measurable progress
Career Prediction  |  Estimates career outcome probability  |  Data-driven decisions

2. Product Vision & Goals

2.1 Vision Statement
"Every student deserves a brilliant, always-available career mentor who knows them deeply — their skills, habits, weaknesses, and dreams — and guides them every single day toward the career they want."

2.2 Mission
To build the world's most personalized AI career guidance platform for students — combining real-time skill tracking, agentic AI mentoring, and predictive career modeling into one seamless experience.

2.3 Strategic Goals
Create a fully adaptive Digital Twin that mirrors each student's academic journey
Deliver daily AI-generated learning tasks calibrated to the student's pace and goals
Predict career readiness score with >=80% relevance accuracy
Reduce time-to-first-job-offer for users by 30% vs national average
Build a platform that works entirely no-code using Antigravity + Claude API

2.4 Success Metrics (KPIs)
Metric  |  Target  |  Measurement Method
Daily Active Users  |  40% DAU/MAU ratio  |  Analytics dashboard
Assessment completion  |  >70% weekly  |  Event tracking
AI suggestion relevance  |  >80% rated "helpful"  |  Thumbs up/down
Skill score improvement  |  >15pts avg over 60 days  |  Assessment scores over time
Career prediction accuracy  |  >75% match rate  |  Outcome survey at 6 months

3. Target Users & Personas

3.1 Primary Persona — The Ambitious Undergrad
Name  |  Aryan Sharma, 20
Background  |  B.Tech Computer Science, Year 2, Tier-2 college
Goals  |  Get placed at a top tech company within 2 years
Pain Points  |  Doesn't know where to start, overwhelmed by resources
How DCT helps  |  Builds a structured roadmap, daily tasks, skill tracking

3.2 Secondary Persona — The Career Switcher
Name  |  Priya Mehta, 24
Background  |  BCom graduate, self-learning programming
Goals  |  Transition into data science within 12 months
Pain Points  |  No formal CS background, unsure of skill gaps
How DCT helps  |  Identifies gaps, recommends structured learning path, tracks progress

3.3 Tertiary Persona — The Placement-Focused Student
Name  |  Rahul Das, 22
Background  |  Final year, focused on cracking campus placements
Goals  |  Prepare for technical interviews, get placed
Pain Points  |  Weak in DSA, nervous about communication rounds
How DCT helps  |  Daily mock tests, weak-area coaching, interview prep suggestions

4. Tool Stack & Plugin Architecture

Digital Career Twin is built using a no-code-first philosophy, enabling rapid iteration without compromising on quality or AI capability.

4.1 Primary Build Tools
Tool  |  Role  |  Why This Tool
Antigravity  |  Core website builder (no-code)  |  Fast, professional, custom code support
Claude API (Sonnet 4)  |  AI reasoning engine  |  Best-in-class language understanding
Framer GDS  |  Design System tokens  |  Consistent colors, spacing, fonts globally
Ralph Loop  |  Scroll animations & motion  |  Premium feel without writing animation code
CodeRabbit  |  AI code review for custom scripts  |  Catches bugs in embedded JS/API code
YouTube Data API v3  |  Learning video discovery  |  Fetch relevant videos per AI suggestion

4.2 Architecture Philosophy
Antigravity handles all pages, routing, and layout
Claude API is called from Antigravity custom code blocks (server-side proxied)
All design tokens (colors, fonts, spacing) managed via Framer GDS and imported into Antigravity
Ralph Loop animations are configured per-section in the Antigravity editor
Any custom JS code embedded via Antigravity's Code Block is reviewed by CodeRabbit

4.3 External APIs
API  |  Endpoint Used  |  Purpose
Anthropic Claude  |  /v1/messages  |  AI analysis, suggestions, career predictions
YouTube Data v3  |  /search + /videos  |  Fetch top 5 learning videos per topic
Adzuna Jobs (optional)  |  /jobs/search  |  Real job market insights for career prediction

5. System Architecture Overview

5.1 High-Level Architecture
Since this platform is built on Antigravity (no-code), the architecture is structured as: Antigravity (frontend + routing) -> Custom Code Blocks (API orchestration) -> Claude API (AI brain) -> External APIs (YouTube, Jobs).

Layer  |  Technology  |  Responsibility
Presentation  |  Antigravity pages + GDS + Ralph Loop  |  All UI, routing, animations
Logic  |  Antigravity custom JS code blocks  |  API calls, state, user data manipulation
AI Engine  |  Claude API (claude-sonnet-4)  |  Career analysis, suggestions, predictions
Data Storage  |  Antigravity built-in DB / localStorage  |  User profile, assessments, progress
Video Content  |  YouTube Data API v3  |  Learning video recommendations
Design Tokens  |  Framer GDS  |  Colors, fonts, spacing system
Motion  |  Ralph Loop plugin  |  All scroll-triggered animations
Code Quality  |  CodeRabbit  |  Review all embedded custom code

5.2 Data Flow — AI Suggestion Loop
User updates their profile or completes an assessment
Antigravity custom code serializes the profile into a structured JSON prompt
Prompt is sent to Claude API with a detailed system prompt (career mentor persona)
Claude returns structured suggestions: skill gaps, resource links, daily tasks
Antigravity renders the response in the AI Suggestions panel
YouTube API is called with the suggested topics to fetch videos
All suggestions are stored in user session for history tracking

6. Feature Specifications

6.1 Authentication & Onboarding
The authentication system is the entry point of the platform. It must be secure, minimal, and fast.

Login / Register Page
Email + Password registration with email verification
Social login: Google OAuth (via Antigravity integration)
Forgot password with email reset link
JWT token stored in secure cookie (httpOnly)

Onboarding Wizard (5-step flow)
Step  |  Fields Collected  |  UI Component
Step 1 — Basics  |  Full name, Email, Profile photo  |  Text inputs + avatar upload
Step 2 — Academics  |  10th/12th marks, Degree, Year, College, Academic calendar type  |  Sliders + dropdowns
Step 3 — Career Goals  |  Target role, Target company, Expected salary, Timeline  |  Tag selector + sliders
Step 4 — Skills  |  Programming, Problem-solving, Communication, Leadership (1-10)  |  Interactive skill sliders
Step 5 — Preferences  |  Learning style (video/reading/projects), Interests, Strengths, Weaknesses  |  Multi-select tags

Acceptance Criteria
User can complete onboarding in under 5 minutes
All data persists and is accessible to the AI engine on first dashboard load
Profile is editable at any time from the Settings page

6.2 Digital Twin Profile
The Digital Twin is a living data model that represents everything about the user. It is the foundation upon which all AI analysis is built.

Profile Data Schema
Category  |  Fields  |  Update Frequency
Academic  |  10th %, 12th %, Degree, Year, College, CGPA  |  Manual (editable)
Career  |  Target role, Company, Salary expectation, Timeline  |  Manual (editable)
Skills  |  Technical + soft skill scores (1-10 sliders)  |  Auto-updated post-assessment
Behavior  |  Learning style, Session durations, Streak data  |  Auto-tracked passively
Progress  |  Completed courses, Projects, Assessment history  |  Auto-updated on completion
Resume  |  Parsed keywords, experience, extracted skills  |  Updated on upload or achievement

Profile Page UI
Split layout: left sidebar (avatar, basic info, streak) + main area (tabs for each category)
Glassmorphism card design with subtle glow on hover (Ralph Loop hover animation)
Edit mode toggle — fields switch from display to editable inline
Digital Twin visualization: radar/spider chart showing skill balance

6.3 AI-Powered Dashboard
The dashboard is the command center. Users land here after login. It must communicate progress at a glance and prompt the next action.

Dashboard Widgets
Widget  |  Content  |  Data Source
Career Readiness Score  |  Animated gauge 0-100  |  Claude AI analysis
Today's Tasks  |  3-5 AI-generated daily learning tasks  |  Claude API
Skill Radar Chart  |  Spider chart of all 6 skill dimensions  |  Assessment scores
Streak Tracker  |  Daily login/learning streak counter  |  Session tracking
Top Recommendation  |  Single most important suggestion from AI  |  Claude API
Progress Ring  |  Weekly goal completion %  |  Task completion data
Academic Calendar  |  Upcoming exams, deadlines, key dates  |  User-configured calendar
Recent Activity  |  Last 5 actions: assessments, videos, tasks  |  Event log
Uploaded Files  |  Thumbnails of learning files and AI-suggested courses  |  File uploads

Dashboard Layout Notes for Antigravity
Use a 12-column grid layout in Antigravity
Career Readiness Score widget: 3 columns, spans full left panel height
Tasks widget: 5 columns, scrollable list
All widgets: use Antigravity's card component with GDS-defined border-radius and shadow tokens
Apply Ralph Loop "fade-up" on scroll trigger to each widget card on first load

6.4 Skill Assessment Engine
The assessment system keeps users sharp. A new set of questions appears daily, covering multiple skill domains. Results feed back into the Digital Twin.

Assessment Categories
- Programming   - Data Structures   - Problem Solving   - System Design   - Communication   - Leadership   - Aptitude

Daily Assessment Flow
User clicks "Take Today's Test" from dashboard
System presents 10 questions (mix of MCQ + coding short-answer)
Timer visible — tests user speed and pressure performance
On submission: instant score, per-question explanation, correct answers shown
Score is saved to assessment history with timestamp
Claude API analyzes the score in context of previous scores -> updates skill profile

Assessment History View
Table view: Date | Category | Score | Time Taken | Status
Line chart showing score trend over last 30 days per skill
Weak areas highlighted in red with a "Practice More" CTA

6.5 AI Career Mentor (Claude API)
This is the heart of the platform. Claude acts as a persistent, context-aware career mentor. Every response is personalized using the user's full Digital Twin profile.

System Prompt Template
The following system prompt is sent with every Claude API call:
You are an expert AI career mentor for a student named {name}. Their profile: Degree: {degree}, Year: {year}, Target Role: {target_role}, Target Company: {company}, Skills: {skills_json}, Assessment History: {assessment_summary}, Current Goals: {goals}. Analyze their profile and provide specific, actionable career guidance. Be encouraging, precise, and data-driven. Never give generic advice.

AI Suggestion Types
Type  |  Trigger  |  Output Format
Skill Gap Analysis  |  After each assessment  |  3-5 specific gap statements with action items
Daily Learning Task  |  Every 24 hours (scheduled)  |  3 tasks with time estimates
Career Path Prediction  |  On profile update  |  Top 3 predicted roles with % match score
Resource Recommendation  |  On topic request or daily  |  3 courses + 5 YouTube videos
Weekly Review  |  End of each week  |  Progress summary + next week focus areas
Exam Prep Mode  |  When exam is <=7 days away  |  Revision-focused tasks, no new learning

AI Panel UI
Fixed right sidebar on dashboard (collapsible on mobile)
Chat-style interface: user can type questions, AI responds in real time (streaming)
Each suggestion card has: thumbs up/down feedback, "Learn More" CTA, bookmark action
Suggestion history: last 7 days of AI suggestions accessible in a timeline view

6.6 Learning Resource Engine
The system recommends personalized learning resources across multiple formats. All recommendations are generated by Claude based on the user's goals and skill gaps.

Resource Types
- Online Courses   - YouTube Videos   - PDF Articles   - Practice Projects   - Coding Challenges   - Books

Recommendation Logic
Claude receives: current skills, target role, weakest areas, learning preference
Returns: structured JSON with resource title, URL, type, estimated time, difficulty
Results are displayed in a card grid with filter tabs (by type / by skill)
Users can mark resources as Complete, Saved, or Skip

6.7 YouTube Integration
When Claude identifies a learning topic, the platform automatically fetches the top 5 relevant YouTube videos using the YouTube Data API v3.

Implementation in Antigravity
Claude returns a topic string (e.g., "Python list comprehension tutorial beginner")
Antigravity custom code block calls YouTube Search API with this query
API returns 5 video objects: videoId, title, channelTitle, thumbnail
Videos are rendered in a horizontal scroll card row below the AI suggestion

Video Card Component
Thumbnail (16:9 ratio) with play icon overlay
Video title (max 2 lines, truncated)
Channel name + subscriber count (optional)
Click opens YouTube in a new tab

6.8 Resume Builder & Parser
Auto-Generated Resume
Resume is auto-populated using the user's Digital Twin data (academics, skills, projects, achievements)
Template: clean, ATS-friendly single-page format
Updates automatically when user completes a course, project, or achievement
Export as PDF from within the platform

Resume Upload & Parsing
User uploads a PDF resume
Antigravity custom code sends file content to Claude API for extraction
Claude extracts: skills, experience keywords, education, projects
Extracted data is merged into the Digital Twin profile (with user confirmation)

6.9 Academic Calendar
User adds their university semester schedule, exam dates, and assignment deadlines
Calendar view (monthly) with color-coded event types: Exam (red), Assignment (amber), Holiday (green)
Claude reads the calendar data in its context window to adjust recommendations
Within 7 days of an exam: AI switches to revision mode automatically
After exams: AI re-enters learning mode and suggests catch-up resources

6.10 Career Prediction Engine
Based on: current skills, assessment trends, learning progress, target role, market data
Claude returns top 3 career paths with: role name, match %, required skills, time to readiness
Visual: horizontal progress bars per career path
Each path has a "What to do next" action button that generates a focused roadmap
Includes: famous learning techniques relevant to the user's style (Pomodoro, Feynman, Spaced Repetition)

7. Antigravity Build Guide

This section provides step-by-step instructions for building every section of Digital Career Twin inside Antigravity.

7.1 Project Setup
Create new Antigravity project -> name it "digital-career-twin"
Connect custom domain (e.g., digitalcareertwin.com)
Go to Settings -> Theme -> import GDS tokens (colors, fonts, spacing) from Framer
Set global font: Display font for headings, body font for paragraphs
Enable Dark Mode as the default theme

7.2 Page Structure
Page  |  Route  |  Purpose
Landing  |  /  |  Marketing homepage with hero, features, pricing, CTA
Login  |  /login  |  Auth page — email/password + Google
Register  |  /register  |  Sign up + onboarding wizard start
Onboarding  |  /onboarding  |  5-step profile setup wizard
Dashboard  |  /dashboard  |  Main app experience
Profile  |  /profile  |  Digital Twin profile viewer/editor
Assessments  |  /assess  |  Daily tests, history, weak areas
Learning  |  /learn  |  Resource recommendations + YouTube
Career  |  /career  |  Career predictions + roadmaps
Calendar  |  /calendar  |  Academic calendar
Resume  |  /resume  |  Auto-generated resume + upload
Settings  |  /settings  |  Account preferences

7.3 Key Antigravity Components to Build
Skill Slider Component
Range input (0-10) with custom thumb styling
Label above showing skill name + current score
Color changes from red (0-3) to amber (4-6) to green (7-10)
On change: stores to user session, triggers Claude re-analysis

AI Suggestion Panel Component
Right-side collapsible panel (300px wide on desktop)
Contains: suggestion cards, chat input, history toggle
Each card: icon, title, body text, action buttons (Thumbs up/down, Learn More)
Streaming response from Claude API displayed word-by-word

Career Readiness Gauge
Semicircular gauge (SVG or Canvas-based)
Animated fill from 0 to current score on load (Ralph Loop entrance animation)
Color bands: 0-40 red, 41-70 amber, 71-100 green
Score number displayed in center with label "Career Readiness"

8. Plugin Integration: GDS, Ralph Loop, CodeRabbit

8.1 Framer GDS — Global Design System
GDS is used to define and manage all design tokens that are then applied consistently across every Antigravity page.

Design Tokens to Define in GDS
Token Name  |  Value  |  Usage
color-primary  |  #5B4FE8  |  Buttons, links, active states, accent elements
color-primary-light  |  #7B72FF  |  Hover states, glows
color-teal  |  #00C896  |  Success states, progress bars, highlights
color-bg  |  #0F0F1A  |  Page background
color-surface  |  #1A1A2E  |  Card backgrounds
color-surface-2  |  #23233A  |  Nested cards, inputs
color-border  |  #2A2A40  |  Card borders, dividers
color-text  |  #E8E8F0  |  Primary text
color-muted  |  #6B6B85  |  Secondary text, labels
font-display  |  Syne (800)  |  All H1, H2 headings
font-body  |  DM Sans (400/500)  |  All body text, labels
font-mono  |  DM Mono (400)  |  Code blocks, tags, badges
radius-card  |  16px  |  All card components
radius-button  |  10px  |  All button components
shadow-card  |  0 4px 24px rgba(0,0,0,0.4)  |  Cards elevation
shadow-glow  |  0 0 40px rgba(91,79,232,0.2)  |  Focused/active states

8.2 Ralph Loop — Motion & Animations
Ralph Loop handles all scroll-triggered animations and entrance effects. Install via Framer plugin marketplace, then apply to Antigravity components.

Element  |  Animation  |  Settings
Hero headline  |  Fade Up  |  Duration: 0.7s, Delay: 0s
Hero subheadline  |  Fade Up  |  Duration: 0.7s, Delay: 0.15s
Hero CTA button  |  Fade Up + Scale  |  Duration: 0.6s, Delay: 0.3s
Dashboard widget cards  |  Fade Up on scroll  |  Threshold: 0.2, Stagger: 0.08s
Feature section items  |  Slide In Left/Right  |  Alternating per item
Career gauge  |  Count Up animation  |  On enter viewport
AI Suggestion cards  |  Fade In  |  Duration: 0.4s, staggered
Chart/graph render  |  Draw On Enter  |  Trigger: scroll enter

8.3 CodeRabbit — Code Review
Any custom JavaScript or API integration code embedded in Antigravity's Custom Code blocks should be pushed to a GitHub repository and reviewed by CodeRabbit.

CodeRabbit Review Checklist
All Claude API calls must not expose API keys in client-side code
YouTube API query strings must be sanitized
User data stored in localStorage must not include sensitive fields
All async operations must have proper error handling and fallbacks
Rate limiting must be implemented on all Claude API calls

9. Claude API Integration Specs

9.1 Model & Configuration
Model  |  claude-sonnet-4-20250514
Max Tokens  |  1500 per response (suggestions), 2500 (analysis)
Temperature  |  0.7 (creative balance)
API Version  |  anthropic-version: 2023-06-01
Rate Limit Strategy  |  Max 10 calls/user/hour (tracked in session)
Error Handling  |  Graceful fallback to cached last suggestion

9.2 Prompt Templates
Skill Gap Analysis Prompt
User Profile: {profile_json}. Assessment scores this week: {scores}. Previous scores: {history}. Analyze the skill gaps. Return JSON: { "gaps": [{ "skill": "", "severity": "high|medium|low", "suggestion": "", "resources": [] }], "top_focus": "" }
Career Prediction Prompt
Student profile: {profile_json}. Learning progress: {progress}. Market context: software engineering jobs 2025. Predict top 3 career paths. Return JSON: { "paths": [{ "role": "", "match_percent": 0, "time_to_ready": "", "key_skills_needed": [], "learning_technique": "" }] }

9.3 Response Handling in Antigravity
All Claude API calls are made from Antigravity custom code blocks
API key is stored as an Antigravity environment variable (never in client JS)
Responses are parsed from JSON where structured output is expected
Streaming is enabled for chat interface (Server-Sent Events)
Failed calls show a "Retry" button and log the error silently

10. UI/UX Design System

10.1 Visual Language
Digital Career Twin uses a refined dark glassmorphism aesthetic — deep navy backgrounds, translucent cards with subtle borders, and electric indigo accents. The overall feel is: "premium AI tool for serious students."

Typography Scale
Style  |  Font  |  Size  |  Weight  |  Usage
Display XL  |  Syne  |  52px  |  800  |  Hero headlines only
Heading 1  |  Syne  |  36px  |  700  |  Page titles
Heading 2  |  Syne  |  24px  |  700  |  Section titles
Heading 3  |  Syne  |  18px  |  600  |  Widget titles
Body Large  |  DM Sans  |  16px  |  400  |  Primary content
Body  |  DM Sans  |  14px  |  400  |  Secondary content, descriptions
Small  |  DM Sans  |  12px  |  400  |  Labels, captions
Mono  |  DM Mono  |  13px  |  400  |  Tags, badges, code

10.2 Component Specs
Primary Button
Background: color-primary (#5B4FE8)
Text: white, DM Sans 14px 500
Border radius: 10px, Padding: 12px 24px
Hover: scale(1.02), shadow-glow, transition 200ms
Active: scale(0.98)

Glassmorphism Card
Background: rgba(26, 26, 46, 0.7)
Backdrop filter: blur(20px)
Border: 1px solid rgba(255,255,255,0.08)
Border radius: 16px, Padding: 24px
Shadow: 0 4px 24px rgba(0,0,0,0.4)

11. User Flows & Wireframe Notes

11.1 First-Time User Flow
Lands on / (Landing Page) -> clicks "Get Started Free"
-> /register (creates account)
-> /onboarding Step 1-5 (fills Digital Twin profile)
-> /dashboard (first load: AI analyzes profile, generates initial suggestions)
-> AI panel shows: "Welcome, Aryan! Here's your personalized career plan..."

11.2 Returning User Daily Flow
Login -> /dashboard
Sees: Today's 3 AI tasks, streak counter, new assessment available
Takes daily assessment (10 questions, timed)
Sees updated skill radar chart + AI feedback on weak areas
Watches 1-2 recommended YouTube videos
Marks tasks complete -> streak increments -> progress ring updates

11.3 Career Goal Flow
User types: "Help me become an AI engineer" in AI chat
Claude analyzes current profile against AI engineer requirements
Returns: gap analysis + 12-week roadmap + top 5 YouTube videos for ML basics
User clicks "Add to My Roadmap" -> tasks appear in dashboard
Academic calendar checked: if exam in 3 days, roadmap pauses + revision mode activates

12. Data Models

12.1 User Profile Model
Field  |  Type  |  Description
user_id  |  UUID  |  Unique identifier
name  |  String  |  Full name
email  |  String  |  Email address (unique)
avatar_url  |  String  |  Profile photo URL
degree  |  String  |  Current degree program
year  |  Integer  |  Current year of study (1-4)
college  |  String  |  Institution name
marks_10th  |  Float  |  Class 10 percentage
marks_12th  |  Float  |  Class 12 percentage
cgpa  |  Float  |  Current CGPA
target_role  |  String  |  Desired job role
target_company  |  String  |  Dream company
expected_salary  |  Integer  |  Expected CTC in LPA
skills  |  JSON Object  |  Skill name -> score (0-10)
learning_preference  |  Enum  |  video | reading | projects
interests  |  String Array  |  List of interest tags
strengths  |  String Array  |  User-defined strengths
weaknesses  |  String Array  |  User-defined weaknesses
streak_days  |  Integer  |  Consecutive active days
career_readiness_score  |  Float  |  AI-computed 0-100 score
created_at  |  Timestamp  |  Registration date
updated_at  |  Timestamp  |  Last profile update

12.2 Assessment Record Model
Field  |  Type  |  Description
assessment_id  |  UUID  |  Unique assessment ID
user_id  |  UUID  |  Reference to user
category  |  String  |  Skill category tested
score  |  Integer  |  Score out of 100
time_taken_seconds  |  Integer  |  Total time taken
questions  |  JSON Array  |  Question + answer + explanation objects
ai_feedback  |  Text  |  Claude-generated feedback on this attempt
taken_at  |  Timestamp  |  When the test was taken

13. API Reference

The following custom API endpoints should be implemented as Antigravity server functions or external microservices depending on complexity.

Endpoint  |  Method  |  Description  |  Auth Required
/api/profile  |  GET / PUT  |  Read or update user Digital Twin profile  |  Yes
/api/assessment/today  |  GET  |  Fetch today's question set  |  Yes
/api/assessment/submit  |  POST  |  Submit answers, get score + feedback  |  Yes
/api/ai/suggest  |  POST  |  Get AI suggestions from Claude API  |  Yes
/api/ai/chat  |  POST  |  Stream Claude chat response  |  Yes
/api/career/predict  |  POST  |  Get career path predictions  |  Yes
/api/videos/search  |  GET  |  Fetch YouTube videos for a topic  |  Yes
/api/resume/parse  |  POST  |  Upload + parse resume PDF via Claude  |  Yes
/api/calendar/events  |  GET / POST  |  Read or add academic calendar events  |  Yes
/api/resources  |  GET  |  Get personalized learning resources  |  Yes

14. Security & Compliance

Concern  |  Solution
API Key Exposure  |  Claude + YouTube API keys stored as Antigravity environment variables, never in client JS
Authentication  |  JWT tokens with 24hr expiry, stored in httpOnly cookies
Rate Limiting  |  Max 10 Claude API calls/user/hour tracked server-side
Data Privacy  |  User data encrypted at rest, GDPR-compliant data deletion on request
Input Sanitization  |  All user inputs sanitized before inclusion in Claude prompts
Code Security  |  CodeRabbit reviews all custom code for vulnerabilities before deploy
Resume Files  |  PDF uploads scanned for malicious content before parsing

15. Build Phases & Timeline

Phase  |  Duration  |  Deliverables  |  Tools Used
Phase 1 — Foundation  |  Week 1  |  GDS setup, Antigravity project, Landing page, Auth pages  |  Framer GDS, Antigravity
Phase 2 — Onboarding  |  Week 1-2  |  Registration flow, 5-step onboarding wizard, profile storage  |  Antigravity, Claude API
Phase 3 — Dashboard  |  Week 2-3  |  Dashboard layout, skill radar chart, career gauge, widgets  |  Antigravity, Ralph Loop, Recharts
Phase 4 — AI Core  |  Week 3-4  |  Claude API integration, AI panel, suggestion system, chat  |  Claude API, Antigravity
Phase 5 — Assessments  |  Week 4  |  Daily test engine, scoring, history, feedback  |  Claude API, Antigravity
Phase 6 — Learning + YouTube  |  Week 5  |  Resource engine, YouTube API, video cards  |  YouTube API, Antigravity
Phase 7 — Career + Resume  |  Week 5-6  |  Career predictions, roadmap, resume builder, parser  |  Claude API, Antigravity
Phase 8 — Polish + Launch  |  Week 6  |  Ralph Loop animations, mobile QA, CodeRabbit review, deploy  |  Ralph Loop, CodeRabbit

16. Acceptance Criteria

Feature  |  Acceptance Criteria
Authentication  |  User can register, verify email, login, and reset password in <3 minutes
Onboarding  |  All 5 steps complete with validation; data persists to profile
Dashboard  |  All 9 widgets load within 3 seconds on first login
AI Suggestions  |  Claude returns personalized response within 5 seconds; feedback stored
Assessments  |  10 questions load in <1s; score + explanation shown immediately on submit
YouTube  |  Minimum 3 videos returned for any AI-suggested topic within 2 seconds
Career Prediction  |  Top 3 career paths returned with %, skills needed, and roadmap CTA
Resume  |  Auto-generates a complete resume from profile data; updates on achievement
Calendar  |  User can add/edit events; AI enters revision mode within 7 days of exam
Mobile  |  All pages fully responsive; dashboard usable on 375px screen width
Performance  |  Lighthouse score >85 on mobile for all pages
Security  |  No API keys in client-side code; all CodeRabbit issues resolved before launch

17. Risks & Mitigations

Risk  |  Likelihood  |  Impact  |  Mitigation
Claude API rate limits hit  |  Medium  |  High  |  Implement caching of suggestions; show cached results with "last updated" label
YouTube API quota exceeded  |  Low  |  Medium  |  Cache video results per topic for 24 hours; show cached videos on quota hit
Antigravity limitations for complex UI  |  Medium  |  Medium  |  Use custom HTML/CSS embeds for complex components like charts
User data loss (no persistent DB)  |  High  |  High  |  Integrate Antigravity's database feature or use Airtable/Supabase as backend
AI responses too generic  |  Medium  |  High  |  Invest heavily in system prompt engineering; test with 10+ personas before launch
Poor mobile UX  |  Low  |  High  |  Build mobile-first; test on real devices weekly during development

18. Glossary

Term  |  Definition
Digital Twin  |  A virtual data model representing the user's complete academic and career profile
Agentic AI  |  An AI that autonomously plans, executes, and adapts actions to achieve a goal
GDS  |  Global Design System — a Framer plugin for managing design tokens centrally
Ralph Loop  |  A Framer/Antigravity plugin that adds scroll-triggered animations without code
CodeRabbit  |  An AI-powered GitHub code review tool that automatically reviews pull requests
Career Readiness Score  |  A 0-100 AI-computed score reflecting how prepared the user is for their target role
Skill Radar  |  A spider/radar chart visualizing 6 skill dimensions on a polygon graph
Digital Twin Profile  |  The complete structured data object representing the user's academic journey
Claude API  |  Anthropic's AI API used for language reasoning, career analysis, and suggestions
Streaming  |  Real-time word-by-word delivery of Claude responses using Server-Sent Events
System Prompt  |  A hidden instruction sent to Claude before the user's message to set its persona and context
Assessment History  |  A log of all past skill test scores, dates, and AI feedback

Digital Career Twin  ·  PRD v1.0  ·  March 2026  ·  Confidential