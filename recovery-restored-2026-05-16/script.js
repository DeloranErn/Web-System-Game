const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const levelText = document.getElementById("levelText");
const livesText = document.getElementById("livesText");
const cooldownText = document.getElementById("cooldownText");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const powerList = document.getElementById("powerList");
const coinText = document.getElementById("coinText");
const cardOverlay = document.getElementById("cardOverlay");
const cardChoices = document.getElementById("cardChoices");
const cardCostText = document.getElementById("cardCostText");
const skipCardBtn = document.getElementById("skipCardBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const fireBtn = document.getElementById("fireBtn");

// Add your own PNGs to these paths when you are ready.
// The *Throw images are optional one-frame throw poses.
const spriteSources = {
    player: "assets/player.png",
    playerThrow: "assets/player-throw.png",
    enemyRed: "assets/student-red.png",
    enemyRedThrow: "assets/student-red-throw.png",
    enemyBlue: "assets/student-blue.png",
    enemyBlueThrow: "assets/student-blue-throw.png",
    teacher: "assets/teacher.png",
    teacherThrow: "assets/teacher-throw.png",
    ball: "assets/dodgeball.png",
    siomaiRice: "assets/siomai-rice.png",
    icedCoffee: "assets/iced-coffee.png",
    volleyball: "assets/volleyball.png",
    soccerball: "assets/soccerball.png",
    peUniform: "assets/pe-uniform.png"
};

const BASE_STUDENT_COUNT = 3;
const LEVEL_SPEED_SCALE = 0.035;
const TEACHER_HP_BY_APPEARANCE = [3, 5, 8, 12, 15];
const POWER_UP_CHANCE = 0.15;
const ROUND_TRANSITION_MS = 1800;
const BOSS_NAME = "Ms. Placeholder";
const BOSS_IFRAME_MS = 400;
const BOSS_CHALK_ATTACK_MS = 3000;
const POWER_UP_TYPES = {
    SIOMAI: "siomaiRice",
    COFFEE: "icedCoffee",
    DODGEBALL: "dodgeball",
    VOLLEYBALL: "volleyball",
    SOCCERBALL: "soccerball",
    PE_UNIFORM: "peUniform"
};

const sprites = {};

Object.entries(spriteSources).forEach(([name, src]) => {
    const image = new Image();
    image.src = src;
    sprites[name] = image;
});

const state = {
    status: "ready",
    score: 0,
    coins: 0,
    round: 1,
    health: 3,
    lastTime: 0,
    throwCooldown: 0,
    enemyThrowTimer: 900,
    bossChalkTimer: BOSS_CHALK_ATTACK_MS,
    bossChalkShots: 0,
    bossChalkShotTimer: 0,
    transitionTimer: 0,
    transitionTitle: "",
    transitionSubtitle: "",
    transitionBoss: false,
    completedLevels: 0,
    cardSelectionsShown: 0,
    courtMarks: [],
    playerBalls: [],
    enemyBalls: [],
    coinsVisuals: [],
    powerUps: [],
    students: [],
    particles: [],
    playerUpgrades: {
        latestBallColor: "#f97316",
        dodgeballStacks: 0,
        volleyballBounce: false,
        volleyballStacks: 0,
        soccerStacks: 0,
        coffeeRounds: 0,
        peUniformStacks: 0,
        siomaiShieldRounds: 0
    }
};

const keys = {
    left: false,
    right: false,
    up: false,
    down: false
};

const player = {
    x: canvas.width / 2 - 22.5,
    y: canvas.height - 106,
    width: 45,
    height: 56,
    hitboxPad: 10,
    speed: 340,
    throwPose: 0
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function hasSprite(image) {
    return image && image.complete && image.naturalWidth > 0;
}

function hitbox(entity) {
    const pad = entity.hitboxPad || 0;
    return {
        x: entity.x - pad,
        y: entity.y - pad,
        width: entity.width + pad * 2,
        height: entity.height + pad * 2
    };
}

function rectsOverlap(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

function circleOverlapsRect(circle, rect) {
    const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
    const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function projectileOverlapsRect(projectile, rect) {
    if (projectile.type !== "chalk") {
        return circleOverlapsRect(projectile, rect);
    }

    const dx = rect.x + rect.width / 2 - projectile.x;
    const dy = rect.y + rect.height / 2 - projectile.y;
    const cos = Math.cos(-projectile.angle);
    const sin = Math.sin(-projectile.angle);
    const localX = cos * dx - sin * dy;
    const localY = sin * dx + cos * dy;
    const halfWidth = projectile.width / 2 + rect.width / 2;
    const halfHeight = projectile.height / 2 + rect.height / 2;

    return Math.abs(localX) < halfWidth && Math.abs(localY) < halfHeight;
}

function makeCourtMarks() {
    state.courtMarks = Array.from({ length: 34 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: Math.random() * 36 + 12,
        alpha: Math.random() * 0.12 + 0.05
    }));
}

function getLevelScale() {
    return 1 + (state.round - 1) * LEVEL_SPEED_SCALE;
}

function getEnemyThrowInterval() {
    const fireRateSteps = Math.floor((state.round - 1) / 4);
    const fireRateMultiplier = Math.pow(0.92, fireRateSteps);
    return Math.max(440, (1450 - state.round * 70) * fireRateMultiplier);
}

function getCardCost() {
    return state.cardSelectionsShown <= 2 ? 3 : 5;
}

function getCoinDropChance(enemy) {
    if (enemy.type === "teacher") return 1;
    return state.round <= 5 ? 0.10 : 0.08;
}

function getStudentDodgeChance() {
    return state.round <= 10 ? 0.10 : 0.12;
}

function isBossRound() {
    return state.round % 5 === 0;
}

function getBoss() {
    return state.students.find((student) => student.active && student.type === "teacher");
}

function startRoundTransition() {
    state.status = "transition";
    state.transitionTimer = isBossRound() ? 2600 : ROUND_TRANSITION_MS;
    state.transitionBoss = isBossRound();
    state.transitionTitle = isBossRound() ? "Boss Battle" : `Level ${state.round}`;
    state.transitionSubtitle = isBossRound()
        ? `${BOSS_NAME} enters the classroom. Aim carefully.`
        : `Level ${state.round} begins. Keep moving.`;
}

function getPlayerSpeed() {
    const coffeeBonus = state.playerUpgrades.coffeeRounds > 0 ? 1.15 : 1;
    const uniformBonus = 1 + state.playerUpgrades.peUniformStacks * 0.15;
    return player.speed * coffeeBonus * uniformBonus;
}

function getThrowCooldown() {
    const baseCooldown = Math.max(900, 1600 - state.round * 90);
    const coffeeMultiplier = state.playerUpgrades.coffeeRounds > 0 ? 0.70 : 1;
    const uniformMultiplier = 1 / (1 + state.playerUpgrades.peUniformStacks * 0.15);
    return baseCooldown * coffeeMultiplier * uniformMultiplier;
}

function getTeacherHp() {
    const bossNumber = Math.floor(state.round / 5);
    const listedHp = TEACHER_HP_BY_APPEARANCE[bossNumber - 1];

    if (listedHp) return listedHp + 6;

    const lastListedHp = TEACHER_HP_BY_APPEARANCE[TEACHER_HP_BY_APPEARANCE.length - 1];
    return lastListedHp + 6 + (bossNumber - TEACHER_HP_BY_APPEARANCE.length) * 4;
}

function randomPowerUpPosition() {
    return {
        x: 70 + Math.random() * (canvas.width - 140),
        y: canvas.height * 0.56 + Math.random() * (canvas.height * 0.30)
    };
}

function makeFieldPowerUp(type) {
    const position = randomPowerUpPosition();
    state.powerUps.push({
        type,
        x: position.x,
        y: position.y,
        radius: 17,
        pulse: Math.random() * Math.PI * 2
    });
}

function assignHeldPowerUp(type) {
    const candidates = state.students.filter((student) => student.type === "student" && !student.heldPowerUp);
    if (!candidates.length) return;

    const holder = candidates[Math.floor(Math.random() * candidates.length)];
    holder.heldPowerUp = type;
}

function spawnRoundPowerUps() {
    state.powerUps = [];

    if (Math.random() < POWER_UP_CHANCE) makeFieldPowerUp(POWER_UP_TYPES.SIOMAI);
    if (Math.random() < POWER_UP_CHANCE) assignHeldPowerUp(POWER_UP_TYPES.COFFEE);
    if (Math.random() < POWER_UP_CHANCE) makeFieldPowerUp(POWER_UP_TYPES.PE_UNIFORM);
}

function applyPowerUp(type) {
    if (type === POWER_UP_TYPES.SIOMAI) {
        state.playerUpgrades.siomaiShieldRounds = 1;
        burst(player.x + player.width / 2, player.y + player.height / 2, "#22c55e");
    }

    if (type === POWER_UP_TYPES.COFFEE) {
        state.playerUpgrades.coffeeRounds = 2;
        burst(player.x + player.width / 2, player.y + player.height / 2, "#92400e");
    }

    if (type === POWER_UP_TYPES.DODGEBALL) {
        state.playerUpgrades.dodgeballStacks++;
        state.playerUpgrades.latestBallColor = "#dc2626";
    }

    if (type === POWER_UP_TYPES.VOLLEYBALL) {
        state.playerUpgrades.volleyballBounce = true;
        state.playerUpgrades.volleyballStacks++;
        state.playerUpgrades.latestBallColor = "#facc15";
    }

    if (type === POWER_UP_TYPES.SOCCERBALL) {
        state.playerUpgrades.soccerStacks++;
        state.playerUpgrades.latestBallColor = "#f8fafc";
    }

    if (type === POWER_UP_TYPES.PE_UNIFORM) {
        state.playerUpgrades.peUniformStacks++;
        state.health++;
        burst(player.x + player.width / 2, player.y + player.height / 2, "#0ea5e9");
    }

    syncHud();
    updatePowerPanel();
}

function getBallUpgradeCards() {
    return [
        {
            type: POWER_UP_TYPES.DODGEBALL,
            title: "Dodgeball",
            description: "Adds one more angled spread shot. Stacks into wider cones."
        },
        {
            type: POWER_UP_TYPES.VOLLEYBALL,
            title: "Volleyball",
            description: "Adds one bounce and increases player ball size by 7%."
        },
        {
            type: POWER_UP_TYPES.SOCCERBALL,
            title: "Soccerball",
            description: "Adds another delayed follow-up ball behind each throw."
        }
    ];
}

function showCardChoices() {
    if (!cardOverlay || !cardChoices) return;

    state.status = "card";
    state.cardSelectionsShown++;
    cardOverlay.classList.remove("hidden");
    cardOverlay.classList.add("flex");
    const cost = getCardCost();
    if (cardCostText) {
        cardCostText.textContent = `Cost: ${cost} coins each | You have ${state.coins}`;
    }

    cardChoices.innerHTML = getBallUpgradeCards().map((card) => `
        <button class="upgrade-card" data-power="${card.type}" type="button" ${state.coins < cost ? "disabled" : ""}>
            <span class="upgrade-card-icon" style="background:${getPowerUpColor(card.type)}">${getPowerUpLabel(card.type)}</span>
            <span class="upgrade-card-title">${card.title}</span>
            <span class="upgrade-card-text">${card.description}</span>
            <span class="upgrade-card-cost">${cost} coins</span>
        </button>
    `).join("");
}

function hideCardChoices() {
    if (!cardOverlay) return;
    cardOverlay.classList.add("hidden");
    cardOverlay.classList.remove("flex");
}

function createStudents() {
    state.students = [];
    const count = BASE_STUDENT_COUNT + state.round - 1;
    const columns = Math.min(9, count);
    const gapX = 76;
    const gapY = 64;
    const speedScale = getLevelScale();
    const studentHp = state.round > 5 ? 2 : 1;

    for (let i = 0; i < count; i++) {
        const row = Math.floor(i / columns);
        const col = i % columns;
        const rowCount = Math.min(columns, count - row * columns);
        const rowStartX = canvas.width / 2 - ((rowCount - 1) * gapX) / 2;

        state.students.push({
            x: rowStartX + col * gapX,
            y: 78 + row * gapY + (col % 2) * 12,
            width: 41,
            height: 52,
            hitboxPad: 10,
            direction: i % 2 === 0 ? 1 : -1,
            speed: (56 + Math.random() * 14) * speedScale * 1.07,
            wobble: Math.random() * Math.PI * 2,
            sprite: i % 2 === 0 ? "enemyRed" : "enemyBlue",
            throwPose: 0,
            hp: studentHp,
            maxHp: studentHp,
            points: studentHp > 1 ? 165 : 120,
            type: "student",
            stunned: 0,
            invulnTimer: 0,
            active: true
        });
    }

    if (isBossRound()) {
        const hp = getTeacherHp();
        state.students.push({
            x: canvas.width / 2 - 59,
            y: 38,
            width: 118,
            height: 124,
            hitboxPad: 14,
            direction: 1,
            speed: 32 * speedScale,
            wobble: 0,
            sprite: "teacher",
            throwPose: 0,
            hp,
            maxHp: hp,
            points: 550 + hp * 35,
            type: "teacher",
            stunned: 0,
            invulnTimer: 0,
            active: true
        });
    }

    spawnRoundPowerUps();
}

function syncHud() {
    scoreText.textContent = state.score;
    levelText.textContent = state.round;
    livesText.textContent = state.health;
    cooldownText.textContent = state.throwCooldown <= 0 ? "Ready" : `${Math.ceil(state.throwCooldown / 1000)}s`;
    if (coinText) coinText.textContent = `Coins: ${state.coins}`;
}

function showOverlay(title, text) {
    overlay.classList.remove("hidden");
    overlayTitle.textContent = title;
    overlayText.textContent = text;
}

function hideOverlay() {
    overlay.classList.add("hidden");
}

function resetGame() {
    state.status = "ready";
    state.score = 0;
    state.coins = 0;
    state.round = 1;
    state.health = 3;
    state.throwCooldown = 0;
    state.enemyThrowTimer = 900;
    state.bossChalkTimer = BOSS_CHALK_ATTACK_MS;
    state.bossChalkShots = 0;
    state.bossChalkShotTimer = 0;
    state.transitionTimer = 0;
    state.transitionBoss = false;
    state.completedLevels = 0;
    state.cardSelectionsShown = 0;
    state.playerBalls = [];
    state.enemyBalls = [];
    state.coinsVisuals = [];
    state.powerUps = [];
    state.particles = [];
    state.playerUpgrades = {
        latestBallColor: "#f97316",
        dodgeballStacks: 0,
        volleyballBounce: false,
        volleyballStacks: 0,
        soccerStacks: 0,
        coffeeRounds: 0,
        peUniformStacks: 0,
        siomaiShieldRounds: 0
    };
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 106;
    createStudents();
    state.enemyThrowTimer = getEnemyThrowInterval();
    syncHud();
    showOverlay("Ready?", "Move with WASD or arrows. Throw dodgeballs with Space when the cooldown is ready.");
    hideCardChoices();
    updatePowerPanel();
}

function startGame() {
    if (state.status === "gameover" || state.status === "ready") {
        resetGame();
    }

    startRoundTransition();
    state.lastTime = performance.now();
    hideOverlay();
}

function togglePause() {
    if (state.status === "playing") {
        state.status = "paused";
        showOverlay("Paused", "Press P or Pause to continue the match.");
    } else if (state.status === "paused") {
        state.status = "playing";
        state.lastTime = performance.now();
        hideOverlay();
    }
}

function throwPlayerBall() {
    if (state.status !== "playing" || state.throwCooldown > 0) return;

    const spreadCount = Math.max(1, state.playerUpgrades.dodgeballStacks + 1);
    const middle = (spreadCount - 1) / 2;
    const spreadStep = 0.18;
    const trailCount = state.playerUpgrades.soccerStacks;
    const ballRadius = 13 * (1 + state.playerUpgrades.volleyballStacks * 0.07);

    for (let spreadIndex = 0; spreadIndex < spreadCount; spreadIndex++) {
        const angle = (spreadIndex - middle) * spreadStep;
        const speed = 520;
        const vx = Math.sin(angle) * speed;
        const vy = -Math.cos(angle) * speed;
        const laneOffset = (spreadIndex - middle) * 8;

        for (let trail = 0; trail <= trailCount; trail++) {
            state.playerBalls.push({
                x: player.x + player.width / 2 + laneOffset,
                y: player.y + 10,
                radius: ballRadius,
                vx,
                vy,
                spin: 0,
                owner: "player",
                bouncesLeft: state.playerUpgrades.volleyballBounce ? 1 : 0,
                color: state.playerUpgrades.latestBallColor,
                spawnDelay: trail * 200
            });
        }
    }

    state.throwCooldown = getThrowCooldown();
    player.throwPose = 230;
}

function throwEnemyBall() {
    const active = state.students.filter((student) => student.active && student.stunned <= 0);
    if (!active.length) return;

    const teacher = active.find((student) => student.type === "teacher");
    const student = teacher && Math.random() < 0.55 ? teacher : active[Math.floor(Math.random() * active.length)];
    student.throwPose = 260;

    const originX = student.x + student.width / 2;
    const originY = student.y + student.height - 8;
    const targetX = player.x + player.width / 2;
    const targetY = player.y + player.height / 2;
    const angle = Math.atan2(targetY - originY, targetX - originX);
    const speed = (student.type === "teacher" ? 285 : 245) * getLevelScale();

    state.enemyBalls.push({
        x: originX,
        y: originY,
        radius: student.type === "teacher" ? 18 * 1.035 : 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spin: 0,
        owner: "enemy",
        color: "#f97316",
        bouncesLeft: 0
    });
}

function fireBossChalk() {
    const boss = getBoss();
    if (!boss) return;

    boss.throwPose = 260;

    const originX = boss.x + boss.width / 2;
    const originY = boss.y + boss.height - 10;
    const targetX = player.x + player.width / 2;
    const targetY = player.y + player.height / 2;
    const angle = Math.atan2(targetY - originY, targetX - originX);
    const speed = 520 * getLevelScale();

    state.enemyBalls.push({
        x: originX,
        y: originY,
        radius: 7,
        width: 9,
        height: 48,
        angle,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spin: 0,
        owner: "enemy",
        color: "#f8fafc",
        bouncesLeft: 0,
        type: "chalk"
    });
}

function burst(x, y, color) {
    for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10;
        const speed = Math.random() * 95 + 45;
        state.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 360,
            color
        });
    }
}

