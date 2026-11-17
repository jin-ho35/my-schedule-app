// 過去タスク
let pastTasks = JSON.parse(localStorage.getItem("pastTasks")) || [];

// ★ 日付ごとの予定（カレンダー用）
let allTasks = JSON.parse(localStorage.getItem("allTasks")) || {};

// 既存タスクにもIDと完了状態を設定
let tasksUpdated = false;

Object.values(allTasks).forEach(dayTasks => {
  dayTasks.forEach(task => {
    if (!task.id) {
      task.id =
        Date.now().toString() +
        Math.random().toString(36).slice(2);
      tasksUpdated = true;
    }

    if (typeof task.done !== "boolean") {
      task.done = false;
      tasksUpdated = true;
    }
  });
});

// 補完したデータを保存
if (tasksUpdated) {
  localStorage.setItem("allTasks", JSON.stringify(allTasks));
}

// ★ アプリ起動時に当日の日付を設定
const launchSessionKey = "taskAppLaunchInitialized";

if (!sessionStorage.getItem(launchSessionKey)) {
  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  localStorage.setItem("selectedDate", today);
  sessionStorage.setItem(launchSessionKey, "true");
}

// ★ カレンダーで選択された日付
const selectedDate = localStorage.getItem("selectedDate");

// 予定入力ページに日付を表示
if (selectedDate) {
  const d = document.getElementById("selectedDateDisplay");
  if (d) d.textContent = selectedDate;
}

let index = 0;

// ドロップダウン開閉
document.getElementById("dropdownHeader").onclick = () => {
  const list = document.getElementById("pastTaskList");
  list.style.display = (list.style.display === "none") ? "block" : "none";
};

// ★ タスク追加（予定変更時は上書き保存）
function addTask() {
  const name = document.getElementById("taskInput").value;
  const time = document.getElementById("timeInput").value;
 const important = document.getElementById("importantInput").checked;

// 次の7日間で選択された日付を取得
const selectedRepeatDates = Array.from(
  document.querySelectorAll("#repeatDayChecks button.selected")
).map(button => button.dataset.date);

if (name === "") return;

// 登録する日付を決定
const targetDates = selectedRepeatDates.length > 0
  ? selectedRepeatDates
  : [selectedDate];

// 選択された各日付に予定を登録
targetDates.forEach(targetDate => {

  allTasks[targetDate] = allTasks[targetDate] || [];

  // 同じ時間の予定があれば上書き（変更扱い）
  let existingIndex = -1;

  if (time !== "") {
    existingIndex = allTasks[targetDate].findIndex(
      t => t.time === time
    );
  }

  if (existingIndex >= 0) {

    const oldTask = allTasks[targetDate][existingIndex];

    allTasks[targetDate][existingIndex] = {
      ...oldTask,
      name,
      time,
      important
    };

  } else {

    allTasks[targetDate].push({
      id: Date.now().toString() +
          Math.random().toString(36).slice(2),
      name,
      time,
      important,
      done: false
    });

  }

  // 時間順に並べ替え
  allTasks[targetDate].sort(
    (a, b) => a.time.localeCompare(b.time)
  );

});

// 保存
localStorage.setItem("allTasks", JSON.stringify(allTasks));

  // 過去タスク（重複なし）
  if (!pastTasks.includes(name)) {
    pastTasks.push(name);
    localStorage.setItem("pastTasks", JSON.stringify(pastTasks));
  }

 displayPastTasks();

document.getElementById("taskInput").value = "";
document.getElementById("timeInput").value = "";
document.getElementById("importantInput").checked = false;

// 7日間の選択状態をリセット
document.querySelectorAll("#repeatDayChecks button").forEach(button => {
  button.classList.remove("selected");
  button.style.background = "#fff";
  button.style.color = "black";
});

// 7日間の選択欄を閉じる
document.getElementById("repeatDays").style.display = "none";

renderPreview();
}

