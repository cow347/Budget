import './index.css'
import {
  initApp, getRecords, addRecord, updateRecord, deleteRecord, clearAll,
  getMonthRecords, monthlySummary, categoryBreakdown, trendData,
  CATEGORIES, getAllCategories, getCategoryById, getCustomCategories,
  setTheme, exportJSON, importJSON, exportCSV, downloadFile,
  getFontScale, setFontScale,
  addCustomCategory, updateCustomCategory, deleteCustomCategory, hasRecordsWithCategory,
} from './data.js'

// ==================== 状态 ====================
let currentTab = 'home'
let currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
let showModal = false
let modalType = null // 'add' | 'edit'
let editingId = null

// 表单状态
let formType = 'expense'
let formCategory = null
let formAmount = ''
let formDate = new Date().toISOString().split('T')[0]
let formNote = ''

// 分类管理状态
let catTab = 'expense'  // 'expense' | 'income' | 'custom'
let showCatModal = false
let catModalType = null // 'add' | 'edit'
let catEditingId = null
let catFormType = 'expense'
let catFormName = ''
let catFormIcon = '📁'

// ==================== 初始化 ====================
initApp()
render()

// ==================== 导航 ====================
function switchTab(tab) {
  currentTab = tab
  render()
}

function openModal(type, record) {
  modalType = type
  showModal = true
  if (type === 'add') {
    formType = 'expense'
    formCategory = null
    formAmount = ''
    formDate = currentMonth + '-01'
    formNote = ''
    editingId = null
  } else if (type === 'edit' && record) {
    editingId = record.id
    formType = record.type
    formCategory = record.category
    formAmount = String(record.amount)
    formDate = record.date
    formNote = record.note || ''
  }
  render()
}

function closeModal() {
  showModal = false
  modalType = null
  render()
}

// ==================== 分类管理 ====================
function openCatModal(type, cat) {
  catModalType = type
  showCatModal = true
  if (type === 'add') {
    catFormType = catTab
    catFormName = ''
    catFormIcon = '📁'
    catEditingId = null
  } else if (type === 'edit' && cat) {
    catFormType = cat.type
    catFormName = cat.name
    catFormIcon = cat.icon
    catEditingId = cat.id
  }
  render()
}

function closeCatModal() {
  showCatModal = false
  catModalType = null
  render()
}

function saveCustomCategory() {
  if (!catFormName.trim()) {
    alert('请输入分类名称')
    return
  }
  if (catModalType === 'add') {
    addCustomCategory(catFormType, catFormName, catFormIcon)
  } else {
    updateCustomCategory(catEditingId, { name: catFormName, icon: catFormIcon })
  }
  closeCatModal()
}

function confirmDeleteCustomCategory(id) {
  if (hasRecordsWithCategory(id)) {
    alert('该分类下有记录，无法删除。请先删除相关记录后再删除分类。')
    return
  }
  if (confirm('确定删除该分类吗？')) {
    deleteCustomCategory(id)
    render()
  }
}

function switchCatTab(tab) {
  catTab = tab
  render()
}

