// Initial To-do and Task drag-and-drop functionality
$(document).ready(function () {
    $(".sortable-group-todo").sortable({
        connectWith: ".sortable-group-todo",
        placeholder: "ui-state-highlight",
        tolerance: "pointer",
        revert: true,
        forcePlaceholderSize: true,
        start: function (event, ui) {
            ui.item.data("original-group", ui.item.parent().attr("id"));
        },
        receive: function (event, ui) {
            let taskId = ui.item.data("id");
            let type = ui.item.data("type");
            let newStatus = ui.item.parent().attr("id").replace("-tasks", "").toLowerCase();
            console.log(newStatus);
            switch (newStatus) {
                case "today-todo":
                    newStatus = "Queue";
                    break;
                case "done":
                    newStatus = "Completed";
                    break;
            }
            // Update task status using the API
            if (type === "todo") {
                $.ajax({
                    url: `/v1/todo/${taskId}`,
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({ status: newStatus }),
                    success: function (response) {
                        console.log(response);
                        loadTodos();
                    },
                    error: function (xhr, status, error) {
                        console.error("Error updating task:", error);
                    },
                });
            } else if (type === "task") {
                $.ajax({
                    url: `/v1/task/${taskId}`,
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify({ status: newStatus, due_date: new Date() }),
                    success: function (response) {
                        console.log(response);
                        loadTodos();
                    },
                    error: function (xhr, status, error) {
                        console.error("Error updating task:", error);
                    },
                });
            }
        },
    });

    // Load todos
    function loadTodos() {
        $.get("/v1/todo", function (data) {
            const todos = data.data;
            $("#today-todo").empty();
            $("#done-tasks").empty();
            todos.forEach((todo) => {
                let formattedDate = new Date(todo.due_date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                });

                let taskElement = ``;
                if (todo.type === "todo") {
                    taskElement = `
      <div class="task-row" data-id="${todo._id}" data-type="${todo.type}">
          <div class="col-9">${todo.todo_name}</div>
                                 <div class="col-1">
                            <button class="btn btn-success btn-sm btn-complete-todo" data-id="${todo._id}" data-type="${todo.type}">
                                <i class="fa-regular fa-circle-check"></i>
                            </button>
                        </div>
                        <div class="col-1">
                            <button class="btn btn-primary btn-sm btn-edit" data-id="${todo._id}" data-toggle="modal" data-target="#editTodoModal">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                        </div>
                        <div class="col-1">
                            <button class="btn btn-sm btn-danger" data-id="${todo._id}" data-type="${todo.type}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
      </div>`;
                } else if (todo.type === "task") {
                    taskElement = `
                        <div class="task-row" data-id="${todo._id}" data-type="${todo.type}">
                        <div class="col-2">${todo.task_number}</div>
                        <div class="col-4">${todo.task_name}</div>
                        <div class="col-4">${formattedDate}</div>
                        <div class="col-1">
                            <button class="btn btn-success btn-sm btn-complete-todo" data-id="${todo._id}" data-type="${todo.type}">
                                <i class="fa-regular fa-circle-check"></i>
                            </button>
                        </div>
                        <div class="col-1">
                            <button class="btn btn-sm btn-danger" data-id="${todo._id}" data-type="${todo.type}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                        </div>
      `;
                }
                if (todo.completed) {
                    $("#done-tasks").append(taskElement);
                } else {
                    $("#today-todo").append(taskElement);
                }
            });
        });
    }

    // Handle adding new to-do
    $("#todoForm").submit(function (e) {
        e.preventDefault();
        const todoName = $("#todoName").val();
        $.post("/v1/todo", { todo_name: todoName }, function () {
            loadTodayTasks(); // Reload the list after adding
            loadTodos();
            $("#todoModal").modal("hide");
        });
    });

    // Mark task or to-do as done
    function markTaskOrTodoDone(taskId) {
        $.ajax({
            url: `/v1/todo/${taskId}`,
            type: "PUT",
            success: function () {
                loadTodayTasks(); // Reload tasks after marking as done
            },
        });
    }
    // Handle task creation
    $("#taskForm").submit(function (e) {
        e.preventDefault();

        // Serialize the form data into an array of name-value pairs
        const formDataArray = $(this).serializeArray();

        // Convert the serialized array to an object
        const taskData = {};
        formDataArray.forEach((item) => {
            taskData[item.name] = item.value;
        });

        // Send the formatted JSON object in the request
        $.ajax({
            url: "/v1/task/",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(taskData), // Send the object as a JSON string
            success: function () {
                $("#taskModal").modal("hide");
                loadTodayTasks(); // Reload tasks after successful submission
            },
            error: function (err) {
                console.error("Error creating task:", err);
            },
        });
    });

    // Handle task editing via modal
    $(document).on("click", "#task-edit", function () {
        let taskId = $(this).data("id");

        // Fetch task details for editing
        $.get(`/v1/task/${taskId}`, function (response) {
            const task = response.data;
            // Populate modal form fields with task details
            $("#editTaskModal #editTaskId").val(task._id);
            $("#editTaskModal #editTaskNumber").val(task.task_number);
            $("#editTaskModal #editTaskName").val(task.task_name);
            $("#editTaskModal #editDueDate").val(task.due_date);
            $("#editTaskModal #editStatus").val(task.status);
        });
    });
    // Trigger API call when the todo edit modal is opened
    $("#editTodoModal").on("show.bs.modal", function (event) {
        let button = $(event.relatedTarget); // Button that triggered the modal
        let todoId = button.data("id"); // Extract the todo ID from data-* attributes
        console.log(`Fetching todo with ID: ${todoId}`); // Debugging log

        // Fetch todo details
        $.get(`/v1/todo/${todoId}`, function (response) {
            if (response && response.data) {
                const todo = response.data;
                console.log(todo); // Debugging log
                // Populate modal form fields with todo details
                $("#editTodoModal #editTodoId").val(todo._id);
                $("#editTodoModal #editTodoNumber").val(todo.todo_id);
                $("#editTodoModal #editTodoName").val(todo.todo_name);
                $("#editTodoModal #editStatus").val(todo.status);
            } else {
                console.error("Todo data not found");
            }
        }).fail(function (error) {
            console.error("Error fetching todo:", error);
        });
    });

    // Trigger API call when the task edit modal is opened
    $("#editTaskModal").on("show.bs.modal", function (event) {
        let button = $(event.relatedTarget); // Button that triggered the modal
        let taskId = button.data("id"); // Extract the task ID from data-* attributes
        console.log(`Fetching task with ID: ${taskId}`); // Debugging log

        // Fetch task details
        $.get(`/v1/task/${taskId}`, function (response) {
            if (response && response.data) {
                const task = response.data;
                console.log(task); // Debugging log
                // Populate modal form fields with task details
                $("#editTaskModal #editTaskId").val(task._id);
                $("#editTaskModal #editTaskNumber").val(task.task_number);
                $("#editTaskModal #editTaskName").val(task.task_name);
                $("#editTaskModal #editDueDate").val(task.due_date);
                $("#editTaskModal #editStatus").val(task.status);
            } else {
                console.error("Task data not found");
            }
        }).fail(function (error) {
            console.error("Error fetching task:", error);
        });
    });

    // Handle task update from the edit modal
    $("#editTaskForm").submit(function (e) {
        e.preventDefault();

        const taskId = $("#editTaskModal #editTaskId").val();

        // Serialize form data into an array of name-value pairs
        const formDataArray = $(this).serializeArray();

        // Convert the serialized array to an object
        const taskData = {};
        formDataArray.forEach((item) => {
            taskData[item.name] = item.value;
        });

        // Send the formatted JSON object in the request
        $.ajax({
            url: `/v1/task/${taskId}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(taskData), // Send the object as a JSON string
            success: function () {
                $("#editTaskModal").modal("hide");
                loadTodayTasks(); // Reload tasks after successful update
            },
            error: function (err) {
                console.error("Error updating task:", err);
            },
        });
    });

    // Handle task update from the edit modal
    $("#editTodoForm").submit(function (e) {
        e.preventDefault();

        const todoId = $("#editTodoModal #editTodoId").val();

        // Serialize form data into an array of name-value pairs
        const formDataArray = $(this).serializeArray();

        // Convert the serialized array to an object
        const taskData = {};
        formDataArray.forEach((item) => {
            taskData[item.name] = item.value;
        });

        // Send the formatted JSON object in the request
        $.ajax({
            url: `/v1/todo/${todoId}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(taskData), // Send the object as a JSON string
            success: function () {
                $("#editTodoModal").modal("hide");
                loadTodos(); // Reload tasks after successful update
            },
            error: function (err) {
                console.error("Error updating task:", err);
            },
        });
    });

    // Handle task completion
    $(document).on("click", ".btn-complete-todo", function () {
        const taskId = $(this).data("id");
        const type = $(this).data("type");
        if (confirm(`Are you sure you want to mark this ${type} as completed?`)) {
            const currentDate = new Date().toISOString().split("T")[0];
            $.ajax({
                url: `/v1/${type}/${taskId}`,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({
                    completed: true,
                    due_date: currentDate,
                    status: "Completed",
                }),
                success: function () {
                    loadTodos();
                },
            });
        }
    });
    // Handle delete task
    $(document).on("click", ".btn-danger", function () {
        const taskId = $(this).data("id");
        const type = $(this).data("type");
        if (confirm(`Are you sure you want to delete this ${type}?`)) {
            $.ajax({
                url: `/v1/${type}/${taskId}`,
                type: "DELETE",
                contentType: "application/json",
                success: function () {
                    loadTodos();
                },
            });
        }
    });
    // Show completed tasks modal
    $("#show-completed").click(function () {
        $("#completedModal").modal("show");
        loadTodos(); // Load only completed tasks inside the modal
    });

    // Load initial tasks for today
    loadTodos();
});
