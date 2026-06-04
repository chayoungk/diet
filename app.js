let data = JSON.parse(localStorage.getItem('dietAnalysis')) || {
  goals: { weight: 58, cal: 1600, carb: 180, protein: 100, fat: 45, sugar: 50, sodium: 2000 },
  weights: [], meals: [], fastingDates: [], exercises: [], favoriteFoods: []
};

if (!data.goals)        data.goals = {};
if (!data.goals.weight)  data.goals.weight  = 58;
if (!data.goals.cal)     data.goals.cal     = 1600;
if (!data.goals.carb)    data.goals.carb    = 180;
if (!data.goals.protein) data.goals.protein = 100;
if (!data.goals.fat)     data.goals.fat     = 45;
if (!data.goals.sugar)   data.goals.sugar   = 50;
if (!data.goals.sodium)  data.goals.sodium  = 2000;
if (!data.fastingDates)  data.fastingDates  = [];
if (!data.exercises)     data.exercises     = [];
if (!data.favoriteFoods) data.favoriteFoods = [];

let charts = { calWeight: null, nutrientWeight: null };
let selectedMonth = null;
let calendarDate = new Date();
let selectedDate = getToday();

function save() { 
  localStorage.setItem('dietAnalysis', JSON.stringify(data)); 
  try { render(); } catch(e) { console.error('render error:', e); }
}
function getToday() { return new Date().toISOString().split('T')[0]; }

function saveSelectedWeight() {
  const w = parseFloat(document.getElementById('selectedWeightInput').value);
  if (!w) return alert('체중을 입력하세요');
  const idx = data.weights.findIndex(x => x.date === selectedDate);
  if (idx >= 0) data.weights[idx].weight = w;
  else data.weights.push({ date: selectedDate, weight: w });
  data.weights.sort((a, b) => b.date.localeCompare(a.date));
  save();
}

function addMeal() {
  const name = document.getElementById('mealName').value.trim();
  const type = document.getElementById('mealType').value;
  const cal = parseInt(document.getElementById('mealCal').value) || 0;
  const carb = parseInt(document.getElementById('mealCarb').value) || 0;
  const protein = parseInt(document.getElementById('mealProtein').value) || 0;
  const fat = parseInt(document.getElementById('mealFat').value) || 0;
  const sugar = parseInt(document.getElementById('mealSugar').value) || 0;
  const sodium = parseInt(document.getElementById('mealSodium').value) || 0;

  if (!name) return alert('음식명을 입력하세요');

  data.meals.push({
    id: Date.now(), date: selectedDate, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    type: type, name, cal, carb, protein, fat, sugar, sodium
  });

  clearMealInputs();
  save();
}

function clearMealInputs() {
  document.getElementById('mealName').value = '';
  document.getElementById('mealCal').value = '';
  document.getElementById('mealCarb').value = '';
  document.getElementById('mealProtein').value = '';
  document.getElementById('mealFat').value = '';
  document.getElementById('mealSugar').value = '';
  document.getElementById('mealSodium').value = '';
  document.getElementById('mealAutocomplete').innerHTML = '';
}

function addToFavorites() {
  const name = document.getElementById('mealName').value.trim();
  const cal = parseInt(document.getElementById('mealCal').value) || 0;
  const carb = parseInt(document.getElementById('mealCarb').value) || 0;
  const protein = parseInt(document.getElementById('mealProtein').value) || 0;
  const fat = parseInt(document.getElementById('mealFat').value) || 0;
  const sugar = parseInt(document.getElementById('mealSugar').value) || 0;
  const sodium = parseInt(document.getElementById('mealSodium').value) || 0;

  if (!name) return alert('음식명을 입력하세요');

  const exists = data.favoriteFoods.some(f => f.name === name);
  if (exists) return alert('이미 즐겨찾기에 등록된 음식입니다');

  data.favoriteFoods.push({ name, cal, carb, protein, fat, sugar, sodium });
  alert('즐겨찾기에 추가되었습니다!');
  save();
}

function deleteMeal(id) { if (!confirm('식사 기록을 삭제하시겠습니까?')) return; data.meals = data.meals.filter(m => m.id !== id); save(); }

function addExercise() {
  const name = document.getElementById('exerciseName').value.trim();
  const duration = parseInt(document.getElementById('exerciseDuration').value) || 0;
  if (!name) return alert('운동명을 입력하세요');
  if (!duration) return alert('운동 시간(분)을 입력하세요');

  data.exercises.push({ id: Date.now(), date: selectedDate, name: name, duration: duration });
  document.getElementById('exerciseName').value = ''; document.getElementById('exerciseDuration').value = '';
  save();
}

function deleteExercise(id) { if (!confirm('운동 기록을 삭제하시겠습니까?')) return; data.exercises = data.exercises.filter(e => e.id !== id); save(); }
function toggleFasting() { const idx = data.fastingDates.indexOf(selectedDate); if (idx >= 0) data.fastingDates.splice(idx, 1); else data.fastingDates.push(selectedDate); save(); }

