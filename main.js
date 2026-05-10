// ===============================================
// Main Logic (繧､繝吶Φ繝医Μ繧ｹ繝翫・縺ｮ逋ｻ骭ｲ)
// ===============================================
// 笘・ｿｽ蜉: 莠碁㍾謚ｼ縺鈴亟豁｢繝輔Λ繧ｰ
let isCompleting = false;
// ===============================================
// STEP 4-A: 繧ｿ繧ｹ繧ｯID 竊・繧ｫ繝・ざ繝ｪ繝ｼ閭梧勹濶ｲ繝槭ャ繝・
// ===============================================
const TASK_ICON_MAP = {
    'task-select-1':  'assets/images/icon_hotwater_24.svg',
    'task-select-2':  'assets/images/icon_snack_24.svg',
    'task-select-3':  'assets/images/icon_fruits_24.svg',
    'task-select-4':  'assets/images/icon_phone_24.svg',
    'task-select-5':  'assets/images/icon_clean_24.svg',
    'task-select-6':  'assets/images/icon_thanks_24.svg',
    'task-select-7':  'assets/images/icon_stretch_24.svg',
    'task-select-8':  'assets/images/icon_stairs_24.svg',
    'task-select-9':  'assets/images/icon_posture_24.svg',
    'task-select-10': 'assets/images/icon_skincare_24.svg',
    'task-select-11': 'assets/images/icon_lips_24.svg',
    'task-select-12': 'assets/images/icon_breath_24.svg',
};
const TASK_CATEGORY_MAP = {
    'task-select-1':  'var(--chip-color-diet)',
    'task-select-2':  'var(--chip-color-diet)',
    'task-select-3':  'var(--chip-color-diet)',
    'task-select-4':  'var(--chip-color-lifestyle)',
    'task-select-5':  'var(--chip-color-lifestyle)',
    'task-select-6':  'var(--chip-color-mental)',
    'task-select-7':  'var(--chip-color-shapeup)',
    'task-select-8':  'var(--chip-color-shapeup)',
    'task-select-9':  'var(--chip-color-shapeup)',
    'task-select-10': 'var(--chip-color-beauty)',
    'task-select-11': 'var(--chip-color-beauty)',
    'task-select-12': 'var(--chip-color-mental)',
};
function updateHomeTasks() {
    isCompleting = false;
    const storedTasks = localStorage.getItem('selectedTasks');
    const storedIds   = JSON.parse(localStorage.getItem('selectedTaskIds') || '[]');
    if (!storedTasks) return;

    const tasks = JSON.parse(storedTasks);
    const chips = document.querySelectorAll('.task-chip-home');
    const completed = getCompletedToday();

    chips.forEach((chip, index) => {
        const label = chip.querySelector('.chip-label');
        const iconWrap = chip.querySelector('.chip-icon-wrap');

        if (label && tasks[index]) label.textContent = tasks[index];

        const taskId = storedIds[index];
        if (taskId && TASK_CATEGORY_MAP[taskId]) {
            chip.style.backgroundColor = TASK_CATEGORY_MAP[taskId];
        }

        if (completed && completed.taskIndices.includes(index)) {
            chip.classList.add('completed');
            iconWrap.innerHTML = '';
chip.classList.add('checked');
        } else {
            chip.classList.remove('completed', 'checked');
            iconWrap.innerHTML = '';
            const iconPath = TASK_ICON_MAP[taskId];
            if (iconPath) {
                const img = document.createElement('img');
                img.src = iconPath;
                img.className = 'chip-icon-home';
                img.alt = '';
                iconWrap.appendChild(img);
            }
        }
    });
}

