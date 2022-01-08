const chalk = require('chalk-next');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.info = async function () {
    try {
        const branch = await __exec(`git rev-parse --abbrev-ref HEAD`);
        const repository = await parseGitRepository();
        const remote = await parseRemoteOrigin();

        const localBranches = (await __exec(`git branch -a`))
            .split(`\n`)
            .map(b => b.replace("*", "").trim())
            .filter(b => !b.startsWith("remotes"));

        const branches = remote.branches.concat(localBranches.filter(b => !remote.branches.includes(b)))
            .map(b => ({
                name: b,
                url: `https://github.com/${repository}/tree/${b}`,
                feature: !remote.mainBranch,
            }))
            .sort((a, b) => `${a.feature ? "z" : "a"}${a.name}`.localeCompare(`${b.feature ? "z" : "a"}${b.name}`));

        return {
            branch: branches.find(b => b.name === branch),
            branches
        };
    }
    catch (ex) {
        if (!ex?.message?.includes('fatal: not a git repository')) {            
            throw ex;
        }

        console.info('');
        console.warn(chalk.yellowBright(`directorty is not a git repository, falling back to default.`));
        
        const branch = {
            name: 'main',
            url: `https://github.com/undefined/undefined/tree/main`,
            feature: false
        };

        return {
            branch,
            branches: [branch]
        };
    }
}

async function __exec(command) {
    const { stdout, stderr } = await exec(command, { timeout: 5000 });

    if (stderr.trim() != "")
        throw stderr.trim();

    return stdout.trim();
}

async function parseGitRepository() {
    const originUrl = await __exec(`git config --get remote.origin.url`);
    const parts = originUrl.trim().split("/");
    let repository = `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    if (repository.endsWith(".git"))
        repository = repository.substring(0, repository.length - 4);

    const index = repository.indexOf(":");
    if (index > -1)
        repository = repository.substring(index + 1);

    return repository;
}

async function parseRemoteOrigin() {
    const name = await __exec(`git remote`);
    const lines = parseGitReponse((await __exec(`git remote show ${name}`)));

    const response = {
        mainBranch: lines
            .filter(l => l.key == "HEAD branch")
            .map(l => l.value)
        [0],
        branches: lines
            .filter(l => l.key.startsWith("Remote branch"))
            .map(l => l.value.map(l => l.substr(0, l.indexOf(" "))))
        [0]
    };

    return response;
}

function parseGitReponse(response) {
    const lines = response.split(`\n`);
    const parsed = [];

    lines.forEach(line => {
        const index = line.indexOf(":");
        if (index == -1) {
            if (parsed.length === 0)
                return;

            const last = parsed[parsed.length - 1];
            if (last.value == "") {
                last.value = [];
            }

            last.value.push(line.trim());
            return;
        }

        const key = line.substr(0, index).trim();
        const value = line.substr(index + 1).trim();

        parsed.push({ key, value });
    });

    return parsed;

}

function featureBranchToPath(branch) {
    return branch
        .replace(" ", "-")
        .toLowerCase();
}