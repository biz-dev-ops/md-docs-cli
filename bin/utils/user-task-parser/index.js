const userTaskParser = require('./user-task');
const actionParser = require('./action');

exports.parse = function (schema, locale) {
    const userTask = userTaskParser.parse(schema["user-task"], locale);
    const actions = actionParser.parse(schema.actions, locale)

    return { userTask, actions };
}