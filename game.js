class Game {
    constructor() {
        // Warten bis Canvas verfügbar ist
        this.initializeCanvas();
        
        // Load settings first
        this.settings = this.loadSettings();
        
        // Initialize statistics
        this.initializeStatistics();
        this.gameStartTime = Date.now();
        
        // Set current map ID from storage
        this.currentMapId = localStorage.getItem('rushRoyalSelectedMap') || 'classic';
        
        // Initialize skill tree
        this.initializeSkillTree();
        
        // Initialize fusion system
        this.initializeFusionRecipes();
        
        // Initialize trading system
        this.initializeTradingSystem();
        
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
        this.fusionMode = false;
        this.selectedTowerForFusion = null;
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
        
        // Initialize maps first, then load current map
        this.initializeMaps();
        this.loadMap(this.currentMapId);
        
        this.setupEventListeners();
        
        // Menu event listeners will be set up globally after DOM load
        // But we still need other event listeners
        setTimeout(() => {
            this.setupMenuEventListeners();
        }, 100);
        
        this.gameLoop();
        // drawPath will be called in the gameLoop when canvas is ready
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
            // Fallback to classic map
            if (mapId !== 'classic' && this.maps['classic']) {
                return this.loadMap('classic');
            }
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

    // Skill Tree System
    initializeSkillTree() {
        this.skillPoints = parseInt(localStorage.getItem('rushRoyalSkillPoints')) || 0;
        
        // Gib neuen Spielern 3 Start-Skill-Punkte
        if (this.skillPoints === 0 && !localStorage.getItem('rushRoyalSkills')) {
            this.skillPoints = 3;
            localStorage.setItem('rushRoyalSkillPoints', '3');
            console.log('New player detected - awarded 3 starting skill points');
        }
        
        this.skills = this.loadSkills();
        this.initializeSkillDefinitions();
    }

    initializeSkillDefinitions() {
        this.skillDefinitions = {
            // Damage Tree
            increasedDamage: {
                id: 'increasedDamage',
                name: 'Erhöhter Schaden',
                description: 'Alle Türme verursachen +20% Schaden',
                tree: 'damage',
                maxLevel: 3,
                cost: (level) => level,
                effect: (level) => ({ damageMultiplier: 1 + (level * 0.2) })
            },
            criticalHit: {
                id: 'criticalHit',
                name: 'Kritischer Treffer',
                description: '10% Chance für 2x Schaden',
                tree: 'damage',
                maxLevel: 3,
                cost: (level) => level,
                effect: (level) => ({ critChance: level * 0.1, critMultiplier: 2.0 })
            },
            armorPiercing: {
                id: 'armorPiercing',
                name: 'Rüstungsdurchbruch',
                description: 'Ignoriert 25% Rüstung',
                tree: 'damage',
                maxLevel: 2,
                cost: (level) => level,
                effect: (level) => ({ armorPiercing: level * 0.25 })
            },
            explosiveShots: {
                id: 'explosiveShots',
                name: 'Explosive Geschosse',
                description: '+30% Splash-Schaden-Radius',
                tree: 'damage',
                maxLevel: 2,
                cost: (level) => level,
                effect: (level) => ({ splashRadius: 1 + (level * 0.3) })
            },

            // Economy Tree
            extraGold: {
                id: 'extraGold',
                name: 'Extra Gold',
                description: '+50% Gold pro Kill',
                tree: 'economy',
                maxLevel: 3,
                cost: (level) => level,
                effect: (level) => ({ goldMultiplier: 1 + (level * 0.5) })
            },
            cheaperTowers: {
                id: 'cheaperTowers',
                name: 'Günstigere Tower',
                description: '-20% Tower Kosten',
                tree: 'economy',
                maxLevel: 2,
                cost: (level) => level,
                effect: (level) => ({ costReduction: level * 0.2 })
            },
            interestRate: {
                id: 'interestRate',
                name: 'Zinssatz',
                description: '+1 Gold pro Welle pro 100 Gold',
                tree: 'economy',
                maxLevel: 3,
                cost: (level) => level,
                effect: (level) => ({ interestRate: level * 0.01 })
            },
            treasureHunter: {
                id: 'treasureHunter',
                name: 'Schatzjäger',
                description: '15% Chance für +20 Bonus Gold pro Kill',
                tree: 'economy',
                maxLevel: 2,
                cost: (level) => level,
                effect: (level) => ({ treasureChance: level * 0.15, treasureAmount: 20 })
            },

            // Support Tree
            fasterShooting: {
                id: 'fasterShooting',
                name: 'Schnelleres Schießen',
                description: '+25% Feuerrate',
                tree: 'support',
                maxLevel: 3,
                cost: (level) => level,
                effect: (level) => ({ fireRateMultiplier: 1 + (level * 0.25) })
            },
            longerRange: {
                id: 'longerRange',
                name: 'Längere Reichweite',
                description: '+20% Tower Reichweite',
                tree: 'support',
                maxLevel: 2,
                cost: (level) => level,
                effect: (level) => ({ rangeMultiplier: 1 + (level * 0.2) })
            },
            multiShot: {
                id: 'multiShot',
                name: 'Mehrfachschuss',
                description: '20% Chance für 2 Projektile',
                tree: 'support',
                maxLevel: 2,
                cost: (level) => level,
                effect: (level) => ({ multiShotChance: level * 0.2 })
            },
            lifeSteal: {
                id: 'lifeSteal',
                name: 'Lebensentzug',
                description: '10% Chance, +1 Leben bei Kill',
                tree: 'support',
                maxLevel: 2,
                cost: (level) => level,
                effect: (level) => ({ lifeStealChance: level * 0.1 })
            },
            efficientTowers: {
                id: 'efficientTowers',
                name: 'Effiziente Tower',
                description: '+15% Tower-Verkaufswert',
                tree: 'support',
                maxLevel: 2,
                cost: (level) => level,
                effect: (level) => ({ sellValueBonus: level * 0.15 })
            }
        };
    }

    loadSkills() {
        const defaultSkills = {};
        Object.keys(this.skillDefinitions || {}).forEach(skillId => {
            defaultSkills[skillId] = 0;
        });

        const saved = localStorage.getItem('rushRoyalSkills');
        return saved ? { ...defaultSkills, ...JSON.parse(saved) } : defaultSkills;
    }

    saveSkills() {
        localStorage.setItem('rushRoyalSkills', JSON.stringify(this.skills));
        localStorage.setItem('rushRoyalSkillPoints', this.skillPoints.toString());
    }

    getSkillEffects() {
        const effects = {
            damageMultiplier: 1,
            goldMultiplier: 1,
            rangeMultiplier: 1,
            fireRateMultiplier: 1,
            costReduction: 0,
            critChance: 0,
            critMultiplier: 2.0,
            armorPiercing: 0,
            multiShotChance: 0,
            interestRate: 0,
            treasureChance: 0,
            treasureAmount: 0,
            splashRadius: 1,
            lifeStealChance: 0,
            sellValueBonus: 0
        };

        Object.entries(this.skills).forEach(([skillId, level]) => {
            if (level > 0 && this.skillDefinitions[skillId]) {
                const skillEffect = this.skillDefinitions[skillId].effect(level);
                Object.assign(effects, skillEffect);
            }
        });

        return effects;
    }

    earnSkillPoints(amount) {
        this.skillPoints += amount;
        localStorage.setItem('rushRoyalSkillPoints', this.skillPoints.toString());
        this.saveSkills();
        this.updateSkillPointsBadge();
        console.log(`Earned ${amount} skill points. Total: ${this.skillPoints}`);
    }

    checkWaveSkillPointRewards() {
        let skillPointsEarned = 0;
        let message = '';
        
        // 1 Skill-Punkt alle 5 Wellen
        if (this.wave % 5 === 0) {
            skillPointsEarned += 1;
            message += `🌟 Welle ${this.wave} abgeschlossen! +1 Skill-Punkt für jede 5. Welle! `;
        }
        
        // Bonus-Punkte für wichtige Meilensteine
        if (this.wave === 10) {
            skillPointsEarned += 1;
            message += `🎯 Meilenstein erreicht! +1 Bonus Skill-Punkt für Welle 10! `;
        } else if (this.wave === 20) {
            skillPointsEarned += 2;
            message += `🏆 Großer Meilenstein! +2 Bonus Skill-Punkte für Welle 20! `;
        } else if (this.wave === 30) {
            skillPointsEarned += 3;
            message += `👑 Meister-Level! +3 Bonus Skill-Punkte für Welle 30! `;
        }
        
        // Boss-Wellen geben zusätzliche Skill-Punkte
        if (this.wave % 10 === 0 && this.wave > 0) {
            skillPointsEarned += 1;
            message += `💀 Boss-Welle besiegt! +1 Skill-Punkt! `;
        }
        
        if (skillPointsEarned > 0) {
            this.earnSkillPoints(skillPointsEarned);
            this.showMessage(message + `Gesamt: ${skillPointsEarned} Skill-Punkt${skillPointsEarned > 1 ? 'e' : ''} erhalten!`, 'success');
            console.log(`Earned ${skillPointsEarned} skill points for completing wave ${this.wave}`);
        }
    }

    checkKillSkillPointRewards() {
        // 1 Skill-Punkt alle 50 Kills
        const killMilestone = 50;
        const totalKills = this.statistics.totalKills + this.sessionStats.kills;
        const lastMilestone = Math.floor((totalKills - 1) / killMilestone) * killMilestone;
        const currentMilestone = Math.floor(totalKills / killMilestone) * killMilestone;
        
        if (currentMilestone > lastMilestone && totalKills >= killMilestone) {
            this.earnSkillPoints(1);
            this.showMessage(`⚔️ ${totalKills} Kills erreicht! +1 Skill-Punkt erhalten!`, 'success');
            console.log(`Earned 1 skill point for ${totalKills} total kills`);
        }
    }

    awardGameOverSkillPoints() {
        let skillPointsEarned = 0;
        let message = '';
        
        // Basis-Belohnung für erreichte Welle
        if (this.wave >= 5) {
            skillPointsEarned += Math.floor(this.wave / 5);
            message += `📊 ${Math.floor(this.wave / 5)} Skill-Punkt${Math.floor(this.wave / 5) > 1 ? 'e' : ''} für erreichte Welle ${this.wave}! `;
        }
        
        // Bonus für hohe Wellen
        if (this.wave >= 20) {
            skillPointsEarned += 2;
            message += `🏆 +2 Bonus-Punkte für Welle 20+! `;
        } else if (this.wave >= 15) {
            skillPointsEarned += 1;
            message += `🎯 +1 Bonus-Punkt für Welle 15+! `;
        }
        
        // Bonus für hohe Punktzahl
        if (this.score >= 10000) {
            skillPointsEarned += 1;
            message += `⭐ +1 Punkt für hohe Punktzahl! `;
        }
        
        // Mindestens 1 Skill-Punkt für jedes beendete Spiel
        if (skillPointsEarned === 0) {
            skillPointsEarned = 1;
            message = `💪 +1 Skill-Punkt für den Versuch! `;
        }
        
        if (skillPointsEarned > 0) {
            this.earnSkillPoints(skillPointsEarned);
            this.showMessage(message + `Gesamt: ${skillPointsEarned} Skill-Punkt${skillPointsEarned > 1 ? 'e' : ''} erhalten!`, 'success');
            console.log(`Earned ${skillPointsEarned} skill points for game over at wave ${this.wave}`);
        }
    }

    canUpgradeSkill(skillId) {
        const skill = this.skillDefinitions[skillId];
        if (!skill) return false;
        
        const currentLevel = this.skills[skillId] || 0;
        if (currentLevel >= skill.maxLevel) return false;
        
        const cost = skill.cost(currentLevel + 1);
        if (this.skillPoints < cost) return false;
        
        // Check prerequisites
        if (skill.prerequisite) {
            const [prereqSkill, reqLevel] = skill.prerequisite;
            if ((this.skills[prereqSkill] || 0) < reqLevel) return false;
        }
        
        return true;
    }

    upgradeSkill(skillId) {
        if (!this.canUpgradeSkill(skillId)) return false;
        
        const skill = this.skillDefinitions[skillId];
        const currentLevel = this.skills[skillId] || 0;
        const cost = skill.cost(currentLevel + 1);
        
        this.skillPoints -= cost;
        this.skills[skillId] = currentLevel + 1;
        this.saveSkills();
        this.updateSkillPointsBadge();
        
        return true;
    }

    // Tower Fusion System
    initializeFusionRecipes() {
        this.fusionRecipes = {
            // Basic fusions with existing tower types
            'basic+basic': {
                result: 'enhanced_basic',
                name: 'Verstärkter Turm',
                description: 'Doppelter Schaden, erhöhte Reichweite'
            },
            'basic+ice': {
                result: 'frost_basic',
                name: 'Frost-Grundturm',
                description: 'Verlangsamt Feinde beim Treffen'
            },
            'sniper+lightning': {
                result: 'arcane_sniper',
                name: 'Arkaner Scharfschütze',
                description: 'Durchschlägt Schilde und trifft fliegende Feinde'
            },
            'fire+ice': {
                result: 'frost_cannon',
                name: 'Dampfkanone',
                description: 'Explosionen verlangsamen und verbrennen Feinde'
            },
            'lightning+poison': {
                result: 'void_mage',
                name: 'Leermagier',
                description: 'Vergiftet und schwächt mehrere Feinde'
            },
            'basic+sniper': {
                result: 'rapid_sniper',
                name: 'Schnellfeuer-Scharfschütze',
                description: 'Hohe Feuerrate mit präzisen Schüssen'
            },
            'fire+poison': {
                result: 'toxic_cannon',
                name: 'Giftkanone',
                description: 'Vergiftet Feinde in großem Radius'
            },
            'tesla+ice': {
                result: 'freeze_tesla',
                name: 'Gefriergewitter',
                description: 'Elektrizität verlangsamt und springt zwischen Feinden'
            },
            'tesla+fire': {
                result: 'plasma_tower',
                name: 'Plasmaturm',
                description: 'Hochenergie-Entladungen mit Flächenschaden'
            }
        };
    }

    toggleFusionMode() {
        this.fusionMode = !this.fusionMode;
        this.selectedTowerForFusion = null;
        
        const fusionBtn = document.getElementById('fusionBtn');
        if (fusionBtn) {
            fusionBtn.classList.toggle('active', this.fusionMode);
            const buttonText = fusionBtn.querySelector('span');
            if (buttonText) {
                buttonText.textContent = this.fusionMode ? 'Fusion beenden' : 'Tower Fusion';
            }
        }
        
        this.showMessage(this.fusionMode ? 'Fusion-Modus aktiviert! Wähle zwei Türme zum Fusionieren.' : 'Fusion-Modus deaktiviert.', 'info');
    }

    attemptTowerFusion(tower1, tower2) {
        const recipe1 = `${tower1.type}+${tower2.type}`;
        const recipe2 = `${tower2.type}+${tower1.type}`;
        
        console.log(`Trying fusion: ${recipe1} or ${recipe2}`);
        console.log('Available recipes:', Object.keys(this.fusionRecipes));
        
        const fusion = this.fusionRecipes[recipe1] || this.fusionRecipes[recipe2];
        
        if (!fusion) {
            console.log(`No fusion found for ${recipe1} or ${recipe2}`);
            this.showMessage(`Diese Türme können nicht fusioniert werden! (${tower1.type} + ${tower2.type})`, 'warning');
            return false;
        }
        
        // Check if towers are adjacent (within 100 pixels)
        const distance = Math.sqrt((tower1.x - tower2.x) ** 2 + (tower1.y - tower2.y) ** 2);
        if (distance > 100) {
            this.showMessage('Türme müssen benachbart sein für die Fusion!', 'warning');
            return false;
        }
        
        // Create fused tower
        const fusedTower = this.createFusedTower(tower1, tower2, fusion);
        
        // Remove original towers
        this.towers = this.towers.filter(t => t !== tower1 && t !== tower2);
        
        // Add fused tower
        this.towers.push(fusedTower);
        
        // Reset fusion mode
        this.fusionMode = false;
        this.selectedTowerForFusion = null;
        const fusionBtn = document.getElementById('fusionBtn');
        if (fusionBtn) {
            fusionBtn.classList.remove('active');
            const buttonText = fusionBtn.querySelector('span');
            if (buttonText) {
                buttonText.textContent = 'Tower Fusion';
            }
        }
        
        this.showMessage(`${fusion.name} erstellt!`, 'success');
        this.updateUI();
        
        return true;
    }

    createFusedTower(tower1, tower2, fusion) {
        // Position between the two towers
        const x = (tower1.x + tower2.x) / 2;
        const y = (tower1.y + tower2.y) / 2;
        
        const fusedTower = new Tower(x, y, fusion.result);
        
        // Inherit combined stats
        fusedTower.damage = tower1.damage + tower2.damage;
        fusedTower.range = Math.max(tower1.range, tower2.range) * 1.2;
        fusedTower.fireRate = Math.min(tower1.fireRate, tower2.fireRate) * 0.8;
        fusedTower.value = tower1.value + tower2.value;
        fusedTower.level = Math.max(tower1.level, tower2.level);
        
        // Inherit special properties from both towers
        this.inheritTowerProperties(fusedTower, tower1, tower2);
        
        // Apply fusion-specific bonuses
        this.applyFusionBonuses(fusedTower, fusion);
        
        return fusedTower;
    }
    
    inheritTowerProperties(fusedTower, tower1, tower2) {
        // Combine special effects from both towers
        const properties = {
            slow: Math.max(tower1.slow || 0, tower2.slow || 0),
            splash: Math.max(tower1.splash || 0, tower2.splash || 0),
            chain: Math.max(tower1.chain || 0, tower2.chain || 0),
            poison: Math.max(tower1.poison || 0, tower2.poison || 0),
            stun: Math.max(tower1.stun || 0, tower2.stun || 0)
        };
        
        // Apply inherited properties
        if (properties.slow > 0) {
            fusedTower.slow = properties.slow;
            fusedTower.slowEffect = properties.slow;
            console.log(`Inherited slow effect: ${properties.slow}`);
        }
        
        if (properties.splash > 0) {
            fusedTower.splash = properties.splash;
            fusedTower.splashRadius = properties.splash;
            console.log(`Inherited splash radius: ${properties.splash}`);
        }
        
        if (properties.chain > 0) {
            fusedTower.chain = properties.chain;
            console.log(`Inherited chain lightning: ${properties.chain}`);
        }
        
        if (properties.poison > 0) {
            fusedTower.poison = properties.poison;
            fusedTower.poisonDamage = properties.poison;
            console.log(`Inherited poison damage: ${properties.poison}`);
        }
        
        if (properties.stun > 0) {
            fusedTower.stun = properties.stun;
            console.log(`Inherited stun duration: ${properties.stun}`);
        }
        
        // Determine combined damage type
        const damageTypes = [];
        if (tower1.type === 'ice' || tower2.type === 'ice') damageTypes.push('ice');
        if (tower1.type === 'fire' || tower2.type === 'fire') damageTypes.push('fire');
        if (tower1.type === 'lightning' || tower2.type === 'lightning') damageTypes.push('lightning');
        if (tower1.type === 'poison' || tower2.type === 'poison') damageTypes.push('poison');
        if (tower1.type === 'tesla' || tower2.type === 'tesla') damageTypes.push('lightning');
        
        if (damageTypes.length > 0) {
            fusedTower.damageType = damageTypes[0]; // Primary damage type
            fusedTower.secondaryDamageType = damageTypes[1] || null; // Secondary if exists
            console.log(`Damage type: ${fusedTower.damageType}${fusedTower.secondaryDamageType ? ' + ' + fusedTower.secondaryDamageType : ''}`);
        }
    }
    
    applyFusionBonuses(fusedTower, fusion) {
        // Apply specific fusion bonuses on top of inherited properties
        switch (fusion.result) {
            case 'enhanced_basic':
                fusedTower.damage *= 2;
                fusedTower.range *= 1.5;
                break;
            case 'frost_basic':
                // Additional slow effect on top of inherited ice properties
                if (fusedTower.slowEffect) {
                    fusedTower.slowEffect = Math.min(0.8, fusedTower.slowEffect + 0.2);
                } else {
                    fusedTower.slowEffect = 0.3;
                }
                break;
            case 'arcane_sniper':
                fusedTower.canHitFlying = true;
                fusedTower.pierceShield = true;
                break;
            case 'frost_cannon':
                // Enhance inherited properties
                if (fusedTower.splashRadius) {
                    fusedTower.splashRadius = Math.max(fusedTower.splashRadius, 60);
                } else {
                    fusedTower.splashRadius = 60;
                }
                if (fusedTower.slowEffect) {
                    fusedTower.slowEffect = Math.min(0.8, fusedTower.slowEffect + 0.2);
                } else {
                    fusedTower.slowEffect = 0.5;
                }
                break;
            case 'void_mage':
                fusedTower.multiTarget = 3;
                // Enhance poison if inherited
                if (fusedTower.poisonDamage) {
                    fusedTower.poisonDamage = Math.max(fusedTower.poisonDamage, 5);
                } else {
                    fusedTower.poisonDamage = 5;
                }
                break;
            case 'rapid_sniper':
                fusedTower.fireRate *= 0.5;
                fusedTower.accuracy = 0.95;
                break;
            case 'toxic_cannon':
                // Enhance inherited properties
                if (fusedTower.splashRadius) {
                    fusedTower.splashRadius = Math.max(fusedTower.splashRadius, 80);
                } else {
                    fusedTower.splashRadius = 80;
                }
                if (fusedTower.poisonDamage) {
                    fusedTower.poisonDamage = Math.max(fusedTower.poisonDamage, 8);
                } else {
                    fusedTower.poisonDamage = 8;
                }
                break;
            case 'freeze_tesla':
                // Enhance inherited properties
                if (fusedTower.chain) {
                    fusedTower.chain = Math.max(fusedTower.chain, 4);
                } else {
                    fusedTower.chain = 4;
                }
                if (fusedTower.slowEffect) {
                    fusedTower.slowEffect = Math.min(0.7, fusedTower.slowEffect + 0.2);
                } else {
                    fusedTower.slowEffect = 0.3;
                }
                break;
            case 'plasma_tower':
                if (fusedTower.splashRadius) {
                    fusedTower.splashRadius = Math.max(fusedTower.splashRadius, 70);
                } else {
                    fusedTower.splashRadius = 70;
                }
                fusedTower.damage *= 1.5;
                break;
        }
        
        // Log final properties
        console.log(`Fused tower ${fusion.result} created with properties:`, {
            damage: fusedTower.damage,
            range: fusedTower.range,
            slowEffect: fusedTower.slowEffect,
            splashRadius: fusedTower.splashRadius,
            chain: fusedTower.chain,
            poisonDamage: fusedTower.poisonDamage,
            stun: fusedTower.stun,
            damageType: fusedTower.damageType,
            secondaryDamageType: fusedTower.secondaryDamageType
        });
    }

    // Skill Tree Management
    openSkillTree() {
        this.updateSkillTreeUI();
        document.getElementById('skillTreeModal').style.display = 'flex';
    }

    closeSkillTree() {
        document.getElementById('skillTreeModal').style.display = 'none';
    }

    updateSkillTreeUI() {
        // Update skill points display
        document.getElementById('skillPointsDisplay').textContent = this.skillPoints;
        
        // Update all skill nodes
        const skillNodes = document.querySelectorAll('.skill-node');
        skillNodes.forEach(node => {
            const skillName = node.dataset.skill;
            const skill = this.skillDefinitions[skillName];
            const currentLevel = this.skills[skillName] || 0;
            
            if (skill) {
                const levelSpan = node.querySelector('.current-level');
                const upgradeBtn = node.querySelector('.skill-upgrade-btn');
                
                if (levelSpan) {
                    levelSpan.textContent = currentLevel;
                }
                
                if (upgradeBtn) {
                    // Update button state
                    const canUpgrade = this.skillPoints > 0 && currentLevel < skill.maxLevel;
                    upgradeBtn.disabled = !canUpgrade;
                    
                    if (currentLevel >= skill.maxLevel) {
                        node.classList.add('maxed');
                        upgradeBtn.textContent = 'Max Level';
                    } else {
                        node.classList.remove('maxed');
                        upgradeBtn.textContent = `Upgrade (1 Punkt)`;
                    }
                }
            } else {
                console.warn(`Skill definition not found: ${skillName}`);
            }
        });
        
        // Add click listeners to upgrade buttons
        const upgradeButtons = document.querySelectorAll('.skill-upgrade-btn');
        upgradeButtons.forEach(btn => {
            // Remove existing listeners
            btn.replaceWith(btn.cloneNode(true));
        });
        
        // Re-add listeners to new buttons
        document.querySelectorAll('.skill-upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const skillNode = e.target.closest('.skill-node');
                const skillName = skillNode.dataset.skill;
                this.upgradeSkill(skillName);
            });
        });
    }

    upgradeSkill(skillName) {
        const skill = this.skillDefinitions[skillName];
        const currentLevel = this.skills[skillName] || 0;
        
        if (!skill || currentLevel >= skill.maxLevel || this.skillPoints <= 0) {
            console.log(`Cannot upgrade ${skillName}: skill=${!!skill}, currentLevel=${currentLevel}, maxLevel=${skill?.maxLevel}, skillPoints=${this.skillPoints}`);
            return;
        }
        
        // Upgrade the skill
        this.skills[skillName] = currentLevel + 1;
        this.skillPoints--;
        
        // Save progress
        this.saveSkills();
        localStorage.setItem('rushRoyalSkillPoints', this.skillPoints.toString());
        
        // Update UI
        this.updateSkillTreeUI();
        
        // Show upgrade message
        this.showMessage(`${skill.name} auf Level ${this.skills[skillName]} verbessert!`);
        
        console.log(`Upgraded ${skillName} to level ${this.skills[skillName]}`);
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
        console.log('initializeCanvas() called');
        this.canvas = document.getElementById('gameCanvas');
        console.log('Canvas element found:', !!this.canvas);
        
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            // Canvas-Größe korrekt setzen (größer für bessere Sichtbarkeit)
            this.canvas.width = 1000;
            this.canvas.height = 750;
            
            console.log('Canvas initialized with size:', this.canvas.width, 'x', this.canvas.height);
            
            // Set map background
            if (this.currentMap) {
                this.canvas.style.background = this.currentMap.background;
                console.log('Set canvas background to:', this.currentMap.background);
            }
        } else {
            console.log('Canvas not found, retrying in 100ms');
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
        
        // Fusion Button Event Listener (using existing HTML button)
        const fusionButton = document.getElementById('fusionBtn');
        if (fusionButton) {
            fusionButton.addEventListener('click', () => {
                console.log('Fusion button clicked');
                this.toggleFusionMode();
            });
        } else {
            console.error('Fusion button not found!');
        }
        
        // Skill Tree Button Event Listener
        const skillTreeButton = document.getElementById('skillTreeBtn');
        if (skillTreeButton) {
            skillTreeButton.addEventListener('click', () => {
                console.log('Skill tree button clicked');
                this.openSkillTree();
            });
        } else {
            console.error('Skill tree button not found!');
        }
        
        // Skill Tree Modal Event Listeners
        const skillTreeCloseButton = document.getElementById('skillTreeClose');
        if (skillTreeCloseButton) {
            skillTreeCloseButton.addEventListener('click', () => {
                this.closeSkillTree();
            });
        }
        
        // Close skill tree when clicking background
        const skillTreeBackground = document.querySelector('.skill-tree-background');
        if (skillTreeBackground) {
            skillTreeBackground.addEventListener('click', () => {
                this.closeSkillTree();
            });
        }
        
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
        
        // Debug: Check if buttons exist
        console.log('Event listeners setup complete');
        console.log('Fusion button exists:', !!document.getElementById('fusionBtn'));
        console.log('Skill tree button exists:', !!document.getElementById('skillTreeBtn'));
        console.log('Skill tree modal exists:', !!document.getElementById('skillTreeModal'));
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
            
            // Track tower usage for prestige system
            if (prestigeSystem) {
                prestigeSystem.trackTowerUsage(towerType, 'used');
            }

            // Send to multiplayer if connected
            if (this.multiplayerMode && multiplayerManager && multiplayerManager.isConnected()) {
                multiplayerManager.sendTowerPlaced(tower);
            }

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
        
        // Fusion Mode Handler
        if (this.fusionMode) {
            // Gehe durch alle Tower in umgekehrter Reihenfolge
            for (let i = this.towers.length - 1; i >= 0; i--) {
                const tower = this.towers[i];
                const dist = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
                
                if (dist <= tower.size + 10) {
                    if (!this.selectedTowerForFusion) {
                        // Ersten Tower für Fusion auswählen
                        this.selectedTowerForFusion = tower;
                        console.log(`First tower selected for fusion: ${tower.type}`);
                        this.showMessage(`${tower.type} ausgewählt. Wähle einen zweiten Tower für die Fusion.`);
                        return;
                    } else {
                        // Zweiten Tower für Fusion auswählen
                        if (tower === this.selectedTowerForFusion) {
                            this.showMessage('Du kannst nicht denselben Tower mit sich selbst fusionieren!');
                            return;
                        }
                        console.log(`Attempting fusion between ${this.selectedTowerForFusion.type} and ${tower.type}`);
                        this.attemptTowerFusion(this.selectedTowerForFusion, tower);
                        return;
                    }
                }
            }
            
            // Kein Tower gefunden - Fusion Mode verlassen wenn bereits ein Tower ausgewählt
            if (this.selectedTowerForFusion) {
                this.showMessage('Fusion abgebrochen.');
                this.selectedTowerForFusion = null;
            }
            return;
        }
        
        // Normaler Tower Selection Mode
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
        
        const baseCost = costs[type];
        const skillEffects = this.getSkillEffects();
        const finalCost = Math.floor(baseCost * (1 - skillEffects.costReduction));
        
        return finalCost;
    }
    
    startWave() {
        if (this.waveInProgress) return;
        
        // Zinssystem: Geld basierend auf aktuellem Geld verdienen
        if (this.wave > 1) { // Nicht bei der ersten Welle
            const skillEffects = this.getSkillEffects();
            if (skillEffects.interestRate > 0) {
                const interestGold = Math.floor(this.money * skillEffects.interestRate);
                if (interestGold > 0) {
                    this.money += interestGold;
                    this.goldEarned += interestGold;
                    console.log(`Zinsen erhalten: ${interestGold} Gold (${skillEffects.interestRate * 100}% von ${this.money - interestGold})`);
                }
            }
        }
        
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
            if (rand < 0.75) return 'tank';
            if (rand < 0.85) return 'shielded';
            if (rand < 0.95) return 'fast';
            return 'basic';
        }
        
        // Progressive Wahrscheinlichkeiten basierend auf Welle
        const waveMultiplier = Math.min(this.wave / 10, 2);
        
        const fastChance = Math.min(0.15 + (this.wave * 0.03), 0.4);
        const tankChance = Math.max(0, Math.min(0.05 + (this.wave * 0.025), 0.3));
        const bossChance = Math.max(0, Math.min((this.wave - 4) * 0.015, 0.15));
        const flyingChance = Math.max(0, Math.min((this.wave - 6) * 0.02, 0.2));
        const shieldedChance = Math.max(0, Math.min((this.wave - 8) * 0.015, 0.15));
        const splitterChance = Math.max(0, Math.min((this.wave - 10) * 0.01, 0.1));
        const teleporterChance = Math.max(0, Math.min((this.wave - 12) * 0.008, 0.08));
        
        const rand = Math.random();
        let cumulative = 0;
        
        if (this.wave >= 12 && rand < (cumulative += teleporterChance)) return 'teleporter';
        if (this.wave >= 10 && rand < (cumulative += splitterChance)) return 'splitter';
        if (this.wave >= 8 && rand < (cumulative += shieldedChance)) return 'shielded';
        if (this.wave >= 6 && rand < (cumulative += flyingChance)) return 'flying';
        if (this.wave >= 5 && rand < (cumulative += bossChance)) return 'boss';
        if (this.wave >= 2 && rand < (cumulative += tankChance)) return 'tank';
        if (this.wave >= 2 && rand < (cumulative += fastChance)) return 'fast';
        
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
        console.log('restartGame() called');
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
        
        console.log('Game state reset - lives:', this.lives, 'money:', this.money, 'wave:', this.wave);
        
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
                    <span class="stat-value">${this.getEffectiveTowerDamage(tower)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-name"><i class="fas fa-crosshairs"></i> Reichweite:</span>
                    <span class="stat-value">${this.getEffectiveTowerRange(tower)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-name"><i class="fas fa-tachometer-alt"></i> Feuerrate:</span>
                    <span class="stat-value">${this.getEffectiveTowerFireRate(tower)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-name"><i class="fas fa-coins"></i> Verkaufswert:</span>
                    <span class="stat-value">${this.getEffectiveSellValue(tower)}G</span>
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
        const baseUpgradeCost = Math.floor(tower.value * 0.5);
        const actualUpgradeCost = this.getUpgradeCost(baseUpgradeCost);
        
        const skillEffects = this.getSkillEffects();
        if (skillEffects.costReduction > 0 && actualUpgradeCost < baseUpgradeCost) {
            upgradeBtn.innerHTML = `<i class="fas fa-arrow-up"></i><span>Upgrade (<span class="original-cost">${baseUpgradeCost}</span> → ${actualUpgradeCost}G)</span>`;
        } else {
            upgradeBtn.innerHTML = `<i class="fas fa-arrow-up"></i><span>Upgrade (${actualUpgradeCost}G)</span>`;
        }
        upgradeBtn.disabled = this.money < actualUpgradeCost;
        
        const sellBtn = document.getElementById('sellBtn');
        const baseSellValue = Math.floor(tower.value * 0.7);
        const actualSellValue = Math.floor(baseSellValue * (1 + skillEffects.sellValueBonus));
        
        if (skillEffects.sellValueBonus > 0) {
            sellBtn.innerHTML = `<i class="fas fa-trash"></i><span>Verkaufen (<span class="original-cost">${baseSellValue}</span> → ${actualSellValue}G)</span>`;
        } else {
            sellBtn.innerHTML = `<i class="fas fa-trash"></i><span>Verkaufen (${actualSellValue}G)</span>`;
        }
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
        
        // Skill-Effekte hinzufügen
        const skillEffects = this.getSkillEffects();
        
        if (skillEffects.critChance > 0) {
            specialStats += `
                <div class="stat-row skill-effect">
                    <span class="stat-name"><i class="fas fa-star"></i> Kritische Treffer:</span>
                    <span class="stat-value">${Math.round(skillEffects.critChance * 100)}% (${skillEffects.critMultiplier}x)</span>
                </div>`;
        }
        
        if (skillEffects.multiShotChance > 0) {
            specialStats += `
                <div class="stat-row skill-effect">
                    <span class="stat-name"><i class="fas fa-bullseye"></i> Mehrfachschuss:</span>
                    <span class="stat-value">${Math.round(skillEffects.multiShotChance * 100)}%</span>
                </div>`;
        }
        
        if (skillEffects.armorPiercing > 0) {
            specialStats += `
                <div class="stat-row skill-effect">
                    <span class="stat-name"><i class="fas fa-shield"></i> Rüstungsdurchbruch:</span>
                    <span class="stat-value">${Math.round(skillEffects.armorPiercing * 100)}%</span>
                </div>`;
        }
        
        if (skillEffects.splashRadius > 1 && (tower.type === 'fire' || tower.splash)) {
            specialStats += `
                <div class="stat-row skill-effect">
                    <span class="stat-name"><i class="fas fa-bomb"></i> Splash-Radius:</span>
                    <span class="stat-value">+${Math.round((skillEffects.splashRadius - 1) * 100)}%</span>
                </div>`;
        }
        
        if (skillEffects.lifeStealChance > 0) {
            specialStats += `
                <div class="stat-row skill-effect">
                    <span class="stat-name"><i class="fas fa-heart"></i> Lebensentzug:</span>
                    <span class="stat-value">${Math.round(skillEffects.lifeStealChance * 100)}%</span>
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
        
        const baseUpgradeCost = Math.floor(this.selectedTower.value * 0.5);
        const actualUpgradeCost = this.getUpgradeCost(baseUpgradeCost);
        if (this.money >= actualUpgradeCost) {
            this.money -= actualUpgradeCost;
            this.selectedTower.upgrade();
            
            // Send to multiplayer if connected (coop mode only)
            if (this.multiplayerMode === 'coop' && multiplayerManager && multiplayerManager.isConnected()) {
                multiplayerManager.sendTowerUpgraded(this.selectedTower);
            }
            
            // Update statistics
            this.sessionStats.upgrades++;
            this.sessionStats.goldSpent += actualUpgradeCost;
            this.updateStatistic('upgrades', 1);
            this.updateStatistic('goldSpent', actualUpgradeCost);
            
            this.updateUI();
            this.showTowerUpgrade(this.selectedTower);
        }
    }
    
    sellTower() {
        if (!this.selectedTower) return;
        
        const skillEffects = this.getSkillEffects();
        const baseSellValue = Math.floor(this.selectedTower.value * 0.7);
        const sellValue = Math.floor(baseSellValue * (1 + skillEffects.sellValueBonus));
        const towerX = this.selectedTower.x;
        const towerY = this.selectedTower.y;
        
        this.money += sellValue;
        
        // Send to multiplayer if connected (coop mode only)
        if (this.multiplayerMode === 'coop' && multiplayerManager && multiplayerManager.isConnected()) {
            multiplayerManager.sendTowerSold(towerX, towerY, sellValue);
        }
        
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
    
    getEffectiveTowerDamage(tower) {
        const skillEffects = this.getSkillEffects();
        const baseDamage = tower.damage;
        const effectiveDamage = Math.floor(baseDamage * skillEffects.damageMultiplier);
        
        if (skillEffects.damageMultiplier > 1) {
            return `${baseDamage} → ${effectiveDamage} (+${Math.round((skillEffects.damageMultiplier - 1) * 100)}%)`;
        }
        return `${baseDamage}`;
    }

    // PvP Enemy Sending System
    sendPvPEnemies(enemyType, count) {
        if (!this.multiplayerMode || this.multiplayerMode !== 'pvp') {
            this.showMessage('Nur im PvP-Modus verfügbar!');
            return;
        }
        
        if (!multiplayerManager || !multiplayerManager.isConnected()) {
            this.showMessage('Nicht mit Gegner verbunden!');
            return;
        }
        
        const cost = this.getPvPEnemyCost(enemyType, count);
        if (this.money < cost) {
            this.showMessage('Nicht genug Geld!');
            return;
        }
        
        this.money -= cost;
        multiplayerManager.sendEnemies(enemyType, count);
        this.showMessage(`${count}x ${enemyType} Feinde gesendet!`);
        this.updateUI();
    }
    
    getPvPEnemyCost(enemyType, count) {
        const costs = {
            'basic': 10,
            'fast': 20,
            'tank': 40,
            'flying': 25,
            'boss': 150,
            'swarm': 12
        };
        return (costs[enemyType] || 10) * count;
    }
    
    // Coop Abilities
    useCoopAbility(abilityType) {
        if (!this.multiplayerMode || this.multiplayerMode !== 'coop') {
            this.showMessage('Nur im Coop-Modus verfügbar!');
            return;
        }
        
        if (!multiplayerManager || !multiplayerManager.isConnected()) {
            this.showMessage('Nicht mit Partner verbunden!');
            return;
        }
        
        const cost = this.getCoopAbilityCost(abilityType);
        if (this.money < cost) {
            this.showMessage('Nicht genug Geld!');
            return;
        }
        
        this.money -= cost;
        
        switch (abilityType) {
            case 'goldRush':
                this.goldRush();
                multiplayerManager.sendSpecialAbility('goldRush', 'Gold Rush');
                break;
            case 'freezeAll':
                this.freezeAllEnemies();
                multiplayerManager.sendSpecialAbility('freezeAll', 'Freeze All');
                break;
        }
        
        this.updateUI();
    }
    
    getCoopAbilityCost(abilityType) {
        const costs = {
            'goldRush': 100,
            'freezeAll': 75
        };
        return costs[abilityType] || 50;
    }
    
    goldRush() {
        this.money += 200;
        this.showMessage('Gold Rush aktiviert! +200 Gold');
    }
    
    freezeAllEnemies() {
        this.enemies.forEach(enemy => {
            enemy.freezeTime = 3000; // 3 Sekunden einfrieren
        });
        this.showMessage('Alle Feinde eingefroren!');
    }
    
    // Multiplayer UI Updates
    updateMultiplayerUI() {
        if (!this.multiplayerMode) return;
        
        if (this.multiplayerMode === 'pvp') {
            const pvpPanel = document.getElementById('pvpEnemyPanel');
            const coopPanel = document.getElementById('coopInfoPanel');
            
            if (pvpPanel) {
                pvpPanel.style.display = 'block';
                const moneySpan = document.getElementById('pvpMoney');
                if (moneySpan) moneySpan.textContent = this.money;
            }
            if (coopPanel) coopPanel.style.display = 'none';
            
        } else if (this.multiplayerMode === 'coop') {
            const pvpPanel = document.getElementById('pvpEnemyPanel');
            const coopPanel = document.getElementById('coopInfoPanel');
            
            if (pvpPanel) pvpPanel.style.display = 'none';
            if (coopPanel) {
                coopPanel.style.display = 'block';
                
                // Update shared resources display
                const moneySpan = document.getElementById('coopSharedMoney');
                const livesSpan = document.getElementById('coopSharedLives');
                const scoreSpan = document.getElementById('coopSharedScore');
                
                if (moneySpan) moneySpan.textContent = this.money;
                if (livesSpan) livesSpan.textContent = this.lives;
                if (scoreSpan) scoreSpan.textContent = this.score;
                
                // Update partner info
                const partnerInfo = document.getElementById('coopPartnerInfo');
                if (partnerInfo && multiplayerManager) {
                    const partner = Array.from(multiplayerManager.players.values())
                        .find(p => p.id !== multiplayerManager.playerId);
                    partnerInfo.textContent = partner ? `Partner: ${partner.name}` : 'Partner: Warte...';
                }
            }
        }
    }
    
    getEffectiveTowerRange(tower) {
        const skillEffects = this.getSkillEffects();
        const baseRange = tower.range;
        const effectiveRange = Math.floor(baseRange * skillEffects.rangeMultiplier);
        
        if (skillEffects.rangeMultiplier > 1) {
            return `${baseRange} → ${effectiveRange} (+${Math.round((skillEffects.rangeMultiplier - 1) * 100)}%)`;
        }
        return `${baseRange}`;
    }
    
    getEffectiveTowerFireRate(tower) {
        const skillEffects = this.getSkillEffects();
        const baseSpeed = tower.speed; // Millisekunden zwischen Schüssen
        const effectiveSpeed = Math.floor(baseSpeed / skillEffects.fireRateMultiplier);
        
        if (skillEffects.fireRateMultiplier > 1) {
            // Feuerrate = 1 / (speed in seconds) = 1000 / speed_in_ms
            const baseRate = (1000 / baseSpeed).toFixed(1);
            const effectiveRate = (1000 / effectiveSpeed).toFixed(1);
            return `${baseRate} → ${effectiveRate}/s (+${Math.round((skillEffects.fireRateMultiplier - 1) * 100)}%)`;
        }
        const rate = (1000 / baseSpeed).toFixed(1);
        return `${rate}/s`;
    }
    
    getEffectiveSellValue(tower) {
        const skillEffects = this.getSkillEffects();
        const baseSellValue = Math.floor(tower.value * 0.7);
        const effectiveSellValue = Math.floor(baseSellValue * (1 + skillEffects.sellValueBonus));
        
        if (skillEffects.sellValueBonus > 0) {
            return `${baseSellValue} → ${effectiveSellValue} (+${Math.round(skillEffects.sellValueBonus * 100)}%)`;
        }
        return `${baseSellValue}`;
    }
    
    getUpgradeCost(baseCost) {
        const skillEffects = this.getSkillEffects();
        return Math.floor(baseCost * (1 - skillEffects.costReduction));
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
        const skillEffects = this.getSkillEffects();
        const baseGold = 100;
        const goldWithBonus = Math.floor(baseGold * skillEffects.goldMultiplier);
        
        this.money += goldWithBonus;
        this.goldEarned += goldWithBonus;
        this.showMessage(`+${goldWithBonus} Gold Rush!`, 'success');
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
                const skillEffects = this.getSkillEffects();
                const bonusGold = Math.floor(50 * skillEffects.goldMultiplier);
                this.money += bonusGold;
                this.goldEarned += bonusGold;
                powerUpNotification.querySelector('.power-up-text').textContent = `+${bonusGold} Bonus Gold!`;
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
        // Menu event listeners are now set up globally in setupMainMenuEventListeners()
        // This method is kept for other modal event listeners
        
        // Settings Modal Event Listeners
        this.setupSettingsEventListeners();
        
        // Game Over Screen Event Listeners
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
        console.log('startGameFromMenu() called');
        
        const mainMenu = document.getElementById('mainMenu');
        const gameContainer = document.getElementById('gameContainer');
        const changelogBtn = document.getElementById('changelogBtn');
        
        console.log('DOM elements found:', {
            mainMenu: !!mainMenu,
            gameContainer: !!gameContainer,
            changelogBtn: !!changelogBtn
        });
        
        if (mainMenu) {
            console.log('Hiding main menu');
            mainMenu.style.display = 'none';
        }
        if (gameContainer) {
            console.log('Showing game container');
            gameContainer.style.display = 'block';
        }
        if (changelogBtn) changelogBtn.style.display = 'none'; // Button verstecken im Spiel
        
        // Canvas initialisieren falls nicht bereits geschehen
        if (!this.canvas) {
            console.log('Initializing canvas');
            this.initializeCanvas();
        } else {
            console.log('Canvas already exists');
        }
        
        // Spiel zurücksetzen und starten
        console.log('Restarting game');
        this.restartGame();
        this.gamePaused = false;
        
        // Initialize new systems if not already done
        if (!guildSystem) {
            guildSystem = new GuildSystem();
            guildSystem.initialize();
        }
        
        if (!prestigeSystem) {
            prestigeSystem = new PrestigeSystem();
            prestigeSystem.initialize();
        }
        
        console.log('Game started successfully');
        
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
        const changelogBtn = document.getElementById('changelogBtn');
        
        if (mainMenu) mainMenu.style.display = 'flex';
        if (gameContainer) gameContainer.style.display = 'none';
        if (gameOverScreen) gameOverScreen.style.display = 'none';
        if (changelogBtn) changelogBtn.style.display = 'flex'; // Button wieder anzeigen im Hauptmenü
        
        // Skill Points Badge aktualisieren
        this.updateSkillPointsBadge();
        
        // Spiel pausieren
        this.gamePaused = true;
    }

    exitTestMode() {
        if (!this.testModeData) return;
        
        // Remove test notification
        if (this.testModeData.notification && this.testModeData.notification.parentNode) {
            this.testModeData.notification.remove();
        }
        
        // Restore original map
        this.currentMapId = this.testModeData.originalMapId;
        delete this.maps['test_map'];
        
        // Clear test mode data
        this.testModeData = null;
        
        // Return to main menu
        this.showMainMenu();
        
        // Reopen map editor
        setTimeout(() => {
            this.showMapEditor();
        }, 100);
        
        // Show return notification
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
        notification.innerHTML = `
            <i class="fas fa-arrow-left"></i> Zurück zum Map Editor
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
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

    showSkillTreeFromMenu() {
        console.log('showSkillTreeFromMenu called');
        const modal = document.getElementById('skillTreeModal');
        console.log('Modal found:', modal);
        console.log('Modal current display style:', modal ? modal.style.display : 'modal not found');
        if (modal) {
            console.log('Updating skill tree UI...');
            this.updateSkillTreeUI();
            console.log('Setting modal display to flex...');
            modal.style.display = 'flex';
            // Temporärer roter Hintergrund für Debug
            modal.style.background = 'rgba(255, 0, 0, 0.5)';
            modal.style.zIndex = '99999';
            console.log('Modal display after setting:', modal.style.display);
            console.log('Modal computed styles:', window.getComputedStyle(modal));
            console.log('Modal should now be visible');
        } else {
            console.error('skillTreeModal element not found in DOM!');
        }
    }

    updateSkillPointsBadge() {
        const badge = document.getElementById('skillPointsBadge');
        const button = document.getElementById('skillTreeMenu');
        
        if (badge && button) {
            if (this.skillPoints > 0) {
                badge.textContent = this.skillPoints;
                badge.style.display = 'block';
                button.classList.add('has-points');
            } else {
                badge.style.display = 'none';
                button.classList.remove('has-points');
            }
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
            this.loadCustomMaps();
            this.updateMapSelectionDisplay();
            modal.style.display = 'flex';
        }
    }

    loadCustomMaps() {
        const savedMaps = JSON.parse(localStorage.getItem('customMaps') || '[]');
        
        // Add custom maps to the maps object
        savedMaps.forEach(map => {
            this.maps[map.id] = map;
        });
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
        
        // Add custom maps section
        this.updateCustomMapsDisplay();
        
        // Initialize temp selection
        this.tempSelectedMapId = this.currentMapId;
    }

    updateCustomMapsDisplay() {
        const customMapsSection = document.getElementById('customMapsSection');
        const customMapsGrid = document.getElementById('customMapsGrid');
        const savedMaps = JSON.parse(localStorage.getItem('customMaps') || '[]');
        
        if (savedMaps.length === 0) {
            customMapsSection.style.display = 'none';
            return;
        }
        
        customMapsSection.style.display = 'block';
        customMapsGrid.innerHTML = '';
        
        savedMaps.forEach(map => {
            const mapCard = document.createElement('div');
            mapCard.className = `custom-map-card ${this.currentMapId === map.id ? 'selected' : ''}`;
            
            mapCard.innerHTML = `
                <div class="custom-map-preview">
                    <canvas width="260" height="100"></canvas>
                </div>
                <div class="custom-map-info">
                    <h4>${map.name}</h4>
                    <p>${map.description}</p>
                    <div class="custom-map-meta">
                        <span class="map-difficulty ${map.difficulty.toLowerCase()}">${map.difficulty}</span>
                        <span class="map-created">${new Date(map.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="custom-map-actions">
                    <button class="menu-btn secondary small" onclick="game.editCustomMap('${map.id}')">
                        <i class="fas fa-edit"></i> Bearbeiten
                    </button>
                    <button class="menu-btn danger small" onclick="game.deleteCustomMap('${map.id}')">
                        <i class="fas fa-trash"></i> Löschen
                    </button>
                </div>
            `;
            
            // Draw mini preview
            const canvas = mapCard.querySelector('canvas');
            this.drawMiniPath(canvas, map.path);
            
            // Add click handler
            mapCard.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons
                if (e.target.closest('.custom-map-actions')) return;
                
                // Remove selection from other cards
                document.querySelectorAll('.map-card, .custom-map-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                // Select this card
                mapCard.classList.add('selected');
                
                // Update selection info
                const selectedMapName = document.getElementById('selectedMapName');
                const selectedMapDescription = document.getElementById('selectedMapDescription');
                if (selectedMapName && selectedMapDescription) {
                    selectedMapName.textContent = map.name;
                    selectedMapDescription.textContent = map.description;
                }
                
                // Store temporary selection
                this.tempSelectedMapId = map.id;
            });
            
            customMapsGrid.appendChild(mapCard);
        });
    }

    editCustomMap(mapId) {
        const savedMaps = JSON.parse(localStorage.getItem('customMaps') || '[]');
        const map = savedMaps.find(m => m.id === mapId);
        
        if (map) {
            // Close map selection and open editor with loaded map
            closeModal('mapSelectionModal');
            this.showMapEditor();
            
            // Load map data into editor
            setTimeout(() => {
                if (this.mapEditor) {
                    this.mapEditor.loadMap(map);
                }
            }, 100);
        }
    }

    deleteCustomMap(mapId) {
        if (confirm('Möchtest du diese Custom Map wirklich löschen?')) {
            let savedMaps = JSON.parse(localStorage.getItem('customMaps') || '[]');
            savedMaps = savedMaps.filter(m => m.id !== mapId);
            localStorage.setItem('customMaps', JSON.stringify(savedMaps));
            
            // Remove from current maps object
            delete this.maps[mapId];
            
            // If this was the selected map, switch back to classic
            if (this.currentMapId === mapId) {
                this.currentMapId = 'classic';
            }
            
            // Refresh display
            this.updateCustomMapsDisplay();
        }
    }

    showMapEditor() {
        const modal = document.getElementById('mapEditorModal');
        if (modal) {
            modal.style.display = 'flex';
            this.initializeMapEditor();
        }
    }

    initializeMapEditor() {
        if (!this.mapEditor) {
            this.mapEditor = new MapEditor();
        }
        this.mapEditor.initialize();
    }

    showMultiplayer() {
        const modal = document.getElementById('multiplayerModal');
        if (modal) {
            modal.style.display = 'flex';
            this.initializeMultiplayer();
        }
    }

    initializeMultiplayer() {
        if (!this.multiplayer) {
            this.multiplayer = new MultiplayerManager();
        }
        // Make it globally accessible as multiplayerManager
        window.multiplayerManager = this.multiplayer;
        this.multiplayer.initialize();
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
                
                // Apply skill effects
                const skillEffects = this.getSkillEffects();
                const finalReward = Math.floor(baseReward * skillEffects.goldMultiplier);
                
                // Treasure hunter skill chance for bonus gold
                if (Math.random() < skillEffects.treasureChance) {
                    this.money += skillEffects.treasureAmount;
                    this.goldEarned += skillEffects.treasureAmount;
                }
                
                // Combo-System anwenden
                this.updateCombo(finalReward);
                
                // Handle special enemy death effects
                enemy.onDeath(this);
                
                // Lebensentzug-Skill (Life Steal)
                const lifeStealSkill = this.getSkillEffects();
                if (Math.random() < lifeStealSkill.lifeStealChance) {
                    this.lives += 1;
                    console.log(`Life steal activated! +1 Leben. Current lives: ${this.lives}`);
                    this.showMessage('+1 Leben (Lebensentzug)!', 'success');
                }
                
                // Geld mit Combo-Bonus und bereits angewendeten Skill-Bonus
                this.money += finalReward;
                this.goldEarned += finalReward;
                this.score += enemy.points * this.comboMultiplier;
                this.totalKills++;
                
                // Update statistics
                this.sessionStats.kills++;
                this.sessionStats.goldEarned += finalReward;
                this.updateStatistic('totalKills', 1);
                this.updateStatistic('totalGold', finalReward);
                
                // Check for skill point rewards from kills
                this.checkKillSkillPointRewards();
                
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
        const skillEffects = this.getSkillEffects();
        const baseWaveBonus = 25 + Math.floor(this.wave * 2);
        const waveBonus = Math.floor(baseWaveBonus * skillEffects.goldMultiplier);
        this.money += waveBonus;
        this.goldEarned += waveBonus;
        
        // Skill-Punkte für Wellen-Abschluss
        this.checkWaveSkillPointRewards();
        
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
        
        // Hintergrund rendern basierend auf ausgerüstetem Background
        this.drawBackground();
        
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
        if (!this.ctx || !this.path || this.path.length === 0) return;
        
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
    
    drawBackground() {
        const equippedItems = this.getEquippedItems();
        const backgroundId = equippedItems.background;
        
        if (!backgroundId) {
            // Standard-Hintergrund (schwarz)
            this.ctx.fillStyle = '#0a0a0a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        // Verschiedene Hintergründe basierend auf Item ID
        switch(backgroundId) {
            case 'space_battle':
                this.drawSpaceBattleBackground();
                break;
            case 'medieval_castle':
                this.drawMedievalCastleBackground();
                break;
            case 'neon_city':
                this.drawNeonCityBackground();
                break;
            case 'tropical_island':
                this.drawTropicalIslandBackground();
                break;
            default:
                // Fallback zu Standard-Hintergrund
                this.ctx.fillStyle = '#0a0a0a';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    drawSpaceBattleBackground() {
        // Weltraum-Hintergrund mit Sternen
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Sterne hinzufügen (statische Positionen basierend auf Zeit)
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            const x = (i * 137.5) % this.canvas.width; // Pseudo-random basierend auf Index
            const y = (i * 179.3) % this.canvas.height;
            const size = (i % 3) + 1;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Entfernte Planeten
        this.ctx.fillStyle = 'rgba(100, 100, 200, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width * 0.8, this.canvas.height * 0.2, 30, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawMedievalCastleBackground() {
        // Mittelalterlicher Hintergrund
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(0.3, '#34495e');
        gradient.addColorStop(1, '#1a252f');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Burg-Silhouette im Hintergrund
        this.ctx.fillStyle = 'rgba(52, 73, 94, 0.7)';
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width * 0.1, this.canvas.height * 0.8);
        this.ctx.lineTo(this.canvas.width * 0.2, this.canvas.height * 0.4);
        this.ctx.lineTo(this.canvas.width * 0.3, this.canvas.height * 0.5);
        this.ctx.lineTo(this.canvas.width * 0.4, this.canvas.height * 0.3);
        this.ctx.lineTo(this.canvas.width * 0.5, this.canvas.height * 0.6);
        this.ctx.lineTo(this.canvas.width * 0.9, this.canvas.height * 0.7);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawNeonCityBackground() {
        // Cyberpunk Neon-Stadt
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.5, '#1a1a3a');
        gradient.addColorStop(1, '#2d1b69');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Neon-Gebäude
        const buildingColors = ['#ff0080', '#00ff80', '#0080ff', '#ff8000'];
        for (let i = 0; i < 8; i++) {
            const x = (i * this.canvas.width) / 8;
            const height = 100 + (i * 30) % 200;
            const width = this.canvas.width / 8;
            
            this.ctx.fillStyle = 'rgba(0, 0, 40, 0.8)';
            this.ctx.fillRect(x, this.canvas.height - height, width, height);
            
            // Neon-Umriss
            this.ctx.strokeStyle = buildingColors[i % buildingColors.length];
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, this.canvas.height - height, width, height);
            
            // Fenster
            this.ctx.fillStyle = buildingColors[i % buildingColors.length];
            for (let w = 0; w < 3; w++) {
                for (let h = 0; h < Math.floor(height / 20); h++) {
                    if (Math.random() > 0.7) {
                        this.ctx.fillRect(x + w * 15 + 5, this.canvas.height - height + h * 20 + 5, 8, 8);
                    }
                }
            }
        }
    }
    
    drawTropicalIslandBackground() {
        // Tropische Insel
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.6);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#98D8E8');
        
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.6);
        
        // Ozean
        const oceanGradient = this.ctx.createLinearGradient(0, this.canvas.height * 0.6, 0, this.canvas.height);
        oceanGradient.addColorStop(0, '#4682B4');
        oceanGradient.addColorStop(1, '#2F4F4F');
        
        this.ctx.fillStyle = oceanGradient;
        this.ctx.fillRect(0, this.canvas.height * 0.6, this.canvas.width, this.canvas.height * 0.4);
        
        // Palmen
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(50, this.canvas.height * 0.4, 10, this.canvas.height * 0.2);
        this.ctx.fillRect(this.canvas.width - 100, this.canvas.height * 0.3, 12, this.canvas.height * 0.3);
        
        // Palmblätter
        this.ctx.fillStyle = '#228B22';
        this.ctx.beginPath();
        this.ctx.arc(55, this.canvas.height * 0.4, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width - 94, this.canvas.height * 0.3, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sonne
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width * 0.8, this.canvas.height * 0.2, 30, 0, Math.PI * 2);
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
            const baseCost = parseInt(card.dataset.cost);
            const towerType = card.dataset.tower;
            const actualCost = this.getTowerCost(towerType);
            
            // Kostenreduzierung durch Skills
            const skillEffects = this.getSkillEffects();
            const isReduced = skillEffects.costReduction > 0;
            
            // Aktualisiere die Kostenanzeige
            const costElement = card.querySelector('.tower-cost');
            if (costElement) {
                if (isReduced && actualCost < baseCost) {
                    costElement.innerHTML = `<i class="fas fa-coins"></i> <span class="original-cost">${baseCost}</span> → ${actualCost}`;
                    costElement.classList.add('reduced-cost');
                } else {
                    costElement.innerHTML = `<i class="fas fa-coins"></i> ${actualCost}`;
                    costElement.classList.remove('reduced-cost');
                }
            }
            
            // Verfügbarkeit basierend auf aktuellen Kosten
            if (this.money < actualCost) {
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
        
        // Skill-Effekte Panel updaten
        this.updateSkillEffectsDisplay();
        
        // Multiplayer UI updaten
        this.updateMultiplayerUI();
    }
    
    updateSkillEffectsDisplay() {
        const skillEffectsList = document.getElementById('skillEffectsList');
        const skillEffectsPanel = document.getElementById('skillEffectsPanel');
        
        if (!skillEffectsList || !skillEffectsPanel) return;
        
        const effects = this.getSkillEffects();
        skillEffectsList.innerHTML = '';
        
        // Nur Effekte anzeigen, die aktiv sind (nicht Standard-Werte)
        const activeEffects = [];
        
        if (effects.damageMultiplier > 1) {
            activeEffects.push({
                text: `+${Math.round((effects.damageMultiplier - 1) * 100)}% Schaden`,
                icon: 'fas fa-sword',
                class: 'damage'
            });
        }
        
        if (effects.goldMultiplier > 1) {
            activeEffects.push({
                text: `+${Math.round((effects.goldMultiplier - 1) * 100)}% Gold`,
                icon: 'fas fa-coins',
                class: 'gold'
            });
        }
        
        if (effects.fireRateMultiplier > 1) {
            activeEffects.push({
                text: `+${Math.round((effects.fireRateMultiplier - 1) * 100)}% Feuerrate`,
                icon: 'fas fa-tachometer-alt',
                class: 'support'
            });
        }
        
        if (effects.rangeMultiplier > 1) {
            activeEffects.push({
                text: `+${Math.round((effects.rangeMultiplier - 1) * 100)}% Reichweite`,
                icon: 'fas fa-expand-arrows-alt',
                class: 'support'
            });
        }
        
        if (effects.costReduction > 0) {
            activeEffects.push({
                text: `-${Math.round(effects.costReduction * 100)}% Tower Kosten`,
                icon: 'fas fa-percentage',
                class: 'economy'
            });
        }
        
        if (effects.critChance > 0) {
            activeEffects.push({
                text: `${Math.round(effects.critChance * 100)}% Kritisch`,
                icon: 'fas fa-star',
                class: 'damage'
            });
        }
        
        if (effects.multiShotChance > 0) {
            activeEffects.push({
                text: `${Math.round(effects.multiShotChance * 100)}% Mehrfachschuss`,
                icon: 'fas fa-bullseye',
                class: 'support'
            });
        }
        
        if (effects.interestRate > 0) {
            activeEffects.push({
                text: `${Math.round(effects.interestRate * 100)}% Zinssatz`,
                icon: 'fas fa-chart-line',
                class: 'economy'
            });
        }
        
        if (effects.armorPiercing > 0) {
            activeEffects.push({
                text: `${effects.armorPiercing} Rüstungsdurchbruch`,
                icon: 'fas fa-shield',
                class: 'damage'
            });
        }
        
        if (effects.splashRadius > 1) {
            activeEffects.push({
                text: `+${Math.round((effects.splashRadius - 1) * 100)}% Splash-Radius`,
                icon: 'fas fa-bomb',
                class: 'damage'
            });
        }
        
        if (effects.lifeStealChance > 0) {
            activeEffects.push({
                text: `${Math.round(effects.lifeStealChance * 100)}% Lebensentzug`,
                icon: 'fas fa-heart',
                class: 'support'
            });
        }
        
        if (effects.sellValueBonus > 0) {
            activeEffects.push({
                text: `+${Math.round(effects.sellValueBonus * 100)}% Verkaufswert`,
                icon: 'fas fa-money-bill-wave',
                class: 'economy'
            });
        }
        
        if (effects.treasureChance > 0) {
            activeEffects.push({
                text: `${Math.round(effects.treasureChance * 100)}% Schatzfund`,
                icon: 'fas fa-gem',
                class: 'economy'
            });
        }
        
        // Effekte als Badges anzeigen
        activeEffects.forEach(effect => {
            const badge = document.createElement('div');
            badge.className = `skill-effect-badge ${effect.class}`;
            badge.innerHTML = `<i class="${effect.icon}"></i> ${effect.text}`;
            skillEffectsList.appendChild(badge);
        });
        
        // Panel nur anzeigen wenn Effekte aktiv sind
        skillEffectsPanel.style.display = activeEffects.length > 0 ? 'block' : 'none';
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

    // Trading System Implementation
    initializeTradingSystem() {
        // Trading-Inventar initialisieren
        this.inventory = this.loadInventory();
        this.marketplace = this.loadMarketplace();
        this.tradingCurrency = this.loadTradingCurrency();
        
        // Täglich neue Items im Marktplatz generieren
        this.refreshMarketplace();
        
        console.log('Trading system initialized');
    }

    loadInventory() {
        const savedInventory = localStorage.getItem('rushRoyalInventory');
        return savedInventory ? JSON.parse(savedInventory) : {
            skins: {
                towers: [],
                backgrounds: [],
                projectiles: []
            },
            items: {
                powerUps: [],
                boosters: [],
                decorations: []
            },
            currency: {
                gems: 0,
                coins: 1000 // Startwährung
            }
        };
    }

    loadMarketplace() {
        const savedMarketplace = localStorage.getItem('rushRoyalMarketplace');
        const today = new Date().toDateString();
        
        if (savedMarketplace) {
            const data = JSON.parse(savedMarketplace);
            // Prüfen ob es ein neuer Tag ist
            if (data.lastRefresh === today) {
                return data;
            }
        }
        
        // Neuen Marktplatz generieren
        return this.generateMarketplace();
    }

    loadTradingCurrency() {
        return this.inventory.currency || { gems: 0, coins: 1000 };
    }

    generateMarketplace() {
        const today = new Date().toDateString();
        
        const marketplace = {
            lastRefresh: today,
            dailyDeals: [],
            featuredItems: [],
            regularItems: []
        };

        // Tower Skins
        const towerSkins = [
            { id: 'golden_basic', name: 'Goldener Basic Tower', type: 'tower_skin', rarity: 'epic', price: 150, description: 'Glänzender goldener Tower mit +10% Schaden' },
            { id: 'ice_crystal', name: 'Eiskristall Tower', type: 'tower_skin', rarity: 'rare', price: 100, description: 'Kristalliner Ice Tower mit Schnee-Effekt' },
            { id: 'fire_demon', name: 'Feuer-Dämon Tower', type: 'tower_skin', rarity: 'legendary', price: 300, description: 'Dämonischer Fire Tower mit Flammen-Aura' },
            { id: 'lightning_storm', name: 'Sturm-Blitz Tower', type: 'tower_skin', rarity: 'epic', price: 200, description: 'Lightning Tower mit Sturm-Effekten' },
            { id: 'toxic_waste', name: 'Giftmüll Tower', type: 'tower_skin', rarity: 'rare', price: 120, description: 'Poison Tower mit Giftblasen' },
            { id: 'cyber_sniper', name: 'Cyber Sniper', type: 'tower_skin', rarity: 'legendary', price: 400, description: 'Futuristischer Sniper mit Laser-Visier' }
        ];

        // Background Themes
        const backgrounds = [
            { id: 'space_battle', name: 'Weltraum Schlacht', type: 'background', rarity: 'epic', price: 250, description: 'Spektakulärer Weltraum-Hintergrund' },
            { id: 'medieval_castle', name: 'Mittelalterliche Burg', type: 'background', rarity: 'rare', price: 180, description: 'Klassischer Burg-Hintergrund' },
            { id: 'neon_city', name: 'Neon City', type: 'background', rarity: 'legendary', price: 350, description: 'Cyberpunk-Stadt mit Neon-Lichtern' },
            { id: 'tropical_island', name: 'Tropische Insel', type: 'background', rarity: 'common', price: 80, description: 'Entspannende Tropeninsel' }
        ];

        // Power-Up Items
        const powerUps = [
            { id: 'damage_boost_30min', name: 'Schaden Boost (30min)', type: 'powerup', rarity: 'common', price: 50, description: '+50% Schaden für 30 Minuten' },
            { id: 'gold_magnet_1hour', name: 'Gold Magnet (1h)', type: 'powerup', rarity: 'rare', price: 100, description: '+100% Gold für 1 Stunde' },
            { id: 'wave_skip', name: 'Wellen Skipper', type: 'powerup', rarity: 'epic', price: 200, description: 'Überspringe die nächste Welle' },
            { id: 'instant_upgrade', name: 'Sofort Upgrade', type: 'powerup', rarity: 'rare', price: 150, description: 'Upgrade einen Tower sofort auf Level 5' }
        ];

        // Projektil-Effekte
        const projectileEffects = [
            { id: 'rainbow_trail', name: 'Regenbogen Spur', type: 'projectile_effect', rarity: 'rare', price: 90, description: 'Projektile hinterlassen Regenbogen-Spuren' },
            { id: 'star_burst', name: 'Sternen Explosion', type: 'projectile_effect', rarity: 'epic', price: 180, description: 'Projektile explodieren in Sternen' },
            { id: 'lightning_chain', name: 'Blitz Kette', type: 'projectile_effect', rarity: 'legendary', price: 280, description: 'Alle Projektile haben Chain Lightning' }
        ];

        const allItems = [...towerSkins, ...backgrounds, ...powerUps, ...projectileEffects];

        // Daily Deals (3 zufällige Items mit Rabatt)
        for (let i = 0; i < 3; i++) {
            const item = allItems[Math.floor(Math.random() * allItems.length)];
            marketplace.dailyDeals.push({
                ...item,
                originalPrice: item.price,
                price: Math.floor(item.price * 0.7), // 30% Rabatt
                discount: 30
            });
        }

        // Featured Items (Premium Items)
        const legendaryItems = allItems.filter(item => item.rarity === 'legendary');
        marketplace.featuredItems = legendaryItems.slice(0, 2);

        // Regular Items (6 zufällige Items)
        const regularItemsPool = allItems.filter(item => item.rarity !== 'legendary');
        for (let i = 0; i < 6; i++) {
            const item = regularItemsPool[Math.floor(Math.random() * regularItemsPool.length)];
            if (!marketplace.regularItems.find(existing => existing.id === item.id)) {
                marketplace.regularItems.push(item);
            }
        }

        return marketplace;
    }

    refreshMarketplace() {
        const today = new Date().toDateString();
        
        if (!this.marketplace.lastRefresh || this.marketplace.lastRefresh !== today) {
            this.marketplace = this.generateMarketplace();
            this.saveMarketplace();
        }
    }

    saveInventory() {
        localStorage.setItem('rushRoyalInventory', JSON.stringify(this.inventory));
    }

    saveMarketplace() {
        localStorage.setItem('rushRoyalMarketplace', JSON.stringify(this.marketplace));
    }

    showTradingSystem() {
        const modal = document.getElementById('tradingModal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateTradingDisplay();
        }
    }

    updateTradingDisplay() {
        this.updateCurrencyDisplay();
        this.updateMarketplaceDisplay();
        this.updateInventoryDisplay();
    }

    updateCurrencyDisplay() {
        const coinsElement = document.getElementById('playerCoins');
        const gemsElement = document.getElementById('playerGems');
        
        if (coinsElement) coinsElement.textContent = this.inventory.currency.coins.toLocaleString();
        if (gemsElement) gemsElement.textContent = this.inventory.currency.gems.toLocaleString();
    }

    updateMarketplaceDisplay() {
        this.updateDailyDeals();
        this.updateFeaturedItems();
        this.updateRegularItems();
    }

    updateDailyDeals() {
        const container = document.getElementById('dailyDealsContainer');
        if (!container) return;

        container.innerHTML = '';

        this.marketplace.dailyDeals.forEach(item => {
            const itemCard = this.createMarketplaceItemCard(item, true);
            container.appendChild(itemCard);
        });
    }

    updateFeaturedItems() {
        const container = document.getElementById('featuredItemsContainer');
        if (!container) return;

        container.innerHTML = '';

        this.marketplace.featuredItems.forEach(item => {
            const itemCard = this.createMarketplaceItemCard(item, false);
            container.appendChild(itemCard);
        });
    }

    updateRegularItems() {
        const container = document.getElementById('regularItemsContainer');
        if (!container) return;

        container.innerHTML = '';

        this.marketplace.regularItems.forEach(item => {
            const itemCard = this.createMarketplaceItemCard(item, false);
            container.appendChild(itemCard);
        });
    }

    createMarketplaceItemCard(item, isDailyDeal = false) {
        const card = document.createElement('div');
        card.className = `marketplace-item-card rarity-${item.rarity}`;
        
        const rarityColors = {
            common: '#95a5a6',
            rare: '#3498db',
            epic: '#9b59b6',
            legendary: '#f39c12'
        };

        card.innerHTML = `
            <div class="item-image" style="background: linear-gradient(135deg, ${rarityColors[item.rarity]}, ${this.adjustColorBrightness(rarityColors[item.rarity], -20)});">
                <i class="fas ${this.getItemIcon(item.type)}"></i>
            </div>
            <div class="item-info">
                <h4 class="item-name">${item.name}</h4>
                <div class="item-rarity rarity-${item.rarity}">${this.capitalizeFirst(item.rarity)}</div>
                <p class="item-description">${item.description}</p>
                <div class="item-price">
                    ${isDailyDeal ? `
                        <span class="original-price">${item.originalPrice}</span>
                        <span class="discounted-price">${item.price} <i class="fas fa-coins"></i></span>
                        <span class="discount-badge">-${item.discount}%</span>
                    ` : `
                        <span class="price">${item.price} <i class="fas fa-coins"></i></span>
                    `}
                </div>
                <button class="buy-btn" onclick="game.purchaseItem('${item.id}', ${item.price})" 
                        ${this.inventory.currency.coins < item.price ? 'disabled' : ''}>
                    ${this.inventory.currency.coins >= item.price ? 'Kaufen' : 'Nicht genug Gold'}
                </button>
            </div>
        `;

        return card;
    }

    getItemIcon(type) {
        const icons = {
            tower_skin: 'fa-chess-rook',
            background: 'fa-image',
            powerup: 'fa-bolt',
            projectile_effect: 'fa-magic'
        };
        return icons[type] || 'fa-gift';
    }

    adjustColorBrightness(color, amount) {
        const clamp = (val) => Math.min(Math.max(val, 0), 255);
        const fill = (str) => ('00' + str).slice(-2);
        
        const num = parseInt(color.replace("#", ""), 16);
        const red = clamp((num >> 16) + amount);
        const green = clamp(((num >> 8) & 0x00FF) + amount);
        const blue = clamp((num & 0x0000FF) + amount);
        
        return "#" + fill(red.toString(16)) + fill(green.toString(16)) + fill(blue.toString(16));
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    purchaseItem(itemId, price) {
        // Finde das Item im Marktplatz
        let item = null;
        
        // Suche in allen Marktplatz-Kategorien
        const allMarketplaceItems = [
            ...this.marketplace.dailyDeals,
            ...this.marketplace.featuredItems,
            ...this.marketplace.regularItems
        ];
        
        item = allMarketplaceItems.find(i => i.id === itemId);
        
        if (!item) {
            this.showMessage('Item nicht gefunden!', 'error');
            return;
        }

        // Prüfe ob genug Währung vorhanden
        if (this.inventory.currency.coins < price) {
            this.showMessage('Nicht genug Gold!', 'error');
            return;
        }

        // Prüfe ob Item bereits besessen wird
        if (this.ownsItem(itemId)) {
            this.showMessage('Du besitzt dieses Item bereits!', 'error');
            return;
        }

        // Kaufe das Item
        this.inventory.currency.coins -= price;
        this.addItemToInventory(item);
        
        // Speichere Änderungen
        this.saveInventory();
        
        // Update UI
        this.updateTradingDisplay();
        
        // Erfolgs-Nachricht
        this.showMessage(`${item.name} erfolgreich gekauft!`, 'success');
        
        // Statistik aktualisieren
        this.updateStatistic('itemsPurchased', 1);
        this.updateStatistic('totalGoldSpent', price);
    }

    ownsItem(itemId) {
        const allOwnedItems = [
            ...this.inventory.skins.towers,
            ...this.inventory.skins.backgrounds,
            ...this.inventory.skins.projectiles,
            ...this.inventory.items.powerUps,
            ...this.inventory.items.boosters,
            ...this.inventory.items.decorations
        ];
        
        return allOwnedItems.some(item => item.id === itemId);
    }

    addItemToInventory(item) {
        switch(item.type) {
            case 'tower_skin':
                this.inventory.skins.towers.push(item);
                break;
            case 'background':
                this.inventory.skins.backgrounds.push(item);
                break;
            case 'projectile_effect':
                this.inventory.skins.projectiles.push(item);
                break;
            case 'powerup':
                this.inventory.items.powerUps.push(item);
                break;
            default:
                this.inventory.items.boosters.push(item);
        }
    }

    updateInventoryDisplay() {
        this.updateInventoryTab('towers', this.inventory.skins.towers);
        this.updateInventoryTab('backgrounds', this.inventory.skins.backgrounds);
        this.updateInventoryTab('effects', this.inventory.skins.projectiles);
        this.updateInventoryTab('items', [...this.inventory.items.powerUps, ...this.inventory.items.boosters]);
    }

    updateInventoryTab(tabName, items) {
        const container = document.getElementById(`inventory${this.capitalizeFirst(tabName)}Container`);
        if (!container) return;

        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = '<div class="empty-inventory">Keine Items vorhanden</div>';
            return;
        }

        items.forEach(item => {
            const itemCard = this.createInventoryItemCard(item);
            container.appendChild(itemCard);
        });
    }

    createInventoryItemCard(item) {
        const card = document.createElement('div');
        card.className = `inventory-item-card rarity-${item.rarity}`;
        
        const rarityColors = {
            common: '#95a5a6',
            rare: '#3498db',
            epic: '#9b59b6',
            legendary: '#f39c12'
        };

        const isEquipped = this.isItemEquipped(item.id);

        card.innerHTML = `
            <div class="item-image" style="background: linear-gradient(135deg, ${rarityColors[item.rarity]}, ${this.adjustColorBrightness(rarityColors[item.rarity], -20)});">
                <i class="fas ${this.getItemIcon(item.type)}"></i>
                ${isEquipped ? '<div class="equipped-badge">Ausgerüstet</div>' : ''}
            </div>
            <div class="item-info">
                <h4 class="item-name">${item.name}</h4>
                <div class="item-rarity rarity-${item.rarity}">${this.capitalizeFirst(item.rarity)}</div>
                <p class="item-description">${item.description}</p>
                <div class="item-actions">
                    ${this.getItemActionButtons(item)}
                </div>
            </div>
        `;

        return card;
    }

    isItemEquipped(itemId) {
        // Prüfe ob Item aktuell ausgerüstet ist
        const equippedItems = this.getEquippedItems();
        return Object.values(equippedItems).includes(itemId);
    }

    getEquippedItems() {
        const savedEquipped = localStorage.getItem('rushRoyalEquippedItems');
        return savedEquipped ? JSON.parse(savedEquipped) : {
            towerSkin: null,
            background: null,
            projectileEffect: null
        };
    }

    getItemActionButtons(item) {
        const isEquipped = this.isItemEquipped(item.id);
        
        if (item.type === 'powerup') {
            return `<button class="use-btn" onclick="game.useItem('${item.id}')">Verwenden</button>`;
        } else {
            return `
                <button class="equip-btn" onclick="game.${isEquipped ? 'unequip' : 'equip'}Item('${item.id}')" 
                        ${isEquipped ? 'disabled' : ''}>
                    ${isEquipped ? 'Ausgerüstet' : 'Ausrüsten'}
                </button>
            `;
        }
    }

    equipItem(itemId) {
        const item = this.findItemInInventory(itemId);
        if (!item) return;

        const equippedItems = this.getEquippedItems();
        
        // Bestimme den Slot basierend auf Item-Typ
        let slot = null;
        switch(item.type) {
            case 'tower_skin':
                slot = 'towerSkin';
                break;
            case 'background':
                slot = 'background';
                break;
            case 'projectile_effect':
                slot = 'projectileEffect';
                break;
        }

        if (slot) {
            equippedItems[slot] = itemId;
            localStorage.setItem('rushRoyalEquippedItems', JSON.stringify(equippedItems));
            this.updateInventoryDisplay();
            this.showMessage(`${item.name} ausgerüstet!`, 'success');
            
            // Wende Effekte sofort an
            this.applyEquippedItemEffects();
            
            // Update alle Tower-Statistiken wenn Tower-Skin ausgerüstet wird
            if (item.type === 'tower_skin') {
                this.towers.forEach(tower => tower.setStats());
            }
            
            // Zeige Ausrüstungs-Tutorial beim ersten Mal
            if (!localStorage.getItem('rushRoyalEquipTutorialShown')) {
                this.showEquipTutorial();
                localStorage.setItem('rushRoyalEquipTutorialShown', 'true');
            }
        }
    }

    unequipItem(itemId) {
        const item = this.findItemInInventory(itemId);
        if (!item) return;

        const equippedItems = this.getEquippedItems();
        
        // Entferne aus dem entsprechenden Slot
        Object.keys(equippedItems).forEach(slot => {
            if (equippedItems[slot] === itemId) {
                equippedItems[slot] = null;
            }
        });

        localStorage.setItem('rushRoyalEquippedItems', JSON.stringify(equippedItems));
        this.updateInventoryDisplay();
        this.showMessage(`${item.name} abgelegt!`, 'info');
        
        // Entferne Effekte
        this.applyEquippedItemEffects();
    }

    findItemInInventory(itemId) {
        const allItems = [
            ...this.inventory.skins.towers,
            ...this.inventory.skins.backgrounds,
            ...this.inventory.skins.projectiles,
            ...this.inventory.items.powerUps,
            ...this.inventory.items.boosters,
            ...this.inventory.items.decorations
        ];
        
        return allItems.find(item => item.id === itemId);
    }

    useItem(itemId) {
        const item = this.findItemInInventory(itemId);
        if (!item || item.type !== 'powerup') return;

        // Wende Power-Up Effekte an
        this.applyPowerUpEffect(item);
        
        // Entferne Item aus Inventar (einmalige Verwendung)
        this.removeItemFromInventory(itemId);
        
        // Update UI
        this.updateInventoryDisplay();
        this.saveInventory();
        
        this.showMessage(`${item.name} verwendet!`, 'success');
    }

    applyPowerUpEffect(item) {
        const duration = this.getPowerUpDuration(item.id);
        
        switch(item.id) {
            case 'damage_boost_30min':
                this.activeEffects.damageBoost = true;
                setTimeout(() => {
                    this.activeEffects.damageBoost = false;
                    this.showMessage('Schaden Boost abgelaufen', 'info');
                }, duration);
                break;
                
            case 'gold_magnet_1hour':
                this.activeEffects.goldBoost = true;
                setTimeout(() => {
                    this.activeEffects.goldBoost = false;
                    this.showMessage('Gold Boost abgelaufen', 'info');
                }, duration);
                break;
                
            case 'wave_skip':
                if (this.gameRunning && !this.waveInProgress) {
                    this.completeWave();
                    this.showMessage('Welle übersprungen!', 'success');
                }
                break;
                
            case 'instant_upgrade':
                // Zeige Tower-Auswahl für Upgrade
                this.showTowerUpgradeSelection();
                break;
        }
    }

    getPowerUpDuration(itemId) {
        const durations = {
            'damage_boost_30min': 30 * 60 * 1000, // 30 Minuten
            'gold_magnet_1hour': 60 * 60 * 1000   // 1 Stunde
        };
        return durations[itemId] || 0;
    }

    removeItemFromInventory(itemId) {
        // Entferne aus Power-Ups
        this.inventory.items.powerUps = this.inventory.items.powerUps.filter(item => item.id !== itemId);
        this.inventory.items.boosters = this.inventory.items.boosters.filter(item => item.id !== itemId);
    }

    showTowerUpgradeSelection() {
        if (this.towers.length === 0) {
            this.showMessage('Keine Tower zum Upgraden vorhanden!', 'error');
            return;
        }

        this.showMessage('Klicke auf einen Tower zum sofortigen Upgrade auf Level 5!', 'info');
        this.instantUpgradeMode = true;
        
        // Tower-Klick Handler für Instant Upgrade
        const originalHandler = this.handleCanvasClick;
        this.handleCanvasClick = (e) => {
            if (this.instantUpgradeMode) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Finde geklickten Tower
                for (let tower of this.towers) {
                    const distance = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
                    if (distance <= tower.size) {
                        // Upgrade Tower auf Level 5
                        tower.level = 5;
                        tower.setStats();
                        this.showMessage(`${tower.type} Tower auf Level 5 upgegraded!`, 'success');
                        this.instantUpgradeMode = false;
                        this.handleCanvasClick = originalHandler;
                        return;
                    }
                }
                
                // Kein Tower gefunden
                this.showMessage('Kein Tower angeklickt!', 'error');
            } else {
                originalHandler.call(this, e);
            }
        };
        
        // Auto-Timeout nach 10 Sekunden
        setTimeout(() => {
            if (this.instantUpgradeMode) {
                this.instantUpgradeMode = false;
                this.handleCanvasClick = originalHandler;
                this.showMessage('Instant Upgrade abgebrochen', 'info');
            }
        }, 10000);
    }

    applyEquippedItemEffects() {
        const equippedItems = this.getEquippedItems();
        
        // Setze alle Effekte zurück
        this.equippedItemEffects = {
            damageBonus: 0,
            goldBonus: 0,
            visualEffects: [],
            rangeBonus: 0,
            speedBonus: 0
        };
        
        // Wende Effekte der ausgerüsteten Items an
        Object.values(equippedItems).forEach(itemId => {
            if (itemId) {
                const item = this.findItemInInventory(itemId);
                if (item) {
                    this.applyItemEffects(item);
                }
            }
        });
        
        // Wende visuelle Effekte an
        this.updateCanvasEffects();
    }

    updateCanvasEffects() {
        const equippedItems = this.getEquippedItems();
        const backgroundId = equippedItems.background;
        
        // Canvas-Filter für verschiedene Hintergründe
        if (backgroundId) {
            switch(backgroundId) {
                case 'neon_city':
                    this.canvas.style.filter = 'contrast(1.1) brightness(1.05) hue-rotate(5deg)';
                    break;
                case 'space_battle':
                    this.canvas.style.filter = 'contrast(1.2) brightness(0.9) saturate(1.3)';
                    break;
                case 'tropical_island':
                    this.canvas.style.filter = 'contrast(0.9) brightness(1.1) saturate(1.2) hue-rotate(-10deg)';
                    break;
                case 'medieval_castle':
                    this.canvas.style.filter = 'contrast(1.1) brightness(0.85) sepia(0.2)';
                    break;
                default:
                    this.canvas.style.filter = 'none';
            }
        } else {
            this.canvas.style.filter = 'none';
        }
    }

    applyItemEffects(item) {
        // Item-spezifische Effekte
        switch(item.id) {
            case 'golden_basic':
                this.equippedItemEffects.damageBonus += 0.1; // +10% Schaden
                this.equippedItemEffects.goldBonus += 0.05; // +5% Gold
                break;
            case 'ice_crystal':
                this.equippedItemEffects.rangeBonus += 0.1; // +10% Reichweite für Ice Tower
                break;
            case 'fire_demon':
                this.equippedItemEffects.damageBonus += 0.15; // +15% Schaden
                this.equippedItemEffects.speedBonus += 0.1; // +10% Feuerrate
                break;
            case 'lightning_storm':
                this.equippedItemEffects.damageBonus += 0.12; // +12% Schaden
                this.equippedItemEffects.rangeBonus += 0.15; // +15% Reichweite
                break;
            case 'toxic_waste':
                this.equippedItemEffects.damageBonus += 0.08; // +8% Schaden (Poison fokussiert auf DOT)
                break;
            case 'cyber_sniper':
                this.equippedItemEffects.damageBonus += 0.2; // +20% Schaden
                this.equippedItemEffects.rangeBonus += 0.25; // +25% Reichweite
                break;
            case 'space_battle':
                this.equippedItemEffects.visualEffects.push('space_theme');
                break;
            case 'medieval_castle':
                this.equippedItemEffects.visualEffects.push('medieval_theme');
                break;
            case 'neon_city':
                this.equippedItemEffects.visualEffects.push('cyberpunk_theme');
                this.equippedItemEffects.damageBonus += 0.05; // Cyberpunk Bonus
                break;
            case 'tropical_island':
                this.equippedItemEffects.visualEffects.push('tropical_theme');
                this.equippedItemEffects.goldBonus += 0.1; // Entspannungsbonus
                break;
            case 'rainbow_trail':
                this.equippedItemEffects.visualEffects.push('rainbow');
                this.equippedItemEffects.speedBonus += 0.05; // Schnellere Projektile
                break;
            case 'star_burst':
                this.equippedItemEffects.visualEffects.push('star_effects');
                this.equippedItemEffects.damageBonus += 0.08; // Sternen-Power
                break;
            case 'lightning_chain':
                this.equippedItemEffects.visualEffects.push('chain_lightning');
                this.equippedItemEffects.damageBonus += 0.1; // Blitz-Power
                break;
        }
    }

    // Erweitere Gold-Belohnung basierend auf ausgerüsteten Items
    addGold(amount) {
        let finalAmount = amount;
        
        // Gold Boost von Power-Ups
        if (this.activeEffects.goldBoost) {
            finalAmount *= 2;
        }
        
        // Gold Bonus von ausgerüsteten Items
        if (this.equippedItemEffects && this.equippedItemEffects.goldBonus) {
            finalAmount *= (1 + this.equippedItemEffects.goldBonus);
        }
        
        // Guild gold bonus
        if (guildSystem) {
            const guildBonuses = guildSystem.getGuildBonuses();
            finalAmount *= (1 + guildBonuses.goldBonus);
        }
        
        this.money += Math.floor(finalAmount);
        this.goldEarned += Math.floor(finalAmount);
        
        // Update Trading-Währung
        if (this.inventory) {
            this.inventory.currency.coins += Math.floor(finalAmount * 0.1); // 10% des Goldes wird zu Trading-Coins
            this.saveInventory();
        }
        
        // Zeige visuelles Feedback für Gold-Erhalt
        this.showGoldGainEffect(finalAmount);
    }

    showGoldGainEffect(amount) {
        // Zeige fliegenden Gold-Text
        const goldText = document.createElement('div');
        goldText.textContent = `+${Math.floor(amount)}`;
        goldText.style.cssText = `
            position: fixed;
            top: 20px;
            right: 200px;
            color: #FFD700;
            font-weight: bold;
            font-size: 18px;
            pointer-events: none;
            z-index: 1000;
            animation: flyUpGold 2s ease-out forwards;
        `;
        
        // CSS Animation hinzufügen falls noch nicht vorhanden
        if (!document.getElementById('goldAnimation')) {
            const style = document.createElement('style');
            style.id = 'goldAnimation';
            style.textContent = `
                @keyframes flyUpGold {
                    0% { 
                        transform: translateY(0); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translateY(-50px); 
                        opacity: 0; 
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(goldText);
        
        setTimeout(() => {
            if (goldText.parentNode) {
                goldText.parentNode.removeChild(goldText);
            }
        }, 2000);
    }

    showTradingTutorial() {
        const tutorial = document.createElement('div');
        tutorial.className = 'trading-tutorial-overlay';
        tutorial.innerHTML = `
            <div class="tutorial-content">
                <h2><i class="fas fa-store"></i> Willkommen im Trading System!</h2>
                <div class="tutorial-steps">
                    <div class="step">
                        <i class="fas fa-coins"></i>
                        <h3>Sammle Gold</h3>
                        <p>Verdiene Gold im Spiel und tausche es gegen Trading-Coins ein</p>
                    </div>
                    <div class="step">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Kaufe Items</h3>
                        <p>Kaufe Skins, Hintergründe und Power-Ups im Marktplatz</p>
                    </div>
                    <div class="step">
                        <i class="fas fa-tshirt"></i>
                        <h3>Rüste Items aus</h3>
                        <p>Verbessere dein Spiel mit Skins und Effekten</p>
                    </div>
                    <div class="step">
                        <i class="fas fa-bolt"></i>
                        <h3>Verwende Power-Ups</h3>
                        <p>Nutze Power-Ups für temporäre Boni im Spiel</p>
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="tutorial-close-btn">
                    Verstanden!
                </button>
            </div>
        `;
        
        tutorial.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(tutorial);
    }

    showEquipTutorial() {
        const tutorial = document.createElement('div');
        tutorial.className = 'equip-tutorial-overlay';
        tutorial.innerHTML = `
            <div class="tutorial-content">
                <h2><i class="fas fa-tshirt"></i> Item erfolgreich ausgerüstet!</h2>
                <div class="tutorial-info">
                    <div class="info-item">
                        <i class="fas fa-magic"></i>
                        <div>
                            <h3>Sofortige Effekte</h3>
                            <p>Deine ausgerüsteten Items wirken sich sofort auf dein Spiel aus!</p>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-chess-rook"></i>
                        <div>
                            <h3>Tower Skins</h3>
                            <p>Verbessern Schaden, Reichweite oder Feuerrate deiner Tower</p>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-image"></i>
                        <div>
                            <h3>Hintergründe</h3>
                            <p>Verändern die Spielatmosphäre und bieten teilweise Boni</p>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-sparkles"></i>
                        <div>
                            <h3>Projektil-Effekte</h3>
                            <p>Machen deine Angriffe visuell spektakulärer und effektiver</p>
                        </div>
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="tutorial-close-btn">
                    <i class="fas fa-check"></i>
                    Verstanden!
                </button>
            </div>
        `;
        
        tutorial.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        
        document.body.appendChild(tutorial);
        
        setTimeout(() => {
            tutorial.style.opacity = '0';
            setTimeout(() => {
                if (tutorial.parentNode) {
                    tutorial.parentNode.removeChild(tutorial);
                }
            }, 300);
        }, 5000);
    }

    gameOver() {
        this.gameRunning = false;
        
        // Skill-Punkte für Spiel-Ende basierend auf erreichte Welle
        this.awardGameOverSkillPoints();
        
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
        
        // Award prestige points based on performance
        if (prestigeSystem) {
            const prestigePoints = Math.floor(this.wave / 5) + Math.floor(this.score / 10000);
            if (prestigePoints > 0) {
                prestigeSystem.awardPrestigePoints(prestigePoints);
            }
        }
        
        // Add guild contribution
        if (guildSystem) {
            const contribution = Math.floor(this.wave * 10 + this.score / 1000);
            guildSystem.addContribution(contribution);
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
            
            // Check if in test mode and modify buttons accordingly
            if (this.testModeData) {
                this.showTestModeGameOver();
            } else {
                gameOverScreen.style.display = 'flex';
            }
            
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

    showTestModeGameOver() {
        // Create custom test mode game over screen
        const testGameOverDiv = document.createElement('div');
        testGameOverDiv.className = 'test-game-over-screen';
        testGameOverDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(10px);
        `;
        
        testGameOverDiv.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #2c3e50, #3498db);
                padding: 3rem;
                border-radius: 15px;
                text-align: center;
                max-width: 500px;
                color: white;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                border: 2px solid rgba(255,255,255,0.1);
            ">
                <div style="
                    background: rgba(52, 152, 219, 0.2);
                    padding: 1rem;
                    border-radius: 10px;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(52, 152, 219, 0.3);
                ">
                    <h2 style="
                        margin: 0 0 0.5rem 0;
                        color: #3498db;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                    ">
                        <i class="fas fa-flask"></i>
                        Map Test Abgeschlossen
                    </h2>
                    <p style="margin: 0; opacity: 0.9;">Deine Custom Map wurde getestet!</p>
                </div>
                
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    text-align: left;
                ">
                    <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
                        <div style="color: #f39c12; font-weight: bold; margin-bottom: 0.5rem;">
                            <i class="fas fa-wave-square"></i> Erreichte Welle
                        </div>
                        <div style="font-size: 1.8rem; font-weight: bold;">${this.wave}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
                        <div style="color: #e74c3c; font-weight: bold; margin-bottom: 0.5rem;">
                            <i class="fas fa-skull"></i> Kills
                        </div>
                        <div style="font-size: 1.8rem; font-weight: bold;">${this.totalKills}</div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="game.restartTestMap()" style="
                        background: var(--accent-green);
                        color: white;
                        border: none;
                        padding: 0.8rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <i class="fas fa-redo"></i>
                        Nochmal testen
                    </button>
                    <button onclick="game.exitTestMode(); document.body.removeChild(document.querySelector('.test-game-over-screen'))" style="
                        background: var(--primary-blue);
                        color: white;
                        border: none;
                        padding: 0.8rem 1.5rem;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        <i class="fas fa-edit"></i>
                        Zurück zum Editor
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(testGameOverDiv);
        
        // Add fade-in animation
        setTimeout(() => {
            testGameOverDiv.style.opacity = '1';
        }, 100);
    }

    restartTestMap() {
        // Remove test game over screen
        const testGameOverScreen = document.querySelector('.test-game-over-screen');
        if (testGameOverScreen) {
            testGameOverScreen.remove();
        }
        
        // Restart the test game
        this.restartGame();
        
        // Show test notification again
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: var(--shadow-lg);
            border: 2px solid rgba(255, 255, 255, 0.3);
            text-align: center;
            min-width: 300px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                <i class="fas fa-flask"></i>
                <strong>MAP TEST MODUS</strong>
            </div>
            <div style="font-size: 0.9rem; margin-top: 0.3rem; opacity: 0.9;">
                Teste deine Map erneut! Drücke ESC um zum Editor zurückzukehren.
            </div>
        `;
        document.body.appendChild(notification);
        
        // Update test mode data
        if (this.testModeData) {
            this.testModeData.notification = notification;
        }
        
        // Auto-fade notification
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.opacity = '0.7';
                notification.style.transform = 'translateX(-50%) scale(0.9)';
            }
        }, 5000);
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
            // Base tower types
            basic: { damage: 10, range: 80, speed: 1000, value: 20 },
            ice: { damage: 5, range: 90, speed: 800, value: 40, slow: 0.5 },
            fire: { damage: 15, range: 70, speed: 1200, value: 60, splash: 30 },
            lightning: { damage: 25, range: 100, speed: 1500, value: 100, chain: 3 },
            poison: { damage: 8, range: 85, speed: 900, value: 80, poison: 3 },
            sniper: { damage: 50, range: 150, speed: 2000, value: 120 },
            tesla: { damage: 30, range: 120, speed: 800, value: 150, stun: 60 },
            
            // Fused tower types - use basic stats as base, special properties are set in createFusedTower
            enhanced_basic: { damage: 20, range: 120, speed: 800, value: 80 },
            frost_basic: { damage: 12, range: 100, speed: 900, value: 60, slow: 0.3 },
            arcane_sniper: { damage: 60, range: 180, speed: 1800, value: 220 },
            frost_cannon: { damage: 20, range: 90, speed: 1000, value: 100, splash: 60, slow: 0.5 },
            void_mage: { damage: 30, range: 110, speed: 1200, value: 180, poison: 5 },
            rapid_sniper: { damage: 45, range: 160, speed: 1000, value: 140 },
            toxic_cannon: { damage: 18, range: 95, speed: 1100, value: 140, splash: 80, poison: 8 },
            freeze_tesla: { damage: 28, range: 130, speed: 700, value: 190, chain: 4, slow: 0.3 },
            plasma_tower: { damage: 45, range: 140, speed: 850, value: 210, splash: 70 }
        };
        
        const baseStat = stats[this.type];
        
        if (!baseStat) {
            console.error(`Unknown tower type: ${this.type}`);
            // Fallback to basic stats
            const fallback = stats.basic;
            this.damage = fallback.damage * this.level;
            this.range = fallback.range + (this.level - 1) * 10;
            this.speed = fallback.speed;
            this.value = fallback.value * this.level;
            return;
        }
        
        this.damage = baseStat.damage * this.level;
        this.range = baseStat.range + (this.level - 1) * 10;
        this.speed = baseStat.speed;
        this.value = baseStat.value * this.level;
        this.slow = baseStat.slow;
        this.splash = baseStat.splash;
        this.chain = baseStat.chain;
        this.poison = baseStat.poison;
        this.stun = baseStat.stun;
        
        // Wende ausgerüstete Item-Effekte an
        if (game && game.equippedItemEffects) {
            this.damage *= (1 + game.equippedItemEffects.damageBonus);
            this.range *= (1 + game.equippedItemEffects.rangeBonus);
            this.speed /= (1 + game.equippedItemEffects.speedBonus); // Geringere Zeit = höhere Feuerrate
        }
        
        // Apply prestige bonuses
        if (prestigeSystem) {
            const prestigeBonuses = prestigeSystem.getTowerPrestigeBonuses(this.type);
            this.damage *= (1 + prestigeBonuses.damage);
            this.range *= (1 + prestigeBonuses.range);
            this.speed /= (1 + prestigeBonuses.speed);
        }
        
        // Apply guild bonuses
        if (guildSystem) {
            const guildBonuses = guildSystem.getGuildBonuses();
            this.damage *= (1 + guildBonuses.damageBonus);
        }
    }
    
    upgrade() {
        this.level++;
        this.setStats();
        
        // Track tower upgrade for prestige system
        if (prestigeSystem) {
            prestigeSystem.trackTowerUsage(this.type, 'upgrade');
        }
    }
    
    update(enemies, projectiles) {
        const now = Date.now();
        
        // Skill-Effekte für Feuerrate anwenden
        const skillEffects = game.getSkillEffects();
        const adjustedSpeed = this.speed / skillEffects.fireRateMultiplier;
        
        if (now - this.lastShot < adjustedSpeed) return;
        
        // Nächsten Gegner in Reichweite finden (mit Skill-Reichweite)
        let target = null;
        let closestDistance = Infinity;
        const adjustedRange = this.range * skillEffects.rangeMultiplier;
        
        for (let enemy of enemies) {
            const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
            if (distance <= adjustedRange && distance < closestDistance) {
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
        // Prüfe ob ein Tower-Skin ausgerüstet ist
        const equippedItems = game.getEquippedItems();
        const towerSkinId = equippedItems.towerSkin;
        
        // Tower-Basis mit Skin oder Standard-Farbe
        if (towerSkinId && this.type === 'basic' && towerSkinId === 'golden_basic') {
            // Goldener Basic Tower
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(0.5, '#FFA500');
            gradient.addColorStop(1, '#B8860B');
            ctx.fillStyle = gradient;
        } else if (towerSkinId && this.type === 'ice' && towerSkinId === 'ice_crystal') {
            // Eiskristall Tower
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, '#E0FFFF');
            gradient.addColorStop(0.5, '#87CEEB');
            gradient.addColorStop(1, '#4682B4');
            ctx.fillStyle = gradient;
        } else if (towerSkinId && this.type === 'fire' && towerSkinId === 'fire_demon') {
            // Feuer-Dämon Tower
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, '#FF6347');
            gradient.addColorStop(0.5, '#FF4500');
            gradient.addColorStop(1, '#8B0000');
            ctx.fillStyle = gradient;
        } else if (towerSkinId && this.type === 'sniper' && towerSkinId === 'cyber_sniper') {
            // Cyber Sniper
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, '#00FFFF');
            gradient.addColorStop(0.5, '#0080FF');
            gradient.addColorStop(1, '#000080');
            ctx.fillStyle = gradient;
        } else {
            // Standard Tower-Farbe
            ctx.fillStyle = this.getColor();
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Spezielle Effekte für Skins
        if (towerSkinId) {
            this.drawSkinEffects(ctx, towerSkinId);
        }
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Level-Anzeige
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.level, this.x, this.y + 4);
    }
    
    drawSkinEffects(ctx, skinId) {
        switch(skinId) {
            case 'golden_basic':
                // Goldener Glanz-Effekt
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
                break;
                
            case 'ice_crystal':
                // Eiskristall-Effekt
                ctx.strokeStyle = '#E0FFFF';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.stroke();
                ctx.setLineDash([]);
                break;
                
            case 'fire_demon':
                // Flammen-Aura
                ctx.shadowColor = '#FF4500';
                ctx.shadowBlur = 15;
                ctx.stroke();
                ctx.shadowBlur = 0;
                
                // Kleine Flammen-Partikel
                for (let i = 0; i < 3; i++) {
                    const angle = (Date.now() * 0.01 + i * 2) % (Math.PI * 2);
                    const flameCx = this.x + Math.cos(angle) * (this.size + 5);
                    const flameCy = this.y + Math.sin(angle) * (this.size + 5);
                    
                    ctx.fillStyle = `rgba(255, ${69 + Math.sin(Date.now() * 0.01) * 50}, 0, 0.7)`;
                    ctx.beginPath();
                    ctx.arc(flameCx, flameCy, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
                
            case 'cyber_sniper':
                // Cyber-Laser-Visier
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 2]);
                
                // Laser-Linie zu nächstem Feind (falls vorhanden)
                if (game.enemies.length > 0) {
                    const nearestEnemy = game.enemies[0]; // Vereinfacht
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(nearestEnemy.x, nearestEnemy.y);
                    ctx.stroke();
                }
                ctx.setLineDash([]);
                break;
        }
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
        
        // Multiplayer properties
        this.isPvPEnemy = false;
        this.sentByPlayer = null;
        this.freezeTime = 0;
        
        this.setStats(wave);
    }
    
    setStats(wave) {
        const baseStats = {
            basic: { health: 20, speed: 1, reward: 5, points: 10, size: 8 },
            fast: { health: 10, speed: 2, reward: 8, points: 15, size: 6 },
            tank: { health: 80, speed: 0.5, reward: 15, points: 25, size: 12 },
            boss: { health: 200, speed: 0.8, reward: 50, points: 100, size: 16 },
            flying: { health: 15, speed: 1.5, reward: 12, points: 20, size: 7 },
            shielded: { health: 50, speed: 0.8, reward: 20, points: 30, size: 10 },
            splitter: { health: 30, speed: 1.2, reward: 18, points: 35, size: 9 },
            teleporter: { health: 25, speed: 1.8, reward: 25, points: 40, size: 8 }
        };
        
        const stats = baseStats[this.type];
        
        // Progressive Skalierung mit jeder Welle
        const waveScaling = 1 + (wave - 1) * 0.15;
        const healthScaling = 1 + (wave - 1) * 0.25;
        const speedScaling = Math.min(1 + (wave - 1) * 0.05, 2);
        
        // Basis-Werte mit progressiver Skalierung
        this.maxHealth = Math.floor(stats.health * healthScaling + wave * 3);
        this.health = this.maxHealth;
        this.baseSpeed = stats.speed * speedScaling;
        this.speed = this.baseSpeed;
        
        // Belohnungen steigen auch mit der Schwierigkeit
        this.reward = Math.floor(stats.reward * waveScaling);
        this.points = Math.floor(stats.points * waveScaling);
        this.size = stats.size;
        
        // Special enemy properties
        this.flying = this.type === 'flying';
        this.shield = this.type === 'shielded' ? Math.floor(this.maxHealth * 0.5) : 0;
        this.maxShield = this.shield;
        this.teleportCooldown = 0;
        this.hasBeenSplit = false;
        
        // Spezielle Bonus-Eigenschaften für höhere Wellen
        if (wave >= 10) {
            this.maxHealth = Math.floor(this.maxHealth * 1.3);
            this.health = this.maxHealth;
            if (this.type === 'shielded') {
                this.shield = Math.floor(this.maxHealth * 0.5);
                this.maxShield = this.shield;
            }
        }
        
        if (wave >= 15) {
            this.baseSpeed *= 1.2;
            this.speed = this.baseSpeed;
        }
        
        if (wave >= 20) {
            this.maxHealth = Math.floor(this.maxHealth * 1.5);
            this.health = this.maxHealth;
            this.size *= 1.1;
            this.reward = Math.floor(this.reward * 1.5);
            this.points = Math.floor(this.points * 1.5);
            if (this.type === 'shielded') {
                this.shield = Math.floor(this.maxHealth * 0.5);
                this.maxShield = this.shield;
            }
        }
    }
    
    update() {
        // Freeze-Effekt von Coop-Fähigkeiten
        if (this.freezeTime > 0) {
            this.freezeTime -= 1000/60; // Reduziere basierend auf FPS
            return;
        }
        
        // Stun-Effekt - Gegner kann sich nicht bewegen
        if (this.stunDuration > 0) {
            this.stunDuration--;
            return;
        }
        
        // Poison-Effekt
        if (this.poisonDuration > 0) {
            this.poisonDuration--;
            if (this.poisonDuration % 30 === 0) {
                this.health -= this.poisonDamage;
            }
        }
        
        // Teleporter special ability
        if (this.type === 'teleporter' && this.teleportCooldown <= 0) {
            if (Math.random() < 0.02) { // 2% chance per frame to teleport
                this.teleport();
                this.teleportCooldown = 120; // 2 second cooldown
            }
        }
        if (this.teleportCooldown > 0) this.teleportCooldown--;
        
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
        // Flying enemies can only be hit by certain tower types
        if (this.flying && effects.damageType !== 'magic' && effects.damageType !== 'explosive') {
            return false; // Attack missed
        }
        
        // Shielded enemies absorb damage with shield first
        if (this.shield > 0) {
            if (effects.damageType === 'pierce') {
                // Pierce damage bypasses shield
                this.health -= damage;
            } else {
                const shieldDamage = Math.min(damage, this.shield);
                this.shield -= shieldDamage;
                const remainingDamage = damage - shieldDamage;
                if (remainingDamage > 0) {
                    this.health -= remainingDamage;
                }
            }
        } else {
            this.health -= damage;
        }
        
        if (effects.slow) {
            this.slowEffect = effects.slow;
            this.slowDuration = 120;
        }
        
        if (effects.poison) {
            this.poisonDamage = effects.poison;
            this.poisonDuration = 300;
        }
        
        if (effects.stun) {
            this.stunDuration = effects.stun;
        }
        
        return true; // Attack hit
    }

    onDeath(game) {
        // Splitter enemies split into smaller enemies when killed
        if (this.type === 'splitter' && !this.hasBeenSplit) {
            const splitCount = 2;
            for (let i = 0; i < splitCount; i++) {
                const smallEnemy = new Enemy(this.path, 'basic', 1);
                smallEnemy.x = this.x + (Math.random() - 0.5) * 30;
                smallEnemy.y = this.y + (Math.random() - 0.5) * 30;
                smallEnemy.pathIndex = this.pathIndex;
                smallEnemy.maxHealth = Math.floor(this.maxHealth * 0.3);
                smallEnemy.health = smallEnemy.maxHealth;
                smallEnemy.size = this.size * 0.7;
                smallEnemy.reward = Math.floor(this.reward * 0.3);
                smallEnemy.points = Math.floor(this.points * 0.3);
                smallEnemy.hasBeenSplit = true;
                game.enemies.push(smallEnemy);
            }
        }
    }

    teleport() {
        // Teleport to a random point further along the path
        const currentIndex = this.pathIndex;
        const maxJump = Math.min(3, this.path.length - 1 - currentIndex);
        if (maxJump > 0) {
            const jumpDistance = Math.floor(Math.random() * maxJump) + 1;
            this.pathIndex = Math.min(currentIndex + jumpDistance, this.path.length - 1);
            if (this.pathIndex < this.path.length) {
                this.x = this.path[this.pathIndex].x;
                this.y = this.path[this.pathIndex].y;
            }
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
        
        // Shield bar for shielded enemies
        if (this.maxShield > 0) {
            const shieldPercent = this.shield / this.maxShield;
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 12, barWidth, barHeight);
            ctx.fillStyle = 'cyan';
            ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 12, barWidth * shieldPercent, barHeight);
        }
        
        // Flying indicator
        if (this.flying) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Teleporter glow effect
        if (this.type === 'teleporter') {
            ctx.shadowColor = '#9370DB';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
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
            boss: '#96CEB4',
            flying: '#E6E6FA',
            shielded: '#FFD700',
            splitter: '#FF69B4',
            teleporter: '#9370DB'
        };
        return colors[this.type] || '#FF6B6B';
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
    
    findNearestEnemy(excludeEnemy) {
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        for (let enemy of game.enemies) {
            if (enemy === excludeEnemy || enemy.health <= 0) continue;
            
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + 
                Math.pow(enemy.y - this.y, 2)
            );
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        }
        
        return nearestEnemy;
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
        
        // Tower-spezifische Effekte basierend auf Tower-Typ
        if (this.tower.type === 'ice') {
            effects.slow = this.tower.slow;
        }
        
        if (this.tower.type === 'poison') {
            effects.poison = this.tower.poison;
        }
        
        if (this.tower.type === 'tesla') {
            effects.stun = this.tower.stun;
        }
        
        // Erweiterte Effekte für fusionierte Tower (basierend auf Eigenschaften)
        if (this.tower.slowEffect && this.tower.slowEffect > 0) {
            effects.slow = this.tower.slowEffect;
            console.log(`Applying slow effect: ${this.tower.slowEffect}`);
        }
        
        if (this.tower.poisonDamage && this.tower.poisonDamage > 0) {
            effects.poison = this.tower.poisonDamage;
            console.log(`Applying poison damage: ${this.tower.poisonDamage}`);
        }
        
        if (this.tower.stun && this.tower.stun > 0) {
            effects.stun = this.tower.stun;
            console.log(`Applying stun: ${this.tower.stun}`);
        }
        
        // Damage type für spezielle Effekte
        if (this.tower.damageType) {
            effects.damageType = this.tower.damageType;
        }
        
        // Basis-Schaden mit Skill-Effekten
        let finalDamage = this.tower.damage;
        
        // Skill-Effekte anwenden
        const skillEffects = game.getSkillEffects();
        
        // Erhöhter Schaden (increasedDamage skill)
        finalDamage *= skillEffects.damageMultiplier;
        
        // Kritischer Treffer (criticalHit skill)
        if (Math.random() < skillEffects.critChance) {
            finalDamage *= skillEffects.critMultiplier;
            console.log(`Critical hit! Damage: ${finalDamage}`);
        }
        
        // Rüstungsdurchbruch (armorPiercing skill)
        if (skillEffects.armorPiercing > 0) {
            effects.armorPiercing = skillEffects.armorPiercing;
        }
        
        // Damage Boost berücksichtigen
        if (game.activeEffects.damageBoost) {
            finalDamage *= 2;
        }
        
        // Mehrfachschuss (multiShot skill)
        let projectileCount = 1;
        if (Math.random() < skillEffects.multiShotChance) {
            projectileCount = 2;
            console.log(`Multi-shot activated!`);
        }
        
        // Haupttreffer
        const enemyWasKilled = this.target.health <= finalDamage;
        this.target.takeDamage(finalDamage, effects);
        
        // Track tower kill for prestige system
        if (enemyWasKilled && prestigeSystem) {
            prestigeSystem.trackTowerUsage(this.tower.type, 'kill');
        }
        
        // Zusätzlicher Projektil bei Mehrfachschuss
        if (projectileCount > 1) {
            // Finde nächsten Gegner für zusätzlichen Schuss
            const nearestEnemy = this.findNearestEnemy(this.target);
            if (nearestEnemy) {
                nearestEnemy.takeDamage(finalDamage * 0.8, effects); // 80% Schaden
            }
        }
        
        // Splash-Schaden (Fire Tower und fusionierte Tower mit Splash)
        if ((this.tower.type === 'fire' && this.tower.splash) || 
            (this.tower.splashRadius && this.tower.splashRadius > 0)) {
            
            // Skill-Effekte für Splash-Radius anwenden
            const skillEffects = game.getSkillEffects();
            const baseSplashRadius = this.tower.splashRadius || this.tower.splash;
            const splashRadius = Math.floor(baseSplashRadius * skillEffects.splashRadius);
            
            console.log(`Applying splash damage with radius: ${splashRadius} (base: ${baseSplashRadius}, multiplier: ${skillEffects.splashRadius})`);
            
            game.enemies.forEach(enemy => {
                if (enemy !== this.target) {
                    const distance = Math.sqrt((enemy.x - this.target.x) ** 2 + (enemy.y - this.target.y) ** 2);
                    if (distance <= splashRadius) {
                        let splashDamage = finalDamage * 0.5;
                        // Splash kann auch Effekte haben
                        const splashEffects = { ...effects };
                        enemy.takeDamage(splashDamage, splashEffects);
                    }
                }
            });
        }
        
        // Chain Lightning (Lightning Tower und fusionierte Tower mit Chain)
        if ((this.tower.type === 'lightning' && this.tower.chain) || 
            (this.tower.chain && this.tower.chain > 0)) {
            
            const chainCount = this.tower.chain;
            console.log(`Applying chain lightning with ${chainCount} targets`);
            this.chainLightning(this.target, chainCount - 1, this.tower.damage * 0.7);
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
        // Prüfe ob Projektil-Effekte ausgerüstet sind
        const equippedItems = game.getEquippedItems();
        const projectileEffectId = equippedItems.projectileEffect;
        
        if (projectileEffectId === 'rainbow_trail') {
            // Regenbogen-Spur
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 8);
            const hue = (Date.now() * 0.1 + this.x + this.y) % 360;
            gradient.addColorStop(0, `hsl(${hue}, 100%, 70%)`);
            gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 100%, 50%)`);
            ctx.fillStyle = gradient;
            
            // Größeres Projektil für besseren Effekt
            ctx.beginPath();
            ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Spur-Effekt
            ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            
        } else if (projectileEffectId === 'star_burst') {
            // Sternen-Explosion Effekt
            ctx.fillStyle = '#FFD700';
            
            // Stern-Form zeichnen
            const spikes = 5;
            const outerRadius = 4;
            const innerRadius = 2;
            
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const angle = (i * Math.PI) / spikes;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const x = this.x + Math.cos(angle) * radius;
                const y = this.y + Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
            
            // Glitzer-Effekt
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
            
        } else if (projectileEffectId === 'lightning_chain') {
            // Blitz-Ketten Effekt
            ctx.fillStyle = '#00FFFF';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Elektrische Aura
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Blitz-Effekt
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;
            
        } else {
            // Standard-Projektil
            ctx.fillStyle = this.getProjectileColor();
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
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

// Map Editor Klasse
class MapEditor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentTool = 'draw';
        this.pathPoints = [];
        this.gridSize = 25;
        this.canvasWidth = 800;
        this.canvasHeight = 600;
    }

    initialize() {
        this.canvas = document.getElementById('mapEditorCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.setupEventListeners();
        this.clearCanvas();
        this.drawGrid();
    }

    setupEventListeners() {
        // Tool buttons
        document.getElementById('drawPathTool').addEventListener('click', () => this.setTool('draw'));
        document.getElementById('eraseTool').addEventListener('click', () => this.setTool('erase'));
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        
        // Action buttons
        document.getElementById('testMap').addEventListener('click', () => this.testMap());
        document.getElementById('saveMap').addEventListener('click', () => this.saveMap());
        
        // Canvas events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setTool(tool) {
        this.currentTool = tool;
        
        // Update tool button states
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tool === 'draw' ? 'drawPathTool' : 'eraseTool').classList.add('active');
        
        // Update cursor
        this.canvas.style.cursor = tool === 'draw' ? 'crosshair' : 'pointer';
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * this.canvasWidth;
        const y = ((e.clientY - rect.top) / rect.height) * this.canvasHeight;
        
        // Snap to grid
        const snappedX = Math.round(x / this.gridSize) * this.gridSize;
        const snappedY = Math.round(y / this.gridSize) * this.gridSize;
        
        if (this.currentTool === 'draw') {
            this.addPathPoint(snappedX, snappedY);
        } else if (this.currentTool === 'erase') {
            this.removeNearbyPoint(snappedX, snappedY);
        }
        
        this.redraw();
    }

    addPathPoint(x, y) {
        // Check if point already exists nearby
        const existing = this.pathPoints.find(p => 
            Math.abs(p.x - x) < this.gridSize/2 && Math.abs(p.y - y) < this.gridSize/2
        );
        
        if (!existing) {
            this.pathPoints.push({x, y});
        }
    }

    removeNearbyPoint(x, y) {
        this.pathPoints = this.pathPoints.filter(p => 
            Math.abs(p.x - x) > this.gridSize/2 || Math.abs(p.y - y) > this.gridSize/2
        );
    }

    clearAll() {
        if (confirm('Möchtest du wirklich alles löschen?')) {
            this.pathPoints = [];
            this.redraw();
        }
    }

    clearCanvas() {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvasHeight);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvasWidth, y);
            this.ctx.stroke();
        }
    }

    drawPath() {
        if (this.pathPoints.length < 2) return;
        
        // Draw path line
        this.ctx.strokeStyle = '#4a90e2';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.pathPoints[0].x, this.pathPoints[0].y);
        
        for (let i = 1; i < this.pathPoints.length; i++) {
            this.ctx.lineTo(this.pathPoints[i].x, this.pathPoints[i].y);
        }
        
        this.ctx.stroke();
        
        // Draw waypoints
        this.pathPoints.forEach((point, index) => {
            this.ctx.fillStyle = index === 0 ? '#2ecc71' : index === this.pathPoints.length - 1 ? '#e74c3c' : '#f1c40f';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw point number
            this.ctx.fillStyle = '#000';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText((index + 1).toString(), point.x, point.y + 4);
        });
    }

    redraw() {
        this.clearCanvas();
        this.drawGrid();
        this.drawPath();
    }

    validateMap() {
        if (this.pathPoints.length < 2) {
            return { valid: false, message: 'Der Pfad benötigt mindestens 2 Punkte.' };
        }
        
        const startPoint = this.pathPoints[0];
        const endPoint = this.pathPoints[this.pathPoints.length - 1];
        
        // Check if path starts from left edge and ends at right edge
        if (startPoint.x > 50) {
            return { valid: false, message: 'Der Pfad muss am linken Rand beginnen.' };
        }
        
        if (endPoint.x < this.canvasWidth - 50) {
            return { valid: false, message: 'Der Pfad muss am rechten Rand enden.' };
        }
        
        return { valid: true, message: 'Map ist gültig!' };
    }

    testMap() {
        const validation = this.validateMap();
        
        if (!validation.valid) {
            alert(validation.message);
            return;
        }
        
        // Create temporary map for testing
        const testMap = {
            id: 'test_map',
            name: document.getElementById('mapName').value.trim() || 'Test Map',
            description: 'Test-Version deiner Custom Map',
            difficulty: document.getElementById('mapDifficulty').value,
            path: this.pathPoints,
            custom: true,
            unlocked: true,
            isTest: true
        };
        
        // Save current map temporarily and switch to test map
        const originalMapId = game.currentMapId;
        game.maps['test_map'] = testMap;
        game.currentMapId = 'test_map';
        game.loadMap('test_map');
        
        // Close editor and start test game
        closeModal('mapEditorModal');
        
        // Start the game
        game.startGameFromMenu();
        
        // Show test notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: var(--shadow-lg);
            border: 2px solid rgba(255, 255, 255, 0.3);
            text-align: center;
            min-width: 300px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: center;">
                <i class="fas fa-flask"></i>
                <strong>MAP TEST MODUS</strong>
            </div>
            <div style="font-size: 0.9rem; margin-top: 0.3rem; opacity: 0.9;">
                Teste deine Map! Drücke ESC um zum Editor zurückzukehren.
            </div>
        `;
        document.body.appendChild(notification);
        
        // Store original map ID and setup test mode
        game.testModeData = {
            originalMapId: originalMapId,
            notification: notification
        };
        
        // Add escape key listener for test mode
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && game.testModeData) {
                game.exitTestMode();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Auto-remove notification after 5 seconds but keep test mode active
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.opacity = '0.7';
                notification.style.transform = 'translateX(-50%) scale(0.9)';
            }
        }, 5000);
    }

    saveMap() {
        const validation = this.validateMap();
        
        if (!validation.valid) {
            alert(validation.message);
            return;
        }
        
        const mapName = document.getElementById('mapName').value.trim() || 'Unbenannte Map';
        const mapDescription = document.getElementById('mapDescription').value.trim() || 'Keine Beschreibung';
        const mapDifficulty = document.getElementById('mapDifficulty').value;
        
        const customMap = {
            id: 'custom_' + Date.now(),
            name: mapName,
            description: mapDescription,
            difficulty: mapDifficulty,
            path: this.pathPoints,
            custom: true,
            createdAt: new Date().toISOString(),
            unlocked: true
        };
        
        // Save to localStorage
        const savedMaps = JSON.parse(localStorage.getItem('customMaps') || '[]');
        savedMaps.push(customMap);
        localStorage.setItem('customMaps', JSON.stringify(savedMaps));
        
        alert(`Map "${mapName}" wurde erfolgreich gespeichert!`);
        
        // Close modal and refresh map selection
        closeModal('mapEditorModal');
        if (game) {
            game.loadCustomMaps();
        }
    }

    loadMap(map) {
        // Load map data into editor
        this.pathPoints = [...map.path];
        
        // Fill form fields
        document.getElementById('mapName').value = map.name;
        document.getElementById('mapDescription').value = map.description;
        document.getElementById('mapDifficulty').value = map.difficulty;
        
        // Redraw
        this.redraw();
    }
}

// Trading System Global Functions
function showTradingTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.trading-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hide all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

function showInventoryTab(tabName) {
    // Hide all inventory containers
    document.querySelectorAll('.inventory-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Hide all inventory tab buttons
    document.querySelectorAll('.inventory-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected container
    document.getElementById('inventory' + game.capitalizeFirst(tabName) + 'Container').classList.add('active');
    event.target.classList.add('active');
}

// Multiplayer Manager Klasse
class MultiplayerManager {
    constructor() {
        this.mode = null; // 'coop' or 'pvp'
        this.isHost = false;
        this.room = null;
        this.players = new Map();
        this.localPlayer = null;
        this.connection = null;
        this.dataChannel = null;
        this.connectionState = 'disconnected';
        this.playerId = null;
        this.playerName = null;
        this.checkForGuestInterval = null;
        this.signalingMethod = 'firebase'; // 'localStorage' or 'firebase'
        this.firebaseConfig = {
            // Free Firebase Realtime Database für Signaling
            databaseURL: "https://rush-royal-signaling-default-rtdb.europe-west1.firebasedatabase.app/"
        };
    }

    initialize() {
        // Clean up old rooms on initialization
        this.cleanupOldRooms();
        
        // Initialize Firebase for cross-device signaling
        this.initializeFirebaseSignaling();
        
        this.setupEventListeners();
        this.showModeSelection();
        this.updateConnectionStatus('ready', 'Bereit');
        console.log('MultiplayerManager initialized and ready');
    }

    async initializeFirebaseSignaling() {
        try {
            // Simple Firebase REST API implementation for signaling
            this.firebaseURL = this.firebaseConfig.databaseURL;
            console.log('Firebase signaling initialized');
        } catch (error) {
            console.warn('Firebase signaling failed, falling back to localStorage:', error);
            this.signalingMethod = 'localStorage';
        }
    }

    // Firebase REST API methods for cross-device signaling
    async firebaseSet(path, data) {
        try {
            const response = await fetch(`${this.firebaseURL}/${path}.json`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Firebase set error:', error);
            throw error;
        }
    }

    async firebaseGet(path) {
        try {
            const response = await fetch(`${this.firebaseURL}/${path}.json`);
            return await response.json();
        } catch (error) {
            console.error('Firebase get error:', error);
            return null;
        }
    }

    async firebaseDelete(path) {
        try {
            const response = await fetch(`${this.firebaseURL}/${path}.json`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Firebase delete error:', error);
        }
    }

    setupEventListeners() {
        // Mode selection
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                const mode = card.dataset.mode;
                this.selectMode(mode);
            });
        });

        // Room creation/joining
        document.getElementById('createRoom').addEventListener('click', () => this.createRoom());
        document.getElementById('joinRoom').addEventListener('click', () => this.joinRoom());
        document.getElementById('startMultiplayerGame').addEventListener('click', () => this.startMultiplayerGame());
        document.getElementById('leaveRoom').addEventListener('click', () => this.leaveRoom());
    }

    showModeSelection() {
        document.getElementById('multiplayerModes').style.display = 'block';
        document.getElementById('multiplayerLobby').style.display = 'none';
        document.getElementById('waitingRoom').style.display = 'none';
        
        // Reset selection
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    selectMode(mode) {
        this.mode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('selected');
        
        // Show lobby after short delay
        setTimeout(() => {
            this.showLobby();
        }, 500);
    }

    showLobby() {
        document.getElementById('multiplayerModes').style.display = 'none';
        document.getElementById('multiplayerLobby').style.display = 'block';
        document.getElementById('waitingRoom').style.display = 'none';
        
        const title = this.mode === 'coop' ? 'Kooperativ Lobby' : 'PvP Lobby';
        document.getElementById('lobbyTitle').textContent = title;
    }

    async createRoom() {
        const roomName = document.getElementById('roomName').value.trim() || 'Mein Raum';
        const playerName = document.getElementById('playerName').value.trim() || 'Host';
        
        this.updateConnectionStatus('connecting', 'Erstelle Raum...');
        
        try {
            // Generate room code
            const roomCode = this.generateRoomCode();
            console.log('Creating room with code:', roomCode);
            
            // Create room object
            this.room = {
                code: roomCode,
                name: roomName,
                mode: this.mode,
                host: playerName,
                created: Date.now(),
                status: 'waiting'
            };
            
            this.isHost = true;
            this.playerId = 'host';
            this.playerName = playerName;
            this.localPlayer = {
                id: 'host',
                name: playerName,
                isHost: true,
                ready: false
            };
            
            this.players.set('host', this.localPlayer);
            
            // Store room using the appropriate signaling method
            const roomDataToStore = {
                ...this.room,
                hostData: this.localPlayer
            };
            
            if (this.signalingMethod === 'firebase') {
                await this.firebaseSet(`rooms/${roomCode}`, roomDataToStore);
                console.log('Room stored in Firebase:', roomCode);
            } else {
                // Fallback to localStorage
                const roomKey = `room_${roomCode}`;
                localStorage.setItem(roomKey, JSON.stringify(roomDataToStore));
                console.log('Room stored in localStorage:', roomKey, roomDataToStore);
            }
            
            // Setup WebRTC as host
            await this.setupWebRTCHost();
            
            this.showWaitingRoom();
            this.updateConnectionStatus('connected', 'Raum erstellt - Code: ' + roomCode);
            
        } catch (error) {
            console.error('Error creating room:', error);
            this.updateConnectionStatus('disconnected', 'Fehler beim Erstellen');
            alert('Fehler beim Erstellen des Raums: ' + error.message);
        }
    }

    async joinRoom() {
        const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
        const playerName = document.getElementById('joinPlayerName').value.trim() || 'Spieler';
        
        if (!roomCode || roomCode.length !== 9) {
            alert('Bitte gib einen gültigen Raum Code ein (XXXX-XXXX)');
            return;
        }
        
        this.updateConnectionStatus('connecting', 'Trete Raum bei...');
        console.log('Trying to join room with code:', roomCode);
        
        try {
            let roomData = null;
            
            if (this.signalingMethod === 'firebase') {
                // Try Firebase first
                roomData = await this.firebaseGet(`rooms/${roomCode}`);
                console.log('Firebase room data:', roomData);
            } else {
                // Fallback to localStorage
                const roomKey = `room_${roomCode}`;
                const localData = localStorage.getItem(roomKey);
                if (localData) {
                    roomData = JSON.parse(localData);
                }
                console.log('LocalStorage room data:', roomData);
            }
            
            if (!roomData) {
                // List available rooms for debugging
                if (this.signalingMethod === 'firebase') {
                    const allRooms = await this.firebaseGet('rooms');
                    console.log('Available Firebase rooms:', allRooms ? Object.keys(allRooms) : 'none');
                } else {
                    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('room_'));
                    console.log('Available localStorage rooms:', allKeys);
                }
                throw new Error('Raum nicht gefunden');
            }
            
            if (!roomData || roomData.status === 'started') {
                throw new Error('Raum nicht verfügbar oder bereits gestartet');
            }
            
            this.room = roomData;
            this.isHost = false;
            this.playerId = 'guest_' + Date.now();
            this.playerName = playerName;
            this.localPlayer = {
                id: this.playerId,
                name: playerName,
                isHost: false,
                ready: false
            };
            
            this.players.set('host', roomData.hostData);
            this.players.set(this.playerId, this.localPlayer);
            
            // Setup WebRTC as guest
            await this.setupWebRTCGuest(roomCode);
            
            this.showWaitingRoom();
            this.updateConnectionStatus('connected', 'Raum beigetreten');
            
        } catch (error) {
            console.error('Error joining room:', error);
            this.updateConnectionStatus('disconnected', 'Verbindung fehlgeschlagen');
            alert('Fehler beim Beitreten: ' + error.message);
        }
    }

    showWaitingRoom() {
        document.getElementById('multiplayerLobby').style.display = 'none';
        document.getElementById('waitingRoom').style.display = 'block';
        
        const title = this.isHost ? 'Warte auf Spieler...' : 'Im Raum';
        document.getElementById('waitingRoomTitle').textContent = title;
        
        if (this.room) {
            document.getElementById('displayRoomCode').textContent = this.room.code;
        }
        
        this.updatePlayersDisplay();
    }

    updatePlayersDisplay() {
        const playersGrid = document.getElementById('playersGrid');
        playersGrid.innerHTML = '';
        
        this.players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = `player-card ${player.isHost ? 'host' : ''} ${player.ready ? 'ready' : ''}`;
            
            playerCard.innerHTML = `
                <div class="player-avatar">
                    <i class="fas fa-${player.isHost ? 'crown' : 'user'}"></i>
                </div>
                <div class="player-name">${player.name}</div>
                <div class="player-status">
                    ${player.isHost ? 'Host' : player.ready ? 'Bereit' : 'Wartet...'}
                </div>
            `;
            
            playersGrid.appendChild(playerCard);
        });
        
        // Update start button
        const startBtn = document.getElementById('startMultiplayerGame');
        const canStart = this.isHost && this.players.size >= 2 && Array.from(this.players.values()).every(p => p.ready || p.isHost);
        startBtn.disabled = !canStart;
    }

    async setupWebRTCHost() {
        try {
            // Create RTCPeerConnection
            this.connection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // Create data channel
            this.dataChannel = this.connection.createDataChannel('gameData', {
                ordered: true
            });

            this.setupDataChannelHandlers();

            // Generate offer
            const offer = await this.connection.createOffer();
            await this.connection.setLocalDescription(offer);

            // Store offer using appropriate signaling method
            if (this.signalingMethod === 'firebase') {
                await this.firebaseSet(`signaling/${this.room.code}/offer`, offer);
                console.log('Offer stored in Firebase');
            } else {
                localStorage.setItem('multiplayerOffer_' + this.room.code, JSON.stringify(offer));
                console.log('Offer stored in localStorage');
            }

            // Handle ICE candidates
            this.connection.onicecandidate = async (event) => {
                if (event.candidate) {
                    console.log('Host ICE candidate:', event.candidate);
                    
                    if (this.signalingMethod === 'firebase') {
                        // Get existing candidates and add new one
                        const existingCandidates = await this.firebaseGet(`signaling/${this.room.code}/hostCandidates`) || [];
                        existingCandidates.push(event.candidate);
                        await this.firebaseSet(`signaling/${this.room.code}/hostCandidates`, existingCandidates);
                    } else {
                        const candidates = JSON.parse(localStorage.getItem('iceCandidates_' + this.room.code) || '[]');
                        candidates.push(event.candidate);
                        localStorage.setItem('iceCandidates_' + this.room.code, JSON.stringify(candidates));
                    }
                }
            };

            this.updateConnectionStatus('connected', 'Warte auf Verbindung...');
            
            // Check for guest connections periodically
            this.checkForGuestInterval = setInterval(() => {
                this.checkForGuestConnections();
            }, 2000);

        } catch (error) {
            console.error('WebRTC Host setup failed:', error);
            throw error;
        }
    }

    async setupWebRTCGuest(roomCode) {
        try {
            // Wait for host offer (with timeout)
            let offer = null;
            let attempts = 0;
            const maxAttempts = 15; // 30 seconds timeout
            
            while (!offer && attempts < maxAttempts) {
                if (this.signalingMethod === 'firebase') {
                    offer = await this.firebaseGet(`signaling/${roomCode}/offer`);
                } else {
                    const offerData = localStorage.getItem('multiplayerOffer_' + roomCode);
                    if (offerData) {
                        offer = JSON.parse(offerData);
                    }
                }
                
                if (!offer) {
                    console.log(`Waiting for host offer... attempt ${attempts + 1}/${maxAttempts}`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    attempts++;
                }
            }
            
            if (!offer) {
                throw new Error('Raum nicht gefunden oder Host nicht bereit');
            }

            console.log('Found host offer:', offer);

            // Create RTCPeerConnection
            this.connection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // Handle incoming data channel
            this.connection.ondatachannel = (event) => {
                this.dataChannel = event.channel;
                this.setupDataChannelHandlers();
            };

            // Set remote description
            await this.connection.setRemoteDescription(offer);

            // Create answer
            const answer = await this.connection.createAnswer();
            await this.connection.setLocalDescription(answer);

            // Store answer using appropriate signaling method
            if (this.signalingMethod === 'firebase') {
                await this.firebaseSet(`signaling/${roomCode}/answer`, answer);
                console.log('Answer stored in Firebase');
            } else {
                localStorage.setItem('multiplayerAnswer_' + roomCode, JSON.stringify(answer));
                console.log('Answer stored in localStorage');
            }

            // Handle ICE candidates
            this.connection.onicecandidate = async (event) => {
                if (event.candidate) {
                    console.log('Guest ICE candidate:', event.candidate);
                    
                    if (this.signalingMethod === 'firebase') {
                        const existingCandidates = await this.firebaseGet(`signaling/${roomCode}/guestCandidates`) || [];
                        existingCandidates.push(event.candidate);
                        await this.firebaseSet(`signaling/${roomCode}/guestCandidates`, existingCandidates);
                    } else {
                        const candidates = JSON.parse(localStorage.getItem('guestIceCandidates_' + roomCode) || '[]');
                        candidates.push(event.candidate);
                        localStorage.setItem('guestIceCandidates_' + roomCode, JSON.stringify(candidates));
                    }
                }
            };

            // Add stored ICE candidates from host
            setTimeout(async () => {
                let hostCandidates = [];
                
                if (this.signalingMethod === 'firebase') {
                    hostCandidates = await this.firebaseGet(`signaling/${roomCode}/hostCandidates`) || [];
                } else {
                    hostCandidates = JSON.parse(localStorage.getItem('iceCandidates_' + roomCode) || '[]');
                }
                
                for (const candidate of hostCandidates) {
                    try {
                        await this.connection.addIceCandidate(candidate);
                        console.log('Added host ICE candidate');
                    } catch (error) {
                        console.warn('Failed to add host ICE candidate:', error);
                    }
                }
            }, 2000);

            this.updateConnectionStatus('connected', 'Verbunden');

        } catch (error) {
            console.error('WebRTC Guest setup failed:', error);
            throw error;
        }
    }

    async checkForGuestConnections() {
        if (!this.room || !this.connection) return;

        let answer = null;
        
        if (this.signalingMethod === 'firebase') {
            answer = await this.firebaseGet(`signaling/${this.room.code}/answer`);
        } else {
            const answerData = localStorage.getItem('multiplayerAnswer_' + this.room.code);
            if (answerData) {
                answer = JSON.parse(answerData);
            }
        }
        
        if (answer && this.connection.remoteDescription === null) {
            try {
                await this.connection.setRemoteDescription(answer);
                console.log('Set guest answer as remote description');

                // Add guest ICE candidates
                let guestCandidates = [];
                
                if (this.signalingMethod === 'firebase') {
                    guestCandidates = await this.firebaseGet(`signaling/${this.room.code}/guestCandidates`) || [];
                } else {
                    guestCandidates = JSON.parse(localStorage.getItem('guestIceCandidates_' + this.room.code) || '[]');
                }
                
                for (const candidate of guestCandidates) {
                    try {
                        await this.connection.addIceCandidate(candidate);
                        console.log('Added guest ICE candidate');
                    } catch (error) {
                        console.warn('Failed to add guest ICE candidate:', error);
                    }
                }

                // Update connection status
                clearInterval(this.checkForGuestInterval);
                this.updateConnectionStatus('connected', 'Spieler verbunden!');

                // Send welcome message to establish connection
                setTimeout(() => {
                    if (this.dataChannel && this.dataChannel.readyState === 'open') {
                        this.sendMessage({
                            type: 'playerUpdate',
                            data: this.localPlayer,
                            playerId: this.playerId
                        });
                    }
                }, 2000);

            } catch (error) {
                console.error('Failed to handle guest answer:', error);
            }
        }
    }

    setupDataChannelHandlers() {
        if (!this.dataChannel) return;

        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
            this.updateConnectionStatus('connected', 'Datenkanal bereit');
            
            // Send initial player data
            if (this.localPlayer) {
                this.sendMessage({
                    type: 'playerUpdate',
                    data: this.localPlayer,
                    playerId: this.playerId
                });
            }
        };

        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
            this.updateConnectionStatus('disconnected', 'Verbindung getrennt');
        };

        this.dataChannel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Failed to parse message:', error);
            }
        };

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
            this.updateConnectionStatus('disconnected', 'Verbindungsfehler');
        };
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            if (i === 4) result += '-';
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Debug function to list all rooms
    listAvailableRooms() {
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('room_'));
        console.log('Available rooms in localStorage:');
        allKeys.forEach(key => {
            const roomData = localStorage.getItem(key);
            try {
                const room = JSON.parse(roomData);
                console.log(`- ${key}: ${room.name} (${room.mode}, ${room.status})`);
            } catch (e) {
                console.log(`- ${key}: Invalid data`);
            }
        });
        return allKeys;
    }

    // Clean up old rooms (older than 1 hour)
    cleanupOldRooms() {
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('room_'));
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        allKeys.forEach(key => {
            const roomData = localStorage.getItem(key);
            try {
                const room = JSON.parse(roomData);
                if (now - room.created > oneHour) {
                    localStorage.removeItem(key);
                    console.log('Removed old room:', key);
                }
            } catch (e) {
                localStorage.removeItem(key);
            }
        });
    }

    copyRoomCode() {
        const roomCode = document.getElementById('displayRoomCode').textContent;
        navigator.clipboard.writeText(roomCode).then(() => {
            // Show copy feedback
            const copyBtn = document.querySelector('.copy-btn');
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.background = 'var(--accent-green)';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
                copyBtn.style.background = '';
            }, 2000);
        });
    }

    updateConnectionStatus(state, text) {
        this.connectionState = state;
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        indicator.className = `status-indicator ${state}`;
        statusText.textContent = text;
    }

    startGame() {
        if (!this.isHost) return;
        
        // Start multiplayer game
        closeModal('multiplayerModal');
        
        // Initialize multiplayer game mode
        this.initializeMultiplayerGame();
    }

    initializeMultiplayerGame() {
        if (!game) return;
        
        // Set multiplayer mode in game
        game.multiplayerMode = this.mode;
        game.multiplayerManager = this;
        
        // Start the game
        game.startGameFromMenu();
        
        // Show multiplayer UI
        this.showMultiplayerGameUI();
    }

    showMultiplayerGameUI() {
        // Add multiplayer-specific UI elements to the game
        const multiplayerUI = document.createElement('div');
        multiplayerUI.id = 'multiplayerGameUI';
        multiplayerUI.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 1rem;
            border-radius: 10px;
            color: white;
            z-index: 1000;
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;
        
        multiplayerUI.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <i class="fas fa-users"></i>
                <strong>${this.mode === 'coop' ? 'Kooperativ' : 'PvP'} Modus</strong>
            </div>
            <div style="font-size: 0.8rem; color: #ccc;">
                <div>Spieler: ${this.players.size}</div>
                <div class="multiplayer-status" id="multiplayerStatus">Verbunden</div>
            </div>
        `;
        
        document.body.appendChild(multiplayerUI);
    }

    leaveRoom() {
        if (confirm('Möchtest du den Raum wirklich verlassen?')) {
            this.cleanup();
            this.showModeSelection();
            this.updateConnectionStatus('disconnected', 'Getrennt');
        }
    }

    async cleanup() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        
        if (this.checkForGuestInterval) {
            clearInterval(this.checkForGuestInterval);
            this.checkForGuestInterval = null;
        }
        
        // Clean up signaling data
        if (this.room && this.room.code) {
            if (this.signalingMethod === 'firebase') {
                // Clean up Firebase signaling data
                try {
                    await this.firebaseDelete(`rooms/${this.room.code}`);
                    await this.firebaseDelete(`signaling/${this.room.code}`);
                    console.log('Firebase room data cleaned up');
                } catch (error) {
                    console.warn('Failed to clean up Firebase data:', error);
                }
            } else {
                // Clean up localStorage
                localStorage.removeItem(`room_${this.room.code}`);
                localStorage.removeItem(`multiplayerOffer_${this.room.code}`);
                localStorage.removeItem(`multiplayerAnswer_${this.room.code}`);
                localStorage.removeItem(`iceCandidates_${this.room.code}`);
                localStorage.removeItem(`guestIceCandidates_${this.room.code}`);
            }
        }
        
        this.players.clear();
        this.room = null;
        this.isHost = false;
        this.localPlayer = null;
        this.playerId = null;
        this.playerName = null;
        
        // Remove multiplayer UI if exists
        const multiplayerUI = document.getElementById('multiplayerGameUI');
        if (multiplayerUI) {
            multiplayerUI.remove();
        }
        
        // Reset game multiplayer mode
        if (game) {
            game.multiplayerMode = null;
        }
    }

    // Message handling for multiplayer communication
    sendMessage(message) {
        if (!this.dataChannel || this.dataChannel.readyState !== 'open') return;
        
        const messageWithTimestamp = {
            ...message,
            timestamp: Date.now()
        };
        
        this.dataChannel.send(JSON.stringify(messageWithTimestamp));
    }

    handleMessage(message) {
        const { type, data, playerId } = message;
        
        switch (type) {
            case 'playerUpdate':
                this.players.set(playerId, data);
                this.updatePlayersDisplay();
                break;
            case 'playerReady':
                if (this.players.has(playerId)) {
                    this.players.get(playerId).ready = data.ready;
                    this.updatePlayersDisplay();
                }
                break;
            case 'gameSync':
                this.handleGameSync(data);
                break;
            case 'towerPlaced':
                this.handleTowerPlaced(data);
                break;
            case 'towerUpgraded':
                this.handleTowerUpgraded(data);
                break;
            case 'towerSold':
                this.handleTowerSold(data);
                break;
            case 'enemySent':
                this.handleEnemySent(data);
                break;
            case 'resourceUpdate':
                this.handleResourceUpdate(data);
                break;
            case 'waveSync':
                this.handleWaveSync(data);
                break;
            case 'specialAbility':
                this.handleSpecialAbility(data);
                break;
            case 'gameState':
                this.handleGameStateUpdate(data);
                break;
        }
    }

    handleGameSync(data) {
        if (!game || !game.multiplayerMode) return;
        
        // Synchronize basic game state
        if (this.mode === 'coop' && !this.isHost) {
            // Guest synchronizes with host in coop mode
            if (data.wave !== undefined) game.wave = data.wave;
            if (data.waveInProgress !== undefined) game.waveInProgress = data.waveInProgress;
            if (data.gameSpeed !== undefined) game.gameSpeed = data.gameSpeed;
        }
    }

    handleTowerPlaced(data) {
        if (!game || !game.multiplayerMode) return;
        
        if (game.multiplayerMode === 'coop') {
            // In coop mode, show other player's towers
            const tower = new Tower(data.type, data.x, data.y);
            tower.isMultiplayerTower = true;
            tower.multiplayerOwner = data.playerId;
            
            // Apply any upgrades
            if (data.upgrades) {
                tower.upgrades = { ...data.upgrades };
                tower.updateStats();
            }
            
            game.towers.push(tower);
            
            // Update shared resources in coop
            if (data.sharedMoney !== undefined) {
                game.money = data.sharedMoney;
            }
        }
    }

    handleTowerUpgraded(data) {
        if (!game || !game.multiplayerMode === 'coop') return;
        
        // Find the tower and apply upgrade
        const tower = game.towers.find(t => 
            Math.abs(t.x - data.x) < 5 && Math.abs(t.y - data.y) < 5
        );
        
        if (tower) {
            tower.upgrades = { ...data.upgrades };
            tower.updateStats();
            
            // Update shared resources
            if (data.sharedMoney !== undefined) {
                game.money = data.sharedMoney;
            }
        }
    }

    handleTowerSold(data) {
        if (!game || !game.multiplayerMode === 'coop') return;
        
        // Remove the tower
        game.towers = game.towers.filter(tower => 
            !(Math.abs(tower.x - data.x) < 5 && Math.abs(tower.y - data.y) < 5)
        );
        
        // Update shared resources
        if (data.sharedMoney !== undefined) {
            game.money = data.sharedMoney;
        }
    }

    handleEnemySent(data) {
        if (!game || game.multiplayerMode !== 'pvp') return;
        
        // Add enemies sent by opponent in PvP mode
        for (let i = 0; i < data.count; i++) {
            const enemy = new Enemy(game.path, data.enemyType, game.wave);
            enemy.isPvPEnemy = true;
            enemy.sentByPlayer = data.playerId;
            
            // Add slight delay between enemies
            setTimeout(() => {
                if (game.enemies) {
                    game.enemies.push(enemy);
                }
            }, i * 200);
        }
        
        // Show notification
        this.showPvPNotification(`${data.playerName} sendet ${data.count}x ${data.enemyType}!`);
    }

    handleResourceUpdate(data) {
        if (!game || game.multiplayerMode !== 'coop') return;
        
        // Update shared resources in coop mode
        if (data.money !== undefined) game.money = data.money;
        if (data.lives !== undefined) game.lives = data.lives;
        if (data.score !== undefined) game.score = data.score;
    }

    handleWaveSync(data) {
        if (!game || !this.isHost) return; // Only host manages waves
        
        // Guest is ready for next wave
        if (data.ready && this.mode === 'coop') {
            this.guestReadyForWave = true;
        }
    }

    handleSpecialAbility(data) {
        if (!game || game.multiplayerMode !== 'coop') return;
        
        // Execute special ability from other player
        switch (data.ability) {
            case 'meteorStrike':
                game.meteorStrike(data.x, data.y);
                break;
            case 'freezeAll':
                game.freezeAllEnemies();
                break;
            case 'goldRush':
                game.goldRush();
                break;
            // Add other abilities as needed
        }
        
        this.showCoopNotification(`${data.playerName} verwendet ${data.abilityName}!`);
    }

    handleGameStateUpdate(data) {
        if (!game) return;
        
        // Handle game over, victory, etc.
        if (data.gameOver) {
            if (game.multiplayerMode === 'pvp') {
                this.showPvPGameOver(data.winner, data.reason);
            } else {
                // Coop game over
                game.gameOver();
            }
        }
    }

    // Multiplayer message sending methods
    sendTowerPlaced(tower) {
        if (!this.isConnected() || !tower) return;
        
        const message = {
            type: 'towerPlaced',
            data: {
                type: tower.type,
                x: tower.x,
                y: tower.y,
                upgrades: tower.upgrades,
                playerId: this.playerId,
                playerName: this.playerName,
                sharedMoney: game.multiplayerMode === 'coop' ? game.money : undefined
            },
            playerId: this.playerId
        };
        
        this.sendMessage(message);
    }

    sendTowerUpgraded(tower) {
        if (!this.isConnected() || !tower || game.multiplayerMode !== 'coop') return;
        
        const message = {
            type: 'towerUpgraded',
            data: {
                x: tower.x,
                y: tower.y,
                upgrades: tower.upgrades,
                playerId: this.playerId,
                sharedMoney: game.money
            },
            playerId: this.playerId
        };
        
        this.sendMessage(message);
    }

    sendTowerSold(x, y, sellValue) {
        if (!this.isConnected() || game.multiplayerMode !== 'coop') return;
        
        const message = {
            type: 'towerSold',
            data: {
                x: x,
                y: y,
                sellValue: sellValue,
                playerId: this.playerId,
                sharedMoney: game.money
            },
            playerId: this.playerId
        };
        
        this.sendMessage(message);
    }

    sendEnemies(enemyType, count) {
        if (!this.isConnected() || game.multiplayerMode !== 'pvp') return;
        
        const message = {
            type: 'enemySent',
            data: {
                enemyType: enemyType,
                count: count,
                playerId: this.playerId,
                playerName: this.playerName
            },
            playerId: this.playerId
        };
        
        this.sendMessage(message);
    }

    sendResourceUpdate() {
        if (!this.isConnected() || game.multiplayerMode !== 'coop') return;
        
        const message = {
            type: 'resourceUpdate',
            data: {
                money: game.money,
                lives: game.lives,
                score: game.score,
                playerId: this.playerId
            },
            playerId: this.playerId
        };
        
        this.sendMessage(message);
    }

    sendGameSync() {
        if (!this.isConnected() || !this.isHost) return;
        
        const message = {
            type: 'gameSync',
            data: {
                wave: game.wave,
                waveInProgress: game.waveInProgress,
                gameSpeed: game.gameSpeed,
                playerId: this.playerId
            },
            playerId: this.playerId
        };
        
        this.sendMessage(message);
    }

    sendWaveReady() {
        if (!this.isConnected() || this.isHost) return;
        
        const message = {
            type: 'waveSync',
            data: {
                ready: true,
                playerId: this.playerId
            },
            playerId: this.playerId
        };
        
        this.sendMessage(message);
    }

    sendSpecialAbility(abilityType, abilityName, x = null, y = null) {
        if (!this.isConnected() || game.multiplayerMode !== 'coop') return;
        
        const message = {
            type: 'specialAbility',
            data: {
                ability: abilityType,
                abilityName: abilityName,
                x: x,
                y: y,
                playerId: this.playerId,
                playerName: this.playerName
            },
            playerId: this.playerId
        };
        
        this.sendMessage(message);
    }

    sendGameOver(winner = null, reason = null) {
        if (!this.isConnected()) return;
        
        const message = {
            type: 'gameState',
            data: {
                gameOver: true,
                winner: winner,
                reason: reason,
                playerId: this.playerId
            },
            playerId: this.playerId
        };
        
        this.sendMessage(message);
    }

    // Notification system for multiplayer
    showCoopNotification(message) {
        this.showNotification(message, 'coop');
    }

    showPvPNotification(message) {
        this.showNotification(message, 'pvp');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `multiplayer-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'pvp' ? '#ff4444' : '#44ff44'};
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showPvPGameOver(winner, reason) {
        const overlay = document.createElement('div');
        overlay.className = 'pvp-game-over-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const resultText = winner === this.playerId ? 'SIEG!' : 'NIEDERLAGE!';
        const resultColor = winner === this.playerId ? '#44ff44' : '#ff4444';
        
        overlay.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 10px; text-align: center; max-width: 400px;">
                <h2 style="color: ${resultColor}; margin: 0 0 20px 0; font-size: 2em;">${resultText}</h2>
                <p style="margin: 10px 0; font-size: 1.1em;">${reason || 'Spiel beendet'}</p>
                <button onclick="this.parentElement.parentElement.remove(); multiplayerManager.leaveRoom();" 
                        style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px;">
                    Zurück zur Lobby
                </button>
                <button onclick="this.parentElement.parentElement.remove(); game.resetGame();" 
                        style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px;">
                    Neues Spiel
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    // Initialize multiplayer UI elements
    initializeMultiplayerUI() {
        // Check if UI elements already exist
        if (document.getElementById('multiplayerNotifications')) return;
        
        // Notification-Container für Multiplayer
        const multiplayerNotifications = document.createElement('div');
        multiplayerNotifications.id = 'multiplayerNotifications';
        multiplayerNotifications.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
        `;
        document.body.appendChild(multiplayerNotifications);

        // PvP Enemy Send Panel
        const pvpPanel = document.createElement('div');
        pvpPanel.id = 'pvpEnemyPanel';
        pvpPanel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            display: none;
            z-index: 1000;
            min-width: 250px;
        `;
        pvpPanel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #ff4444;">Feinde senden</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                <button onclick="game.sendPvPEnemies('basic', 5)" style="background: #666; color: white; border: none; padding: 8px; border-radius: 3px; cursor: pointer;">5x Basic (50💰)</button>
                <button onclick="game.sendPvPEnemies('fast', 3)" style="background: #666; color: white; border: none; padding: 8px; border-radius: 3px; cursor: pointer;">3x Fast (60💰)</button>
                <button onclick="game.sendPvPEnemies('tank', 2)" style="background: #666; color: white; border: none; padding: 8px; border-radius: 3px; cursor: pointer;">2x Tank (80💰)</button>
                <button onclick="game.sendPvPEnemies('flying', 4)" style="background: #666; color: white; border: none; padding: 8px; border-radius: 3px; cursor: pointer;">4x Flying (100💰)</button>
                <button onclick="game.sendPvPEnemies('boss', 1)" style="background: #666; color: white; border: none; padding: 8px; border-radius: 3px; cursor: pointer;">1x Boss (150💰)</button>
                <button onclick="game.sendPvPEnemies('swarm', 10)" style="background: #666; color: white; border: none; padding: 8px; border-radius: 3px; cursor: pointer;">10x Swarm (120💰)</button>
            </div>
            <div style="margin-top: 10px; font-size: 0.9em; color: #ccc;">
                Geld: <span id="pvpMoney">0</span>💰
            </div>
        `;
        document.body.appendChild(pvpPanel);

        // Coop Info Panel
        const coopPanel = document.createElement('div');
        coopPanel.id = 'coopInfoPanel';
        coopPanel.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            display: none;
            z-index: 1000;
            min-width: 250px;
        `;
        coopPanel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #44ff44;">Coop Status</h3>
            <div id="coopPartnerInfo">Partner: Warte...</div>
            <div style="margin-top: 10px;">
                <div>Gemeinsame Ressourcen:</div>
                <div>💰 Geld: <span id="coopSharedMoney">0</span></div>
                <div>❤️ Leben: <span id="coopSharedLives">0</span></div>
                <div>🏆 Punkte: <span id="coopSharedScore">0</span></div>
            </div>
            <div style="margin-top: 10px;">
                <button onclick="game.useCoopAbility('goldRush')" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px;">💰 Gold Rush</button>
                <button onclick="game.useCoopAbility('freezeAll')" style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin: 2px;">❄️ Freeze All</button>
            </div>
        `;
        document.body.appendChild(coopPanel);
    }

    startMultiplayerGame() {
        if (!this.isConnected() || !this.mode) {
            this.showNotification('Nicht bereit zum Spielen!', 'pvp');
            return;
        }
        
        // Initialize multiplayer UI elements
        game.initializeMultiplayerUI();
        
        // Set game mode
        game.multiplayerMode = this.mode;
        
        // Start the game
        this.startGame();
    }

    startGame() {
        // Hide multiplayer UI
        document.getElementById('multiplayerUI').style.display = 'none';
        
        // Start actual game
        if (game) {
            game.startGame();
        }
    }
}