// ===============================================
// STEP 4-B: 縺願干SVG繧堤函謌舌☆繧矩未謨ｰ
// ===============================================
function createFlowerSVG() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 40 40');
    svg.setAttribute('width', '40');
    svg.setAttribute('height', '40');

    // 闌趣ｼ医メ繧ｧ繝・け繝槭・繧ｯ蠖｢・・
    const check = document.createElementNS(ns, 'polyline');
    check.setAttribute('points', '8,22 16,30 32,12');
    check.setAttribute('stroke', '#7caf7c');
    check.setAttribute('stroke-width', '3');
    check.setAttribute('fill', 'none');
    check.setAttribute('stroke-linecap', 'round');
    check.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(check);

    // 闃ｱ縺ｳ繧嘉・
    const petalAngles = [0, 72, 144, 216, 288];
    petalAngles.forEach(angle => {
        const ellipse = document.createElementNS(ns, 'ellipse');
        ellipse.setAttribute('cx', '20');
        ellipse.setAttribute('cy', '14');
        ellipse.setAttribute('rx', '4');
        ellipse.setAttribute('ry', '7');
        ellipse.setAttribute('fill', '#ffb7c5');
        ellipse.setAttribute('opacity', '0.85');
        ellipse.setAttribute('transform', `rotate(${angle} 20 20)`);
        svg.appendChild(ellipse);
    });

    // 闃ｱ縺ｮ荳ｭ蠢・
    const center = document.createElementNS(ns, 'circle');
    center.setAttribute('cx', '20');
    center.setAttribute('cy', '20');
    center.setAttribute('r', '5');
    center.setAttribute('fill', '#ffe066');
    svg.appendChild(center);

    return svg;
}