function spawnCoins(x, y, amount) {
    state.coins += amount;
    syncHud();
    updatePowerPanel();

    for (let i = 0; i < amount; i++) {
        state.coinsVisuals.push({
            x: x + (Math.random() - 0.5) * 36,
            y: y + (Math.random() - 0.5) * 24,
            life: 3000,
            delay: i * 80,
            width: 18,
            height: 10
        });
    }
}

function maybeDropCoins(enemy) {
    if (enemy.type === "teacher") {
        spawnCoins(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 5);
        return;
    }

    if (Math.random() < getCoinDropChance(enemy)) {
        spawnCoins(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 1);
    }
}

function loseHealth() {
    if (state.playerUpgrades.siomaiShieldRounds > 0) {
        state.playerUpgrades.siomaiShieldRounds = 0;
        burst(player.x + player.width / 2, player.y + player.height / 2, "#22c55e");
        syncHud();
        updatePowerPanel();
        return;
    }

    if (state.playerUpgrades.peUniformStacks > 0) {
        state.playerUpgrades.peUniformStacks--;
        burst(player.x + player.width / 2, player.y + player.height / 2, "#0ea5e9");
        syncHud();
        updatePowerPanel();
        return;
    }

    state.health--;
    burst(player.x + player.width / 2, player.y + player.height / 2, "#ef4444");
    syncHud();

    if (state.health <= 0) {
        state.status = "gameover";
        showOverlay("Knocked Out", `Final score: ${state.score}. Press Start for a rematch.`);
        return;
    }

    state.enemyBalls = [];
    player.x = canvas.width / 2 - player.width / 2;
}

