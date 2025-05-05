document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.form-work-togezer');
  const footerModal = document.querySelector('.footer-modal-background');
  const closeButton = document.querySelector('.footer-modal-btn');
  const emailInput = document.querySelector('.input-work-togezer');
  const messageInput = document.querySelector('.textarea-work-togezer');
  const emailErrorMessage = document.querySelectorAll('.error-message')[0];
  const messageErrorMessage = document.querySelectorAll('.error-message')[1];

  footerModal.style.display = 'none';

  function toggleKeyboardListener(isOpen) {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKeyPress);
    } else {
      document.removeEventListener('keydown', handleEscapeKeyPress);
    }
  }

  function handleEscapeKeyPress(event) {
    if (event.key === 'Escape') {
      footerModal.style.display = 'none';
    }
  }

  form.addEventListener('submit', function (event) {
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!validateEmail(email)) {
      emailErrorMessage.style.display = 'block';
      event.preventDefault();
      return;
    } else {
      emailErrorMessage.style.display = 'none';
    }

    if (message === '') {
      messageErrorMessage.style.display = 'block';
      event.preventDefault();
      return;
    } else {
      messageErrorMessage.style.display = 'none';
    }

    // Дозволяємо стандартну відправку (formsubmit)
    setTimeout(() => {
      footerModal.style.display = 'flex';
      toggleKeyboardListener(true);
      form.reset();
    }, 300);
  });

  closeButton.addEventListener('click', function () {
    footerModal.style.display = 'none';
    toggleKeyboardListener(false);
  });

  footerModal.addEventListener('click', function (event) {
    if (event.target === footerModal) {
      footerModal.style.display = 'none';
      toggleKeyboardListener(false);
    }
  });

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  form.addEventListener('input', event => {
    emailInput.style.background = '#e4e5e6';
    messageInput.style.background = '#e4e5e6';
  });
});
