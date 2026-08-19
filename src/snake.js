// ==================== 贪吃蛇小游戏 ====================

const CANVAS_SIZE = 400
const GRID_COUNT = 20
const CELL_SIZE = CANVAS_SIZE / GRID_COUNT
const STORAGE_KEY = 'jinji_snake_highscore'

let snakeCanvas = null
let snakeCtx = null
let snakeLoopId = null

// 游戏状态
let snake = []
let food = { x: 0, y: 0 }
let direction = { x: 1, y: 0 }
let nextDirection = { x: 1, y: 0 }
let snakeScore = 0
let snakeSpeed = 150
let gameRunning = false
let gameStarted = false
let touchStartX = 0
let touchStartY = 0

// 分数变化回调（由 app.js 注册）
let onScoreChange = null
let onGameOver = null
export function setSnakeScoreCallback(fn) {
  onScoreChange = fn
}
export function setSnakeGameOverCallback(fn) {
  onGameOver = fn
}

export function initSnakeGame() {
  snakeCanvas = document.getElementById('snake-canvas')
  if (!snakeCanvas) return
  snakeCtx = snakeCanvas.getContext('2d')

  // 适配 Retina 高 DPI 屏幕
  const dpr = window.devicePixelRatio || 1
  snakeCanvas.width = CANVAS_SIZE * dpr
  snakeCanvas.height = CANVAS_SIZE * dpr
  snakeCanvas.style.width = CANVAS_SIZE + 'px'
  snakeCanvas.style.height = CANVAS_SIZE + 'px'
  snakeCtx.scale(dpr, dpr)

  setupTouchControls()
  renderSnakeIdle()
}

export function startSnakeGame() {
  // 重置所有游戏状态
  gameStarted = true
  gameRunning = true
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
  direction = { x: 1, y: 0 }
  nextDirection = { x: 1, y: 0 }
  snakeScore = 0
  snakeSpeed = 150
  spawnFood()
  if (snakeLoopId) clearInterval(snakeLoopId)
  snakeLoopId = setInterval(snakeTick, snakeSpeed)
}

export function stopSnakeGame() {
  gameRunning = false
  gameStarted = false
  if (snakeLoopId) {
    clearInterval(snakeLoopId)
    snakeLoopId = null
  }
}

export function pauseSnakeGame() {
  if (!gameRunning) return
  gameRunning = false
  if (snakeLoopId) {
    clearInterval(snakeLoopId)
    snakeLoopId = null
  }
}

export function resumeSnakeGame() {
  // 重新开始游戏（不是真正恢复暂停状态）
  startSnakeGame()
}

export function getSnakeHighScore() {
  return parseInt(localStorage.getItem(STORAGE_KEY) || '0')
}

export function saveSnakeHighScore(score) {
  const current = getSnakeHighScore()
  if (score > current) {
    localStorage.setItem(STORAGE_KEY, String(score))
  }
}

// ---- 核心游戏逻辑 ----

function snakeTick() {
  direction = { ...nextDirection }
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  }

  // 碰墙检测
  if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
    gameOver()
    return
  }
  // 碰自身检测
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver()
    return
  }

  snake.unshift(head)

  // 吃食物
  if (head.x === food.x && head.y === food.y) {
    snakeScore += 10
    if (onScoreChange) onScoreChange(snakeScore)
    spawnFood()
    // 每 50 分加速一次
    if (snakeScore % 50 === 0 && snakeSpeed > 60) {
      snakeSpeed -= 10
      clearInterval(snakeLoopId)
      snakeLoopId = setInterval(snakeTick, snakeSpeed)
    }
  } else {
    snake.pop()
  }

  renderSnakeGame()
}

function spawnFood() {
  let pos
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_COUNT),
      y: Math.floor(Math.random() * GRID_COUNT),
    }
  } while (snake.some(s => s.x === pos.x && s.y === pos.y))
  food = pos
}

function gameOver() {
  stopSnakeGame()
  saveSnakeHighScore(snakeScore)
  if (onScoreChange) onScoreChange(snakeScore)
  if (onGameOver) onGameOver()
  renderSnakeGameOver()
}

// ---- 绘制 ----

function isDark() {
  return document.documentElement.classList.contains('dark')
}

function renderSnakeIdle() {
  const ctx = snakeCtx
  if (!ctx) return
  const dark = isDark()
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  drawSnakeGrid(ctx, dark)
  ctx.fillStyle = dark ? '#94A3B8' : '#64748B'
  ctx.font = 'bold 22px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🐍 点击开始', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 10)
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillStyle = dark ? '#64748B' : '#94A3B8'
  ctx.fillText('方向键 / 滑动控制', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20)
}

function renderSnakeGame() {
  const ctx = snakeCtx
  if (!ctx) return
  const dark = isDark()
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  drawSnakeGrid(ctx, dark)
  drawSnake(ctx, dark)
  drawFood(ctx, dark)
}

function renderSnakeGameOver() {
  const ctx = snakeCtx
  if (!ctx) return
  const dark = isDark()
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  drawSnakeGrid(ctx, dark)
  drawSnake(ctx, dark, true)

  // 半透明遮罩
  ctx.fillStyle = 'rgba(0,0,0,0.55)'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  ctx.fillStyle = '#fff'
  ctx.font = 'bold 28px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('游戏结束', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 28)

  ctx.font = 'bold 20px system-ui, sans-serif'
  ctx.fillText(`得分：${snakeScore}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 8)

  const high = getSnakeHighScore()
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillStyle = '#FBBF24'
  ctx.fillText(`最高分：${high}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 34)

  ctx.fillStyle = '#CBD5E1'
  ctx.font = '15px system-ui, sans-serif'
  ctx.fillText('点击重新开始', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 62)
}

