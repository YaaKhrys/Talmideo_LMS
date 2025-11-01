# 📖 Talmideo LMS

## Overview  
Talmideo is an interactive learning management platform designed to facilitate Bible-based education. It provides users with seamless access to lessons, quizzes, and resources, helping learners grow in knowledge and spiritual understanding.

## Features  
- [x] Homepage & Embedded Bible
- [x] User registration and login system
- [x] Personalized dashboard with course overview
- [ ] User verification & account control <!-- Includes: secure access, session handling, logout, client-side password validation -->
- [ ] Enhanced Account Security <!-- Includes: CAPTCHA/reCAPTCHA integration, password-strength enforcement & hashing upgrade (Argon2), email-based 2FA, SQL injection protection (prepared statements/parameterised queries) -->
- [ ] Platform administration & content curation (manage members, recognized contributors, structured lessons, and posts)
- [ ] Course management (create/edit courses, track progress, quizzes)
- [ ] Notifications and reminders
- [ ] Analytics dashboard for Educators/Content creators
- [ ] UI Overhaul & Design System
- [ ] Advanced accessibility improvements <!-- Includes: WCAG compliance, keyboard navigation, screen reader optimization -->
- [ ] Multi-language support
- [ ] Mobile responsive design
 


## Problem Solved  
Talmideo addresses the need for an accessible, organized, and secure platform for Bible learning, providing Christians with a centralized tool to interact with lessons and track progress.  

## Project Notes  
- Built for modularity; future updates can include quizzes and assignments  
- Lessons learned: clean structure, reusable components, and consistent styling  
- Future ideas: analytics dashboard, responsive mobile design  

## Tech Stack  
| Layer | Technology / Tool |
|-------|------------------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | PHP |
| Database | MySQL / phpMyAdmin |
| Deployment / Hosting | Hostinger subdomain |

## Architecture & Folder Structure  

📁 `Talmideo_LMS`  
├── 📂 `assets`  
├── 📂 `config`  
├── 📂 `includes`  
├── 📂 `logs`  
├── 📂 `other`  
├── 📄 `index.html`  
├── 📄 `bible.html`  
├── 📄 `register.html` / `register.php`  
├── 📄 `login.html` / `login.php`  
├── 📄 `logout.php`  
├── 📄 `dashboard.php`  
└── 📄 `manifest.json`  

## 🔒 Security & Best Practices  
- Password hashing and validation  
- Prepared statements to prevent SQL injection  
- Input sanitization for all forms  
- Session management for authenticated users  

## 📱 Live Demo  
Check out the live version of Talmideo LMS on our subdomain:  
[Live Talmideo LMS](https://christabellowusu.eagletechafrica.com/)

## References / Credits  
- ChatGPT — Code buddy for iterations. 
- RITA Africa Team
