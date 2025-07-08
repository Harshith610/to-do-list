let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editIndex = null;

window.onload = () => {
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark");
  }

  document.getElementById("theme-toggle").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("dark-mode", document.body.classList.contains("dark"));
  };

  renderTasks();
};

function addTask() {
  const title = document.getElementById("task-input").value.trim();
  const dueDate = document.getElementById("due-date").value;
  const tag = document.getElementById("task-tag").value;
  if (!title) return;

  tasks.push({ title, dueDate, tag, completed: false });
  saveTasks();
  document.getElementById("task-input").value = "";
  renderTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  const list = document.getElementById("task-list");
  const search = document.getElementById("search").value.toLowerCase();
  const tagFilter = document.getElementById("filter-tag").value;
  const statusFilter = document.getElementById("filter-status").value;
  list.innerHTML = "";

  tasks
    .map((task, index) => ({ task, index })) // Preserve real index
    .filter(({ task }) => {
      return (
        task.title.toLowerCase().includes(search) &&
        (tagFilter === "all" || task.tag === tagFilter) &&
        (statusFilter === "all" ||
          (statusFilter === "done" && task.completed) ||
          (statusFilter === "todo" && !task.completed))
      );
    })
    .forEach(({ task, index }) => {
      const li = document.createElement("li");
      li.className = "task" + (task.completed ? " done" : "");

      let badge = "";
      const today = new Date().toISOString().split("T")[0];
      if (task.dueDate) {
        if (task.dueDate === today) badge = `<span class="badge">Today</span>`;
        else if (task.dueDate < today) badge = `<span class="badge">Overdue</span>`;
        else badge = `<span class="badge">Upcoming</span>`;
      }

      li.innerHTML = `
        <div>
          <strong>${task.title}</strong>
          <div class="meta">📅 ${task.dueDate || "No date"} | 🏷️ ${task.tag} ${badge}</div>
        </div>
        <div class="task-buttons">
          <button onclick="toggleComplete(${index})">✅</button>
          <button onclick="openEdit(${index})">✏️</button>
          <button onclick="deleteTask(${index})">🗑️</button>
        </div>
      `;

      list.appendChild(li);
    });
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  }
}

function openEdit(index) {
  editIndex = index;
  const task = tasks[index];
  document.getElementById("edit-title").value = task.title;
  document.getElementById("edit-date").value = task.dueDate;
  document.getElementById("edit-tag").value = task.tag;
  document.getElementById("edit-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("edit-modal").classList.add("hidden");
}

function saveEdit() {
  const newTitle = document.getElementById("edit-title").value.trim();
  const newDate = document.getElementById("edit-date").value;
  const newTag = document.getElementById("edit-tag").value;

  if (!newTitle) return;

  tasks[editIndex] = { ...tasks[editIndex], title: newTitle, dueDate: newDate, tag: newTag };
  closeModal();
  saveTasks();
  renderTasks();
}