function saveGoals() {
  const w  = parseFloat(document.getElementById('goalWeight').value);
  const c  = parseInt(document.getElementById('goalCal').value);
  const cb = parseInt(document.getElementById('goalCarb').value);
  const p  = parseInt(document.getElementById('goalProtein').value);
  const f  = parseInt(document.getElementById('goalFat').value);
  const s  = parseInt(document.getElementById('goalSugar').value);
  const na = parseInt(document.getElementById('goalSodium').value);

  if (!w || !c) return alert('목표 체중과 칼로리는 필수입니다');

  data.goals = {
    weight:  w,
    cal:     c  || 1600,
    carb:    cb || 180,
    protein: p  || 100,
    fat:     f  || 45,
    sugar:   s  || 50,
    sodium:  na || 2000
  };

  localStorage.setItem('dietAnalysis', JSON.stringify(data));
  alert('✅ 설정이 저장되었습니다');
}

function clearCurrentMonthData() {
  const year = calendarDate.getFullYear();
  const monthStr = String(calendarDate.getMonth() + 1).padStart(2, '0');
  const targetMonth = `${year}-${monthStr}`;
  if (!confirm(`${targetMonth}월의 모든 기록을 삭제하시겠습니까?`)) return;
  
  data.weights = data.weights.filter(w => !w.date.startsWith(targetMonth));
  data.meals = data.meals.filter(m => !m.date.startsWith(targetMonth));
  data.exercises = data.exercises.filter(e => !e.date.startsWith(targetMonth));
  data.fastingDates = data.fastingDates.filter(d => !d.startsWith(targetMonth));
  save(); alert('삭제되었습니다.'); location.reload(); 
}

function clearData() { if (!confirm('정말 모든 데이터를 삭제하시겠습니까?')) return; localStorage.removeItem('dietAnalysis'); location.reload(); }

function getSelectedDateOverages() {
  const targetMeals = data.meals.filter(m => m.date === selectedDate);
  if (targetMeals.length === 0) return null;
  const total = targetMeals.reduce((sum, m) => ({
    cal: sum.cal + m.cal, carb: sum.carb + m.carb, protein: sum.protein + m.protein,
    fat: sum.fat + m.fat, sugar: sum.sugar + (m.sugar || 0), sodium: sum.sodium + m.sodium
  }), { cal: 0, carb: 0, protein: 0, fat: 0, sugar: 0, sodium: 0 });

  const overages = [];
  if (total.cal > data.goals.cal) overages.push(`칼로리(+${total.cal - data.goals.cal}kcal)`);
  if (total.carb > data.goals.carb) overages.push(`탄수화물(+${total.carb - data.goals.carb}g)`);
  if (total.fat > data.goals.fat) overages.push(`지방(+${total.fat - data.goals.fat}g)`);
  if (total.sugar > data.goals.sugar) overages.push(`당(+${total.sugar - data.goals.sugar}g)`);
  if (total.sodium > data.goals.sodium) overages.push(`나트륨(+${total.sodium - data.goals.sodium}mg)`);
  return overages;
}