// ===============================================
// STEP 4-B: 繝√ャ繝励ｒ螳御ｺ・憾諷九↓縺吶ｋ髢｢謨ｰ
// ===============================================
function completeChip(chipEl) {
    if (chipEl.classList.contains('completed')) return;

    chipEl.classList.add('completed');

    // 繧｢繧､繧ｳ繝ｳ繧偵♀闃ｱ縺ｫ蟾ｮ縺玲崛縺・
    const iconWrap = chipEl.querySelector('.chip-icon-wrap');
iconWrap.innerHTML = '';
chipEl.classList.add('checked');

    // Clear! 繧定｡ｨ遉ｺ縺励※繝輔ぉ繝ｼ繝峨い繧ｦ繝・
   const clearText = chipEl.querySelector('.chip-clear-text');
clearText.classList.add('show');
setTimeout(() => {
    clearText.classList.remove('show');
}, 2000);
}
// DOM縺瑚ｪｭ縺ｿ霎ｼ縺ｾ繧後◆繧峨い繝励Μ繧貞・譛溷喧
document.addEventListener('DOMContentLoaded', function() {
    generateUserId(); //
    initializeNotificationFeatures();

    // 繧ｵ繝懊ｊ蛻､螳壹ｒ譛蛻昴↓陦後≧
    checkAbandonment();
    showSlotMessage();
    // 蛻､螳壼ｾ後↓蠕ｩ蟶ｰ繝舌リ繝ｼ・域ｮｵ髫・・峨・繝√ぉ繝・け繧定｡後≧
    showRecoveryFollowUpNotification();
 

    // 笘・・笘・縺薙％縺九ｉ縺梧怙蠕後・莉穂ｸ翫￡ 笘・・笘・
    // Service Worker縺九ｉ繝｡繝・そ繝ｼ繧ｸ繧貞女縺大叙繧九Μ繧ｹ繝翫・
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'notification-clicked') {
            console.log('繧｢繝励Μ縺碁幕縺・※縺・ｋ迥ｶ諷九〒騾夂衍繧ｯ繝ｪ繝・け繧呈､懃衍・・);
            handleOSNotificationClick(event.data.notificationType, event.data.message);
        }
    });

    // 繧｢繝励Μ襍ｷ蜍墓凾縺ｫURL縺ｮ繝上ャ繧ｷ繝･繧偵メ繧ｧ繝・け
    if (window.location.hash) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const type = params.get('notificationType');
        const message = params.get('message');
        if (type && message) {
            console.log('URL繝上ャ繧ｷ繝･縺九ｉ騾夂衍繧ｯ繝ｪ繝・け繧呈､懃衍・・);
            handleOSNotificationClick(type, decodeURIComponent(message));
            // 蜃ｦ逅・ｾ後↓繝上ャ繧ｷ繝･繧偵け繝ｪ繧｢縺励※繝ｪ繝ｭ繝ｼ繝峨↓繧医ｋ蜀榊ｮ溯｡後ｒ髦ｲ縺・
            history.replaceState(null, null, ' ');
        }
    // 笘・・笘・縺薙％縺ｾ縺ｧ縺梧怙蠕後・莉穂ｸ翫￡ 笘・・笘・
    }
    generateUserId();
    updateHomeTasks();
    const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('from') === 'notification') {
    history.replaceState(null, null, window.location.pathname);
    const appPhase = localStorage.getItem('appPhase');
    if (appPhase === 'main_loop') {
        updateHomeTasks();
        showScreen('screen-home');
        return;
    }
}
showSplashScreen();

    // --- 蜷・判髱｢縺ｮ繧､繝吶Φ繝医Μ繧ｹ繝翫・繧堤匳骭ｲ ---

    // A-1: 繧ｦ繧ｧ繝ｫ繧ｫ繝逕ｻ髱｢
    const welcomeScreen = document.getElementById('screen-welcome');
    if (welcomeScreen) {
        welcomeScreen.addEventListener('click', function() {
            const appPhase = localStorage.getItem('appPhase');
            const nickname = localStorage.getItem('nickname');

            if (appPhase === 'main_loop') {
                updateHomeTasks();
                showScreen('screen-home');
            } else if (nickname) {
                if (appPhase === 'introduction_task_select') {
                    showScreen('screen-task-select');
                } else if (appPhase === 'introduction_motivation') {
                    localStorage.setItem('appPhase', 'main_loop');
                    updateHomeTasks();
                    showScreen('screen-home');
               } else {
    const selectedTasks = localStorage.getItem('selectedTasks');
    if (!selectedTasks) {
        showScreen('screen-task-select');
    } else {
        updateHomeTasks();
        showScreen('screen-home');
    }
}
            } else {
                showScreen('screen-name');
            }
            });
    }

    // A-2: 蜷榊燕蜈･蜉帷判髱｢
    const nameScreen = document.getElementById('screen-name');
    if (nameScreen) {
        const nicknameInput = nameScreen.querySelector('#nickname-input');
        const errorMessage = nameScreen.querySelector('#error-message');
        const nameScreenButton = nameScreen.querySelector('.btn-primary');

        if (nicknameInput && nameScreenButton) {
            nicknameInput.addEventListener('input', function() {
                const value = this.value;
                const invalidChars = /[#@%・・ｼ・・/u;
                if (invalidChars.test(value)) {
                    errorMessage.textContent = '邨ｵ譁・ｭ励ｄ迚ｹ谿願ｨ伜捷縺ｯ菴ｿ縺医∪縺帙ｓ';
                    nameScreenButton.disabled = true;
                    return;
                }
                if (value.length === 0 || value.length > 10) {
                    errorMessage.textContent = value.length > 10 ? '10譁・ｭ嶺ｻ･蜀・〒蜈･蜉帙＠縺ｦ縺上□縺輔＞' : '';
                    nameScreenButton.disabled = true;
                    return;
                }
                errorMessage.textContent = '';
                nameScreenButton.disabled = false;
            });

            nameScreenButton.addEventListener('click', function() {
                if (this.disabled) return;
                const nickname = nicknameInput.value.trim();
                localStorage.setItem('nickname', nickname);
                playBlinkVideo(() => {
                    showScreen('screen-cafe');
                });
            });
        }
    }

    // A-3: 繧ｿ繧ｹ繧ｯ驕ｸ謚樒判髱｢
    const taskSelectScreen = document.getElementById('screen-task-select');
    if (taskSelectScreen) {
        const taskCheckboxes = taskSelectScreen.querySelectorAll('input[type="checkbox"]');
        const taskSelectButton = taskSelectScreen.querySelector('.btn-primary');

        if (taskCheckboxes.length > 0 && taskSelectButton) {
            taskCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const checkedCount = taskSelectScreen.querySelectorAll('input[type="checkbox"]:checked').length;
                    if (checkedCount > 3) {
                        this.checked = false;
                    }
                    taskSelectButton.disabled = (taskSelectScreen.querySelectorAll('input[type="checkbox"]:checked').length !== 3);
                });
            });

            taskSelectButton.addEventListener('click', function() {
                if (this.disabled) return;

                const selectedTasks = [];
                const selectedTaskIds = [];
                taskSelectScreen.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                    selectedTasks.push(checkbox.parentElement.querySelector('label').textContent.trim());
                    selectedTaskIds.push(checkbox.id);
                });
                localStorage.setItem('selectedTasks', JSON.stringify(selectedTasks));
                localStorage.setItem('selectedTaskIds', JSON.stringify(selectedTaskIds));
                updateHomeTasks();
                
                schedulePeriodicNotifications(selectedTaskIds);
             

                const appPhase = localStorage.getItem('appPhase');
                if (appPhase === 'main_loop') {
                    alert('繧ｿ繧ｹ繧ｯ繧貞､画峩縺励∪縺励◆縲・);
                    showScreen('screen-home');
                } else {
                    playBlinkVideo(() => {
                        showScreen('screen-cafe');
                    }, true);
                }
            });
        }
    }

   // B-1: 繝帙・繝逕ｻ髱｢
   const homeScreen = document.getElementById('screen-home');
   if (homeScreen) {
       const homeChips = homeScreen.querySelectorAll('.task-chip-home');
       const homeCompleteButton = homeScreen.querySelector('.btn-primary');
       const profileIcon = document.getElementById('nav-profile-icon');
       const settingsIcon = document.getElementById('nav-settings-icon');
   
   
       // 繝√ャ繝励ｒ繧ｿ繝・・縺励◆繧峨メ繧ｧ繝・け迥ｶ諷九ｒ繝医げ繝ｫ・亥ｮ御ｺ・ｸ医∩縺ｯ辟｡隕厄ｼ・
       homeChips.forEach((chip) => {
           chip.addEventListener('click', function() {
            
               if (this.classList.contains('completed')) return;
               const checkbox = this.querySelector('.chip-checkbox');
               checkbox.checked = !checkbox.checked;
  const iconWrap = this.querySelector('.chip-icon-wrap');
if (checkbox.checked) {
    this.classList.add('checked');
    const clearText = this.querySelector('.chip-clear-text');
    clearText.classList.add('show');
    setTimeout(() => clearText.classList.remove('show'), 2000);
} else {
    this.classList.remove('checked');
}
               // 螳御ｺ・・繧ｿ繝ｳ縺ｮ豢ｻ諤ｧ蛻ｶ蠕｡・井ｺ碁㍾謚ｼ縺嶺ｸｭ繧ら┌蜉ｹ蛹悶☆繧九ｈ縺・↓蠑ｷ蛹厄ｼ・
               const checkedCount = homeScreen.querySelectorAll('.chip-checkbox:checked').length;
               homeCompleteButton.disabled = (checkedCount === 0 || isCompleting);
           });
        });
       // 螳御ｺ・・繧ｿ繝ｳ
       homeCompleteButton.addEventListener('click', function() {
           // 笘・ｿｮ豁｣: 莠碁㍾螳溯｡後・繧ｬ繝ｼ繝・
           if (this.disabled || isCompleting) return;
           isCompleting = true;
           this.disabled = true;
   
           try {
   
               // 莉頑律縺ｮ荳企剞繝√ぉ繝・け・・etGameDate蝓ｺ貅厄ｼ・
               const today = getGameDate();
               const log = getAchievementLog();
               if ((log[today] || 0) >= 3) {
                   console.log("莉頑律縺ｮ荳企剞縺ｫ驕斐＠縺ｦ縺・∪縺・);
                   return;
               }
   
               const completedTasks = [];
               const completedIndices = [];
   
               homeChips.forEach((chip, index) => {
                   const checkbox = chip.querySelector('.chip-checkbox');
                   if (checkbox.checked) {
                       completedTasks.push(chip.querySelector('.chip-label').textContent);
                       completedIndices.push(index);
                   }
               });
   
               // 縺願干貍泌・
               completedIndices.forEach(i => completeChip(homeChips[i]));
   
               // 繝・・繧ｿ菫晏ｭ・
               const currentTotal = getTotalTasksCompleted();
               setPreviousTotalTasks(currentTotal);
               addTasksCompleted(completedTasks.length);
                              // 譛蠕後↓繧ｿ繧ｹ繧ｯ繧貞ｮ御ｺ・＠縺溘ご繝ｼ繝譌･莉假ｼ域悃4譎ょ渕貅厄ｼ峨ｒ菫晏ｭ・
               saveLastCompletionGameDate();

               recordTodayAchievement(completedTasks.length);
   
               // 譌｢蟄倥・螳御ｺ・ｸ医∩繧､繝ｳ繝・ャ繧ｯ繧ｹ縺ｨ繝槭・繧ｸ縺励※菫晏ｭ・
               const existing = getCompletedToday();
               const existingIndices = existing ? existing.taskIndices : [];
               const mergedIndices = [...new Set([...existingIndices, ...completedIndices])];
               saveCompletedToday(mergedIndices);
   
               renderCalendar(currentCalendarDate);
               
               // 逕ｻ髱｢驕ｷ遘ｻ
               if (currentTotal === 0) {
                   localStorage.setItem('isFirstReport', 'true');
                   localStorage.setItem('tempCompletedTasks', JSON.stringify(completedTasks));
                   playBlinkVideo(() => { showScreen('screen-cafe'); });
               } else {
                   playBlinkVideo(() => { setupReportScreen(completedTasks); });
               }
   
           } catch (error) {
               console.error("螳御ｺ・・逅・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆:", error);
               // 繧ｨ繝ｩ繝ｼ譎ゅ・繝懊ち繝ｳ繧貞・蠎ｦ謚ｼ縺帙ｋ繧医≧縺ｫ謌ｻ縺・
               isCompleting = false;
               const checkedCount = homeScreen.querySelectorAll('.chip-checkbox:checked').length;
               homeCompleteButton.disabled = (checkedCount === 0);
           }
       });
   
       if (profileIcon) {
           profileIcon.addEventListener('click', function() {
               showProfileScreen();
               playProfileRewardAnimationIfNeeded();
           });
       }
   
       if (settingsIcon) {
           settingsIcon.addEventListener('click', function() {
               showSettingsScreen();
           });
       }
   }


    // C-2: LINE逕ｻ髱｢
    const lineBackIcon = document.querySelector('#screen-line .line-header img');
    if (lineBackIcon) {
      lineBackIcon.addEventListener('click', function() {
    const followUp = getRecoveryFollowUp();
    const mobuVersion = getMobuVersion();
    if (followUp && !followUp.shown && mobuVersion !== 'ver1') {
        const verNum = mobuVersion.replace('ver', '');
        const levelNum = followUp.level.replace('lv', '');
        showCinematicScene(verNum, levelNum);
    } else {
        showScreen('screen-home');
    }
});
    }

    // B-3: 繝励Ο繝輔ぅ繝ｼ繝ｫ逕ｻ髱｢
    const profileBackButton = document.getElementById('profile-back-button');
    if (profileBackButton) {
        profileBackButton.addEventListener('click', function() {
            showScreen('screen-home');
        });
    }
    
    // D-3: 繧ｹ繧ｿ繝・ヵ繝ｭ繝ｼ繝ｫ逕ｻ髱｢
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.addEventListener('click', function() {
            resetAllData();
            playBlinkVideo(() => {
                showScreen('screen-welcome');
            });
        });
    }

    // A-4: 險ｭ螳夂判髱｢
    const settingsBackButton = document.getElementById('settings-back-button');
    if (settingsBackButton) {
        settingsBackButton.addEventListener('click', function() {
            showScreen('screen-home');
        });
    }

    const saveNicknameButton = document.getElementById('save-nickname-button');
    const resetTasksButton = document.getElementById('reset-tasks-button');
    const settingNicknameInput = document.getElementById('setting-nickname-input');

    if (saveNicknameButton && settingNicknameInput) {
        saveNicknameButton.addEventListener('click', function() {
            const newNickname = settingNicknameInput.value.trim();
            if (newNickname && newNickname.length <= 10) {
                localStorage.setItem('nickname', newNickname);
                alert('繝九ャ繧ｯ繝阪・繝繧剃ｿ晏ｭ倥＠縺ｾ縺励◆・・);
            } else {
                alert('繝九ャ繧ｯ繝阪・繝縺ｯ1譁・ｭ嶺ｻ･荳・0譁・ｭ嶺ｻ･蜀・〒蜈･蜉帙＠縺ｦ縺上□縺輔＞縲・);
            }
        });
    }

    if (resetTasksButton) {
        resetTasksButton.addEventListener('click', function() {
            const isConfirmed = confirm('譛ｬ蠖薙↓繧ｿ繧ｹ繧ｯ繧帝∈縺ｳ逶ｴ縺励∪縺吶°・歃n縺薙ｌ縺ｾ縺ｧ縺ｮ繧ｿ繧ｹ繧ｯ驕疲・蝗樊焚縺ｯ繝ｪ繧ｻ繝・ヨ縺輔ｌ縺ｾ縺帙ｓ縺ｮ縺ｧ縲√＃螳牙ｿ・￥縺縺輔＞縲・);
            if (isConfirmed) {
                showScreen('screen-task-select');
            }
        });
    }

// --- 繧ｫ繝ｬ繝ｳ繝繝ｼ縺ｮ繧､繝吶Φ繝郁ｨｭ螳夲ｼ医％縺薙°繧会ｼ・---
const calTitleEl = document.getElementById('cal-title');
if (calTitleEl) {
    calTitleEl.addEventListener('click', (e) => {
        if (e.detail === 3) {
            const newVal = window.prompt('邏ｯ遨阪ち繧ｹ繧ｯ謨ｰ繧貞・蜉帙＠縺ｦ縺ｭ', '8');
            if (newVal !== null) {
                localStorage.setItem('totalTasksCompleted', newVal);
                const today = getGameDate();
                const log = getAchievementLog();
                delete log[today];
                localStorage.setItem('achievementLog', JSON.stringify(log));
                location.reload();
            }
        }
    });
}

const calPrevEl = document.getElementById('cal-prev');
if (calPrevEl) {
    calPrevEl.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar(currentCalendarDate);
    });
}

const calNextEl = document.getElementById('cal-next');
if (calNextEl) {
    calNextEl.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar(currentCalendarDate);
    });
}

