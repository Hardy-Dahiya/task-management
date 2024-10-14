const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const todoSchema = new mongoose.Schema(
    {
        todo_id: { type: Number }, // Auto-increment field
        todo_name: { type: String, required: true },
        due_date: { type: Date, required: false },
        completed: { type: Boolean, default: false },
        status: {
            type: String,
            required: false,
            default: ["With Me"],
            enum: ["Queue", "With Client", "With Me", "Completed"],
        },
    },
    { timestamps: true },
);

// Apply the auto-increment plugin to task_id
todoSchema.plugin(AutoIncrement, { inc_field: "todo_id" });

module.exports = mongoose.model("todo", todoSchema);
