document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const API_KEY = 'YOUR_RAPIDAPI_KEY_HERE'; // Added to top to fix TDZ error
    const matchesContainer = document.getElementById('matches-container');
    const searchInput = document.getElementById('search-input');
    const navItems = document.querySelectorAll('#nav-list li');
    const themeToggle = document.getElementById('theme-toggle');
    const refreshBtn = document.getElementById('refresh-btn');
    const predictorContainer = document.getElementById('predictor-container');
    const performersContainer = document.getElementById('performers-container');

    let allMatches = [];
    let currentFilter = 'all';
    let scoreChartInstance = null;

    // Initialize
    init();

    async function init() {
        await fetchMatches();
        setupEventListeners();
        renderMatches();
        updateFeaturedStats();

        // Simulate auto-refresh every 30 seconds
        setInterval(async () => {
            await fetchMatches();
            renderMatches();
            updateFeaturedStats();
        }, 30000);
    }

    // Fetch Matches Data
    async function fetchMatches() {
        try {
            matchesContainer.innerHTML = '<div class="loader">Loading Matches...</div>';
            
            // 1. Try to fetch from API if key is present
            if (API_KEY && API_KEY.trim() !== '') {
                try {
                    const options = {
                        method: 'GET',
                        headers: {
                            'x-rapidapi-key': API_KEY,
                            'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
                        }
                    };
                    const response = await fetch('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live', options);
                    const apiData = await response.json();
                    
                    if (apiData && apiData.typeMatches) {
                        let allApiMatches = [];
                        apiData.typeMatches.forEach(typeMatch => {
                            if(typeMatch.seriesMatches) {
                                typeMatch.seriesMatches.forEach(series => {
                                    if(series.seriesAdWrapper && series.seriesAdWrapper.matches) {
                                        series.seriesAdWrapper.matches.forEach(m => allApiMatches.push(m));
                                    }
                                });
                            }
                        });
                        
                        if (allApiMatches.length > 0) {
                            allMatches = allApiMatches.map(mapCricbuzzToAppFormat);
                            return; // Exit if successful
                        }
                    } else {
                        // API returned an error or no data
                    }
                } catch (apiError) {
                    console.error('API fetch failed, falling back to sample data:', apiError);
                }
            }
            
            // 2. Fallback to sample data (used for GitHub Pages demo when API_KEY is empty)
            const response = await fetch('data/matches.json');
            const data = await response.json();
            allMatches = data;
        } catch (error) {
            console.error('Error fetching match data:', error);
            matchesContainer.innerHTML = '<div class="error">Failed to load match data. Please try again later.</div>';
        }
    }

    // Mapper function to convert Cricbuzz RapidAPI response to our app format
    function mapCricbuzzToAppFormat(apiMatch) {
        const info = apiMatch.matchInfo;
        const score = apiMatch.matchScore || {};
        
        const t1Name = info.team1.teamName || "Team 1";
        const t1Short = info.team1.teamSName || "T1";
        const t2Name = info.team2.teamName || "Team 2";
        const t2Short = info.team2.teamSName || "T2";
        
        let t1Score = "0/0", t1Overs = "0.0";
        let t2Score = "0/0", t2Overs = "0.0";
        
        if (score.team1Score && score.team1Score.inngs1) {
            const wickets = score.team1Score.inngs1.wickets !== undefined ? score.team1Score.inngs1.wickets : 0;
            t1Score = `${score.team1Score.inngs1.runs}/${wickets}`;
            t1Overs = `${score.team1Score.inngs1.overs}`;
        }
        if (score.team2Score && score.team2Score.inngs1) {
            const wickets = score.team2Score.inngs1.wickets !== undefined ? score.team2Score.inngs1.wickets : 0;
            t2Score = `${score.team2Score.inngs1.runs}/${wickets}`;
            t2Overs = `${score.team2Score.inngs1.overs}`;
        }
        
        let appStatus = "UPCOMING";
        if (info.state === "In Progress" || info.state === "Stumps" || info.state === "Tea" || info.state === "Lunch") appStatus = "LIVE";
        if (info.state === "Complete") appStatus = "COMPLETED";

        return {
            id: info.matchId,
            status: appStatus,
            team1: {
                name: t1Name,
                short: t1Short,
                logo: `https://ui-avatars.com/api/?name=${t1Short}&background=00FF87&color=000&font-size=0.4`,
                score: t1Score,
                overs: t1Overs
            },
            team2: {
                name: t2Name,
                short: t2Short,
                logo: `https://ui-avatars.com/api/?name=${t2Short}&background=4F46E5&color=fff&font-size=0.4`,
                score: t2Score,
                overs: t2Overs
            },
            toss: info.status || "Match details pending",
            currentRunRate: "-",
            requiredRunRate: "-",
            prediction: { [t1Short]: 50, [t2Short]: 50 }
        };
    }

    // Render Matches
    function renderMatches() {
        const searchTerm = searchInput.value.toLowerCase();

        const filteredMatches = allMatches.filter(match => {
            const matchesSearch = match.team1.name.toLowerCase().includes(searchTerm) ||
                match.team1.short.toLowerCase().includes(searchTerm) ||
                match.team2.name.toLowerCase().includes(searchTerm) ||
                match.team2.short.toLowerCase().includes(searchTerm);

            const matchesFilter = currentFilter === 'all' || match.status.toLowerCase() === currentFilter;

            return matchesSearch && matchesFilter;
        });

        matchesContainer.innerHTML = '';

        if (filteredMatches.length === 0) {
            matchesContainer.innerHTML = '<div class="no-results">No matches found.</div>';
            return;
        }

        filteredMatches.forEach(match => {
            const card = document.createElement('div');
            card.className = 'match-card glass-panel';

            const isLive = match.status === 'LIVE';
            const statusClass = isLive ? 'status live' : 'status';
            const statusText = isLive ? 'LIVE' : match.status;

            card.innerHTML = `
                <div class="match-header">
                    <span class="${statusClass}">${statusText}</span>
                    <span>${match.toss || match.result || ''}</span>
                </div>
                
                <div class="team-row">
                    <div class="team-info">
                        <img src="${match.team1.logo}" alt="${match.team1.short}" class="team-logo">
                        <span class="team-name">${match.team1.short}</span>
                    </div>
                    <div class="team-score">
                        <div class="runs">${match.team1.score}</div>
                        <div class="overs">${match.team1.overs !== '-' ? '(' + match.team1.overs + ' ov)' : ''}</div>
                    </div>
                </div>
                
                <div class="team-row">
                    <div class="team-info">
                        <img src="${match.team2.logo}" alt="${match.team2.short}" class="team-logo">
                        <span class="team-name">${match.team2.short}</span>
                    </div>
                    <div class="team-score">
                        <div class="runs">${match.team2.score}</div>
                        <div class="overs">${match.team2.overs !== '-' ? '(' + match.team2.overs + ' ov)' : ''}</div>
                    </div>
                </div>
                
                <div class="match-footer">
                    ${isLive ? `<span>CRR: ${match.currentRunRate} ${match.requiredRunRate !== '-' ? '| REQ: ' + match.requiredRunRate : ''}</span>` : ''}
                    ${match.result ? `<span><strong>${match.result}</strong></span>` : ''}
                </div>
            `;

            matchesContainer.appendChild(card);
            
            // Open Match Details on Click
            card.addEventListener('click', () => openMatchDetails(match));
        });
    }

    // Removed updateFeaturedStats and updateChart (Moved to match.js)


    // Open Match Details page
    function openMatchDetails(match) {
        if (match && match.id) {
            localStorage.setItem('currentMatch', JSON.stringify(match));
            window.location.href = `match.html?id=${match.id}`;
        }
    }

    // Event Listeners
    function setupEventListeners() {
        // Search
        searchInput.addEventListener('input', renderMatches);

        // Navigation / Filters
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                navItems.forEach(nav => nav.classList.remove('active'));
                e.currentTarget.classList.add('active');
                currentFilter = e.currentTarget.dataset.filter;
                renderMatches();
            });
        });

        // Refresh Button
        refreshBtn.addEventListener('click', async () => {
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('fa-spin');
            await fetchMatches();
            renderMatches();
            setTimeout(() => icon.classList.remove('fa-spin'), 500);
        });

        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            document.body.classList.toggle('dark-theme');

            const isLight = document.body.classList.contains('light-theme');
            themeToggle.innerHTML = isLight ?
                '<i class="fa-solid fa-sun"></i><span>Light Mode</span>' :
                '<i class="fa-solid fa-moon"></i><span>Dark Mode</span>';
        });
    }
});