function nextRound() {
    state.completedLevels++;
    state.round++;
    state.score += 250 * state.round;
    state.playerBalls = [];
    state.enemyBalls = [];
    state.powerUps = [];
    state.playerUpgrades.coffeeRounds = Math.max(0, state.playerUpgrades.coffeeRounds - 1);
    state.playerUpgrades.siomaiShieldRounds = Math.max(0, state.playerUpgrades.siomaiShieldRounds - 1);
    state.enemyThrowTimer = getEnemyThrowInterval();
    state.bossChalkTimer = BOSS_CHALK_ATTACK_MS;
    state.bossChalkShots = 0;
    state.bossChalkShotTimer = 0;
    createStudents();
    syncHud();
    updatePowerPanel();

    if (state.completedLevels % 2 === 0) {
        showCardChoices();
    } else {
        startRoundTransition();
    }
}

function updateGame(deltaMs) {
    const deltaSeconds = deltaMs / 1000;

    state.coinsVisuals.forEach((coin) => {
        if (coin.delay > 0) {
            coin.delay -= deltaMs;
            return;
        }

        const targetX = player.x + player.width / 2;
        const targetY = player.y + player.height / 2;
        coin.x += (targetX - coin.x) * Math.min(1, deltaSeconds * 3.8);
        coin.y += (targetY - coin.y) * Math.min(1, deltaSeconds * 3.8);
        coin.life -= deltaMs;
    });
    state.coinsVisuals = state.coinsVisuals.filter((coin) => coin.life > 0);

    if (state.status === "transition") {
        state.transitionTimer -= deltaMs;
        if (state.transitionTimer <= 0) {
            state.status = "playing";
            state.transitionTimer = 0;
        }
        return;
    }

    if (state.status !== "playing") return;

    const playerSpeed = getPlayerSpeed();
    if (keys.left) player.x -= playerSpeed * deltaSeconds;
    if (keys.right) player.x += playerSpeed * deltaSeconds;
    if (keys.up) player.y -= playerSpeed * deltaSeconds;
    if (keys.down) player.y += playerSpeed * deltaSeconds;
    player.x = clamp(player.x, 28, canvas.width - player.width - 28);
    player.y = clamp(player.y, canvas.height * 0.52, canvas.height - player.height - 32);
    player.throwPose = Math.max(0, player.throwPose - deltaMs);

    state.throwCooldown = Math.max(0, state.throwCooldown - deltaMs);

    state.students.forEach((student) => {
        if (!student.active) return;
        student.wobble += deltaSeconds * 5;
        student.x += student.direction * student.speed * deltaSeconds;
        student.y += Math.sin(student.wobble) * 0.28;
        student.stunned = Math.max(0, student.stunned - deltaMs);
        student.throwPose = Math.max(0, student.throwPose - deltaMs);
        student.invulnTimer = Math.max(0, student.invulnTimer - deltaMs);

        if (student.x <= 34 || student.x + student.width >= canvas.width - 34) {
            student.direction *= -1;
            student.y += 14;
        }
    });

    state.enemyThrowTimer -= deltaMs;
    if (state.enemyThrowTimer <= 0) {
        throwEnemyBall();
        state.enemyThrowTimer = getEnemyThrowInterval();
    }

    const boss = getBoss();
    if (boss) {
        state.bossChalkTimer -= deltaMs;
        if (state.bossChalkTimer <= 0 && state.bossChalkShots <= 0) {
            state.bossChalkShots = 3;
            state.bossChalkShotTimer = 0;
            state.bossChalkTimer = BOSS_CHALK_ATTACK_MS;
        }
    } else {
        state.bossChalkShots = 0;
        state.bossChalkShotTimer = 0;
    }

    if (state.bossChalkShots > 0) {
        state.bossChalkShotTimer -= deltaMs;
        if (state.bossChalkShotTimer <= 0) {
            fireBossChalk();
            state.bossChalkShots--;
            state.bossChalkShotTimer = 170;
        }
    }

    [...state.playerBalls, ...state.enemyBalls].forEach((ball) => {
        if (ball.spawnDelay > 0) {
            ball.spawnDelay -= deltaMs;
            return;
        }

        ball.x += ball.vx * deltaSeconds;
        ball.y += ball.vy * deltaSeconds;
        ball.spin += deltaSeconds * 12;

        if (ball.owner === "player" && ball.bouncesLeft > 0) {
            const hitSide = ball.x - ball.radius <= 28 || ball.x + ball.radius >= canvas.width - 28;
            const hitTop = ball.y - ball.radius <= 28;

            if (hitSide) {
                ball.vx *= -1;
                ball.x = clamp(ball.x, 28 + ball.radius, canvas.width - 28 - ball.radius);
                ball.bouncesLeft--;
            } else if (hitTop) {
                ball.vy *= -1;
                ball.y = 28 + ball.radius;
                ball.bouncesLeft--;
            }
        }
    });

    state.playerBalls = state.playerBalls.filter((ball) => (
        ball.y + ball.radius > -30 &&
        ball.y - ball.radius < canvas.height + 30 &&
        ball.x + ball.radius > -30 &&
        ball.x - ball.radius < canvas.width + 30
    ));
    state.enemyBalls = state.enemyBalls.filter((ball) => (
        ball.y - ball.radius < canvas.height + 30 &&
        ball.x + ball.radius > -30 &&
        ball.x - ball.radius < canvas.width + 30
    ));

    for (let b = state.playerBalls.length - 1; b >= 0; b--) {
        const ball = state.playerBalls[b];
        if (ball.spawnDelay > 0) continue;

        const hit = state.students.find((student) => (
            student.active &&
            student.invulnTimer <= 0 &&
            circleOverlapsRect(ball, hitbox(student))
        ));
        if (!hit) continue;

        if (hit.type === "student" && Math.random() < getStudentDodgeChance()) {
            hit.invulnTimer = 220;
            hit.x = clamp(hit.x + hit.direction * 42, 34, canvas.width - hit.width - 34);
            hit.direction *= -1;
            burst(hit.x + hit.width / 2, hit.y + hit.height / 2, "#94a3b8");
            continue;
        }

        hit.hp--;
        if (hit.type === "teacher") {
            hit.invulnTimer = BOSS_IFRAME_MS;
        }
        state.playerBalls.splice(b, 1);
        burst(ball.x, ball.y, hit.type === "teacher" ? "#0ea5e9" : "#f97316");

        if (hit.hp <= 0) {
            hit.active = false;
            state.score += hit.points;
            burst(hit.x + hit.width / 2, hit.y + hit.height / 2, hit.type === "teacher" ? "#0284c7" : "#f97316");
            maybeDropCoins(hit);
            if (hit.heldPowerUp) {
                applyPowerUp(hit.heldPowerUp);
            }
        } else {
            state.score += 45;
            hit.stunned = 180;
        }

        syncHud();
    }

    for (let b = state.enemyBalls.length - 1; b >= 0; b--) {
        const ball = state.enemyBalls[b];
        if (projectileOverlapsRect(ball, hitbox(player))) {
            state.enemyBalls.splice(b, 1);
            loseHealth();
            break;
        }
    }

    for (let p = state.powerUps.length - 1; p >= 0; p--) {
        const powerUp = state.powerUps[p];
        const pickupBox = {
            x: powerUp.x - powerUp.radius,
            y: powerUp.y - powerUp.radius,
            width: powerUp.radius * 2,
            height: powerUp.radius * 2
        };

        powerUp.pulse += deltaSeconds * 5;

        if (rectsOverlap(hitbox(player), pickupBox)) {
            applyPowerUp(powerUp.type);
            state.powerUps.splice(p, 1);
        }
    }

    const defendedLine = canvas.height - 126;
    const crossedLine = state.students.some((student) => student.active && student.y + student.height > defendedLine);
    if (crossedLine) {
        state.health = 0;
        syncHud();
        state.status = "gameover";
        showOverlay("Swarmed", `The other team crossed your line. Final score: ${state.score}.`);
    }

    state.particles.forEach((particle) => {
        particle.x += particle.vx * deltaSeconds;
        particle.y += particle.vy * deltaSeconds;
        particle.life -= deltaMs;
    });
    state.particles = state.particles.filter((particle) => particle.life > 0);

    if (state.students.every((student) => !student.active)) {
        nextRound();
    }

    syncHud();
}