// 繧ｫ繝ｬ繝ｳ繝繝ｼ繧堤樟蝨ｨ縺ｮ陦ｨ遉ｺ譛医〒蛻晄悄蛹・
renderCalendar(currentCalendarDate || new Date());
// --- 繧ｫ繝ｬ繝ｳ繝繝ｼ縺ｮ繧､繝吶Φ繝郁ｨｭ螳夲ｼ医％縺薙∪縺ｧ・・---

});


/**
 * OS繝阪う繝・ぅ繝夜夂衍縺後け繝ｪ繝・け縺輔ｌ縺溘→縺阪↓繝輔ぉ繧､繧ｯ騾夂衍繧偵ヨ繝ｪ繧ｬ繝ｼ縺吶ｋ
 * @param {string} notificationType - 'periodic' 縺ｾ縺溘・ 'onee'
 * @param {string} message - 騾夂衍縺ｮ譛ｬ譁・
 */
function handleOSNotificationClick(notificationType, message) {
    const notificationMap = {
        'periodic': { type: 'periodic', sender: '繝｢繝門菅', icon: 'assets/images/mobu_icon_v1.png' },
        'onee': { type: 'onee', sender: '繝｢繝門菅', icon: 'assets/images/mobu_icon_v1.png' }, // 繧｢繧､繧ｳ繝ｳ縺ｯ蠕後〒螟画峩蜿ｯ閭ｽ
        'test': { type: 'test', sender: '繝・せ繝亥菅', icon: 'assets/images/mobu_icon_v1.png' }
    };
    
    const info = notificationMap[notificationType];
    if (info) {
        showFakeNotification(info.sender, message, info.icon, info.type);
    }
}


