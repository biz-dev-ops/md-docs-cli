Object.assign(String.prototype, {
  wildcardTest(wildcard) {
    let expression = wildcard
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const regex = new RegExp(`^${expression}$`, 'i');
    return regex.test(this);
  }
});