
for (let k = 0; k < config.particleCount; k++) {
    // Color generation
    let hue, saturation = Math.random() * 40 + 60;
    let brightness = Math.random() * 60 + 20;
    
    switch(config.colorScheme) {
        case 'red': hue = Math.random() * 20 + 350; break;
        case 'blue': hue = Math.random() * 20 + 200; break;
        case 'green': hue = Math.random() * 20 + 100; break;
        case 'monochrome': hue = 0; saturation = 0; break;
        default: hue = i/config.particleCount * 360; // rainbow
    }

    particles.push({
        x, y,
        velX: 0, velY: 0,
        radius: ((1 - k/config.particleCount) + 1) * config.particleSize/2,
        speed: Math.random() + 1,
        targetIndex: Math.floor(Math.random() * heartPath.length),
        direction: i % 2 * 2 - 1,
        friction: Math.random() * 0.2 + 0.7,
        color: `hsla(${hue},${saturation}%,${brightness}%,0.1)`
    });
}
trails.push(particles);

// Render a single particle
function renderParticle(particle) {
ctx.fillStyle = particle.color;
ctx.beginPath();
ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
ctx.fill();
}

// Main animation loop with robust error handling
function animationLoop() {
if (!animationRunning) return; // Stop the animation if not running

try {
// Clear with trail effect (降低透明度以延長尾跡)
ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

renderQuiz(); // Render the quiz question

trails.forEach(trail => {
    if (!trail || !trail.length) return;
    
    const leader = trail[0];
    const target = heartPath[leader.targetIndex % heartPath.length];
    if (!target) return;

    // Mouse influence
    if (mouseActive && config.mouseInfluence > 0) {
        const dx = mouseX - leader.x;
        const dy = mouseY - leader.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 300) {
            const force = (1 - dist/300) * (config.mouseInfluence/20);
            leader.velX += dx/dist * force;
            leader.velY += dy/dist * force;
        }
    }

    // Move toward target
    const dx = leader.x - target[0];
    const dy = leader.y - target[1];
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 10) {
        if (Math.random() > 0.95) {
            leader.targetIndex = Math.floor(Math.random() * heartPath.length);
        } else {
            if (Math.random() > 0.99) leader.direction *= -1;
            leader.targetIndex += leader.direction;
            leader.targetIndex = (leader.targetIndex + heartPath.length) % heartPath.length;
        }
    }

    // Update physics
    leader.velX += -dx/dist * leader.speed * config.speed;
    leader.velY += -dy/dist * leader.speed * config.speed;
    leader.x += leader.velX;
    leader.y += leader.velY;
    leader.velX *= leader.friction;
    leader.velY *= leader.friction;

    // Render trail
    renderParticle(leader);
    for (let k = 1; k < trail.length; k++) {
        trail[k].x -= (trail[k].x - trail[k-1].x) * 0.7;
        trail[k].y -= (trail[k].y - trail[k-1].y) * 0.7;
        renderParticle(trail[k]);
    }
});
} catch (error) {
console.error("Animation error:", error);
}

requestAnimationFrame(animationLoop);
}

// Control handlers
function setupControls() {
const controls = document.getElementById('controls');
let controlsVisible = true;

document.getElementById('toggle-controls').addEventListener('click', () => {
controlsVisible = !controlsVisible;
controls.style.display = controlsVisible ? 'block' : 'none';
});

document.getElementById('toggle-fullscreen').addEventListener('click', () => {
if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
} else {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}
});

const updateParticles = () => {
config.particleCount = Math.min(100, Math.max(10, 
    parseInt(document.getElementById('particleCount').value)));
document.getElementById('particleCountValue').textContent = config.particleCount;
initHeartPath();
initParticles();
};

document.getElementById('particleCount').addEventListener('input', updateParticles);
document.getElementById('speed').addEventListener('input', (e) => {
config.speed = parseFloat(e.target.value);
document.getElementById('speedValue').textContent = config.speed;
});
document.getElementById('colorScheme').addEventListener('change', (e) => {
config.colorScheme = e.target.value;
initParticles();
});
document.getElementById('mouseInfluence').addEventListener('input', (e) => {
config.mouseInfluence = parseInt(e.target.value);
document.getElementById('mouseInfluenceValue').textContent = config.mouseInfluence;
});
document.getElementById('particleSize').addEventListener('input', (e) => {
config.particleSize = parseInt(e.target.value);
document.getElementById('particleSizeValue').textContent = config.particleSize;
initParticles();
});

// Mouse tracking
document.addEventListener('mousemove', (e) => {
mouseX = e.clientX;
mouseY = e.clientY;
mouseActive = true;
});
document.addEventListener('mouseleave', () => mouseActive = false);

// Window resize
window.addEventListener('resize', () => {
canvasWidth = canvas.width = window.innerWidth;
canvasHeight = canvas.height = window.innerHeight;
initHeartPath();
});
}

// Initialize everything
function init() {
const controls = document.getElementById('controls');
const canvas = document.getElementById('c');

controls.style.display = 'block';
canvas.style.display = 'block';
animationRunning = true;
setupControls();
animationLoop(); // Start the animation loop

// Initialize everything
initHeartPath();
initParticles();
generateQuiz(); // Generate the first quiz question
}

// Start the animation
init();

function setup() {
createCanvas(windowWidth, windowHeight);
for (let i = 0; i < 20; i++) {
stars.push({
x: random(width),
y: random(height),
size: 50, // 長寬為 5 公分 (50 像素)
});
}
}

function draw() {
background(230, 230, 250); // 淡紫色背景
noStroke();
fill(255, 182, 193); // 淡粉色

for (let star of stars) {
const size = map(mouseX, 0, width, 10, 50); // 調整大小範圍，最大為 50 像素
ellipse(star.x, star.y, size, size);
}
}
