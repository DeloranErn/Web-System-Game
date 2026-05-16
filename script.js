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
    playerPe: "assets/player-pe.png",
    playerPeThrow: "assets/player-pe-throw.png",
    enemyRed: "assets/student-red.png",
    enemyRedThrow: "assets/student-red-throw.png",
    enemyBlue: "assets/student-blue.png",
    enemyBlueThrow: "assets/student-blue-throw.png",
    teacher: "assets/teacher.png",
    teacherThrow: "assets/teacher-throw.png",
    ball: "assets/dodgeball.png",
    ball2: "assets/dodgeball2.png",
    dodgeball: "assets/player-dodgeball.png",
    chalk: "assets/chalk.png",
    barrier: "assets/barrier.png",
    coin: "assets/coin.png",
    siomaiRice: "assets/siomai-rice.png",
    icedCoffee: "assets/iced-coffee.png",
    icedCoffeeIndicator: "assets/iced-coffee-indicator.png",
    volleyball: "assets/player-volleyball.png",
    soccerball: "assets/player-soccerball.png",
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
const BASE_PLAYER_HEALTH = 3;
const BOSS_REWARD_HEALTH = 2;
const BOSS_REWARD_COINS = 5;
const BOSS_REWARD_OVERLAY_MS = 2600;
const STUDENT_LAPS_BEFORE_SWARM = 3;
const ENEMY_THROW_PRESSURE_MULTIPLIER = 1.10;
const ENEMY_RANDOM_AIM_CHANCE = 0.24;
const ENEMY_PREDICTIVE_AIM_CHANCE = 0.34;
const SIDELINE_THROW_INTERVAL_MS = 7000;
const SHOP_REROLL_COST = 2;
const SHOP_NEW_BUFF_LIMIT = 3;
const MAX_NEW_BUFF_STACKS = 4;
const MAX_BALL_BUFF_STACKS = 4;
const POWER_UP_TYPES = {
    SIOMAI: "siomaiRice",
    COFFEE: "icedCoffee",
    DODGEBALL: "dodgeball",
    VOLLEYBALL: "volleyball",
    SOCCERBALL: "soccerball",
    PE_UNIFORM: "peUniform",
    THROW_SPEED: "throwSpeed",
    PROJECTILE_SPEED: "projectileSpeed",
    MOVEMENT_SPEED: "movementSpeed",
    DODGE_CHANCE: "dodgeChance"
};

const BALL_POWER_TYPES = [
    POWER_UP_TYPES.DODGEBALL,
    POWER_UP_TYPES.VOLLEYBALL,
    POWER_UP_TYPES.SOCCERBALL
];

const SHOP_NEW_POWER_TYPES = [
    POWER_UP_TYPES.THROW_SPEED,
    POWER_UP_TYPES.PROJECTILE_SPEED,
    POWER_UP_TYPES.MOVEMENT_SPEED,
    POWER_UP_TYPES.DODGE_CHANCE
];

const SHOP_MIXED_POWER_TYPES = [
    ...BALL_POWER_TYPES,
    ...SHOP_NEW_POWER_TYPES,
    POWER_UP_TYPES.PE_UNIFORM
];

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
    baseHealth: BASE_PLAYER_HEALTH,
    health: BASE_PLAYER_HEALTH,
    lastTime: 0,
    throwCooldown: 0,
    bossChalkTimer: BOSS_CHALK_ATTACK_MS,
    bossChalkShots: 0,
    bossChalkShotTimer: 0,
    transitionTimer: 0,
    transitionTitle: "",
    transitionSubtitle: "",
    transitionBoss: false,
    bossRewardTimer: 0,
    completedLevels: 0,
    cardSelectionsShown: 0,
    courtMarks: [],
    playerBalls: [],
    enemyBalls: [],
    coinsVisuals: [],
    powerUps: [],
    students: [],
    sidelineEnemies: [],
    particles: [],
    shopCards: [],
    shopRerolledSlots: [],
    shopBoughtBall: false,
    shopBoughtNewBuffs: 0,
    playerUpgrades: {
        latestBallColor: "#f97316",
        dodgeballStacks: 0,
        volleyballBounce: false,
        volleyballStacks: 0,
        soccerStacks: 0,
        coffeeRounds: 0,
        peUniformStacks: 0,
        siomaiShieldRounds: 0,
        throwSpeedStacks: 0,
        projectileSpeedStacks: 0,
        movementSpeedStacks: 0,
        dodgeChanceStacks: 0
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
    let scale = 1 + (state.round - 1) * LEVEL_SPEED_SCALE;
    if (state.round >= 14) {
        scale *= 0.9;
    }
    return scale;
}

function getEnemyThrowInterval() {
    const fireRateSteps = Math.floor((state.round - 1) / 4);
    const fireRateMultiplier = Math.pow(0.92, fireRateSteps);
    return Math.max(440, (1450 - state.round * 70) * fireRateMultiplier);
}

function getEnemyPersonalThrowInterval(activeCount) {
    const teamSpacing = Math.max(1, activeCount);
    const variance = 0.88 + Math.random() * 0.24;
    return getEnemyThrowInterval() * teamSpacing * variance / ENEMY_THROW_PRESSURE_MULTIPLIER;
}

function getCardCost() {
    if (state.cardSelectionsShown <= 1) return 0;
    return state.cardSelectionsShown <= 3 ? 3 : 5;
}

