const userTaskParser = require('./user-task');
const actionParser = require('./action');

exports.parse = function (schema) {
    const userTask = userTaskParser.parse(schema["user-task"]);
    const actions = actionParser.parse(schema.actions)

    return { userTask, actions };
}