function renderCalendar() {
  const year = calendarDate.getFullYear(); const month = calendarDate.getMonth();
  document.getElementById('calendarMonth').textContent = `${year}년 ${month + 1}월`;
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  let html = '';
  ['일', '월', '화', '수', '목', '금', '토'].forEach(day => { html += `<div class="calendar-header">${day}</div>`; });

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i; const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    html += `<div class="calendar-day other-month" onclick="selectDate('${date}')"><div class="calendar-day-number">${day}</div></div>`;
  }

  const today = getToday();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isFastingDay = data.fastingDates.includes(dateStr);
    const hasExercise = data.exercises.filter(e => e.date === dateStr).length > 0;

    const dayMeals = data.meals.filter(m => m.date === dateStr);
    const totalCal = dayMeals.reduce((sum, m) => sum + m.cal, 0);
    const isOverCal = totalCal > data.goals.cal;

    const classes = ['calendar-day', dateStr === today ? 'today' : '', dateStr === selectedDate ? 'selected' : '', dayMeals.length > 0 ? 'has-meal' : '', isOverCal ? 'over-cal' : ''].filter(Boolean).join(' ');

    let mealPreview = `<div class="empty-meal" style="font-size:11px;color:#3b423e;text-align:center;margin-top:4px;">·</div>`;
    if (dayMeals.length > 0) {
      // 식사 타입별 이모티콘
      const typeEmojis = { '아침': '🌅', '점심': '☀️', '저녁': '🌙', '간식': '🍪' };
      const mealTypes = [...new Set(dayMeals.map(m => m.type || '간식'))];
      const mealIcons = mealTypes.map(t => typeEmojis[t] || '🍴').join('');
      mealPreview = `<div style="font-size:13px;line-height:1.2;margin-bottom:2px;">${mealIcons}${hasExercise ? '🏃' : ''}</div><div class="calendar-day-cal ${isOverCal ? 'danger' : 'safe'}">${totalCal}kcal</div>`;
    } else if (hasExercise) {
      mealPreview = `<div style="font-size:13px;line-height:1.2;margin-bottom:2px;">🏃</div>`;
    }

    html += `<div class="${classes}" onclick="selectDate('${dateStr}')">
      ${isFastingDay ? `<div class="calendar-fasting-badge">🌙</div>` : ''}
      <div class="calendar-day-number">${day}</div>
      ${mealPreview}
    </div>`;
  }

  const totalCells = firstDayOfWeek + daysInMonth; const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let day = 1; day <= remainingCells; day++) {
    const date = `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    html += `<div class="calendar-day other-month" onclick="selectDate('${date}')"><div class="calendar-day-number">${day}</div></div>`;
  }
  document.getElementById('calendar').innerHTML = html;
}

function changeCalendarMonth(delta) { calendarDate.setMonth(calendarDate.getMonth() + delta); renderCalendar(); }
function goToToday() { calendarDate = new Date(); selectedDate = getToday(); renderCalendar(); renderSelectedDate(); renderInsights(); }
function selectDate(date) { selectedDate = date; renderCalendar(); renderSelectedDate(); renderInsights(); }

function renderSelectedDate() {
  const dateObj = new Date(selectedDate + 'T00:00:00');
  document.getElementById('selectedDateTitle').textContent = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

  const fastingBtn = document.getElementById('fastingToggleBtn');
  if (data.fastingDates.includes(selectedDate)) { fastingBtn.innerHTML = '🌙 단식일 해제'; fastingBtn.classList.add('active'); }
  else { fastingBtn.innerHTML = '🌙 단식일 지정'; fastingBtn.classList.remove('active'); }

  const weightRecord = data.weights.find(w => w.date === selectedDate);
  document.getElementById('selectedDateWeightDisplay').textContent = weightRecord ? `${weightRecord.weight} kg` : '미기록';
  document.getElementById('selectedWeightInput').value = weightRecord ? weightRecord.weight : '';

  const dayMeals = data.meals.filter(m => m.date === selectedDate);
  if (dayMeals.length === 0) {
    document.getElementById('selectedDateSummary').innerHTML = '<div class="empty" style="padding:12px; background:#1a1d1b; border-radius:8px;">이 날의 식사 기록이 없습니다.</div>';
  } else {
    const total = dayMeals.reduce((sum, m) => ({
      cal: sum.cal + m.cal, carb: sum.carb + m.carb, protein: sum.protein + m.protein,
      fat: sum.fat + m.fat, sugar: sum.sugar + (m.sugar || 0), sodium: sum.sodium + m.sodium
    }), { cal: 0, carb: 0, protein: 0, fat: 0, sugar: 0, sodium: 0 });

    const nutrients = [
      { name: '칼로리', current: total.cal, goal: data.goals.cal, unit: 'kcal' },
      { name: '탄수화물', current: total.carb, goal: data.goals.carb, unit: 'g' },
      { name: '단백질', current: total.protein, goal: data.goals.protein, unit: 'g' },
      { name: '지방', current: total.fat, goal: data.goals.fat, unit: 'g' },
      { name: '당', current: total.sugar, goal: data.goals.sugar, unit: 'g' },
      { name: '나트륨', current: total.sodium, goal: data.goals.sodium, unit: 'mg' }
    ];

    document.getElementById('selectedDateSummary').innerHTML = `<div class="nutrient-grid">${nutrients.map(n => {
      const pct = Math.round((n.current / n.goal) * 100); const isOver = n.current > n.goal;
      return `<div class="nutrient-box ${isOver ? 'over' : ''}"><div class="nutrient-name">${n.name}</div><div class="nutrient-value" style="font-size:16px">${n.current}<span class="unit">/${n.goal}${n.unit}</span></div><div class="nutrient-bar"><div class="nutrient-fill" style="width:${Math.min(pct, 100)}%"></div></div></div>`;
    }).join('')}</div>`;
  }

  document.getElementById('mealList').innerHTML = dayMeals.map(m => {
    const typeLabel = m.type || '간식';
    const isFav = isFavoriteFood(m.name);
    return `<div class="list-item"><div style="flex:1"><div style="margin-bottom:4px;"><span class="meal-tag meal-tag-${typeLabel}">${typeLabel}</span> <strong>${m.name}</strong></div><div style="font-size:12px;color:#6b7870;">${m.cal}kcal · 탄${m.carb}g · 단${m.protein}g · 지${m.fat}g${m.sugar ? ` · 당${m.sugar}g` : ''} · 나트륨${m.sodium}mg</div></div><div style="display:flex;gap:4px;align-items:center;"><button onclick="toggleFavFromMeal('${m.name.replace(/'/g,"\\'").replace(/"/g,'&quot;')}',${m.cal},${m.carb},${m.protein},${m.fat},${m.sugar||0},${m.sodium||0})" class="btn-small" style="font-size:18px;color:${isFav?'#fbbf24':'#4b5563'};" title="${isFav?'즐겨찾기 해제':'즐겨찾기 추가'}">${isFav?'⭐':'☆'}</button><button onclick="openEditMeal(${m.id})" class="btn-small" style="color:#64b5f6;font-size:14px !important;">✏️</button><button onclick="deleteMeal(${m.id})" class="btn-small">×</button></div></div>`;
  }).join('') || '';

  const dayExercises = data.exercises.filter(e => e.date === selectedDate);
  document.getElementById('exerciseList').innerHTML = dayExercises.map(e => `
    <div class="list-item" style="border: 1px solid rgba(100, 181, 246, 0.3);">
      <div><span class="meal-tag meal-tag-운동">🏃 운동</span><strong style="color:#e8ede9">${e.name}</strong> <span style="font-size:13px; color:#64b5f6; font-weight:bold; margin-left:8px;">${e.duration}분</span></div>
      <button onclick="deleteExercise(${e.id})" class="btn-small">×</button>
    </div>
  `).join('') || '';
}