function drawCourt() {
    ctx.fillStyle = isBossRound() ? "#d7e3ea" : "#e8cf91";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isBossRound()) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(42, 38, 210, 92);
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 5;
        ctx.strokeRect(42, 38, 210, 92);

        ctx.fillStyle = "#1f2937";
        ctx.fillRect(canvas.width - 250, 42, 198, 78);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("QUIZ TIME", canvas.width - 151, 88);

        ctx.fillStyle = "rgba(30, 41, 59, 0.12)";
        for (let y = 190; y < canvas.height - 80; y += 92) {
            for (let x = 82; x < canvas.width - 80; x += 132) {
                ctx.fillRect(x, y, 74, 34);
                ctx.fillRect(x + 18, y + 34, 38, 20);
            }
        }
    } else {
        ctx.fillStyle = "#d9bd78";
        state.courtMarks.forEach((mark) => {
            ctx.globalAlpha = mark.alpha;
            ctx.fillRect(mark.x, mark.y, mark.width, 3);
        });
        ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
    ctx.beginPath();
    ctx.moveTo(28, canvas.height / 2);
    ctx.lineTo(canvas.width - 28, canvas.height / 2);
    ctx.stroke();

    ctx.setLineDash([12, 10]);
    ctx.strokeStyle = "rgba(31, 41, 55, 0.45)";
    ctx.beginPath();
    ctx.moveTo(28, canvas.height - 126);
    ctx.lineTo(canvas.width - 28, canvas.height - 126);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawThrowHands(entity, direction) {
    const progress = clamp(entity.throwPose / 260, 0, 1);
    const reach = 10 + progress * 14;
    const handY = entity.y + 17 - progress * 13;
    const frontX = entity.x + entity.width / 2 + direction * reach;
    const backX = entity.x + entity.width / 2 - direction * 17;

    ctx.fillStyle = "#f3c9a6";
    ctx.beginPath();
    ctx.arc(frontX, handY, 7, 0, Math.PI * 2);
    ctx.arc(backX, handY + 8, 6, 0, Math.PI * 2);
    ctx.fill();
}

function drawStudentBody(entity, shirt, shorts, facing = 1) {
    const isThrowing = entity.throwPose > 0;

    ctx.save();
    ctx.translate(entity.x, entity.y);
    ctx.scale(entity.width / 50, entity.height / 62);
    ctx.fillStyle = "#f3c9a6";
    ctx.fillRect(15, 0, 20, 18);
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(13, 0, 24, 6);
    ctx.fillStyle = shirt;
    ctx.fillRect(8, 18, 34, 27);
    ctx.fillStyle = shorts;
    ctx.fillRect(10, 45, 12, 15);
    ctx.fillRect(28, 45, 12, 15);
    ctx.fillStyle = "#f3c9a6";
    if (isThrowing) {
        ctx.fillRect(facing > 0 ? 0 : 42, 18, 8, 12);
        ctx.fillRect(facing > 0 ? 38 : 2, 26, 8, 14);
    } else {
        ctx.fillRect(2, 22, 8, 19);
        ctx.fillRect(40, 22, 8, 19);
    }
    ctx.fillStyle = "#111827";
    ctx.fillRect(11, 58, 13, 4);
    ctx.fillRect(27, 58, 13, 4);
    ctx.restore();

    if (isThrowing) {
        drawThrowHands(entity, facing);
    }
}

function drawPlayer() {
    const sprite = player.throwPose > 0 && hasSprite(sprites.playerThrow) ? sprites.playerThrow : sprites.player;
    if (hasSprite(sprite)) {
        ctx.drawImage(sprite, player.x, player.y, player.width, player.height);
        if (player.throwPose > 0 && !hasSprite(sprites.playerThrow)) {
            drawThrowHands(player, 1);
        }
        return;
    }

    drawStudentBody(player, "#2563eb", "#111827", 1);
}

function drawEnemy(student) {
    if (!student.active) return;
    if (student.invulnTimer > 0 && Math.floor(student.invulnTimer / 80) % 2 === 0) return;

    const throwSpriteName = `${student.sprite}Throw`;
    const sprite = student.throwPose > 0 && hasSprite(sprites[throwSpriteName])
        ? sprites[throwSpriteName]
        : sprites[student.sprite];

    if (hasSprite(sprite)) {
        ctx.drawImage(sprite, student.x, student.y, student.width, student.height);
        if (student.throwPose > 0 && !hasSprite(sprites[throwSpriteName])) {
            drawThrowHands(student, student.direction);
        }
        return;
    }

    if (student.type === "teacher") {
        drawStudentBody(student, "#7c3aed", "#1e293b", student.direction);
    } else {
        drawStudentBody(
            student,
            student.sprite === "enemyRed" ? "#ef4444" : "#16a34a",
            "#334155",
            student.direction
        );
    }
}

function drawHealthBar(entity) {
    if (entity.maxHp <= 1 || !entity.active || entity.type === "teacher") return;

    const width = entity.width;
    const height = 7;
    const x = entity.x;
    const y = entity.y - 13;
    const fill = clamp(entity.hp / entity.maxHp, 0, 1);

    ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = fill > 0.45 ? "#22c55e" : "#ef4444";
    ctx.fillRect(x, y, width * fill, height);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
}

function drawBossHealthBar() {
    const boss = getBoss();
    if (!boss) return;

    const barWidth = Math.min(760, canvas.width - 140);
    const barHeight = 24;
    const x = (canvas.width - barWidth) / 2;
    const y = 26;
    const fill = clamp(boss.hp / boss.maxHp, 0, 1);

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
    ctx.fillRect(x - 16, y - 20, barWidth + 32, 66);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4;
    ctx.strokeRect(x - 16, y - 20, barWidth + 32, 66);

    ctx.fillStyle = "#fee2e2";
    ctx.font = "900 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(BOSS_NAME, canvas.width / 2, y - 7);

    ctx.fillStyle = "#450a0a";
    ctx.fillRect(x, y + 10, barWidth, barHeight);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(x, y + 10, barWidth * fill, barHeight);
    ctx.strokeStyle = "#fee2e2";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y + 10, barWidth, barHeight);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 14px sans-serif";
    ctx.fillText(`${boss.hp} / ${boss.maxHp}`, canvas.width / 2, y + 23);
    ctx.restore();
}