function getCoinDropChance(enemy) {
    if (enemy.type === "teacher") return 1;
    return state.round <= 5 ? 0.15 : 0.13;
}

function getStudentDodgeChance() {
    return state.round <= 10 ? 0.10 : 0.12;
}

function getEffectivePlayerHealth() {
    return state.health +
        state.playerUpgrades.peUniformStacks +
        (state.playerUpgrades.siomaiShieldRounds > 0 ? 1 : 0);
}

function getBasePlayerHealth() {
    return state.baseHealth || BASE_PLAYER_HEALTH;
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
    const speedBonus = 1 + state.playerUpgrades.movementSpeedStacks * 0.06;
    return player.speed * coffeeBonus * uniformBonus * speedBonus;
}

function getThrowCooldown() {
    const baseCooldown = Math.max(900, 1600 - state.round * 90);
    const coffeeMultiplier = state.playerUpgrades.coffeeRounds > 0 ? 0.70 : 1;
    const uniformMultiplier = 1 / (1 + state.playerUpgrades.peUniformStacks * 0.15);
    const agilityMultiplier = Math.max(0.55, 1 - state.playerUpgrades.throwSpeedStacks * 0.07);
    return baseCooldown * coffeeMultiplier * uniformMultiplier * agilityMultiplier;
}

function getPlayerProjectileSpeed() {
    return 520 * (1 + state.playerUpgrades.projectileSpeedStacks * 0.08);
}

function getPlayerProjectileDodgeChance() {
    return Math.min(0.65, state.playerUpgrades.dodgeChanceStacks * 0.07);
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

function canApplyPowerUp(type) {
    if (type === POWER_UP_TYPES.THROW_SPEED) return state.playerUpgrades.throwSpeedStacks < MAX_NEW_BUFF_STACKS;
    if (type === POWER_UP_TYPES.PROJECTILE_SPEED) return state.playerUpgrades.projectileSpeedStacks < MAX_NEW_BUFF_STACKS;
    if (type === POWER_UP_TYPES.MOVEMENT_SPEED) return state.playerUpgrades.movementSpeedStacks < MAX_NEW_BUFF_STACKS;
    if (type === POWER_UP_TYPES.DODGE_CHANCE) return state.playerUpgrades.dodgeChanceStacks < MAX_NEW_BUFF_STACKS;
    if (type === POWER_UP_TYPES.DODGEBALL) return state.playerUpgrades.dodgeballStacks < MAX_BALL_BUFF_STACKS;
    if (type === POWER_UP_TYPES.VOLLEYBALL) return state.playerUpgrades.volleyballStacks < MAX_BALL_BUFF_STACKS;
    if (type === POWER_UP_TYPES.SOCCERBALL) return state.playerUpgrades.soccerStacks < MAX_BALL_BUFF_STACKS;
    return true;
}

function isBallShopPower(type) {
    return BALL_POWER_TYPES.includes(type);
}

function isNewShopPower(type) {
    return SHOP_NEW_POWER_TYPES.includes(type);
}

function getShopPowerCost(type) {
    if (isNewShopPower(type)) return 2;
    if (type === POWER_UP_TYPES.PE_UNIFORM) return 6;
    return getCardCost();
}

function getShopPoolForSlot(slotIndex) {
    return slotIndex === 0 ? BALL_POWER_TYPES : SHOP_MIXED_POWER_TYPES;
}

function pickShopPower(slotIndex, currentType = "") {
    let pool = getShopPoolForSlot(slotIndex).filter((type) => type !== currentType && canApplyPowerUp(type));
    if (!pool.length) pool = getShopPoolForSlot(slotIndex).filter((type) => type !== currentType);
    return pool[Math.floor(Math.random() * pool.length)];
}

function makeShopCard(type) {
    const details = getPowerUpDetails(type);
    return {
        type,
        title: details.title,
        description: details.description,
        cost: getShopPowerCost(type)
    };
}

function applyPowerUp(type) {
    if (!canApplyPowerUp(type)) return false;

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
        burst(player.x + player.width / 2, player.y + player.height / 2, "#0ea5e9");
    }

    if (type === POWER_UP_TYPES.THROW_SPEED) {
        state.playerUpgrades.throwSpeedStacks++;
        burst(player.x + player.width / 2, player.y + player.height / 2, "#a3e635");
    }

    if (type === POWER_UP_TYPES.PROJECTILE_SPEED) {
        state.playerUpgrades.projectileSpeedStacks++;
        burst(player.x + player.width / 2, player.y + player.height / 2, "#fb923c");
    }

    if (type === POWER_UP_TYPES.MOVEMENT_SPEED) {
        state.playerUpgrades.movementSpeedStacks++;
        burst(player.x + player.width / 2, player.y + player.height / 2, "#22d3ee");
    }

    if (type === POWER_UP_TYPES.DODGE_CHANCE) {
        state.playerUpgrades.dodgeChanceStacks++;
        burst(player.x + player.width / 2, player.y + player.height / 2, "#c084fc");
    }

    syncHud();
    updatePowerPanel();
    return true;
}

