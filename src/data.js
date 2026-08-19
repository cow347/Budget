// ==================== 数据层 (localStorage) ====================

const STORAGE_KEY = 'jinji_records'
const FIRST_USE_KEY = 'jinji_first_use'
const THEME_KEY = 'jinji_theme'
const FONT_SCALE_KEY = 'jinji_font_scale'
const USER_CATS_KEY = 'jinji_user_categories'

// 分类定义
export const CATEGORIES = {
  expense: [
    { id: 1,  name: '餐饮',   icon: '🍜' },
    { id: 2,  name: '居住',   icon: '🏠' },
    { id: 3,  name: '交通',   icon: '🚗' },
    { id: 4,  name: '服饰',   icon: '👔' },
    { id: 5,  name: '医疗',   icon: '💊' },
    { id: 6,  name: '娱乐',   icon: '🎮' },
    { id: 7,  name: '购物',   icon: '🛒' },
    { id: 8,  name: '教育',   icon: '📚' },
    { id: 9,  name: '其他',   icon: '📦' },
  ],
  income: [
    { id: 10, name: '工资',   icon: '💰' },
    { id: 11, name: '奖金',   icon: '🏆' },
    { id: 12, name: '兼职',   icon: '💼' },
    { id: 13, name: '理财',   icon: '📈' },
    { id: 14, name: '红包',   icon: '🧧' },
    { id: 15, name: '其他',   icon: '📦' },
  ],
}

export function getAllCategories() {
  return [...CATEGORIES.expense, ...CATEGORIES.income, ...getCustomCategories()]
}

export function getCategoryById(id) {
  return getAllCategories().find(c => c.id === id)
}

// ---- 自定义分类 CRUD ----

export function getCustomCategories() {
  const raw = localStorage.getItem(USER_CATS_KEY)
  return raw ? JSON.parse(raw) : []
}

function saveCustomCategories(cats) {
  localStorage.setItem(USER_CATS_KEY, JSON.stringify(cats))
}

export function addCustomCategory(type, name, icon) {
  const custom = getCustomCategories()
  // 找最小的负 ID（绝对值最大）
  const minId = custom.reduce((m, c) => Math.min(m, c.id || 0), 0)
  const cat = { id: minId - 1, type, name: name.trim(), icon, createdAt: Date.now() }
  custom.push(cat)
  saveCustomCategories(custom)
  return cat
}

export function updateCustomCategory(id, data) {
  const custom = getCustomCategories()
  const idx = custom.findIndex(c => c.id === id)
  if (idx === -1) return null
  custom[idx] = { ...custom[idx], ...data, name: (data.name || '').trim() }
  saveCustomCategories(custom)
  return custom[idx]
}

export function deleteCustomCategory(id) {
  const custom = getCustomCategories().filter(c => c.id !== id)
  saveCustomCategories(custom)
}

export function hasRecordsWithCategory(catId) {
  return getRecords().some(r => r.category === catId)
}

// 示例数据（首次使用生成，包含多个月份的记录）
const now = new Date()
const currentMonth = now.toISOString().slice(0, 7) // YYYY-MM
const currentDay = now.toISOString().slice(0, 10)  // YYYY-MM-DD
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10)
const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10)

const SAMPLE_DATA = [
  // 本月记录
  { id: 1, type: 'expense', category: 1, amount: 28.5, date: currentDay, note: '午餐' },
  { id: 2, type: 'expense', category: 1, amount: 45,    date: currentDay, note: '晚餐' },
  { id: 3, type: 'income',  category: 10, amount: 8000, date: currentDay, note: '工资' },
  { id: 4, type: 'expense', category: 3, amount: 6,     date: currentDay, note: '地铁' },
  { id: 5, type: 'expense', category: 7, amount: 199,   date: currentDay, note: '买了一本书' },
  // 上月记录
  { id: 6, type: 'expense', category: 1, amount: 156,   date: lastMonth, note: '聚餐' },
  { id: 7, type: 'expense', category: 2, amount: 3500,  date: lastMonth, note: '房租' },
  { id: 8, type: 'income',  category: 10, amount: 8000, date: lastMonth, note: '工资' },
  { id: 9, type: 'expense', category: 6, amount: 128,   date: lastMonth, note: '电影' },
  // 两个月前的记录
  { id: 10, type: 'expense', category: 1, amount: 89,    date: twoMonthsAgo, note: '零食' },
  { id: 11, type: 'expense', category: 5, amount: 256,   date: twoMonthsAgo, note: '医药' },
  { id: 12, type: 'income',  category: 11, amount: 2000, date: twoMonthsAgo, note: '奖金' },
  { id: 13, type: 'expense', category: 8, amount: 599,   date: twoMonthsAgo, note: '课程' },
]

