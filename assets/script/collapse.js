// Collapse
const collapse = (el) => {
  const collapseToggles = (el || document).querySelectorAll('[data-toggle="collapse"]');
  const collapse = (targets, collapse) => {
    targets.forEach(target => {
      const parent = target.parentElement;

      if (collapse) {
        target.setAttribute('hidden', 'hidden');
      } else {
        target.removeAttribute('hidden');
      }

      if (parent.tagName === 'LI') {
        if (collapse) {
          parent.classList.add('has-hidden-children');
        } else {
          parent.classList.remove('has-hidden-children');
        }
      }
    })
  }

  collapseToggles.forEach(toggle => {
    const controls = toggle.getAttribute('aria-controls');
    if (!controls) return;

    const targets = document.querySelectorAll('#' + controls.split(" ").join(" #"));
    if (!targets) return;

    collapse(targets, true);
    toggle.setAttribute('aria-expanded', 'false');

    toggle.onclick = () => {
      const expanded = toggle.getAttribute('aria-expanded') !== "false";
      collapse(targets, expanded);
      toggle.setAttribute('aria-expanded', !expanded);
    };
  });
}