function renderInsights() {
  const overages = getSelectedDateOverages();
  let html = `<h2>💡 오늘의 목표 (${selectedDate.slice(5)})</h2>`;
  if (overages === null) html += `<div class="insight insight-normal"><div class="insight-icon">📝</div><div><div class="insight-title">식단을 기록해주세요</div></div></div>`;
  else if (overages.length > 0) html += `<div class="insight insight-warning"><div class="insight-icon">⚠️</div><div><div class="insight-title">영양소 초과 주의</div><div class="insight-desc">${overages.join(', ')} 섭취 초과</div></div></div>`;
  else html += `<div class="insight insight-normal"><div class="insight-icon">✅</div><div><div class="insight-title">완벽합니다!</div><div class="insight-desc">목표치 이내 유지 중</div></div></div>`;
  document.getElementById('insights').innerHTML = html;
}

function renderCalWeightChart(targetMonth) {
  const ctx = document.getElementById('calWeightChart'); if (!ctx) return;
  const [year, month] = targetMonth.split('-');
  const daysInMonth = new Date(year, month, 0).getDate();
  const labels = []; const calData = []; const weightData = []; const exerciseFlags = []; const fastingFlags = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${targetMonth}-${String(day).padStart(2, '0')}`;
    labels.push(`${day}일`);
    const dayMeals = data.meals.filter(m => m.date === dateStr);
    calData.push(dayMeals.reduce((sum, m) => sum + m.cal, 0));
    const wRecord = data.weights.find(w => w.date === dateStr);
    weightData.push(wRecord ? wRecord.weight : null);
    exerciseFlags.push(data.exercises.some(e => e.date === dateStr));
    fastingFlags.push(data.fastingDates.includes(dateStr));
  }

  if (charts.calWeight) charts.calWeight.destroy();
  charts.calWeight = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: '체중 (kg)', data: weightData, type: 'line', yAxisID: 'yWeight', borderColor: '#7dff8f', backgroundColor: '#7dff8f', borderWidth: 2, pointRadius: 2, spanGaps: true, tension: 0.2 }, { label: '칼로리', data: calData, yAxisID: 'yCal', backgroundColor: calData.map(c => c > data.goals.cal ? 'rgba(255, 107, 107, 0.7)' : 'rgba(100, 181, 246, 0.5)'), borderRadius: 2 }] },
    options: { layout: { padding: { bottom: 25 } }, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { color: '#9ba89d', font: {size: 10} } } }, scales: { x: { ticks: { color: '#6b7870', font: {size: 9} }, grid: { display: false } }, yCal: { type: 'linear', position: 'left', ticks: { color: '#6b7870', font: {size: 9} }, grid: { color: 'rgba(255,255,255,0.05)' } }, yWeight: { type: 'linear', position: 'right', ticks: { color: '#7dff8f', font: {size: 9} }, grid: { display: false } } } },
    plugins: [{
      id: 'markerPlugin',
      afterDraw: (chart) => {
        const ctx = chart.ctx; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; 
        for (let i = 0; i < labels.length; i++) {
          if (exerciseFlags[i] || fastingFlags[i]) {
            const targetX = chart.scales.x.getPixelForTick(i);
            const targetY = chart.scales.x.bottom + 2; 
            let text = ''; if (fastingFlags[i]) text += '🌙'; if (exerciseFlags[i]) text += '🏃';
            ctx.fillText(text, targetX, targetY);
          }
        }
      }
    }]
  });
}

function renderNutrientWeightChart(targetMonth) {
  const ctx = document.getElementById('nutrientWeightChart'); if (!ctx) return;
  const [year, month] = targetMonth.split('-');
  const daysInMonth = new Date(year, month, 0).getDate();
  const labels = []; const carbData = []; const proteinData = []; const sugarData = []; const weightData = []; const exerciseFlags = []; const fastingFlags = []; 

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${targetMonth}-${String(day).padStart(2, '0')}`;
    labels.push(`${day}일`);
    const dayMeals = data.meals.filter(m => m.date === dateStr);
    carbData.push(dayMeals.reduce((sum, m) => sum + m.carb, 0));
    proteinData.push(dayMeals.reduce((sum, m) => sum + m.protein, 0));
    sugarData.push(dayMeals.reduce((sum, m) => sum + (m.sugar||0), 0));
    const wRecord = data.weights.find(w => w.date === dateStr);
    weightData.push(wRecord ? wRecord.weight : null);
    exerciseFlags.push(data.exercises.some(e => e.date === dateStr));
    fastingFlags.push(data.fastingDates.includes(dateStr));
  }

  if (charts.nutrientWeight) charts.nutrientWeight.destroy();
  charts.nutrientWeight = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: '체중', data: weightData, yAxisID: 'yWeight', borderColor: '#7dff8f', backgroundColor: '#7dff8f', borderWidth: 2, pointRadius: 2, spanGaps: true, tension: 0.2 }, { label: '탄수화물', data: carbData, yAxisID: 'yNutri', borderColor: '#64b5f6', backgroundColor: 'rgba(100, 181, 246, 0.1)', borderWidth: 1, fill: true, spanGaps: true, pointRadius: 1 }, { label: '단백질', data: proteinData, yAxisID: 'yNutri', borderColor: '#c084fc', backgroundColor: 'rgba(192, 132, 252, 0.1)', borderWidth: 1, fill: true, spanGaps: true, pointRadius: 1 }] },
    options: { layout: { padding: { bottom: 25 } }, responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { color: '#9ba89d', font:{size:10} } } }, scales: { x: { ticks: { color: '#6b7870', font: {size: 9} }, grid: { display: false } }, yNutri: { type: 'linear', position: 'left', ticks: { color: '#6b7870', font:{size:9} }, grid: { color: 'rgba(255,255,255,0.05)' } }, yWeight: { type: 'linear', position: 'right', ticks: { color: '#7dff8f', font:{size:9} }, grid: { display: false } } } },
    plugins: [{
      id: 'markerPlugin',
      afterDraw: (chart) => {
        const ctx = chart.ctx; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; 
        for (let i = 0; i < labels.length; i++) {
          if (exerciseFlags[i] || fastingFlags[i]) {
            const targetX = chart.scales.x.getPixelForTick(i);
            const targetY = chart.scales.x.bottom + 2; 
            let text = ''; if (fastingFlags[i]) text += '🌙'; if (exerciseFlags[i]) text += '🏃';
            ctx.fillText(text, targetX, targetY);
          }
        }
      }
    }]
  });
}

