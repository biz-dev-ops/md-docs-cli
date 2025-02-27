const colors = require('colors');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

exports.info = async function (options) {
    console.info();
    console.info(colors.yellow(`downloading git information:`));
    const info = {
        type: options.git.type
    };

    let run = 0;
    let exception = null;

    do {
        exception = null;
        run++;
        try {
            const branch = await __exec(`git rev-parse --abbrev-ref HEAD`);
        
            console.info(colors.green(`\t* current branch: ${branch}`));

            const repository = await parseGitRepository();
            const remote = await parseRemoteOrigin();

            const localBranches = (await __exec(`git branch -a`))
                .split(/\r?\n/)
                .map(b => b.replace(/\*/g, "").trim());
                    
            const branches = remote.branches
                .concat(localBranches.filter(b => !remote.branches.includes(b)))
                .filter(b =>
                    !b.includes('remotes/') &&
                    !b.includes('HEAD detached') &&
                    (options.args.skip == undefined || !options.args.skip.some(s => b.wildcardTest(s)))
                )
                .map(b => ({
                    name: b,
                    repository: repository,
                    mainBranch: remote.mainBranch === b,
                }))
                .map(b => Object.assign(b, {
                    path: createPath(b)
                }))
                .sort((a, b) => `${a.mainBranch ? 'a' : 'z'}${a.name}`.localeCompare(`${b.mainBranch ? 'a' : 'z'}${b.name}`));

            info.branch = branches.find(b => b.name === branch);
            if (!info.branch) {
                console.warn(colors.brightYellow(`\t* branch not found falling back to default branch.`));
                info.branch = branches.find(b => b.mainBranch === true);
            }
            info.branches = branches;
        }
        catch (ex) {
            exception = ex;
            console.warn(colors.brightYellow(`\t* git command failed, retry policy is active.`));
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    while(exception != null && run < 5)
    
    if(exception) {
        if(options.args.failFast) {
            throw exception;
        }

        if (!exception?.message?.includes('fatal: not a git repository')) {
            console.warn(colors.brightYellow(`\t* git command failed, falling back to default.`));
            console.error(colors.brightRed(exception));
        }
        else {
            console.warn(colors.brightYellow(`\t* directory is not a git repository, falling back to default.`));
        }

        const branch = {
            name: 'main',
            repository: 'undefined',
            path: 'main/',
            mainBranch: true
        };

        info.branch = branch;
        info.branches = [branch];
    }

    if (!info.branch)
        return;
    
    console.info(colors.green(`\t* repository: ${info.branch.repository}`));
    console.info(colors.green(`\t* branches: ${info.branches.map(b => b.name).join(', ')}`));
    console.info(colors.green(`\t* branch: ${info.branch.name}`));

    return info;
}

async function __exec(command) {
    const { stdout, stderr } = await exec(command, { timeout: 5000 });

    if (stderr.trim() != '')
        throw stderr.trim();

    return stdout.trim();
}

async function parseGitRepository() {
    const originUrl = await __exec(`git config --get remote.origin.url`);
    const parts = originUrl.trim().split('/');
    let repository = `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
    if (repository.endsWith('.git'))
        repository = repository.substring(0, repository.length - 4);

    const index = repository.indexOf(':');
    if (index > -1)
        repository = repository.substring(index + 1);

    return repository;
}

async function parseRemoteOrigin() {
    const name = await __exec(`git remote`);
    const lines = parseGitReponse((await __exec(`git remote show ${name}`)));

    const response = {
        mainBranch: lines
            .filter(l => l.key == 'HEAD branch')
            .map(l => l.value)
        [0],
        branches: lines
            .filter(l => l.key.startsWith('Remote branch'))
            .map(l => l.value.map(l => l.substr(0, l.indexOf(' '))))
        [0]
    };

    return response;
}

function parseGitReponse(response) {
    const lines = response.split(/\r?\n/);
    const parsed = [];

    lines.forEach(line => {
        const index = line.indexOf(':');
        if (index == -1) {
            if (parsed.length === 0)
                return;

            const last = parsed[parsed.length - 1];
            if (last.value == '') {
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

function createPath(branch) {
    return `${branch.name.replace(' ', '-').toLowerCase()}/`;
}