function renderCategories() {
  const isDark = document.documentElement.classList.contains('dark')
  const customCats = getCustomCategories()
  const customExpense = customCats.filter(c => c.type === 'expense')
  const customIncome = customCats.filter(c => c.type === 'income')
  const displayCats = catTab === 'expense' ? customExpense : customIncome

  return `
    <div class="${currentTab === 'categories' ? '' : 'hidden'}">
      <!-- 顶部 -->
      <div class="relative flex items-center px-5 py-4 bg-white border-b border-[#E2E8F0]">
        <h1 class="text-lg font-bold ${isDark ? 'text-white' : 'text-[#1E293B]'}">🏷️ 分类管理</h1>
      </div>

      <div class="px-5 py-4 space-y-4">
        <!-- 默认分类提示 -->
        <div class="card">
          <div class="font-medium mb-1 ${isDark ? 'text-white' : 'text-[#1E293B]'}">默认分类</div>
          <div class="text-sm text-[#94A3B8]">系统内置分类，不可修改或删除</div>
          <div class="mt-3 flex flex-wrap gap-2">
            ${(catTab === 'expense' ? CATEGORIES.expense : CATEGORIES.income).map(cat => `
              <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-[#0F172A] text-[#94A3B8]' : 'bg-[#F1F5F9] text-[#64748B]'}">
                ${cat.icon} ${cat.name}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- 用户自定义分类 -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="font-medium ${isDark ? 'text-white' : 'text-[#1E293B]'}">自定义分类</div>
              <div class="text-sm text-[#94A3B8]">可以增删改</div>
            </div>
            <button onclick="openCatModal('add')" class="btn-primary text-sm">+ 新建</button>
          </div>

          ${displayCats.length === 0 ? `
            <div class="text-center py-8 text-[#94A3B8] text-sm">暂无自定义分类</div>
          ` : displayCats.map(cat => {
            const hasReco = hasRecordsWithCategory(cat.id)
            return `
              <div class="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0 ${isDark ? 'border-[#1E293B]' : ''}">
                <div class="flex items-center gap-3">
                  <span class="text-2xl w-8 text-center">${cat.icon}</span>
                  <span class="font-medium ${isDark ? 'text-[#F1F5F9]' : 'text-[#1E293B]'}">${cat.name}</span>
                  ${hasReco ? '<span class="text-xs px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706]">有记录</span>' : ''}
                </div>
                <div class="flex items-center gap-2">
                  <button onclick="openCatModal('edit', ${JSON.stringify({ id: cat.id, type: cat.type, name: cat.name, icon: cat.icon }).replace(/'/g, "&#39;")})"
                    class="text-[#94A3B8] hover:text-[#4F46E5] text-sm px-2" title="编辑">✏️</button>
                  <button onclick="confirmDeleteCustomCategory(${cat.id})"
                    class="text-[#94A3B8] hover:text-[#EF4444] text-sm px-2" title="删除">🗑️</button>
                </div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    </div>
  `
}

function renderCatModal() {
  const isDark = document.documentElement.classList.contains('dark')
  const typeLabel = catFormType === 'expense' ? '支出' : '收入'

  // 表情选项
  const emojiOptions = [
    '🍜', '🏠', '🚗', '👔', '💊', '🎮', '🛒', '📚', '📦',
    '💰', '🏆', '💼', '📈', '🧧',
    '🍔', '🥤', '🎁', '✈️', '⚽', '🎬', '🏥', '📱', '💻',
    '🎵', '🧹', '👶', '🐱', '🎂', '🍎', '🥗', '☕', '🏋️',
    '💵', '🪙', '🧮', '📊', '🎰',
  ]

  return `
    <div class="modal-overlay" onclick="if(event.target===this)closeCatModal()">
      <div class="modal-content">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold ${isDark ? 'text-white' : 'text-[#1E293B]'}">
            ${catModalType === 'add' ? '新建分类' : '编辑分类'}
          </h2>
          <button onclick="closeCatModal()" class="text-[#94A3B8] hover:text-[#1E293B] text-xl leading-none">✕</button>
        </div>

        <!-- 类型切换 -->
        <div class="flex gap-3 mb-5">
          <button onclick="setCatFormType('expense')"
            class="flex-1 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
              catFormType === 'expense'
                ? 'border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]'
                : 'border-[#E2E8F0] text-[#94A3B8] hover:border-[#FECACA] hover:text-[#EF4444]'
            }">支出</button>
          <button onclick="setCatFormType('income')"
            class="flex-1 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
              catFormType === 'income'
                ? 'border-[#10B981] bg-[#ECFDF5] text-[#10B981]'
                : 'border-[#E2E8F0] text-[#94A3B8] hover:border-[#A7F3D0] hover:text-[#10B981]'
            }">收入</button>
        </div>

        <!-- 图标选择 -->
        <div class="mb-4">
          <label class="text-sm text-[#94A3B8] mb-2 block">图标</label>
          <div class="grid grid-cols-10 gap-2">
            ${emojiOptions.map(e => `
              <button onclick="setCatFormIcon('${e}')"
                class="w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all ${
                  catFormIcon === e
                    ? 'bg-[#4F46E5] text-white scale-110'
                    : (isDark ? 'bg-[#0F172A] hover:bg-[#334155]' : 'bg-[#F1F5F9] hover:bg-[#E2E8F0]')
                }">${e}</button>
            `).join('')}
          </div>
        </div>

        <!-- 名称 -->
        <div class="mb-6">
          <label class="text-sm text-[#94A3B8] mb-2 block">名称</label>
          <input type="text" value="${catFormName}"
            oninput="setCatFormName(this.value)"
            placeholder="请输入分类名称"
            class="input-field" maxlength="10" />
        </div>

        <button onclick="saveCustomCategory()" class="btn-primary w-full py-3 text-lg">
          ${catModalType === 'add' ? '创建分类' : '保存修改'}
        </button>
      </div>
    </div>
  `
}

function setCatFormType(type) {
  catFormType = type
  render()
}

function setCatFormIcon(icon) {
  catFormIcon = icon
  render()
}

function setCatFormName(name) {
  catFormName = name
}

function saveRecord() {
  if (!formAmount || isNaN(formAmount) || parseFloat(formAmount) <= 0) {
    alert('请输入有效金额')
    return
  }
  if (!formCategory) {
    alert('请选择分类')
    return
  }
  const data = {
    type: formType,
    category: formCategory,
    amount: parseFloat(formAmount),
    date: formDate,
    note: formNote,
  }
  if (editingId) {
    updateRecord(editingId, data)
  } else {
    addRecord(data)
  }
  closeModal()
}

function confirmDelete(id) {
  if (confirm('确定删除这条记录吗？')) {
    deleteRecord(id)
    render()
  }
}

function handleExportJSON() {
  const now = new Date()
  const ym = now.toISOString().slice(0, 7)
  downloadFile(`金金计较_备份_${ym}.json`, exportJSON(), 'application/json')
}

function handleImportJSON(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const result = importJSON(ev.target.result)
    if (result.ok) {
      alert('导入成功！')
      render()
    } else {
      alert('导入失败：' + result.error)
    }
  }
  reader.readAsText(file)
  e.target.value = '' // 重置 file input
}

function handleExportCSV() {
  const ym = new Date().toISOString().slice(0, 7)
  downloadFile(`金金计较_账单_${ym}.csv`, exportCSV(), 'text/csv;charset=utf-8')
}

function handleClearData() {
  if (confirm('确定清空所有数据吗？此操作不可撤销！')) {
    if (confirm('再次确认：真的要清空所有记录吗？')) {
      clearAll()
      render()
    }
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark')
  setTheme(!isDark)
  render()
}

let fontScale = getFontScale() // 初始缩放

function setZoom(level) {
  // level: 0=缩小, 1=重置, 2=放大
  if (level === 0) fontScale = Math.max(0.8, fontScale - 0.1)
  else if (level === 2) fontScale = Math.min(1.5, fontScale + 0.1)
  else fontScale = 1
  setFontScale(fontScale)
  render()
}
function render() {
  const app = document.getElementById('app')
  if (!app) return

  const summary = monthlySummary(currentMonth)
  const breakdown = categoryBreakdown(currentMonth)
  const trend = trendData(currentMonth)
  const records = getMonthRecords(currentMonth)

  const maxExpense = Math.max(...trend.map(m => m.expense), 1)
  const maxIncome = Math.max(...trend.map(m => m.income), 1)
  const chartMax = Math.max(maxExpense, maxIncome)

  app.innerHTML = `
    <!-- 页面内容 -->
    <div class="pb-20">
      ${renderHome(summary, breakdown, records)}
      ${currentTab === 'stats' ? renderStats(summary, breakdown, trend, chartMax) : ''}
      ${currentTab === 'categories' ? renderCategories() : ''}
      ${currentTab === 'settings' ? renderSettings() : ''}
    </div>

    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <button class="tab-btn ${currentTab === 'home' ? 'active' : ''}" onclick="switchTab('home')">
        <span class="text-xl">${currentTab === 'home' ? '🏠' : '🏠'}</span>
        <span>首页</span>
      </button>
      <button class="tab-btn ${currentTab === 'stats' ? 'active' : ''}" onclick="switchTab('stats')">
        <span class="text-xl">${currentTab === 'stats' ? '📊' : '📊'}</span>
        <span>统计</span>
      </button>
      <button class="tab-btn ${currentTab === 'categories' ? 'active' : ''}" onclick="switchTab('categories')">
        <span class="text-xl">${currentTab === 'categories' ? '🏷️' : '🏷️'}</span>
        <span>分类</span>
      </button>
      <button class="tab-btn ${currentTab === 'settings' ? 'active' : ''}" onclick="switchTab('settings')">
        <span class="text-xl">${currentTab === 'settings' ? '⚙️' : '⚙️'}</span>
        <span>设置</span>
      </button>
    </nav>

    <!-- 记一笔 FAB -->
    <button class="fab" onclick="openModal('add')" title="记一笔">+</button>

    <!-- 弹窗 -->
    ${showModal ? renderModal() : ''}
    ${showCatModal ? renderCatModal() : ''}
  `

  // 月份切换事件
  const monthInput = document.getElementById('month-picker')
  if (monthInput) {
    monthInput.value = currentMonth
    monthInput.onchange = (e) => {
      currentMonth = e.target.value
      render()
    }
  }
}

// ==================== 首页 ====================
function renderHome(summary, breakdown, records) {
  const isDark = document.documentElement.classList.contains('dark')
  const monthLabel = currentMonth.replace('-', '年') + '月'
  const expensePct = summary.expense > 0 ? 100 : 0

  return `
    <div class="${currentTab === 'home' ? '' : 'hidden'}">
      <!-- 顶部月份选择 -->
      <div class="relative flex items-center justify-between px-5 py-4 bg-white border-b border-[#E2E8F0]">
        <h1 class="text-lg font-bold ${isDark ? 'text-white' : 'text-[#1E293B]'}">💰 金金计较</h1>
        <input type="month" id="month-picker" class="input-field w-36 text-sm" />
      </div>

      <!-- 月度概览 -->
      <div class="px-5 py-4 grid grid-cols-3 gap-3">
        <div class="card text-center">
          <div class="text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'} mb-1">支出</div>
          <div class="text-xl font-bold text-[#EF4444]">¥${summary.expense.toFixed(2)}</div>
        </div>
        <div class="card text-center">
          <div class="text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'} mb-1">收入</div>
          <div class="text-xl font-bold text-[#10B981]">¥${summary.income.toFixed(2)}</div>
        </div>
        <div class="card text-center">
          <div class="text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'} mb-1">结余</div>
          <div class="text-xl font-bold ${summary.balance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}">
            ¥${summary.balance.toFixed(2)}
          </div>
        </div>
      </div>

      <!-- 分类排行 -->
      ${breakdown.length > 0 ? `
      <div class="px-5 pb-3">
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold ${isDark ? 'text-white' : 'text-[#1E293B]'}">分类排行</h2>
            <span class="text-xs text-[#94A3B8]">本月支出</span>
          </div>
          <div class="space-y-3">
            ${breakdown.map((item, i) => `
              <div>
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="${isDark ? 'text-[#F1F5F9]' : 'text-[#374151]'}">
                    ${item.icon} ${item.name}
                  </span>
                  <span class="font-semibold text-[#EF4444]">¥${item.amount.toFixed(2)}</span>
                </div>
                <div class="w-full bg-[#F1F5F9] rounded-full h-2">
                  <div class="bar-fill bg-[#EF4444] h-2 rounded-full"
                       style="width:${(item.amount / summary.expense * 100).toFixed(1)}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      ` : ''}

      <!-- 本月记录列表 -->
      <div class="px-5 pb-4">
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold ${isDark ? 'text-white' : 'text-[#1E293B]'}">${monthLabel} 账单</h2>
            <span class="text-xs text-[#94A3B8]">${records.length} 笔</span>
          </div>
          ${records.length === 0 ? `
            <div class="text-center py-8 text-[#94A3B8] text-sm">本月暂无记录</div>
          ` : records.map(r => {
            const cat = getCategoryById(r.category)
            const isExp = r.type === 'expense'
            return `
              <div class="tx-row">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <span class="text-2xl shrink-0">${cat?.icon || '📦'}</span>
                  <div class="min-w-0">
                    <div class="text-sm font-medium ${isDark ? 'text-[#F1F5F9]' : 'text-[#1E293B]'} truncate">
                      ${cat?.name || '未分类'}${r.note ? ' · ' + r.note : ''}
                    </div>
                    <div class="text-xs text-[#94A3B8]">${r.date}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="font-semibold ${isExp ? 'text-[#EF4444]' : 'text-[#10B981]'}">
                    ${isExp ? '-' : '+'}¥${r.amount.toFixed(2)}
                  </span>
                  <button onclick='openModal("edit", ${JSON.stringify(r).replace(/'/g, "&#39;")})'
                          class="text-[#94A3B8] hover:text-[#4F46E5] text-sm px-1" title="编辑">✏️</button>
                  <button onclick="confirmDelete(${r.id})"
                          class="text-[#94A3B8] hover:text-[#EF4444] text-sm px-1" title="删除">✕</button>
                </div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    </div>
  `
}

// ==================== 统计页 ====================
function renderStats(summary, breakdown, trend, chartMax) {
  const isDark = document.documentElement.classList.contains('dark')

  return `
    <div class="${currentTab === 'stats' ? '' : 'hidden'}">
      <!-- 顶部 -->
      <div class="relative flex items-center justify-between px-5 py-4 bg-white border-b border-[#E2E8F0]">
        <h1 class="text-lg font-bold ${isDark ? 'text-white' : 'text-[#1E293B]'}">📊 统计报表</h1>
        <input type="month" id="month-picker" class="input-field w-36 text-sm" />
      </div>

      <!-- 月度汇总 -->
      <div class="px-5 py-4 grid grid-cols-4 gap-3">
        <div class="card text-center">
          <div class="text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'} mb-1">总支出</div>
          <div class="text-lg font-bold text-[#EF4444]">¥${summary.expense.toFixed(2)}</div>
        </div>
        <div class="card text-center">
          <div class="text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'} mb-1">总收入</div>
          <div class="text-lg font-bold text-[#10B981]">¥${summary.income.toFixed(2)}</div>
        </div>
        <div class="card text-center">
          <div class="text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'} mb-1">结余</div>
          <div class="text-lg font-bold ${summary.balance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}">
            ¥${summary.balance.toFixed(2)}
          </div>
        </div>
        <div class="card text-center">
          <div class="text-xs ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'} mb-1">笔数</div>
          <div class="text-lg font-bold ${isDark ? 'text-white' : 'text-[#1E293B]'}">${summary.count}</div>
        </div>
      </div>

      <!-- 近6月趋势（CSS 柱状图） -->
      <div class="px-5 pb-4">
        <div class="card">
          <h2 class="font-semibold mb-4 ${isDark ? 'text-white' : 'text-[#1E293B]'}">近6个月趋势</h2>
          <div class="flex items-end justify-between gap-2" style="height:180px;">
            ${trend.map(m => {
              const eH = (m.expense / chartMax * 140).toFixed(1)
              const iH = (m.income / chartMax * 140).toFixed(1)
              return `
                <div class="flex flex-col items-center flex-1 h-full justify-end">
                  <div class="flex items-end gap-1 w-full justify-center" style="height:140px;">
                    <div class="w-3 rounded-t bg-[#EF4444] transition-all" style="height:${eH}px;" title="支出 ¥${m.expense.toFixed(2)}"></div>
                    <div class="w-3 rounded-t bg-[#10B981] transition-all" style="height:${iH}px;" title="收入 ¥${m.income.toFixed(2)}"></div>
                  </div>
                  <span class="text-xs text-[#94A3B8] mt-2">${m.month}</span>
                </div>
              `
            }).join('')}
          </div>
          <div class="flex items-center justify-center gap-6 mt-4">
            <div class="flex items-center gap-1 text-xs text-[#94A3B8]">
              <span class="w-3 h-3 rounded-sm bg-[#EF4444] inline-block"></span> 支出
            </div>
            <div class="flex items-center gap-1 text-xs text-[#94A3B8]">
              <span class="w-3 h-3 rounded-sm bg-[#10B981] inline-block"></span> 收入
            </div>
          </div>
        </div>
      </div>

      <!-- 分类支出 -->
      <div class="px-5 pb-4">
        <div class="card">
          <h2 class="font-semibold mb-3 ${isDark ? 'text-white' : 'text-[#1E293B]'}">分类支出</h2>
          ${breakdown.length === 0 ? `
            <div class="text-center py-6 text-[#94A3B8] text-sm">本月暂无支出</div>
          ` : breakdown.map(item => `
            <div class="flex items-center gap-3 py-2">
              <span class="text-xl w-7 text-center">${item.icon}</span>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between text-sm mb-1">
                  <span class="${isDark ? 'text-[#F1F5F9]' : 'text-[#374151]'} font-medium">${item.name}</span>
                  <span class="text-[#EF4444] font-semibold">¥${item.amount.toFixed(2)}</span>
                </div>
                <div class="w-full bg-[#F1F5F9] rounded-full h-1.5">
                  <div class="bar-fill bg-[#EF4444] h-1.5 rounded-full"
                       style="width:${(item.amount / summary.expense * 100).toFixed(1)}%"></div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `
}

// ==================== 设置页 ====================
function renderSettings() {
  const isDark = document.documentElement.classList.contains('dark')
  const themeLabel = isDark ? '亮色模式' : '暗色模式'
  const scalePct = Math.round(fontScale * 100) + '%'

  return `
    <div class="${currentTab === 'settings' ? '' : 'hidden'}">
      <!-- 顶部 -->
      <div class="relative flex items-center px-5 py-4 bg-white border-b border-[#E2E8F0]">
        <h1 class="text-lg font-bold ${isDark ? 'text-white' : 'text-[#1E293B]'}">⚙️ 设置</h1>
      </div>

      <div class="px-5 py-4 space-y-4">
        <!-- 主题 -->
        <div class="card flex items-center justify-between">
          <div>
            <div class="font-medium ${isDark ? 'text-white' : 'text-[#1E293B]'}">主题模式</div>
            <div class="text-sm text-[#94A3B8]">当前：${isDark ? '暗色' : '亮色'}</div>
          </div>
          <button onclick="toggleTheme()" class="btn-secondary text-sm">${themeLabel}</button>
        </div>

        <!-- 字体缩放 -->
        <div class="card">
          <div class="font-medium mb-3 ${isDark ? 'text-white' : 'text-[#1E293B]'}">字体缩放</div>
          <div class="flex items-center justify-center gap-3">
            <button onclick="setZoom(0)" class="btn-secondary w-12 h-12 px-0 text-xl font-bold flex items-center justify-center" title="缩小">A−</button>
            <div class="flex flex-col gap-1 w-48">
              <div class="w-full bg-[#E2E8F0] rounded-full h-2">
                <div class="bg-[#4F46E5] h-2 rounded-full transition-all" style="width:${((fontScale - 0.8) / 0.7 * 100).toFixed(1)}%"></div>
              </div>
              <div class="flex justify-between text-xs text-[#94A3B8]">
                <span>80%</span>
                <span class="font-semibold text-[#4F46E5]">${scalePct}</span>
                <span>150%</span>
              </div>
            </div>
            <button onclick="setZoom(1)" class="btn-secondary w-12 h-12 px-0 text-xs font-medium flex items-center justify-center" title="重置">重置</button>
            <button onclick="setZoom(2)" class="btn-secondary w-12 h-12 px-0 text-xl font-bold flex items-center justify-center" title="放大">A+</button>
          </div>
        </div>

        <!-- 导出 CSV -->
        <div class="card flex items-center justify-between">
          <div>
            <div class="font-medium ${isDark ? 'text-white' : 'text-[#1E293B]'}">导出账单 CSV</div>
            <div class="text-sm text-[#94A3B8]">Excel 可打开的表格文件</div>
          </div>
          <button onclick="handleExportCSV()" class="btn-primary text-sm">导出</button>
        </div>

        <!-- 导出 JSON -->
        <div class="card flex items-center justify-between">
          <div>
            <div class="font-medium ${isDark ? 'text-white' : 'text-[#1E293B]'}">备份数据 JSON</div>
            <div class="text-sm text-[#94A3B8]">导出所有记录用于备份</div>
          </div>
          <button onclick="handleExportJSON()" class="btn-primary text-sm">备份</button>
        </div>

        <!-- 导入 JSON -->
        <div class="card flex items-center justify-between">
          <div>
            <div class="font-medium ${isDark ? 'text-white' : 'text-[#1E293B]'}">导入数据</div>
            <div class="text-sm text-[#94A3B8]">从备份文件恢复数据</div>
          </div>
          <label class="btn-secondary text-sm cursor-pointer">
            导入
            <input type="file" accept=".json" class="hidden" onchange="handleImportJSON(event)" />
          </label>
        </div>

        <!-- 清空数据 -->
        <div class="card flex items-center justify-between">
          <div>
            <div class="font-medium text-[#EF4444]">清空所有数据</div>
            <div class="text-sm text-[#94A3B8]">删除所有记录，不可恢复</div>
          </div>
          <button onclick="handleClearData()" class="px-4 py-2 rounded-lg font-medium text-sm bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FECACA] transition-colors">
            清空
          </button>
        </div>

        <!-- 关于 -->
        <div class="card">
          <h2 class="font-semibold mb-2 ${isDark ? 'text-white' : 'text-[#1E293B]'}">关于金金计较</h2>
          <p class="text-sm text-[#94A3B8]">版本 2.0.0</p>
          <p class="text-sm text-[#94A3B8] mt-1">一款简洁优雅的桌面记账应用</p>
          <p class="text-sm text-[#94A3B8] mt-2">基于 Vite + Vanilla JS + Tailwind CSS 开发</p>
        </div>
      </div>
    </div>
  `
}

// ==================== 弹窗（记一笔 / 编辑） ====================
function renderModal() {
  const isDark = document.documentElement.classList.contains('dark')
  const expenseCats = CATEGORIES.expense
  const incomeCats = CATEGORIES.income
  const allCats = formType === 'expense' ? expenseCats : incomeCats

  return `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal-content">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold ${isDark ? 'text-white' : 'text-[#1E293B]'}">
            ${modalType === 'add' ? '记一笔' : '编辑记录'}
          </h2>
          <button onclick="closeModal()" class="text-[#94A3B8] hover:text-[#1E293B] text-xl leading-none">✕</button>
        </div>

        <!-- 类型切换 -->
        <div class="flex gap-3 mb-5">
          <button onclick="setFormType('expense')"
            class="flex-1 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
              formType === 'expense'
                ? 'border-[#EF4444] bg-[#FEF2F2] text-[#EF4444]'
                : 'border-[#E2E8F0] text-[#94A3B8] hover:border-[#FECACA] hover:text-[#EF4444]'
            }">
            支出
          </button>
          <button onclick="setFormType('income')"
            class="flex-1 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
              formType === 'income'
                ? 'border-[#10B981] bg-[#ECFDF5] text-[#10B981]'
                : 'border-[#E2E8F0] text-[#94A3B8] hover:border-[#A7F3D0] hover:text-[#10B981]'
            }">
            收入
          </button>
        </div>

        <!-- 分类网格 -->
        <div class="mb-5">
          <label class="text-sm text-[#94A3B8] mb-2 block">分类</label>
          <div class="grid grid-cols-5 gap-2">
            ${allCats.map(cat => `
              <button onclick="setFormCategory(${cat.id})"
                class="cat-btn ${
                  formCategory === cat.id
                    ? (formType === 'expense' ? 'selected-expense' : 'selected-income')
                    : ''
                }">
                <span class="text-lg">${cat.icon}</span>
                <span>${cat.name}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- 金额 -->
        <div class="mb-5">
          <label class="text-sm text-[#94A3B8] mb-2 block">金额（元）</label>
          <input type="text" inputmode="decimal"
            value="${formAmount}"
            oninput="setFormAmount(this.value)"
            placeholder="0.00"
            class="amount-input text-[#1E293B] dark:text-white" />
        </div>

        <!-- 日期 -->
        <div class="mb-5">
          <label class="text-sm text-[#94A3B8] mb-2 block">日期</label>
          <input type="date" value="${formDate}"
            oninput="formDate=this.value"
            class="input-field" />
        </div>

        <!-- 备注 -->
        <div class="mb-6">
          <label class="text-sm text-[#94A3B8] mb-2 block">备注（可选）</label>
          <input type="text" value="${formNote}"
            oninput="formNote=this.value"
            placeholder="写点什么..."
            class="input-field" />
        </div>

        <!-- 保存按钮 -->
        <button onclick="saveRecord()" class="btn-primary w-full py-3 text-lg">
          ${modalType === 'add' ? '确认记录' : '保存修改'}
        </button>
      </div>
    </div>
  `
}

// ==================== 表单快捷函数 ====================
function setFormType(type) {
  formType = type
  formCategory = null
  render()
}

function setFormAmount(val) {
  formAmount = (val || '').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
}
function setFormCategory(id) {
  formCategory = id
  render()
}

// 挂载到 window 供 onclick 调用
window.switchTab = switchTab
window.openModal = openModal
window.closeModal = closeModal
window.saveRecord = saveRecord
window.confirmDelete = confirmDelete
window.toggleTheme = toggleTheme
window.setFormType = setFormType
window.setFormAmount = setFormAmount
window.setFormCategory = setFormCategory
window.handleExportJSON = handleExportJSON
window.handleImportJSON = handleImportJSON
window.handleExportCSV = handleExportCSV
window.handleClearData = handleClearData
window.setZoom = setZoom
window.switchCatTab = switchCatTab
window.openCatModal = openCatModal
window.closeCatModal = closeCatModal
window.saveCustomCategory = saveCustomCategory
window.confirmDeleteCustomCategory = confirmDeleteCustomCategory
window.setCatFormType = setCatFormType
window.setCatFormIcon = setCatFormIcon
window.setCatFormName = setCatFormName
