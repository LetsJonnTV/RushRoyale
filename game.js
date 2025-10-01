class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas-Größe korrekt setzen
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.selectedTowerType = null;
        this.selectedTower = null;
        this.money = 100;
        this.lives = 20;
        this.score = 0;
        this.wave = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.waveInProgress = false;
        this.enemiesSpawned = 0;
        this.enemiesPerWave = 10;
        this.mouseX = 0;
        this.mouseY = 0;
        this.gameSpeed = 1;
        this.particles = [];
        this.achievements = [];
        this.totalKills = 0;
        this.towersBuilt = 0;
        this.goldEarned = 0;
        this.specialAbilities = {
            meteorStrike: { cooldown: 0, maxCooldown: 300 },
            freezeAll: { cooldown: 0, maxCooldown: 600 },
            goldRush: { cooldown: 0, maxCooldown: 900 }
        };
        
        // Spielfeld-Pfad
        this.path = [
            {x: 0, y: 300},
            {x: 150, y: 300},
            {x: 150, y: 150},
            {x: 350, y: 150},
            {x: 350, y: 450},
            {x: 550, y: 450},
            {x: 550, y: 250},
            {x: 700, y: 250},
            {x: 700, y: 100},
            {x: 800, y: 100}
        ];
        
        this.setupEventListeners();
        this.gameLoop();
        this.drawPath();
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
        
        document.getElementById('pauseGame').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartGame').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('upgradeBtn').addEventListener('click', () => {
            this.upgradeTower();
        });
        
        document.getElementById('sellBtn').addEventListener('click', () => {
            this.sellTower();
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
        this.selectedTower = null;
        
        // Gehe durch alle Tower in umgekehrter Reihenfolge (zuletzt gezeichnete zuerst)
        for (let i = this.towers.length - 1; i >= 0; i--) {
            const tower = this.towers[i];
            const dist = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
            
            // Verwende die tatsächliche Tower-Größe für genauere Kollision
            if (dist <= tower.size + 5) { // +5 für einfachere Auswahl
                this.selectedTower = tower;
                this.showTowerUpgrade(tower);
                return;
            }
        }
        
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
        
        this.waveInProgress = true;
        this.enemiesSpawned = 0;
        this.gameRunning = true;
        
        const enemiesThisWave = this.enemiesPerWave + Math.floor(this.wave / 3);
        
        const spawnInterval = setInterval(() => {
            if (this.enemiesSpawned >= enemiesThisWave) {
                clearInterval(spawnInterval);
                return;
            }
            
            // Verschiedene Gegnertypen je nach Welle
            let enemyType = 'basic';
            if (this.wave >= 3 && Math.random() < 0.3) enemyType = 'fast';
            if (this.wave >= 5 && Math.random() < 0.2) enemyType = 'tank';
            if (this.wave >= 7 && Math.random() < 0.1) enemyType = 'boss';
            
            this.enemies.push(new Enemy(this.path, enemyType, this.wave));
            this.enemiesSpawned++;
        }, 800);
        
        document.getElementById('startWave').disabled = true;
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseGame').textContent = this.gamePaused ? 'Fortsetzen' : 'Pause';
    }
    
    restartGame() {
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.money = 100;
        this.lives = 20;
        this.score = 0;
        this.wave = 1;
        this.gameRunning = false;
        this.waveInProgress = false;
        this.selectedTowerType = null;
        this.selectedTower = null;
        
        document.getElementById('startWave').disabled = false;
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
        console.log('showTowerUpgrade called');
        
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
        upgradeDiv.classList.add('show');
        
        // Klick außerhalb des Popups schließt es
        upgradeDiv.addEventListener('click', (e) => {
            if (e.target === upgradeDiv) {
                this.hideTowerUpgrade();
            }
        });
        
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
            upgradeDiv.classList.remove('show');
            console.log('Upgrade popup hidden');
        }
    }
    
    upgradeTower() {
        if (!this.selectedTower) return;
        
        const upgradeCost = Math.floor(this.selectedTower.value * 0.5);
        if (this.money >= upgradeCost) {
            this.money -= upgradeCost;
            this.selectedTower.upgrade();
            this.updateUI();
            this.showTowerUpgrade(this.selectedTower);
        }
    }
    
    sellTower() {
        if (!this.selectedTower) return;
        
        const sellValue = Math.floor(this.selectedTower.value * 0.7);
        this.money += sellValue;
        
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
        }
        
        if (success) {
            this.money -= cost;
            ability.cooldown = ability.maxCooldown;
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
        this.showMessage('+100 Gold Rush!');
        this.checkAchievements();
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
            { id: 'richPlayer', condition: () => this.money >= 1000, message: 'Millionär!' }
        ];
        
        achievements.forEach(achievement => {
            if (!this.achievements.includes(achievement.id) && achievement.condition()) {
                this.achievements.push(achievement.id);
                this.showAchievement(achievement.message);
            }
        });
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
    
    gameLoop() {
        if (!this.gamePaused) {
            this.update();
        }
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Cooldowns updaten
        Object.values(this.specialAbilities).forEach(ability => {
            if (ability.cooldown > 0) ability.cooldown--;
        });
        
        // Game Speed anwenden
        const speedMultiplier = this.gameSpeed;
        
        // Gegner updaten
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
                this.money += enemy.reward;
                this.goldEarned += enemy.reward;
                this.score += enemy.points;
                this.totalKills++;
                this.enemies.splice(i, 1);
                this.updateUI();
                this.checkAchievements();
                
                // Partikel-Effekt beim Tod
                this.particles.push(new Particle(enemy.x, enemy.y, 'death'));
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
        
        // Überprüfen ob Welle beendet
        if (this.waveInProgress && this.enemies.length === 0 && this.enemiesSpawned >= this.enemiesPerWave + Math.floor(this.wave / 3)) {
            this.waveInProgress = false;
            this.wave++;
            this.money += 25; // Bonus für beendete Welle
            this.goldEarned += 25;
            this.updateUI();
            this.checkAchievements();
            document.getElementById('startWave').disabled = false;
        }
    }
    
    draw() {
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
    }
    
    drawPath() {
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
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('money').textContent = this.money;
        document.getElementById('score').textContent = this.score;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('gameSpeed').textContent = `${this.gameSpeed}x`;
        document.getElementById('currentWave').textContent = this.wave;
        
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
        
        // Ability-Buttons updaten
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
    }
    
    showMessage(message) {
        // Temporäre Nachricht anzeigen
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-weight: bold;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 2000);
    }
    
    gameOver() {
        this.gameRunning = false;
        
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
        this.maxHealth = stats.health + wave * 5;
        this.health = this.maxHealth;
        this.baseSpeed = stats.speed;
        this.speed = this.baseSpeed;
        this.reward = stats.reward;
        this.points = stats.points;
        this.size = stats.size;
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
        
        this.target.takeDamage(this.tower.damage, effects);
        
        // Splash-Schaden (Fire Tower)
        if (this.tower.type === 'fire' && this.tower.splash) {
            game.enemies.forEach(enemy => {
                if (enemy !== this.target) {
                    const distance = Math.sqrt((enemy.x - this.target.x) ** 2 + (enemy.y - this.target.y) ** 2);
                    if (distance <= this.tower.splash) {
                        enemy.takeDamage(this.tower.damage * 0.5);
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

// Spiel starten
let game;
window.addEventListener('load', () => {
    game = new Game();
});