function drawBall(ball) {
    if (ball.spawnDelay > 0) return;

    const size = ball.radius * 2;
    if (ball.type === "chalk") {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.angle + Math.PI / 2);
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(-ball.width / 2, -ball.height / 2, ball.width, ball.height);
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(-ball.width / 2, -ball.height / 2, ball.width, 9);
        ctx.restore();
        return;
    }

    if (hasSprite(sprites.ball) && ball.owner !== "player") {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.spin);
        ctx.drawImage(sprites.ball, -ball.radius, -ball.radius, size, size);
        ctx.restore();
        return;
    }

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.spin);
    ctx.fillStyle = ball.color || "#f97316";
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ball.color === "#f8fafc" ? "#111827" : "#7c2d12";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius - 3, -0.8, 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius - 3, Math.PI - 0.8, Math.PI + 0.8);
    ctx.stroke();
    ctx.restore();
}

function getPowerUpLabel(type) {
    if (type === POWER_UP_TYPES.SIOMAI) return "SR";
    if (type === POWER_UP_TYPES.COFFEE) return "IC";
    if (type === POWER_UP_TYPES.DODGEBALL) return "DB";
    if (type === POWER_UP_TYPES.VOLLEYBALL) return "VB";
    if (type === POWER_UP_TYPES.PE_UNIFORM) return "PE";
    return "SB";
}

