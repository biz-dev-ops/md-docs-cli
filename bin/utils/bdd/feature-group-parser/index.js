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
                result: null
            }
            groups.push(group);
        }

        group.features.push(f);
        group.result = maxResult(group.result, f.result);
    });

    return groups;
}

function maxResult(result1, result2) {
    //TODO
    return result2;
}