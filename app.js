
let todos = [
  {
    id: crypto.randomUUID(),
    title: "Example Todo",
    description: "Description goes here",
    createdAt: "2025-07-01T10:00",
    due: "2025-07-10T12:00",
    assignee: "John Doe",
    attachments: 2,
    completed: false,
  },
];

let editId = null;

const todoListEl = document.getElementById("todoList");
const formEl = document.getElementById("todoForm");
const titleEl = document.getElementById("title");
const descEl = document.getElementById("description");
const dueEl = document.getElementById("due");
const assignEl = document.getElementById("assignee");
const filesEl = document.getElementById("files");
const attachmentsPreviewEl = document.getElementById("attachmentsPreview");
const clearFilesBtn = document.getElementById("clearFilesBtn");
const submitText = document.getElementById("submitText");
const submitIcon = document.getElementById("submitIcon");


function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateTimeLocal(str) {
  if (!str) return "No due date";
  const d = new Date(str);
  if (isNaN(d)) return str;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function formatDateOnly(str) {
  if (!str) return "N/A";
  const d = new Date(str);
  if (isNaN(d)) return str;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function updateAttachmentsPreview() {
  const files = Array.from(filesEl.files || []);
  attachmentsPreviewEl.textContent = files.length
    ? files.map(f => f.name).join(", ")
    : "No files selected";
}

function clearFiles() {
  filesEl.value = "";
  updateAttachmentsPreview();
}

clearFilesBtn.addEventListener("click", clearFiles);
filesEl.addEventListener("change", updateAttachmentsPreview);

function renderTodos() {
  todoListEl.innerHTML = "";
  todos.forEach(todo => {
    const wrapper = document.createElement("div");
    wrapper.className = "todo-item bg-white p-3" + (todo.completed ? " completed" : "");
    wrapper.dataset.id = todo.id;
    wrapper.innerHTML = `
      <div class="d-flex align-items-start gap-3">
        <div class="flex-grow-1 w-100">
          <div class="d-flex align-items-start justify-content-between flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
              <span class="todo-title ${todo.completed ? "completed" : ""}">${escapeHtml(todo.title)}</span>
            </div>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <small class="text-muted">Created: ${formatDateOnly(todo.createdAt)}</small>
              <div class="vr d-none d-md-block"></div>
              <button class="btn btn-complete btn-icon" title="Complete" data-action="toggle-complete">
                <i class="bi ${todo.completed ? "bi-arrow-counterclockwise" : "bi-check2"}"></i>
              </button>
              <button class="btn btn-edit btn-icon" title="Edit" data-action="edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-delete btn-icon" title="Delete" data-action="delete">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div class="todo-meta mt-1">${escapeHtml(todo.description || "")}</div>
          <div class="d-flex flex-wrap align-items-center gap-2 mt-2 small">
            <span class="badge bg-light text-dark">
              <i class="bi bi-calendar-event me-1"></i> Due: ${formatDateTimeLocal(todo.due)}
            </span>
            ${todo.assignee ? `<span class="badge bg-primary"><i class="bi bi-person-fill me-1"></i>${escapeHtml(todo.assignee)}</span>` : ""}
            <span class="badge badge-dark">${todo.attachments} attachment${todo.attachments === 1 ? "" : "s"}</span>
          </div>
        </div>
      </div>`;
    todoListEl.appendChild(wrapper);
  });
}

todoListEl.addEventListener("click", e => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = e.target.closest(".todo-item")?.dataset.id;
  if (!id) return;

  const action = btn.dataset.action;
  if (action === "delete") {
    todos = todos.filter(t => t.id !== id);
    if (editId === id) resetForm();
  } else if (action === "edit") {
    startEdit(id);
  } else if (action === "toggle-complete") {
    const todo = todos.find(t => t.id === id);
    if (todo) todo.completed = !todo.completed;
  }
  renderTodos();
});

function startEdit(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  editId = id;
  titleEl.value = todo.title;
  descEl.value = todo.description || "";
  dueEl.value = todo.due || "";
  assignEl.value = todo.assignee || "";
  clearFiles();
  submitText.textContent = "Save Changes";
  submitIcon.className = "bi bi-save me-1";
}

function resetForm() {
  formEl.reset();
  clearFiles();
  editId = null;
  submitText.textContent = "Add Todo";
  submitIcon.className = "bi bi-plus-lg me-1";
}

formEl.addEventListener("submit", e => {
  e.preventDefault();
  const title = titleEl.value.trim();
  if (!title) return;
  const description = descEl.value.trim();
  const due = dueEl.value;
  const assignee = assignEl.value;
  const attachmentsCount = (filesEl.files || []).length;

  if (editId) {
    const idx = todos.findIndex(t => t.id === editId);
    if (idx !== -1) {
      Object.assign(todos[idx], { title, description, due, assignee, attachments: attachmentsCount });
    }
  } else {
    todos.unshift({
      id: crypto.randomUUID(),
      title,
      description,
      createdAt: new Date().toISOString(),
      due,
      assignee,
      attachments: attachmentsCount,
      completed: false,
    });
  }

  resetForm();
  renderTodos();
});

renderTodos();
updateAttachmentsPreview();