function drawSnakeGrid(ctx, dark) {
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
  ctx.lineWidth = 0.5
  for (let i = 0; i <= GRID_COUNT; i++) {
    ctx.beginPath()
    ctx.moveTo(i * CELL_SIZE, 0)
    ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * CELL_SIZE)
    ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE)
    ctx.stroke()
  }
}

function drawSnake(ctx, dark, dead = false) {
  snake.forEach((seg, i) => {
    const isHead = i === 0
    // 蛇身渐变色
    const ratio = 1 - (i / snake.length) * 0.5
    if (dead) {
      ctx.fillStyle = '#94A3B8'
    } else {
      const g = Math.round(185 * ratio)
      const b = Math.round(129 * ratio)
      ctx.fillStyle = `rgb(16, ${g}, ${b})`
    }
    const padding = isHead ? 1 : 2
    const radius = isHead ? 5 : 3
    roundRect(ctx,
      seg.x * CELL_SIZE + padding,
      seg.y * CELL_SIZE + padding,
      CELL_SIZE - padding * 2,
      CELL_SIZE - padding * 2,
      radius,
    )
    ctx.fill()

    // 蛇头画眼睛
    if (isHead && !dead) {
      ctx.fillStyle = '#fff'
      const cx = seg.x * CELL_SIZE + CELL_SIZE / 2
      const cy = seg.y * CELL_SIZE + CELL_SIZE / 2
      const eyeOffset = 4
      const eyeR = 2.2
      let e1x = cx, e1y = cy, e2x = cx, e2y = cy
      if (direction.x === 1)       { e1x = cx + 4; e1y = cy - eyeOffset; e2x = cx + 4; e2y = cy + eyeOffset }
      else if (direction.x === -1) { e1x = cx - 4; e1y = cy - eyeOffset; e2x = cx - 4; e2y = cy + eyeOffset }
      else if (direction.y === -1) { e1x = cx - eyeOffset; e1y = cy - 4; e2x = cx + eyeOffset; e2y = cy - 4 }
      else                         { e1x = cx - eyeOffset; e1y = cy + 4; e2x = cx + eyeOffset; e2y = cy + 4 }
      ctx.beginPath(); ctx.arc(e1x, e1y, eyeR, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(e2x, e2y, eyeR, 0, Math.PI * 2); ctx.fill()
    }
  })
}

function drawFood(ctx, dark) {
  const cx = food.x * CELL_SIZE + CELL_SIZE / 2
  const cy = food.y * CELL_SIZE + CELL_SIZE / 2
  const r = CELL_SIZE / 2 - 3

  // 光晕
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 6)
  glow.addColorStop(0, 'rgba(239,68,68,0.3)')
  glow.addColorStop(1, 'rgba(239,68,68,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2)
  ctx.fill()

  // 苹果主体
  const grad = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, r)
  grad.addColorStop(0, '#F87171')
  grad.addColorStop(1, '#DC2626')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // 高光
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.beginPath()
  ctx.arc(cx - 3, cy - 3, 2.5, 0, Math.PI * 2)
  ctx.fill()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ---- 输入处理 ----

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    // 游戏状态下阻止方向键的默认滚动行为
    if (gameStarted || gameRunning) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }
    }
    // 只有游戏状态有效时才响应键盘
    if (!gameStarted && !gameRunning) return
    if (e.key === ' ' || e.key === 'Escape') {
      if (!gameStarted) {
        startSnakeGame()
      } else if (gameRunning) {
        pauseSnakeGame()
      } else {
        startSnakeGame()
      }
      return
    }
    if (!gameRunning) return
    switch (e.key) {
      case 'ArrowUp':    if (direction.y !== 1)  nextDirection = { x: 0,  y: -1 }; break
      case 'ArrowDown':  if (direction.y !== -1) nextDirection = { x: 0,  y: 1  }; break
      case 'ArrowLeft':  if (direction.x !== 1)  nextDirection = { x: -1, y: 0  }; break
      case 'ArrowRight': if (direction.x !== -1) nextDirection = { x: 1,  y: 0  }; break
    }
  })
}

function setupTouchControls() {
  const canvas = snakeCanvas
  if (!canvas) return

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault()
    if (!gameRunning && gameStarted) {
      // 暂停中 → 继续
      resumeSnakeGame()
      return
    }
    if (!gameStarted) {
      startSnakeGame()
      return
    }
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }, { passive: false })

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault()
    if (!gameRunning) return
    const dx = e.touches[0].clientX - touchStartX
    const dy = e.touches[0].clientY - touchStartY
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    // 滑动阈值
    if (Math.max(absDx, absDy) < 15) return
    if (absDx > absDy) {
      // 水平滑动
      if (dx > 0 && direction.x !== -1)      nextDirection = { x: 1,  y: 0 }
      else if (dx < 0 && direction.x !== 1)  nextDirection = { x: -1, y: 0 }
    } else {
      // 垂直滑动
      if (dy > 0 && direction.y !== -1)      nextDirection = { x: 0,  y: 1  }
      else if (dy < 0 && direction.y !== 1)  nextDirection = { x: 0,  y: -1 }
    }
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }, { passive: false })

  canvas.addEventListener('click', () => {
    if (!gameStarted) {
      startSnakeGame()
    } else if (!gameRunning) {
      startSnakeGame()
    }
  })
}

// 初始化键盘监听
setupKeyboard()
