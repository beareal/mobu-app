// ===============================================
// State Management (データの保存・読み込み)
// ===============================================

/**

一意のユーザーIDを生成し、LocalStorageに保存する

@returns {string} 生成された、または既存のユーザーID
*/
function generateUserId() {
let userId = localStorage.getItem('userId');
if (!userId) {
userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
localStorage.setItem('userId', userId);
}
return userId;
}

/**

LocalStorageに保存されたタスクを読み込み、ホーム画面の表示を更新する
*/
function updateHomeTasks() {
    const storedTasks = localStorage.getItem('selectedTasks');
    if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        const homeLabels = document.querySelectorAll('.task-chip-home .chip-label');
        const homeInputs = document.querySelectorAll('.task-chip-home .chip-checkbox');

        tasks.forEach((taskName, index) => {
            if (homeLabels[index]) homeLabels[index].textContent = taskName;
            if (homeInputs[index]) {
                homeInputs[index].value = taskName;
                homeInputs[index].checked = false;
            }
        });
    }
}

// ===============================================
// 累計タスク達成回数の管理
// ===============================================

function getTotalTasksCompleted() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('test_total')) {
        return parseInt(urlParams.get('test_total'), 10);
    }
    return parseInt(localStorage.getItem('totalTasksCompleted') || '0', 10);
}

function addTasksCompleted(countToAdd) {
const currentTotal = getTotalTasksCompleted();
const newTotal = currentTotal + countToAdd;
localStorage.setItem('totalTasksCompleted', newTotal.toString());
}

function setPreviousTotalTasks(totalTasks) {
localStorage.setItem('previousTotalTasks', totalTasks.toString());
}

function getPreviousTotalTasks() {
return parseInt(localStorage.getItem('previousTotalTasks') || '0', 10);
}

// ===============================================
// Phase 3-5: オネェ化・放置判定ロジック (ここから追加)
// ===============================================

// 最後にタスクを完了したゲーム日付を更新・取得する
function saveLastCompletionGameDate() {
    localStorage.setItem('lastCompletionGameDate', getGameDate());
}

function getLastCompletionGameDate() {
    return localStorage.getItem('lastCompletionGameDate');
}

// 復帰プロセス段階2（IINEバナー）の表示待ちフラグ管理
function setIsWaitingForRecoveryPhase2(value) {
    localStorage.setItem('isWaitingForRecoveryPhase2', value ? 'true' : 'false');
}

function getIsWaitingForRecoveryPhase2() {
    return localStorage.getItem('isWaitingForRecoveryPhase2') === 'true';
}

/**
 * サボり日数（abandonDays）を保存・取得する
 * 仕様書 3-3, 7 の要件に基づき追加
 */
function setAbandonDays(days) {
    localStorage.setItem('abandonDays', days.toString());
}

function getAbandonDays() {
    return parseInt(localStorage.getItem('abandonDays') || '0', 10);
}

// モブ君の現在の状態を保存する（例：'normal', 'onee_lv1'など）
function setMobuState(state) {
localStorage.setItem('mobuState', state);
}

// モブ君の現在の状態を取得する
function getMobuState() {
return localStorage.getItem('mobuState') || 'normal';
}

/**
 * サボり状態をリセットする（タスク完了時に呼び出し）
 * 仕様書 3-3, 7 準拠
 * 注意：Phase 2フラグのセットは、LINEメッセージ表示後に行うためここでは保留（仕様書 5-1）
 */
function resetAbandonment() {
    const currentState = getMobuState();

    // サボり状態（onee_lv1~3）から復帰する場合のみ、元のレベルを記憶
    if (currentState !== 'normal') {
        localStorage.setItem('lastRecoveryLevel', currentState);
    }

    setAbandonDays(0);
    setMobuState('normal');
    console.log("サボり状態をリセットしました（正常復帰）");
}

/**
 * 最後に完了した日付との差分を計算し、サボり判定を行う（朝4時リセット基準）
 * 要件：累計1回以上の完了者が対象。差分1日以上でサボり確定。
 */
function checkAbandonment() {
    const totalTasks = getTotalTasksCompleted();
    // 1. 累計1回も完了していないユーザーは判定対象外 (仕様書 2-2)
    if (totalTasks === 0) return;

    const lastCompDateStr = getLastCompletionGameDate();
    // 2. 累計はあるが完了日がない場合（移行期用）、今日を基準日として保存して終了
    if (!lastCompDateStr) {
        saveLastCompletionGameDate();
        return;
    }

    const todayStr = getGameDate();
    // 3. 今日すでに達成済みなら判定不要
    if (todayStr === lastCompDateStr) return;

    // 4. 日付文字列同士の差分を計算（仕様書 2-3：getGameDateの文字列を基準にする）
    const todayDate = new Date(todayStr);
    const lastDate  = new Date(lastCompDateStr);
    const diffTime  = todayDate.getTime() - lastDate.getTime();
    const diffDays  = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 5. 2日以上の差があればサボり確定（当日未完了はペナルティ対象外）
    if (diffDays >= 2) {
        // 重要：新たなサボりが確定したため、未読の段階2フラグを破棄 (仕様書 6-1)
        setIsWaitingForRecoveryPhase2(false);

        // 放置日数を保存（diffDaysから1を引いた実サボり日数）(仕様書 3-3)
        const abandonDays = diffDays - 1;
        setAbandonDays(abandonDays);

        // 6. 日数に応じたレベルスキップ適用 (仕様書 3-1, 3-2)
        if (diffDays >= 11) {
            setMobuState('onee_lv3');
        } else if (diffDays >= 5) {
            setMobuState('onee_lv2');
        } else {
            setMobuState('onee_lv1');
        }
        console.log(`サボり判定確定: 差分${diffDays}日（サボり${abandonDays}日）。状態: ${getMobuState()}`);
    }
}