function getPowerUpDetails(type) {
    if (type === POWER_UP_TYPES.DODGEBALL) {
        return {
            title: "Dodgeball",
            description: "Adds one more angled spread shot."
        };
    }
    if (type === POWER_UP_TYPES.VOLLEYBALL) {
        return {
            title: "Volleyball",
            description: "20% bounce chance. +8% ball size."
        };
    }
    if (type === POWER_UP_TYPES.SOCCERBALL) {
        return {
            title: "Soccerball",
            description: "Adds another delayed follow-up ball."
        };
    }
    if (type === POWER_UP_TYPES.THROW_SPEED) {
        return {
            title: "Agility",
            description: "Throw cooldown -7%. Max 4."
        };
    }
    if (type === POWER_UP_TYPES.PROJECTILE_SPEED) {
        return {
            title: "Arm Strength",
            description: "Projectile speed +8%. Max 4."
        };
    }
    if (type === POWER_UP_TYPES.MOVEMENT_SPEED) {
        return {
            title: "Speed",
            description: "Run speed +6%. Max 4."
        };
    }
    if (type === POWER_UP_TYPES.DODGE_CHANCE) {
        return {
            title: "Sneaky",
            description: "Dodge chance +7%. Max 4."
        };
    }
    if (type === POWER_UP_TYPES.PE_UNIFORM) {
        return {
            title: "PE Uniform",
            description: "Armor, speed, and throw rate."
        };
    }
    return {
        title: getPowerUpName(type),
        description: ""
    };
}

function showCardChoices() {
    if (!cardOverlay || !cardChoices) return;

    state.status = "card";
    state.cardSelectionsShown++;
    
    // Generate shop cards while ensuring no duplicates
    const selectedPowers = new Set();
    state.shopCards = [0, 1, 2].map((slotIndex) => {
        let power = pickShopPower(slotIndex);
        while (selectedPowers.has(power)) {
            power = pickShopPower(slotIndex);
        }
        selectedPowers.add(power);
        return makeShopCard(power);
    });
    
    state.shopRerolledSlots = [false, false, false];
    state.shopBoughtBall = false;
    state.shopBoughtNewBuffs = 0;
    cardOverlay.classList.remove("hidden");
    cardOverlay.classList.add("flex");
    renderShopCards();
}

function hideCardChoices() {
    if (!cardOverlay) return;
    cardOverlay.classList.add("hidden");
    cardOverlay.classList.remove("flex");
}

function skipCardSelection() {
    hideCardChoices();
    startRoundTransition();
}

function getRerollCost() {
    return state.cardSelectionsShown === 1 ? 0 : SHOP_REROLL_COST;
}

function canBuyShopCard(card) {
    if (!card || card.bought || !canApplyPowerUp(card.type)) return false;
    if (state.coins < card.cost) return false;
    if (isBallShopPower(card.type) && state.shopBoughtBall) return false;
    if (isNewShopPower(card.type) && state.shopBoughtNewBuffs >= SHOP_NEW_BUFF_LIMIT) return false;
    return true;
}

function renderShopCards() {
    if (!cardChoices) return;

    const rerollCost = getRerollCost();
    if (cardCostText) {
        cardCostText.textContent = state.cardSelectionsShown === 1
            ? `First shop: free rerolls | Coins: ${state.coins}`
            : `Reroll: ${SHOP_REROLL_COST} coins | Coins: ${state.coins}`;
    }

    cardChoices.innerHTML = state.shopCards.map((card, slotIndex) => {
        const disabled = !canBuyShopCard(card);
        const rerollDisabled = card.bought || state.shopRerolledSlots[slotIndex] || state.coins < rerollCost;
        const cardLabel = card.cost === 0 ? "Free" : `${card.cost} coins`;
        const rerollLabel = state.shopRerolledSlots[slotIndex]
            ? "Rerolled"
            : `Reroll ${rerollCost === 0 ? "Free" : `${rerollCost}c`}`;

        return `
            <div class="upgrade-slot">
                <button class="upgrade-card" data-power="${card.type}" data-slot="${slotIndex}" type="button" ${disabled ? "disabled" : ""}>
                    ${getPowerUpIconMarkup(card.type, "upgrade-card-icon")}
                    <span class="upgrade-card-title">${card.title}</span>
                    <span class="upgrade-card-text">${card.description}</span>
                    <span class="upgrade-card-cost">${card.bought ? "Bought" : cardLabel}</span>
                </button>
                <button class="reroll-btn" data-reroll-slot="${slotIndex}" type="button" ${rerollDisabled ? "disabled" : ""}>${rerollLabel}</button>
            </div>
        `;
    }).join("");
}

function rerollShopSlot(slotIndex) {
    if (state.shopRerolledSlots[slotIndex]) return;

    const cost = getRerollCost();
    if (state.coins < cost) return;

    state.coins -= cost;
    state.shopRerolledSlots[slotIndex] = true;
    const currentType = state.shopCards[slotIndex]?.type || "";
    
    // Get other selected powers to avoid duplicates
    const otherPowers = state.shopCards
        .filter((_, idx) => idx !== slotIndex)
        .map(card => card.type)
        .join("||");
    
    let newPower = pickShopPower(slotIndex, currentType);
    while (state.shopCards.some((card, idx) => idx !== slotIndex && card.type === newPower)) {
        newPower = pickShopPower(slotIndex, currentType);
    }
    
    state.shopCards[slotIndex] = makeShopCard(newPower);
    syncHud();
    renderShopCards();
}

function buyShopCard(slotIndex) {
    const card = state.shopCards[slotIndex];
    if (!canBuyShopCard(card)) return;

    state.coins -= card.cost;
    if (!applyPowerUp(card.type)) {
        state.coins += card.cost;
        syncHud();
        renderShopCards();
        return;
    }

    if (isBallShopPower(card.type)) state.shopBoughtBall = true;
    if (isNewShopPower(card.type)) state.shopBoughtNewBuffs++;
    card.bought = true;
    syncHud();
    renderShopCards();
}

