const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const taskSchema = new mongoose.Schema(
    {
        task_id: { type: Number }, // Auto-increment field
        task_number: { type: Number, required: true },
        task_name: { type: String, required: true },
        due_date: { type: Date, required: true },
        completed: { type: Boolean, default: false },
        status: {
            type: String,
            required: true,
            enum: ["Queue", "With Client", "With Me", "Completed"],
        },
    },
    { timestamps: true },
);

// Apply the auto-increment plugin to task_id
taskSchema.plugin(AutoIncrement, { inc_field: "task_id" });

module.exports = mongoose.model("task", taskSchema);
