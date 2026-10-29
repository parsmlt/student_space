const STORAGE_KEY = "study-space-tasks-v1";

const taskForm = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const subjectInput = document.querySelector("#task-subject");
const dateInput = document.querySelector("#task-date");
const saveButton = document.querySelector("#save-task");
const cancelButton = document.querySelector("#cancel-edit");
const taskList = document.querySelector("#task-list");
const emptyMessage = document.querySelector("#empty-message");

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (!savedTasks) return [];

    const parsedTasks = JSON.parse(savedTasks);
    if (!Array.isArray(parsedTasks)) return [];

    // Remove the sample tasks from earlier versions but keep tasks users created.
    return parsedTasks.filter((task) => !String(task.id).startsWith("sample-"));
  } catch {
    return [];
  }
}

let tasks = loadTasks();
let editingTaskId = null;

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    document.querySelector("#storage-message").textContent = "Your tasks stay in this browser on this device.";
  } catch {
    document.querySelector("#storage-message").textContent = "Changes are available until you close this page, but this browser could not save them.";
  }
}

function prettyDate(dateString) {
  if (!dateString) return "No deadline";
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(year, month - 1, day));
}

function updateSummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const dueThisWeek = tasks.filter((task) => {
    if (task.completed || !task.dueDate) return false;
    const [year, month, day] = task.dueDate.split("-").map(Number);
    const deadline = new Date(year, month - 1, day);
    return deadline >= today && deadline <= nextWeek;
  }).length;

  document.querySelector("#todo-count").textContent = tasks.filter((task) => !task.completed).length;
  document.querySelector("#week-count").textContent = dueThisWeek;
  document.querySelector("#done-count").textContent = tasks.filter((task) => task.completed).length;
}

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function renderTasks() {
  taskList.replaceChildren();
  emptyMessage.hidden = tasks.length > 0;

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark ${task.title} ${task.completed ? "not completed" : "completed"}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const copy = document.createElement("span");
    copy.className = `task-copy${task.completed ? " completed" : ""}`;
    const name = document.createElement("strong");
    name.textContent = task.title;
    const subject = document.createElement("span");
    subject.textContent = task.subject || "General";
    copy.append(name, subject);

    const deadline = document.createElement("time");
    deadline.className = "due-date";
    deadline.textContent = prettyDate(task.dueDate);
    if (task.dueDate) deadline.dateTime = task.dueDate;

    const actions = document.createElement("span");
    actions.className = "task-actions";
    actions.append(
      makeButton("Edit", "text-button", () => startEditing(task)),
      makeButton("Delete", "text-button delete-button", () => deleteTask(task.id)),
    );

    item.append(checkbox, copy, deadline, actions);
    taskList.append(item);
  });

  updateSummary();
}

function startEditing(task) {
  editingTaskId = task.id;
  titleInput.value = task.title;
  subjectInput.value = task.subject;
  dateInput.value = task.dueDate;
  document.querySelector("#form-title").textContent = "Edit task";
  saveButton.textContent = "Save changes";
  cancelButton.hidden = false;
  document.querySelector(".task-editor").scrollIntoView({ behavior: "smooth", block: "center" });
  titleInput.focus();
}

function resetForm() {
  editingTaskId = null;
  taskForm.reset();
  document.querySelector("#form-title").textContent = "Add a task";
  saveButton.textContent = "Add task";
  cancelButton.hidden = true;
}

function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  if (editingTaskId === taskId) resetForm();
  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const taskDetails = {
    title: titleInput.value.trim(),
    subject: subjectInput.value.trim(),
    dueDate: dateInput.value,
  };
  if (!taskDetails.title) return;

  if (editingTaskId) {
    const task = tasks.find((item) => item.id === editingTaskId);
    Object.assign(task, taskDetails);
  } else {
    tasks.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, ...taskDetails, completed: false });
  }

  saveTasks();
  resetForm();
  renderTasks();
});

cancelButton.addEventListener("click", resetForm);

renderTasks();