function createStudents() {
    state.students = [];
    const count = BASE_STUDENT_COUNT + state.round - 1;
    const columns = Math.min(9, count);
    const gapX = 76;
    const gapY = 64;
    const speedScale = getLevelScale();
    const studentHp = state.round > 25 ? 3 : state.round > 5 ? 2 : 1;

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
            laps: 0,
            swarming: false,
            throwTimer: getEnemyPersonalThrowInterval(count) * (0.35 + Math.random() * 0.65),
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
            laps: 0,
            swarming: false,
            throwTimer: getEnemyPersonalThrowInterval(count + 1) * (0.35 + Math.random() * 0.65),
            stunned: 0,
            invulnTimer: 0,
            active: true
        });
    }

    spawnRoundPowerUps();
    createSidelineEnemies();
}

function createSidelineEnemies() {
    const count = Math.floor((state.round - 1) / 5);
    const sideTop = 80;
    const sideBottom = canvas.height - 80;

    state.sidelineEnemies = Array.from({ length: count }, (_, index) => {
        const side = index % 2 === 0 ? "left" : "right";
        return {
            x: side === "left" ? 22 : canvas.width - 63,
            y: sideTop + ((index * 85) % Math.max(1, sideBottom - sideTop - 52)),
            width: 41,
            height: 52,
            hitboxPad: 10,
            direction: side === "left" ? 1 : -1,
            verticalDirection: index % 3 === 0 ? -1 : 1,
            speed: 86 + index * 4,
            throwTimer: SIDELINE_THROW_INTERVAL_MS * (0.55 + Math.random() * 0.45),
            side,
            wobble: Math.random() * Math.PI * 2,
            sprite: side === "left" ? "enemyBlue" : "enemyRed",
            throwPose: 0,
            active: true
        };
    });
}

function syncHud() {
    scoreText.textContent = state.score;
    levelText.textContent = state.round;
    if (livesText) livesText.textContent = getEffectivePlayerHealth();
    if (cooldownText) cooldownText.textContent = state.throwCooldown <= 0 ? "Ready" : `${Math.ceil(state.throwCooldown / 1000)}s`;
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
    state.baseHealth = BASE_PLAYER_HEALTH;
    state.health = BASE_PLAYER_HEALTH;
    state.throwCooldown = 0;
    state.bossChalkTimer = BOSS_CHALK_ATTACK_MS;
    state.bossChalkShots = 0;
    state.bossChalkShotTimer = 0;
    state.transitionTimer = 0;
    state.transitionBoss = false;
    state.bossRewardTimer = 0;
    state.completedLevels = 0;
    state.cardSelectionsShown = 0;
    state.playerBalls = [];
    state.enemyBalls = [];
    state.coinsVisuals = [];
    state.powerUps = [];
    state.sidelineEnemies = [];
    state.particles = [];
    state.shopCards = [];
    state.shopRerolledSlots = [];
    state.shopBoughtBall = false;
    state.shopBoughtNewBuffs = 0;
    state.playerUpgrades = {
        latestBallColor: "#f97316",
        dodgeballStacks: 0,
        volleyballBounce: false,
        volleyballStacks: 0,
        soccerStacks: 0,
        coffeeRounds: 0,
        peUniformStacks: 0,
        siomaiShieldRounds: 0,
        throwSpeedStacks: 0,
        projectileSpeedStacks: 0,
        movementSpeedStacks: 0,
        dodgeChanceStacks: 0
    };
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 106;
    createStudents();
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
    const ballRadius = 13 * (1 + state.playerUpgrades.volleyballStacks * 0.08);
    const powerUpType = getActiveBallPowerUpType();
    const bounceChance = state.playerUpgrades.volleyballStacks > 0 ? 0.20 : 0;

    for (let spreadIndex = 0; spreadIndex < spreadCount; spreadIndex++) {
        const angle = (spreadIndex - middle) * spreadStep;
        const speed = getPlayerProjectileSpeed();
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
                powerUpType,
                bouncesLeft: Math.random() < bounceChance ? 1 : 0,
                color: state.playerUpgrades.latestBallColor,
                spawnDelay: trail * 200
            });
        }
    }

    state.throwCooldown = getThrowCooldown();
    player.throwPose = 230;
}

function getPlayerMovementVector() {
    return {
        x: (keys.right ? 1 : 0) - (keys.left ? 1 : 0),
        y: (keys.down ? 1 : 0) - (keys.up ? 1 : 0)
    };
}

function getEnemyAimPoint(originX, originY, speed) {
    const target = {
        x: player.x + player.width / 2,
        y: player.y + player.height / 2
    };
    const roll = Math.random();

    if (roll < ENEMY_RANDOM_AIM_CHANCE) {
        const spread = 190;
        return {
            x: target.x + (Math.random() - 0.5) * spread,
            y: target.y + (Math.random() - 0.5) * spread
        };
    }

    if (roll < ENEMY_RANDOM_AIM_CHANCE + ENEMY_PREDICTIVE_AIM_CHANCE) {
        const movement = getPlayerMovementVector();
        const distance = Math.hypot(target.x - originX, target.y - originY);
        const leadSeconds = clamp(distance / speed, 0.14, 0.55);
        const playerSpeed = getPlayerSpeed();
        target.x += movement.x * playerSpeed * leadSeconds;
        target.y += movement.y * playerSpeed * leadSeconds;
    }

    return {
        x: clamp(target.x, 28, canvas.width - 28),
        y: clamp(target.y, canvas.height * 0.50, canvas.height - 28)
    };
}