// ===============================================
// Phase 5-1.5: プロフィール画面の演出管理
// ===============================================

/**

プロフィール画面(B-3)の特定の演出が再生済みかどうかをチェックする

@param {number} milestoneToCheck - チェックしたい達成回数 (例: 10, 20)

@returns {boolean} - 再生済みならtrue, まだならfalse
*/
function hasProfileRewardBeenSeen(milestoneToCheck) {
const seenRewards = JSON.parse(localStorage.getItem('profileRewardsSeen') || '[]');
return seenRewards.includes(milestoneToCheck);
}

/**

プロフィール画面(B-3)の特定の演出を「再生済み」として記録する

@param {number} milestoneToMark - 「再生済み」として記録したい達成回数 (例: 10, 20)
*/
function markProfileRewardAsSeen(milestoneToMark) {
const seenRewards = JSON.parse(localStorage.getItem('profileRewardsSeen') || '[]');
if (!seenRewards.includes(milestoneToMark)) {
seenRewards.push(milestoneToMark);
localStorage.setItem('profileRewardsSeen', JSON.stringify(seenRewards));
console.log(`プロフィール演出 ${milestoneToMark}回目を「再生済み」として記録しました。`);
}
}

// ===============================================
// Phase 5-3: 2周目ループ処理
// ===============================================

/**
 * アプリの全ユーザーデータをリセットする
 */
function resetAllData() {
    console.log("全データをリセットします...");
    // userId 以外の全てのデータを localStorage から削除
    const userId = localStorage.getItem('userId'); // userIdだけは保持しておく
    localStorage.clear(); // いったん全て消去
    localStorage.setItem('userId', userId); // userIdを再設定
    console.log("データのリセットが完了しました。");
}

// ===============================================
// カレンダー用：達成日の記録管理
// ===============================================

function getAchievementLog() {
    return JSON.parse(localStorage.getItem('achievementLog') || '{}');
}

// ===============================================
// STEP 1: 朝4時リセット基準の日付取得
// ===============================================

function getGameDate() {
    const now = new Date();
    const gameNow = new Date(now.getTime());
    if (gameNow.getHours() < 4) {
        gameNow.setDate(gameNow.getDate() - 1);
    }

    const y = gameNow.getFullYear();
    const m = String(gameNow.getMonth() + 1).padStart(2, '0');
    const d = String(gameNow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// ===============================================
// STEP 1-B: 既存関数の日付取得を getGameDate() に置き換え
// ===============================================

// recordTodayAchievement を上書き
function recordTodayAchievement(count) {
    const today = getGameDate();
    const data = JSON.parse(localStorage.getItem('achievementLog') || '{}');
    const existing = data[today] || 0;
    data[today] = Math.min(existing + count, 3);
    localStorage.setItem('achievementLog', JSON.stringify(data));
}

// ===============================================
// STEP 1-C: completedToday の保存・取得・リセット
// ===============================================

function saveCompletedToday(taskIndices) {
    const data = {
        date: getGameDate(),
        taskIndices: taskIndices
    };
    localStorage.setItem('completedToday', JSON.stringify(data));
}

function getCompletedToday() {
    const raw = localStorage.getItem('completedToday');
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.date !== getGameDate()) {
        localStorage.removeItem('completedToday');
        return null;
    }
    return data;
}

// ===============================================
// マイルストーンイベント：招待済・視聴済フラグ管理
// ===============================================
function saveCafeExitTime(milestone) {
    const key = 'cafeExitTime_' + milestone;
    localStorage.setItem(key, Date.now().toString());
}

function getCafeExitTime(milestone) {
    const key = 'cafeExitTime_' + milestone;
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) : null;
}

function clearCafeExitTime(milestone) {
    const key = 'cafeExitTime_' + milestone;
    localStorage.removeItem(key);
}

// ===============================================
// 復帰バナー管理
// ===============================================

function getReturnBannerLog(milestone) {
    const key = 'returnBannerLog_' + milestone;
    return JSON.parse(localStorage.getItem(key) || '{"date":"","count":0,"lastTime":0,"shownIndices":[]}');
}

function saveReturnBannerLog(milestone, log) {
    const key = 'returnBannerLog_' + milestone;
    localStorage.setItem(key, JSON.stringify(log));
}

function resetReturnBannerLog(milestone) {
    const key = 'returnBannerLog_' + milestone;
    localStorage.removeItem(key);
}

function setIsInvited(milestone, value) {
    const key = 'isInvited_' + milestone;
    localStorage.setItem(key, value ? 'true' : 'false');
}

function getIsInvited(milestone) {
    const key = 'isInvited_' + milestone;
    return localStorage.getItem(key) === 'true';
}

function setIsWatched(milestone, value) {
    const key = 'isWatched_' + milestone;
    localStorage.setItem(key, value ? 'true' : 'false');
}

function getIsWatched(milestone) {
    const key = 'isWatched_' + milestone;
    return localStorage.getItem(key) === 'true';
}

function getMobuIconSrc() {
    const state = getMobuState();
    const version = getMobuVersion();
    const verNum = version.replace('ver', '');

    if (state === 'normal') {
        return `assets/images/icons/mobu_icon_v${verNum}.png`;
    } else {
        return `assets/images/icons/mobu_icon_onee_v${verNum}.png`;
    }
}