function renderMonthCharts() {
  const now = new Date();
  const targetMonth = selectedMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  renderCalWeightChart(targetMonth); renderNutrientWeightChart(targetMonth);
}

function populateMonthSelector() {
  const selector = document.getElementById('monthSelector'); if (!selector) return;
  const months = new Set();
  data.meals.forEach(m => months.add(m.date.slice(0, 7))); data.weights.forEach(w => months.add(w.date.slice(0, 7)));
  const sortedMonths = Array.from(months).sort().reverse();
  const now = new Date(); const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  selector.innerHTML = `<option value="">이번 달 (${formatMonth(thisMonth)})</option>` + sortedMonths.map(month => `<option value="${month}">${formatMonth(month)}</option>`).join('');
  if (selectedMonth) selector.value = selectedMonth;
}

function formatMonth(monthStr) { const [year, month] = monthStr.split('-'); return `${year}년 ${parseInt(month)}월`; }
function changeMonth() { selectedMonth = document.getElementById('monthSelector').value || null; renderMonthStats(); renderMonthCharts(); }

function renderMonthStats() {
  const now = new Date();
  const targetMonth = selectedMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthMeals = data.meals.filter(m => m.date.startsWith(targetMonth));
  const monthWeights = data.weights.filter(w => w.date.startsWith(targetMonth));
  const monthExercises = data.exercises.filter(e => e.date.startsWith(targetMonth));
  const monthLabel = !selectedMonth ? '이번 달' : formatMonth(targetMonth);

  if (monthMeals.length === 0 && monthWeights.length === 0 && monthExercises.length === 0) { 
    document.getElementById('monthStats').innerHTML = `<div class="empty">${monthLabel} 데이터 없음</div>`; return; 
  }
  
  let html = '<div class="stats-grid">';
  const uniqueDays = new Set(monthMeals.map(m => m.date)).size;
  html += `<div class="stat-box"><div class="stat-label">기록 일수</div><div class="stat-value">${uniqueDays}일</div></div>`;
  if (monthMeals.length > 0 && uniqueDays > 0) html += `<div class="stat-box"><div class="stat-label">평균 칼로리</div><div class="stat-value">${Math.round(monthMeals.reduce((sum, m) => sum + m.cal, 0) / uniqueDays)}</div></div>`;
  if (monthExercises.length > 0) html += `<div class="stat-box"><div class="stat-label">운동</div><div class="stat-value" style="color:#64b5f6">${monthExercises.length}회</div></div>`;
  if (monthWeights.length >= 2) {
    const sorted = [...monthWeights].sort((a, b) => a.date.localeCompare(b.date));
    const change = Math.round((sorted[sorted.length - 1].weight - sorted[0].weight) * 10) / 10;
    html += `<div class="stat-box"><div class="stat-label">체중 변화</div><div class="stat-value" style="color:${change > 0 ? '#ff6b6b' : '#7dff8f'}">${change > 0 ? '+' : ''}${change}kg</div></div>`;
  }
  html += '</div>';
  document.getElementById('monthStats').innerHTML = html;
}

function analyzeFoodImpact() {
  const sorted = [...data.weights].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return [];
  const foodImpact = {};
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = sorted[i - 1].date;
    const weightChange = sorted[i].weight - sorted[i - 1].weight;
    const prevMeals = data.meals.filter(m => m.date === prevDate);
    prevMeals.forEach(meal => {
      if (!foodImpact[meal.name]) foodImpact[meal.name] = { totalChange: 0, count: 0, totalCal: 0 };
      foodImpact[meal.name].totalChange += weightChange;
      foodImpact[meal.name].count += 1;
      foodImpact[meal.name].totalCal += meal.cal;
    });
  }
  return Object.keys(foodImpact).map(name => {
    const impact = foodImpact[name];
    return { name, avgChange: Math.round(impact.totalChange / impact.count * 10) / 10, count: impact.count, avgCal: Math.round(impact.totalCal / impact.count) };
  }).sort((a, b) => b.avgChange - a.avgChange);
}

