(() => {
  document.querySelectorAll('.ui').forEach((userTask) => {
    const initActionList = (actionList) => {
      const sections = [];

      const hide = (el) => {
        el.setAttribute('hidden', 'hidden');
      }

      const show = (el) => {
        el.removeAttribute('hidden');
      }

      actionList.querySelectorAll('button').forEach((action) => {
        const sectionId = action.dataset.controlsForm;
        const section = userTask.querySelector(`[data-form-id=${sectionId}]`);

        sections.push(section);

        action.onclick = event => {
          show(section);
          hide(actionList);
        }
      })

      const closeActionCard = (section) => {
        show(actionList);
        hide(section);
      }

      sections.forEach(section => {
        const form = section.querySelector('form');
        const submit = section.querySelector('[type="submit"]');
        const cancel = section.querySelector('[data-cancel]');

        submit.onclick = (event) => {
          const confirmText = submit.getAttribute("data-confirm");

          if (form.checkValidity()) {
            if (window.confirm(confirmText || "")) {
              closeActionCard(section);
            }
          }

          event.preventDefault();
        }

        cancel.onclick = (event) => {
          closeActionCard(section);

          event.preventDefault();
        }
      });
    };

    const initFieldSetControls = (fieldsetControls) => {
      const formItemTemplate = fieldsetControls.parentElement.querySelector('.form-item').cloneNode(true);

      fieldsetControls.querySelectorAll('button').forEach((button) => {
        const action = button.dataset.fieldsetAction;
        button.addEventListener('click', () => {
          if (action === 'add') {
            fieldsetControls.insertAdjacentElement('beforebegin', formItemTemplate.cloneNode(true));
          }

          if (action === 'remove') {
            const formItems = fieldsetControls.parentElement.querySelectorAll(':scope > .form-item');
            if (formItems.length > 1) {
              formItems[formItems.length - 1].remove();
            }
          }
        })
      })
    }

    const initSelectOneOf = (select) => {
      const formItems = select.closest('fieldset').querySelectorAll(':scope > .form-item');
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
    }

    userTask.querySelectorAll('.action-list').forEach(initActionList);
    userTask.querySelectorAll('.fieldset-controls').forEach(initFieldSetControls);
    userTask.querySelectorAll('select.select-one-of').forEach(initSelectOneOf);

    const observer = new MutationObserver(function(mutations_list) {
      mutations_list.forEach(function(mutation) {
        mutation.addedNodes.forEach(node => {
          node.querySelectorAll('select.select-one-of').forEach(initSelectOneOf);
        });
      });
    });

    observer.observe(userTask, { subtree: true, childList: true });
  })
})();
