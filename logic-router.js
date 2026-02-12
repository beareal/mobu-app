// ===============================================
// Router & Screen Control (画面遷移と演出)
// ===============================================

/**
 * LINE画面にアニメーション付きでメッセージを追加する
 * @param {string} sender 'mobu' または 'user'
 * @param {string} text 表示するメッセージのテキスト
 * @param {number} delay 表示するまでの遅延時間（ミリ秒）
 */
function appendLineMessage(sender, text, delay = 0) {
    const chatArea = document.querySelector('#screen-line .line-chat');
    if (!chatArea) return;

    setTimeout(() => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `line-message ${sender} new`;
        
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
        
        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight;

        messageDiv.addEventListener('animationend', () => {
            messageDiv.classList.remove('new');
        });
    }, delay);
}

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
            const chatArea = document.querySelector('#screen-line .line-chat');
            chatArea.innerHTML = '';
            
            const reportedTask = localStorage.getItem('currentReportTask');

            appendLineMessage('user', `「${reportedTask}」を完了！`, 500);
            appendLineMessage('mobu', `お疲れ様です！「${reportedTask}」を達成したんですね、すごいです！`, 1500);

            // ★★★ 変更点：タスク報告の2秒後に、確率で気分共有イベントを開始 ★★★
            setTimeout(() => {
                if (Math.random() < 0.5) { // 50%の確率
                    startMoodSharing();
                } else {
                    console.log("気分共有イベントは発生しませんでした。");
                    // 通常のイベントチェックに進む
                    checkAndSetupEvent();
                }
            }, 2000);
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
// Phase 4-2: 気分共有ロジック (ここから追加)
// ===============================================

/**
 * 気分共有イベントを開始する
 */
function startMoodSharing() {
    const inputBar = document.getElementById('line-input-bar');
    const stampSelector = document.getElementById('mood-stamp-selector');
    const stamps = document.querySelectorAll('.mood-stamp');

    // モブ君からの問いかけ（仮）
    const question = "ところで、今日の気分はどうですか？";
    appendLineMessage('mobu', question, 1000);

    setTimeout(() => {
        inputBar.style.display = 'none';
        stampSelector.style.display = 'grid';
    }, 1500);

    stamps.forEach(stamp => {
        // イベントリスナーが重複しないように一度クローンして置き換える
        const newStamp = stamp.cloneNode(true);
        stamp.parentNode.replaceChild(newStamp, stamp);
        
        newStamp.addEventListener('click', () => {
            handleMoodStampClick(newStamp.textContent);
        }, { once: true });
    });
}

/**
 * 気分スタンプがクリックされたときの処理
 * @param {string} mood 選択された気分のテキスト
 */
function handleMoodStampClick(mood) {
    const inputBar = document.getElementById('line-input-bar');
    const stampSelector = document.getElementById('mood-stamp-selector');

    appendLineMessage('user', mood, 300);

    let reply = "";
    switch (mood) {
        case '元気': reply = "元気なんですね！よかったです！"; break;
        case '嬉しい': reply = "何か嬉しいことがあったんですね！"; break;
        default: reply = `${mood}、なんですね。教えてくれてありがとうございます。`; break;
    }
    appendLineMessage('mobu', reply, 1300);

    setTimeout(() => {
        stampSelector.style.display = 'none';
        inputBar.style.display = 'block';

        // ★★★ 気分共有の会話が終わった後に、イベントチェックを実行 ★★★
        checkAndSetupEvent();
    }, 1800);
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

            button.onclick = function() {
                showScreen('screen-cafe');
            };

            eventUIContainer.appendChild(message);
            eventUIContainer.appendChild(button);

            // ★★★ 呼び出しタイミングが変わったので、setTimeoutの時間を調整 ★★★
            setTimeout(() => {
                chatArea.appendChild(eventUIContainer);
                chatArea.scrollTop = chatArea.scrollHeight;
            }, 500); 

            eventOccurred = true;
            break;
        }
    }

    if (!eventOccurred) {
        console.log(`通常タスク報告。累計: ${currentTotal} (前回: ${previousTotal})`);
    }
}