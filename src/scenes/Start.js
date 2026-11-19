import { sfx } from '../sfx.js';

const GROUND_Y = 620;           // top of the ground
const SPEED = 290;
const JUMP_V = -620;
const MAX_LIVES = 3;

// stats taken from characters.js
const SANTA_STATS = { hp: 100, damage: 15 };
const ENEMY_TYPES = {
    agent:     { name: 'IRS Agent',     hp: 40,  damage: 10, speed: 120, jump: 560, scale: 0.2,  tint: 0xffffff },
    auditor:   { name: 'Auditor',       hp: 35,  damage: 8,  speed: 150, jump: 600, scale: 0.18, tint: 0x9fb2ff },
    collector: { name: 'Tax Collector', hp: 140, damage: 22, speed: 80,  jump: 500, scale: 0.3,  tint: 0xff8a8a },
};
const GOTH = "Georgia, 'Times New Roman', serif";
const SHOOT_COOLDOWN = 220;
const UNLOCKED_SHOOT_COOLDOWN = 90;
const BULLET_SPEED = 720;

// [startX, endX] gaps between ground segments are pits. [centerX, topY, width] platforms.
const LEVELS = {
    1: {
        title: 'Stage 1: The Frozen Trail',
        worldW: 4800,
        speed: SPEED,
        jumpV: JUMP_V,
        maxEnemies: 16,
        spawnDelay: 1400,
        enemyMultiplier: 1,
        groundSegments: [[0, 1000], [1200, 2200], [2400, 3400], [3600, 4800]],
        platforms: [
            [500, 500, 192], [760, 400, 160], [1100, 480, 160],
            [1500, 500, 192], [1800, 400, 192], [2050, 500, 160], [2300, 480, 160],
            [2700, 500, 192], [3000, 400, 192], [3300, 500, 160], [3500, 470, 160],
            [3900, 500, 192], [4200, 400, 192],
        ],
        groundCoins: [300, 700, 1400, 1700, 2600, 3100, 3800, 4300],
        goalX: 4650,
        welcomeEnemies: [650, 760, 880, 1350],
    },
    2: {
        title: 'Stage 2: The Icebound Pass',
        worldW: 5400,
        speed: 305,
        jumpV: -650,
        maxEnemies: 23,
        spawnDelay: 960,
        enemyMultiplier: 1.2,
        specialGift: [150, GROUND_Y - 36],
        groundSegments: [[0, 850], [1050, 1850], [2050, 2900], [3100, 3950], [4150, 5400]],
        platforms: [
            [360, 500, 176], [610, 410, 160], [900, 490, 160],
            [1250, 500, 176], [1510, 400, 160], [1800, 480, 160],
            [2220, 500, 176], [2480, 390, 160], [2780, 480, 160],
            [3270, 500, 176], [3530, 400, 160], [3850, 480, 160],
            [4320, 500, 176], [4580, 390, 160], [4880, 480, 160], [5150, 410, 160],
        ],
        groundCoins: [220, 730, 1170, 1680, 2190, 2800, 3220, 3880, 4280, 5200],
        goalX: 5260,
        welcomeEnemies: [700, 820, 1300, 2200, 3300, 4700],
    },
};

export class Start extends Phaser.Scene {

    constructor(key = 'Start', stage = 1) {
        super(key);
        this.stage = stage;
    }

    init(data = {}) {
        this.livesOnStart = data.lives ?? MAX_LIVES;
        this.giftsOnStart = data.gifts ?? 0;
        this.weaponUnlockedOnStart = Boolean(data.weaponUnlocked);
    }

    preload() {
        this.load.image('santa', 'assets/santa.png');
        // the GIFs were converted to 4-frame spritesheets (Phaser can't play GIFs)
        this.load.spritesheet('santa_r', 'assets/santa_run_right_sheet.png', { frameWidth: 320, frameHeight: 320 });
        this.load.spritesheet('santa_l', 'assets/santa_run_left_sheet.png', { frameWidth: 320, frameHeight: 320 });
        this.load.spritesheet('ice', 'assets/ice.png', { frameWidth: 320, frameHeight: 320 });    // enemy, faces right
        this.load.spritesheet('ice2', 'assets/ice2.png', { frameWidth: 320, frameHeight: 320 });  // enemy, faces left
        this.load.audio('bgMusic', 'assets/Untitled.m4a');
    }

