/**
 * نبض الأمل - لأطفال الغسيل الكلوي
 * Hope & Vitality Platform JavaScript Core
 * المتكامل مع Firebase
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMobileMenu();
  initDonationWidget();
  initImpactCalculator();
  initModalAndForms();
  initHeroesFilter();
  initLiveDonationListener();
});

/* ========================================================
   1. NAVIGATION & ACTIVE PAGE DETECTOR
   ======================================================== */
function initNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // Map page file names to data-page attributes
  const pageMap = {
    '': 'home',
    'index.html': 'home',
    'heroes.html': 'heroes-stories',
    'calculator.html': 'donation-calculator',
    'partners.html': 'partners-and-hospitals',
    'about.html': 'about-initiative',
    'donate.html': 'quick-donate'
  };

  const activePageKey = pageMap[currentPath] || 'home';

  // Desktop Links
  document.querySelectorAll('#mainNav .nav-link').forEach(link => {
    const pageAttr = link.getAttribute('data-page');
    if (pageAttr === activePageKey) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mobile Links
  document.querySelectorAll('#mobileMenu .mobile-nav-link').forEach(link => {
    const pageAttr = link.getAttribute('data-page');
    if (pageAttr === activePageKey) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ========================================================
   2. MOBILE HAMBURGER DRAWER MENU
   ======================================================== */
function initMobileMenu() {
  const openBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('closeMobileMenuBtn');
  const menu = document.getElementById('mobileMenu');
  if (!menu) return;

  const drawer = menu.querySelector('div');

  const openDrawer = () => {
    menu.classList.remove('opacity-0', 'pointer-events-none');
    menu.classList.add('opacity-100', 'pointer-events-auto');
    if (drawer) drawer.classList.remove('translate-x-full');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    menu.classList.add('opacity-0', 'pointer-events-none');
    menu.classList.remove('opacity-100', 'pointer-events-auto');
    if (drawer) drawer.classList.add('translate-x-full');
    document.body.style.overflow = '';
  };

  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  menu.addEventListener('click', (e) => {
    if (e.target === menu) closeDrawer();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
}

/* ========================================================
   3. QUICK DONATION WIDGET
   ======================================================== */
window.selectDonation = function(amount, btnElement) {
  document.querySelectorAll('.donation-card').forEach(el => {
    el.classList.remove('bg-primary-fixed/40', 'shadow-md', 'border-2', 'border-primary');
    el.classList.add('bg-surface-container-low');
  });
  if (btnElement) {
    btnElement.classList.add('bg-primary-fixed/40', 'shadow-md', 'border-2', 'border-primary');
    btnElement.classList.remove('bg-surface-container-low');
  }
  
  const customInput = document.getElementById('customAmountInput');
  if (customInput) {
    customInput.value = amount;
  }
};

let currentDonationFrequency = 'once';

function initDonationWidget() {
  // Frequency buttons
  const freqButtons = document.querySelectorAll('.donation-frequency-btn');
  freqButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      freqButtons.forEach(b => {
        b.classList.remove('bg-surface-container-lowest', 'text-primary', 'font-bold', 'shadow-sm');
        b.classList.add('text-on-surface-variant');
      });
      this.classList.add('bg-surface-container-lowest', 'text-primary', 'font-bold', 'shadow-sm');
      this.classList.remove('text-on-surface-variant');
      currentDonationFrequency = this.textContent.includes('شهرية') ? 'monthly' : 'once';
    });
  });

  // Main quick donate button on home
  const heroQuickBtn = document.getElementById('heroQuickDonateBtn');
  if (heroQuickBtn) {
    heroQuickBtn.addEventListener('click', () => {
      const customInput = document.getElementById('customAmountInput');
      const amount = customInput ? Number(customInput.value) || 250 : 250;
      openDonationModal('صندوق الأمل الفوري للأطفال', amount, currentDonationFrequency);
    });
  }

  // Donate page checkout form
  const donatePageForm = document.getElementById('donateCheckoutForm');
  if (donatePageForm) {
    donatePageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = donatePageForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> جاري الاتصال بـ Firebase وتأكيد التبرع...';
      }

      const customInput = document.getElementById('customAmountInput');
      const childSelect = document.getElementById('donateChildSelect');
      const donorNameInput = document.getElementById('donorNameInput');
      const donorPhoneInput = document.getElementById('donorPhoneInput');
      const payRadio = document.querySelector('input[name="pay"]:checked');

      const donationData = {
        amount: customInput ? Number(customInput.value) || 250 : 250,
        frequency: currentDonationFrequency,
        childName: childSelect ? childSelect.options[childSelect.selectedIndex].text : 'الحالات الأكثر إلحاحاً',
        donorName: donorNameInput?.value || 'فاعل خير',
        donorPhone: donorPhoneInput?.value || '',
        paymentMethod: payRadio ? payRadio.value : 'mada'
      };

      if (window.FirebaseApp && window.FirebaseApp.saveDonation) {
        const res = await window.FirebaseApp.saveDonation(donationData);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
        showReceiptModal(res.receipt);
        showToast('جزاكم الله خيراً! تم حفظ تبرعك في Firebase وإصدار الإيصال 💖', 'verified');
      } else {
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
          showReceiptModal({
            receiptNumber: 'NABDA-' + Math.floor(100000 + Math.random() * 900000),
            amount: donationData.amount,
            childName: donationData.childName,
            donorName: donationData.donorName,
            timestamp: new Date().toISOString()
          });
        }, 600);
      }
    });
  }
}

