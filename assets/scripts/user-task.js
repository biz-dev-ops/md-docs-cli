(() => {
  document.querySelectorAll('.ui .action-list').forEach((actionList) => {
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

  document.querySelectorAll('.ui .fieldset-controls').forEach((fieldsetControls) => {
    const formItemTemplate = fieldsetControls.parentElement.querySelector('.form-item').cloneNode(true);

    fieldsetControls.querySelectorAll('button').forEach((button) => {
      const action = button.dataset.fieldsetAction;
      button.addEventListener('click', () => {
        if (action === 'add') {
          insertBefore(formItemTemplate.cloneNode(true), fieldsetControls);
        }

        if (action === 'remove') {
          const formItems = fieldsetControls.parentElement.querySelectorAll(':scope > .form-item');
          if (formItems.length > 1) {
            formItems[formItems.length - 1].remove();
          }
        }
      })
    })
  })

  document.querySelectorAll('select.select-one-of').forEach(select => {
    const formItems = select.parentNode.querySelectorAll(':scope > .form-item');
    const showFormItem = index => {
      formItems.forEach(item => {
        item.setAttribute('hidden', true);
      });

      if (index && formItems[index]) {
        formItems[index].removeAttribute('hidden');
      }
    }

    select.addEventListener('change', () => {
      showFormItem(select.value);
    });

    showFormItem();
  });

  function insertBefore(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
  }
})();
