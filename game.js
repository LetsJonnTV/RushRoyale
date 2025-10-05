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
        
        // Initialize skill tree
        this.initializeSkillTree();
        
        // Initialize fusion system
        this.initializeFusionRecipes();
        
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
    
    getEffectiveTowerDamage(tower) {
        const skillEffects = this.getSkillEffects();
        const baseDamage = tower.damage;
        const effectiveDamage = Math.floor(baseDamage * skillEffects.damageMultiplier);
        
        if (skillEffects.damageMultiplier > 1) {
            return `${baseDamage} → ${effectiveDamage} (+${Math.round((skillEffects.damageMultiplier - 1) * 100)}%)`;
        }
        return `${baseDamage}`;
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
        // Warten bis DOM vollständig geladen ist
        setTimeout(() => {
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

            const skillTreeMenuBtn = document.getElementById('skillTreeMenu');
            if (skillTreeMenuBtn) {
                skillTreeMenuBtn.addEventListener('click', () => {
                    console.log('Skill Tree button clicked!');
                    this.showSkillTreeFromMenu();
                });
            }

            const mapSelectionBtn = document.getElementById('mapSelection');
            if (mapSelectionBtn) {
                mapSelectionBtn.addEventListener('click', () => this.showMapSelection());
            }

            // Changelog Button
            const changelogBtn = document.getElementById('changelogBtn');
            if (changelogBtn) {
                changelogBtn.addEventListener('click', () => showChangelog());
            }
        }, 100);

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
        const mainMenu = document.getElementById('mainMenu');
        const gameContainer = document.getElementById('gameContainer');
        const changelogBtn = document.getElementById('changelogBtn');
        
        if (mainMenu) mainMenu.style.display = 'none';
        if (gameContainer) gameContainer.style.display = 'block';
        if (changelogBtn) changelogBtn.style.display = 'none'; // Button verstecken im Spiel
        
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
    }
    
    upgrade() {
        this.level++;
        this.setStats();
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
        this.target.takeDamage(finalDamage, effects);
        
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

// Spiel starten
let game;
window.addEventListener('load', () => {
    game = new Game();
    
    // Skill Points Badge initial aktualisieren
    game.updateSkillPointsBadge();
    
    // Hauptmenü initial anzeigen
    const mainMenu = document.getElementById('mainMenu');
    const gameContainer = document.getElementById('gameContainer');
    const changelogBtn = document.getElementById('changelogBtn');
    
    if (mainMenu) mainMenu.style.display = 'flex';
    if (gameContainer) gameContainer.style.display = 'none';
    if (changelogBtn) changelogBtn.style.display = 'flex'; // Button initial anzeigen
});