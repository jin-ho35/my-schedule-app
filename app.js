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

// ★ タスク追加（時刻なしOK・時刻ありは上書き）
function addTask() {
  const name = document.getElementById("taskInput").value;
  const time = document.getElementById("timeInput").value;

  if (name === "") return;   // ★ タスク名だけ必須

  // ★ 日付ごとの予定（カレンダー用）
  allTasks[selectedDate] = allTasks[selectedDate] || [];

  // ★ 時刻ありの場合だけ上書き判定する
  let existingIndex = -1;
  if (time) {
    existingIndex = allTasks[selectedDate].findIndex(t => t.time === time);
  }

  if (existingIndex >= 0) {
    // ★ 時刻あり → 上書き
    allTasks[selectedDate][existingIndex] = { name, time };
  } else {
    // ★ 時刻なし → 常に新規追加
    allTasks[selectedDate].push({ name, time });
  }

  // ★ 時刻ありタスクだけソート（時刻なしは後ろへ）
  allTasks[selectedDate].sort((a, b) => {
    if (!a.time) return 1;   // aが時刻なし → 後ろへ
    if (!b.time) return -1;  // bが時刻なし → 後ろへ
    return a.time.localeCompare(b.time);
  });

  localStorage.setItem("allTasks", JSON.stringify(allTasks));

  // 過去タスク（重複なし）
  if (!pastTasks.includes(name)) {
    pastTasks.push(name);
    localStorage.setItem("pastTasks", JSON.stringify(pastTasks));
  }

  displayTasks();
  displayPastTasks();

  document.getElementById("taskInput").value = "";
  document.getElementById("timeInput").value = "";
}

// ★ 日付ごとの予定削除（その日付だけ）
function deleteTask(indexToDelete) {
  if (allTasks[selectedDate]) {
    allTasks[selectedDate].splice(indexToDelete, 1);
    localStorage.setItem("allTasks", JSON.stringify(allTasks));
  }

  displayTasks();
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
    delBtn.textContent = "×";
    delBtn.style.marginLeft = "10px";
    delBtn.style.width = "26px";
    delBtn.style.height = "26px";
    delBtn.style.borderRadius = "50%";
    delBtn.style.border = "none";
    delBtn.style.backgroundColor = "#ff4d4d";
    delBtn.style.color = "white";
    delBtn.style.fontSize = "18px";
    delBtn.style.cursor = "pointer";
    delBtn.style.display = "flex";
    delBtn.style.alignItems = "center";
    delBtn.style.justifyContent = "center";
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

// ★ タスク一覧表示（その日付の予定だけ）
function displayTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const dayTasks = allTasks[selectedDate] || [];

  dayTasks.forEach((t, i) => {
    const li = document.createElement("li");

    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.margin = "6px 0";

    const textSpan = document.createElement("span");
    textSpan.textContent = `${t.time || "（時刻なし）"} - ${t.name}`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "×";
    delBtn.style.width = "26px";
    delBtn.style.height = "26px";
    delBtn.style.borderRadius = "50%";
    delBtn.style.border = "none";
    delBtn.style.backgroundColor = "#ff6666";
    delBtn.style.color = "white";
    delBtn.style.cursor = "pointer";
    delBtn.style.fontSize = "18px";
    delBtn.style.lineHeight = "0";
    delBtn.onclick = () => deleteTask(i);

    li.appendChild(textSpan);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// ★ view.html へ移動（時刻ありタスクだけ）
function startView() {
  const tasks = allTasks[selectedDate] || [];

  const timedTasks = tasks.filter(t => t.time);

  if (timedTasks.length === 0) {
    alert("時刻付きの予定がありません。");
    return;
  }

  localStorage.setItem("timedTasks", JSON.stringify(timedTasks));
  window.location.href = "view.html";
}

// 初期表示
displayTasks();
displayPastTasks();
