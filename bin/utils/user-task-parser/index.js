const userTaskParser = require('./user-task');
const actionParser = require('./action');

module.exports = class UserTaskParser {
    constructor({ options, locale }) {
        this.options = options;
        this.locale = locale;
    }

    async parse(schema) {
        const convention = this.options.user_task || {};

        const userTask = userTaskParser.parse(schema["user-task"], convention);
        const actions = actionParser.parse(schema.actions, convention);

        if (userTask)
            userTask.locale = this.locale;

        if (actions)
            actions.locale = this.locale;

        return { userTask, actions, locale: await this.locale.get() };
    }
}