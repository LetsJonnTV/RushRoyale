class Game {
    constructor() {
        // Warten bis Canvas verfügbar ist
        this.initializeCanvas();
        
        // Load settings first
        this.settings = this.loadSettings();
        
        // Initialize statistics
        this.initializeStatistics();
        this.gameStartTime = Date.now();
        
        // Initialize maps
        this.initializeMaps();
        this.currentMapId = localStorage.getItem('rushRoyalSelectedMap') || 'classic';
        
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.money = 100;
        this.lives = 20;
        this.score = 0;
        this.wave = 1;
        this.gameRunning = true; // Spiel startet aktiv
        this.gamePaused = false;
        this.waveInProgress = false;
        this.enemiesSpawned = 0;
        this.enemiesPerWave = 10;
        this.mouseX = 0;
        this.mouseY = 0;
        this.gameSpeed = 1;
        this.lastFrameTime = 0;
        this.fpsCounter = 0;
        this.lastFpsUpdate = 0;
        this.currentFps = 0;
        this.particles = [];
        this.achievements = [];
        this.totalKills = 0;
        this.towersBuilt = 0;
        this.goldEarned = 0;
        this.autoWaveEnabled = false;
        this.autoWaveDelay = 3000; // 3 Sekunden Verzögerung
        this.autoWaveTimer = null;
        this.autoWaveInterval = null;
        this.bossWave = false;
        this.comboMultiplier = 1;
        this.comboKills = 0;
        this.lastKillTime = 0;
        this.powerUps = [];
        this.screenShake = 0;
        this.specialAbilities = {
            meteorStrike: { cooldown: 0, maxCooldown: 300 },
            freezeAll: { cooldown: 0, maxCooldown: 600 },
            goldRush: { cooldown: 0, maxCooldown: 900 },
            timeWarp: { cooldown: 0, maxCooldown: 800 },
            shieldBoost: { cooldown: 0, maxCooldown: 400 },
            damageBoost: { cooldown: 0, maxCooldown: 500 }
        };
        
        this.activeEffects = {
            timeWarp: false,
            shieldBoost: false,
            damageBoost: false
        };
        
        // Initialize current map
        this.loadMap(this.currentMapId);
        
        this.setupEventListeners();
        this.setupMenuEventListeners();
        this.gameLoop();
        this.drawPath();
        this.applySettings();
    }

    // Map System
    initializeMaps() {
        this.maps = {
            classic: {
                id: 'classic',
                name: 'Klassische Route',
                description: 'Der ursprüngliche Pfad - perfekt für Anfänger',
                difficulty: 'Einfach',
                background: '#1a1a2e',
                unlocked: true,
                path: [
                    {x: 0, y: 375},
                    {x: 187, y: 375},
                    {x: 187, y: 187},
                    {x: 437, y: 187},
                    {x: 437, y: 562},
                    {x: 687, y: 562},
                    {x: 687, y: 312},
                    {x: 875, y: 312},
                    {x: 875, y: 125},
                    {x: 1000, y: 125}
                ]
            },
            spiral: {
                id: 'spiral',
                name: 'Spiralweg',
                description: 'Ein spiralförmiger Pfad mit längerer Route',
                difficulty: 'Mittel',
                background: '#0f3460',
                unlocked: true,
                path: [
                    {x: 0, y: 375},
                    {x: 150, y: 375},
                    {x: 150, y: 150},
                    {x: 850, y: 150},
                    {x: 850, y: 600},
                    {x: 300, y: 600},
                    {x: 300, y: 300},
                    {x: 700, y: 300},
                    {x: 700, y: 450},
                    {x: 450, y: 450},
                    {x: 450, y: 400},
                    {x: 1000, y: 400}
                ]
            },
            zigzag: {
                id: 'zigzag',
                name: 'Zickzack-Chaos',
                description: 'Viele scharfe Kurven - ideal für Slow-Türme',
                difficulty: 'Mittel',
                background: '#16537e',
                unlocked: true,
                path: [
                    {x: 0, y: 100},
                    {x: 200, y: 100},
                    {x: 200, y: 250},
                    {x: 400, y: 250},
                    {x: 400, y: 100},
                    {x: 600, y: 100},
                    {x: 600, y: 400},
                    {x: 800, y: 400},
                    {x: 800, y: 200},
                    {x: 900, y: 200},
                    {x: 900, y: 650},
                    {x: 1000, y: 650}
                ]
            },
            cross: {
                id: 'cross',
                name: 'Kreuzung',
                description: 'Mehrere Pfade kreuzen sich - strategische Herausforderung',
                difficulty: 'Schwer',
                background: '#2c1810',
                unlocked: false,
                unlockCondition: () => this.statistics.highestWave >= 15,
                path: [
                    {x: 0, y: 375},
                    {x: 300, y: 375},
                    {x: 300, y: 200},
                    {x: 500, y: 200},
                    {x: 500, y: 375},
                    {x: 700, y: 375},
                    {x: 700, y: 550},
                    {x: 500, y: 550},
                    {x: 500, y: 375},
                    {x: 1000, y: 375}
                ]
            },
            maze: {
                id: 'maze',
                name: 'Labyrinth',
                description: 'Komplexer Pfad durch ein Labyrinth',
                difficulty: 'Schwer',
                background: '#4a148c',
                unlocked: false,
                unlockCondition: () => this.statistics.highestWave >= 20,
                path: [
                    {x: 0, y: 100},
                    {x: 150, y: 100},
                    {x: 150, y: 300},
                    {x: 50, y: 300},
                    {x: 50, y: 500},
                    {x: 250, y: 500},
                    {x: 250, y: 200},
                    {x: 400, y: 200},
                    {x: 400, y: 600},
                    {x: 600, y: 600},
                    {x: 600, y: 100},
                    {x: 750, y: 100},
                    {x: 750, y: 400},
                    {x: 850, y: 400},
                    {x: 850, y: 250},
                    {x: 1000, y: 250}
                ]
            },
            fortress: {
                id: 'fortress',
                name: 'Festungswall',
                description: 'Kurzer, direkter Pfad - intensive Action',
                difficulty: 'Extrem',
                background: '#b71c1c',
                unlocked: false,
                unlockCondition: () => this.statistics.highestWave >= 25,
                path: [
                    {x: 0, y: 375},
                    {x: 200, y: 375},
                    {x: 200, y: 300},
                    {x: 400, y: 300},
                    {x: 400, y: 450},
                    {x: 600, y: 450},
                    {x: 600, y: 300},
                    {x: 800, y: 300},
                    {x: 800, y: 375},
                    {x: 1000, y: 375}
                ]
            }
        };
    }

    loadMap(mapId) {
        const map = this.maps[mapId];
        if (!map) {
            console.error('Map not found:', mapId);
            return;
        }

        this.currentMapId = mapId;
        this.currentMap = map;
        this.path = [...map.path]; // Copy path
        
        // Save selected map
        localStorage.setItem('rushRoyalSelectedMap', mapId);
        
        // Update background if canvas exists
        if (this.canvas) {
            this.canvas.style.background = map.background;
        }
    }

    checkMapUnlocks() {
        Object.values(this.maps).forEach(map => {
            if (!map.unlocked && map.unlockCondition && map.unlockCondition()) {
                map.unlocked = true;
                this.showMapUnlockNotification(map);
            }
        });
    }

    showMapUnlockNotification(map) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--accent-purple), var(--primary-blue));
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: var(--shadow-xl);
            transform: translateX(400px);
            transition: transform 0.5s ease;
            min-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="fas fa-map" style="font-size: 1.5rem;"></i>
                <div>
                    <div style="font-weight: 700; margin-bottom: 0.25rem;">Neue Map freigeschaltet!</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">${map.name}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    // Statistics Management
    initializeStatistics() {
        this.statistics = this.loadStatistics();
        this.sessionStats = {
            kills: 0,
            towersBuilt: 0,
            goldEarned: 0,
            goldSpent: 0,
            towersSold: 0,
            upgrades: 0,
            abilitiesUsed: 0,
            currentWave: 1,
            currentScore: 0
        };
    }

    loadStatistics() {
        const defaultStats = {
            totalGames: 0,
            highestWave: 1,
            totalKills: 0,
            totalGold: 0,
            totalPlayTime: 0,
            towersBuilt: 0,
            goldSpent: 0,
            towersSold: 0,
            upgrades: 0,
            abilitiesUsed: 0,
            highestScore: 0,
            achievements: {}
        };

        const saved = localStorage.getItem('rushRoyalStatistics');
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    }

    saveStatistics() {
        localStorage.setItem('rushRoyalStatistics', JSON.stringify(this.statistics));
    }

    updateStatistic(stat, value) {
        if (this.statistics[stat] !== undefined) {
            this.statistics[stat] += value;
            this.saveStatistics();
        }
    }

    // Achievement System
    getAchievements() {
        return [
            {
                id: 'firstWin',
                title: 'Erste Schritte',
                description: 'Beende dein erstes Spiel',
                icon: 'fas fa-baby',
                condition: () => this.statistics.totalGames >= 1
            },
            {
                id: 'wave10',
                title: 'Überlebenskünstler',
                description: 'Erreiche Welle 10',
                icon: 'fas fa-shield-alt',
                condition: () => this.statistics.highestWave >= 10
            },
            {
                id: 'wave25',
                title: 'Veteran',
                description: 'Erreiche Welle 25',
                icon: 'fas fa-medal',
                condition: () => this.statistics.highestWave >= 25
            },
            {
                id: 'killer100',
                title: 'Jäger',
                description: 'Besiege 100 Feinde',
                icon: 'fas fa-crosshairs',
                condition: () => this.statistics.totalKills >= 100
            },
            {
                id: 'killer1000',
                title: 'Schlächter',
                description: 'Besiege 1000 Feinde',
                icon: 'fas fa-skull',
                condition: () => this.statistics.totalKills >= 1000
            },
            {
                id: 'builder',
                title: 'Architekt',
                description: 'Baue 50 Türme',
                icon: 'fas fa-chess-rook',
                condition: () => this.statistics.towersBuilt >= 50
            },
            {
                id: 'goldDigger',
                title: 'Goldgräber',
                description: 'Verdiene 10.000 Gold',
                icon: 'fas fa-coins',
                condition: () => this.statistics.totalGold >= 10000
            },
            {
                id: 'marathon',
                title: 'Marathon',
                description: 'Spiele 10 Stunden',
                icon: 'fas fa-clock',
                condition: () => this.statistics.totalPlayTime >= 36000000 // 10 hours in ms
            }
        ];
    }

    checkAchievements() {
        const achievements = this.getAchievements();
        achievements.forEach(achievement => {
            if (!this.statistics.achievements[achievement.id] && achievement.condition()) {
                this.unlockAchievement(achievement);
            }
        });
    }

    unlockAchievement(achievement) {
        this.statistics.achievements[achievement.id] = Date.now();
        this.saveStatistics();
        
        // Show achievement notification
        this.showAchievementNotification(achievement);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--accent-gold), #f59e0b);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: var(--shadow-xl);
            transform: translateX(400px);
            transition: transform 0.5s ease;
            min-width: 300px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="${achievement.icon}" style="font-size: 1.5rem;"></i>
                <div>
                    <div style="font-weight: 700; margin-bottom: 0.25rem;">Achievement freigeschaltet!</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">${achievement.title}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    // Settings Management
    loadSettings() {
        const defaultSettings = {
            performance: {
                fpsLimit: 60,
                particleQuality: 'medium'
            },
            audio: {
                masterVolume: 100,
                sfxVolume: 80,
                musicVolume: 60
            },
            graphics: {
                shadows: true,
                animations: true,
                backgroundEffects: true
            },
            gameplay: {
                autoSave: true,
                showFPS: false,
                pauseOnFocusLoss: true,
                confirmSell: true
            },
            controls: {
                quickBuild: false,
                rightClickSell: false
            }
        };

        const saved = localStorage.getItem('rushRoyalSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettingsData() {
        localStorage.setItem('rushRoyalSettings', JSON.stringify(this.settings));
    }

    applySettings() {
        // Apply FPS settings
        if (this.settings.performance.fpsLimit > 0) {
            this.targetFrameTime = 1000 / this.settings.performance.fpsLimit;
        } else {
            this.targetFrameTime = 0;
        }

        // Apply FPS display
        this.updateFPSDisplay();

        // Apply other settings as needed
        this.updateVolumeDisplays();
    }

    updateFPSDisplay() {
        let fpsDisplay = document.getElementById('fpsDisplay');
        if (this.settings.gameplay.showFPS && !fpsDisplay) {
            // Create FPS display
            fpsDisplay = document.createElement('div');
            fpsDisplay.id = 'fpsDisplay';
            fpsDisplay.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 14px;
                z-index: 1000;
            `;
            document.body.appendChild(fpsDisplay);
        } else if (!this.settings.gameplay.showFPS && fpsDisplay) {
            fpsDisplay.remove();
        }
    }

    updateVolumeDisplays() {
        // Update volume sliders and displays when settings modal opens
        const volumeSliders = ['masterVolume', 'sfxVolume', 'musicVolume'];
        volumeSliders.forEach(id => {
            const slider = document.getElementById(id);
            const display = slider?.nextElementSibling;
            if (slider && display) {
                const value = this.settings.audio[id];
                slider.value = value;
                display.textContent = value + '%';
            }
        });
    }
    
    initializeCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            // Canvas-Größe korrekt setzen (größer für bessere Sichtbarkeit)
            this.canvas.width = 1000;
            this.canvas.height = 750;
            
            // Set map background
            if (this.currentMap) {
                this.canvas.style.background = this.currentMap.background;
            }
        } else {
            // Fallback: Canvas wird später initialisiert wenn Spiel gestartet wird
            setTimeout(() => this.initializeCanvas(), 100);
        }
    }
    
    setupEventListeners() {
        // Tower-Auswahl
        document.querySelectorAll('.tower-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const towerType = card.dataset.tower;
                const cost = parseInt(card.dataset.cost);
                
                if (this.money >= cost) {
                    // Alle Cards deselektieren
                    document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    this.selectedTowerType = towerType;
                    this.selectedTower = null;
                    this.hideTowerUpgrade();
                } else {
                    this.showMessage('Nicht genug Geld!');
                }
            });
        });
        
        // Canvas-Klicks
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            
            // Korrekte Skalierung berechnen
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            // Mausposition relativ zum Canvas berechnen
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            console.log(`Mouse click at: ${x}, ${y}, Canvas size: ${this.canvas.width}x${this.canvas.height}, Rect size: ${rect.width}x${rect.height}`);
            
            if (this.selectedTowerType) {
                this.placeTower(x, y);
            } else {
                this.selectTower(x, y);
            }
        });
        
        // Mausbewegung für Ghost Tower
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        });
        
        // Spiel-Steuerung
        document.getElementById('startWave').addEventListener('click', () => {
            this.startWave();
        });
        
        document.getElementById('autoWave').addEventListener('click', () => {
            this.toggleAutoWave();
        });

        document.getElementById('pauseGame').addEventListener('click', () => {
            this.togglePause();
        });        document.getElementById('restartGame').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('upgradeBtn').addEventListener('click', () => {
            this.upgradeTower();
        });
        
        document.getElementById('sellBtn').addEventListener('click', () => {
            this.sellTower();
        });
        
        document.getElementById('upgradeClose').addEventListener('click', () => {
            this.hideTowerUpgrade();
        });
        
        // Speed Control
        document.getElementById('speedUp').addEventListener('click', () => {
            this.toggleSpeed();
        });
        
        // Special Abilities
        document.getElementById('meteorStrike').addEventListener('click', () => {
            this.useAbility('meteorStrike');
        });
        
        document.getElementById('freezeAll').addEventListener('click', () => {
            this.useAbility('freezeAll');
        });
        
        document.getElementById('goldRush').addEventListener('click', () => {
            this.useAbility('goldRush');
        });
        
        document.getElementById('timeWarp').addEventListener('click', () => {
            this.useAbility('timeWarp');
        });
        
        document.getElementById('shieldBoost').addEventListener('click', () => {
            this.useAbility('shieldBoost');
        });
        
        document.getElementById('damageBoost').addEventListener('click', () => {
            this.useAbility('damageBoost');
        });
        
        // Instructions Toggle
        const toggleBtn = document.getElementById('toggleInstructions');
        const instructionsPanel = document.getElementById('instructionsPanel');
        
        if (toggleBtn && instructionsPanel) {
            toggleBtn.addEventListener('click', () => {
                console.log('Instructions toggle clicked');
                
                // Schließe Upgrade Panel wenn Instructions geöffnet wird
                if (!instructionsPanel.classList.contains('show')) {
                    console.log('Closing upgrade panel');
                    const upgradeDiv = document.getElementById('towerUpgrade');
                    if (upgradeDiv) {
                        upgradeDiv.style.display = 'none';
                    }
                }
                
                instructionsPanel.classList.toggle('show');
                const icon = toggleBtn.querySelector('i');
                icon.className = instructionsPanel.classList.contains('show') 
                    ? 'fas fa-times' 
                    : 'fas fa-question-circle';
            });
        }
    }
    
    placeTower(x, y) {
        if (!this.selectedTowerType) return;
        
        const towerType = this.selectedTowerType;
        const cost = this.getTowerCost(towerType);
        
        if (this.money < cost) {
            this.showMessage('Nicht genug Geld!');
            return;
        }
        
        // Überprüfen ob Position valid ist
        if (this.isValidTowerPosition(x, y)) {
            const tower = new Tower(x, y, towerType);
            this.towers.push(tower);
            this.money -= cost;
            this.towersBuilt++;
            
            // Update statistics
            this.sessionStats.towersBuilt++;
            this.sessionStats.goldSpent += cost;
            this.updateStatistic('towersBuilt', 1);
            this.updateStatistic('goldSpent', cost);
            
            this.updateUI();
            this.checkAchievements();
            
            // Deselektieren
            this.selectedTowerType = null;
            document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
        } else {
            this.showMessage('Tower kann hier nicht platziert werden!');
        }
    }
    
    selectTower(x, y) {
        console.log(`Attempting to select tower at: ${x}, ${y}`);
        this.selectedTower = null;
        
        // Gehe durch alle Tower in umgekehrter Reihenfolge (zuletzt gezeichnete zuerst)
        for (let i = this.towers.length - 1; i >= 0; i--) {
            const tower = this.towers[i];
            const dist = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
            
            console.log(`Checking tower ${i} at (${tower.x}, ${tower.y}), distance: ${dist}, size: ${tower.size}`);
            
            // Verwende die tatsächliche Tower-Größe für genauere Kollision
            if (dist <= tower.size + 10) { // +10 für einfachere Auswahl
                console.log(`Tower selected: ${tower.type} at level ${tower.level}`);
                this.selectedTower = tower;
                this.showTowerUpgrade(tower);
                return;
            }
        }
        
        console.log('No tower selected');
        this.hideTowerUpgrade();
    }
    
    isValidTowerPosition(x, y) {
        // Überprüfen ob zu nah am Pfad
        for (let i = 0; i < this.path.length - 1; i++) {
            const start = this.path[i];
            const end = this.path[i + 1];
            
            const dist = this.distanceToLineSegment(x, y, start.x, start.y, end.x, end.y);
            if (dist < 40) return false;
        }
        
        // Überprüfen ob zu nah an anderen Towers
        for (let tower of this.towers) {
            const dist = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
            if (dist < 50) return false;
        }
        
        // Überprüfen ob innerhalb Canvas
        if (x < 25 || x > this.canvas.width - 25 || y < 25 || y > this.canvas.height - 25) {
            return false;
        }
        
        return true;
    }
    
    distanceToLineSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
        
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
        const projection = { x: x1 + t * dx, y: y1 + t * dy };
        
        return Math.sqrt((px - projection.x) ** 2 + (py - projection.y) ** 2);
    }
    
    getTowerCost(type) {
        const costs = {
            basic: 20,
            ice: 40,
            fire: 60,
            lightning: 100,
            poison: 80,
            sniper: 120,
            tesla: 150
        };
        return costs[type];
    }
    
    startWave() {
        if (this.waveInProgress) return;
        
        // Boss Wave Check (jede 5. Welle)
        this.bossWave = this.wave % 5 === 0;
        
        if (this.bossWave) {
            this.showBossWarning();
        }
        
        this.waveInProgress = true;
        this.enemiesSpawned = 0;
        
        // Progressive Skalierung: Mehr Feinde pro Welle
        const enemiesThisWave = this.enemiesPerWave + Math.floor(this.wave * 1.5) + Math.floor(this.wave / 2);
        
        // Spawn-Intervall wird mit jeder Welle schneller
        const baseSpawnInterval = this.bossWave ? 500 : 700;
        const spawnInterval = Math.max(200, baseSpawnInterval - (this.wave * 15));
        
        const spawner = setInterval(() => {
            if (this.enemiesSpawned >= enemiesThisWave) {
                clearInterval(spawner);
                return;
            }
            
            // Progressive Gegnertyp-Wahrscheinlichkeiten basierend auf Welle
            let enemyType = this.calculateEnemyType();
            
            this.enemies.push(new Enemy(this.path, enemyType, this.wave));
            this.enemiesSpawned++;
        }, spawnInterval);
        
        document.getElementById('startWave').disabled = true;
    }
    
    calculateEnemyType() {
        // Boss Wave: Deutlich mehr starke Gegner
        if (this.bossWave) {
            const rand = Math.random();
            if (rand < 0.6) return 'boss';
            if (rand < 0.85) return 'tank';
            if (rand < 0.95) return 'fast';
            return 'basic';
        }
        
        // Progressive Wahrscheinlichkeiten basierend auf Welle
        const waveMultiplier = Math.min(this.wave / 10, 2); // Max 2x Multiplier bei Welle 20+
        
        const fastChance = Math.min(0.15 + (this.wave * 0.03), 0.5); // Startet bei 15%, max 50%
        const tankChance = Math.max(0, Math.min(0.05 + (this.wave * 0.025), 0.35)); // Startet bei Welle 1 mit 5%, max 35%
        const bossChance = Math.max(0, Math.min((this.wave - 4) * 0.015, 0.2)); // Startet bei Welle 5, max 20%
        
        const rand = Math.random();
        
        if (this.wave >= 5 && rand < bossChance) return 'boss';
        if (this.wave >= 2 && rand < bossChance + tankChance) return 'tank';
        if (this.wave >= 2 && rand < bossChance + tankChance + fastChance) return 'fast';
        
        return 'basic';
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        const pauseBtn = document.getElementById('pauseGame');
        
        if (this.gamePaused) {
            pauseBtn.textContent = 'Fortsetzen';
            pauseBtn.classList.add('paused');
            this.showMessage('Spiel pausiert', 'info');
            
            // Auto-Wave Timer stoppen bei Pause
            if (this.autoWaveTimer) {
                clearTimeout(this.autoWaveTimer);
                this.autoWaveTimer = null;
            }
            if (this.autoWaveInterval) {
                clearInterval(this.autoWaveInterval);
                this.autoWaveInterval = null;
            }
        } else {
            pauseBtn.textContent = 'Pause';
            pauseBtn.classList.remove('paused');
            this.showMessage('Spiel fortgesetzt', 'success');
            
            // Auto-Wave Timer neu starten falls aktiviert und keine Welle läuft
            if (this.autoWaveEnabled && !this.waveInProgress) {
                this.startAutoWaveCountdown();
            }
        }
    }
    
    toggleAutoWave() {
        this.autoWaveEnabled = !this.autoWaveEnabled;
        const autoBtn = document.getElementById('autoWave');
        
        if (this.autoWaveEnabled) {
            autoBtn.classList.add('active');
            autoBtn.innerHTML = '<i class="fas fa-stop"></i><span>Auto Stopp</span>';
            this.showMessage('Auto-Wellen aktiviert!', 'success');
        } else {
            autoBtn.classList.remove('active');
            autoBtn.innerHTML = '<i class="fas fa-sync"></i><span>Auto Wellen</span>';
            this.showMessage('Auto-Wellen deaktiviert!', 'info');
        }
    }
    
    restartGame() {
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.money = 100;
        this.lives = 20;
        this.score = 0;
        this.wave = 1;
        this.gameRunning = true; // Spiel ist aktiv nach Neustart
        this.waveInProgress = false;
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.autoWaveEnabled = false;
        this.autoWaveTimer = null;
        this.autoWaveInterval = null;
        this.bossWave = false;
        this.comboMultiplier = 1;
        this.comboKills = 0;
        this.lastKillTime = 0;
        this.powerUps = [];
        this.screenShake = 0;
        
        // Reset active effects
        this.activeEffects = {
            timeWarp: false,
            shieldBoost: false,
            damageBoost: false
        };
        
        document.getElementById('startWave').disabled = false;
        
        // Auto-Wave Button zurücksetzen
        const autoBtn = document.getElementById('autoWave');
        autoBtn.classList.remove('active');
        autoBtn.innerHTML = '<i class="fas fa-sync"></i><span>Auto Wellen</span>';
        
        document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
        this.hideTowerUpgrade();
        this.updateUI();
        
        // Game Over Modal entfernen
        const gameOverModal = document.querySelector('.game-over');
        if (gameOverModal) {
            gameOverModal.remove();
        }
    }
    
    showTowerUpgrade(tower) {
        console.log('showTowerUpgrade called for tower:', tower.type);
        
        // Schließe Instructions Panel wenn es offen ist
        const instructionsPanel = document.getElementById('instructionsPanel');
        if (instructionsPanel && instructionsPanel.classList.contains('show')) {
            console.log('Closing instructions panel');
            instructionsPanel.classList.remove('show');
            const toggleBtn = document.getElementById('toggleInstructions');
            if (toggleBtn) {
                const icon = toggleBtn.querySelector('i');
                icon.className = 'fas fa-question-circle';
            }
        }
        
        const upgradeDiv = document.getElementById('towerUpgrade');
        const upgradeInfo = document.getElementById('upgradeInfo');
        
        if (!upgradeDiv || !upgradeInfo) {
            console.error('Upgrade elements not found!');
            return;
        }
        
        upgradeInfo.innerHTML = `
            <div class="tower-upgrade-header">
                <div class="tower-type-icon ${tower.type}-tower">
                    <i class="fas ${this.getTowerIcon(tower.type)}"></i>
                </div>
                <div class="tower-details">
                    <h4>${tower.type.toUpperCase()} Tower</h4>
                    <div class="tower-level">Level ${tower.level}</div>
                </div>
            </div>
            <div class="upgrade-stats">
                <div class="stat-row">
                    <span class="stat-name"><i class="fas fa-sword"></i> Schaden:</span>
                    <span class="stat-value">${tower.damage}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-name"><i class="fas fa-crosshairs"></i> Reichweite:</span>
                    <span class="stat-value">${tower.range}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-name"><i class="fas fa-coins"></i> Verkaufswert:</span>
                    <span class="stat-value">${Math.floor(tower.value * 0.7)}G</span>
                </div>
                ${this.getTowerSpecialStats(tower)}
            </div>
        `;
        
        // Popup anzeigen
        upgradeDiv.style.display = 'flex';
        upgradeDiv.classList.add('show');
        console.log('Upgrade popup should be visible now');
        
        // Klick außerhalb des Popups schließt es (nur einmal hinzufügen)
        const handleOutsideClick = (e) => {
            if (e.target === upgradeDiv) {
                this.hideTowerUpgrade();
                upgradeDiv.removeEventListener('click', handleOutsideClick);
            }
        };
        upgradeDiv.addEventListener('click', handleOutsideClick);
        
        const upgradeBtn = document.getElementById('upgradeBtn');
        const upgradeCost = Math.floor(tower.value * 0.5);
        upgradeBtn.innerHTML = `<i class="fas fa-arrow-up"></i><span>Upgrade (${upgradeCost}G)</span>`;
        upgradeBtn.disabled = this.money < upgradeCost;
        
        const sellBtn = document.getElementById('sellBtn');
        sellBtn.innerHTML = `<i class="fas fa-trash"></i><span>Verkaufen (${Math.floor(tower.value * 0.7)}G)</span>`;
    }
    
    getTowerIcon(type) {
        const icons = {
            basic: 'fa-bullseye',
            ice: 'fa-snowflake',
            fire: 'fa-fire',
            lightning: 'fa-bolt',
            poison: 'fa-skull-crossbones',
            sniper: 'fa-crosshairs',
            tesla: 'fa-zap'
        };
        return icons[type] || 'fa-bullseye';
    }
    
    getTowerSpecialStats(tower) {
        let specialStats = '';
        
        if (tower.type === 'ice' && tower.slow) {
            specialStats += `
                <div class="stat-row special">
                    <span class="stat-name"><i class="fas fa-hourglass-half"></i> Verlangsamung:</span>
                    <span class="stat-value">${Math.round((1 - tower.slow) * 100)}%</span>
                </div>`;
        }
        
        if (tower.type === 'fire' && tower.splash) {
            specialStats += `
                <div class="stat-row special">
                    <span class="stat-name"><i class="fas fa-explosion"></i> Splash-Radius:</span>
                    <span class="stat-value">${tower.splash}</span>
                </div>`;
        }
        
        if (tower.type === 'lightning' && tower.chain) {
            specialStats += `
                <div class="stat-row special">
                    <span class="stat-name"><i class="fas fa-link"></i> Chain-Anzahl:</span>
                    <span class="stat-value">${tower.chain}</span>
                </div>`;
        }
        
        if (tower.type === 'poison' && tower.poison) {
            specialStats += `
                <div class="stat-row special">
                    <span class="stat-name"><i class="fas fa-virus"></i> Gift-Schaden:</span>
                    <span class="stat-value">${tower.poison}/sec</span>
                </div>`;
        }
        
        if (tower.type === 'tesla' && tower.stun) {
            specialStats += `
                <div class="stat-row special">
                    <span class="stat-name"><i class="fas fa-pause"></i> Betäubung:</span>
                    <span class="stat-value">${Math.round(tower.stun/60 * 10)/10}sec</span>
                </div>`;
        }
        
        return specialStats;
    }
    
    hideTowerUpgrade() {
        console.log('hideTowerUpgrade called');
        const upgradeDiv = document.getElementById('towerUpgrade');
        if (upgradeDiv) {
            upgradeDiv.style.display = 'none';
            upgradeDiv.classList.remove('show');
            console.log('Upgrade popup hidden');
        }
        this.selectedTower = null;
    }
    
    upgradeTower() {
        if (!this.selectedTower) return;
        
        const upgradeCost = Math.floor(this.selectedTower.value * 0.5);
        if (this.money >= upgradeCost) {
            this.money -= upgradeCost;
            this.selectedTower.upgrade();
            
            // Update statistics
            this.sessionStats.upgrades++;
            this.sessionStats.goldSpent += upgradeCost;
            this.updateStatistic('upgrades', 1);
            this.updateStatistic('goldSpent', upgradeCost);
            
            this.updateUI();
            this.showTowerUpgrade(this.selectedTower);
        }
    }
    
    sellTower() {
        if (!this.selectedTower) return;
        
        const sellValue = Math.floor(this.selectedTower.value * 0.7);
        this.money += sellValue;
        
        // Update statistics
        this.sessionStats.towersSold++;
        this.sessionStats.goldEarned += sellValue;
        this.updateStatistic('towersSold', 1);
        this.updateStatistic('totalGold', sellValue);
        
        this.towers = this.towers.filter(tower => tower !== this.selectedTower);
        this.selectedTower = null;
        this.hideTowerUpgrade();
        this.updateUI();
    }
    
    toggleSpeed() {
        this.gameSpeed = this.gameSpeed === 1 ? 2 : this.gameSpeed === 2 ? 3 : 1;
        const speedBtn = document.getElementById('speedUp');
        speedBtn.textContent = `${this.gameSpeed}x Speed`;
        this.updateUI();
    }
    
    useAbility(abilityType) {
        const ability = this.specialAbilities[abilityType];
        if (ability.cooldown > 0) return;
        
        let cost = 0;
        let success = false;
        
        switch(abilityType) {
            case 'meteorStrike':
                cost = 50;
                if (this.money >= cost) {
                    this.meteorStrike();
                    success = true;
                }
                break;
            case 'freezeAll':
                cost = 30;
                if (this.money >= cost) {
                    this.freezeAllEnemies();
                    success = true;
                }
                break;
            case 'goldRush':
                cost = 100;
                if (this.money >= cost) {
                    this.goldRush();
                    success = true;
                }
                break;
            case 'timeWarp':
                cost = 80;
                if (this.money >= cost) {
                    this.timeWarp();
                    success = true;
                }
                break;
            case 'shieldBoost':
                cost = 60;
                if (this.money >= cost) {
                    this.shieldBoost();
                    success = true;
                }
                break;
            case 'damageBoost':
                cost = 70;
                if (this.money >= cost) {
                    this.damageBoost();
                    success = true;
                }
                break;
        }
        
        if (success) {
            this.money -= cost;
            ability.cooldown = ability.maxCooldown;
            
            // Update statistics
            this.sessionStats.abilitiesUsed++;
            this.sessionStats.goldSpent += cost;
            this.updateStatistic('abilitiesUsed', 1);
            this.updateStatistic('goldSpent', cost);
            
            this.updateUI();
        } else {
            this.showMessage('Nicht genug Geld!');
        }
    }
    
    meteorStrike() {
        // 3 zufällige Meteore auf dem Spielfeld
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                
                // Explosion erstellen
                this.createExplosion(x, y, 80, 100);
                
                // Schaden an Gegnern in der Nähe
                this.enemies.forEach(enemy => {
                    const distance = Math.sqrt((enemy.x - x) ** 2 + (enemy.y - y) ** 2);
                    if (distance <= 80) {
                        enemy.takeDamage(100);
                    }
                });
            }, i * 300);
        }
    }
    
    freezeAllEnemies() {
        this.enemies.forEach(enemy => {
            enemy.slowEffect = 0.1;
            enemy.slowDuration = 180; // 3 Sekunden
        });
        this.showMessage('Alle Gegner eingefroren!');
    }
    
    goldRush() {
        this.money += 100;
        this.goldEarned += 100;
        this.showMessage('+100 Gold Rush!', 'success');
        this.checkAchievements();
    }
    
    timeWarp() {
        this.activeEffects.timeWarp = true;
        this.showMessage('Time Warp aktiviert! Gegner verlangsamt!', 'info');
        
        // Alle Gegner verlangsamen
        this.enemies.forEach(enemy => {
            enemy.slowEffect = 0.3;
            enemy.slowDuration = 300; // 5 Sekunden
        });
        
        // Effekt nach 10 Sekunden beenden
        setTimeout(() => {
            this.activeEffects.timeWarp = false;
        }, 10000);
    }
    
    shieldBoost() {
        this.activeEffects.shieldBoost = true;
        this.lives += 5;
        this.showMessage('+5 Leben! Shield Boost aktiviert!', 'success');
        this.updateUI();
        
        // Temporärer Schutz vor Lebensverlust
        setTimeout(() => {
            this.activeEffects.shieldBoost = false;
        }, 15000);
    }
    
    damageBoost() {
        this.activeEffects.damageBoost = true;
        this.showMessage('Damage Boost! Doppelter Schaden für 10 Sekunden!', 'warning');
        
        // Effekt nach 10 Sekunden beenden
        setTimeout(() => {
            this.activeEffects.damageBoost = false;
        }, 10000);
    }
    
    showBossWarning() {
        const warning = document.getElementById('bossWarning');
        warning.style.display = 'block';
        
        setTimeout(() => {
            warning.style.display = 'none';
        }, 3000);
    }
    
    updateCombo(killValue) {
        const currentTime = Date.now();
        
        // Combo läuft ab nach 3 Sekunden ohne Kill
        if (currentTime - this.lastKillTime > 3000) {
            this.comboKills = 0;
            this.comboMultiplier = 1;
        }
        
        this.comboKills++;
        this.lastKillTime = currentTime;
        
        // Combo Multiplier erhöhen
        if (this.comboKills >= 5) this.comboMultiplier = 2;
        if (this.comboKills >= 10) this.comboMultiplier = 3;
        if (this.comboKills >= 20) this.comboMultiplier = 4;
        if (this.comboKills >= 30) this.comboMultiplier = 5;
        
        // Bonus Gold durch Combo
        const bonusGold = killValue * (this.comboMultiplier - 1);
        if (bonusGold > 0) {
            this.money += bonusGold;
            this.goldEarned += bonusGold;
        }
        
        // Combo Display aktualisieren
        this.updateComboDisplay();
        
        // Power-Up Chance bei hoher Combo
        if (this.comboKills >= 15 && Math.random() < 0.3) {
            this.spawnPowerUp();
        }
    }
    
    updateComboDisplay() {
        const comboDisplay = document.getElementById('comboDisplay');
        const comboValue = document.getElementById('comboValue');
        const comboKillsSpan = document.getElementById('comboKills');
        
        if (this.comboKills >= 3) {
            comboDisplay.style.display = 'block';
            comboValue.textContent = this.comboMultiplier;
            comboKillsSpan.textContent = this.comboKills;
        } else {
            comboDisplay.style.display = 'none';
        }
    }
    
    spawnPowerUp() {
        const powerUpNotification = document.getElementById('powerUpNotification');
        powerUpNotification.style.display = 'block';
        
        // Zufälliger Power-Up Effekt
        const powerUpTypes = ['money', 'ability_reset', 'temp_boost'];
        const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        switch(powerUpType) {
            case 'money':
                this.money += 50;
                this.goldEarned += 50;
                powerUpNotification.querySelector('.power-up-text').textContent = '+50 Bonus Gold!';
                break;
            case 'ability_reset':
                // Alle Abilities zurücksetzen
                Object.keys(this.specialAbilities).forEach(key => {
                    this.specialAbilities[key].cooldown = 0;
                });
                powerUpNotification.querySelector('.power-up-text').textContent = 'Alle Abilities zurückgesetzt!';
                break;
            case 'temp_boost':
                this.activeEffects.damageBoost = true;
                setTimeout(() => {
                    this.activeEffects.damageBoost = false;
                }, 5000);
                powerUpNotification.querySelector('.power-up-text').textContent = 'Temp Damage Boost!';
                break;
        }
        
        setTimeout(() => {
            powerUpNotification.style.display = 'none';
        }, 3000);
        
        this.updateUI();
    }
    
    createExplosion(x, y, radius, damage) {
        // Partikel-Explosion
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y, 'explosion'));
        }
    }
    
    checkAchievements() {
        const achievements = [
            { id: 'firstTower', condition: () => this.towersBuilt >= 1, message: 'Erster Tower gebaut!' },
            { id: 'tenTowers', condition: () => this.towersBuilt >= 10, message: '10 Tower gebaut!' },
            { id: 'hundredKills', condition: () => this.totalKills >= 100, message: '100 Gegner besiegt!' },
            { id: 'wave10', condition: () => this.wave >= 10, message: 'Welle 10 erreicht!' },
            { id: 'wave20', condition: () => this.wave >= 20, message: 'Welle 20 erreicht!' },
            { id: 'goldCollector', condition: () => this.goldEarned >= 500, message: '500 Gold gesammelt!' },
            { id: 'richPlayer', condition: () => this.money >= 1000, message: 'Millionär!' },
            { id: 'firstBoss', condition: () => this.wave >= 5, message: 'Erste Boss-Welle überstanden!' },
            { id: 'comboMaster', condition: () => this.comboMultiplier >= 3, message: 'Combo Master! x3 Multiplier!' },
            { id: 'powerUpCollector', condition: () => this.comboKills >= 15, message: 'Power-Up Sammler!' },
            { id: 'abilityMaster', condition: () => this.totalKills >= 50, message: 'Ability Master!' }
        ];
        
        achievements.forEach(achievement => {
            if (!this.achievements.includes(achievement.id) && achievement.condition()) {
                this.achievements.push(achievement.id);
                this.showAchievement(achievement.message);
            }
        });
    }
    
    setupMenuEventListeners() {
        // Hauptmenü Event Listeners
        const startGameBtn = document.getElementById('startGame');
        const howToPlayBtn = document.getElementById('howToPlay');
        const settingsBtn = document.getElementById('settings');
        const statisticsBtn = document.getElementById('statistics');
        
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startGameFromMenu());
        }
        
        if (howToPlayBtn) {
            howToPlayBtn.addEventListener('click', () => this.showHowToPlay());
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        if (statisticsBtn) {
            statisticsBtn.addEventListener('click', () => this.showStatistics());
        }

        const mapSelectionBtn = document.getElementById('mapSelection');
        if (mapSelectionBtn) {
            mapSelectionBtn.addEventListener('click', () => this.showMapSelection());
        }

        // Settings Modal Event Listeners
        this.setupSettingsEventListeners();        // Game Over Screen Event Listeners
        const playAgainBtn = document.getElementById('playAgain');
        const backToMenuBtn = document.getElementById('backToMenu');
        
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => this.restartGameFromGameOver());
        }
        
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => this.showMainMenu());
        }
    }
    
    startGameFromMenu() {
        const mainMenu = document.getElementById('mainMenu');
        const gameContainer = document.getElementById('gameContainer');
        
        if (mainMenu) mainMenu.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'block';
        
        // Canvas initialisieren falls nicht bereits geschehen
        if (!this.canvas) {
            this.initializeCanvas();
        }
        
        // Spiel zurücksetzen und starten
        this.restartGame();
        this.gamePaused = false;
        
        // Reset session statistics
        this.gameStartTime = Date.now();
        this.sessionStats = {
            kills: 0,
            towersBuilt: 0,
            goldEarned: 0,
            goldSpent: 0,
            towersSold: 0,
            upgrades: 0,
            abilitiesUsed: 0,
            currentWave: 1,
            currentScore: 0
        };
    }
    
    showMainMenu() {
        const mainMenu = document.getElementById('mainMenu');
        const gameContainer = document.getElementById('gameContainer');
        const gameOverScreen = document.getElementById('gameOverScreen');
        
        if (mainMenu) mainMenu.style.display = 'flex';
        if (gameContainer) gameContainer.style.display = 'none';
        if (gameOverScreen) gameOverScreen.style.display = 'none';
        
        // Spiel pausieren
        this.gamePaused = true;
    }

    setupSettingsEventListeners() {
        // Volume sliders
        const volumeSliders = ['masterVolume', 'sfxVolume', 'musicVolume'];
        volumeSliders.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    const volumeType = id; // masterVolume, sfxVolume, musicVolume
                    this.settings.audio[volumeType] = value;
                    
                    // Update display
                    const display = e.target.nextElementSibling;
                    if (display) display.textContent = value + '%';
                });
            }
        });

        // Checkboxes
        const checkboxSettings = [
            { id: 'shadows', category: 'graphics' },
            { id: 'animations', category: 'graphics' },
            { id: 'backgroundEffects', category: 'graphics' },
            { id: 'autoSave', category: 'gameplay' },
            { id: 'showFPS', category: 'gameplay' },
            { id: 'pauseOnFocusLoss', category: 'gameplay' },
            { id: 'confirmSell', category: 'gameplay' },
            { id: 'quickBuild', category: 'controls' },
            { id: 'rightClickSell', category: 'controls' }
        ];

        checkboxSettings.forEach(setting => {
            const checkbox = document.getElementById(setting.id);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.settings[setting.category][setting.id] = e.target.checked;
                    if (setting.id === 'showFPS') {
                        this.updateFPSDisplay();
                    }
                });
            }
        });

        // Select dropdowns
        const fpsSelect = document.getElementById('fpsLimit');
        if (fpsSelect) {
            fpsSelect.addEventListener('change', (e) => {
                this.settings.performance.fpsLimit = parseInt(e.target.value);
                this.applySettings();
            });
        }

        const particleSelect = document.getElementById('particleQuality');
        if (particleSelect) {
            particleSelect.addEventListener('change', (e) => {
                this.settings.performance.particleQuality = e.target.value;
            });
        }
    }

    showSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            // Load current settings into UI
            this.loadSettingsIntoUI();
            modal.style.display = 'flex';
        }
    }

    loadSettingsIntoUI() {
        // Load FPS setting
        const fpsSelect = document.getElementById('fpsLimit');
        if (fpsSelect) {
            fpsSelect.value = this.settings.performance.fpsLimit;
        }

        // Load particle quality
        const particleSelect = document.getElementById('particleQuality');
        if (particleSelect) {
            particleSelect.value = this.settings.performance.particleQuality;
        }

        // Load volume settings
        this.updateVolumeDisplays();

        // Load checkbox settings
        const checkboxes = [
            'shadows', 'animations', 'backgroundEffects',
            'autoSave', 'showFPS', 'pauseOnFocusLoss', 'confirmSell',
            'quickBuild', 'rightClickSell'
        ];

        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                let value = false;
                if (this.settings.graphics[id] !== undefined) value = this.settings.graphics[id];
                else if (this.settings.gameplay[id] !== undefined) value = this.settings.gameplay[id];
                else if (this.settings.controls[id] !== undefined) value = this.settings.controls[id];
                
                checkbox.checked = value;
            }
        });
    }
    
    showHowToPlay() {
        const modal = document.getElementById('howToPlayModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    showStatistics() {
        const modal = document.getElementById('statisticsModal');
        if (modal) {
            this.updateStatisticsDisplay();
            modal.style.display = 'flex';
        }
    }

    updateStatisticsDisplay() {
        // Update highlight cards
        document.getElementById('statsHighestWave').textContent = this.statistics.highestWave;
        document.getElementById('statsTotalGames').textContent = this.statistics.totalGames;
        
        // Format play time
        const hours = Math.floor(this.statistics.totalPlayTime / 3600000);
        const minutes = Math.floor((this.statistics.totalPlayTime % 3600000) / 60000);
        document.getElementById('statsTotalPlayTime').textContent = `${hours}h ${minutes}m`;

        // Update detailed stats
        document.getElementById('statsTotalKills').textContent = this.statistics.totalKills.toLocaleString();
        document.getElementById('statsTowersBuilt').textContent = this.statistics.towersBuilt.toLocaleString();
        document.getElementById('statsUpgrades').textContent = this.statistics.upgrades.toLocaleString();
        document.getElementById('statsAbilitiesUsed').textContent = this.statistics.abilitiesUsed.toLocaleString();
        document.getElementById('statsTotalGold').textContent = this.statistics.totalGold.toLocaleString();
        document.getElementById('statsGoldSpent').textContent = this.statistics.goldSpent.toLocaleString();
        document.getElementById('statsTowersSold').textContent = this.statistics.towersSold.toLocaleString();
        document.getElementById('statsHighestScore').textContent = this.statistics.highestScore.toLocaleString();

        // Update averages
        const totalGames = Math.max(1, this.statistics.totalGames);
        document.getElementById('statsAvgWaves').textContent = Math.round(this.statistics.highestWave / totalGames);
        document.getElementById('statsAvgKills').textContent = Math.round(this.statistics.totalKills / totalGames);
        document.getElementById('statsAvgGold').textContent = Math.round(this.statistics.totalGold / totalGames).toLocaleString();
        
        const avgPlayTimeMinutes = Math.round(this.statistics.totalPlayTime / totalGames / 60000);
        document.getElementById('statsAvgPlayTime').textContent = `${avgPlayTimeMinutes}m`;

        // Update achievements
        this.updateAchievementsDisplay();
    }

    showMapSelection() {
        const modal = document.getElementById('mapSelectionModal');
        if (modal) {
            this.updateMapSelectionDisplay();
            modal.style.display = 'flex';
        }
    }

    updateMapSelectionDisplay() {
        const mapsGrid = document.getElementById('mapsGrid');
        const selectedMapName = document.getElementById('selectedMapName');
        const selectedMapDescription = document.getElementById('selectedMapDescription');
        
        if (!mapsGrid) return;
        
        // Update current selection info
        const currentMap = this.maps[this.currentMapId];
        if (selectedMapName && selectedMapDescription && currentMap) {
            selectedMapName.textContent = currentMap.name;
            selectedMapDescription.textContent = currentMap.description;
        }
        
        // Clear and rebuild maps grid
        mapsGrid.innerHTML = '';
        
        Object.values(this.maps).forEach(map => {
            const mapCard = document.createElement('div');
            mapCard.className = `map-card ${map.id === this.currentMapId ? 'selected' : ''} ${!map.unlocked ? 'locked' : ''}`;
            mapCard.dataset.mapId = map.id;
            
            const difficultyClass = {
                'Einfach': 'difficulty-easy',
                'Mittel': 'difficulty-medium', 
                'Schwer': 'difficulty-hard',
                'Extrem': 'difficulty-extreme'
            }[map.difficulty] || 'difficulty-easy';
            
            mapCard.innerHTML = `
                <div class="map-preview" style="background: ${map.background};">
                    <canvas class="map-path-preview" width="200" height="80"></canvas>
                </div>
                <div class="map-info">
                    <div class="map-name">${map.name}</div>
                    <div class="map-description">${map.description}</div>
                    <div class="map-difficulty ${difficultyClass}">${map.difficulty}</div>
                </div>
                ${!map.unlocked ? `
                    <div class="map-lock-overlay">
                        <div class="map-lock-content">
                            <div class="map-lock-icon">
                                <i class="fas fa-lock"></i>
                            </div>
                            <div class="map-unlock-requirement">
                                Erreiche Welle ${map.unlockCondition ? map.unlockCondition.toString().match(/\d+/)?.[0] || '?' : '?'}
                            </div>
                        </div>
                    </div>
                ` : ''}
            `;
            
            // Draw mini path preview
            const canvas = mapCard.querySelector('.map-path-preview');
            if (canvas && map.unlocked) {
                this.drawMiniPath(canvas, map.path);
            }
            
            // Add click handler for unlocked maps
            if (map.unlocked) {
                mapCard.addEventListener('click', () => {
                    // Remove selection from other cards
                    document.querySelectorAll('.map-card').forEach(card => {
                        card.classList.remove('selected');
                    });
                    
                    // Select this card
                    mapCard.classList.add('selected');
                    
                    // Update selection info
                    if (selectedMapName && selectedMapDescription) {
                        selectedMapName.textContent = map.name;
                        selectedMapDescription.textContent = map.description;
                    }
                    
                    // Store temporary selection
                    this.tempSelectedMapId = map.id;
                });
            }
            
            mapsGrid.appendChild(mapCard);
        });
        
        // Initialize temp selection
        this.tempSelectedMapId = this.currentMapId;
    }

    drawMiniPath(canvas, path) {
        const ctx = canvas.getContext('2d');
        const scale = 0.2; // Scale down the path coordinates
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (path.length < 2) return;
        
        // Draw path
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(path[0].x * scale, path[0].y * scale);
        
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x * scale, path[i].y * scale);
        }
        
        ctx.stroke();
        
        // Draw start point
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(path[0].x * scale, path[0].y * scale, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw end point
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(path[path.length - 1].x * scale, path[path.length - 1].y * scale, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    updateAchievementsDisplay() {
        const achievementsList = document.getElementById('achievementsList');
        const achievements = this.getAchievements();
        
        achievementsList.innerHTML = '';
        
        achievements.forEach(achievement => {
            const isUnlocked = this.statistics.achievements[achievement.id];
            const achievementEl = document.createElement('div');
            achievementEl.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
            
            achievementEl.innerHTML = `
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-content">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            `;
            
            achievementsList.appendChild(achievementEl);
        });
    }
    
    getGameStatistics() {
        // Grundlegende Statistiken (könnten in localStorage gespeichert werden)
        return {
            totalGames: localStorage.getItem('rushRoyal_totalGames') || 0,
            highestWave: localStorage.getItem('rushRoyal_highestWave') || 1,
            totalKills: localStorage.getItem('rushRoyal_totalKills') || 0,
            totalGold: localStorage.getItem('rushRoyal_totalGold') || 0
        };
    }
    
    updateStatistics() {
        // Statistiken in localStorage aktualisieren
        const currentGames = parseInt(localStorage.getItem('rushRoyal_totalGames') || '0');
        const currentHighest = parseInt(localStorage.getItem('rushRoyal_highestWave') || '1');
        const currentKills = parseInt(localStorage.getItem('rushRoyal_totalKills') || '0');
        const currentGold = parseInt(localStorage.getItem('rushRoyal_totalGold') || '0');
        
        localStorage.setItem('rushRoyal_totalGames', (currentGames + 1).toString());
        localStorage.setItem('rushRoyal_highestWave', Math.max(currentHighest, this.wave).toString());
        localStorage.setItem('rushRoyal_totalKills', (currentKills + this.totalKills).toString());
        localStorage.setItem('rushRoyal_totalGold', (currentGold + this.goldEarned).toString());
    }
    
    showAchievement(message) {
        const achievementEl = document.getElementById('currentAchievement');
        const textEl = achievementEl.querySelector('.achievement-text');
        
        if (textEl) {
            textEl.textContent = message;
        } else {
            achievementEl.innerHTML = `<i class="fas fa-medal"></i><span class="achievement-text">${message}</span>`;
        }
        
        achievementEl.classList.add('show');
        
        setTimeout(() => {
            achievementEl.classList.remove('show');
        }, 3000);
    }
    
    gameLoop(currentTime = 0) {
        // FPS limiting
        if (this.targetFrameTime && currentTime - this.lastFrameTime < this.targetFrameTime) {
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }

        // FPS calculation
        if (this.settings.gameplay.showFPS) {
            this.fpsCounter++;
            if (currentTime - this.lastFpsUpdate >= 1000) {
                this.currentFps = this.fpsCounter;
                this.fpsCounter = 0;
                this.lastFpsUpdate = currentTime;
                
                const fpsDisplay = document.getElementById('fpsDisplay');
                if (fpsDisplay) {
                    fpsDisplay.textContent = `FPS: ${this.currentFps}`;
                }
            }
        }

        this.lastFrameTime = currentTime;

        if (!this.gamePaused) {
            this.update();
        }
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // Das Spiel sollte immer laufen, außer bei Game Over
        if (this.lives <= 0) return;
        
        // Cooldowns updaten
        Object.values(this.specialAbilities).forEach(ability => {
            if (ability.cooldown > 0) ability.cooldown--;
        });
        
        // Game Speed anwenden
        const speedMultiplier = this.gameSpeed;
        
        // Gegner updaten (nur wenn welche vorhanden)
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Mehrfache Updates für höhere Geschwindigkeit
            for (let s = 0; s < speedMultiplier; s++) {
                enemy.update();
            }
            
            if (enemy.reachedEnd) {
                this.lives--;
                this.enemies.splice(i, 1);
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            } else if (enemy.health <= 0) {
                const baseReward = enemy.reward;
                
                // Combo-System anwenden
                this.updateCombo(baseReward);
                
                // Geld mit Combo-Bonus
                this.money += baseReward;
                this.goldEarned += baseReward;
                this.score += enemy.points * this.comboMultiplier;
                this.totalKills++;
                
                // Update statistics
                this.sessionStats.kills++;
                this.sessionStats.goldEarned += baseReward;
                this.updateStatistic('totalKills', 1);
                this.updateStatistic('totalGold', baseReward);
                
                this.enemies.splice(i, 1);
                this.updateUI();
                this.checkAchievements();
                
                // Partikel-Effekt beim Tod
                this.particles.push(new Particle(enemy.x, enemy.y, 'death'));
                
                // Screen Shake bei Boss Kill
                if (enemy.type === 'boss') {
                    this.screenShake = 10;
                    this.showMessage(`Boss besiegt! +${baseReward * this.comboMultiplier} Punkte!`, 'success');
                }
            }
        }
        
        // Tower updaten und schießen lassen
        this.towers.forEach(tower => {
            for (let s = 0; s < speedMultiplier; s++) {
                tower.update(this.enemies, this.projectiles);
            }
        });
        
        // Projektile updaten
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            for (let s = 0; s < speedMultiplier; s++) {
                projectile.update();
            }
            
            if (projectile.hasHit || projectile.isOutOfBounds(this.canvas.width, this.canvas.height)) {
                this.projectiles.splice(i, 1);
            }
        }
        
        // Partikel updaten
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Überprüfen ob Welle beendet - Verwende die gleiche Berechnung wie in startWave
        const expectedEnemies = this.enemiesPerWave + Math.floor(this.wave * 1.5) + Math.floor(this.wave / 2);
        if (this.waveInProgress && this.enemies.length === 0 && this.enemiesSpawned >= expectedEnemies) {
            this.completeWave();
        }
    }
    
    completeWave() {
        this.waveInProgress = false;
        this.wave++;
        
        // Progressive Wellen-Belohnung
        const waveBonus = 25 + Math.floor(this.wave * 2);
        this.money += waveBonus;
        this.goldEarned += waveBonus;
        
        // Zeige Wellen-Abschluss-Information
        this.showWaveCompleteMessage();
        
        this.updateUI();
        this.checkAchievements();
        document.getElementById('startWave').disabled = false;
        
        // Auto-Wave: Automatisch nächste Welle starten
        if (this.autoWaveEnabled && !this.gamePaused) {
            this.startAutoWaveCountdown();
        }
    }
    
    showWaveCompleteMessage() {
        const nextWaveEnemies = this.enemiesPerWave + Math.floor((this.wave + 1) * 1.5) + Math.floor((this.wave + 1) / 2);
        const isBossWave = (this.wave + 1) % 5 === 0;
        
        let message = `Welle ${this.wave - 1} abgeschlossen! `;
        
        if (isBossWave) {
            message += `⚠️ Nächste Welle ist eine BOSS-WELLE mit ${nextWaveEnemies} Feinden!`;
            this.showMessage(message, 'warning');
        } else if (this.wave >= 10) {
            message += `💪 Nächste Welle: ${nextWaveEnemies} verstärkte Feinde (${this.wave * 15}% stärker)`;
            this.showMessage(message, 'success');
        } else {
            message += `➡️ Nächste Welle: ${nextWaveEnemies} Feinde`;
            this.showMessage(message, 'success');
        }
    }
    
    draw() {
        // Screen Shake Effekt
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.save();
            this.ctx.translate(shakeX, shakeY);
            this.screenShake *= 0.9; // Abklingen lassen
            if (this.screenShake < 0.1) this.screenShake = 0;
        }
        
        // Canvas leeren
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Pfad zeichnen
        this.drawPath();
        
        // Tower zeichnen
        this.towers.forEach(tower => {
            tower.draw(this.ctx);
            
            // Reichweite des ausgewählten Towers anzeigen
            if (tower === this.selectedTower) {
                this.ctx.beginPath();
                this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
        
        // Gegner zeichnen
        this.enemies.forEach(enemy => {
            enemy.draw(this.ctx);
        });
        
        // Projektile zeichnen
        this.projectiles.forEach(projectile => {
            projectile.draw(this.ctx);
        });
        
        // Partikel zeichnen
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
        
        // Geist-Tower für Platzierung
        if (this.selectedTowerType) {
            this.drawGhostTower();
        }
        
        // Debug: Mausposition anzeigen (optional)
        this.drawMouseDebug();
        
        // Screen Shake zurücksetzen
        if (this.screenShake > 0) {
            this.ctx.restore();
        }
    }
    
    drawPath() {
        if (!this.ctx) return;
        
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 30;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        
        this.ctx.stroke();
        
        // Start- und Endpunkte markieren
        this.ctx.fillStyle = '#00FF00';
        this.ctx.beginPath();
        this.ctx.arc(this.path[0].x, this.path[0].y, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(this.path[this.path.length - 1].x, this.path[this.path.length - 1].y, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawGhostTower() {
        if (this.isValidTowerPosition(this.mouseX, this.mouseY)) {
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = this.getTowerColor(this.selectedTowerType);
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 20, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }
    
    getTowerColor(type) {
        const colors = {
            basic: '#8B4513',
            ice: '#87CEEB',
            fire: '#FF4500',
            lightning: '#FFD700',
            poison: '#9ACD32',
            sniper: '#2F4F4F',
            tesla: '#4169E1'
        };
        return colors[type];
    }
    
    drawMouseDebug() {
        // Kleine rote Markierung an der Mausposition für Debugging
        if (this.mouseX && this.mouseY) {
            this.ctx.fillStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(this.mouseX, this.mouseY, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Koordinaten anzeigen
            this.ctx.fillStyle = 'black';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`${Math.round(this.mouseX)}, ${Math.round(this.mouseY)}`, this.mouseX + 10, this.mouseY - 10);
        }
    }
    
    updateUI() {
        // Sicherstellen, dass das DOM verfügbar ist
        if (!document.body) {
            return;
        }
        
        // Sichere DOM-Element-Updates mit Existenz-Prüfung
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        };
        
        updateElement('lives', this.lives);
        updateElement('money', this.money);
        updateElement('score', this.score);
        updateElement('wave', this.wave);
        updateElement('gameSpeed', `${this.gameSpeed}x`);
        updateElement('currentWave', this.wave);
        
        // Nächste Welle Vorschau (mit Fehlerbehandlung)
        try {
            this.updateWavePreview();
        } catch (error) {
            console.warn('Error updating wave preview:', error);
        }
        
        // Tower-Cards updaten
        document.querySelectorAll('.tower-card').forEach(card => {
            const cost = parseInt(card.dataset.cost);
            if (this.money < cost) {
                card.disabled = true;
                card.style.opacity = '0.5';
                card.style.cursor = 'not-allowed';
            } else {
                card.disabled = false;
                card.style.opacity = '1';
                card.style.cursor = 'pointer';
            }
        });
        
        // Ability-Buttons updaten (mit Fehlerbehandlung)
        try {
            Object.keys(this.specialAbilities).forEach(abilityType => {
                const ability = this.specialAbilities[abilityType];
                const btn = document.getElementById(abilityType);
                if (btn) {
                    btn.disabled = ability.cooldown > 0;
                    if (ability.cooldown > 0) {
                        btn.textContent = btn.textContent.replace(/\d+/, Math.ceil(ability.cooldown / 60));
                    }
                }
            });
        } catch (error) {
            console.warn('Error updating ability buttons:', error);
        }
    }
    
    showMessage(message, type = 'error') {
        // Temporäre Nachricht anzeigen
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        
        let backgroundColor;
        switch(type) {
            case 'success':
                backgroundColor = 'rgba(16, 185, 129, 0.9)'; // Grün
                break;
            case 'info':
                backgroundColor = 'rgba(59, 130, 246, 0.9)'; // Blau
                break;
            case 'warning':
                backgroundColor = 'rgba(245, 158, 11, 0.9)'; // Orange
                break;
            default:
                backgroundColor = 'rgba(239, 68, 68, 0.9)'; // Rot
        }
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${backgroundColor};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: messageSlideIn 0.3s ease-out;
        `;
        
        // Animation CSS hinzufügen falls noch nicht vorhanden
        if (!document.getElementById('messageAnimation')) {
            const style = document.createElement('style');
            style.id = 'messageAnimation';
            style.textContent = `
                @keyframes messageSlideIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'messageSlideIn 0.3s ease-out reverse';
            setTimeout(() => messageDiv.remove(), 300);
        }, 2000);
    }
    
    startAutoWaveCountdown() {
        // Alle vorherigen Auto-Wave Timer löschen
        if (this.autoWaveTimer) {
            clearTimeout(this.autoWaveTimer);
        }
        if (this.autoWaveInterval) {
            clearInterval(this.autoWaveInterval);
        }
        
        const startBtn = document.getElementById('startWave');
        startBtn.innerHTML = '<i class="fas fa-clock"></i><span>Auto in 3s...</span>';
        startBtn.disabled = true;
        
        let countdown = 3;
        this.autoWaveInterval = setInterval(() => {
            if (this.gamePaused || !this.autoWaveEnabled) {
                clearInterval(this.autoWaveInterval);
                startBtn.innerHTML = '<i class="fas fa-play"></i><span>Nächste Welle</span>';
                startBtn.disabled = false;
                return;
            }
            
            countdown--;
            if (countdown > 0) {
                startBtn.innerHTML = `<i class="fas fa-clock"></i><span>Auto in ${countdown}s...</span>`;
            } else {
                clearInterval(this.autoWaveInterval);
                startBtn.innerHTML = '<i class="fas fa-play"></i><span>Nächste Welle</span>';
            }
        }, 1000);
        
        this.autoWaveTimer = setTimeout(() => {
            if (this.autoWaveEnabled && !this.waveInProgress && !this.gamePaused) {
                this.startWave();
            } else {
                startBtn.innerHTML = '<i class="fas fa-play"></i><span>Nächste Welle</span>';
                startBtn.disabled = false;
            }
        }, 3000);
    }
    
    updateWavePreview() {
        const nextWave = this.wave + 1;
        const nextWaveEnemies = this.enemiesPerWave + Math.floor(nextWave * 1.5) + Math.floor(nextWave / 2);
        const isBossWave = nextWave % 5 === 0;
        
        // Update aktuelle Wellen-Information
        const currentWaveText = document.querySelector('.wave-text');
        if (currentWaveText && this.waveInProgress) {
            const currentEnemies = this.enemiesPerWave + Math.floor(this.wave * 1.5) + Math.floor((this.wave - 1) / 2);
            const remaining = currentEnemies - this.enemies.filter(e => e.health <= 0).length;
            currentWaveText.innerHTML = `Welle ${this.wave} - ${remaining}/${currentEnemies} Feinde`;
        } else if (currentWaveText) {
            let difficultyIndicator = '';
            if (this.wave >= 20) difficultyIndicator = ' ⚡ EXTREM';
            else if (this.wave >= 15) difficultyIndicator = ' � SEHR SCHWER';
            else if (this.wave >= 10) difficultyIndicator = ' ⚠️ SCHWER';
            else if (this.wave >= 5) difficultyIndicator = ' 📈 MITTEL';
            
            currentWaveText.innerHTML = `Welle <span id="currentWave">${this.wave}</span>${difficultyIndicator}`;
        }
        
        // Berechne voraussichtliche Gegnertypen für nächste Welle
        let previewText = `Nächste Welle ${nextWave}: ${nextWaveEnemies} Feinde`;
        
        if (isBossWave) {
            previewText += ' 👑 BOSS';
        } else {
            if (nextWave >= 20) previewText += ' ⚡ EXTREM';
            else if (nextWave >= 15) previewText += ' 🔥 SEHR SCHWER';
            else if (nextWave >= 10) previewText += ' ⚠️ SCHWER';
            else if (nextWave >= 5) previewText += ' 📈 MITTEL';
        }
        
        // Update den Start-Button Text
        const startBtn = document.getElementById('startWave');
        if (!this.waveInProgress && startBtn && !startBtn.disabled) {
            startBtn.title = previewText;
        }
        
        // Erstelle ein Vorschau-Element falls es nicht existiert
        let previewElement = document.getElementById('wavePreview');
        if (!previewElement) {
            previewElement = document.createElement('div');
            previewElement.id = 'wavePreview';
            previewElement.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                border: 1px solid #444;
                z-index: 100;
            `;
            document.body.appendChild(previewElement);
        }
        
        if (previewElement) {
            previewElement.textContent = previewText;
            
            // Spezielle Farben für verschiedene Schwierigkeitsgrade
            if (isBossWave) {
                previewElement.style.background = 'rgba(128, 0, 128, 0.9)';
                previewElement.style.border = '2px solid #ff4444';
            } else if (nextWave >= 15) {
                previewElement.style.background = 'rgba(255, 69, 0, 0.9)';
            } else if (nextWave >= 10) {
                previewElement.style.background = 'rgba(255, 140, 0, 0.9)';
            } else {
                previewElement.style.background = 'rgba(0, 0, 0, 0.8)';
                previewElement.style.border = '1px solid #444';
            }
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Update session end statistics
        const playTime = Date.now() - this.gameStartTime;
        this.updateStatistic('totalGames', 1);
        this.updateStatistic('totalPlayTime', playTime);
        
        if (this.wave > this.statistics.highestWave) {
            this.statistics.highestWave = this.wave;
        }
        
        if (this.score > this.statistics.highestScore) {
            this.statistics.highestScore = this.score;
        }
        
        this.saveStatistics();
        this.checkAchievements();
        this.checkMapUnlocks();
        
        this.updateStatistics();
        
        // Zeige den neuen Game Over Screen
        this.showGameOverScreen();
    }
    
    showGameOverScreen() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        
        if (gameOverScreen) {
            // Statistiken aktualisieren
            const finalWave = document.getElementById('finalWave');
            const finalScore = document.getElementById('finalScore');
            const finalGold = document.getElementById('finalGold');
            const finalKills = document.getElementById('finalKills');
            
            if (finalWave) finalWave.textContent = this.wave;
            if (finalScore) finalScore.textContent = this.score.toLocaleString();
            if (finalGold) finalGold.textContent = this.goldEarned.toLocaleString();
            if (finalKills) finalKills.textContent = this.totalKills.toLocaleString();
            
            gameOverScreen.style.display = 'flex';
            
            // Animation für den Game Over Screen
            setTimeout(() => {
                gameOverScreen.classList.add('show');
            }, 100);
        } else {
            // Fallback zur alten Methode
            const gameOverDiv = document.createElement('div');
            gameOverDiv.className = 'game-over';
            gameOverDiv.innerHTML = `
                <div class="game-over-content">
                    <h2>Game Over!</h2>
                    <p>Welle erreicht: ${this.wave}</p>
                    <p>Endpunktzahl: ${this.score}</p>
                    <button onclick="game.restartGame(); this.parentElement.parentElement.remove();" class="control-btn">
                        Nochmal spielen
                    </button>
                </div>
            `;
            document.body.appendChild(gameOverDiv);
        }
    }
    
    restartGameFromGameOver() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        if (gameOverScreen) {
            gameOverScreen.style.display = 'none';
        }
        this.restartGame();
    }
}

class Tower {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = 1;
        this.size = 20;
        this.lastShot = 0;
        
        this.setStats();
    }
    
    setStats() {
        const stats = {
            basic: { damage: 10, range: 80, speed: 1000, value: 20 },
            ice: { damage: 5, range: 90, speed: 800, value: 40, slow: 0.5 },
            fire: { damage: 15, range: 70, speed: 1200, value: 60, splash: 30 },
            lightning: { damage: 25, range: 100, speed: 1500, value: 100, chain: 3 },
            poison: { damage: 8, range: 85, speed: 900, value: 80, poison: 3 },
            sniper: { damage: 50, range: 150, speed: 2000, value: 120 },
            tesla: { damage: 30, range: 120, speed: 800, value: 150, stun: 60 }
        };
        
        const baseStat = stats[this.type];
        this.damage = baseStat.damage * this.level;
        this.range = baseStat.range + (this.level - 1) * 10;
        this.speed = baseStat.speed;
        this.value = baseStat.value * this.level;
        this.slow = baseStat.slow;
        this.splash = baseStat.splash;
        this.chain = baseStat.chain;
        this.poison = baseStat.poison;
        this.stun = baseStat.stun;
    }
    
    upgrade() {
        this.level++;
        this.setStats();
    }
    
    update(enemies, projectiles) {
        const now = Date.now();
        if (now - this.lastShot < this.speed) return;
        
        // Nächsten Gegner in Reichweite finden
        let target = null;
        let closestDistance = Infinity;
        
        for (let enemy of enemies) {
            const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
            if (distance <= this.range && distance < closestDistance) {
                closestDistance = distance;
                target = enemy;
            }
        }
        
        if (target) {
            projectiles.push(new Projectile(this.x, this.y, target, this));
            this.lastShot = now;
        }
    }
    
    draw(ctx) {
        // Tower-Basis
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Level-Anzeige
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.level, this.x, this.y + 4);
    }
    
    getColor() {
        const colors = {
            basic: '#8B4513',
            ice: '#87CEEB',
            fire: '#FF4500',
            lightning: '#FFD700',
            poison: '#9ACD32',
            sniper: '#2F4F4F',
            tesla: '#4169E1'
        };
        return colors[this.type];
    }
}

class Enemy {
    constructor(path, type, wave) {
        this.path = path;
        this.type = type;
        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        this.vx = 0; // Geschwindigkeitsvektor X
        this.vy = 0; // Geschwindigkeitsvektor Y
        this.reachedEnd = false;
        this.slowEffect = 1;
        this.slowDuration = 0;
        this.poisonDamage = 0;
        this.poisonDuration = 0;
        this.stunDuration = 0;
        
        this.setStats(wave);
    }
    
    setStats(wave) {
        const baseStats = {
            basic: { health: 20, speed: 1, reward: 5, points: 10, size: 8 },
            fast: { health: 10, speed: 2, reward: 8, points: 15, size: 6 },
            tank: { health: 80, speed: 0.5, reward: 15, points: 25, size: 12 },
            boss: { health: 200, speed: 0.8, reward: 50, points: 100, size: 16 }
        };
        
        const stats = baseStats[this.type];
        
        // Progressive Skalierung mit jeder Welle
        const waveScaling = 1 + (wave - 1) * 0.15; // 15% Stärke-Zuwachs pro Welle
        const healthScaling = 1 + (wave - 1) * 0.25; // 25% Gesundheits-Zuwachs pro Welle
        const speedScaling = Math.min(1 + (wave - 1) * 0.05, 2); // Max 2x Geschwindigkeit
        
        // Basis-Werte mit progressiver Skalierung
        this.maxHealth = Math.floor(stats.health * healthScaling + wave * 3);
        this.health = this.maxHealth;
        this.baseSpeed = stats.speed * speedScaling;
        this.speed = this.baseSpeed;
        
        // Belohnungen steigen auch mit der Schwierigkeit
        this.reward = Math.floor(stats.reward * waveScaling);
        this.points = Math.floor(stats.points * waveScaling);
        this.size = stats.size;
        
        // Spezielle Bonus-Eigenschaften für höhere Wellen
        if (wave >= 10) {
            // Ab Welle 10: Alle Feinde erhalten Bonus-Gesundheit
            this.maxHealth = Math.floor(this.maxHealth * 1.3);
            this.health = this.maxHealth;
        }
        
        if (wave >= 15) {
            // Ab Welle 15: Zusätzliche Geschwindigkeit
            this.baseSpeed *= 1.2;
            this.speed = this.baseSpeed;
        }
        
        if (wave >= 20) {
            // Ab Welle 20: Feinde werden größer und noch stärker
            this.maxHealth = Math.floor(this.maxHealth * 1.5);
            this.health = this.maxHealth;
            this.size *= 1.1;
            this.reward = Math.floor(this.reward * 1.5);
            this.points = Math.floor(this.points * 1.5);
        }
    }
    
    update() {
        // Stun-Effekt - Gegner kann sich nicht bewegen
        if (this.stunDuration > 0) {
            this.stunDuration--;
            return;
        }
        
        // Poison-Effekt
        if (this.poisonDuration > 0) {
            this.poisonDuration--;
            if (this.poisonDuration % 30 === 0) { // Schaden alle 0.5 Sekunden
                this.health -= this.poisonDamage;
            }
        }
        
        // Slow-Effekt
        if (this.slowDuration > 0) {
            this.slowDuration--;
            this.speed = this.baseSpeed * this.slowEffect;
        } else {
            this.speed = this.baseSpeed;
        }
        
        if (this.pathIndex >= this.path.length - 1) {
            this.reachedEnd = true;
            return;
        }
        
        const target = this.path[this.pathIndex + 1];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            this.pathIndex++;
        } else {
            // Geschwindigkeitsvektoren für Projektil-Vorhersage speichern
            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
            
            this.x += this.vx;
            this.y += this.vy;
        }
    }
    
    takeDamage(damage, effects = {}) {
        this.health -= damage;
        
        if (effects.slow) {
            this.slowEffect = effects.slow;
            this.slowDuration = 120; // 2 Sekunden bei 60 FPS
        }
        
        if (effects.poison) {
            this.poisonDamage = effects.poison;
            this.poisonDuration = 300; // 5 Sekunden
        }
        
        if (effects.stun) {
            this.stunDuration = effects.stun;
        }
    }
    
    draw(ctx) {
        // Gegner-Körper
        ctx.fillStyle = this.getColor();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Gesundheitsbalken
        const barWidth = this.size * 2;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 8, barWidth, barHeight);
        
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 8, barWidth * healthPercent, barHeight);
        
        // Slow-Effekt anzeigen
        if (this.slowDuration > 0) {
            ctx.strokeStyle = '#87CEEB';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Poison-Effekt anzeigen
        if (this.poisonDuration > 0) {
            ctx.strokeStyle = '#9ACD32';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Stun-Effekt anzeigen
        if (this.stunDuration > 0) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
    
    getColor() {
        const colors = {
            basic: '#FF6B6B',
            fast: '#4ECDC4',
            tank: '#45B7D1',
            boss: '#96CEB4'
        };
        return colors[this.type];
    }
}

class Projectile {
    constructor(x, y, target, tower) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.tower = tower;
        this.speed = 8; // Erhöhte Geschwindigkeit
        this.hasHit = false;
        this.maxLifetime = 120; // Maximale Lebensdauer in Frames
        this.lifetime = 0;
        
        // Initiale Richtung zum Ziel
        this.updateDirection();
    }
    
    updateDirection() {
        if (!this.target || this.target.health <= 0) {
            return;
        }
        
        // Vorhersage der Zielposition basierend auf Geschwindigkeit
        const predictedX = this.target.x + this.target.vx * 10; // Vorhersage für 10 Frames
        const predictedY = this.target.y + this.target.vy * 10;
        
        const dx = predictedX - this.x;
        const dy = predictedY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.vx = (dx / distance) * this.speed;
            this.vy = (dy / distance) * this.speed;
        }
    }
    
    update() {
        if (this.hasHit) return;
        
        this.lifetime++;
        
        // Projektil zu alt - automatisch entfernen
        if (this.lifetime > this.maxLifetime) {
            this.hasHit = true;
            return;
        }
        
        // Ziel ist tot oder nicht mehr vorhanden
        if (!this.target || this.target.health <= 0) {
            this.hasHit = true;
            return;
        }
        
        // Richtung alle paar Frames aktualisieren für besseres Tracking
        if (this.lifetime % 3 === 0) {
            this.updateDirection();
        }
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Kollisionserkennung mit größerem Toleranzbereich
        const distance = Math.sqrt((this.x - this.target.x) ** 2 + (this.y - this.target.y) ** 2);
        
        if (distance < this.target.size + 5) { // Größerer Kollisionsbereich
            this.hit();
        }
    }
    
    hit() {
        if (this.hasHit || !this.target) return;
        
        this.hasHit = true;
        
        const effects = {};
        
        // Tower-spezifische Effekte
        if (this.tower.type === 'ice') {
            effects.slow = this.tower.slow;
        }
        
        if (this.tower.type === 'poison') {
            effects.poison = this.tower.poison;
        }
        
        if (this.tower.type === 'tesla') {
            effects.stun = this.tower.stun;
        }
        
        // Damage Boost berücksichtigen
        let finalDamage = this.tower.damage;
        if (game.activeEffects.damageBoost) {
            finalDamage *= 2;
        }
        
        this.target.takeDamage(finalDamage, effects);
        
        // Splash-Schaden (Fire Tower)
        if (this.tower.type === 'fire' && this.tower.splash) {
            game.enemies.forEach(enemy => {
                if (enemy !== this.target) {
                    const distance = Math.sqrt((enemy.x - this.target.x) ** 2 + (enemy.y - this.target.y) ** 2);
                    if (distance <= this.tower.splash) {
                        let splashDamage = finalDamage * 0.5;
                        enemy.takeDamage(splashDamage);
                    }
                }
            });
        }
        
        // Chain Lightning (Lightning Tower)
        if (this.tower.type === 'lightning' && this.tower.chain) {
            this.chainLightning(this.target, this.tower.chain - 1, this.tower.damage * 0.7);
        }
    }
    
    chainLightning(fromEnemy, remaining, damage) {
        if (remaining <= 0) return;
        
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        game.enemies.forEach(enemy => {
            if (enemy !== fromEnemy && enemy.health > 0) {
                const distance = Math.sqrt((enemy.x - fromEnemy.x) ** 2 + (enemy.y - fromEnemy.y) ** 2);
                if (distance <= 60 && distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            }
        });
        
        if (closestEnemy) {
            closestEnemy.takeDamage(damage);
            
            // Visueller Effekt für Chain Lightning
            setTimeout(() => {
                this.chainLightning(closestEnemy, remaining - 1, damage * 0.8);
            }, 100);
        }
    }
    
    isOutOfBounds(width, height) {
        return this.x < 0 || this.x > width || this.y < 0 || this.y > height;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.getProjectileColor();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    getProjectileColor() {
        const colors = {
            basic: '#8B4513',
            ice: '#87CEEB',
            fire: '#FF4500',
            lightning: '#FFD700',
            poison: '#9ACD32',
            sniper: '#2F4F4F',
            tesla: '#4169E1'
        };
        return colors[this.tower.type];
    }
}

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 60;
        this.maxLife = 60;
        
        // Zufällige Bewegung
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        
        // Typ-spezifische Eigenschaften
        switch(type) {
            case 'explosion':
                this.color = '#FF4500';
                this.size = Math.random() * 6 + 2;
                break;
            case 'death':
                this.color = '#FF0000';
                this.size = Math.random() * 4 + 1;
                break;
            default:
                this.color = '#FFFFFF';
                this.size = 2;
        }
    }
    
    update() {
        this.life--;
        this.x += this.vx;
        this.y += this.vy;
        
        // Schwerkraft für Explosion
        if (this.type === 'explosion') {
            this.vy += 0.1;
        }
        
        // Reibung
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Globale Funktionen für Modals
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Modal-Hintergrund-Klicks zum Schließen
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-background')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
});

// Global Settings Functions
function saveSettings() {
    if (game && game.settings) {
        game.saveSettingsData();
        game.applySettings();
        closeModal('settingsModal');
        
        // Show success message
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-green);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: var(--shadow-lg);
        `;
        notification.textContent = 'Einstellungen gespeichert!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

function resetSettings() {
    if (game) {
        // Reset to default settings
        const defaultSettings = {
            performance: {
                fpsLimit: 60,
                particleQuality: 'medium'
            },
            audio: {
                masterVolume: 100,
                sfxVolume: 80,
                musicVolume: 60
            },
            graphics: {
                shadows: true,
                animations: true,
                backgroundEffects: true
            },
            gameplay: {
                autoSave: true,
                showFPS: false,
                pauseOnFocusLoss: true,
                confirmSell: true
            },
            controls: {
                quickBuild: false,
                rightClickSell: false
            }
        };
        
        game.settings = defaultSettings;
        game.loadSettingsIntoUI();
        game.applySettings();
    }
}

function confirmMapSelection() {
    if (game && game.tempSelectedMapId) {
        const selectedMap = game.maps[game.tempSelectedMapId];
        if (selectedMap && selectedMap.unlocked) {
            game.loadMap(game.tempSelectedMapId);
            closeModal('mapSelectionModal');
            
            // Show confirmation
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--primary-blue);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 500;
                box-shadow: var(--shadow-lg);
            `;
            notification.textContent = `Map gewechselt zu: ${selectedMap.name}`;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
}

function resetStatistics() {
    if (game && confirm('Möchtest du wirklich alle Statistiken zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
        localStorage.removeItem('rushRoyalStatistics');
        game.initializeStatistics();
        game.updateStatisticsDisplay();
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--danger-red);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: var(--shadow-lg);
        `;
        notification.textContent = 'Statistiken zurückgesetzt!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Panel Toggle Functionality
function toggleSection(sectionClass) {
    const section = document.querySelector(`.${sectionClass}`);
    if (!section) return;
    
    const toggle = section.querySelector('.section-toggle');
    const content = section.querySelector('.section-content');
    
    if (section.classList.contains('expanded')) {
        // Collapse
        section.classList.remove('expanded');
        section.classList.add('collapsed');
        toggle.style.transform = 'rotate(-90deg)';
        content.style.maxHeight = '0';
        content.style.opacity = '0';
    } else {
        // Expand
        section.classList.remove('collapsed');
        section.classList.add('expanded');
        toggle.style.transform = 'rotate(0deg)';
        content.style.maxHeight = 'none';
        content.style.opacity = '1';
    }
}

// Spiel starten
let game;
window.addEventListener('load', () => {
    game = new Game();
    
    // Hauptmenü initial anzeigen
    const mainMenu = document.getElementById('mainMenu');
    const gameContainer = document.getElementById('gameContainer');
    
    if (mainMenu) mainMenu.style.display = 'flex';
    if (gameContainer) gameContainer.style.display = 'none';
});