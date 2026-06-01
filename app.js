let data = JSON.parse(localStorage.getItem('dietAnalysis')) || {
  goals: { weight: 58, cal: 1600, carb: 180, protein: 100, fat: 45, sugar: 50, sodium: 2000 },
  weights: [], meals: [], fastingDates: [], exercises: []
};

if (!data.goals.sugar) data.goals.sugar = 50;
if (!data.fastingDates) data.fastingDates = [];
if (!data.exercises) data.exercises = [];

let charts = { calWeight: null, nutrientWeight: null };
let selectedMonth = null;
let calendarDate = new Date();
let selectedDate = getToday();

function save() { localStorage.setItem('dietAnalysis', JSON.stringify(data)); render(); }
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

  document.getElementById('mealName').value = ''; document.getElementById('mealCal').value = ''; document.getElementById('mealCarb').value = '';
  document.getElementById('mealProtein').value = ''; document.getElementById('mealFat').value = ''; document.getElementById('mealSugar').value = '';
  document.getElementById('mealSodium').value = '';
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
  data.goals.weight = parseFloat(document.getElementById('goalWeight').value) || 58;
  data.goals.cal = parseInt(document.getElementById('goalCal').value) || 1600;
  data.goals.carb = parseInt(document.getElementById('goalCarb').value) || 180;
  data.goals.protein = parseInt(document.getElementById('goalProtein').value) || 100;
  data.goals.fat = parseInt(document.getElementById('goalFat').value) || 45;
  data.goals.sugar = parseInt(document.getElementById('goalSugar').value) || 50;
  data.goals.sodium = parseInt(document.getElementById('goalSodium').value) || 2000;
  save(); alert('설정이 저장되었습니다');
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

    let mealPreview = `<div class="calendar-meal-name empty-meal">+</div>`;
    if (dayMeals.length > 0) {
      const firstMeal = dayMeals[0].name.length > 4 ? dayMeals[0].name.substring(0, 4) + '..' : dayMeals[0].name;
      mealPreview = `<div class="calendar-meal-name">🍱 ${firstMeal}${dayMeals.length > 1 ? ` 외` : ''}</div><div class="calendar-day-cal ${isOverCal ? 'danger' : 'safe'}">${totalCal}</div>`;
    }

    html += `<div class="${classes}" onclick="selectDate('${dateStr}')">
      ${isFastingDay ? `<div class="calendar-fasting-badge">🌙</div>` : ''}
      ${hasExercise ? `<div class="calendar-exercise-badge">🏃</div>` : ''}
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

    const nutrients = [{ name: '칼로리', current: total.cal, goal: data.goals.cal, unit: 'kcal' }, { name: '탄수화물', current: total.carb, goal: data.goals.carb, unit: 'g' }, { name: '단백질', current: total.protein, goal: data.goals.protein, unit: 'g' }];

    document.getElementById('selectedDateSummary').innerHTML = `<div class="nutrient-grid">${nutrients.map(n => {
      const pct = Math.round((n.current / n.goal) * 100); const isOver = n.current > n.goal;
      return `<div class="nutrient-box ${isOver ? 'over' : ''}"><div class="nutrient-name">${n.name}</div><div class="nutrient-value" style="font-size:16px">${n.current}<span class="unit">/${n.goal}${n.unit}</span></div><div class="nutrient-bar"><div class="nutrient-fill" style="width:${Math.min(pct, 100)}%"></div></div></div>`;
    }).join('')}</div>`;
  }

  document.getElementById('mealList').innerHTML = dayMeals.map(m => {
    const typeLabel = m.type || '간식';
    return `<div class="list-item"><div><div style="margin-bottom:4px;"><span class="meal-tag meal-tag-${typeLabel}">${typeLabel}</span> <strong>${m.name}</strong></div><div style="font-size:12px;color:#6b7870;">${m.cal}kcal · 탄${m.carb}g · 단${m.protein}g · 지${m.fat}g${m.sugar ? ` · 당${m.sugar}g` : ''} · 나트륨${m.sodium}mg</div></div><button onclick="deleteMeal(${m.id})" class="btn-small">×</button></div>`;
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
  let html = `<h2>💡 맞춤 코칭 (${selectedDate.slice(5)})</h2>`;
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

function render() {
  renderCalendar(); renderSelectedDate(); renderInsights();
  const latestWeight = data.weights[0];
  if (latestWeight) {
    const toGo = Math.round((latestWeight.weight - data.goals.weight) * 10) / 10;
    document.getElementById('headerStatus').textContent = `현재 ${latestWeight.weight}kg · 목표까지 ${Math.abs(toGo)}kg`;
  } else document.getElementById('headerStatus').textContent = '다이어트를 시작해보세요!';
  
  renderMonthStats(); renderFoodImpact();
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

  if (tabName === 'main') { renderCalendar(); renderSelectedDate(); renderInsights(); }
  if (tabName === 'stats') { populateMonthSelector(); setTimeout(() => { renderMonthStats(); renderMonthCharts(); }, 100); }
  if (tabName === 'analysis') { renderFrequentFoods(); renderRiskyCombos(); }
}

window.addExercise = addExercise; window.deleteExercise = deleteExercise; window.toggleFasting = toggleFasting; window.saveSelectedWeight = saveSelectedWeight; window.addMeal = addMeal; window.deleteMeal = deleteMeal; window.saveGoals = saveGoals; window.clearData = clearData; window.clearCurrentMonthData = clearCurrentMonthData; window.switchTab = switchTab; window.changeMonth = changeMonth; window.changeCalendarMonth = changeCalendarMonth; window.goToToday = goToToday; window.selectDate = selectDate;
render();