function getPowerUpColor(type) {
    if (type === POWER_UP_TYPES.SIOMAI) return "#22c55e";
    if (type === POWER_UP_TYPES.COFFEE) return "#92400e";
    if (type === POWER_UP_TYPES.DODGEBALL) return "#dc2626";
    if (type === POWER_UP_TYPES.VOLLEYBALL) return "#facc15";
    if (type === POWER_UP_TYPES.PE_UNIFORM) return "#0ea5e9";
    return "#f8fafc";
}

function getPowerUpName(type) {
    if (type === POWER_UP_TYPES.SIOMAI) return "Siomai Rice";
    if (type === POWER_UP_TYPES.COFFEE) return "Iced Coffee";
    if (type === POWER_UP_TYPES.DODGEBALL) return "Dodgeball";
    if (type === POWER_UP_TYPES.VOLLEYBALL) return "Volleyball";
    if (type === POWER_UP_TYPES.SOCCERBALL) return "Soccerball";
    return "PE Uniform";
}

function makePowerPanelRow(type, detail, amount = "", progress = null) {
    const progressDegrees = progress === null ? 360 : clamp(progress, 0, 1) * 360;
    const amountMarkup = progress === null
        ? `<span class="text-sm font-black text-slate-900">${amount}</span>`
        : `<span class="timer-ring" style="--progress:${progressDegrees}deg">${amount}</span>`;

    return `
        <div class="power-row">
            <span class="power-icon" style="background:${getPowerUpColor(type)}">${getPowerUpLabel(type)}</span>
            <span>
                <span class="power-name">${getPowerUpName(type)}</span>
                <span class="power-detail">${detail}</span>
            </span>
            ${amountMarkup}
        </div>
    `;
}