// ---- CRUD ----

function load() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function save(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function initApp() {
  if (!localStorage.getItem(FIRST_USE_KEY)) {
    save(SAMPLE_DATA)
    localStorage.setItem(FIRST_USE_KEY, '1')
  }
  // 主题
  const theme = localStorage.getItem(THEME_KEY) || 'light'
  document.documentElement.classList.toggle('dark', theme === 'dark')
  // 字体缩放
  const scale = localStorage.getItem(FONT_SCALE_KEY) || '1'
  document.documentElement.style.fontSize = scale + 'rem'
}

export function getRecords() {
  return load()
}

export function addRecord(data) {
  const records = load()
  const maxId = records.reduce((m, r) => Math.max(m, r.id || 0), 0)
  const record = {
    id: maxId + 1,
    type: data.type,
    category: data.category,
    amount: parseFloat(data.amount),
    date: data.date,
    note: (data.note || '').trim(),
    createdAt: Date.now(),
  }
  records.unshift(record)
  save(records)
  return record
}

export function updateRecord(id, data) {
  const records = load()
  const idx = records.findIndex(r => r.id === id)
  if (idx === -1) return null
  records[idx] = { ...records[idx], ...data, amount: parseFloat(data.amount) }
  save(records)
  return records[idx]
}

export function deleteRecord(id) {
  const records = load().filter(r => r.id !== id)
  save(records)
}

export function clearAll() {
  localStorage.removeItem(STORAGE_KEY)
}

// ---- 统计 ----

export function getMonthRecords(yearMonth) {
  return load().filter(r => r.date.startsWith(yearMonth))
}

export function monthlySummary(yearMonth) {
  const records = getMonthRecords(yearMonth)
  const expense = records.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0)
  const income  = records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0)
  return { expense, income, balance: income - expense, count: records.length }
}

export function categoryBreakdown(yearMonth) {
  const records = getMonthRecords(yearMonth).filter(r => r.type === 'expense')
  const map = new Map()
  for (const r of records) {
    map.set(r.category, (map.get(r.category) || 0) + r.amount)
  }
  return Array.from(map.entries())
    .map(([catId, amount]) => {
      const cat = getCategoryById(catId)
      return { catId, name: cat?.name || '未分类', icon: cat?.icon || '📦', amount }
    })
    .sort((a, b) => b.amount - a.amount)
}

export function trendData(refMonth) {
  const months = []
  const d = new Date(refMonth + '-01')
  // 以选中月份为中心，前后各3个月，共7个月
  for (let i = -3; i <= 3; i++) {
    const m = new Date(d)
    m.setMonth(m.getMonth() + i)
    const ym = m.toISOString().slice(0, 7)
    const s = monthlySummary(ym)
    months.push({
      month: ym.slice(5),
      expense: s.expense,
      income:  s.income,
    })
  }
  return months
}

// ---- 主题 ----

export function setTheme(dark) {
  document.documentElement.classList.toggle('dark', dark)
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
}

export function getFontScale() {
  return parseFloat(localStorage.getItem(FONT_SCALE_KEY) || '1')
}

export function setFontScale(scale) {
  document.documentElement.style.fontSize = scale + 'rem'
  localStorage.setItem(FONT_SCALE_KEY, String(scale))
}

// ---- 导出/导入 ----

export function exportJSON() {
  return JSON.stringify({ records: getRecords(), exportedAt: new Date().toISOString() }, null, 2)
}

export function importJSON(jsonStr) {
  try {
    const data = JSON.parse(jsonStr)
    if (data.records && Array.isArray(data.records)) {
      save(data.records)
      return { ok: true }
    }
    return { ok: false, error: '文件格式不正确' }
  } catch (e) {
    return { ok: false, error: '解析失败：' + e.message }
  }
}

export function exportCSV() {
  const records = getRecords()
  if (records.length === 0) return ''
  const header = '日期,类型,分类,金额,备注\n'
  const rows = records.map(r => {
    const cat = getCategoryById(r.category)
    const typeLabel = r.type === 'expense' ? '支出' : '收入'
    const catName = cat ? `${cat.icon}${cat.name}` : '未分类'
    return `${r.date},${typeLabel},${catName},${r.amount.toFixed(2)},${(r.note || '').replace(/,/g, '；')}`
  }).join('\n')
  return '﻿' + header + rows
}

export function downloadFile(filename, content, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType + ';charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