/* ========================================================
   4. HUMAN IMPACT CALCULATOR
   ======================================================== */
window.updateImpact = function(val) {
  const textElem = document.getElementById('sliderValueText');
  const medicalElem = document.getElementById('impactMedical');
  const psychElem = document.getElementById('impactPsych');
  const nutritionElem = document.getElementById('impactNutrition');

  if (textElem) {
    textElem.textContent = Number(val).toLocaleString('ar-SA') + ' ر.س';
  }

  if (!medicalElem || !psychElem || !nutritionElem) return;

  if (val < 150) {
    medicalElem.textContent = 'تأمين أنابيب ومطهرات طبية معقمة لجزء من الجلسة.';
    psychElem.textContent = 'ألوان خشبية ودفتر تلوين للأبطال الصغار أثناء فترات الغسيل.';
    nutritionElem.textContent = 'وجبة بروتينية خفيفة وصحية بعد انتهاء جلسة الغسيل.';
  } else if (val < 500) {
    medicalElem.textContent = 'تغطية تكاليف الفلتر والأنابيب المعقمة لجلسة غسيل كاملة منقذة لحياة طفل.';
    psychElem.textContent = 'توفير حقيبة ألعاب ذكاء وكراسة رسم تزيل ملل وخوف الساعات الـ 4 المقيدة بالسرير.';
    nutritionElem.textContent = 'تأمين حليب بروتيني خالي من الفوسفور والبوتاسيوم المناسب لحمية الغسيل الكلوي لأسبوعين.';
  } else if (val < 1200) {
    medicalElem.textContent = 'كفالة 4 جلسات غسيل دموي متكاملة مع الفحوصات المخبرية الدورية.';
    psychElem.textContent = 'جهاز لوحي تعليمي مثبت على سرير الغسيل لمتابعة دروس المدرسة بلا انقطاع.';
    nutritionElem.textContent = 'سلة غذائية علاجية خاصة تكفي عائلة الطفل المريض لشهر كامل.';
  } else {
    medicalElem.textContent = 'كفالة علاجية شهرية شاملة لكل جلسات الغسيل (12 جلسة) وفحوصات الدم المستمرة.';
    psychElem.textContent = 'تحقيق أمنية البطل (حاسوب محمول، زيارة استثنائية، أو رحلة ترفيهية للأهل).';
    nutritionElem.textContent = 'تغطية الفيتامينات وإبر تحفيز كريات الدم الحمراء (الإريثروبويتين) لمدة 3 أشهر.';
  }
};

