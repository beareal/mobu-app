// ===============================================
// Router & Screen Control (画面遷移と演出)
// ===============================================

/**
 * 指定されたIDの画面を表示する
 * @param {string} screenId 表示したい画面のID
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        window.scrollTo(0, 0);

        if (screenId === 'screen-line') {
            checkAndSetupEvent();
        }
    }
}

/**
 * 瞬き動画を再生し、指定のタイミングでコールバックを実行する
 * @param {function} onDarkMoment 動画が暗転したタイミングで実行する関数
 */
function playBlinkVideo(onDarkMoment) {
    const overlay = document.getElementById('video-overlay');
    const video = document.getElementById('blink-video');

    if (!overlay || !video) {
        console.warn("動画が見つかりません。通常遷移します。");
        if (onDarkMoment) onDarkMoment();
        return;
    }

    overlay.classList.add('active');
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.error("動画再生エラー:", error);
            if (onDarkMoment) onDarkMoment();
        });
    }

    setTimeout(() => {
        if (onDarkMoment) onDarkMoment();
    }, 500);

    video.onended = () => {
        overlay.classList.remove('active');
    };
}


/**
 * 完了したタスクの数に応じて、タスク報告画面の内容を動的に設定する
 * @param {string[]} completedTasks 完了したタスク名の配列
 */
function setupReportScreen(completedTasks) {
    showScreen('screen-report');

    const thoughtText = document.getElementById('report-thought-text');
    const selectionArea = document.getElementById('report-selection-area');

    selectionArea.innerHTML = '';
    selectionArea.style.display = 'none';

    const screenReport = document.getElementById('screen-report');
    const newScreenReport = screenReport.cloneNode(true);
    screenReport.parentNode.replaceChild(newScreenReport, screenReport);

    const currentScreen = document.getElementById('screen-report');
    const currentThoughtText = document.getElementById('report-thought-text');
    const currentSelectionArea = document.getElementById('report-selection-area');

    if (completedTasks.length === 1) {
        currentThoughtText.textContent = 'よし、完了！モブ君に報告しよっと♪';

        currentScreen.onclick = function() {
            localStorage.setItem('currentReportTask', completedTasks[0]);
            showScreen('screen-line');
        };
    } else {
        currentThoughtText.textContent = '今日は色々頑張ったけど、特に頑張った一つをモブ君に報告しよう。';
        currentSelectionArea.style.display = 'flex';
        currentSelectionArea.style.flexDirection = 'column';
        currentSelectionArea.style.gap = '10px';
        currentSelectionArea.style.marginTop = '15px';

        completedTasks.forEach(task => {
            const btn = document.createElement('button');
            btn.textContent = task;
            btn.className = 'cloud-btn';
            btn.style.padding = '10px 20px';
            btn.style.borderRadius = '20px';
            btn.style.border = '2px solid var(--line-deco-1)';
            btn.style.backgroundColor = 'var(--color-white)';
            btn.style.fontFamily = "'M PLUS Rounded 1c', sans-serif";
            btn.style.color = 'var(--text-dark)';
            btn.style.fontSize = '16px';
            btn.style.cursor = 'pointer';

            btn.onclick = function(e) {
                e.stopPropagation();
                localStorage.setItem('currentReportTask', task);
                showScreen('screen-line');
            };

            currentSelectionArea.appendChild(btn);
        });
        currentScreen.onclick = null;
    }
}


// ===============================================
// イベント分岐ロジック
// ===============================================
/**
 * イベント発生条件をチェックし、必要ならLINE画面にボタンなどを追加する
 */
function checkAndSetupEvent() {
    const previousTotal = getPreviousTotalTasks();
    const currentTotal = getTotalTasksCompleted();
    
    const chatArea = document.querySelector('#screen-line .line-chat');
    const existingEventUI = chatArea.querySelector('.event-ui-container');
    if (existingEventUI) {
        existingEventUI.remove();
    }

    const milestones = [10, 20, 30, 40];
    let eventOccurred = false;

    for (const milestone of milestones) {
        if (previousTotal < milestone && currentTotal >= milestone) {
            
            console.log(`イベント発生！ ${milestone}回目の節目を超えました。`);
            
            const eventUIContainer = document.createElement('div');
            eventUIContainer.className = 'event-ui-container';

            const message = document.createElement('div');
            message.className = 'line-message mobu';
            message.innerHTML = `<p>ところで、累計タスクが${milestone}個を超えましたね！<br>お店でささやかなお祝いをさせてください😊</p>`;
            
            const button = document.createElement('button');
            button.textContent = 'カフェへ向かう';
            button.className = 'btn-event';

            // ★★★ 修正点：瞬き演出を削除し、直接画面遷移させる ★★★
            button.onclick = function() {
                showScreen('screen-cafe');
            };

            eventUIContainer.appendChild(message);
            eventUIContainer.appendChild(button);

            setTimeout(() => {
                chatArea.appendChild(eventUIContainer);
                chatArea.scrollTop = chat.scrollHeight;
            }, 1000);

            eventOccurred = true;
            break;
        }
    }

    if (!eventOccurred) {
        console.log(`通常タスク報告。累計: ${currentTotal} (前回: ${previousTotal})`);
    }
}