(() => {
  document.querySelectorAll('.action-list').forEach((actionList) => {
    const actionCards = [];

    const hide = (el) => {
      el.setAttribute('hidden', 'hidden');
    }

    const show = (el) => {
      el.removeAttribute('hidden');
    }

    actionList.querySelectorAll('button').forEach((action) => {
      const targetId = action.getAttribute('aria-controls');
      const target = document.getElementById(targetId);

      actionCards.push(target);

      action.onclick = event => {
        show(target);
        hide(actionList);
      }
    })

    const closeActionCard = (card) => {
      show(actionList);
      hide(card);
    }

    actionCards.forEach(card => {
      const form = card.querySelector('form');
      const submit = card.querySelector('[type="submit"]');
      const cancel = card.querySelector('[data-cancel]');

      submit.onclick = (event) => {
        const confirmText = submit.getAttribute("data-confirm");

        if (form.checkValidity()) {
          if (window.confirm(confirmText || "")) {
            closeActionCard(card);
          }
        }

        event.preventDefault();
      }

      cancel.onclick = (event) => {
        closeActionCard(card);

        event.preventDefault();
      }
    });
  })
})();