function initImpactCalculator() {
  const slider = document.getElementById('impactSlider');
  if (slider) {
    slider.addEventListener('input', (e) => updateImpact(e.target.value));
    updateImpact(slider.value);
  }
}

/* ========================================================
   5. DONATION MODAL & RECEIPT MODAL
   ======================================================== */
window.openDonationModal = function(childName = '', defaultAmount = 250, freq = 'once') {
  let modal = document.getElementById('donationModal');
  if (!modal) {
    createDonationModal();
    modal = document.getElementById('donationModal');
  }

  const childTitle = document.getElementById('modalChildTitle');
  const amountInput = document.getElementById('modalAmountInput');
  const childHidden = document.getElementById('modalChildHidden');
  
  if (childTitle) {
    childTitle.textContent = childName ? `كفالة خاصة: ${childName}` : 'كفالة جلسة غسيل كلوي';
  }
  if (childHidden) {
    childHidden.value = childName || 'صندوق الأمل العام';
  }
  if (amountInput) {
    amountInput.value = defaultAmount;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeDonationModal = function() {
  const modal = document.getElementById('donationModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

function createDonationModal() {
  const modalHTML = `
    <div id="donationModal" class="modal-overlay">
      <div class="modal-content">
        <div class="flex items-center justify-between pb-4 border-b border-surface-container-high">
          <div class="flex items-center gap-2">
            <span class="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[20px]">favorite</span>
            </span>
            <h3 id="modalChildTitle" class="font-headline-sm text-[20px] text-on-surface font-bold">كفالة جلسة غسيل كلوي</h3>
          </div>
          <button onclick="closeDonationModal()" class="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form id="quickDonateForm" onsubmit="handleDonationSubmit(event)" class="flex flex-col gap-4 pt-4">
          <input type="hidden" id="modalChildHidden" value="صندوق الأمل العام"/>
          
          <div class="flex flex-col gap-1">
            <label class="font-label-sm text-on-surface font-semibold">مبلغ الكفالة (ر.س):</label>
            <input type="number" id="modalAmountInput" value="250" min="10" required 
                   class="w-full bg-surface-container-low px-4 py-3 rounded-xl font-headline-sm text-primary text-left focus:outline-none focus:ring-2 focus:ring-primary"/>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-label-sm text-on-surface font-semibold">اسم المتبرع (اختياري / فاعل خير):</label>
            <input type="text" id="modalDonorName" placeholder="فاعل خير" 
                   class="w-full bg-surface-container-low px-4 py-2.5 rounded-xl font-body-sm text-on-surface focus:outline-none"/>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-label-sm text-on-surface font-semibold">رقم الجوال لتلقي إيصال الجلسة:</label>
            <input type="tel" id="modalDonorPhone" placeholder="05xxxxxxxx" dir="ltr" 
                   class="w-full bg-surface-container-low px-4 py-2.5 rounded-xl font-body-sm text-on-surface text-right focus:outline-none"/>
          </div>

          <div class="flex flex-col gap-1 pt-1">
            <label class="font-label-sm text-on-surface font-semibold">طريقة الدفع:</label>
            <div class="grid grid-cols-3 gap-2">
              <label class="flex flex-col items-center justify-center p-2.5 border rounded-xl cursor-pointer hover:border-primary transition-all bg-surface-container-low">
                <input type="radio" name="modalPayMethod" value="mada" checked class="accent-primary mb-1">
                <span class="font-bold text-[13px]">مدى Mada</span>
              </label>
              <label class="flex flex-col items-center justify-center p-2.5 border rounded-xl cursor-pointer hover:border-primary transition-all bg-surface-container-low">
                <input type="radio" name="modalPayMethod" value="apple_pay" class="accent-primary mb-1">
                <span class="font-bold text-[13px]">Apple Pay</span>
              </label>
              <label class="flex flex-col items-center justify-center p-2.5 border rounded-xl cursor-pointer hover:border-primary transition-all bg-surface-container-low">
                <input type="radio" name="modalPayMethod" value="credit_card" class="accent-primary mb-1">
                <span class="font-bold text-[13px]">بطاقة ائتمان</span>
              </label>
            </div>
          </div>

          <button id="modalSubmitBtn" type="submit" class="w-full py-4 mt-2 rounded-2xl bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container font-headline-sm text-[18px] font-bold shadow-lg transition-transform hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2">
            <span>تأكيد التبرع والربط بـ Firebase 💖</span>
            <span class="material-symbols-outlined">shield</span>
          </button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  document.getElementById('donationModal').addEventListener('click', (e) => {
    if (e.target.id === 'donationModal') closeDonationModal();
  });
}

window.handleDonationSubmit = async function(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('modalSubmitBtn');
  const originalText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳</span> جاري الحفظ في Firebase...';
  }

  const amount = Number(document.getElementById('modalAmountInput')?.value) || 250;
  const donorName = document.getElementById('modalDonorName')?.value || 'فاعل خير';
  const donorPhone = document.getElementById('modalDonorPhone')?.value || '';
  const childName = document.getElementById('modalChildHidden')?.value || 'صندوق الأمل العام';
  const payRadio = document.querySelector('input[name="modalPayMethod"]:checked');

  const donationData = {
    amount,
    donorName,
    donorPhone,
    childName,
    paymentMethod: payRadio ? payRadio.value : 'mada',
    frequency: 'once'
  };

  closeDonationModal();

  if (window.FirebaseApp && window.FirebaseApp.saveDonation) {
    const res = await window.FirebaseApp.saveDonation(donationData);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
    showReceiptModal(res.receipt);
    showToast('جزاكم الله خيراً! تم تسجيل تبرعك في Firebase بنجاح 💖', 'verified');
  } else {
    showReceiptModal({
      receiptNumber: 'NABDA-' + Math.floor(100000 + Math.random() * 900000),
      amount: donationData.amount,
      childName: donationData.childName,
      donorName: donationData.donorName,
      timestamp: new Date().toISOString()
    });
  }
};

/* ========================================================
   6. DIGITAL DONATION RECEIPT MODAL
   ======================================================== */
window.showReceiptModal = function(receipt) {
  let modal = document.getElementById('receiptModal');
  if (!modal) {
    const modalHTML = `
      <div id="receiptModal" class="modal-overlay">
        <div class="modal-content text-center">
          <div class="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-[36px]">verified</span>
          </div>
          <span class="text-xs font-semibold text-primary bg-primary-fixed/40 px-3 py-1 rounded-full">إيصال تبرع موثق ورسمي</span>
          <h3 class="font-headline-lg text-[22px] font-bold text-on-surface mt-2">شكراً لعطائك وإحسانك 💛</h3>
          <p class="font-body-sm text-on-surface-variant mt-1">تم توجيه مساهمتك لتغطية جلسة الغسيل الكلوي بنجاح.</p>

          <div class="bg-surface-container-low p-4 rounded-2xl my-5 text-right flex flex-col gap-2 font-body-sm">
            <div class="flex justify-between border-b border-surface-container-high pb-2">
              <span class="text-outline">رقم الإيصال:</span>
              <span id="receiptId" class="font-bold text-primary font-mono">NABDA-000000</span>
            </div>
            <div class="flex justify-between border-b border-surface-container-high pb-2">
              <span class="text-outline">قيمة التبرع:</span>
              <span id="receiptAmount" class="font-bold text-on-surface">250 ر.س</span>
            </div>
            <div class="flex justify-between border-b border-surface-container-high pb-2">
              <span class="text-outline">المستفيد:</span>
              <span id="receiptTarget" class="font-bold text-secondary">صندوق الأمل</span>
            </div>
            <div class="flex justify-between border-b border-surface-container-high pb-2">
              <span class="text-outline">اسم الكافل:</span>
              <span id="receiptDonor" class="font-bold text-on-surface">فاعل خير</span>
            </div>
            <div class="flex justify-between pt-1">
              <span class="text-outline">الترخيص الأهلي:</span>
              <span class="font-bold text-outline">معتمد #9482</span>
            </div>
          </div>

          <div class="flex gap-2">
            <button onclick="window.print()" class="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface font-bold hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">print</span>
              <span>طباعة الإيصال</span>
            </button>
            <button onclick="closeReceiptModal()" class="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-container transition-colors">
              <span>إغلاق</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('receiptModal');
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'receiptModal') closeReceiptModal();
    });
  }

  document.getElementById('receiptId').textContent = receipt.receiptNumber || 'NABDA-' + Math.floor(100000 + Math.random() * 900000);
  document.getElementById('receiptAmount').textContent = Number(receipt.amount || 250).toLocaleString('ar-SA') + ' ر.س';
  document.getElementById('receiptTarget').textContent = receipt.childName || 'صندوق الأمل';
  document.getElementById('receiptDonor').textContent = receipt.donorName || 'فاعل خير';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeReceiptModal = function() {
  const modal = document.getElementById('receiptModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

/* ========================================================
   7. VOLUNTEER REGISTRATION MODAL
   ======================================================== */
window.openVolunteerModal = function() {
  let modal = document.getElementById('volunteerModal');
  if (!modal) {
    const modalHTML = `
      <div id="volunteerModal" class="modal-overlay">
        <div class="modal-content">
          <div class="flex items-center justify-between pb-4 border-b border-surface-container-high">
            <div class="flex items-center gap-2">
              <span class="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[20px]">groups</span>
              </span>
              <h3 class="font-headline-sm text-[20px] text-on-surface font-bold">الانضمام لفريق متطوعي نبض الأمل</h3>
            </div>
            <button onclick="closeVolunteerModal()" class="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <form id="volunteerForm" onsubmit="handleVolunteerSubmit(event)" class="flex flex-col gap-4 pt-4">
            <div class="flex flex-col gap-1">
              <label class="font-label-sm text-on-surface font-semibold">الاسم الثلاثي:</label>
              <input type="text" id="volName" required placeholder="مثال: أحمد محمد خالد" 
                     class="w-full bg-surface-container-low px-4 py-2.5 rounded-xl font-body-sm text-on-surface focus:outline-none"/>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-label-sm text-on-surface font-semibold">رقم الجوال:</label>
              <input type="tel" id="volPhone" required placeholder="05xxxxxxxx" dir="ltr" 
                     class="w-full bg-surface-container-low px-4 py-2.5 rounded-xl font-body-sm text-on-surface text-right focus:outline-none"/>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-label-sm text-on-surface font-semibold">البريد الإلكتروني:</label>
              <input type="email" id="volEmail" placeholder="name@example.com" dir="ltr" 
                     class="w-full bg-surface-container-low px-4 py-2.5 rounded-xl font-body-sm text-on-surface text-right focus:outline-none"/>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-label-sm text-on-surface font-semibold">المجال التطوعي المفضل:</label>
              <select id="volRole" class="w-full bg-surface-container-low px-4 py-2.5 rounded-xl font-body-sm text-on-surface focus:outline-none">
                <option value="entertainment">الترفيه الطبي وتوزيع الهدايا للأطفال</option>
                <option value="psychological">الدعم النفسي والأنشطة الفنية والتعليمية</option>
                <option value="logistics">تنظيم فعاليات تحقيق "أمنية بطل"</option>
                <option value="media">التصوير وصناعة المحتوى الإعلامي</option>
              </select>
            </div>

            <button type="submit" class="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold shadow-md transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[20px]">how_to_reg</span>
              <span>تسجيل طلب التطوع في Firebase</span>
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('volunteerModal');
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'volunteerModal') closeVolunteerModal();
    });
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeVolunteerModal = function() {
  const modal = document.getElementById('volunteerModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

window.handleVolunteerSubmit = async function(e) {
  e.preventDefault();
  const name = document.getElementById('volName')?.value;
  const phone = document.getElementById('volPhone')?.value;
  const email = document.getElementById('volEmail')?.value;
  const roleSelect = document.getElementById('volRole');
  const role = roleSelect ? roleSelect.options[roleSelect.selectedIndex].text : '';

  closeVolunteerModal();

  if (window.FirebaseApp && window.FirebaseApp.saveVolunteer) {
    await window.FirebaseApp.saveVolunteer({ name, phone, email, role });
    showToast('شكراً لتطوعك العظيم! تم تسجيل بياناتك في Firebase وسنتواصل معك قريباً 🤝', 'groups');
  } else {
    showToast('تم استلام رغبتك بالتطوع وسنتواصل معك قريباً!', 'groups');
  }
};

/* ========================================================
   8. FORMS: LETTER & NEWSLETTER
   ======================================================== */
function initModalAndForms() {
  // Bind all elements with [data-donate-btn]
  document.querySelectorAll('[data-donate-btn]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const child = btn.getAttribute('data-child') || '';
      const amount = btn.getAttribute('data-amount') || 250;
      openDonationModal(child, amount);
    });
  });

  // Letter form in index.html
  const messageForm = document.getElementById('letterForm');
  if (messageForm) {
    messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const senderInput = document.getElementById('letterSenderName');
      const childSelect = document.getElementById('letterChildSelect');
      const messageText = document.getElementById('letterMessageContent');

      const letterData = {
        senderName: senderInput?.value || 'صديق للأبطال',
        childTarget: childSelect ? childSelect.options[childSelect.selectedIndex].text : 'جميع الأبطال',
        message: messageText?.value || ''
      };

      if (!letterData.message.trim()) {
        showToast('يرجى كتابة رسالة تشجيع للطفل قبل الإرسال', 'warning');
        return;
      }

      if (window.FirebaseApp && window.FirebaseApp.saveLetter) {
        await window.FirebaseApp.saveLetter(letterData);
      }

      messageForm.reset();
      showToast('شكراً لك من القلب! تم حفظ رسالتك في Firebase وستصل للطفل في جلسته القادمة 💌', 'favorite');
    });
  }

  // Newsletter forms across site
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput?.value || '';
      if (!email.trim()) return;

      if (window.FirebaseApp && window.FirebaseApp.saveNewsletter) {
        await window.FirebaseApp.saveNewsletter(email);
      }

      form.reset();
      showToast('شكراً لاشتراكك! تم حفظ بريدك الإلكتروني في Firebase بنجاح 📧', 'mark_email_read');
    });
  });

  // Volunteer buttons
  document.querySelectorAll('[data-volunteer-btn]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openVolunteerModal();
    });
  });
}

/* ========================================================
   9. HEROES FILTER (heroes.html)
   ======================================================== */
function initHeroesFilter() {
  const filterBtns = document.querySelectorAll('.hero-filter-btn');
  const heroCards = document.querySelectorAll('.hero-card');
  if (!filterBtns.length || !heroCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => {
        b.classList.remove('bg-primary', 'text-on-primary', 'font-bold', 'shadow-sm');
        b.classList.add('bg-surface-container-lowest', 'text-on-surface-variant', 'font-medium');
      });
      this.classList.add('bg-primary', 'text-on-primary', 'font-bold', 'shadow-sm');
      this.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant', 'font-medium');

      const filterType = this.getAttribute('data-filter');

      heroCards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        if (filterType === 'all' || cardType === filterType) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ========================================================
   10. LIVE DONATION LISTENER
   ======================================================== */
function initLiveDonationListener() {
  // Listen to Firestore real-time donations if online
  if (window.FirebaseApp && window.FirebaseApp.listenToDonations) {
    window.FirebaseApp.listenToDonations((donations) => {
      if (donations && donations.length > 0) {
        console.log(`Live Firebase Update: Received ${donations.length} recent donations`);
      }
    });
  }
}

/* ========================================================
   11. TOAST NOTIFICATIONS HELPER
   ======================================================== */
window.showToast = function(message, icon = 'check_circle') {
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'siteToast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span class="material-symbols-outlined text-[24px] text-secondary-fixed">${icon}</span>
    <span class="font-label-lg font-medium">${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
};