function updatePowerPanel() {
    if (!powerList) return;

    const upgrades = state.playerUpgrades;
    const rows = [];

    rows.push(makePowerPanelRow(POWER_UP_TYPES.DODGEBALL, "spread shots", `x${upgrades.dodgeballStacks}`));
    rows.push(makePowerPanelRow(POWER_UP_TYPES.VOLLEYBALL, "+7% ball size", `x${upgrades.volleyballStacks}`));
    rows.push(makePowerPanelRow(POWER_UP_TYPES.SOCCERBALL, "follow-up balls", `x${upgrades.soccerStacks}`));
    rows.push(makePowerPanelRow(POWER_UP_TYPES.SIOMAI, "1-level shield", `x${upgrades.siomaiShieldRounds}`));
    rows.push(makePowerPanelRow(POWER_UP_TYPES.PE_UNIFORM, "armor, speed, rate", `x${upgrades.peUniformStacks}`));

    if (upgrades.coffeeRounds > 0) {
        rows.push(makePowerPanelRow(
            POWER_UP_TYPES.COFFEE,
            "+speed and throw rate",
            `${upgrades.coffeeRounds}`,
            upgrades.coffeeRounds / 2
        ));
    }

    powerList.innerHTML = rows.join("");
}

function drawPowerUp(powerUp) {
    const bob = Math.sin(powerUp.pulse) * 3;
    const image = sprites[powerUp.type];

    if (hasSprite(image)) {
        ctx.drawImage(image, powerUp.x - 18, powerUp.y - 18 + bob, 36, 36);
        return;
    }

    ctx.save();
    ctx.translate(powerUp.x, powerUp.y + bob);
    ctx.fillStyle = getPowerUpColor(powerUp.type);
    if (powerUp.type === POWER_UP_TYPES.SIOMAI || powerUp.type === POWER_UP_TYPES.PE_UNIFORM) {
        ctx.fillRect(-powerUp.radius, -powerUp.radius, powerUp.radius * 2, powerUp.radius * 2);
    } else {
        ctx.beginPath();
        ctx.arc(0, 0, powerUp.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 3;
    if (powerUp.type === POWER_UP_TYPES.SIOMAI || powerUp.type === POWER_UP_TYPES.PE_UNIFORM) {
        ctx.strokeRect(-powerUp.radius, -powerUp.radius, powerUp.radius * 2, powerUp.radius * 2);
    } else {
        ctx.stroke();
    }
    ctx.fillStyle = powerUp.type === POWER_UP_TYPES.VOLLEYBALL || powerUp.type === POWER_UP_TYPES.SOCCERBALL ? "#111827" : "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(getPowerUpLabel(powerUp.type), 0, 1);
    ctx.restore();
}

function drawRoundTransition() {
    if (state.status !== "transition") return;

    const total = state.transitionBoss ? 2600 : ROUND_TRANSITION_MS;
    const progress = 1 - clamp(state.transitionTimer / total, 0, 1);
    const fadeIn = clamp(progress / 0.25, 0, 1);
    const fadeOut = clamp(state.transitionTimer / 360, 0, 1);
    const alpha = Math.min(fadeIn, fadeOut);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = state.transitionBoss ? "rgba(69, 10, 10, 0.82)" : "rgba(15, 23, 42, 0.62)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.transitionBoss) {
        ctx.strokeStyle = "rgba(248, 113, 113, 0.46)";
        ctx.lineWidth = 10;
        ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);
        ctx.fillStyle = "#fecaca";
        ctx.font = "900 28px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("DETENTION MODE", canvas.width / 2, canvas.height / 2 - 96);
    }

    ctx.fillStyle = state.transitionBoss ? "#ffffff" : "#f8fafc";
    ctx.font = state.transitionBoss ? "900 72px sans-serif" : "900 64px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(state.transitionTitle, canvas.width / 2, canvas.height / 2 - 18);

    ctx.fillStyle = state.transitionBoss ? "#fecaca" : "#e2e8f0";
    ctx.font = "800 23px sans-serif";
    ctx.fillText(state.transitionSubtitle, canvas.width / 2, canvas.height / 2 + 50);
    ctx.restore();
}

