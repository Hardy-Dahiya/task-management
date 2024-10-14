$(document).ready(function () {
    // Enable sortable (drag-and-drop) within and between groups
    $(".sortable-group").sortable({
        connectWith: ".sortable-group",
        placeholder: "ui-state-highlight",
        tolerance: "pointer",
        revert: true,
        forcePlaceholderSize: true,
        start: function (event, ui) {
            ui.item.data("original-group", ui.item.parent().attr("id"));
        },
        receive: function (event, ui) {
            let taskId = ui.item.data("id");
            let newStatus = ui.item.parent().attr("id").replace("-tasks", "").toLowerCase();

            switch (newStatus) {
                case "queue":
                    newStatus = "Queue";
                    break;
                case "with-me":
                    newStatus = "With Me";
                    break;
                case "with-client":
                    newStatus = "With Client";
                    break;
            }

            // Update task status using the API
            $.ajax({
                url: `/v1/task/${taskId}`,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({ status: newStatus }),
                success: function (response) {
                    console.log(response);
                    loadTasks();
                },
                error: function (xhr, status, error) {
                    console.error("Error updating task:", error);
                },
            });
        },
    });

    // Fetch and display tasks
    function loadTasks() {
        $.get("/v1/task/", function (data) {
            const tasks = data.data;
            $("#with-me-tasks").empty();
            $("#with-client-tasks").empty();
            $("#queue-tasks").empty();
            $("#completed-tasks-list").empty();

            tasks.forEach((task) => {
                let formattedDate = new Date(task.due_date).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                });

                let taskElement = `
                        <div class="task-row" data-id="${task._id}">
                        <div class="col-2">${task.task_number}</div>
                        <div class="col-4">${task.task_name}</div>
                        <div class="col-2">${formattedDate}</div>
                        <div class="col-1">
                            <button class="btn btn-warning btn-sm btn-add-today" data-id="${task._id}">
                                <i class="fa-solid fa-sun"></i>
                            </button>
                        </div>
                        <div class="col-1">
                            <button class="btn btn-success btn-sm btn-complete" data-id="${task._id}">
                                <i class="fa-regular fa-circle-check"></i>
                            </button>
                        </div>
                        <div class="col-1">
                            <button class="btn btn-primary btn-sm btn-edit" data-id="${task._id}" data-toggle="modal" data-target="#editTaskModal">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                        </div>
                        <div class="col-1">
                            <button class="btn btn-sm btn-danger" data-id="${task._id}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                        </div>
      `;

                // Map status to the correct group
                let status = task.status.toLowerCase();
                if (status === "with me") {
                    $("#with-me-tasks").append(taskElement);
                } else if (status === "with client") {
                    $("#with-client-tasks").append(taskElement);
                } else if (status === "queue") {
                    $("#queue-tasks").append(taskElement);
                } else if (status === "completed") {
                    $("#completed-tasks-list").append(taskElement);
                }
            });
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
                loadTasks(); // Reload tasks after successful submission
            },
            error: function (err) {
                console.error("Error creating task:", err);
            },
        });
    });

    // Handle task editing via modal
    $(document).on("click", ".btn-edit", function () {
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
                loadTasks(); // Reload tasks after successful update
            },
            error: function (err) {
                console.error("Error updating task:", err);
            },
        });
    });

    // Handle task completion
    $(document).on("click", ".btn-complete", function () {
        const taskId = $(this).data("id");

        if (confirm("Are you sure you want to mark this task as completed?")) {
            const currentDate = new Date().toISOString().split("T")[0];

            $.ajax({
                url: `/v1/task/${taskId}`,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({
                    completed: true,
                    due_date: currentDate,
                    status: "Completed",
                }),
                success: function () {
                    loadTasks();
                },
            });
        }
    });
    // Handle task completion
    $(document).on("click", ".btn-add-today", function () {
        const taskId = $(this).data("id");

        if (confirm("Are you sure you add this task to today?")) {
            $.ajax({
                url: `/v1/task/${taskId}`,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({
                    due_date: new Date(),
                }),
                success: function () {
                    loadTasks();
                },
            });
        }
    });
    // Handle delete task
    $(document).on("click", ".btn-danger", function () {
        const taskId = $(this).data("id");

        if (confirm("Are you sure you want to delete this task?")) {
            $.ajax({
                url: `/v1/task/${taskId}`,
                type: "DELETE",
                contentType: "application/json",
                success: function () {
                    loadTasks();
                },
            });
        }
    });
    // Show completed tasks modal
    $("#show-completed").click(function () {
        $("#completedModal").modal("show");
        loadTasks(); // Load only completed tasks inside the modal
    });
    // Load tasks when the page is ready
    loadTasks();
});