// Changelog Funktionalität
async function loadChangelog() {
    try {
        const response = await fetch('changelog.md');
        if (!response.ok) {
            throw new Error('Changelog nicht gefunden');
        }
        const markdown = await response.text();
        return parseMarkdownToHTML(markdown);
    } catch (error) {
        console.error('Fehler beim Laden des Changelogs:', error);
        return '<p>Changelog konnte nicht geladen werden.</p>';
    }
}

function parseMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Lists - erst die Listenpunkte markieren
    const lines = html.split('\n');
    let inList = false;
    let result = [];
    
    for (let line of lines) {
        if (line.trim().startsWith('- ')) {
            if (!inList) {
                result.push('<ul>');
                inList = true;
            }
            result.push('<li>' + line.substring(2).trim() + '</li>');
        } else {
            if (inList) {
                result.push('</ul>');
                inList = false;
            }
            result.push(line);
        }
    }
    
    if (inList) {
        result.push('</ul>');
    }
    
    html = result.join('\n');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    // Horizontal rules
    html = html.replace(/---<br>/g, '<hr>');
    
    // Code blocks
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    return html;
}

function showChangelog() {
    const modal = document.getElementById('changelogModal');
    const content = document.getElementById('changelogContent');
    
    if (modal && content) {
        modal.style.display = 'flex';
        content.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Lade Changelog...</p>';
        
        loadChangelog().then(html => {
            content.innerHTML = html;
        });
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

// Map Selection bestätigen
function confirmMapSelection() {
    if (game && game.tempSelectedMapId) {
        game.currentMapId = game.tempSelectedMapId;
        game.loadMap(game.tempSelectedMapId);
        closeModal('mapSelectionModal');
        
        // Notification anzeigen
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-green);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: var(--shadow-lg);
        `;
        notification.textContent = `Map "${game.maps[game.currentMapId].name}" ausgewählt!`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Spiel starten
let game;
window.addEventListener('load', () => {
    console.log('Window loaded, initializing game...');
    game = new Game();
    console.log('Game object created:', game);
    console.log('Game startGameFromMenu method exists:', typeof game.startGameFromMenu);
    
    // Event Listeners für Hauptmenü setzen
    setupMainMenuEventListeners();
    console.log('Main menu event listeners set up');
    
    // Skill Points Badge initial aktualisieren
    game.updateSkillPointsBadge();
    
    // Hauptmenü initial anzeigen
    const mainMenu = document.getElementById('mainMenu');
    const gameContainer = document.getElementById('gameContainer');
    const changelogBtn = document.getElementById('changelogBtn');
    
    if (mainMenu) mainMenu.style.display = 'flex';
    if (gameContainer) gameContainer.style.display = 'none';
    if (changelogBtn) changelogBtn.style.display = 'flex'; // Button initial anzeigen
    
    console.log('Game initialization complete');
});

function setupMainMenuEventListeners() {
    console.log('Setting up main menu event listeners...');
    
    // Hauptmenü Event Listeners
    const startGameBtn = document.getElementById('startGame');
    
    // Debug: Button-Klickbarkeit prüfen
    console.log('Button found:', !!startGameBtn);
    if (startGameBtn) {
        console.log('Button computed style pointer-events:', window.getComputedStyle(startGameBtn).pointerEvents);
        console.log('Button computed style z-index:', window.getComputedStyle(startGameBtn).zIndex);
        console.log('Button computed style display:', window.getComputedStyle(startGameBtn).display);
        console.log('Button position:', startGameBtn.getBoundingClientRect());
        
        // Test: Was ist an der Button-Position?
        const rect = startGameBtn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const elementAtCenter = document.elementFromPoint(centerX, centerY);
        console.log('Element at button center:', elementAtCenter);
        console.log('Is element the button itself?', elementAtCenter === startGameBtn);
        
        // Prüfe Parent-Elemente
        let parent = startGameBtn.parentElement;
        while (parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (parentStyle.pointerEvents === 'none') {
                console.log('Parent with pointer-events none found:', parent);
            }
            parent = parent.parentElement;
        }
    }
    
    const howToPlayBtn = document.getElementById('howToPlay');
    const settingsBtn = document.getElementById('settings');
    const statisticsBtn = document.getElementById('statistics');
    const skillTreeMenuBtn = document.getElementById('skillTreeMenu');
    const mapSelectionBtn = document.getElementById('mapSelection');
    const mapEditorBtn = document.getElementById('mapEditor');
    const multiplayerBtn = document.getElementById('multiplayer');
    const tradingSystemBtn = document.getElementById('tradingSystem');
    const changelogBtn = document.getElementById('changelogBtn');
    
    if (startGameBtn) {
        console.log('Found startGame button, adding event listener');
        
        // Mehrere Event Listener für Debug
        startGameBtn.addEventListener('click', (e) => {
            console.log('>>> CLICK EVENT FIRED <<<', e);
            console.log('Event target:', e.target);
            console.log('Event currentTarget:', e.currentTarget);
            e.preventDefault();
            e.stopPropagation();
            
            try {
                if (game) {
                    game.startGameFromMenu();
                } else {
                    console.error('Game object not found!');
                }
            } catch (error) {
                console.error('Error in startGameFromMenu:', error);
                console.error('Error stack:', error.stack);
            }
        }, true); // Use capture phase
        
        startGameBtn.addEventListener('mousedown', () => {
            console.log('>>> MOUSEDOWN EVENT <<<');
        });
        
        startGameBtn.addEventListener('mouseup', () => {
            console.log('>>> MOUSEUP EVENT <<<');
        });
        
    } else {
        console.error('startGame button not found!');
    }
    
    if (howToPlayBtn) {
        howToPlayBtn.addEventListener('click', () => {
            if (game) game.showHowToPlay();
        });
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            if (game) game.showSettings();
        });
    }
    
    if (statisticsBtn) {
        statisticsBtn.addEventListener('click', () => {
            if (game) game.showStatistics();
        });
    }
    
    if (skillTreeMenuBtn) {
        skillTreeMenuBtn.addEventListener('click', () => {
            if (game) game.showSkillTreeFromMenu();
        });
    }
    
    if (mapSelectionBtn) {
        mapSelectionBtn.addEventListener('click', () => {
            if (game) game.showMapSelection();
        });
    }
    
    if (mapEditorBtn) {
        mapEditorBtn.addEventListener('click', () => {
            if (game) game.showMapEditor();
        });
    }
    
    if (multiplayerBtn) {
        multiplayerBtn.addEventListener('click', () => {
            if (game) {
                const modal = document.getElementById('multiplayerModal');
                if (modal) {
                    modal.style.display = 'flex';
                    game.initializeMultiplayer();
                }
            }
        });
    }
    
    if (tradingSystemBtn) {
        tradingSystemBtn.addEventListener('click', () => {
            if (game) {
                game.showTradingSystem();
            }
        });
    }
    
    if (changelogBtn) {
        changelogBtn.addEventListener('click', () => {
            if (typeof showChangelog === 'function') {
                showChangelog();
            }
        });
    }
    
    // Guild System Button
    const guildBtn = document.getElementById('guildsystem');
    if (guildBtn) {
        guildBtn.addEventListener('click', () => {
            if (typeof showGuildSystem === 'function') {
                showGuildSystem();
            }
        });
    }
    
    // Tower Prestige Button
    const prestigeBtn = document.getElementById('towerPrestige');
    if (prestigeBtn) {
        prestigeBtn.addEventListener('click', () => {
            if (typeof showPrestigeSystem === 'function') {
                showPrestigeSystem();
            }
        });
    }
}

// ==========================================================================
// GUILD SYSTEM IMPLEMENTATION
// ==========================================================================

class GuildSystem {
    constructor() {
        this.currentGuild = null;
        this.playerGuildData = {
            guildId: null,
            role: null, // 'leader', 'officer', 'member'
            joinDate: null,
            contribution: 0
        };
        this.guilds = new Map();
        this.guildWars = [];
        this.loadGuildData();
    }

    initialize() {
        this.loadGuildData();
        this.updateGuildDisplay();
    }

    loadGuildData() {
        // Load from localStorage
        const savedGuildData = localStorage.getItem('guildPlayerData');
        if (savedGuildData) {
            this.playerGuildData = JSON.parse(savedGuildData);
        }

        const savedGuilds = localStorage.getItem('allGuilds');
        if (savedGuilds) {
            const guildsArray = JSON.parse(savedGuilds);
            this.guilds = new Map(guildsArray);
        }

        const savedWars = localStorage.getItem('guildWars');
        if (savedWars) {
            this.guildWars = JSON.parse(savedWars);
        }

        // Load current guild if player is in one
        if (this.playerGuildData.guildId) {
            this.currentGuild = this.guilds.get(this.playerGuildData.guildId);
        }
    }

    saveGuildData() {
        localStorage.setItem('guildPlayerData', JSON.stringify(this.playerGuildData));
        localStorage.setItem('allGuilds', JSON.stringify(Array.from(this.guilds.entries())));
        localStorage.setItem('guildWars', JSON.stringify(this.guildWars));
    }

    generateGuildCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        result += '-';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    createGuild(name, description, type) {
        if (this.currentGuild) {
            alert('Du bist bereits in einer Gilde!');
            return false;
        }

        if (!name || name.trim().length < 3) {
            alert('Gildenname muss mindestens 3 Zeichen lang sein!');
            return false;
        }

        const guildId = 'guild_' + Date.now();
        const guildCode = this.generateGuildCode();
        
        const newGuild = {
            id: guildId,
            name: name.trim(),
            description: description.trim() || 'Keine Beschreibung',
            type: type,
            code: guildCode,
            leader: game.playerName || 'Anonym',
            members: [
                {
                    name: game.playerName || 'Anonym',
                    role: 'leader',
                    joinDate: Date.now(),
                    level: game.statistics?.totalGames || 1,
                    contribution: 0,
                    online: true
                }
            ],
            createdAt: Date.now(),
            level: 1,
            experience: 0,
            wars: {
                total: 0,
                won: 0,
                lost: 0
            },
            perks: {
                goldBonus: 0,
                expBonus: 0,
                damageBonus: 0
            }
        };

        this.guilds.set(guildId, newGuild);
        this.currentGuild = newGuild;
        this.playerGuildData = {
            guildId: guildId,
            role: 'leader',
            joinDate: Date.now(),
            contribution: 0
        };

        this.saveGuildData();
        this.updateGuildDisplay();
        
        alert(`Gilde "${name}" erfolgreich erstellt!\nGilden-Code: ${guildCode}`);
        return true;
    }

    joinGuild(guildCode) {
        if (this.currentGuild) {
            alert('Du bist bereits in einer Gilde!');
            return false;
        }

        if (!guildCode || guildCode.length !== 9) {
            alert('Ungültiger Gilden-Code!');
            return false;
        }

        // Find guild by code
        let targetGuild = null;
        for (let guild of this.guilds.values()) {
            if (guild.code === guildCode.toUpperCase()) {
                targetGuild = guild;
                break;
            }
        }

        if (!targetGuild) {
            alert('Gilde nicht gefunden!');
            return false;
        }

        if (targetGuild.members.length >= 50) {
            alert('Diese Gilde ist voll!');
            return false;
        }

        // Add player to guild
        const newMember = {
            name: game.playerName || 'Anonym',
            role: 'member',
            joinDate: Date.now(),
            level: game.statistics?.totalGames || 1,
            contribution: 0,
            online: true
        };

        targetGuild.members.push(newMember);
        this.currentGuild = targetGuild;
        this.playerGuildData = {
            guildId: targetGuild.id,
            role: 'member',
            joinDate: Date.now(),
            contribution: 0
        };

        this.guilds.set(targetGuild.id, targetGuild);
        this.saveGuildData();
        this.updateGuildDisplay();
        
        alert(`Erfolgreich der Gilde "${targetGuild.name}" beigetreten!`);
        return true;
    }

    leaveGuild() {
        if (!this.currentGuild) {
            return false;
        }

        if (this.playerGuildData.role === 'leader' && this.currentGuild.members.length > 1) {
            alert('Als Anführer musst du erst einen neuen Anführer ernennen oder die Gilde auflösen!');
            return false;
        }

        if (confirm(`Möchtest du wirklich die Gilde "${this.currentGuild.name}" verlassen?`)) {
            // Remove player from guild members
            this.currentGuild.members = this.currentGuild.members.filter(
                member => member.name !== (game.playerName || 'Anonym')
            );

            // If guild is empty, delete it
            if (this.currentGuild.members.length === 0) {
                this.guilds.delete(this.currentGuild.id);
            } else {
                this.guilds.set(this.currentGuild.id, this.currentGuild);
            }

            this.currentGuild = null;
            this.playerGuildData = {
                guildId: null,
                role: null,
                joinDate: null,
                contribution: 0
            };

            this.saveGuildData();
            this.updateGuildDisplay();
            return true;
        }
        return false;
    }

    updateGuildDisplay() {
        const guildInfo = document.getElementById('guildInfo');
        if (!guildInfo) return;

        if (!this.currentGuild) {
            guildInfo.innerHTML = `
                <div class="no-guild">
                    <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>Du bist in keiner Gilde</h3>
                    <p>Erstelle eine neue Gilde oder tritt einer bestehenden bei!</p>
                    <button onclick="showGuildTab('create')" class="guild-action-btn primary">
                        <i class="fas fa-plus"></i> Loslegen
                    </button>
                </div>
            `;
            return;
        }

        const guild = this.currentGuild;
        const playerMember = guild.members.find(m => m.name === (game.playerName || 'Anonym'));
        
        guildInfo.innerHTML = `
            <div class="guild-header">
                <h3><i class="fas fa-shield-alt"></i> ${guild.name}</h3>
                <div class="guild-code">Code: <strong>${guild.code}</strong></div>
                <p>${guild.description}</p>
            </div>
            
            <div class="guild-stats">
                <div class="guild-stat">
                    <span class="guild-stat-value">${guild.level}</span>
                    <span class="guild-stat-label">Gildenlevel</span>
                </div>
                <div class="guild-stat">
                    <span class="guild-stat-value">${guild.members.length}/50</span>
                    <span class="guild-stat-label">Mitglieder</span>
                </div>
                <div class="guild-stat">
                    <span class="guild-stat-value">${guild.wars.won}/${guild.wars.total}</span>
                    <span class="guild-stat-label">Siege/Kriege</span>
                </div>
                <div class="guild-stat">
                    <span class="guild-stat-value">${playerMember?.contribution || 0}</span>
                    <span class="guild-stat-label">Dein Beitrag</span>
                </div>
            </div>
            
            <div class="guild-perks">
                <h4><i class="fas fa-star"></i> Gilden-Boni</h4>
                <div class="perk-list">
                    <div class="perk-item">
                        <i class="fas fa-coins"></i> Gold Bonus: +${guild.perks.goldBonus}%
                    </div>
                    <div class="perk-item">
                        <i class="fas fa-chart-line"></i> EXP Bonus: +${guild.perks.expBonus}%
                    </div>
                    <div class="perk-item">
                        <i class="fas fa-sword"></i> Schaden Bonus: +${guild.perks.damageBonus}%
                    </div>
                </div>
            </div>
            
            <div class="guild-actions">
                <button onclick="guildSystem.copyGuildCode()" class="guild-action-btn secondary">
                    <i class="fas fa-copy"></i> Code kopieren
                </button>
                <button onclick="guildSystem.leaveGuild()" class="guild-action-btn" style="background: var(--danger-red);">
                    <i class="fas fa-sign-out-alt"></i> Gilde verlassen
                </button>
            </div>
        `;

        this.updateMembersDisplay();
        this.updateWarsDisplay();
    }

    updateMembersDisplay() {
        const membersList = document.getElementById('guildMembersList');
        if (!membersList || !this.currentGuild) return;

        const members = this.currentGuild.members.sort((a, b) => {
            const roleOrder = { leader: 0, officer: 1, member: 2 };
            return roleOrder[a.role] - roleOrder[b.role];
        });

        membersList.innerHTML = members.map(member => {
            const roleColor = {
                leader: 'var(--accent-gold)',
                officer: 'var(--accent-blue)',
                member: 'var(--text-light)'
            };

            const roleIcon = {
                leader: 'fas fa-crown',
                officer: 'fas fa-star',
                member: 'fas fa-user'
            };

            return `
                <div class="guild-member">
                    <div class="guild-member-avatar" style="background: ${roleColor[member.role]};">
                        <i class="${roleIcon[member.role]}"></i>
                    </div>
                    <div class="guild-member-info">
                        <div class="guild-member-name">${member.name}</div>
                        <div class="guild-member-role" style="color: ${roleColor[member.role]};">
                            ${member.role === 'leader' ? 'Anführer' : 
                              member.role === 'officer' ? 'Offizier' : 'Mitglied'}
                        </div>
                    </div>
                    <div class="guild-member-stats">
                        <span><i class="fas fa-trophy"></i> Level ${member.level}</span>
                        <span><i class="fas fa-hands-helping"></i> ${member.contribution}</span>
                        <span class="member-status ${member.online ? 'online' : 'offline'}">
                            <i class="fas fa-circle"></i> ${member.online ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateWarsDisplay() {
        const warsList = document.getElementById('guildWarsList');
        if (!warsList) return;

        if (this.guildWars.length === 0) {
            warsList.innerHTML = `
                <div class="no-wars">
                    <i class="fas fa-swords" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <h3>Keine Clan Wars verfügbar</h3>
                    <p>Clan Wars werden bald verfügbar sein!</p>
                </div>
            `;
            return;
        }

        warsList.innerHTML = this.guildWars.map(war => `
            <div class="guild-war">
                <div class="guild-war-header">
                    <h4>${war.name}</h4>
                    <div class="guild-war-status ${war.status}">
                        ${war.status === 'active' ? 'Aktiv' : 
                          war.status === 'ended' ? 'Beendet' : 'Bevorstehend'}
                    </div>
                </div>
                <div class="guild-war-teams">
                    <div class="guild-war-team">
                        <strong>${war.team1.name}</strong>
                        <div>Score: ${war.team1.score}</div>
                    </div>
                    <div class="guild-war-vs">VS</div>
                    <div class="guild-war-team">
                        <strong>${war.team2.name}</strong>
                        <div>Score: ${war.team2.score}</div>
                    </div>
                </div>
                <div class="guild-war-info">
                    <p><i class="fas fa-calendar"></i> ${new Date(war.startTime).toLocaleDateString()}</p>
                    <p><i class="fas fa-trophy"></i> Belohnung: ${war.reward}</p>
                </div>
            </div>
        `).join('');
    }

    copyGuildCode() {
        if (!this.currentGuild) return;
        
        navigator.clipboard.writeText(this.currentGuild.code).then(() => {
            alert(`Gilden-Code ${this.currentGuild.code} wurde kopiert!`);
        }).catch(() => {
            // Fallback für ältere Browser
            const textArea = document.createElement('textarea');
            textArea.value = this.currentGuild.code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert(`Gilden-Code ${this.currentGuild.code} wurde kopiert!`);
        });
    }

    addContribution(amount) {
        if (!this.currentGuild) return;
        
        this.playerGuildData.contribution += amount;
        
        // Update in guild members list
        const memberIndex = this.currentGuild.members.findIndex(
            m => m.name === (game.playerName || 'Anonym')
        );
        if (memberIndex !== -1) {
            this.currentGuild.members[memberIndex].contribution += amount;
        }

        // Add guild experience
        this.currentGuild.experience += amount;
        
        // Level up guild if enough experience
        const expNeeded = this.currentGuild.level * 1000;
        if (this.currentGuild.experience >= expNeeded) {
            this.currentGuild.level++;
            this.currentGuild.experience -= expNeeded;
            
            // Increase guild perks
            this.currentGuild.perks.goldBonus += 2;
            this.currentGuild.perks.expBonus += 1;
            this.currentGuild.perks.damageBonus += 1;
            
            // Show level up notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--accent-gold);
                color: black;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                z-index: 10000;
                font-weight: bold;
                box-shadow: var(--shadow-lg);
            `;
            notification.innerHTML = `
                <i class="fas fa-star"></i> 
                Gilde Level ${this.currentGuild.level} erreicht!
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 5000);
        }

        this.saveGuildData();
    }

    getGuildBonuses() {
        if (!this.currentGuild) {
            return { goldBonus: 0, expBonus: 0, damageBonus: 0 };
        }
        
        return {
            goldBonus: this.currentGuild.perks.goldBonus / 100,
            expBonus: this.currentGuild.perks.expBonus / 100,
            damageBonus: this.currentGuild.perks.damageBonus / 100
        };
    }
}

// ==========================================================================
// TOWER PRESTIGE SYSTEM IMPLEMENTATION
// ==========================================================================

class PrestigeSystem {
    constructor() {
        this.prestigePoints = 0;
        this.prestigedTowers = new Map(); // towerType -> prestigeLevel
        this.prestigeBonuses = new Map(); // bonusType -> value
        this.towerStats = new Map(); // Track tower usage stats
        this.loadPrestigeData();
    }

    initialize() {
        this.loadPrestigeData();
        this.updatePrestigeDisplay();
    }

    loadPrestigeData() {
        const savedPrestige = localStorage.getItem('towerPrestigeData');
        if (savedPrestige) {
            const data = JSON.parse(savedPrestige);
            this.prestigePoints = data.prestigePoints || 0;
            this.prestigedTowers = new Map(data.prestigedTowers || []);
            this.prestigeBonuses = new Map(data.prestigeBonuses || []);
            this.towerStats = new Map(data.towerStats || []);
        }
    }

    savePrestigeData() {
        const data = {
            prestigePoints: this.prestigePoints,
            prestigedTowers: Array.from(this.prestigedTowers.entries()),
            prestigeBonuses: Array.from(this.prestigeBonuses.entries()),
            towerStats: Array.from(this.towerStats.entries())
        };
        localStorage.setItem('towerPrestigeData', JSON.stringify(data));
    }

    trackTowerUsage(towerType, action, value = 1) {
        const key = `${towerType}_${action}`;
        const current = this.towerStats.get(key) || 0;
        this.towerStats.set(key, current + value);
        this.savePrestigeData();
    }

    getTowerRequirements(towerType) {
        const requirements = {
            basic: { upgrades: 50, kills: 1000, games: 10 },
            ice: { upgrades: 40, kills: 800, games: 8 },
            fire: { upgrades: 45, kills: 900, games: 9 },
            lightning: { upgrades: 35, kills: 700, games: 7 },
            poison: { upgrades: 40, kills: 800, games: 8 },
            sniper: { upgrades: 30, kills: 600, games: 6 },
            tesla: { upgrades: 25, kills: 500, games: 5 }
        };
        return requirements[towerType] || requirements.basic;
    }

    canPrestigeTower(towerType) {
        const requirements = this.getTowerRequirements(towerType);
        const stats = {
            upgrades: this.towerStats.get(`${towerType}_upgrade`) || 0,
            kills: this.towerStats.get(`${towerType}_kill`) || 0,
            games: this.towerStats.get(`${towerType}_used`) || 0
        };

        return stats.upgrades >= requirements.upgrades &&
               stats.kills >= requirements.kills &&
               stats.games >= requirements.games;
    }

    prestigeTower(towerType) {
        if (!this.canPrestigeTower(towerType)) {
            alert('Anforderungen für Prestige nicht erfüllt!');
            return false;
        }

        const currentLevel = this.prestigedTowers.get(towerType) || 0;
        const newLevel = currentLevel + 1;
        const cost = this.getPrestigeCost(towerType, newLevel);

        if (this.prestigePoints < cost) {
            alert(`Nicht genügend Prestige-Punkte! Benötigt: ${cost}, Verfügbar: ${this.prestigePoints}`);
            return false;
        }

        if (confirm(`${towerType.charAt(0).toUpperCase() + towerType.slice(1)} Tower auf Prestige Level ${newLevel} aufwerten für ${cost} Prestige-Punkte?`)) {
            this.prestigePoints -= cost;
            this.prestigedTowers.set(towerType, newLevel);
            
            // Apply prestige bonuses
            this.applyPrestigeBonuses(towerType, newLevel);
            
            // Reset tower stats for next prestige
            this.towerStats.set(`${towerType}_upgrade`, 0);
            this.towerStats.set(`${towerType}_kill`, 0);
            this.towerStats.set(`${towerType}_used`, 0);

            this.savePrestigeData();
            this.updatePrestigeDisplay();
            
            // Show success notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--accent-gold);
                color: black;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                z-index: 10000;
                font-weight: bold;
                box-shadow: var(--shadow-lg);
            `;
            notification.innerHTML = `
                <i class="fas fa-crown"></i> 
                ${towerType.charAt(0).toUpperCase() + towerType.slice(1)} Tower erfolgreich prestigiert!
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 5000);
            return true;
        }
        return false;
    }

    getPrestigeCost(towerType, level) {
        const baseCosts = {
            basic: 10,
            ice: 15,
            fire: 15,
            lightning: 20,
            poison: 15,
            sniper: 25,
            tesla: 30
        };
        
        const baseCost = baseCosts[towerType] || 10;
        return Math.floor(baseCost * Math.pow(1.5, level - 1));
    }

    applyPrestigeBonuses(towerType, level) {
        // Damage bonus
        const damageKey = `${towerType}_damage`;
        const currentDamageBonus = this.prestigeBonuses.get(damageKey) || 0;
        this.prestigeBonuses.set(damageKey, currentDamageBonus + 0.1); // +10% damage per level

        // Range bonus
        const rangeKey = `${towerType}_range`;
        const currentRangeBonus = this.prestigeBonuses.get(rangeKey) || 0;
        this.prestigeBonuses.set(rangeKey, currentRangeBonus + 0.05); // +5% range per level

        // Special bonuses every 5 levels
        if (level % 5 === 0) {
            const speedKey = `${towerType}_speed`;
            const currentSpeedBonus = this.prestigeBonuses.get(speedKey) || 0;
            this.prestigeBonuses.set(speedKey, currentSpeedBonus + 0.1); // +10% fire rate every 5 levels
        }

        // Legendary bonuses every 10 levels
        if (level % 10 === 0) {
            const critKey = `${towerType}_crit`;
            const currentCritBonus = this.prestigeBonuses.get(critKey) || 0;
            this.prestigeBonuses.set(critKey, currentCritBonus + 0.05); // +5% crit chance every 10 levels
        }
    }

    getTowerPrestigeBonuses(towerType) {
        return {
            damage: this.prestigeBonuses.get(`${towerType}_damage`) || 0,
            range: this.prestigeBonuses.get(`${towerType}_range`) || 0,
            speed: this.prestigeBonuses.get(`${towerType}_speed`) || 0,
            crit: this.prestigeBonuses.get(`${towerType}_crit`) || 0
        };
    }

    updatePrestigeDisplay() {
        const prestigePointsDisplay = document.getElementById('prestigePointsDisplay');
        if (prestigePointsDisplay) {
            prestigePointsDisplay.textContent = this.prestigePoints;
        }

        this.updateTowersList();
        this.updateBonusesList();
    }

    updateTowersList() {
        const towersList = document.getElementById('prestigeTowersList');
        if (!towersList) return;

        const towerTypes = ['basic', 'ice', 'fire', 'lightning', 'poison', 'sniper', 'tesla'];
        
        towersList.innerHTML = towerTypes.map(towerType => {
            const requirements = this.getTowerRequirements(towerType);
            const stats = {
                upgrades: this.towerStats.get(`${towerType}_upgrade`) || 0,
                kills: this.towerStats.get(`${towerType}_kill`) || 0,
                games: this.towerStats.get(`${towerType}_used`) || 0
            };
            const currentLevel = this.prestigedTowers.get(towerType) || 0;
            const nextLevel = currentLevel + 1;
            const cost = this.getPrestigeCost(towerType, nextLevel);
            const canPrestige = this.canPrestigeTower(towerType);
            const hasEnoughPoints = this.prestigePoints >= cost;

            const towerNames = {
                basic: 'Basic Tower',
                ice: 'Ice Tower',
                fire: 'Fire Tower',
                lightning: 'Lightning Tower',
                poison: 'Poison Tower',
                sniper: 'Sniper Tower',
                tesla: 'Tesla Tower'
            };

            const towerIcons = {
                basic: 'fas fa-chess-rook',
                ice: 'fas fa-snowflake',
                fire: 'fas fa-fire',
                lightning: 'fas fa-bolt',
                poison: 'fas fa-skull',
                sniper: 'fas fa-crosshairs',
                tesla: 'fas fa-zap'
            };

            return `
                <div class="prestige-tower-card">
                    <div class="prestige-tower-header">
                        <div class="prestige-tower-name">
                            <i class="${towerIcons[towerType]}"></i>
                            ${towerNames[towerType]}
                        </div>
                        <div class="prestige-level">Level ${currentLevel}</div>
                    </div>
                    
                    <div class="prestige-requirements">
                        <div>Fortschritt zum nächsten Prestige:</div>
                        <div class="req-item ${stats.upgrades >= requirements.upgrades ? 'completed' : ''}">
                            <i class="fas fa-arrow-up"></i> Upgrades: ${stats.upgrades}/${requirements.upgrades}
                        </div>
                        <div class="req-item ${stats.kills >= requirements.kills ? 'completed' : ''}">
                            <i class="fas fa-skull"></i> Kills: ${stats.kills}/${requirements.kills}
                        </div>
                        <div class="req-item ${stats.games >= requirements.games ? 'completed' : ''}">
                            <i class="fas fa-gamepad"></i> Spiele: ${stats.games}/${requirements.games}
                        </div>
                    </div>
                    
                    <div class="prestige-benefits">
                        <strong>Nächste Boni:</strong>
                        <div class="prestige-benefit">
                            <i class="fas fa-sword"></i> +10% Schaden
                        </div>
                        <div class="prestige-benefit">
                            <i class="fas fa-expand"></i> +5% Reichweite
                        </div>
                        ${nextLevel % 5 === 0 ? '<div class="prestige-benefit"><i class="fas fa-tachometer-alt"></i> +10% Feuerrate</div>' : ''}
                        ${nextLevel % 10 === 0 ? '<div class="prestige-benefit"><i class="fas fa-star"></i> +5% Krit. Chance</div>' : ''}
                    </div>
                    
                    <button 
                        onclick="prestigeSystem.prestigeTower('${towerType}')" 
                        class="prestige-action-btn"
                        ${!canPrestige || !hasEnoughPoints ? 'disabled' : ''}
                    >
                        ${!canPrestige ? 'Anforderungen nicht erfüllt' : 
                          !hasEnoughPoints ? `Benötigt ${cost} Punkte` : 
                          `Prestige für ${cost} Punkte`}
                    </button>
                </div>
            `;
        }).join('');
    }

    updateBonusesList() {
        const bonusesList = document.getElementById('prestigeBonusesList');
        if (!bonusesList) return;

        if (this.prestigeBonuses.size === 0) {
            bonusesList.innerHTML = `
                <div class="no-bonuses">
                    <i class="fas fa-star" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                    <p>Noch keine Prestige-Boni aktiv</p>
                    <p>Prestigiere deine ersten Tower um Boni freizuschalten!</p>
                </div>
            `;
            return;
        }

        const bonusesHtml = [];
        const towerTypes = ['basic', 'ice', 'fire', 'lightning', 'poison', 'sniper', 'tesla'];
        
        towerTypes.forEach(towerType => {
            const bonuses = this.getTowerPrestigeBonuses(towerType);
            if (bonuses.damage > 0 || bonuses.range > 0 || bonuses.speed > 0 || bonuses.crit > 0) {
                const towerName = towerType.charAt(0).toUpperCase() + towerType.slice(1);
                
                if (bonuses.damage > 0) {
                    bonusesHtml.push(`
                        <div class="prestige-bonus">
                            <div class="prestige-bonus-info">
                                <i class="fas fa-sword"></i>
                                <span>${towerName} Schaden</span>
                            </div>
                            <div class="prestige-bonus-value">+${Math.round(bonuses.damage * 100)}%</div>
                        </div>
                    `);
                }
                
                if (bonuses.range > 0) {
                    bonusesHtml.push(`
                        <div class="prestige-bonus">
                            <div class="prestige-bonus-info">
                                <i class="fas fa-expand"></i>
                                <span>${towerName} Reichweite</span>
                            </div>
                            <div class="prestige-bonus-value">+${Math.round(bonuses.range * 100)}%</div>
                        </div>
                    `);
                }
                
                if (bonuses.speed > 0) {
                    bonusesHtml.push(`
                        <div class="prestige-bonus">
                            <div class="prestige-bonus-info">
                                <i class="fas fa-tachometer-alt"></i>
                                <span>${towerName} Feuerrate</span>
                            </div>
                            <div class="prestige-bonus-value">+${Math.round(bonuses.speed * 100)}%</div>
                        </div>
                    `);
                }
                
                if (bonuses.crit > 0) {
                    bonusesHtml.push(`
                        <div class="prestige-bonus">
                            <div class="prestige-bonus-info">
                                <i class="fas fa-star"></i>
                                <span>${towerName} Krit. Chance</span>
                            </div>
                            <div class="prestige-bonus-value">+${Math.round(bonuses.crit * 100)}%</div>
                        </div>
                    `);
                }
            }
        });

        bonusesList.innerHTML = bonusesHtml.join('');
    }

    awardPrestigePoints(amount) {
        this.prestigePoints += amount;
        this.savePrestigeData();
        
        // Show notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-gold);
            color: black;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: var(--shadow-lg);
        `;
        notification.innerHTML = `
            <i class="fas fa-gem"></i> 
            +${amount} Prestige-Punkte erhalten!
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Global instances
let guildSystem;
let prestigeSystem;

// Global functions for GUI
function showGuildSystem() {
    if (!guildSystem) {
        guildSystem = new GuildSystem();
        guildSystem.initialize();
    }
    
    const modal = document.getElementById('guildModal');
    if (modal) {
        modal.style.display = 'flex';
        guildSystem.updateGuildDisplay();
    }
}

function showPrestigeSystem() {
    if (!prestigeSystem) {
        prestigeSystem = new PrestigeSystem();
        prestigeSystem.initialize();
    }
    
    const modal = document.getElementById('prestigeModal');
    if (modal) {
        modal.style.display = 'flex';
        prestigeSystem.updatePrestigeDisplay();
    }
}

function showGuildTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.guild-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hide all tab buttons
    document.querySelectorAll('.guild-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById('guild' + tabName.charAt(0).toUpperCase() + tabName.slice(1) + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

function createGuild() {
    const name = document.getElementById('guildNameInput').value;
    const description = document.getElementById('guildDescInput').value;
    const type = document.getElementById('guildTypeSelect').value;
    
    if (guildSystem && guildSystem.createGuild(name, description, type)) {
        // Clear form
        document.getElementById('guildNameInput').value = '';
        document.getElementById('guildDescInput').value = '';
        document.getElementById('guildTypeSelect').value = 'casual';
        
        // Switch to overview tab
        showGuildTab('overview');
    }
}

function joinGuild() {
    const guildCode = document.getElementById('guildCodeInput').value;
    
    if (guildSystem && guildSystem.joinGuild(guildCode)) {
        // Clear form
        document.getElementById('guildCodeInput').value = '';
        
        // Switch to overview tab
        showGuildTab('overview');
    }
}

// ==========================================================================
// UI ENHANCEMENT SYSTEM
// ==========================================================================

// Enhanced notification system
function showGameNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('gameNotifications');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${iconMap[type] || iconMap.info}"></i>
        </div>
        <div class="notification-text">${message}</div>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Enhanced stat update with animations
function updateStatWithAnimation(elementId, newValue, oldValue = null) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = element.textContent;
    element.textContent = newValue;
    
    // Animate value changes
    if (oldValue !== null && currentValue !== newValue.toString()) {
        if (elementId === 'money' || elementId === 'score') {
            if (parseInt(newValue) > parseInt(currentValue)) {
                element.classList.add('increasing');
                setTimeout(() => element.classList.remove('increasing'), 300);
            } else if (parseInt(newValue) < parseInt(currentValue)) {
                element.classList.add('decreasing');
                setTimeout(() => element.classList.remove('decreasing'), 300);
            }
        }
        
        // Add pulse animation to stat card
        const statCard = element.closest('.stat-card');
        if (statCard) {
            statCard.classList.add('updating');
            setTimeout(() => statCard.classList.remove('updating'), 400);
        }
    }
}

// Tower card visual feedback
function updateTowerCardVisuals() {
    document.querySelectorAll('.tower-card').forEach(card => {
        const cost = parseInt(card.dataset.cost);
        const currentMoney = game ? game.money : 0;
        
        // Visual feedback for affordability
        if (currentMoney >= cost) {
            card.classList.add('affordable');
            card.classList.remove('expensive');
        } else {
            card.classList.add('expensive');
            card.classList.remove('affordable');
        }
    });
}

// Wave progress animation
function updateWaveProgressBar(progress) {
    const progressBar = document.getElementById('waveProgress');
    if (!progressBar) return;
    
    progressBar.style.width = `${Math.min(progress, 100)}%`;
}

// Critical status animations
function updateCriticalStatus(lives) {
    const livesCard = document.querySelector('.stat-card.lives');
    if (livesCard) {
        if (lives <= 5) {
            livesCard.classList.add('critical');
        } else {
            livesCard.classList.remove('critical');
        }
    }
}

// Enhanced money management with notifications
function addMoneyWithNotification(amount, source = '') {
    if (window.game) {
        const oldMoney = window.game.money;
        window.game.money += amount;
        window.game.goldEarned += amount;
        
        if (amount > 0 && source) {
            showGameNotification(`+${amount} Gold ${source}`, 'success', 2000);
        }
        
        updateStatWithAnimation('money', window.game.money, oldMoney);
        updateTowerCardVisuals();
    }
}

function removeMoneyWithNotification(amount, source = '') {
    if (window.game) {
        const oldMoney = window.game.money;
        window.game.money = Math.max(0, window.game.money - amount);
        
        if (amount > 0 && source) {
            showGameNotification(`-${amount} Gold ${source}`, 'warning', 2000);
        }
        
        updateStatWithAnimation('money', window.game.money, oldMoney);
        updateTowerCardVisuals();
    }
}

// Enhanced score management
function addScoreWithNotification(amount, source = '') {
    if (window.game) {
        const oldScore = window.game.score;
        window.game.score += amount;
        
        if (amount > 0 && source) {
            showGameNotification(`+${amount} Punkte ${source}`, 'success', 1500);
        }
        
        updateStatWithAnimation('score', window.game.score, oldScore);
    }
}

// Lives management with enhanced feedback
function loseLivesWithNotification(amount = 1) {
    if (window.game) {
        const oldLives = window.game.lives;
        window.game.lives = Math.max(0, window.game.lives - amount);
        
        if (window.game.lives > 0) {
            showGameNotification(`${amount} Leben verloren! ${window.game.lives} verbleibend`, 'error', 2500);
        }
        
        updateStatWithAnimation('lives', window.game.lives, oldLives);
        updateCriticalStatus(window.game.lives);
        
        if (window.game.lives <= 0) {
            window.game.gameOver();
        }
    }
}

// Guild and Prestige notifications
function showGuildNotification(message, type = 'info') {
    showGameNotification(`🏰 ${message}`, type, 4000);
}

function showPrestigeNotification(message, type = 'success') {
    showGameNotification(`⭐ ${message}`, type, 4000);
}

// Achievement notifications with special styling
function showAchievementNotification(title, description) {
    const container = document.getElementById('gameNotifications');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = 'notification achievement';
    notification.style.borderLeft = '4px solid #ffd700';
    notification.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 255, 255, 0.95))';
    
    notification.innerHTML = `
        <div class="notification-icon" style="color: #ffd700;">
            <i class="fas fa-trophy"></i>
        </div>
        <div class="notification-text">
            <strong>${title}</strong><br>
            <small>${description}</small>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Special achievement sound effect would go here
    
    // Longer duration for achievements
    setTimeout(() => {
        notification.classList.add('removing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 6000);
}

// Initialize enhanced UI when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up tower card hover effects
    document.querySelectorAll('.tower-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = '';
            }
        });
    });
    
    // Enhanced stat card interactions
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});

// Export enhanced functions to global scope for game integration
window.gameUI = {
    showNotification: showGameNotification,
    updateStatWithAnimation: updateStatWithAnimation,
    updateTowerCardVisuals: updateTowerCardVisuals,
    updateWaveProgressBar: updateWaveProgressBar,
    updateCriticalStatus: updateCriticalStatus,
    addMoneyWithNotification: addMoneyWithNotification,
    removeMoneyWithNotification: removeMoneyWithNotification,
    addScoreWithNotification: addScoreWithNotification,
    loseLivesWithNotification: loseLivesWithNotification,
    showGuildNotification: showGuildNotification,
    showPrestigeNotification: showPrestigeNotification,
    showAchievementNotification: showAchievementNotification
};