function renderFoodImpact() {
  const impacts = analyzeFoodImpact();
  if (impacts.length === 0) { document.getElementById('foodImpact').innerHTML = '<div class="empty">분석할 데이터가 부족합니다.</div>'; return; }
  document.getElementById('foodImpact').innerHTML = '<div class="food-impact-list">' + impacts.slice(0, 10).map((food, i) => `
    <div class="food-impact-item ${food.avgChange > 0.2 ? 'bad' : food.avgChange < -0.1 ? 'good' : ''}">
      <div class="rank">${i + 1}</div>
      <div class="food-info"><div class="food-name">${food.name}</div><div class="food-detail">평균 ${food.avgCal}kcal · ${food.count}회</div></div>
      <div class="impact-value ${food.avgChange > 0 ? 'negative' : 'positive'}">${food.avgChange > 0 ? '+' : ''}${food.avgChange}kg</div>
    </div>`).join('') + '</div>';
}

function renderFrequentFoods() {
  const foodCount = {}; data.meals.forEach(meal => { foodCount[meal.name] = (foodCount[meal.name] || 0) + 1; });
  const sorted = Object.entries(foodCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  document.getElementById('frequentFoods').innerHTML = sorted.length === 0 ? '<div class="empty">데이터 부족</div>' : sorted.map(([name, count], i) => `
    <div class="list-item"><div style="display:flex;align-items:center;gap:12px"><span style="font-weight:700;color:#6b7870;min-width:24px">${i + 1}</span><span style="font-weight:600">${name}</span></div><span style="color:#7dff8f;font-weight:600">${count}회</span></div>
  `).join('');
}

function renderRiskyCombos() {
  const sorted = [...data.weights].sort((a, b) => a.date.localeCompare(b.date));
  const dayImpact = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = sorted[i - 1].date;
    const weightChange = sorted[i].weight - sorted[i - 1].weight;
    const meals = data.meals.filter(m => m.date === prevDate);
    if (meals.length >= 2 && weightChange > 0.3) {
      dayImpact.push({ foods: meals.map(m => m.name).join(' + '), weightChange, totalCal: meals.reduce((sum, m) => sum + m.cal, 0) });
    }
  }
  dayImpact.sort((a, b) => b.weightChange - a.weightChange);
  document.getElementById('riskyCombos').innerHTML = dayImpact.length === 0 ? '<div class="empty">조합 데이터 부족</div>' : dayImpact.slice(0, 5).map(item => `
    <div class="list-item" style="flex-direction:column;align-items:flex-start">
      <div style="display:flex;justify-content:space-between;width:100%;margin-bottom:6px"><strong style="color:#ff6b6b">${item.foods}</strong><span style="color:#ff6b6b;font-weight:700">+${item.weightChange.toFixed(1)}kg</span></div>
      <div style="font-size:12px;color:#6b7870">총 ${item.totalCal}kcal</div>
    </div>`).join('');
}

function openEditMeal(id) {
  const meal = data.meals.find(m => m.id === id);
  if (!meal) return;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'editMealModal';
  overlay.innerHTML = `
    <div class="modal-box">
      <div class="modal-title">
        <span>✏️ 식사 수정</span>
        <button onclick="closeEditMeal()" class="btn-small" style="font-size:20px !important;">×</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <select id="editMealType" class="input" style="flex:0.35;min-width:80px;padding:10px;">
          <option value="아침" ${meal.type==='아침'?'selected':''}>아침</option>
          <option value="점심" ${meal.type==='점심'?'selected':''}>점심</option>
          <option value="저녁" ${meal.type==='저녁'?'selected':''}>저녁</option>
          <option value="간식" ${meal.type==='간식'?'selected':''}>간식</option>
        </select>
        <input type="text" id="editMealName" class="input" value="${meal.name}" placeholder="음식명" style="flex:1;">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        <input type="number" id="editMealCal" class="input" placeholder="칼로리" value="${meal.cal||''}">
        <input type="number" id="editMealCarb" class="input" placeholder="탄수화물(g)" value="${meal.carb||''}">
        <input type="number" id="editMealProtein" class="input" placeholder="단백질(g)" value="${meal.protein||''}">
        <input type="number" id="editMealFat" class="input" placeholder="지방(g)" value="${meal.fat||''}">
        <input type="number" id="editMealSugar" class="input" placeholder="당(g)" value="${meal.sugar||''}">
        <input type="number" id="editMealSodium" class="input" placeholder="나트륨(mg)" value="${meal.sodium||''}">
      </div>
      <button onclick="saveEditMeal(${id})" class="btn" style="width:100%;">저장</button>
    </div>`;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeEditMeal(); });
  document.body.appendChild(overlay);
}

function closeEditMeal() {
  const modal = document.getElementById('editMealModal');
  if (modal) modal.remove();
}

