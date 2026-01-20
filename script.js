// 画面遷移関数
function showScreen(screenId) {
    // すべての画面からactiveクラスを削除
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // 指定された画面にactiveクラスを追加
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

// 一意のユーザーIDを生成
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// B-1: ホーム画面のタスク表示を更新する関数
function updateHomeTasks() {
    const storedTasks = localStorage.getItem('selectedTasks');
    if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        
        // ホーム画面のラベル要素を取得
        const homeLabels = document.querySelectorAll('.task-chip-home label');
        const homeInputs = document.querySelectorAll('.task-chip-home input');
        
        // 取得したタスク名をラベルに反映し、チェックをリセット
        tasks.forEach((taskName, index) => {
            if (homeLabels[index]) {
                homeLabels[index].textContent = taskName;
            }
            if (homeInputs[index]) {
                homeInputs[index].value = taskName;
                homeInputs[index].checked = false; // 初期化
            }
        });
    }
}

// ニックネーム入力のバリデーション
const nicknameInput = document.getElementById('nickname-input');
const errorMessage = document.getElementById('error-message');
const nameScreenButton = document.querySelector('#screen-name .btn-primary');

// 要素が存在する場合のみイベントを設定
if (nicknameInput) {
    nicknameInput.addEventListener('input', function() {
        const value = this.value;
        
        // 全角・半角の特殊記号チェック（#、@、%）
        const invalidChars = /[#@%＃＠％]/u;
        if (invalidChars.test(value)) {
            errorMessage.textContent = '絵文字や特殊記号は使えません';
            nameScreenButton.disabled = true;
            return;
        }
        
        // 文字数チェック
        if (value.length === 0) {
            errorMessage.textContent = '';
            nameScreenButton.disabled = true;
            return;
        }
        
        if (value.length > 10) {
            errorMessage.textContent = '10文字以内で入力してください';
            nameScreenButton.disabled = true;
            return;
        }
        
        // OK
        errorMessage.textContent = '';
        nameScreenButton.disabled = false;
    });

    // 次へボタンのクリックイベント
    nameScreenButton.addEventListener('click', function() {
        const nickname = nicknameInput.value.trim();
        
        // バリデーション再チェック
        if (nickname.length === 0 || nickname.length > 10) {
            return;
        }
        
        const invalidChars = /[#@%＃＠％]/u;
        if (invalidChars.test(nickname)) {
            return;
        }
        
        // ニックネームをLocalStorageに保存
        localStorage.setItem('nickname', nickname);
        
        // ユーザーIDが存在しない場合は生成して保存
        if (!localStorage.getItem('userId')) {
            const userId = generateUserId();
            localStorage.setItem('userId', userId);
        }
        
        // A-3（タスク選択画面）へ遷移
        showScreen('screen-task-select');
    });
}

// タスク選択制御
const taskSelectButton = document.getElementById('task-select-button');
const taskCheckboxes = document.querySelectorAll('#screen-task-select input[type="checkbox"]');

// タスク選択数の制御（最大3つ）
taskCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const checkedCount = document.querySelectorAll('#screen-task-select input[type="checkbox"]:checked').length;
        
        // 3つを超えて選択しようとした場合、最後に選択したものを無効化
        if (checkedCount > 3) {
            this.checked = false;
            return;
        }
        
        // 選択数に応じてボタンの有効/無効を切り替え
        if (checkedCount === 3) {
            taskSelectButton.disabled = false;
        } else {
            taskSelectButton.disabled = true;
        }
    });
});

// 「これで決定」ボタンのクリックイベント
if (taskSelectButton) {
    taskSelectButton.addEventListener('click', function() {
        // 選択されたタスクを取得
        const selectedTasks = [];
        taskCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedTasks.push(checkbox.value);
            }
        });
        
        // 3つ選択されていることを確認
        if (selectedTasks.length !== 3) {
            return;
        }
        
        // 選択されたタスクをLocalStorageに保存
        localStorage.setItem('selectedTasks', JSON.stringify(selectedTasks));
        
        // ホーム画面の内容を更新
        updateHomeTasks();

        // B-1（ホーム画面）へ遷移
        showScreen('screen-home');
    });
}

// B-1: ホーム画面の完了ボタン制御
const homeTaskCheckboxes = document.querySelectorAll('.task-chip-home input[type="checkbox"]');
const homeCompleteButton = document.querySelector('#screen-home .btn-primary');

homeTaskCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        // チェックされている数をカウント
        const checkedCount = document.querySelectorAll('.task-chip-home input[type="checkbox"]:checked').length;
        
        // 1つ以上チェックがあればボタンを有効化、なければ無効化
        if (checkedCount > 0) {
            homeCompleteButton.disabled = false;
        } else {
            homeCompleteButton.disabled = true;
        }
    });
});

// ホーム画面の「完了」ボタンクリック時の処理
if (homeCompleteButton) {
    homeCompleteButton.addEventListener('click', function() {
        // チェックされたタスクの内容を取得（ログ用）
        const completedTasks = [];
        document.querySelectorAll('.task-chip-home input[type="checkbox"]:checked').forEach(checkbox => {
            const taskName = checkbox.parentElement.querySelector('label').textContent;
            completedTasks.push(taskName);
        });

        // コンソールに表示（確認用）
        console.log('完了したタスク:', completedTasks);
        
        // 仮の演出：LINE画面のモブ君のセリフを書き換える
        const mobMessage = document.querySelector('#screen-line .line-message.mobu p');
        if (mobMessage) {
            mobMessage.textContent = 'お疲れ様！報告待ってたよ。';
        }

        // C-2（LINE画面）へ遷移
        // ※本来はB-2報告画面へ遷移する（Phase 3-2で修正予定）
        showScreen('screen-line');
    });
}

// A-1: ウェルカム画面をタップした時の処理
const welcomeScreen = document.getElementById('screen-welcome');
if (welcomeScreen) {
    welcomeScreen.addEventListener('click', function() {
        // 保存されているデータをチェック
        const nickname = localStorage.getItem('nickname');
        const selectedTasks = localStorage.getItem('selectedTasks');

        // ニックネームとタスクが両方保存されていたら（＝2回目以降）
        if (nickname && selectedTasks) {
            // ホーム画面のタスク表示を更新してから移動
            updateHomeTasks();
            showScreen('screen-home');
        } else {
            // データがなければ（＝初回）、名前入力画面へ移動
            showScreen('screen-name');
        }
    });
}

// アプリ起動時の初期処理
document.addEventListener('DOMContentLoaded', function() {
    // 念のためホーム画面のタスク表示を更新しておく
    updateHomeTasks();
});