    // ---------- generated textures (no extra art files needed) ----------
    makeTextures() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const tex = (key, w, h, draw) => {
            if (this.textures.exists(key)) return;
            g.clear(); draw(g); g.generateTexture(key, w, h);
        };
        tex('ground', 64, 100, g => {
            g.fillStyle(0x23232f).fillRect(0, 0, 64, 100);
            g.fillStyle(0x15151d);                                   // stone brick mortar
            for (let y = 20; y < 100; y += 20) g.fillRect(0, y, 64, 2);
            g.fillRect(16, 20, 2, 20).fillRect(48, 40, 2, 20).fillRect(16, 60, 2, 20).fillRect(48, 80, 2, 20);
            g.fillStyle(0x2f3b33).fillRect(0, 0, 64, 14);            // dead moss
            g.fillStyle(0x566a5c).fillRect(0, 0, 64, 3);
            g.fillStyle(0x1c2620).fillRect(6, 8, 6, 6).fillRect(30, 9, 8, 5).fillRect(50, 7, 5, 7);
        });
        tex('platform', 64, 24, g => {
            g.fillStyle(0x1c1c28).fillRect(0, 0, 64, 24);
            g.fillStyle(0x3a3a4d).fillRect(0, 3, 64, 17);
            g.fillStyle(0x7a7a96).fillRect(0, 0, 64, 4);
            g.fillStyle(0x15151d).fillRect(0, 12, 64, 2).fillRect(30, 3, 2, 9);
            g.fillStyle(0x8b8ba6).fillRect(4, 16, 3, 3).fillRect(57, 16, 3, 3);   // iron studs
        });
        tex('gift', 32, 32, g => {
            g.fillStyle(0x7b1020).fillRect(2, 8, 28, 22);
            g.fillStyle(0x4f0a15).fillRect(2, 8, 28, 5);
            g.fillStyle(0xc9a227).fillRect(14, 8, 4, 22).fillRect(2, 17, 28, 4);
            g.fillStyle(0xc9a227).fillRect(8, 2, 7, 6).fillRect(17, 2, 7, 6);
            g.fillStyle(0xf3dc7a).fillRect(14, 8, 2, 8);
        });
        tex('puff', 8, 8, g => { g.fillStyle(0xffffff).fillCircle(4, 4, 4); });
        tex('bolt', 18, 18, g => {
            g.fillStyle(0x7a3cff, 0.5).fillCircle(9, 9, 9);
            g.fillStyle(0x66ddff).fillCircle(9, 9, 6);
            g.fillStyle(0xffffff).fillCircle(9, 9, 3);
        });
        tex('goal', 100, 170, g => {
            g.fillStyle(0x2b1d28).fillRect(0, 40, 100, 130);
            g.fillStyle(0x1b121a);
            for (let y = 50; y < 170; y += 20) g.fillRect(0, y, 100, 3);
            g.fillStyle(0x1f1520).fillRect(30, 0, 40, 60);                        // chimney stack
            g.fillStyle(0x000000).fillRect(36, 0, 28, 14);
            g.fillStyle(0x6a6a82).fillRect(0, 36, 100, 8);                        // stone cornice
            g.fillStyle(0xffb347);                                                // pointed lit windows
            g.fillRect(14, 96, 20, 24).fillTriangle(14, 96, 34, 96, 24, 80);
            g.fillRect(66, 96, 20, 24).fillTriangle(66, 96, 86, 96, 76, 80);
            g.fillStyle(0x120b12).fillRect(42, 126, 16, 44).fillTriangle(42, 126, 58, 126, 50, 112);  // doorway
        });
        g.destroy();
    }

    // sky, skyline, moon, fog, vignette, glow -- all painted with canvas so no art files are needed
    makeAtmosphere() {
        const mk = (key, w, h, fn) => {
            if (this.textures.exists(key)) return;
            const t = this.textures.createCanvas(key, w, h);
            fn(t.context, w, h);
            t.refresh();
        };
        mk('sky', 4, 720, (c, w, h) => {
            const gr = c.createLinearGradient(0, 0, 0, h);
            gr.addColorStop(0, '#06060e'); gr.addColorStop(0.55, '#1a1230'); gr.addColorStop(1, '#4a2536');
            c.fillStyle = gr; c.fillRect(0, 0, w, h);
        });
        mk('moon', 220, 220, c => {
            const gl = c.createRadialGradient(110, 110, 30, 110, 110, 110);
            gl.addColorStop(0, 'rgba(220,215,255,0.35)'); gl.addColorStop(1, 'rgba(220,215,255,0)');
            c.fillStyle = gl; c.fillRect(0, 0, 220, 220);
            c.fillStyle = '#d8d4e8'; c.beginPath(); c.arc(110, 110, 36, 0, 7); c.fill();
            c.fillStyle = 'rgba(140,135,165,0.55)';
            [[98, 100, 8], [122, 118, 10], [104, 126, 5], [120, 94, 5]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); });
        });
        const skyline = (key, seed, color, minH, maxH, lit) => mk(key, 1280, 400, (c, w, h) => {
            let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
            c.fillStyle = color; c.fillRect(0, h - 20, w, 20);
            let x = 10;
            while (x < w - 130) {
                const bw = 50 + rnd() * 90, bh = minH + rnd() * (maxH - minH), top = h - bh, kind = rnd();
                c.fillStyle = color; c.fillRect(x, top, bw, bh);
                if (kind < 0.5) {                                           // spire
                    c.beginPath(); c.moveTo(x + bw * 0.12, top); c.lineTo(x + bw / 2, top - 60 - rnd() * 80); c.lineTo(x + bw * 0.88, top); c.fill();
                } else if (kind < 0.8) {                                    // twin pinnacles
                    [x, x + bw - 12].forEach(px => { c.fillRect(px, top - 28, 12, 28); c.beginPath(); c.moveTo(px, top - 28); c.lineTo(px + 6, top - 56); c.lineTo(px + 12, top - 28); c.fill(); });
                } else {                                                    // battlements
                    for (let i = 0; i < bw - 8; i += 16) c.fillRect(x + i, top - 12, 9, 12);
                }
                if (lit && rnd() < 0.7) {                                   // a candle-lit pointed window
                    c.fillStyle = 'rgba(255,170,70,0.55)';
                    const wx = x + bw / 2 - 5, wy = top + 30 + rnd() * 30;
                    c.fillRect(wx, wy, 10, 20); c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + 5, wy - 9); c.lineTo(wx + 10, wy); c.fill();
                }
                x += bw + rnd() * 20;
            }
        });
        skyline('skyFar', 7, '#17142a', 110, 210, false);
        skyline('skyNear', 31, '#0b0911', 80, 170, true);
        mk('fog', 512, 256, (c, w, h) => {
            let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
            for (let i = 0; i < 14; i++) {
                const x = rnd() * w, y = 60 + rnd() * 140, r = 50 + rnd() * 70;
                [-w, 0, w].forEach(o => {                                   // wrap so it tiles
                    const gr = c.createRadialGradient(x + o, y, 0, x + o, y, r);
                    gr.addColorStop(0, 'rgba(170,160,195,0.16)'); gr.addColorStop(1, 'rgba(170,160,195,0)');
                    c.fillStyle = gr; c.fillRect(x + o - r, y - r, r * 2, r * 2);
                });
            }
        });
        mk('vignette', 1280, 720, (c, w, h) => {
            const gr = c.createRadialGradient(w / 2, h / 2, 220, w / 2, h / 2, 820);
            gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.8)');
            c.fillStyle = gr; c.fillRect(0, 0, w, h);
        });
        mk('glow', 320, 320, c => {
            const gr = c.createRadialGradient(160, 160, 0, 160, 160, 160);
            gr.addColorStop(0, 'rgba(255,205,150,0.55)'); gr.addColorStop(1, 'rgba(255,205,150,0)');
            c.fillStyle = gr; c.fillRect(0, 0, 320, 320);
        });
    }

    create() {
        this.level = LEVELS[this.stage];
        this.makeTextures();
        this.makeAtmosphere();
        this.coinsCollected = this.giftsOnStart;
        this.lives = this.livesOnStart;
        this.weaponUnlocked = this.weaponUnlockedOnStart;
        this.dying = false;
        this.finished = false;
        this.facing = 1;
        this.lastGrounded = 0;
        this.lastJumpPress = -1000;
        this.nextDust = 0;
        this.nextStep = 0;
        this.wasGrounded = false;
        this.lastVy = 0;
        this.kills = 0;
        this.lastShot = 0;
        this.hurtUntil = 0;
        this.invulnUntil = 0;
        this.safe = { x: 150, y: GROUND_Y - 100 };

        // Keep the game playable while the optional music file is missing.
        if (this.cache.audio.exists('bgMusic')) {
            this.bgMusic = this.sound.add('bgMusic', {
                loop: true,
                volume: 0.25
            });

            if (this.sound.locked) {
                this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                    if (this.sys.isActive()) this.bgMusic.play();
                });
            } else {
                this.bgMusic.play();
            }

            this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
                this.bgMusic.stop();
                this.bgMusic.destroy();
            });
        }

        // ---- world / camera ----
        this.physics.world.setBounds(0, 0, this.level.worldW, 720);
        this.physics.world.setBoundsCollision(true, true, false, false); // open bottom = pits
        this.cameras.main.setBounds(0, 0, this.level.worldW, 720);
        this.cameras.main.fadeIn(500);

        // parallax background (fixed to the camera, scrolled slower than the world)
        this.add.image(0, 0, 'sky').setOrigin(0).setDisplaySize(1280, 720).setScrollFactor(0).setDepth(-40);
        this.add.image(980, 140, 'moon').setScrollFactor(0.02).setDepth(-39);
        this.farSky = this.add.tileSprite(0, 650, 1280, 400, 'skyFar').setOrigin(0, 1).setScrollFactor(0).setDepth(-38);
        this.nearSky = this.add.tileSprite(0, 650, 1280, 400, 'skyNear').setOrigin(0, 1).setScrollFactor(0).setDepth(-37);
        this.fog = this.add.tileSprite(0, 400, 1280, 256, 'fog').setOrigin(0).setScrollFactor(0).setDepth(5);
        this.fog2 = this.add.tileSprite(0, 470, 1280, 256, 'fog').setOrigin(0).setScrollFactor(0).setDepth(6).setAlpha(0.8);
        this.add.image(0, 0, 'vignette').setOrigin(0).setScrollFactor(0).setDepth(90);
        this.glow = this.add.image(0, 0, 'glow').setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.4).setDepth(12);
        this.ash = this.add.particles(0, 0, 'puff', {
            x: { min: 0, max: 1280 }, y: -10, lifespan: 7000, frequency: 110, advance: 5000,
            speedY: { min: 30, max: 70 }, speedX: { min: -30, max: 10 },
            scale: { min: 0.25, max: 0.7 }, alpha: { start: 0.55, end: 0 }, tint: 0xb5b0c4,
        }).setScrollFactor(0).setDepth(55);

        // ---- ground & platforms ----
        this.solids = this.physics.add.staticGroup();       // ground: solid from every side
        this.oneWays = this.physics.add.staticGroup();      // ice platforms: jump up through them, land on top
        this.level.groundSegments.forEach(([a, b]) => {
            const t = this.add.tileSprite((a + b) / 2, GROUND_Y + 50, b - a, 100, 'ground');
            this.solids.add(t);
        });
        this.level.platforms.forEach(([x, y, w]) => {
            const t = this.add.tileSprite(x, y + 12, w, 24, 'platform');
            this.oneWays.add(t);
            t.body.checkCollision.down = false;
            t.body.checkCollision.left = false;
            t.body.checkCollision.right = false;
        });

        // ---- collectibles ----
        this.coins = this.physics.add.staticGroup();
        const coinSpots = [];
        this.level.platforms.forEach(([x, y]) => { coinSpots.push([x - 24, y - 34], [x + 24, y - 34]); });
        this.level.groundCoins.forEach(x => coinSpots.push([x, GROUND_Y - 36]));
        const specialGift = this.level.specialGift;
        const regularCoinSpots = coinSpots.filter(([x, y]) => !specialGift || Math.hypot(x - specialGift[0], y - specialGift[1]) > 44);
        regularCoinSpots.forEach(([x, y]) => {
            const c = this.coins.create(x, y, 'gift');
            this.tweens.add({ targets: c, scale: { from: 0.9, to: 1.1 }, duration: 500 + Math.random() * 300, yoyo: true, repeat: -1 });
        });
        this.totalCoins = regularCoinSpots.length + (specialGift && !this.weaponUnlocked ? 1 : 0) + this.giftsOnStart;

        // ---- end of level ----
        this.goal = this.physics.add.staticSprite(this.level.goalX, GROUND_Y - 85, 'goal');
        this.add.text(this.level.goalX, GROUND_Y - 200, 'Chimney! \u2193', { fontFamily: GOTH, fontSize: '28px', fill: '#e2dcf0' }).setOrigin(0.5);

        // ---- player ----
        this.player = this.physics.add.sprite(150, GROUND_Y - 100, 'santa');
        this.player.setScale(0.3);
        this.player.body.setSize(130, 290).setOffset(95, 20);   // tight hitbox inside the 320px frame
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);
        this.player.maxHp = SANTA_STATS.hp;
        this.player.hp = this.player.maxHp;
        this.player.damage = SANTA_STATS.damage;

        if (specialGift && !this.weaponUnlocked) {
            this.specialGift = this.physics.add.staticSprite(specialGift[0], specialGift[1], 'gift');
            this.tweens.add({ targets: this.specialGift, scale: { from: 0.9, to: 1.1 }, duration: 520, yoyo: true, repeat: -1 });
        }

        this.anims.create({ key: 'run_r', frames: this.anims.generateFrameNumbers('santa_r', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'e_walk_r', frames: this.anims.generateFrameNumbers('ice', { frames: [0, 1, 3, 1] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'e_walk_l', frames: this.anims.generateFrameNumbers('ice2', { frames: [0, 1, 3, 1] }), frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'run_l', frames: this.anims.generateFrameNumbers('santa_l', { start: 0, end: 3 }), frameRate: 10, repeat: -1 });

        this.physics.add.collider(this.player, this.solids);
        this.physics.add.collider(this.player, this.oneWays);
        this.physics.add.overlap(this.player, this.coins, (p, coin) => this.collect(coin));
        if (this.specialGift?.active) this.physics.add.overlap(this.player, this.specialGift, () => this.unlockWeapon());
        this.physics.add.overlap(this.player, this.goal, () => this.reachGoal());

        // ---- bullets & enemies ----
        this.bullets = this.physics.add.group({ allowGravity: false });
        this.enemies = this.physics.add.group({ collideWorldBounds: true });
        this.physics.add.collider(this.enemies, this.solids);
        this.physics.add.collider(this.enemies, this.oneWays);
        this.physics.add.collider(this.enemies, this.enemies);     // lets the hoard stack and climb on each other
        this.physics.add.overlap(this.bullets, this.solids, b => this.popBullet(b));
        this.physics.add.overlap(this.bullets, this.enemies, (b, e) => this.bulletHitsEnemy(b, e));
        this.physics.add.overlap(this.player, this.enemies, (p, e) => this.hurtSanta(e));
        this.hpBars = this.add.graphics().setDepth(50);

        this.level.welcomeEnemies.forEach(x => this.spawnEnemy(x));
        this.time.addEvent({ delay: this.level.spawnDelay, loop: true, callback: () => this.spawnEnemy() });

        // camera follows with smoothing; look-ahead offset is updated in update()
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setFollowOffset(0, 60);

        // ---- particles (emitters are driven manually with explode()) ----
        const base = { tint: 0x9a98aa, lifespan: 450, scale: { start: 1, end: 0 }, alpha: { start: 0.9, end: 0 }, emitting: false };
        this.dust = this.add.particles(0, 0, 'puff', { ...base, speed: { min: 15, max: 60 }, angle: { min: 200, max: 340 }, gravityY: -30 }).setDepth(9);
        this.jumpFx = this.add.particles(0, 0, 'puff', { ...base, speed: { min: 60, max: 160 }, angle: { min: 180, max: 360 }, scale: { start: 1.4, end: 0 } }).setDepth(9);
        this.landFx = this.add.particles(0, 0, 'puff', { ...base, speed: { min: 80, max: 200 }, angle: { min: 170, max: 370 }, gravityY: 200, lifespan: 500 }).setDepth(9);
        this.sparkle = this.add.particles(0, 0, 'puff', { ...base, speed: { min: 60, max: 200 }, angle: { min: 0, max: 360 }, tint: [0xffd700, 0xffffff, 0xff5555], lifespan: 600 }).setDepth(11);

        this.magic = this.add.particles(0, 0, 'puff', { ...base, speed: { min: 40, max: 140 }, angle: { min: 0, max: 360 }, tint: [0x7a3cff, 0x66ddff, 0xffffff], lifespan: 350 }).setDepth(11);
        this.trail = this.add.particles(0, 0, 'puff', { ...base, speed: { min: 0, max: 20 }, tint: [0x7a3cff, 0x66ddff], lifespan: 250, scale: { start: 0.9, end: 0 } }).setDepth(9);
        this.poof = this.add.particles(0, 0, 'puff', { ...base, speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 }, tint: [0x8a8a99, 0x7a1424, 0xcccccc], gravityY: 400, lifespan: 600, scale: { start: 1.3, end: 0 } }).setDepth(11);

        // ---- HUD ----
        const hud = { fontFamily: GOTH, fontSize: '30px', fill: '#e2dcf0', stroke: '#000', strokeThickness: 5 };
        this.coinText = this.add.text(20, 20, '', hud).setScrollFactor(0).setDepth(100);
        this.livesText = this.add.text(20, 60, '', hud).setScrollFactor(0).setDepth(100);
        this.hpGfx = this.add.graphics().setScrollFactor(0).setDepth(100);
        this.hpText = this.add.text(30, 104, '', { fontFamily: GOTH, fontSize: '20px', fill: '#e2dcf0', stroke: '#000', strokeThickness: 4 }).setScrollFactor(0).setDepth(101);
        this.add.text(1260, 20, 'A/D or \u2190/\u2192 move   W / \u2191 jump   Space shoot', { fontFamily: GOTH, fontSize: '22px', fill: '#e2dcf0', stroke: '#000', strokeThickness: 4 })
            .setOrigin(1, 0).setScrollFactor(0).setDepth(100);
        this.updateHud();

        this.stageTitle = this.add.text(640, 150, this.level.title, { fontFamily: GOTH, fontSize: '38px', fill: '#e2dcf0', stroke: '#000', strokeThickness: 5 })
            .setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0.95);
        this.time.delayedCall(2200, () => this.tweens.add({ targets: this.stageTitle, alpha: 0, duration: 700 }));

        // ---- input ----
        const K = Phaser.Input.Keyboard.KeyCodes;
        const kb = this.input.keyboard;
        this.leftKeys = [kb.addKey(K.A), kb.addKey(K.LEFT)];
        this.rightKeys = [kb.addKey(K.D), kb.addKey(K.RIGHT)];
        this.jumpKeys = [kb.addKey(K.W), kb.addKey(K.UP)];
        this.shootKey = kb.addKey(K.SPACE);
    }

    updateHud() {
        this.coinText.setText(`Gifts: ${this.coinsCollected} / ${this.totalCoins}   Defeated: ${this.kills}`);
        this.livesText.setText(`Lives: ${this.lives}`);
        const p = this.player;
        const frac = Phaser.Math.Clamp(p.hp / p.maxHp, 0, 1);
        this.hpGfx.clear();
        this.hpGfx.fillStyle(0x000000, 0.7).fillRect(20, 100, 244, 28);
        this.hpGfx.fillStyle(frac > 0.35 ? 0x8e1b2e : 0xd62839).fillRect(22, 102, 240 * frac, 24);
        this.hpText.setText(`HP ${Math.max(0, Math.ceil(p.hp))} / ${p.maxHp}`);
    }

    // ---------- shooting ----------
    shoot() {
        const body = this.player.body;
        const x = body.center.x + this.facing * 40;
        const y = body.center.y - 15;
        const spread = this.weaponUnlocked ? [-0.24, 0, 0.24] : [0];
        spread.forEach(angle => {
            const b = this.bullets.create(x, y, 'bolt');
            b.body.setCircle(7, 2, 2);
            b.body.setVelocity(this.facing * Math.cos(angle) * BULLET_SPEED, Math.sin(angle) * BULLET_SPEED);
            b.dir = this.facing;
            this.time.delayedCall(1000, () => { if (b.active) b.destroy(); });
        });
        this.magic.explode(this.weaponUnlocked ? 10 : 6, x, y);
        sfx.shoot(this);
    }

    popBullet(b) {
        if (!b.active) return;
        this.magic.explode(5, b.x, b.y);
        b.destroy();
    }

    bulletHitsEnemy(b, e) {
        if (!b.active || !e.active) return;
        this.magic.explode(8, b.x, b.y);
        const dir = b.dir;
        b.destroy();
        e.hp -= this.player.damage;
        sfx.hit(this);
        e.setTintFill(0xffffff);
        this.time.delayedCall(70, () => { if (e.active) e.setTint(e.baseTint); });
        e.stunUntil = this.time.now + 120;
        e.body.setVelocityX(dir * 160);
        if (e.hp <= 0) {
            this.poof.explode(18, e.x, e.y);
            sfx.kill(this);
            this.kills++;
            this.updateHud();
            e.destroy();
        }
    }

    // ---------- the hoard ----------
    spawnEnemy(forcedX) {
        if (this.finished || this.dying || this.enemies.countActive() >= this.level.maxEnemies) return;
        const cam = this.cameras.main;
        const inSegment = x => this.level.groundSegments.some(([a, b]) => x > a + 40 && x < b - 40);
        let x = forcedX;
        if (x === undefined) {
            const right = Math.random() < 0.7;
            const tries = [right, !right].map(r => Phaser.Math.Clamp(r ? cam.scrollX + 1340 : cam.scrollX - 60, 50, this.level.worldW - 150));
            x = tries.find(inSegment);
            if (x === undefined) return;
        }
        const r = Math.random();
        const type = r < 0.6 ? 'agent' : r < 0.9 ? 'auditor' : 'collector';
        const st = ENEMY_TYPES[type];
        const e = this.enemies.create(x, GROUND_Y - 100, 'ice', 0);
        e.setScale(st.scale).setDepth(8).setTint(st.tint);
        e.body.setSize(150, 280).setOffset(85, 30);   // tight hitbox inside the 320px frame
        e.baseTint = st.tint;
        e.facing = 1;
        e.type = type;
        e.hp = e.maxHp = Math.round(st.hp * this.level.enemyMultiplier);
        e.damage = Math.round(st.damage * this.level.enemyMultiplier);
        e.speed = st.speed * this.level.enemyMultiplier * Phaser.Math.FloatBetween(0.85, 1.15);
        e.jumpV = st.jump;
        e.nextJump = 0;
        e.stunUntil = 0;
        e.setCollideWorldBounds(true);
        e.body.setBounce(0);
    }

    updateEnemies(time) {
        const p = this.player;
        this.hpBars.clear();
        this.enemies.getChildren().forEach(e => {
            if (e.y > 820) { e.destroy(); return; }
            const b = e.body;
            const dx = p.x - e.x;
            let dir = Math.abs(dx) < 8 ? 0 : Math.sign(dx);
            const onSurface = b.blocked.down || b.touching.down;

            // don't stroll off a pit edge while standing on the ground
            if (onSurface && dir && Math.abs(b.bottom - GROUND_Y) < 4) {
                const px = e.x + dir * (b.halfWidth + 14);
                if (!this.level.groundSegments.some(([a, z]) => px > a && px < z)) dir = 0;
            }
            if (time > e.stunUntil) b.setVelocityX(dir * e.speed);
            if (dir) e.facing = dir;
            const sheet = e.facing > 0 ? 'ice' : 'ice2';
            if (!onSurface) { e.anims.stop(); e.setTexture(sheet, 2); }
            else if (Math.abs(b.velocity.x) > 20) e.anims.play(e.facing > 0 ? 'e_walk_r' : 'e_walk_l', true);
            else { e.anims.stop(); e.setTexture(sheet, 0); }

            // jump when something is in the way (wall / another enemy) or Santa is above
            if (onSurface && time > e.nextJump && this.player.body.enable) {
                const blocked = (dir < 0 && (b.blocked.left || b.touching.left)) || (dir > 0 && (b.blocked.right || b.touching.right));
                const playerAbove = p.body.bottom < b.top - 20 && Math.abs(dx) < 260;
                if (blocked || playerAbove) {
                    b.setVelocityY(-e.jumpV);
                    e.nextJump = time + Phaser.Math.Between(450, 900);
                }
            }

            if (e.hp < e.maxHp) {
                const w = 34 * e.scaleX, x = e.x - w / 2, y = b.top - 10;
                this.hpBars.fillStyle(0x000000, 0.7).fillRect(x - 1, y - 1, w + 2, 6);
                this.hpBars.fillStyle(0x9b1c31).fillRect(x, y, w * (e.hp / e.maxHp), 4);
            }
        });
    }

    hurtSanta(e) {
        const now = this.time.now;
        const p = this.player;
        if (this.dying || this.finished || now < this.invulnUntil) return;
        p.hp -= e.damage;
        this.invulnUntil = now + 900;
        this.hurtUntil = now + 250;
        const dir = Math.sign(p.x - e.x) || 1;
        p.body.setVelocity(dir * 380, -330);
        this.poof.explode(8, p.x, p.y);
        this.cameras.main.shake(120, 0.008);
        sfx.hurt(this);
        this.updateHud();
        if (p.hp <= 0) { p.hp = 0; this.updateHud(); this.die(); }
    }

    collect(coin) {
        this.sparkle.explode(16, coin.x, coin.y);
        sfx.collect(this);
        coin.destroy();
        this.coinsCollected++;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 5);
        this.updateHud();
    }

    unlockWeapon() {
        if (this.weaponUnlocked || !this.specialGift?.active) return;
        const x = this.specialGift.x;
        const y = this.specialGift.y;
        this.weaponUnlocked = true;
        this.specialGift.destroy();
        this.coinsCollected++;
        this.sparkle.explode(24, x, y);
        sfx.collect(this);
        this.updateHud();
        this.scene.pause();
        this.scene.launch('WeaponUnlock');
    }

    reachGoal() {
        if (this.finished) return;
        this.finished = true;
        this.player.body.setVelocity(0, 0);
        this.player.body.setAllowGravity(false);
        this.sparkle.explode(40, this.goal.x, this.goal.y - 70);
        this.cameras.main.fadeOut(700);
        this.time.delayedCall(750, () => {
            if (this.stage === 1) {
                this.scene.start('Level2', { lives: this.lives, gifts: this.coinsCollected });
            } else {
                this.scene.start('Win', { coins: this.coinsCollected, total: this.totalCoins });
            }
        });
    }

    die() {
        if (this.dying || this.finished) return;
        this.dying = true;
        this.lives--;
        this.updateHud();
        sfx.die(this);
        this.cameras.main.shake(300, 0.012);
        this.poof.explode(24, this.player.x, Math.min(this.player.y, 700));
        this.player.body.enable = false;
        this.player.setVisible(false);
        this.glow.setVisible(false);
        if (this.lives <= 0) {
            this.cameras.main.fadeOut(500);
            this.time.delayedCall(550, () => this.scene.start('GameOver'));
            return;
        }
        this.time.delayedCall(450, () => {
            this.enemies.getChildren().filter(e => Math.abs(e.x - this.safe.x) < 350).forEach(e => e.destroy());
            this.player.hp = this.player.maxHp;
            this.player.setPosition(this.safe.x, this.safe.y);
            this.player.body.enable = true;
            this.player.body.setVelocity(0, 0);
            this.player.setVisible(true);
            this.glow.setVisible(true);
            this.invulnUntil = this.time.now + 2000;
            this.dying = false;
            this.updateHud();
        });
    }

    update(time, delta) {
        if (this.finished) return;
        const p = this.player;
        const body = p.body;
        const any = keys => keys.some(k => k.isDown);

        this.updateEnemies(time);
        if (this.dying) return;
        if (p.y > 820) { this.die(); return; }

        const grounded = body.blocked.down || body.touching.down;
        const dir = (any(this.rightKeys) ? 1 : 0) - (any(this.leftKeys) ? 1 : 0);
        if (dir) this.facing = dir;

        // horizontal movement (slightly smoothed)
        if (time > this.hurtUntil) body.setVelocityX(Phaser.Math.Linear(body.velocity.x, dir * this.level.speed, grounded ? 0.35 : 0.2));

        // shooting (hold space)
        const shootCooldown = this.weaponUnlocked ? UNLOCKED_SHOOT_COOLDOWN : SHOOT_COOLDOWN;
        if (this.shootKey.isDown && time > this.lastShot + shootCooldown) {
            this.shoot();
            this.lastShot = time;
        }
        // trail on live bolts + blink while invulnerable
        this.bullets.getChildren().forEach(b => this.trail.explode(1, b.x, b.y));
        p.setAlpha(time < this.invulnUntil && Math.floor(time / 80) % 2 ? 0.35 : 1);

        // remember a safe respawn point: standing well inside a ground segment
        if (grounded) {
            this.lastGrounded = time;
            const seg = this.level.groundSegments.find(([a, b]) => p.x > a + 80 && p.x < b - 80);
            if (seg && body.bottom >= GROUND_Y - 2) this.safe = { x: p.x, y: GROUND_Y - 100 };
        }

        // jump: buffer + coyote time + variable height
        if (this.jumpKeys.some(k => Phaser.Input.Keyboard.JustDown(k))) this.lastJumpPress = time;
        if (time - this.lastJumpPress < 120 && time - this.lastGrounded < 100) {
            body.setVelocityY(this.level.jumpV);
            this.lastJumpPress = -1000;
            this.lastGrounded = -1000;
            this.jumpFx.explode(10, body.center.x, body.bottom);
            sfx.jump(this);
        }
        if (this.jumpKeys.some(k => Phaser.Input.Keyboard.JustUp(k)) && body.velocity.y < -200) {
            body.setVelocityY(body.velocity.y * 0.45);
        }

        // landing juice
        if (grounded && !this.wasGrounded && this.lastVy > 250) {
            this.landFx.explode(12, body.center.x, body.bottom);
            sfx.land(this);
            this.cameras.main.shake(80, 0.003);
        }

        // running dust + footsteps
        if (grounded && Math.abs(body.velocity.x) > 60) {
            if (time > this.nextDust) {
                this.dust.explode(2, body.center.x - this.facing * 12, body.bottom);
                this.nextDust = time + 90;
            }
            if (time > this.nextStep) {
                sfx.step(this);
                this.nextStep = time + 260;
            }
        }

        // animation: run sheets when moving on ground, static Santa otherwise
        if (grounded && dir) {
            p.anims.play(dir > 0 ? 'run_r' : 'run_l', true);
        } else {
            p.anims.stop();
            if (p.texture.key !== 'santa') p.setTexture('santa');
        }

        // camera look-ahead in facing direction + parallax
        const cam = this.cameras.main;
        const targetX = -this.facing * 140;
        cam.setFollowOffset(Phaser.Math.Linear(cam.followOffset.x, targetX, 0.05), 60);
        this.farSky.tilePositionX = cam.scrollX * 0.12;
        this.nearSky.tilePositionX = cam.scrollX * 0.3;
        this.fog.tilePositionX = cam.scrollX * 0.6 + time * 0.012;
        this.fog2.tilePositionX = cam.scrollX * 0.9 - time * 0.02;
        this.glow.setPosition(body.center.x, body.center.y);

        this.wasGrounded = grounded;
        this.lastVy = body.velocity.y;
    }
}

export class Level2 extends Start {
    constructor() {
        super('Level2', 2);
    }
}
