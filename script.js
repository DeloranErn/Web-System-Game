const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const levelText = document.getElementById("levelText");
const livesText = document.getElementById("livesText");
const cooldownText = document.getElementById("cooldownText");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayActions = document.getElementById("overlayActions");
const powerList = document.getElementById("powerList");
const characterPanel = document.getElementById("characterPanel");
const coinText = document.getElementById("coinText");
const cardOverlay = document.getElementById("cardOverlay");
const cardChoices = document.getElementById("cardChoices");
const cardCostText = document.getElementById("cardCostText");
const skipCardBtn = document.getElementById("skipCardBtn");
const menuOverlay = document.getElementById("menuOverlay");
const gameShell = document.getElementById("gameShell");
const loadingView = document.getElementById("loadingView");
const menuView = document.getElementById("menuView");
const storyView = document.getElementById("storyView");
const yellowSlipView = document.getElementById("yellowSlipView");
const yellowSlipTitle = document.getElementById("yellowSlipTitle");
const yellowSlipText = document.getElementById("yellowSlipText");
const yellowSlipBtn = document.getElementById("yellowSlipBtn");
const yellowSlipMessage = document.getElementById("yellowSlipMessage");
const skipStoryBtn = document.getElementById("skipStoryBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const mainMenuBtn = document.getElementById("mainMenuBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const fireBtn = document.getElementById("fireBtn");

// Add your own PNGs to these paths when you are ready.
// The *Throw images are optional one-frame throw poses.
const spriteSources = {
    classroom: "assets/classroom.png",
    field: "assets/field.png",
    player1: "assets/player1.png",
    player1Throw: "assets/player1-throw.png",
    player1Pe: "assets/player1-pe.png",
    player1PeThrow: "assets/player1-pe-throw.png",
    player: "assets/player.png",
    playerThrow: "assets/player-throw.png",
    playerPe: "assets/player-pe.png",
    playerPeThrow: "assets/player-pe-throw.png",
    player2: "assets/player2.png",
    player2Throw: "assets/player2-throw.png",
    player2Pe: "assets/player2-pe.png",
    player2PeThrow: "assets/player2-pe-throw.png",
    player3: "assets/player3.png",
    player3Throw: "assets/player3-throw.png",
    player3Pe: "assets/player3-pe.png",
    player3PeThrow: "assets/player3-pe-throw.png",
    companion: "assets/companion.png",
    companionThrow: "assets/companion-throw.png",
    enemyRed: "assets/student-red.png",
    enemyRedThrow: "assets/student-red-throw.png",
    enemyBlue: "assets/student-blue.png",
    enemyBlueThrow: "assets/student-blue-throw.png",
    teacher: "assets/teacher.png",
    teacherThrow: "assets/teacher-throw.png",
    teacherThrowMuzzle: "assets/teacher-throw-muzzle.png",
    ball: "assets/dodgeball.png",
    ball2: "assets/dodgeball2.png",
    dodgeball: "assets/player-dodgeball.png",
    dodgeballBuffIcon: "assets/dodgeball-buff-icon.png",
    volleyballBuffIcon: "assets/volleyball-buff-icon.png",
    soccerballBuffIcon: "assets/soccerball-buff-icon.png",
    siomaiRiceBuffIcon: "assets/siomairice-buff-icon.png",
    icedCoffeeBuffIcon: "assets/icedcoffee-buff-icon.png",
    peUniformBuffIcon: "assets/peuniform-buff-icon.png",
    throwSpeedBuffIcon: "assets/throwspeed-buff-icon.png",
    projectileSpeedBuffIcon: "assets/projectilespeed-buff-icon.png",
    movementSpeedBuffIcon: "assets/movespeed-buff-icon.png",
    playerDodgeBuffIcon: "assets/playerdodge-buff-icon.png",
    yellowSlipBuffIcon: "assets/yellow-slip-buff-icon.png",
    yellowSlipBase: "assets/yellow-slip-base.png",
    yellowSlipPassed: "assets/yellow-slip-passed.png",
    yellowSlipFailed: "assets/yellow-slip-failed.png",
    slowed: "assets/slowed.png",
    chalk: "assets/chalk.png",
    barrier: "assets/barrier.png",
    coin: "assets/coin.png",
    coinIcon: "assets/coin-icon.png",
    coffeeBeanIcon: "assets/coffee-bean-icon.png",
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
const BOSS_NAME = "Tung Tung Tung Sahur";
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
const TEACHER_THROW_ANIMATION_MS = 260;
const TEACHER_THROW_FRAME_MS = TEACHER_THROW_ANIMATION_MS / 2;
const FIELD_X = 85;
const FIELD_Y = 28;
const FIELD_WIDTH = canvas.width - FIELD_X * 2;
const FIELD_HEIGHT = canvas.height - FIELD_Y * 2;
const PLAYER_RENDER_SIZE = 54;
const ENEMY_RENDER_SIZE = PLAYER_RENDER_SIZE;
const TEACHER_RENDER_WIDTH = 118;
const TEACHER_RENDER_HEIGHT = 124;
const TEACHER_VERTICAL_SPEED_MULTIPLIER = 0.35;
const PLAYER_SLOW_MS = 2500;
const PLAYER_SLOW_STRENGTH = 0.70;
const YELLOW_SLIP_SIGN_REVEAL_MS = 720;
const COMPANION_THROW_INTERVAL_MS = 8000;
const COMPANION_BASE_HP = 7;
const COMPANION_DODGE_CHANCE = 0.30;
const UNLOCK_STORAGE_KEY = "stiDodgeballUnlocks";
const SHOP_REROLL_COST = 2;
const SHOP_NEW_BUFF_LIMIT = 3;
const FIRST_SHOP_FREE_CARD_LIMIT = 2;
const MAX_NEW_BUFF_STACKS = 4;
const MAX_BALL_BUFF_STACKS = 4;
const MAX_SOCCERBALL_BUFF_STACKS = 2;
const POWER_UP_TYPES = {
    SIOMAI: "siomaiRice",
    COFFEE: "icedCoffee",
    DODGEBALL: "dodgeball",
    VOLLEYBALL: "volleyball",
    SOCCERBALL: "soccerball",
    PE_UNIFORM: "peUniform",
    YELLOW_SLIP: "yellowSlip",
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

const SHOP_POWER_WEIGHTS = {
    [POWER_UP_TYPES.DODGEBALL]: 1.05,
    [POWER_UP_TYPES.VOLLEYBALL]: 1.05,
    [POWER_UP_TYPES.SOCCERBALL]: 0.90
};

const SHOP_NEW_POWER_TYPES = [
    POWER_UP_TYPES.THROW_SPEED,
    POWER_UP_TYPES.PROJECTILE_SPEED,
    POWER_UP_TYPES.MOVEMENT_SPEED,
    POWER_UP_TYPES.DODGE_CHANCE
];

const SHOP_MIXED_POWER_TYPES = [
    ...BALL_POWER_TYPES,
    ...SHOP_NEW_POWER_TYPES,
    POWER_UP_TYPES.PE_UNIFORM,
    POWER_UP_TYPES.YELLOW_SLIP
];

const sprites = {};
const spriteShadowAnchors = new WeakMap();

Object.entries(spriteSources).forEach(([name, src]) => {
    const image = new Image();
    image.src = src;
    sprites[name] = image;
});

function loadUnlocks() {
    const defaults = {
        companion: false,
        yellowSlip: false,
        player2: false,
        bossDamagePlus2: false,
        player3: false
    };

    try {
        return {
            ...defaults,
            ...JSON.parse(localStorage.getItem(UNLOCK_STORAGE_KEY) || "{}")
        };
    } catch {
        return defaults;
    }
}

function saveUnlocks() {
    localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(state.unlocks));
}

function getCharacterConfig(characterId) {
    const configs = {
        player1: {
            id: "player1",
            name: "Khal Bo",
            unlocked: true,
            base: "player1",
            throw: "player1Throw",
            pe: "player1Pe",
            peThrow: "player1PeThrow",
            shirt: "#2563eb",
            statMultiplier: 1,
            baseHpBonus: 0
        },
        player2: {
            id: "player2",
            name: "Lebron Games",
            unlocked: state.unlocks.player2,
            base: "player2",
            throw: "player2Throw",
            pe: "player2Pe",
            peThrow: "player2PeThrow",
            shirt: "#0f766e",
            statMultiplier: 1.03,
            baseHpBonus: 1,
            starterPowerUps: [POWER_UP_TYPES.VOLLEYBALL, POWER_UP_TYPES.COFFEE]
        },
        player3: {
            id: "player3",
            name: "Satire O. Gojo",
            unlocked: state.unlocks.player3,
            base: "player3",
            throw: "player3Throw",
            pe: "player3Pe",
            peThrow: "player3PeThrow",
            shirt: "#7c3aed",
            statMultiplier: 1.05,
            baseHpBonus: 2,
            starterPowerUps: [POWER_UP_TYPES.DODGEBALL, POWER_UP_TYPES.COFFEE]
        }
    };

    return configs[characterId] || configs.player1;
}

function getCharacterStatMultiplier() {
    return getCharacterConfig(state.selectedCharacter).statMultiplier || 1;
}

function getCharacterStatText(character, statBonus = Math.round(((character.statMultiplier || 1) - 1) * 100)) {
    if (character.id === "player1") return `Base: ${BASE_PLAYER_HEALTH}HP`;
    return `${BASE_PLAYER_HEALTH + (character.baseHpBonus || 0)} HP${statBonus > 0 ? ` / +${statBonus}% stats` : ""}`;
}

function getCharacterStatBullets(character, statBonus = Math.round(((character.statMultiplier || 1) - 1) * 100)) {
    const bullets = [];

    if (character.id === "player1") {
        bullets.push(`Base: ${BASE_PLAYER_HEALTH}HP`);
    } else {
        bullets.push(`${BASE_PLAYER_HEALTH + (character.baseHpBonus || 0)} HP`);
        if (statBonus > 0) bullets.push(`${statBonus}% stats`);
    }

    if (character.starterPowerUps?.length) {
        character.starterPowerUps.forEach((type) => bullets.push(getPowerUpName(type)));
    } else {
        bullets.push("Base kit");
    }

    return bullets;
}

function getCharacterStatBulletMarkup(character, className = "character-bullets") {
    return `
        <ul class="${className}">
            ${getCharacterStatBullets(character).map((bullet) => `<li>+ ${bullet}</li>`).join("")}
        </ul>
    `;
}

function applyCharacterStarterUpgrades() {
    const character = getCharacterConfig(state.selectedCharacter);
    (character.starterPowerUps || []).forEach((type) => {
        if (type === POWER_UP_TYPES.COFFEE) {
            state.playerUpgrades.coffeeRounds = 2;
        }
        if (type === POWER_UP_TYPES.VOLLEYBALL) {
            state.playerUpgrades.volleyballBounce = true;
            state.playerUpgrades.volleyballStacks = Math.max(1, state.playerUpgrades.volleyballStacks);
            state.playerUpgrades.latestBallColor = "#facc15";
        }
        if (type === POWER_UP_TYPES.DODGEBALL) {
            state.playerUpgrades.dodgeballStacks = Math.max(1, state.playerUpgrades.dodgeballStacks);
            state.playerUpgrades.latestBallColor = "#dc2626";
        }
    });
}

const state = {
    status: "loading",
    gameMode: "endless",
    menuPhase: "home",
    selectedMode: "endless",
    adventureDifficulty: "easy",
    selectedCharacter: "player1",
    unlocks: loadUnlocks(),
    score: 0,
    coins: 0,
    round: 1,
    baseHealth: BASE_PLAYER_HEALTH,
    health: BASE_PLAYER_HEALTH,
    lastTime: 0,
    throwCooldown: 0,
    playerSlowTimer: 0,
    bossChalkTimer: BOSS_CHALK_ATTACK_MS,
    bossChalkShots: 0,
    bossChalkShotTimer: 0,
    yellowSlipPassed: false,
    yellowSlipPhase: "idle",
    yellowSlipReason: "",
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
    companion: null,
    particles: [],
    floatTexts: [],
    shopCards: [],
    shopRerolledSlots: [],
    shopBoughtBall: false,
    shopBoughtCards: 0,
    shopBoughtNewBuffs: 0,
    playerUpgrades: {
        latestBallColor: "#f97316",
        dodgeballStacks: 0,
        volleyballBounce: false,
        volleyballStacks: 0,
        soccerStacks: 0,
        coffeeRounds: 0,
        peUniformStacks: 0,
        yellowSlipStacks: 0,
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
    x: canvas.width / 2 - PLAYER_RENDER_SIZE / 2,
    y: canvas.height - 106,
    width: PLAYER_RENDER_SIZE,
    height: PLAYER_RENDER_SIZE,
    hitboxPad: -7,
    speed: 289,
    throwPose: 0
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function hasSprite(image) {
    return image && image.complete && image.naturalWidth > 0;
}

function firstLoadedSprite(...names) {
    for (const name of names) {
        if (hasSprite(sprites[name])) return sprites[name];
    }
    return null;
}

function getSpriteRightFootAnchor(sprite) {
    if (spriteShadowAnchors.has(sprite)) return spriteShadowAnchors.get(sprite);

    const fallback = { xRatio: 0.36, yRatio: 0.96 };

    try {
        const width = sprite.naturalWidth;
        const height = sprite.naturalHeight;
        const offscreen = document.createElement("canvas");
        offscreen.width = width;
        offscreen.height = height;
        const offscreenCtx = offscreen.getContext("2d");
        offscreenCtx.drawImage(sprite, 0, 0);
        const pixels = offscreenCtx.getImageData(0, 0, width, height).data;
        const footScanY = Math.floor(height * 0.64);
        let bottomY = -1;

        for (let y = footScanY; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = pixels[(y * width + x) * 4 + 3];
                if (alpha > 24) bottomY = y;
            }
        }

        if (bottomY < 0) {
            spriteShadowAnchors.set(sprite, fallback);
            return fallback;
        }

        const bandTop = Math.max(footScanY, bottomY - Math.max(2, Math.ceil(height * 0.14)));
        let footX = width;
        let weightedX = 0;
        let pixelCount = 0;

        for (let y = bandTop; y <= bottomY; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = pixels[(y * width + x) * 4 + 3];
                if (alpha > 24) {
                    footX = Math.min(footX, x);
                    weightedX += x;
                    pixelCount++;
                }
            }
        }

        const averageX = pixelCount ? weightedX / pixelCount : width * fallback.xRatio;
        const anchorX = footX < width ? (footX * 0.68 + averageX * 0.32) : width * fallback.xRatio;
        const anchor = {
            xRatio: clamp(anchorX / width, 0.14, 0.54),
            yRatio: clamp(bottomY / height, 0.84, 0.995)
        };
        spriteShadowAnchors.set(sprite, anchor);
        return anchor;
    } catch {
        spriteShadowAnchors.set(sprite, fallback);
        return fallback;
    }
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

function canStudentDodge(student) {
    const playLeft = 85;
    const playRight = canvas.width - 85;
    const safeMargin = (playRight - playLeft) * 0.15;
    const centerX = student.x + student.width / 2;
    return centerX > playLeft + safeMargin && centerX < playRight - safeMargin;
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

function getAdventureLimit() {
    return state.adventureDifficulty === "hard" ? 30 : 20;
}

function getModeLabel() {
    if (state.gameMode !== "adventure") return "Endless";
    return state.adventureDifficulty === "hard" ? "Adventure Hard" : "Adventure Easy";
}

function isAdventureComplete() {
    return state.gameMode === "adventure" && state.completedLevels >= getAdventureLimit();
}

function getAvailableShopPoolForSlot(slotIndex) {
    return getShopPoolForSlot(slotIndex).filter((type) => {
        if (type === POWER_UP_TYPES.YELLOW_SLIP) return state.unlocks.yellowSlip;
        return true;
    });
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
    const characterMultiplier = getCharacterStatMultiplier();
    const coffeeBonus = state.playerUpgrades.coffeeRounds > 0 ? 1.15 : 1;
    const uniformBonus = 1 + state.playerUpgrades.peUniformStacks * 0.15;
    const speedBonus = 1 + state.playerUpgrades.movementSpeedStacks * 0.06;
    const slowPenalty = state.playerSlowTimer > 0
        ? 1 - PLAYER_SLOW_STRENGTH * clamp(state.playerSlowTimer / PLAYER_SLOW_MS, 0, 1)
        : 1;
    return player.speed * characterMultiplier * coffeeBonus * uniformBonus * speedBonus * slowPenalty;
}

function getThrowCooldown() {
    const characterMultiplier = getCharacterStatMultiplier();
    const baseCooldown = Math.max(900, 1600 - state.round * 90);
    const coffeeMultiplier = state.playerUpgrades.coffeeRounds > 0 ? 0.70 : 1;
    const uniformMultiplier = 1 / (1 + state.playerUpgrades.peUniformStacks * 0.15);
    const agilityMultiplier = Math.max(0.55, 1 - state.playerUpgrades.throwSpeedStacks * 0.07);
    const ballStacks = state.playerUpgrades.dodgeballStacks +
        state.playerUpgrades.volleyballStacks +
        state.playerUpgrades.soccerStacks;
    const lateBallBurden = state.round >= 25 ? ballStacks * 0.03 : 0;
    const ballBurdenMultiplier = 1 +
        (state.playerUpgrades.dodgeballStacks + state.playerUpgrades.soccerStacks) * 0.05 +
        lateBallBurden;
    return baseCooldown * coffeeMultiplier * uniformMultiplier * agilityMultiplier * ballBurdenMultiplier / characterMultiplier;
}

function getPlayerProjectileSpeed() {
    const characterMultiplier = getCharacterStatMultiplier();
    const speedBonus = 1 + state.playerUpgrades.projectileSpeedStacks * 0.08;
    const ballBurdenPenalty = Math.max(0.55, 1 - (state.playerUpgrades.dodgeballStacks + state.playerUpgrades.soccerStacks) * 0.05);
    return 520 * characterMultiplier * speedBonus * ballBurdenPenalty;
}

function getPlayerProjectileDodgeChance() {
    const characterDodgeBonus = getCharacterStatMultiplier() - 1;
    return Math.min(0.65, characterDodgeBonus + state.playerUpgrades.dodgeChanceStacks * 0.07);
}

function getTeacherHp() {
    const bossNumber = Math.floor(state.round / 5);
    const listedHp = TEACHER_HP_BY_APPEARANCE[bossNumber - 1];
    const endlessBonus = state.gameMode === "endless" && state.round >= 25 ? 5 : 0;

    if (listedHp) return listedHp + 6 + endlessBonus;

    const lastListedHp = TEACHER_HP_BY_APPEARANCE[TEACHER_HP_BY_APPEARANCE.length - 1];
    return lastListedHp + 6 + endlessBonus + (bossNumber - TEACHER_HP_BY_APPEARANCE.length) * 4;
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
    if (type === POWER_UP_TYPES.YELLOW_SLIP) return state.unlocks.yellowSlip && state.playerUpgrades.yellowSlipStacks < 1;
    if (type === POWER_UP_TYPES.THROW_SPEED) return state.playerUpgrades.throwSpeedStacks < MAX_NEW_BUFF_STACKS;
    if (type === POWER_UP_TYPES.PROJECTILE_SPEED) return state.playerUpgrades.projectileSpeedStacks < MAX_NEW_BUFF_STACKS;
    if (type === POWER_UP_TYPES.MOVEMENT_SPEED) return state.playerUpgrades.movementSpeedStacks < MAX_NEW_BUFF_STACKS;
    if (type === POWER_UP_TYPES.DODGE_CHANCE) return state.playerUpgrades.dodgeChanceStacks < MAX_NEW_BUFF_STACKS;
    if (type === POWER_UP_TYPES.DODGEBALL) return state.playerUpgrades.dodgeballStacks < MAX_BALL_BUFF_STACKS;
    if (type === POWER_UP_TYPES.VOLLEYBALL) return state.playerUpgrades.volleyballStacks < MAX_BALL_BUFF_STACKS;
    if (type === POWER_UP_TYPES.SOCCERBALL) return state.playerUpgrades.soccerStacks < MAX_SOCCERBALL_BUFF_STACKS;
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
    let pool = getAvailableShopPoolForSlot(slotIndex).filter((type) => type !== currentType && canApplyPowerUp(type));
    if (!pool.length) pool = getAvailableShopPoolForSlot(slotIndex).filter((type) => type !== currentType);
    return pickWeightedShopPower(pool);
}

function pickWeightedShopPower(pool) {
    const totalWeight = pool.reduce((total, type) => total + (SHOP_POWER_WEIGHTS[type] || 1), 0);
    let roll = Math.random() * totalWeight;

    for (const type of pool) {
        roll -= SHOP_POWER_WEIGHTS[type] || 1;
        if (roll <= 0) return type;
    }

    return pool[pool.length - 1];
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

    if (type === POWER_UP_TYPES.YELLOW_SLIP) {
        state.playerUpgrades.yellowSlipStacks = 1;
        burst(player.x + player.width / 2, player.y + player.height / 2, "#facc15");
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
            description: "Adds a delayed follow-up ball. Max 2."
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
    if (type === POWER_UP_TYPES.YELLOW_SLIP) {
        return {
            title: "Yellow Slip",
            description: "50% revive on knockout."
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
    hideOverlay();
    hideMenuOverlay();
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
    state.shopBoughtCards = 0;
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
    if (state.cardSelectionsShown === 1 && state.shopBoughtCards >= FIRST_SHOP_FREE_CARD_LIMIT) return false;
    if (isBallShopPower(card.type) && state.shopBoughtBall) return false;
    if (isNewShopPower(card.type) && state.shopBoughtNewBuffs >= SHOP_NEW_BUFF_LIMIT) return false;
    return true;
}

function renderShopCards() {
    if (!cardChoices) return;

    const rerollCost = getRerollCost();
    if (cardCostText) {
        cardCostText.textContent = state.cardSelectionsShown === 1
            ? `First shop: pick ${FIRST_SHOP_FREE_CARD_LIMIT} free cards max | Coins: ${state.coins}`
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
                <button class="upgrade-card ${card.type === POWER_UP_TYPES.YELLOW_SLIP ? "yellow-slip-card" : ""}" data-power="${card.type}" data-slot="${slotIndex}" type="button" ${disabled ? "disabled" : ""}>
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
    state.shopBoughtCards++;
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
            width: ENEMY_RENDER_SIZE,
            height: ENEMY_RENDER_SIZE,
            hitboxPad: 0,
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
            directionChangeTimer: 700 + Math.random() * 1200,
            throwTimer: getEnemyPersonalThrowInterval(count) * (0.35 + Math.random() * 0.65),
            stunned: 0,
            invulnTimer: 0,
            active: true
        });
    }

    if (isBossRound()) {
        const hp = getTeacherHp();
        state.students.push({
            x: canvas.width / 2 - TEACHER_RENDER_WIDTH / 2,
            y: 38,
            width: TEACHER_RENDER_WIDTH,
            height: TEACHER_RENDER_HEIGHT,
            hitboxPad: 14,
            direction: 1,
            verticalDirection: Math.random() < 0.5 ? -1 : 1,
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
            x: side === "left" ? 22 : canvas.width - 22 - ENEMY_RENDER_SIZE,
            y: sideTop + ((index * 85) % Math.max(1, sideBottom - sideTop - ENEMY_RENDER_SIZE)),
            width: ENEMY_RENDER_SIZE,
            height: ENEMY_RENDER_SIZE,
            hitboxPad: 0,
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

function showOverlay(title, text, actions = []) {
    hideMenuOverlay();
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    if (overlayActions) {
        overlayActions.innerHTML = actions.map((action) => `
            <button class="arcade-btn ${action.className}" data-overlay-action="${action.action}" type="button">${action.label}</button>
        `).join("");
        overlayActions.classList.toggle("hidden", actions.length === 0);
        overlayActions.classList.toggle("flex", actions.length > 0);
    }
}

function hideOverlay() {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
    if (overlayActions) {
        overlayActions.innerHTML = "";
        overlayActions.classList.add("hidden");
        overlayActions.classList.remove("flex");
    }
}

function showMenuOverlay() {
    if (!menuOverlay) return;
    menuOverlay.classList.remove("hidden");
    menuOverlay.classList.add("flex");
    if (gameShell) gameShell.classList.add("menu-active");
}

function showMenuScreen() {
    state.status = "menu";
    state.menuPhase = "home";
    hideOverlay();
    hideCardChoices();
    showMenuOverlay();
    if (loadingView) loadingView.classList.add("hidden");
    if (storyView) storyView.classList.add("hidden");
    if (yellowSlipView) yellowSlipView.classList.add("hidden");
    if (menuView) menuView.classList.remove("hidden");
    renderModeMenu();
}

function hideMenuOverlay() {
    if (!menuOverlay) return;
    menuOverlay.classList.add("hidden");
    menuOverlay.classList.remove("flex");
    if (gameShell) gameShell.classList.remove("menu-active");
}

function showLoadingScreen() {
    state.status = "loading";
    hideOverlay();
    hideCardChoices();
    showMenuOverlay();
    if (loadingView) loadingView.classList.remove("hidden");
    if (menuView) menuView.classList.add("hidden");
    if (storyView) storyView.classList.add("hidden");
    if (yellowSlipView) yellowSlipView.classList.add("hidden");
    setTimeout(showMenuScreen, 900);
}

function renderModeMenu() {
    if (!menuView) return;

    if (state.menuPhase === "home") {
        menuView.innerHTML = `
            <div class="main-menu-panel text-center">
                <p class="text-sm font-black uppercase tracking-[0.28em] text-emerald-300">Main Menu</p>
                <h2 class="mt-2 text-4xl font-black uppercase text-white sm:text-6xl">STI Dodgeball</h2>
                <div class="mt-8 grid gap-3 sm:grid-cols-3">
                    <button class="menu-card selected" data-menu-action="level-selection" type="button">
                        <span>Level Selection</span>
                        <small>Pick Endless or Adventure and start the match.</small>
                    </button>
                    <button class="menu-card" data-menu-action="characters" type="button">
                        <span>Characters</span>
                        <small>View stats and choose your player.</small>
                    </button>
                    <button class="menu-card" data-menu-action="credits" type="button">
                        <span>Credits</span>
                        <small>Placeholder credits page.</small>
                    </button>
                </div>
            </div>
        `;
        return;
    }

    if (state.menuPhase === "mode") {
        menuView.innerHTML = `
            <p class="text-sm font-black uppercase tracking-[0.28em] text-emerald-300">Level Selection</p>
            <h2 class="mt-2 text-4xl font-black uppercase text-white sm:text-6xl">Choose Run</h2>
            <p class="mt-2 text-sm font-black uppercase tracking-wide text-slate-200">Character: ${getCharacterConfig(state.selectedCharacter).name}</p>
            <div class="mt-6 grid gap-3 sm:grid-cols-3">
                <button class="menu-card ${state.selectedMode === "endless" ? "selected" : ""}" data-mode="endless" type="button">
                    <span>Endless Mode</span>
                    <small>No level cap. Current full game loop.</small>
                </button>
                <button class="menu-card ${state.selectedMode === "adventure" && state.adventureDifficulty === "easy" ? "selected" : ""}" data-mode="adventure" data-difficulty="easy" type="button">
                    <span>Adventure Easy</span>
                    <small>Story run to level 20.</small>
                </button>
                <button class="menu-card ${state.selectedMode === "adventure" && state.adventureDifficulty === "hard" ? "selected" : ""}" data-mode="adventure" data-difficulty="hard" type="button">
                    <span>Adventure Hard</span>
                    <small>Story run to level 30.</small>
                </button>
            </div>
            <div class="mt-6 flex flex-wrap gap-3">
                <button class="arcade-btn bg-emerald-500 text-slate-950 hover:bg-emerald-300" data-menu-action="start-run" type="button">Start Run</button>
                <button class="arcade-btn bg-slate-100 text-slate-950 hover:bg-white" data-menu-action="home" type="button">Back</button>
            </div>
        `;
        return;
    }

    if (state.menuPhase === "credits") {
        menuView.innerHTML = `
            <div class="text-center">
                <p class="text-sm font-black uppercase tracking-[0.28em] text-emerald-300">Credits</p>
                <h2 class="mt-2 text-4xl font-black uppercase text-white sm:text-6xl">Coming Soon</h2>
                <div class="story-scene mt-6">
                    <p>Credits placeholder. Add names, art notes, music, and special thanks here.</p>
                </div>
                <button class="arcade-btn mt-6 bg-slate-100 text-slate-950 hover:bg-white" data-menu-action="home" type="button">Back</button>
            </div>
        `;
        return;
    }

    menuView.innerHTML = `
        <p class="text-sm font-black uppercase tracking-[0.28em] text-emerald-300">Characters</p>
        <h2 class="mt-2 text-4xl font-black uppercase text-white sm:text-6xl">View Stats</h2>
        <div class="mt-6 grid gap-3 sm:grid-cols-3">
            ${["player1", "player2", "player3"].map((characterId) => {
                const config = getCharacterConfig(characterId);
                const selected = state.selectedCharacter === characterId;
                const source = spriteSources[config.base] || spriteSources.player1;
                return `
                    <button class="character-choice ${selected ? "selected" : ""}" data-character="${characterId}" type="button" ${config.unlocked ? "" : "disabled"}>
                        <span class="character-choice-portrait sprite-icon">
                            <img src="${source}" alt="${config.name}" onerror="this.style.display='none'">
                        </span>
                        <span>${config.name}</span>
                        ${config.unlocked ? getCharacterStatBulletMarkup(config, "character-choice-stats") : "<small>Unlock in Adventure</small>"}
                    </button>
                `;
            }).join("")}
        </div>
        <div class="mt-6 flex flex-wrap gap-3">
            <button class="arcade-btn bg-amber-300 text-slate-950 hover:bg-amber-200" data-menu-action="level-selection" type="button">Level Selection</button>
            <button class="arcade-btn bg-slate-100 text-slate-950 hover:bg-white" data-menu-action="home" type="button">Back</button>
        </div>
    `;
}

function selectMode(mode, difficulty = "easy") {
    state.selectedMode = mode;
    state.adventureDifficulty = difficulty;
    renderModeMenu();
}

function showStoryScreen() {
    hideOverlay();
    hideCardChoices();
    showMenuOverlay();
    if (loadingView) loadingView.classList.add("hidden");
    if (menuView) menuView.classList.add("hidden");
    if (yellowSlipView) yellowSlipView.classList.add("hidden");
    if (storyView) storyView.classList.remove("hidden");
    state.status = "story";
}

function startSelectedRun() {
    state.gameMode = state.selectedMode;
    if (state.gameMode === "adventure" && state.status !== "story") {
        showStoryScreen();
        return;
    }
    resetGame();
    startRoundTransition();
    state.lastTime = performance.now();
    hideOverlay();
    hideMenuOverlay();
}

function resetGame() {
    const character = getCharacterConfig(state.selectedCharacter);
    state.status = "ready";
    state.score = 0;
    state.coins = 0;
    state.round = 1;
    state.baseHealth = BASE_PLAYER_HEALTH + (character.baseHpBonus || 0);
    state.health = state.baseHealth;
    state.throwCooldown = 0;
    state.playerSlowTimer = 0;
    state.bossChalkTimer = BOSS_CHALK_ATTACK_MS;
    state.bossChalkShots = 0;
    state.bossChalkShotTimer = 0;
    state.yellowSlipPassed = false;
    state.yellowSlipPhase = "idle";
    state.yellowSlipReason = "";
    state.transitionTimer = 0;
    state.transitionBoss = false;
    state.bossRewardTimer = 0;
    state.completedLevels = 0;
    state.cardSelectionsShown = 0;
    state.playerBalls = [];
    state.enemyBalls = [];
    state.coinsVisuals = [];
    state.powerUps = [];
    state.students = [];
    state.sidelineEnemies = [];
    state.companion = null;
    state.particles = [];
    state.floatTexts = [];
    state.shopCards = [];
    state.shopRerolledSlots = [];
    state.shopBoughtBall = false;
    state.shopBoughtCards = 0;
    state.shopBoughtNewBuffs = 0;
    state.playerUpgrades = {
        latestBallColor: "#f97316",
        dodgeballStacks: 0,
        volleyballBounce: false,
        volleyballStacks: 0,
        soccerStacks: 0,
        coffeeRounds: 0,
        peUniformStacks: 0,
        yellowSlipStacks: 0,
        siomaiShieldRounds: 0,
        throwSpeedStacks: 0,
        projectileSpeedStacks: 0,
        movementSpeedStacks: 0,
        dodgeChanceStacks: 0
    };
    applyCharacterStarterUpgrades();
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 106;
    createStudents();
    createCompanion();
    syncHud();
    showOverlay(`${getModeLabel()} Ready`, "Move with WASD or arrows. Throw dodgeballs with Space when the cooldown is ready.");
    hideCardChoices();
    updatePowerPanel();
    updateCharacterPanel();
}

function startGame() {
    if (state.status === "loading") return;

    if (state.status === "menu") {
        state.menuPhase = "mode";
        renderModeMenu();
        return;
    }

    if (state.status === "story") {
        startSelectedRun();
        return;
    }

    if (state.status === "gameover" || state.status === "ready") {
        startSelectedRun();
    }
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

function createCompanion() {
    if (!state.unlocks.companion) {
        state.companion = null;
        return;
    }

    state.companion = {
        x: player.x - 78,
        y: player.y + 8,
        width: PLAYER_RENDER_SIZE,
        height: PLAYER_RENDER_SIZE,
        hitboxPad: -7,
        hp: COMPANION_BASE_HP,
        maxHp: COMPANION_BASE_HP,
        speed: 150,
        throwTimer: COMPANION_THROW_INTERVAL_MS * 0.65,
        moveTimer: 0,
        moveX: 0,
        moveY: 0,
        throwPose: 0,
        active: true
    };
}

function fireCompanionBall() {
    const companion = state.companion;
    if (!companion || !companion.active) return;

    const target = state.students.find((student) => student.active);
    if (!target) return;

    const originX = companion.x + companion.width / 2;
    const originY = companion.y + 8;
    const targetX = target.x + target.width / 2;
    const targetY = target.y + target.height / 2;
    const angle = Math.atan2(targetY - originY, targetX - originX);
    const speed = 470;

    state.playerBalls.push({
        x: originX,
        y: originY,
        radius: 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        spin: 0,
        owner: "player",
        powerUpType: POWER_UP_TYPES.DODGEBALL,
        bouncesLeft: 0,
        color: "#dc2626",
        spawnDelay: 0
    });
    companion.throwPose = 230;
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

function floatText(x, y, text, color) {
    state.floatTexts.push({
        x,
        y,
        text,
        color,
        life: 720
    });
}

function showTagged(entity) {
    floatText(entity.x + entity.width / 2, entity.y - 8, "TAGGED", "#ef4444");
}

function showDodged(entity) {
    floatText(entity.x + entity.width / 2, entity.y - 8, "DODGED", "#38bdf8");
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

function clearPlayerDanger(resetPosition = false) {
    state.enemyBalls = [];
    if (resetPosition) {
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - 106;
    }
    state.students.forEach((student) => {
        if (student.swarming) {
            student.swarming = false;
            student.laps = 0;
        }
    });
}

function getYellowSlipPaperMarkup(spriteName) {
    const source = spriteSources[spriteName];
    if (!source) return "";
    return `<img class="yellow-slip-paper" src="${source}" alt="Yellow Slip" onerror="this.style.display='none'">`;
}

function showYellowSlipScreen(phase, reasonTitle, effect = "") {
    hideOverlay();
    hideCardChoices();
    showMenuOverlay();
    if (loadingView) loadingView.classList.add("hidden");
    if (menuView) menuView.classList.add("hidden");
    if (storyView) storyView.classList.add("hidden");
    if (yellowSlipView) yellowSlipView.classList.remove("hidden");

    const signed = phase === "sign" || phase === "signing";
    const passed = phase === "passed";
    const failed = phase === "failed";
    const signing = phase === "signing";
    const spriteName = signed ? "yellowSlipBase" : passed ? "yellowSlipPassed" : "yellowSlipFailed";
    const resultClass = passed ? "passed" : failed ? "failed" : "";
    const paperClass = signing ? "is-signing" : effect === "reveal" ? "is-revealing" : "";

    if (yellowSlipTitle) {
        yellowSlipTitle.textContent = signing ? "Signing Yellow Slip" : signed ? "Sign Yellow Slip" : passed ? "Passed Yellow Slip" : "Failed Yellow Slip";
    }
    if (yellowSlipText) {
        yellowSlipText.innerHTML = `
            <div class="yellow-slip-stage ${resultClass}">
                <span class="yellow-slip-burst" aria-hidden="true"></span>
                <span class="yellow-slip-paper-wrap ${paperClass}">
                    ${getYellowSlipPaperMarkup(spriteName)}
                </span>
            </div>
        `;
    }
    if (yellowSlipMessage) {
        yellowSlipMessage.textContent = signing
            ? "Signing..."
            : signed
                ? `${reasonTitle}. Sign the Yellow Slip.`
                : passed
                    ? "Passed Yellow Slip. Continue the run."
                    : "Failed Yellow Slip. You failed the exam.";
    }
    if (yellowSlipBtn) {
        yellowSlipBtn.textContent = signing ? "Signing..." : signed ? "Sign Yellow Slip" : passed ? "Continue" : "Main Menu";
        yellowSlipBtn.disabled = signing;
    }
}

function showYellowSlipResult(passed) {
    state.yellowSlipPassed = passed;
    state.yellowSlipPhase = passed ? "passed" : "failed";
    showYellowSlipScreen(state.yellowSlipPhase, state.yellowSlipReason, "reveal");
}

function tryYellowSlip(reasonTitle) {
    if (!state.unlocks.yellowSlip || state.playerUpgrades.yellowSlipStacks <= 0) return false;

    state.playerUpgrades.yellowSlipStacks = 0;
    state.status = "yellowSlip";
    state.yellowSlipPassed = false;
    state.yellowSlipPhase = "sign";
    state.yellowSlipReason = reasonTitle;
    showYellowSlipScreen("sign", reasonTitle);
    updatePowerPanel();
    syncHud();
    return true;
}

function finishKnockout(title, text) {
    if (tryYellowSlip(title)) return;
    state.status = "gameover";
    showOverlay(title, text, [
        { action: "main-menu", label: "Main Menu", className: "bg-slate-100 text-slate-950 hover:bg-white" },
        { action: "new-run", label: "New Run", className: "bg-emerald-500 text-slate-950 hover:bg-emerald-300" }
    ]);
}

function loseHealth() {
    showTagged(player);
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
        finishKnockout("Knocked Out", `Final score: ${state.score}. Press Start for a rematch.`);
        return;
    }

    clearPlayerDanger();
}

function unlockAdventureMilestone(level) {
    let message = "";
    if (level === 10 && !state.unlocks.companion) {
        state.unlocks.companion = true;
        message = "Companion unlocked for future runs.";
    }
    if (level === 15 && !state.unlocks.yellowSlip) {
        state.unlocks.yellowSlip = true;
        message = "Yellow Slip added to the shop.";
    }
    if (level === 20 && !state.unlocks.player2) {
        state.unlocks.player2 = true;
        message = "Lebron Games unlocked.";
    }
    if (level === 25 && !state.unlocks.bossDamagePlus2) {
        state.unlocks.bossDamagePlus2 = true;
        message = "Boss damage permanently increased by 2.";
    }
    if (level === 30 && !state.unlocks.player3) {
        state.unlocks.player3 = true;
        message = "Satire O. Gojo unlocked.";
    }

    if (message) {
        saveUnlocks();
        floatText(canvas.width / 2, canvas.height / 2 - 90, `LEVEL ${level}: ${message}`, "#facc15");
    }
}

function finishAdventure() {
    state.status = "gameover";
    showOverlay("Adventure Cleared", `${getModeLabel()} complete. Unlocks are ready for Endless Mode.`);
}

function nextRound() {
    const clearedBoss = isBossRound();
    state.completedLevels++;
    if (state.gameMode === "adventure") {
        unlockAdventureMilestone(state.completedLevels);
        if (isAdventureComplete()) {
            finishAdventure();
            return;
        }
    }
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
    if (!state.companion && state.unlocks.companion) createCompanion();
    syncHud();
    updatePowerPanel();

    if (clearedBoss) {
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

    state.floatTexts.forEach((item) => {
        item.y -= deltaSeconds * 34;
        item.life -= deltaMs;
    });
    state.floatTexts = state.floatTexts.filter((item) => item.life > 0);

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

    state.playerSlowTimer = Math.max(0, state.playerSlowTimer - deltaMs);

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

        if (student.type === "teacher") {
            const teacherTop = FIELD_Y + 10;
            const teacherBottom = FIELD_Y + 150;
            student.x += student.direction * student.speed * deltaSeconds;
            student.y += student.verticalDirection * student.speed * TEACHER_VERTICAL_SPEED_MULTIPLIER * deltaSeconds;

            if (student.x <= FIELD_X) {
                student.x = FIELD_X;
                student.direction = 1;
            } else if (student.x + student.width >= canvas.width - FIELD_X) {
                student.x = canvas.width - FIELD_X - student.width;
                student.direction = -1;
            }

            if (student.y <= teacherTop) {
                student.y = teacherTop;
                student.verticalDirection = 1;
            } else if (student.y >= teacherBottom) {
                student.y = teacherBottom;
                student.verticalDirection = -1;
            }
            return;
        }

        student.directionChangeTimer -= deltaMs;
        if (student.type === "student" && student.directionChangeTimer <= 0) {
            if (Math.random() < 0.38) {
                student.direction *= -1;
            }
            student.directionChangeTimer = 650 + Math.random() * 1400;
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

    const companion = state.companion;
    if (companion && companion.active) {
        companion.throwPose = Math.max(0, companion.throwPose - deltaMs);
        companion.throwTimer -= deltaMs;
        companion.moveTimer -= deltaMs;

        if (companion.moveTimer <= 0) {
            companion.moveX = Math.random() * 2 - 1;
            companion.moveY = Math.random() * 2 - 1;
            companion.moveTimer = 620 + Math.random() * 900;
        }

        companion.x += companion.moveX * companion.speed * deltaSeconds;
        companion.y += companion.moveY * companion.speed * deltaSeconds;
        companion.x = clamp(companion.x, 85, canvas.width - companion.width - 85);
        companion.y = clamp(companion.y, canvas.height * 0.52, canvas.height - companion.height - 32);

        if (companion.throwTimer <= 0) {
            fireCompanionBall();
            companion.throwTimer = COMPANION_THROW_INTERVAL_MS;
        }
    }

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

        if (hit.type === "student" && canStudentDodge(hit) && Math.random() < getStudentDodgeChance()) {
            hit.invulnTimer = 220;
            const playLeft = 85;
            const playRight = canvas.width - 85;
            const safeMargin = (playRight - playLeft) * 0.15;
            hit.x = clamp(hit.x + hit.direction * 72, playLeft + safeMargin, playRight - safeMargin - hit.width);
            burst(hit.x + hit.width / 2, hit.y + hit.height / 2, "#94a3b8");
            showDodged(hit);
            continue;
        }

        const damage = hit.type === "teacher" && state.round >= 25 && state.unlocks.bossDamagePlus2 ? 3 : 1;
        hit.hp -= damage;
        showTagged(hit);
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
        if (state.companion && state.companion.active && projectileOverlapsRect(ball, hitbox(state.companion))) {
            state.enemyBalls.splice(b, 1);
            if (Math.random() < COMPANION_DODGE_CHANCE) {
                showDodged(state.companion);
                burst(state.companion.x + state.companion.width / 2, state.companion.y + state.companion.height / 2, "#38bdf8");
                continue;
            }
            showTagged(state.companion);
            state.companion.hp--;
            burst(state.companion.x + state.companion.width / 2, state.companion.y + state.companion.height / 2, "#ef4444");
            if (state.companion.hp <= 0) state.companion.active = false;
            continue;
        }

        if (projectileOverlapsRect(ball, hitbox(player))) {
            state.enemyBalls.splice(b, 1);
            if (Math.random() < getPlayerProjectileDodgeChance()) {
                burst(player.x + player.width / 2, player.y + player.height / 2, "#c084fc");
                showDodged(player);
                continue;
            }
            if (ball.type === "chalk") {
                state.playerSlowTimer = PLAYER_SLOW_MS;
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
        finishKnockout("Swarmed", `The other team finished 3 laps and rushed you. Final score: ${state.score}.`);
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
    const customBackground = isBossRound() && hasSprite(sprites.classroom)
        ? sprites.classroom
        : sprites.field;

    if (hasSprite(customBackground)) {
        ctx.drawImage(customBackground, 0, 0, canvas.width, canvas.height);
        return;
    }

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
    ctx.strokeRect(0, FIELD_Y, FIELD_X, FIELD_HEIGHT);
    
    // RIGHT SIDE AREA - visible side thrower zone
    ctx.strokeRect(canvas.width - FIELD_X, FIELD_Y, FIELD_X, FIELD_HEIGHT);

    // MAIN PLAY FIELD
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 4;
    ctx.strokeRect(FIELD_X, FIELD_Y, FIELD_WIDTH, FIELD_HEIGHT);
    
    // Center line divider
    ctx.beginPath();
    ctx.moveTo(FIELD_X, canvas.height / 2);
    ctx.lineTo(canvas.width - FIELD_X, canvas.height / 2);
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
    const character = getCharacterConfig(state.selectedCharacter);
    const baseSprite = state.playerUpgrades.peUniformStacks > 0
        ? firstLoadedSprite(character.pe, "player1Pe", "playerPe", character.base, "player1", "player")
        : firstLoadedSprite(character.base, "player1", "player");
    const throwSprite = state.playerUpgrades.peUniformStacks > 0
        ? firstLoadedSprite(character.peThrow, "player1PeThrow", "playerPeThrow", character.throw, "player1Throw", "playerThrow")
        : firstLoadedSprite(character.throw, "player1Throw", "playerThrow");
    const sprite = player.throwPose > 0 && hasSprite(throwSprite) ? throwSprite : baseSprite;
    drawSpriteGroundShadow(sprite, player, 0.26);
    if (hasSprite(sprite)) {
        ctx.drawImage(sprite, player.x, player.y, player.width, player.height);
        if (player.throwPose > 0 && !hasSprite(throwSprite)) {
            drawThrowHands(player, 1);
        }
        return;
    }

    drawStudentBody(player, character.shirt, "#111827", 1);
}

function drawCompanion() {
    const companion = state.companion;
    if (!companion || !companion.active) return;

    const sprite = companion.throwPose > 0
        ? firstLoadedSprite("companionThrow", "companion", "companionPlaceholder")
        : firstLoadedSprite("companion", "companionPlaceholder");

    drawSpriteGroundShadow(sprite, companion, 0.24);
    if (hasSprite(sprite)) {
        ctx.drawImage(sprite, companion.x, companion.y, companion.width, companion.height);
    } else {
        drawStudentBody(companion, "#facc15", "#14532d", 1);
    }
    drawHealthBar(companion);
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
    return;
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

function drawPlayerSlowIndicator() {
    if (state.playerSlowTimer <= 0) return;

    const progress = clamp(state.playerSlowTimer / PLAYER_SLOW_MS, 0, 1);
    const x = player.x - 8;
    const y = player.y + player.height - 10;

    ctx.save();
    ctx.globalAlpha = 0.45 + progress * 0.35;
    if (hasSprite(sprites.slowed)) {
        ctx.drawImage(sprites.slowed, x - 16, y - 16, 32, 32);
        ctx.restore();
        return;
    }
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 9 + progress * 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#bfdbfe";
    ctx.font = "900 13px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("S", x, y);
    ctx.restore();
}

function drawPlayerHealthBar() {
    const visibleHealthSlots = Math.max(BASE_PLAYER_HEALTH, state.health);
    const totalSlots = visibleHealthSlots +
        state.playerUpgrades.peUniformStacks +
        (state.playerUpgrades.siomaiShieldRounds > 0 ? 1 : 0);
    const slotWidth = 15;
    const slotGap = 2;
    const width = totalSlots * slotWidth + (totalSlots - 1) * slotGap;
    const height = 6;
    const x = player.x + player.width / 2 - width / 2;
    const y = player.y + player.height + 7;
    let slot = 0;

    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.36)";
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);

    for (let i = 0; i < visibleHealthSlots; i++) {
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

    const throwSpriteName = getEnemyThrowSpriteName(student);
    const sprite = student.throwPose > 0 && hasSprite(sprites[throwSpriteName])
        ? sprites[throwSpriteName]
        : sprites[student.sprite];
    const isTeacher = student.type === "teacher";
    drawSpriteGroundShadow(sprite, student, isTeacher ? 0.30 : 0.24, {
        flatten: isTeacher ? 0.26 : 0.30,
        skew: isTeacher ? 0.40 : 0.46
    });

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

function getEnemyThrowSpriteName(student) {
    const throwSpriteName = `${student.sprite}Throw`;
    if (student.type !== "teacher" || student.throwPose <= 0) return throwSpriteName;

    const elapsed = TEACHER_THROW_ANIMATION_MS - student.throwPose;
    const teacherFrame = elapsed < TEACHER_THROW_FRAME_MS ? "teacherThrow" : "teacherThrowMuzzle";

    if (hasSprite(sprites[teacherFrame])) return teacherFrame;
    if (hasSprite(sprites.teacherThrow)) return "teacherThrow";
    if (hasSprite(sprites.teacherThrowMuzzle)) return "teacherThrowMuzzle";
    return throwSpriteName;
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
    ctx.fillStyle = fill > 0.5 ? "#22c55e" : "#ef4444";
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

function drawGroundShadow(entity, opacity = 0.24, widthScale = 0.68, heightScale = 0.16) {
    const width = entity.shadowWidth || entity.width || entity.radius * 2;
    const height = entity.shadowHeight || entity.height || entity.radius * 2;
    const x = entity.x + width / 2 - width * 0.08;
    const y = entity.y + height - height * 0.05;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(x, y, width * widthScale, height * heightScale, -0.20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawSpriteGroundShadow(sprite, entity, opacity = 0.24, options = {}) {
    if (!hasSprite(sprite)) {
        drawGroundShadow(entity, opacity);
        return;
    }

    const detectedAnchor = getSpriteRightFootAnchor(sprite);
    const footXRatio = options.footXRatio ?? detectedAnchor.xRatio;
    const footYRatio = options.footYRatio ?? detectedAnchor.yRatio;
    const skew = options.skew ?? 0.46;
    const flatten = options.flatten ?? 0.30;
    const stretch = options.stretch ?? 0.94;
    const offsetX = options.offsetX ?? 0;
    const offsetY = options.offsetY ?? 0;
    const footX = entity.width * footXRatio;
    const footY = entity.height * footYRatio;
    const anchorX = entity.x + footX;
    const anchorY = entity.y + footY;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.imageSmoothingEnabled = false;
    ctx.filter = "brightness(0)";
    ctx.translate(anchorX + offsetX, anchorY + offsetY);
    ctx.transform(stretch, 0, skew, -flatten, 0, 0);
    ctx.drawImage(sprite, -footX, -footY, entity.width, entity.height);
    ctx.restore();
}

function drawFloatingPickupShadow(powerUp) {
    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(powerUp.x - 7, powerUp.y + powerUp.radius + 13, powerUp.radius * 0.95, powerUp.radius * 0.28, -0.20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawProjectileShadow(ball) {
    ctx.save();
    ctx.globalAlpha = 0.30;
    ctx.fillStyle = "#000000";

    if (ball.type === "chalk") {
        ctx.translate(ball.x - 15, ball.y + 26);
        ctx.rotate(ball.angle + Math.PI / 2 - 0.205);
        if (hasSprite(sprites.chalk)) {
            ctx.imageSmoothingEnabled = false;
            ctx.filter = "brightness(0)";
            ctx.transform(1.08, 0, -0.22, 0.72, 0, 0);
            ctx.drawImage(sprites.chalk, -ball.width / 2, -ball.height / 2, ball.width, ball.height);
            ctx.restore();
            return;
        }
        ctx.beginPath();
        ctx.ellipse(0, 0, ball.width * 0.82, ball.height * 0.20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }

    const shadowX = ball.x - ball.radius * 0.82;
    const shadowY = ball.y + ball.radius * 1.42;
    ctx.beginPath();
    ctx.ellipse(shadowX, shadowY, ball.radius * 1.06, ball.radius * 0.30, -0.205, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawBall(ball) {
    if (ball.spawnDelay > 0) return;

    const size = ball.radius * 2;
    drawProjectileShadow(ball);

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
    if (type === POWER_UP_TYPES.PE_UNIFORM) return "player1Pe";
    return "";
}

function getPowerUpIconSpriteName(type) {
    if (type === POWER_UP_TYPES.DODGEBALL) return "dodgeballBuffIcon";
    if (type === POWER_UP_TYPES.VOLLEYBALL) return "volleyballBuffIcon";
    if (type === POWER_UP_TYPES.SOCCERBALL) return "soccerballBuffIcon";
    if (type === POWER_UP_TYPES.SIOMAI) return "siomaiRiceBuffIcon";
    if (type === POWER_UP_TYPES.COFFEE) return "icedCoffeeBuffIcon";
    if (type === POWER_UP_TYPES.PE_UNIFORM) return "peUniformBuffIcon";
    if (type === POWER_UP_TYPES.THROW_SPEED) return "throwSpeedBuffIcon";
    if (type === POWER_UP_TYPES.PROJECTILE_SPEED) return "projectileSpeedBuffIcon";
    if (type === POWER_UP_TYPES.MOVEMENT_SPEED) return "movementSpeedBuffIcon";
    if (type === POWER_UP_TYPES.DODGE_CHANCE) return "playerDodgeBuffIcon";
    if (type === POWER_UP_TYPES.YELLOW_SLIP) return "yellowSlipBuffIcon";
    return "";
}

function getPowerUpIconMarkup(type, className = "power-icon") {
    const spriteName = getPowerUpIconSpriteName(type) || getPowerUpSpriteName(type);
    const source = spriteSources[spriteName];
    const label = getPowerUpLabel(type);

    if (source && hasSprite(sprites[spriteName])) {
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
    if (type === POWER_UP_TYPES.YELLOW_SLIP) return "YS";
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
    if (type === POWER_UP_TYPES.YELLOW_SLIP) return "#facc15";
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
    if (type === POWER_UP_TYPES.YELLOW_SLIP) return "Yellow Slip";
    return "PE Uniform";
}

function makePowerPanelRow(type, amount = 0) {
    return `
        <div class="power-row">
            ${getPowerUpIconMarkup(type)}
            <span class="power-name" title="${getPowerUpName(type)}">${getPowerUpName(type)}</span>
            <span class="power-amount">x${amount}</span>
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
    if (upgrades.yellowSlipStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.YELLOW_SLIP, upgrades.yellowSlipStacks));
    if (upgrades.throwSpeedStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.THROW_SPEED, upgrades.throwSpeedStacks));
    if (upgrades.projectileSpeedStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.PROJECTILE_SPEED, upgrades.projectileSpeedStacks));
    if (upgrades.movementSpeedStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.MOVEMENT_SPEED, upgrades.movementSpeedStacks));
    if (upgrades.dodgeChanceStacks > 0) rows.push(makePowerPanelRow(POWER_UP_TYPES.DODGE_CHANCE, upgrades.dodgeChanceStacks));

    if (upgrades.coffeeRounds > 0) {
        rows.push(makePowerPanelRow(POWER_UP_TYPES.COFFEE, upgrades.coffeeRounds));
    }

    powerList.innerHTML = rows.join("");
}

function updateCharacterPanel() {
    if (!characterPanel) return;

    const character = getCharacterConfig(state.selectedCharacter);
    const source = spriteSources[character.base] || spriteSources.player1;
    characterPanel.innerHTML = `
        <h2 class="text-sm font-black uppercase tracking-[0.18em] text-slate-800">Character</h2>
        <div class="character-card">
            <span class="character-portrait sprite-icon">
                <img src="${source}" alt="${character.name}" onerror="this.style.display='none'">
            </span>
            <div class="character-details">
                <span class="character-name">${character.name}</span>
                <span class="character-status">${getModeLabel()}</span>
                ${getCharacterStatBulletMarkup(character)}
            </div>
        </div>
    `;
}

function drawPowerUp(powerUp) {
    const bob = Math.sin(powerUp.pulse) * 3;
    const image = sprites[getPowerUpIconSpriteName(powerUp.type)] || sprites[powerUp.type];
    drawFloatingPickupShadow(powerUp);

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
    ctx.fillText(`+${BOSS_REWARD_HEALTH} HP  +${BOSS_REWARD_COINS} COINS`, canvas.width / 2, canvas.height / 2 + 34);
    ctx.restore();
}

function drawHeldPowerUp(student) {
    if (!student.active || !student.heldPowerUp) return;

    ctx.save();
    ctx.translate(student.x + student.width - 2, student.y - 8);
    if (student.heldPowerUp === POWER_UP_TYPES.COFFEE && hasSprite(sprites.coffeeBeanIcon)) {
        ctx.drawImage(sprites.coffeeBeanIcon, -12, -12, 24, 24);
        ctx.restore();
        return;
    }
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

function drawFloatTexts() {
    state.floatTexts.forEach((item) => {
        ctx.globalAlpha = clamp(item.life / 720, 0, 1);
        ctx.fillStyle = item.color;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.font = "900 18px Poppins, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(item.text, item.x, item.y);
        ctx.fillText(item.text, item.x, item.y);
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
    const meterWidth = 76;
    const meterHeight = 6;
    const x = player.x + player.width / 2 - meterWidth / 2;
    const y = player.y + player.height + 18;
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
    drawCompanion();
    drawPlayerBarrier();
    drawPlayerPowerEffects();
    drawPlayer();
    drawPlayerSlowIndicator();
    drawCoffeeIndicator();
    drawPlayerHealthBar();
    drawParticles();
    drawFloatTexts();
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
resetBtn.addEventListener("click", () => {
    if (["loading", "menu", "story", "yellowSlip", "gameover", "ready"].includes(state.status)) {
        showMenuScreen();
        return;
    }

    resetGame();
});
if (mainMenuBtn) {
    mainMenuBtn.addEventListener("click", showMenuScreen);
}
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
if (skipStoryBtn) {
    skipStoryBtn.addEventListener("click", startSelectedRun);
}
if (overlayActions) {
    overlayActions.addEventListener("click", (event) => {
        const button = event.target.closest("[data-overlay-action]");
        if (!button) return;

        const action = button.dataset.overlayAction;
        if (action === "main-menu") {
            showMenuScreen();
            return;
        }
        if (action === "new-run") {
            startSelectedRun();
        }
    });
}
if (menuView) {
    menuView.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-menu-action]");
        if (actionButton) {
            const action = actionButton.dataset.menuAction;
            if (action === "new-game" || action === "level-selection") state.menuPhase = "mode";
            if (action === "home") state.menuPhase = "home";
            if (action === "mode") state.menuPhase = "mode";
            if (action === "characters") state.menuPhase = "character";
            if (action === "credits") state.menuPhase = "credits";
            if (action === "confirm-mode") state.menuPhase = "character";
            if (action === "confirm-character" || action === "start-run") {
                startSelectedRun();
                return;
            }
            renderModeMenu();
            return;
        }

        const modeButton = event.target.closest("[data-mode]");
        if (modeButton) {
            selectMode(modeButton.dataset.mode, modeButton.dataset.difficulty || "easy");
            return;
        }

        const button = event.target.closest("[data-character]");
        if (!button || button.disabled) return;
        const config = getCharacterConfig(button.dataset.character);
        if (!config.unlocked) return;
        state.selectedCharacter = config.id;
        renderModeMenu();
        updateCharacterPanel();
    });
}
if (yellowSlipBtn) {
    yellowSlipBtn.addEventListener("click", () => {
        if (state.yellowSlipPhase === "sign") {
            const passed = Math.random() < 0.5;
            state.yellowSlipPhase = "signing";
            showYellowSlipScreen("signing", state.yellowSlipReason);
            window.setTimeout(() => showYellowSlipResult(passed), YELLOW_SLIP_SIGN_REVEAL_MS);
            return;
        }
        if (state.yellowSlipPhase === "signing") return;

        if (state.yellowSlipPhase === "passed") {
            hideMenuOverlay();
            state.health = Math.max(1, Math.ceil(getBasePlayerHealth() / 2));
            clearPlayerDanger(true);
            state.yellowSlipPhase = "idle";
            state.yellowSlipReason = "";
            state.status = "playing";
            state.lastTime = performance.now();
            syncHud();
            return;
        }

        state.yellowSlipPhase = "idle";
        state.yellowSlipReason = "";
        state.status = "gameover";
        showMenuScreen();
    });
}

makeCourtMarks();
updateCharacterPanel();
showLoadingScreen();
state.lastTime = performance.now();
requestAnimationFrame(loop);
