const { array } = require("yargs");

exports.group = (features) => {
    if (!features.some(f => f.group))
        return features;

    const groups = [];

    features.forEach(f => {
        if (!f.group) {
            groups.push(f);
            return;
        }

        let group = groups.find(g => g.name === f.group);
        if (!group) {
            group = {
                name: f.group,
                title: f.group,
                features: [],
                result: {
                    status: 'undefined'
                }
            }
            groups.push(group);
        }

        group.features.push(f);
        group.result.status = getAggregateResult([f]);
    });

    return groups;
}

getAggregateResult = function (collection) {
    if(collection.length === 0)
        return [ 'undefined' ];

    const status = [
        ...new Set (
            collection.flatMap(child => {
                if(Array.isArray(child.result.status))
                    return child.result.status;

                switch(child.result.status) {
                    case 'passed':
                    case 'failed':
                    case 'undefined':
                        return child.result.status
                    default: 
                        return 'other'
                }
            })
        )
    ];

    return status;
}