function saveEditMeal(id) {
  const meal = data.meals.find(m => m.id === id);
  if (!meal) return;
  const name = document.getElementById('editMealName').value.trim();
  if (!name) return alert('음식명을 입력하세요');
  meal.type = document.getElementById('editMealType').value;
  meal.name = name;
  meal.cal = parseInt(document.getElementById('editMealCal').value) || 0;
  meal.carb = parseInt(document.getElementById('editMealCarb').value) || 0;
  meal.protein = parseInt(document.getElementById('editMealProtein').value) || 0;
  meal.fat = parseInt(document.getElementById('editMealFat').value) || 0;
  meal.sugar = parseInt(document.getElementById('editMealSugar').value) || 0;
  meal.sodium = parseInt(document.getElementById('editMealSodium').value) || 0;
  closeEditMeal();
  save();
}

// 기본 음식 데이터베이스
const DEFAULT_FOODS = [
  { name: '현미밥', cal: 160, carb: 35, protein: 3, fat: 1, sugar: 0, sodium: 2 },
  { name: '닭가슴살 블랙알리오', cal: 120, carb: 6, protein: 19, fat: 3, sugar: 4, sodium: 450 },
  { name: '닭가슴살 양념치킨', cal: 130, carb: 6, protein: 20, fat: 3, sugar: 4, sodium: 410 },
  { name: '삶은달걀', cal: 68, carb: 1, protein: 6, fat: 4, sugar: 1, sodium: 62 },
  { name: '바나나', cal: 77, carb: 20, protein: 1, fat: 0, sugar: 14, sodium: 5 },
  { name: '요거트', cal: 65, carb: 5, protein: 3, fat: 4, sugar: 5, sodium: 50 },
  { name: '사과', cal: 52, carb: 14, protein: 0, fat: 0, sugar: 10, sodium: 1 },
  { name: '단호박', cal: 29, carb: 7, protein: 1, fat: 0, sugar: 2, sodium: 0 },
];

// 자동완성: 기존 음식 목록 가져오기
function getUniqueFoods() {
  const foodMap = new Map();
  DEFAULT_FOODS.forEach(f => foodMap.set(f.name, f));
  // 사용자 입력 음식은 덮어쓰기 (더 정확한 수치 반영)
  data.meals.forEach(m => {
    if (m.cal > 0) foodMap.set(m.name, { name: m.name, cal: m.cal, carb: m.carb, protein: m.protein, fat: m.fat, sugar: m.sugar || 0, sodium: m.sodium });
  });
  return Array.from(foodMap.values());
}

// 자동완성 렌더
function showMealAutocomplete(value) {
  const container = document.getElementById('mealAutocomplete');
  if (!container) return;
  if (!value.trim()) { container.innerHTML = ''; return; }
  
  const uniqueFoods = getUniqueFoods();
  const favorites = data.favoriteFoods.filter(f => f.name.toLowerCase().includes(value.toLowerCase())).slice(0, 3);
  const favNames = new Set(favorites.map(f => f.name));
  const filtered = uniqueFoods.filter(f => f.name.toLowerCase().includes(value.toLowerCase()) && !favNames.has(f.name)).slice(0, 6);
  
  if (favorites.length === 0 && filtered.length === 0) { container.innerHTML = ''; return; }

  let html = '';
  if (favorites.length > 0) {
    html += `<div style="padding:4px 0;border-bottom:1px solid #272b29;"><div style="font-size:11px;color:#6b7870;padding:4px 10px;">⭐ 즐겨찾기</div>`;
    html += favorites.map(f => `<div class="autocomplete-item" onclick="selectAutocompleteMeal('${f.name.replace(/'/g,"\\'").replace(/"/g,'&quot;')}',${f.cal},${f.carb},${f.protein},${f.fat},${f.sugar||0},${f.sodium||0})"><strong>${f.name}</strong><span style="font-size:11px;color:#6b7870;margin-left:8px;">${f.cal}kcal</span></div>`).join('');
    html += `</div>`;
  }
  if (filtered.length > 0) {
    html += `<div style="padding:4px 0;"><div style="font-size:11px;color:#6b7870;padding:4px 10px;">음식 목록</div>`;
    html += filtered.map(f => `<div class="autocomplete-item" onclick="selectAutocompleteMeal('${f.name.replace(/'/g,"\\'").replace(/"/g,'&quot;')}',${f.cal},${f.carb},${f.protein},${f.fat},${f.sugar||0},${f.sodium||0})"><strong>${f.name}</strong><span style="font-size:11px;color:#6b7870;margin-left:8px;">${f.cal}kcal</span></div>`).join('');
    html += `</div>`;
  }
  container.innerHTML = html;
}

function selectAutocompleteMeal(name, cal, carb, protein, fat, sugar, sodium) {
  document.getElementById('mealName').value = name;
  document.getElementById('mealCal').value = cal;
  document.getElementById('mealCarb').value = carb;
  document.getElementById('mealProtein').value = protein;
  document.getElementById('mealFat').value = fat;
  document.getElementById('mealSugar').value = sugar;
  document.getElementById('mealSodium').value = sodium;
  const c = document.getElementById('mealAutocomplete');
  if (c) c.innerHTML = '';
}

