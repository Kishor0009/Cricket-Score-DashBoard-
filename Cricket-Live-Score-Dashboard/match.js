document.addEventListener('DOMContentLoaded', async () => {
    const API_KEY = 'YOUR_RAPIDAPI_KEY_HERE'; // CricAPI/RapidAPI key
    const container = document.getElementById('match-details-container');

    // Get match ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const matchId = urlParams.get('id');

    // Get match details from localStorage
    const matchStr = localStorage.getItem('currentMatch');
    const match = matchStr ? JSON.parse(matchStr) : null;

    if (!matchId) {
        container.innerHTML = '<div class="error" style="text-align:center; padding: 20px;">No match ID provided.</div>';
        return;
    }

    container.innerHTML = '<div class="loader" style="margin: 50px auto; text-align: center;">Loading Match Details...</div>';

    try {
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
            }
        };

        let scardData = null;
        let lbData = null;

        // Fetch all data in parallel if real match
        if (!matchId.startsWith('match_')) {
            const scardPromise = fetch(`https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/scard`, options).then(r => r.json()).catch(() => null);
            
            // Only fetch leanback if match is live
            const lbPromise = (match && match.status === 'LIVE') 
                ? fetch(`https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/leanback`, options).then(r => r.json()).catch(() => null)
                : Promise.resolve(null);

            [scardData, lbData] = await Promise.all([scardPromise, lbPromise]);
        }

        // Initialize variables for header scores (fallback to localStorage match data)
        let t1Score = match ? match.team1.score : '-';
        let t1Overs = match ? match.team1.overs : '-';
        let t2Score = match ? match.team2.score : '-';
        let t2Overs = match ? match.team2.overs : '-';

        // Update scores from live scorecard data if available
        if (scardData && scardData.scorecard) {
            scardData.scorecard.forEach(innings => {
                const sName = innings.batteamshortname;
                const scoreStr = `${innings.score}/${innings.wickets}`;
                
                if (match && (sName === match.team1.short || innings.batteamname === match.team1.name)) {
                    t1Score = scoreStr;
                    t1Overs = innings.overs;
                } else if (match && (sName === match.team2.short || innings.batteamname === match.team2.name)) {
                    t2Score = scoreStr;
                    t2Overs = innings.overs;
                }
            });
        }

        let html = '';

        // 1. Render Header Layout
        if (match) {
            html += `
                <div class="modal-teams" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; background: rgba(255,255,255,0.03); padding: 30px; border-radius: 15px; border: 1px solid var(--border-glass);">
                    <div class="modal-team" style="display: flex; flex-direction: column; align-items: center; gap: 15px; width: 40%; text-align: center;">
                        <img src="${match.team1.logo}" alt="${match.team1.short}" style="width: 80px; height: 80px; border-radius: 50%; background: #fff; padding: 5px;">
                        <h2 style="font-size: 1.5rem;">${match.team1.name}</h2>
                        <div class="runs" style="font-size: 2.5rem; font-weight: 800; color: var(--accent-color); line-height: 1;">${t1Score !== '0/0' ? t1Score : '-'}</div>
                        <div class="overs" style="color: var(--text-muted);">${t1Overs !== '-' && t1Overs !== '0.0' ? '(' + t1Overs + ' ov)' : 'Yet to bat'}</div>
                    </div>
                    
                    <div class="modal-vs" style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        <div style="font-size: 2rem; font-weight: bold; color: var(--text-muted);">VS</div>
                        <span class="status ${match.status === 'LIVE' ? 'live' : ''}" style="background: rgba(255,255,255,0.1); padding: 5px 15px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">${match.status}</span>
                    </div>
                    
                    <div class="modal-team" style="display: flex; flex-direction: column; align-items: center; gap: 15px; width: 40%; text-align: center;">
                        <img src="${match.team2.logo}" alt="${match.team2.short}" style="width: 80px; height: 80px; border-radius: 50%; background: #fff; padding: 5px;">
                        <h2 style="font-size: 1.5rem;">${match.team2.name}</h2>
                        <div class="runs" style="font-size: 2.5rem; font-weight: 800; color: var(--accent-color); line-height: 1;">${t2Score !== '0/0' ? t2Score : '-'}</div>
                        <div class="overs" style="color: var(--text-muted);">${t2Overs !== '-' && t2Overs !== '0.0' ? '(' + t2Overs + ' ov)' : 'Yet to bat'}</div>
                    </div>
                </div>
                ${match.result ? `<div style="text-align: center; margin-bottom: 30px; font-weight: 600; color: var(--accent-color); font-size: 1.1rem;">${match.result}</div>` : ''}
                ${match.toss ? `<div class="toss-info"><span>${match.toss}</span></div>` : ''}
            `;
        }

        // 2. Render Live Action Panel
        if (lbData && lbData.miniscore) {
            const striker = lbData.miniscore.batsmanstriker;
            const nonstriker = lbData.miniscore.batsmannonstriker;
            const bowler = lbData.miniscore.bowlerstriker;
            
            if (striker && striker.name) {
                html += `
                    <div class="glass-panel" style="margin-bottom: 30px; padding: 25px; border: 1px solid var(--border-glass); background: var(--bg-glass); box-shadow: 0 0 20px rgba(0, 255, 135, 0.05);">
                        <h3 style="color: var(--accent-color); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--live-color); animation: blink 1.5s infinite;"></span>
                            Live Action on Pitch
                        </h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px; text-transform: uppercase; font-weight: 600;">Current Batters</div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border-glass);">
                                    <span><strong>${striker.name}</strong> <span style="color: var(--accent-color);">*</span></span>
                                    <span><strong>${striker.runs}</strong> <span style="color:var(--text-muted); font-size:0.85rem;">(${striker.balls})</span></span>
                                </div>
                                ${nonstriker && nonstriker.name ? `
                                <div style="display: flex; justify-content: space-between;">
                                    <span>${nonstriker.name}</span>
                                    <span><strong>${nonstriker.runs}</strong> <span style="color:var(--text-muted); font-size:0.85rem;">(${nonstriker.balls})</span></span>
                                </div>` : ''}
                            </div>
                            <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                                <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 12px; text-transform: uppercase; font-weight: 600;">Current Bowler</div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span><strong>${bowler.name}</strong></span>
                                    <span><strong>${bowler.wickets}-${bowler.runs}</strong> <span style="color:var(--text-muted); font-size:0.85rem;">(${bowler.overs} ov)</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        // 3. Render Scorecard Tabs
        if (scardData && scardData.scorecard && scardData.scorecard.length > 0) {
            const activeIndex = scardData.scorecard.length - 1; // Last innings is active
            
            let tabsHtml = '<div class="tabs-container">';
            let contentsHtml = '<div class="tabs-content-wrapper">';

            const playedTeams = [];

            scardData.scorecard.forEach((innings, index) => {
                const isActive = index === activeIndex ? 'active' : '';
                const teamName = innings.batteamname || `Innings ${index + 1}`;
                playedTeams.push(teamName);
                
                tabsHtml += `<button class="tab-btn ${isActive}" data-target="innings-${index}">${teamName}</button>`;

                contentsHtml += `
                <div class="tab-content ${isActive}" id="innings-${index}">
                    <div class="scorecard-container">
                        <div class="scorecard-header">
                            <span>${innings.batteamname} Innings</span>
                            <span>${innings.score}/${innings.wickets} <span style="color:var(--text-muted); font-weight:normal;">(${innings.overs} ov)</span></span>
                        </div>
                        
                        <div style="overflow-x: auto; margin-bottom: 30px;">
                            <table class="scorecard-table">
                                <thead>
                                    <tr>
                                        <th>Batter</th>
                                        <th>R</th>
                                        <th>B</th>
                                        <th>4s</th>
                                        <th>6s</th>
                                        <th>SR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${innings.batsman ? innings.batsman.map(b => `
                                        <tr>
                                            <td style="width: 50%;">
                                                <strong style="color:var(--text-main); font-size: 1rem;">${b.name}</strong>
                                                <span class="player-out">${b.outdec || 'not out'}</span>
                                            </td>
                                            <td style="font-weight:bold; font-size: 1rem;">${b.runs}</td>
                                            <td>${b.balls}</td>
                                            <td>${b.fours}</td>
                                            <td>${b.sixes}</td>
                                            <td>${b.strkrate}</td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="6">No batting data available</td></tr>'}
                                </tbody>
                            </table>
                        </div>

                        <div style="overflow-x: auto;">
                            <table class="scorecard-table" style="margin-bottom: 0;">
                                <thead>
                                    <tr>
                                        <th>Bowler</th>
                                        <th>O</th>
                                        <th>M</th>
                                        <th>R</th>
                                        <th>W</th>
                                        <th>ECON</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${innings.bowler ? innings.bowler.map(b => `
                                        <tr>
                                            <td style="width: 50%;"><strong style="color:var(--text-main); font-size: 1rem;">${b.name}</strong></td>
                                            <td>${b.overs}</td>
                                            <td>${b.maidens}</td>
                                            <td>${b.runs}</td>
                                            <td style="font-weight:bold; color:var(--accent-color); font-size: 1rem;">${b.wickets}</td>
                                            <td>${b.economy}</td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="6">No bowling data available</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                `;
            });

            // If team 2 hasn't batted yet, add a disabled tab for them
            if (match && playedTeams.length === 1) {
                const team2Name = match.team1.name === playedTeams[0] || match.team1.short === playedTeams[0] ? match.team2.name : match.team1.name;
                tabsHtml += `<button class="tab-btn" disabled style="opacity:0.4; cursor:not-allowed;">${team2Name} <span style="font-size:0.8rem; font-weight:normal;">(Yet to bat)</span></button>`;
            }
            
            tabsHtml += '</div>';
            contentsHtml += '</div>';
            
            html += tabsHtml + contentsHtml;
            
            // Set HTML
            container.innerHTML = html;
            
            // Setup Tab Listeners
            const tabBtns = document.querySelectorAll('.tab-btn:not([disabled])');
            const tabContents = document.querySelectorAll('.tab-content');

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    btn.classList.add('active');
                    document.getElementById(btn.dataset.target).classList.add('active');
                });
            });

        } else if (matchId.startsWith('match_')) {
            html += '<div style="text-align:center; padding: 40px; color: var(--text-muted); background:rgba(255,255,255,0.03); border-radius:12px;">Detailed scorecards are not available for sample offline matches. Add an API key and click on a real match!</div>';
            container.innerHTML = html;
        } else {
            html += '<div style="text-align:center; padding: 40px; color: var(--text-muted); background:rgba(255,255,255,0.03); border-radius:12px;">Scorecard data not available for this match yet.</div>';
            container.innerHTML = html;
        }

        // Render AI Analytics Section
        renderAnalytics(match, scardData);

    } catch (err) {
        console.error('Error fetching match details:', err);
        container.innerHTML = '<div class="error" style="text-align:center; padding: 20px;">Failed to load full scorecard details. Please try again.</div>';
    }

    // --- AI Analytics Logic ---
    let scoreChartInstance = null;

    function renderAnalytics(match, scardData) {
        if (!match) return;
        const analyticsContainer = document.getElementById('analytics-panel-container');
        if (!analyticsContainer) return;
        
        let t1Score = 0, t1Wkts = 0, t1Overs = 0;
        let t2Score = 0, t2Wkts = 0, t2Overs = 0;
        
        if (match.team1.score && match.team1.score.includes('/')) {
            [t1Score, t1Wkts] = match.team1.score.split('/').map(Number);
        } else { t1Score = parseInt(match.team1.score) || 0; }
        
        if (match.team2.score && match.team2.score.includes('/')) {
            [t2Score, t2Wkts] = match.team2.score.split('/').map(Number);
        } else { t2Score = parseInt(match.team2.score) || 0; }

        t1Overs = parseFloat(match.team1.overs) || 0;
        t2Overs = parseFloat(match.team2.overs) || 0;

        // Use precise data from scardData if available
        if (scardData && scardData.scorecard) {
            scardData.scorecard.forEach(innings => {
                const sName = innings.batteamshortname;
                if (sName === match.team1.short || innings.batteamname === match.team1.name) {
                    t1Score = parseInt(innings.score) || t1Score;
                    t1Wkts = parseInt(innings.wickets) || t1Wkts;
                    t1Overs = parseFloat(innings.overs) || t1Overs;
                } else if (sName === match.team2.short || innings.batteamname === match.team2.name) {
                    t2Score = parseInt(innings.score) || t2Score;
                    t2Wkts = parseInt(innings.wickets) || t2Wkts;
                    t2Overs = parseFloat(innings.overs) || t2Overs;
                }
            });
        }
        
        let currentInnings = 1;
        let currentScore = t1Score;
        let currentWkts = t1Wkts;
        let currentOvers = t1Overs;
        let target = 0;
        let batTeam = match.team1.short;
        
        if (t2Overs > 0 || (match.team2.score && match.team2.score !== '0/0' && match.team2.score !== '-')) {
            currentInnings = 2;
            currentScore = t2Score;
            currentWkts = t2Wkts;
            currentOvers = t2Overs;
            target = t1Score + 1;
            batTeam = match.team2.short;
        }

        // --- Final Score Prediction ---
        let minScore = 0, maxScore = 0;
        const maxOvers = match.team1.name && match.team1.name.includes('Women') ? 20 : 20; 
        const oversRemaining = Math.max(0, maxOvers - currentOvers);
        const crr = currentOvers > 0 ? (currentScore / currentOvers) : 6;
        const wicketsRemaining = 10 - currentWkts;
        
        if (currentInnings === 1 && match.status === 'LIVE') {
            const expectedRunRate = crr * (wicketsRemaining / 10) + (wicketsRemaining > 5 ? 2 : 0); 
            const projectedAddition = expectedRunRate * oversRemaining;
            
            const baseProjection = Math.floor(currentScore + projectedAddition);
            minScore = Math.max(currentScore, baseProjection - 10);
            maxScore = baseProjection + 15;
        }

        // --- Win Probability Algorithm ---
        let winProbBat = 50;
        let pressureState = "Balanced";
        let pressureClass = "badge-neutral";
        
        if (match.status === 'COMPLETED') {
            winProbBat = match.result && match.result.includes(batTeam) ? 100 : 0;
            pressureState = "Match Over";
        } else if (currentInnings === 1) {
            if (crr > 9 && wicketsRemaining > 6) winProbBat = 70;
            else if (crr < 6 && wicketsRemaining < 5) winProbBat = 20;
            else winProbBat = 50 + (crr - 7) * 5 + (wicketsRemaining - 5) * 5;
            
            if (winProbBat > 65) { pressureState = "Dominating"; pressureClass = "badge-good"; }
            else if (winProbBat < 35) { pressureState = "Under Pressure"; pressureClass = "badge-danger"; }
        } else if (currentInnings === 2) {
            const runsNeeded = target - currentScore;
            if (runsNeeded <= 0) winProbBat = 100;
            else if (oversRemaining <= 0) winProbBat = 0;
            else {
                const rrr = runsNeeded / oversRemaining;
                if (rrr > 12 || wicketsRemaining < 3) winProbBat = 15;
                else if (rrr < 6 && wicketsRemaining > 5) winProbBat = 85;
                else winProbBat = 50 - (rrr - 8) * 10 + (wicketsRemaining - 5) * 5;
            }
            
            if (winProbBat > 65) { pressureState = "Cruising"; pressureClass = "badge-good"; }
            else if (winProbBat < 35) { pressureState = "High Pressure"; pressureClass = "badge-danger"; }
        }
        
        winProbBat = Math.max(1, Math.min(99, Math.floor(winProbBat)));
        if (match.status === 'COMPLETED') winProbBat = winProbBat >= 50 ? 100 : 0;
        
        let p1 = currentInnings === 1 ? winProbBat : 100 - winProbBat;
        let p2 = 100 - p1;
        
        if (match.status !== 'LIVE' && match.status !== 'COMPLETED') {
            p1 = 50; p2 = 50; pressureState = "Upcoming";
        }
        
        const t1 = match.team1.short;
        const t2 = match.team2.short;

        analyticsContainer.innerHTML = `
            <section class="analytics-section">
                <div class="stat-box glass-panel predictor-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3><i class="fa-solid fa-robot"></i> AI Win Prediction</h3>
                        <span id="pressure-badge" class="${pressureClass}" style="font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 600; border: 1px solid var(--border-glass);">${pressureState}</span>
                    </div>
                    
                    <div class="predictor-content" id="predictor-container">
                        <div class="pred-team" style="display:flex; justify-content:space-between; margin-bottom:8px; font-weight:600;">
                            <span>${t1}</span>
                            <span style="color: var(--accent-color);">${p1}%</span>
                        </div>
                        <div class="progress-bar" style="background: rgba(255,255,255,0.05); height: 10px; border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
                            <div class="progress-fill" style="width: ${p1}%; background: var(--accent-gradient); height: 100%; transition: width 1s ease-in-out;"></div>
                        </div>
                        
                        <div class="pred-team" style="display:flex; justify-content:space-between; margin-bottom:8px; font-weight:600;">
                            <span>${t2}</span>
                            <span style="color: #4F46E5;">${p2}%</span>
                        </div>
                        <div class="progress-bar" style="background: rgba(255,255,255,0.05); height: 10px; border-radius: 10px; overflow: hidden;">
                            <div class="progress-fill" style="width: ${p2}%; background: #4F46E5; height: 100%; transition: width 1s ease-in-out;"></div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border-glass);">
                        <h4 style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 15px; text-transform: uppercase; font-weight: 600;">${currentInnings === 1 && match.status === 'LIVE' ? 'Projected Final Score (1st Innings)' : 'Match Completed / 2nd Innings'}</h4>
                        <div style="display: flex; justify-content: space-around; align-items: center; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.02);">
                            <div style="text-align: center;">
                                <div id="proj-score-min" style="font-size: 1.8rem; font-weight: 800;">${minScore || '-'}</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">MINIMUM</div>
                            </div>
                            <div style="color: var(--text-muted); font-weight: 300; font-size: 1.5rem;">-</div>
                            <div style="text-align: center;">
                                <div id="proj-score-max" style="font-size: 1.8rem; font-weight: 800; color: var(--accent-color);">${maxScore || '-'}</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">MAXIMUM</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-box glass-panel chart-box">
                    <h3><i class="fa-solid fa-chart-area"></i> Analytics Engine</h3>
                    <div class="chart-container" style="height: 320px; position: relative;">
                        ${match.scoreProgression ? '<canvas id="scoreChart"></canvas>' : '<div style="display:flex; height:100%; align-items:center; justify-content:center; color:var(--text-muted);">Progression data unavailable</div>'}
                    </div>
                </div>
            </section>
        `;

        // Chart Update
        if (match.scoreProgression) {
            // Need a tiny timeout to ensure canvas is injected into DOM
            setTimeout(() => {
                updateChart(match, p1, p2);
            }, 50);
        }
    }

    function updateChart(match, winProbT1, winProbT2) {
        const canvas = document.getElementById('scoreChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        if (scoreChartInstance) {
            scoreChartInstance.destroy();
        }

        Chart.defaults.color = getComputedStyle(document.body).getPropertyValue('--text-muted') || '#8b949e';
        Chart.defaults.font.family = getComputedStyle(document.body).getPropertyValue('--primary-font') || 'Outfit';

        const overs = match.scoreProgression.overs;
        const runs = match.scoreProgression.runs;
        
        const runRates = runs.map((r, i) => {
            const ov = parseInt(overs[i]);
            return ov > 0 ? (r / ov).toFixed(2) : 0;
        });

        const simulatedProbs = [];
        let startProb = 50;
        for (let i = 0; i < overs.length; i++) {
            const progress = (i + 1) / overs.length;
            simulatedProbs.push(Math.round(startProb + (winProbT1 - startProb) * progress));
        }

        scoreChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: overs.map(o => 'Ov ' + o),
                datasets: [
                    {
                        label: 'Current Run Rate',
                        data: runRates,
                        borderColor: '#00FF87',
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: match.team1.short + ' Win %',
                        data: simulatedProbs,
                        borderColor: '#4F46E5',
                        backgroundColor: 'rgba(79, 70, 229, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 13 },
                        bodyFont: { size: 13 },
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Run Rate' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        min: 0,
                        max: 15
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Win Probability (%)' },
                        grid: { drawOnChartArea: false },
                        min: 0,
                        max: 100
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                }
            }
        });
    }
});
