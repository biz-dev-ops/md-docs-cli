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
    if(collection.every(child => child.result.status === 'passed'))
        return 'passed';

    if (collection.some(child => child.result.status === 'failed'))
        return 'failed';

    if (collection.some(child => child.result.status === 'other'))
        return 'other';
    
    if (collection.some(child => child.result.status === 'pending'))
        return 'other';
    
    if (collection.some(child => child.result.status === 'skipped'))
        return 'other';
    
    if (collection.some(child => child.result.status === 'undefined'))
        return 'undefined';

    return 'other';
}