function drawHeldPowerUp(student) {
    if (!student.active || !student.heldPowerUp) return;

    ctx.save();
    ctx.translate(student.x + student.width - 2, student.y - 8);
    ctx.fillStyle = getPowerUpColor(student.heldPowerUp);
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawParticles() {
    state.particles.forEach((particle) => {
        ctx.globalAlpha = clamp(particle.life / 360, 0, 1);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 5, 5);
    });
    ctx.globalAlpha = 1;
}

function drawCoin(coin) {
    if (coin.delay > 0) return;

    const alpha = clamp(coin.life / 3000, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(coin.x, coin.y);
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.ellipse(0, 0, coin.width, coin.height, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#78350f";
    ctx.font = "900 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("C", 0, 1);
    ctx.restore();
}

function drawCooldownMeter() {
    const meterWidth = 150;
    const meterHeight = 12;
    const x = canvas.width - meterWidth - 34;
    const y = canvas.height - 42;
    const fill = 1 - clamp(state.throwCooldown / 1600, 0, 1);

    ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
    ctx.fillRect(x, y, meterWidth, meterHeight);
    ctx.fillStyle = fill >= 1 ? "#16a34a" : "#f59e0b";
    ctx.fillRect(x, y, meterWidth * fill, meterHeight);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, meterWidth, meterHeight);
}

function draw() {
    drawCourt();
    state.students.forEach((student) => {
        drawEnemy(student);
        drawHealthBar(student);
        drawHeldPowerUp(student);
    });
    drawBossHealthBar();
    state.powerUps.forEach(drawPowerUp);
    state.coinsVisuals.forEach(drawCoin);
    state.playerBalls.forEach(drawBall);
    state.enemyBalls.forEach(drawBall);
    drawPlayer();
    drawParticles();
    drawCooldownMeter();
    drawRoundTransition();
}

function loop(timestamp) {
    const deltaMs = Math.min(timestamp - state.lastTime, 32);
    state.lastTime = timestamp;
    updateGame(deltaMs);
    draw();
    requestAnimationFrame(loop);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = true;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = true;
    if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") keys.up = true;
    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") keys.down = true;
    if (event.code === "Space") {
        if (!event.repeat) throwPlayerBall();
        event.preventDefault();
    }
    if (event.key.toLowerCase() === "p") togglePause();
    if (event.key === "Enter") startGame();
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = false;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = false;
    if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") keys.up = false;
    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") keys.down = false;
});

function holdButton(button, keyName) {
    const set = (value) => {
        keys[keyName] = value;
    };
    button.addEventListener("pointerdown", () => set(true));
    button.addEventListener("pointerup", () => set(false));
    button.addEventListener("pointerleave", () => set(false));
    button.addEventListener("pointercancel", () => set(false));
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
resetBtn.addEventListener("click", resetGame);
holdButton(leftBtn, "left");
holdButton(rightBtn, "right");
fireBtn.addEventListener("pointerdown", throwPlayerBall);
if (cardChoices) {
    cardChoices.addEventListener("click", (event) => {
        const card = event.target.closest("[data-power]");
        if (!card) return;

        const cost = getCardCost();
        if (state.coins < cost) return;

        state.coins -= cost;
        applyPowerUp(card.dataset.power);
        hideCardChoices();
        syncHud();
        startRoundTransition();
    });
}
if (skipCardBtn) {
    skipCardBtn.addEventListener("click", () => {
        hideCardChoices();
        startRoundTransition();
    });
}

makeCourtMarks();
resetGame();
state.lastTime = performance.now();
requestAnimationFrame(loop);
