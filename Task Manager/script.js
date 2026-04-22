let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let filter = "all";


if ("Notification" in window) {
  Notification.requestPermission();
}


function renderTasks() {
  const list = document.getElementById("taskList");
  const stats = document.getElementById("stats");

  list.innerHTML = "";

  let filteredTasks = tasks.filter(task => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  filteredTasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} 
        onchange="toggleTask('${task.id}')">

      <span class="${task.completed ? "completed" : ""}">
        ${task.text} ${task.time ? "⏰ " + task.time : ""}
      </span>

      <button onclick="editTask('${task.id}')">✏️</button>
      <button onclick="deleteTask('${task.id}')">🗑️</button>
    `;

    list.appendChild(li);
  });

  stats.textContent =
    `Total: ${tasks.length} | ` +
    `Active: ${tasks.filter(t => !t.completed).length} | ` +
    `Completate: ${tasks.filter(t => t.completed).length}`;

  localStorage.setItem("tasks", JSON.stringify(tasks));
}


function addTask() {
  const input = document.getElementById("taskInput");
  const timeInput = document.getElementById("taskTime");

  if (input.value.trim() === "") return;

  tasks.push({
    id: Date.now().toString(),
    text: input.value,
    time: timeInput.value,
    completed: false,
    notified: false
  });

  input.value = "";
  timeInput.value = "";

  renderTasks();
}


function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;

  // dacă e bifat manual, nu mai trimitem notificare
  if (task.completed) {
    task.notified = true;
  }

  renderTasks();
}


function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}


function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newText = prompt("Editează task-ul:", task.text);

  if (newText !== null && newText.trim() !== "") {
    task.text = newText;
    renderTasks();
  }
}


function setFilter(type) {
  filter = type;
  renderTasks();
}


function toggleDarkMode() {
  document.body.classList.toggle("dark");
}


setInterval(() => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);

  tasks.forEach(task => {
    if (
      task.time === currentTime &&
      !task.completed &&
      !task.notified
    ) {
      if (Notification.permission === "granted") {
        new Notification("⏰ Reminder Task", {
          body: task.text
        });
      }

      task.notified = true;
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  });
}, 1000);


renderTasks();