/**
 * 繧｢繝励Μ襍ｷ蜍墓凾縺ｮ騾夂衍陦ｨ遉ｺ繧堤ｮ｡逅・☆繧具ｼ磯壼ｸｸ襍ｷ蜍墓凾縺ｮ縺ｿ・・
 */
function handleAppLaunchNotification() {
    if (document.visibilityState !== 'visible') return;

    const mobuState = getMobuState();
    if (mobuState === 'normal') return;

    const iineKey = 'iine_display_log';
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    let iineLog = JSON.parse(localStorage.getItem(iineKey) || '{"date":"","count":0,"lastTime":0}');

    if (iineLog.date !== today) {
        iineLog = { date: today, count: 0, lastTime: 0 };
    }

    if (now - iineLog.lastTime < 30 * 60 * 1000) return;
    if (iineLog.count >= 3) return;

    const dialogues = oneeNotificationDialogues[mobuState];
    if (!dialogues || dialogues.length === 0) return;

    const message = dialogues[Math.floor(Math.random() * dialogues.length)];
    iineLog.count += 1;
    iineLog.lastTime = now;
    localStorage.setItem(iineKey, JSON.stringify(iineLog));

    showFakeNotification('繝｢繝門菅', message, 'assets/images/mobu_icon_v1.png', 'onee');
}


