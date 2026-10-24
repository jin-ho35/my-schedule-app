// 過去タスク
let pastTasks = JSON.parse(localStorage.getItem("pastTasks")) || [];

// ★ 日付ごとの予定（カレンダー用）
let allTasks = JSON.parse(localStorage.getItem("allTasks")) || {};

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

if (name === "") return;

  // ★ 日付ごとの予定（カレンダー用）
  allTasks[selectedDate] = allTasks[selectedDate] || [];

  // ★ 同じ時間の予定があれば上書き（変更扱い）
  let existingIndex = -1;

if (time !== "") {
  existingIndex =
    allTasks[selectedDate].findIndex(
      t => t.time === time
    );
}
  if (existingIndex >= 0) {
    allTasks[selectedDate][existingIndex] = { name, time };
  } else {
    allTasks[selectedDate].push({ name, time });
  }

  // 時間順に並べ替え
  allTasks[selectedDate].sort((a, b) => a.time.localeCompare(b.time));

  localStorage.setItem("allTasks", JSON.stringify(allTasks));

  // 過去タスク（重複なし）
  if (!pastTasks.includes(name)) {
    pastTasks.push(name);
    localStorage.setItem("pastTasks", JSON.stringify(pastTasks));
  }

 displayPastTasks();

document.getElementById("taskInput").value = "";
document.getElementById("timeInput").value = "";

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
row.className = "previewItem scheduleCard";

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

preview.appendChild(row);
  });

// 時刻なし
freeTasks.forEach(task => {

  const row = document.createElement("div");
// 時刻なしのタスク
row.className = "previewItem taskCard";

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

  freePreview.appendChild(row);

});

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

// 初期表示
renderPreview();
displayPastTasks();