function fireEnemyProjectile(student, spawnDelay = 0) {
    if (!student || !student.active || student.stunned > 0) return;

    student.throwPose = 260;

    const originX = student.x + student.width / 2;
    const originY = student.y + student.height - 8;
    const speed = (student.type === "teacher" ? 285 : 245) * getLevelScale();
    const target = getEnemyAimPoint(originX, originY, speed);
    const angle = Math.atan2(target.y - originY, target.x - originX);

    state.enemyBalls.push({
        x: originX,
        y: originY,
        radius: student.type === "teacher" ? 18 * 1.035 : 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spin: 0,
        owner: "enemy",
        color: "#f97316",
        bouncesLeft: 0,
        spawnDelay
    });
}

function fireSidelineProjectile(enemy) {
    if (!enemy || !enemy.active) return;

    enemy.throwPose = 260;

    const originX = enemy.side === "left" ? enemy.x + enemy.width : enemy.x;
    const originY = enemy.y + enemy.height / 2 + (Math.random() - 0.5) * 12;
    const speed = 270 * getLevelScale();
    const direction = enemy.side === "left" ? 1 : -1;

    state.enemyBalls.push({
        x: originX,
        y: originY,
        radius: 13,
        vx: direction * speed,
        vy: 0,
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
    const clearedBoss = isBossRound();
    state.completedLevels++;
    state.round++;
    state.score += 250 * state.round;
    state.playerBalls = [];
    state.enemyBalls = [];
    state.powerUps = [];
    state.playerUpgrades.coffeeRounds = Math.max(0, state.playerUpgrades.coffeeRounds - 1);
    state.playerUpgrades.siomaiShieldRounds = Math.max(0, state.playerUpgrades.siomaiShieldRounds - 1);
    state.bossChalkTimer = BOSS_CHALK_ATTACK_MS;
    state.bossChalkShots = 0;
    state.bossChalkShotTimer = 0;
    createStudents();
    syncHud();
    updatePowerPanel();

    if (clearedBoss) {
        state.baseHealth += BOSS_REWARD_HEALTH;
        state.health += BOSS_REWARD_HEALTH;
        state.status = "bossReward";
        state.bossRewardTimer = BOSS_REWARD_OVERLAY_MS;
        syncHud();
        updatePowerPanel();
        return;
    }

    continueAfterRoundReward();
}

function continueAfterRoundReward() {
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

    if (state.status === "bossReward") {
        state.bossRewardTimer -= deltaMs;
        if (state.bossRewardTimer <= 0) {
            state.bossRewardTimer = 0;
            continueAfterRoundReward();
        }
        return;
    }

    if (state.status !== "playing") return;

    const playerSpeed = getPlayerSpeed();
    if (keys.left) player.x -= playerSpeed * deltaSeconds;
    if (keys.right) player.x += playerSpeed * deltaSeconds;
    if (keys.up) player.y -= playerSpeed * deltaSeconds;
    if (keys.down) player.y += playerSpeed * deltaSeconds;
    player.x = clamp(player.x, 85, canvas.width - player.width - 85);
    player.y = clamp(player.y, canvas.height * 0.52, canvas.height - player.height - 32);
    player.throwPose = Math.max(0, player.throwPose - deltaMs);

    state.throwCooldown = Math.max(0, state.throwCooldown - deltaMs);

    state.students.forEach((student) => {
        if (!student.active) return;
        student.wobble += deltaSeconds * 5;
        student.stunned = Math.max(0, student.stunned - deltaMs);
        student.throwPose = Math.max(0, student.throwPose - deltaMs);
        student.invulnTimer = Math.max(0, student.invulnTimer - deltaMs);

        if (student.swarming) {
            const targetX = player.x + player.width / 2;
            const targetY = player.y + player.height / 2;
            const originX = student.x + student.width / 2;
            const originY = student.y + student.height / 2;
            const angle = Math.atan2(targetY - originY, targetX - originX);
            const speed = student.speed * 1.45;
            student.x += Math.cos(angle) * speed * deltaSeconds;
            student.y += Math.sin(angle) * speed * deltaSeconds;
            student.direction = Math.cos(angle) >= 0 ? 1 : -1;
            return;
        }

        student.x += student.direction * student.speed * deltaSeconds;
        student.y += Math.sin(student.wobble) * 0.28;

        if (student.x <= 85) {
            student.x = 85;
            student.direction = 1;
            student.laps++;
        } else if (student.x + student.width >= canvas.width - 85) {
            student.x = canvas.width - 85 - student.width;
            student.direction = -1;
            student.laps++;
        }

        if (student.laps >= STUDENT_LAPS_BEFORE_SWARM && student.type === "student") {
            student.swarming = true;
        }
    });

    state.sidelineEnemies.forEach((enemy) => {
        if (!enemy.active) return;

        const sideTop = canvas.height * 0.54;
        const sideBottom = canvas.height - enemy.height - 42;
        enemy.wobble += deltaSeconds * 6;
        enemy.y += enemy.verticalDirection * enemy.speed * deltaSeconds;
        enemy.throwPose = Math.max(0, enemy.throwPose - deltaMs);

        if (enemy.y <= sideTop) {
            enemy.y = sideTop;
            enemy.verticalDirection = 1;
        } else if (enemy.y >= sideBottom) {
            enemy.y = sideBottom;
            enemy.verticalDirection = -1;
        }

        enemy.throwTimer -= deltaMs;
        if (enemy.throwTimer <= 0) {
            fireSidelineProjectile(enemy);
            enemy.throwTimer = SIDELINE_THROW_INTERVAL_MS;
        }
    });

    const activeThrowers = state.students.filter((student) => student.active && !student.swarming);
    activeThrowers.forEach((student) => {
        if (student.stunned > 0) return;
        student.throwTimer -= deltaMs;
        if (student.throwTimer <= 0) {
            fireEnemyProjectile(student);
            student.throwTimer = getEnemyPersonalThrowInterval(activeThrowers.length);
        }
    });

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
        ball.y + ball.radius > -30 &&
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
            hit.x = clamp(hit.x + hit.direction * 72, 34, canvas.width - hit.width - 34);
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
        if (ball.spawnDelay > 0) continue;
        if (projectileOverlapsRect(ball, hitbox(player))) {
            state.enemyBalls.splice(b, 1);
            if (Math.random() < getPlayerProjectileDodgeChance()) {
                burst(player.x + player.width / 2, player.y + player.height / 2, "#c084fc");
                continue;
            }
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

    const swarmed = state.students.some((student) => (
        student.active &&
        student.swarming &&
        rectsOverlap(hitbox(student), hitbox(player))
    ));
    if (swarmed) {
        state.health = 0;
        state.playerUpgrades.peUniformStacks = 0;
        state.playerUpgrades.siomaiShieldRounds = 0;
        syncHud();
        state.status = "gameover";
        showOverlay("Swarmed", `The other team finished 3 laps and rushed you. Final score: ${state.score}.`);
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
        // Whiteboard - positioned in left side area
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(5, 45, 75, 85);
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 3;
        ctx.strokeRect(5, 45, 75, 85);
        ctx.fillStyle = "#334155";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Notes", 42, 68);

        // Quiz board - positioned in right side area
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(canvas.width - 80, 45, 75, 85);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("QUIZ", canvas.width - 42, 68);
        ctx.fillText("TIME", canvas.width - 42, 85);

        ctx.fillStyle = "rgba(30, 41, 59, 0.12)";
        for (let y = 190; y < canvas.height - 80; y += 92) {
            for (let x = 120; x < canvas.width - 120; x += 132) {
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

    // LEFT SIDE AREA - visible side thrower zone
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 28, 85, canvas.height - 56);
    
    // RIGHT SIDE AREA - visible side thrower zone
    ctx.strokeRect(canvas.width - 85, 28, 85, canvas.height - 56);

    // MAIN PLAY FIELD
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 4;
    ctx.strokeRect(85, 28, canvas.width - 170, canvas.height - 56);
    
    // Center line divider
    ctx.beginPath();
    ctx.moveTo(85, canvas.height / 2);
    ctx.lineTo(canvas.width - 85, canvas.height / 2);
    ctx.stroke();

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
    const baseSprite = state.playerUpgrades.peUniformStacks > 0 && hasSprite(sprites.playerPe)
        ? sprites.playerPe
        : sprites.player;
    const throwSprite = state.playerUpgrades.peUniformStacks > 0 && hasSprite(sprites.playerPeThrow)
        ? sprites.playerPeThrow
        : sprites.playerThrow;
    const sprite = player.throwPose > 0 && hasSprite(throwSprite) ? throwSprite : baseSprite;
    if (hasSprite(sprite)) {
        ctx.drawImage(sprite, player.x, player.y, player.width, player.height);
        if (player.throwPose > 0 && !hasSprite(throwSprite)) {
            drawThrowHands(player, 1);
        }
        return;
    }

    drawStudentBody(player, "#2563eb", "#111827", 1);
}

function drawPlayerBarrier() {
    if (state.playerUpgrades.siomaiShieldRounds <= 0) return;

    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const size = 76;

    ctx.save();
    ctx.globalAlpha = 0.86;
    if (hasSprite(sprites.barrier)) {
        ctx.drawImage(sprites.barrier, centerX - size / 2, centerY - size / 2, size, size);
    } else {
        ctx.strokeStyle = "#1e3a8a";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function drawPlayerPowerEffects() {
    if (state.playerUpgrades.peUniformStacks <= 0) return;

    const x = player.x - 4;
    const y = player.y - 4;
    const width = player.width + 8;
    const height = player.height + 8;

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
}

function drawCoffeeIndicator() {
    if (state.playerUpgrades.coffeeRounds <= 0) return;

    const x = player.x + player.width + 10;
    const y = player.y + 4;

    ctx.save();
    if (hasSprite(sprites.icedCoffeeIndicator)) {
        ctx.drawImage(sprites.icedCoffeeIndicator, x - 2, y - 2, 20, 20);
    } else {
        ctx.fillStyle = "#16a34a";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.font = "900 24px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText("^", x + 8, y + 9);
        ctx.fillText("^", x + 8, y + 9);
    }
    ctx.restore();
}

function drawPlayerHealthBar() {
    const totalSlots = getBasePlayerHealth() +
        state.playerUpgrades.peUniformStacks +
        (state.playerUpgrades.siomaiShieldRounds > 0 ? 1 : 0);
    const slotWidth = 15;
    const slotGap = 2;
    const width = totalSlots * slotWidth + (totalSlots - 1) * slotGap;
    const height = 6;
    const x = player.x + player.width / 2 - width / 2;
    const y = player.y - 14;
    let slot = 0;

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.36)";
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);

    for (let i = 0; i < getBasePlayerHealth(); i++) {
        ctx.fillStyle = i < state.health ? "#22c55e" : "rgba(34, 197, 94, 0.22)";
        ctx.fillRect(x + slot * (slotWidth + slotGap), y, slotWidth, height);
        slot++;
    }

    for (let i = 0; i < state.playerUpgrades.peUniformStacks; i++) {
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(x + slot * (slotWidth + slotGap), y, slotWidth, height);
        slot++;
    }

    if (state.playerUpgrades.siomaiShieldRounds > 0) {
        ctx.fillStyle = "#1e3a8a";
        ctx.fillRect(x + slot * (slotWidth + slotGap), y, slotWidth, height);
    }

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    ctx.restore();
}

function drawLapWarning(student) {
    if (student.type !== "student" || student.laps < STUDENT_LAPS_BEFORE_SWARM - 1) return;

    ctx.save();
    ctx.fillStyle = "#dc2626";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.font = "900 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const x = student.x + student.width / 2;
    const y = student.y - 18;
    ctx.strokeText("!", x, y);
    ctx.fillText("!", x, y);
    ctx.restore();
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
        drawLapWarning(student);
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
    drawLapWarning(student);
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
        if (hasSprite(sprites.chalk)) {
            ctx.drawImage(sprites.chalk, -ball.width / 2, -ball.height / 2, ball.width, ball.height);
        } else {
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(-ball.width / 2, -ball.height / 2, ball.width, ball.height);
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(-ball.width / 2, -ball.height / 2, ball.width, 9);
        }
        ctx.restore();
        return;
    }

    const playerSprite = ball.owner === "player"
        ? sprites[getPowerUpSpriteName(ball.powerUpType) || "ball2"]
        : null;

    if (hasSprite(playerSprite)) {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.spin);
        ctx.drawImage(playerSprite, -ball.radius, -ball.radius, size, size);
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

function getActiveBallPowerUpType() {
    if (state.playerUpgrades.soccerStacks > 0) return POWER_UP_TYPES.SOCCERBALL;
    if (state.playerUpgrades.volleyballStacks > 0) return POWER_UP_TYPES.VOLLEYBALL;
    if (state.playerUpgrades.dodgeballStacks > 0) return POWER_UP_TYPES.DODGEBALL;
    return POWER_UP_TYPES.DODGEBALL;
}

function getPowerUpSpriteName(type) {
    if (type === POWER_UP_TYPES.DODGEBALL) return "dodgeball";
    if (type === POWER_UP_TYPES.VOLLEYBALL) return "volleyball";
    if (type === POWER_UP_TYPES.SOCCERBALL) return "soccerball";
    if (type === POWER_UP_TYPES.SIOMAI) return "siomaiRice";
    if (type === POWER_UP_TYPES.PE_UNIFORM) return "playerPe";
    return "";
}

function getPowerUpIconMarkup(type, className = "power-icon") {
    const spriteName = getPowerUpSpriteName(type);
    const source = spriteSources[spriteName];
    const label = getPowerUpLabel(type);

    if (source) {
        return `<span class="${className} sprite-icon"><img src="${source}" alt="${label}"></span>`;
    }

    return `<span class="${className}" style="background:${getPowerUpColor(type)}">${label}</span>`;
}

function getPowerUpLabel(type) {
    if (type === POWER_UP_TYPES.SIOMAI) return "SR";
    if (type === POWER_UP_TYPES.COFFEE) return "IC";
    if (type === POWER_UP_TYPES.DODGEBALL) return "DB";
    if (type === POWER_UP_TYPES.VOLLEYBALL) return "VB";
    if (type === POWER_UP_TYPES.PE_UNIFORM) return "PE";
    if (type === POWER_UP_TYPES.THROW_SPEED) return "AG";
    if (type === POWER_UP_TYPES.PROJECTILE_SPEED) return "AS";
    if (type === POWER_UP_TYPES.MOVEMENT_SPEED) return "SP";
    if (type === POWER_UP_TYPES.DODGE_CHANCE) return "SN";
    return "SB";
}

function getPowerUpColor(type) {
    if (type === POWER_UP_TYPES.SIOMAI) return "#22c55e";
    if (type === POWER_UP_TYPES.COFFEE) return "#92400e";
    if (type === POWER_UP_TYPES.DODGEBALL) return "#dc2626";
    if (type === POWER_UP_TYPES.VOLLEYBALL) return "#facc15";
    if (type === POWER_UP_TYPES.PE_UNIFORM) return "#0ea5e9";
    if (type === POWER_UP_TYPES.THROW_SPEED) return "#84cc16";
    if (type === POWER_UP_TYPES.PROJECTILE_SPEED) return "#fb923c";
    if (type === POWER_UP_TYPES.MOVEMENT_SPEED) return "#22d3ee";
    if (type === POWER_UP_TYPES.DODGE_CHANCE) return "#c084fc";
    return "#f8fafc";
}

function getPowerUpName(type) {
    if (type === POWER_UP_TYPES.SIOMAI) return "Siomai Rice";
    if (type === POWER_UP_TYPES.COFFEE) return "Iced Coffee";
    if (type === POWER_UP_TYPES.DODGEBALL) return "Dodgeball";
    if (type === POWER_UP_TYPES.VOLLEYBALL) return "Volleyball";
    if (type === POWER_UP_TYPES.SOCCERBALL) return "Soccerball";
    if (type === POWER_UP_TYPES.THROW_SPEED) return "Agility";
    if (type === POWER_UP_TYPES.PROJECTILE_SPEED) return "Arm Strength";
    if (type === POWER_UP_TYPES.MOVEMENT_SPEED) return "Speed";
    if (type === POWER_UP_TYPES.DODGE_CHANCE) return "Sneaky";
    return "PE Uniform";
}

function makePowerPanelRow(type, amount = 0) {
    return `
        <div class="power-row">
            ${getPowerUpIconMarkup(type)}
            <span class="power-name">${getPowerUpName(type)}</span>
            <span class="power-amount">${amount}</span>
        </div>
    `;
}

function updatePowerPanel() {
    if (!powerList) return;

    const upgrades = state.playerUpgrades;
    const rows = [];

    if (upgrades.dodgeballStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.DODGEBALL, upgrades.dodgeballStacks));
    if (upgrades.volleyballStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.VOLLEYBALL, upgrades.volleyballStacks));
    if (upgrades.soccerStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.SOCCERBALL, upgrades.soccerStacks));
    if (upgrades.siomaiShieldRounds > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.SIOMAI, upgrades.siomaiShieldRounds));
    if (upgrades.peUniformStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.PE_UNIFORM, upgrades.peUniformStacks));
    if (upgrades.throwSpeedStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.THROW_SPEED, upgrades.throwSpeedStacks));
    if (upgrades.projectileSpeedStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.PROJECTILE_SPEED, upgrades.projectileSpeedStacks));
    if (upgrades.movementSpeedStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.MOVEMENT_SPEED, upgrades.movementSpeedStacks));
    if (upgrades.dodgeChanceStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.DODGE_CHANCE, upgrades.dodgeChanceStacks));

    if (upgrades.coffeeRounds > 0) {
        rows.push(makePowerPanelRow(POWER_UP_TYPES.COFFEE, upgrades.coffeeRounds));
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

function drawBossRewardOverlay() {
    if (state.status !== "bossReward") return;

    const alpha = clamp(state.bossRewardTimer / BOSS_REWARD_OVERLAY_MS, 0, 1);

    ctx.save();
    ctx.fillStyle = `rgba(22, 101, 52, ${0.72 + alpha * 0.08})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(187, 247, 208, 0.72)";
    ctx.lineWidth = 10;
    ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);
    ctx.fillStyle = "#f0fdf4";
    ctx.font = "900 64px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BOSS CLEARED", canvas.width / 2, canvas.height / 2 - 42);
    ctx.fillStyle = "#dcfce7";
    ctx.font = "900 28px Poppins, sans-serif";
    ctx.fillText(`+${BOSS_REWARD_HEALTH} BASE HP  +${BOSS_REWARD_COINS} COINS`, canvas.width / 2, canvas.height / 2 + 34);
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
    if (hasSprite(sprites.coin)) {
        ctx.drawImage(sprites.coin, -coin.width, -coin.width, coin.width * 2, coin.width * 2);
        ctx.restore();
        return;
    }

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

function drawThrowBar() {
    const meterWidth = 48;
    const meterHeight = 6;
    const x = player.x + player.width / 2 - meterWidth / 2;
    const y = player.y + player.height + 8;
    const fill = 1 - clamp(state.throwCooldown / getThrowCooldown(), 0, 1);

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.46)";
    ctx.fillRect(x - 2, y - 2, meterWidth + 4, meterHeight + 4);
    ctx.fillStyle = fill >= 1 ? "#22c55e" : "#ffffff";
    ctx.fillRect(x, y, meterWidth * fill, meterHeight);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 2, y - 2, meterWidth + 4, meterHeight + 4);
    ctx.restore();
}

function draw() {
    drawCourt();
    state.students.forEach((student) => {
        drawEnemy(student);
        drawHealthBar(student);
        drawHeldPowerUp(student);
    });
    state.sidelineEnemies.forEach(drawEnemy);
    drawBossHealthBar();
    state.powerUps.forEach(drawPowerUp);
    state.coinsVisuals.forEach(drawCoin);
    state.playerBalls.forEach(drawBall);
    state.enemyBalls.forEach(drawBall);
    drawPlayerBarrier();
    drawPlayerPowerEffects();
    drawPlayer();
    drawPlayerHealthBar();
    drawCoffeeIndicator();
    drawParticles();
    drawThrowBar();
    drawRoundTransition();
    drawBossRewardOverlay();
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
        if (!event.repeat) {
            if (state.status === "paused") {
                togglePause();
            } else if (state.status === "card") {
                skipCardSelection();
            } else {
                throwPlayerBall();
            }
        }
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
        const reroll = event.target.closest("[data-reroll-slot]");
        if (reroll) {
            rerollShopSlot(Number(reroll.dataset.rerollSlot));
            return;
        }

        const card = event.target.closest("[data-power]");
        if (!card) return;

        buyShopCard(Number(card.dataset.slot));
    });
}
if (skipCardBtn) {
    skipCardBtn.addEventListener("click", () => {
        skipCardSelection();
    });
}

makeCourtMarks();
resetGame();
state.lastTime = performance.now();
requestAnimationFrame(loop);