// Service Worker縺ｨ騾夂衍縺ｮ蛻晄悄蛹・
async function initializeNotificationFeatures() {
    if (!('serviceWorker' in navigator)) return;
  
    try {
        const registration = await navigator.serviceWorker.register('/mobu-app/sw.js');
        console.log('Service Worker逋ｻ骭ｲ謌仙粥:', registration);
        document.addEventListener('DOMContentLoaded', async function() {
        setupForegroundMessageHandler();
        await requestNotificationPermission();
        });
    } catch (error) {
        console.error('蛻晄悄蛹悶お繝ｩ繝ｼ:', error);
    }
}

// 螳壽凾騾夂衍縺ｮ莠育ｴ・ｼ・CM繝医・繧ｯ繝ｳ繧値ocalStorage縺ｫ菫晏ｭ倥☆繧九□縺托ｼ・
function schedulePeriodicNotifications(taskIds) {
    const taskTimeMap = {
      'morning': ['task-select-1', 'task-select-3', 'task-select-10'],
      'afternoon': ['task-select-2', 'task-select-5', 'task-select-7', 'task-select-8', 'task-select-9', 'task-select-11'],
      'night': ['task-select-4', 'task-select-6', 'task-select-12']
    };
  
    const schedule = {};
    taskIds.forEach(id => {
      if (taskTimeMap.morning.includes(id)) schedule.morning = '07:30';
      if (taskTimeMap.afternoon.includes(id)) schedule.afternoon = '12:30';
      if (taskTimeMap.night.includes(id)) schedule.night = '22:30';
    });
  
    localStorage.setItem('notificationSchedule', JSON.stringify(schedule));
    console.log('騾夂衍繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ繧剃ｿ晏ｭ倥＠縺ｾ縺励◆:', schedule);
  }

  // 騾夂衍險ｱ蜿ｯ繧偵Θ繝ｼ繧ｶ繝ｼ謫堺ｽ懷ｾ後↓豎ゅａ繧・