// 외부 클릭 시 드롭다운 닫기
document.addEventListener('click', (e) => {
  const input = document.getElementById('mealName');
  const dropdown = document.getElementById('mealAutocomplete');
  if (dropdown && input && !input.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.innerHTML = '';
  }
});

// 즐겨찾기 토글
function toggleFavoriteFood(name, cal, carb, protein, fat, sugar, sodium) {
  const idx = data.favoriteFoods.findIndex(f => f.name === name);
  if (idx >= 0) {
    data.favoriteFoods.splice(idx, 1);
  } else {
    data.favoriteFoods.push({ name, cal, carb, protein, fat, sugar, sodium });
  }
  save();
  renderFavoriteFoods();
}

function isFavoriteFood(name) {
  return data.favoriteFoods.some(f => f.name === name);
}

function renderFavoriteFoods() {
  const container = document.getElementById('favoriteFoodsContainer');
  if (!container) return;

  if (data.favoriteFoods.length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = '<div style="margin-bottom:12px;"><div style="font-size:12px;color:#6b7870;margin-bottom:8px;font-weight:600;">⭐ 즐겨찾기</div>';
  html += data.favoriteFoods.map(f => `
    <div class="list-item" style="justify-content:space-between;">
      <div style="flex:1;">
        <div style="font-weight:600;margin-bottom:2px;">${f.name}</div>
        <div style="font-size:11px;color:#6b7870;">${f.cal}kcal · 탄${f.carb}g · 단${f.protein}g · 지${f.fat}g</div>
      </div>
      <div style="display:flex;gap:4px;">
        <button onclick="selectAutocompleteMeal('${f.name.replace(/'/g, "\\'")}', ${f.cal}, ${f.carb}, ${f.protein}, ${f.fat}, ${f.sugar}, ${f.sodium})" class="btn-small" style="color:#64b5f6;padding:4px 8px;font-size:13px !important;">선택</button>
        <button onclick="removeFavoriteFood('${f.name.replace(/'/g, "\\'")}');" class="btn-small" style="color:#ff6b6b;">×</button>
      </div>
    </div>`).join('');
  html += '</div>';

  container.innerHTML = html;
}

function removeFavoriteFood(name) {
  if (!confirm('즐겨찾기에서 삭제하시겠습니까?')) return;
  data.favoriteFoods = data.favoriteFoods.filter(f => f.name !== name);
  save();
}


// 식사 목록에서 직접 즐겨찾기 토글
function toggleFavFromMeal(name, cal, carb, protein, fat, sugar, sodium) {
  const idx = data.favoriteFoods.findIndex(f => f.name === name);
  if (idx >= 0) {
    data.favoriteFoods.splice(idx, 1);
  } else {
    data.favoriteFoods.push({ name, cal, carb, protein, fat, sugar, sodium });
  }
  save();
}

function render() {
  renderCalendar(); renderSelectedDate(); renderInsights(); renderFavoriteFoods();
  const latestWeight = data.weights[0];
  if (latestWeight) {
    const toGo = Math.round((latestWeight.weight - data.goals.weight) * 10) / 10;
    document.getElementById('headerStatus').textContent = `현재 ${latestWeight.weight}kg · 목표까지 ${Math.abs(toGo)}kg`;
  } else document.getElementById('headerStatus').textContent = '다이어트를 시작해보세요!';
  
  renderMonthStats();
  document.getElementById('goalWeight').value = data.goals.weight; document.getElementById('goalCal').value = data.goals.cal;
  document.getElementById('goalCarb').value = data.goals.carb; document.getElementById('goalProtein').value = data.goals.protein;
  document.getElementById('goalFat').value = data.goals.fat; document.getElementById('goalSugar').value = data.goals.sugar;
  document.getElementById('goalSodium').value = data.goals.sodium;
}

function switchTab(tabName, element) {
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  if (element) element.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');

  if (tabName === 'main') { renderCalendar(); renderSelectedDate(); renderInsights(); renderFavoriteFoods(); }
  if (tabName === 'stats') { populateMonthSelector(); setTimeout(() => { renderMonthStats(); renderMonthCharts(); }, 100); }
  if (tabName === 'analysis') { renderFoodImpact(); renderFrequentFoods(); renderRiskyCombos(); }
}

window.addExercise = addExercise; window.deleteExercise = deleteExercise; window.toggleFasting = toggleFasting; window.saveSelectedWeight = saveSelectedWeight; window.addMeal = addMeal; window.deleteMeal = deleteMeal; window.saveGoals = saveGoals; window.clearData = clearData; window.clearCurrentMonthData = clearCurrentMonthData; window.switchTab = switchTab; window.changeMonth = changeMonth; window.changeCalendarMonth = changeCalendarMonth; window.goToToday = goToToday; window.selectDate = selectDate; window.openEditMeal = openEditMeal; window.closeEditMeal = closeEditMeal; window.saveEditMeal = saveEditMeal; window.showMealAutocomplete = showMealAutocomplete; window.selectAutocompleteMeal = selectAutocompleteMeal; window.toggleFavoriteFood = toggleFavoriteFood; window.addToFavorites = addToFavorites; window.removeFavoriteFood = removeFavoriteFood; window.toggleFavFromMeal = toggleFavFromMeal;
render();