function renderPreview() {

  const preview =
    document.getElementById("previewList");

  const freePreview =
    document.getElementById("freeTaskList");

  preview.innerHTML = "";
  freePreview.innerHTML = "";

  const tasks =
    allTasks[selectedDate] || [];

  const timedTasks =
    tasks.filter(task => task.time);

  const freeTasks =
    tasks.filter(task => !task.time);

  // 時刻あり
  timedTasks.forEach(task => {

  const row = document.createElement("div");
// 時刻ありの予定
const isImportant = task.important === true || task.importance === "high";

row.className = isImportant
  ? "previewItem importantCard"
  : "previewItem scheduleCard";

const text = document.createElement("span");
text.textContent =
  `${task.time}　${task.name}`;

const delBtn = document.createElement("button");
delBtn.textContent = "削除";

delBtn.onclick = () => {
  deleteTask(
    allTasks[selectedDate].indexOf(task)
  );

  renderPreview();
};

row.appendChild(text);
row.appendChild(delBtn);

// タップで完了状態を切り替え
row.onclick = (event) => {

  // 削除ボタンを押した場合は除外
  if (event.target === delBtn) return;

  task.done = !task.done;

  row.classList.toggle("done", task.done);

  localStorage.setItem(
    "allTasks",
    JSON.stringify(allTasks)
  );
};

// 現在の完了状態を反映
if (task.done === true) {
  row.classList.add("done");
}

preview.appendChild(row);
  });

// 時刻なし
freeTasks.forEach(task => {

  const row = document.createElement("div");
// 時刻なしのタスク
const isImportant = task.important === true || task.importance === "high";

row.className = isImportant
  ? "previewItem importantCard"
  : "previewItem taskCard";

  const text = document.createElement("span");
  text.textContent = task.name;

  const delBtn = document.createElement("button");
  delBtn.textContent = "削除";

  delBtn.onclick = () => {

    deleteTask(
      allTasks[selectedDate].indexOf(task)
    );

    renderPreview();

  };
  
row.appendChild(text);
row.appendChild(delBtn);

// タップで完了状態を切り替え
row.onclick = (event) => {

  // 削除ボタンを押した場合は除外
  if (event.target === delBtn) return;

  task.done = !task.done;

  row.classList.toggle("done", task.done);

  localStorage.setItem(
    "allTasks",
    JSON.stringify(allTasks)
  );
};

// 現在の完了状態を反映
if (task.done === true) {
  row.classList.add("done");
}

freePreview.appendChild(row);
});

}

// 入力中のプレビューを表示
function renderInputPreview() {
  const draft = document.getElementById("draftPreview");

  const name = document.getElementById("taskInput").value.trim();
  const time = document.getElementById("timeInput").value;
  const important = document.getElementById("importantInput").checked;

  // タスク名が空ならプレビューを隠す
  if (name === "") {
    draft.style.display = "none";
    draft.textContent = "";
    return;
  }

  // プレビューを表示
  draft.style.display = "flex";
  draft.className = "previewItem";

  // 色を設定
  if (important) {
    draft.classList.add("importantCard");
  } else if (time !== "") {
    draft.classList.add("scheduleCard");
  } else {
    draft.classList.add("taskCard");
  }

  // 入力内容を表示
  draft.textContent = time ? `${time}　${name}（入力中）` : `${name}（入力中）`;
}

function deleteTask(indexToDelete) {
  if (allTasks[selectedDate]) {
    allTasks[selectedDate].splice(indexToDelete, 1);
    localStorage.setItem("allTasks", JSON.stringify(allTasks));
  }

  renderPreview();
}

// 過去タスク一覧表示（削除ボタン付き）
function displayPastTasks() {
  const list = document.getElementById("pastTaskList");
  list.innerHTML = "";

  pastTasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.style.margin = "8px 0";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = t;
    nameSpan.style.cursor = "pointer";
    nameSpan.onclick = () => {
      document.getElementById("taskInput").value = t;
      list.style.display = "none";
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.style.marginLeft = "10px";
    delBtn.onclick = () => deletePastTask(i);

    li.appendChild(nameSpan);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// 過去タスク削除
function deletePastTask(indexToDelete) {
  pastTasks.splice(indexToDelete, 1);
  localStorage.setItem("pastTasks", JSON.stringify(pastTasks));
  displayPastTasks();
}

// view.html へ移動
function startView() {
  window.location.href = "view.html";
}

// view.html 用
function nextTask() {
  if (index < tasks.length) {
    const t = tasks[index];
    document.getElementById("taskBox").textContent = `${t.time} - ${t.name}`;

    // ★ 次の予定を表示（小さめ）
    if (index + 1 < tasks.length) {
      const next = tasks[index + 1];
      document.getElementById("nextTaskBox").textContent =
        `次の予定： ${next.time} - ${next.name}`;
    } else {
      document.getElementById("nextTaskBox").textContent = "";
    }

    index++;
  } else {
    document.getElementById("taskBox").textContent = "今日の予定はすべて完了しました！";
    document.getElementById("nextTaskBox").textContent = "";
  }
}

function prevTask() {
  const dayTasks = allTasks[selectedDate] || [];

  if (index > 1) {
    index -= 2;
    nextTask();
  } else {
    document.getElementById("taskBox").textContent = "最初のタスクです";
  }
}

function goToInput() {
  window.location.href = "index.html";
}

function goToCalendar() {
  window.location.href = "calendar.html";
}

function goToChecklist() {
  window.location.href = "checklist.html";
}

function goToView() {
  window.location.href = "view.html";
}

function toggleTaskInputArea() {

  const area = document.getElementById("taskInputArea");
  const button = event.target;

  if (area.style.display === "none") {
    area.style.display = "block";
    button.textContent = "▲ 予定を入力・編集";
  } else {
    area.style.display = "none";
    button.textContent = "▼ 予定を入力・編集";
  }
}

// 入力内容が変わったらプレビューを更新
document.getElementById("taskInput").addEventListener("input", renderInputPreview);
document.getElementById("timeInput").addEventListener("input", renderInputPreview);
document.getElementById("importantInput").addEventListener("change", renderInputPreview);

// Initial display
renderPreview();
displayPastTasks();
renderInputPreview();
