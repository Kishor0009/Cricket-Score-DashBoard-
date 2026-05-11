# Cricket Live Score Dashboard 🏏

A modern, high-performance web application that provides real-time cricket scores, in-depth match statistics, and advanced AI-powered analytics. Built with a sleek, premium glassmorphism UI, this dashboard consumes live data from the Cricbuzz RapidAPI to deliver an immersive sports tracking experience.

## ✨ Features

- **Live Match Tracking**: Real-time scores, current run rates, and live action on the pitch.
- **Dedicated Match Pages**: Click on any match to view a comprehensive dashboard dedicated solely to that match.
- **Tabbed Scorecards**: Clean, interactive tabs to switch between team innings, displaying granular batter and bowler statistics.
- **Advanced AI Analytics Engine**:
  - **Win Predictor**: Mathematical algorithm calculating real-time win probabilities based on required run rates and remaining wickets.
  - **Final Score Projection**: Predicts the minimum and maximum expected score for the first innings.
  - **Momentum & Pressure Badges**: Intelligent badges that read the state of the match (e.g., "Dominating", "High Pressure", "Cruising").
  - **Interactive Chart.js Graphs**: Dual-axis line charts plotting over-by-over run rates alongside simulated win probability curves.
- **Complete Authentication System**:
  - Secure Email/Password & Google Sign-In powered by **Firebase**.
  - Dynamic user profiles, protected routes, and a seamless **Guest Access** mode for anonymous browsing.
  - Premium glassmorphism UI for Login and Signup pages with built-in validation and toast notifications.
- **Premium Glassmorphism UI**: High-end visual aesthetics using frosted glass effects, neon accents, and smooth transitions.
- **Dark/Light Mode Toggle**: Built-in theme switching for user comfort.
- **Offline Fallback**: Gracefully degrades to use local JSON data if the API limit is reached or the user is offline.

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), CSS3
- **Authentication**: Firebase v9 (Modular SDK)
- **Data Visualization**: Chart.js
- **API Integration**: Cricbuzz Cricket API (via RapidAPI)
- **Styling**: Custom CSS Variables, Flexbox/Grid layouts, Backdrop Filters (Glassmorphism)

## 🚀 Getting Started

### Prerequisites
You need a modern web browser and a local development server (to bypass CORS issues when fetching API data).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Cricket-Live-Score-Dashboard.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Cricket-Live-Score-Dashboard
   ```
3. Start a local server. For example, using Python:
   ```bash
   python -m http.server 3000
   ```
4. Open `http://localhost:3000` in your web browser.

### API Configuration

#### 1. RapidAPI Setup (Live Scores)
To get live data, you need an API key from RapidAPI:
1. Go to [Cricbuzz Cricket API on RapidAPI](https://rapidapi.com/cricketapicricbuzz/api/cricbuzz-cricket).
2. Subscribe to get your API key.
3. Open `script.js` and `match.js` and replace the `API_KEY` variable with your key.

#### 2. Firebase Setup (Authentication)
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Email/Password** and **Google** sign-in under the Authentication tab.
3. Register a Web App to get your Firebase configuration object.
4. Open `firebase-config.js` and replace the placeholders with your API keys:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       // ...
   };
   ```

## 📁 Project Structure

```text
├── index.html          # Main Dashboard Home Page
├── match.html          # Dedicated Match Details Page
├── login.html          # Authentication Login Page
├── signup.html         # Authentication Sign-Up Page
├── style.css           # Global Styles & Glassmorphism UI
├── script.js           # Main Dashboard Logic & API Fetching
├── match.js            # Match Details & AI Analytics Engine Logic
├── auth.js             # Authentication Logic (Login/Signup/Guest logic)
├── firebase-config.js  # Firebase Initialization & Credentials
└── data/
    └── matches.json    # Fallback offline data
```

## 📸 Screenshots

> **Note:** Add your screenshots in the `screenshots/` directory and link them here.
> 
> *Dashboard View*
> `![Dashboard Interface](screenshots/dashboard.png)`
>
> *Match Analytics & Predictions*
> `![Match Analytics](screenshots/match-analytics.png)`
>
> *Authentication Pages*
> `![Login Page](screenshots/login.png)`

## 🎯 Future Roadmap

- [ ] Add historical player statistics and head-to-head records *(Coming Soon)*.
- [ ] Implement push notifications for falling wickets and milestones *(Under Development)*.
- [ ] Add multi-language support.


## 👤 Author

**Kishor Kumar**
- GitHub: https://github.com/Kishor0009
- LinkedIn: https://www.linkedin.com/in/kishor-kumar-ba73b0323

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
