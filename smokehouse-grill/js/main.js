/**
 * Ember & Oak Smokehouse JavaScript
 */
document.addEventListener('DOMContentLoaded', () => {
  initSmokehouseNav();
  initMenuFilters();
  initReservationForm();
});

function initSmokehouseNav() {
  const links = document.querySelectorAll('nav a[href^="#"], a[data-path="reservations"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ScrollSpy
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.pageYOffset + 150;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('nav a').forEach(a => {
          if (a.getAttribute('href') === `#${id}`) {
            a.classList.add('active');
          } else {
            a.classList.remove('active');
          }
        });
      }
    });
  });
}

function initMenuFilters() {
  const filterTabs = document.querySelectorAll('[data-menu-category]');
  const menuItems = document.querySelectorAll('[data-item-category]');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      filterTabs.forEach(t => t.classList.remove('bg-surface-container-highest', 'text-primary', 'font-bold'));
      this.classList.add('bg-surface-container-highest', 'text-primary', 'font-bold');

      const cat = this.getAttribute('data-menu-category');
      menuItems.forEach(item => {
        if (cat === 'all' || item.getAttribute('data-item-category') === cat) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

function initReservationForm() {
  const bookingBtn = document.querySelector('#reservation button[type="button"], #reservation button[type="submit"]');
  if (bookingBtn) {
    bookingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showSmokehouseToast('🔥 Hearth Table Confirmed! We have reserved your seats. See you soon at Ember & Oak.');
    });
  }
}

function showSmokehouseToast(message) {
  let toast = document.getElementById('smokehouseToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'smokehouseToast';
    toast.className = 'smokehouse-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}