async function requestNotificationPermission() {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('騾夂衍險ｱ蜿ｯ縺悟ｾ励ｉ繧後∪縺励◆縲・CM繝医・繧ｯ繝ｳ繧貞叙蠕励＠縺ｾ縺吶・);
      const { initializeFCM } = await import('./firebase-config.js');
      await initializeFCM();
    } else {
      console.log('騾夂衍縺瑚ｨｱ蜿ｯ縺輔ｌ縺ｾ縺帙ｓ縺ｧ縺励◆縲・);
    }
  }

  /**
 * 繝輔Λ繝・す繝･逕ｻ髱｢・井ｸ也阜B・峨ｒ陦ｨ遉ｺ縺励∵囓霆｢・狗椪縺埼浹縺ｧ荳也阜A縺ｸ驕ｷ遘ｻ縺吶ｋ
 */
  function showSplashScreen() {
    const fadeOverlay = document.getElementById('fade-overlay');

    const playBlink = () => {
        const blink = new Audio();
        blink.src = 'assets/sounds/blink.mp3';
        blink.onerror = () => { blink.src = 'assets/sounds/blink.webm'; };
        blink.play().catch(() => {});
    };

    showScreen('screen-splash');

    setTimeout(() => {
        // 1蝗樒岼縺ｮ繝代メ繝・ｼ区囓霆｢髢句ｧ・
        playBlink();
        fadeOverlay.classList.add('active');

        setTimeout(() => {
            // 證苓ｻ｢荳ｭ縺ｫ繧ｦ繧ｧ繝ｫ繧ｫ繝逕ｻ髱｢縺ｸ蛻・ｊ譖ｿ縺・
            showScreen('screen-welcome');

            setTimeout(() => {
                // 2蝗樒岼縺ｮ繝代メ繝・
                playBlink();

                setTimeout(() => {
                    // 繝代メ繝・・蠕後↓證苓ｻ｢隗｣髯､
                    fadeOverlay.classList.remove('active');
                }, 200);

            }, 300);

        }, 500);

    }, 1000);
}

document.addEventListener('visibilitychange', showRecoveryFollowUpNotification);
document.addEventListener('visibilitychange', showOneeNotification);

document.addEventListener('visibilitychange', handleAppLaunchNotification);
let currentCalendarDate = new Date();

function renderCalendar(date) {
    const totalTasks = getTotalTasksCompleted();

    // 繝・・繝櫁ｨｭ螳・
    const themes = [
        { color: '#F2C9DB', dark: '#c97fa0' }, // 繝斐Φ繧ｯ (0-9)
        { color: '#D0E0FB', dark: '#6a8fd8' }, // 繝悶Ν繝ｼ (10-19)
        { color: '#FFF4D7', dark: '#c9a84c' }, // 繧､繧ｨ繝ｭ繝ｼ (20-29)
        { color: '#E6E6FA', dark: '#8a7fc9' }, // 繝ｩ繝吶Φ繝繝ｼ (30+)
    ];
    const themeIndex = Math.min(Math.floor(totalTasks / 10), 3);
    const theme = themes[themeIndex];

    // 譛医ち繧､繝医Ν
    const year = date.getFullYear();
    const month = date.getMonth();
    document.getElementById('cal-title').textContent =
        `${year}蟷ｴ${month + 1}譛・;

    // 驕疲・繝ｭ繧ｰ蜿門ｾ・
    const log = getAchievementLog();

    // 譌･莉倥そ繝ｫ繧堤函謌・
    const container = document.getElementById('calendar-days');
    container.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = getGameDate();

    // 遨ｺ逋ｽ繧ｻ繝ｫ
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day empty';
        container.appendChild(empty);
    }

    // 譌･莉倥そ繝ｫ
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        if (dateStr === today) cell.classList.add('today');

        const dateNum = document.createElement('span');
        dateNum.className = 'cal-date';
        dateNum.textContent = d;
        cell.appendChild(dateNum);

        // 驕疲・譌･縺ｯ繝√Η繝ｼ繝ｪ繝・・SVG繧定｡ｨ遉ｺ
        if (log[dateStr]) {
            const count = log[dateStr]; // 1縲・
            const size = count === 1 ? 12 : count === 2 ? 16 : 20;
const svg = createTulipSVG(theme.color, theme.dark, size);
cell.appendChild(svg);
        }

        container.appendChild(cell);
    }
}

function createTulipSVG(petalColor, stemColor, size) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 16 20');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size * 1.25);
    svg.setAttribute('class', 'cal-flower');

    // 闌・
    const stem = document.createElementNS(ns, 'line');
    stem.setAttribute('x1', '8'); stem.setAttribute('y1', '20');
    stem.setAttribute('x2', '8'); stem.setAttribute('y2', '11');
    stem.setAttribute('stroke', stemColor);
    stem.setAttribute('stroke-width', '1.2');
    stem.setAttribute('stroke-linecap', 'round');
    svg.appendChild(stem);

    // 闡・
    const leaf = document.createElementNS(ns, 'path');
    leaf.setAttribute('d', 'M8 15 Q5 13 4 10');
    leaf.setAttribute('stroke', stemColor);
    leaf.setAttribute('stroke-width', '1');
    leaf.setAttribute('fill', 'none');
    leaf.setAttribute('stroke-linecap', 'round');
    svg.appendChild(leaf);

    // 闃ｱ縺ｳ繧会ｼ亥ｷｦ・・
    const petalL = document.createElementNS(ns, 'ellipse');
    petalL.setAttribute('cx', '6'); petalL.setAttribute('cy', '8');
    petalL.setAttribute('rx', '2.5'); petalL.setAttribute('ry', '4');
    petalL.setAttribute('fill', petalColor);
    petalL.setAttribute('transform', 'rotate(-15 6 8)');
    svg.appendChild(petalL);

    // 闃ｱ縺ｳ繧会ｼ亥承・・
    const petalR = document.createElementNS(ns, 'ellipse');
    petalR.setAttribute('cx', '10'); petalR.setAttribute('cy', '8');
    petalR.setAttribute('rx', '2.5'); petalR.setAttribute('ry', '4');
    petalR.setAttribute('fill', petalColor);
    petalR.setAttribute('transform', 'rotate(15 10 8)');
    svg.appendChild(petalR);

    // 闃ｱ縺ｳ繧会ｼ井ｸｭ螟ｮ・・
    const petalC = document.createElementNS(ns, 'ellipse');
    petalC.setAttribute('cx', '8'); petalC.setAttribute('cy', '7');
    petalC.setAttribute('rx', '2.2'); petalC.setAttribute('ry', '4');
    petalC.setAttribute('fill', petalColor);
    svg.appendChild(petalC);

    return svg;
}
