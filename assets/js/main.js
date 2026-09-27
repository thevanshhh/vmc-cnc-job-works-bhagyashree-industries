/**
 * Industrial Precision Engineering — Master Application Script
 * Dynamic rendering of Machinery Catalog, category filters, interactive RFQ WhatsApp submission,
 * and drafting UI interactions.
 */

import { COMPANY, CATALOG, getWhatsAppInquiryUrl } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
  initCompanyBranding();
  initCatalog();
  initRfqForm();
  initMobileMenu();
});

// Hydrate static company placeholders across the DOM
function initCompanyBranding() {
  document.querySelectorAll('[data-bind]').forEach(el => {
    const key = el.getAttribute('data-bind');
    if (COMPANY[key] !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = COMPANY[key];
      } else if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('tel:')) {
        el.href = `tel:${COMPANY.phoneRaw}`;
        el.textContent = COMPANY.phoneDisplay;
      } else {
        el.textContent = COMPANY[key];
      }
    }
  });

  // Direct WA CTAs
  document.querySelectorAll('.btn-whatsapp-direct').forEach(btn => {
    btn.setAttribute('href', getWhatsAppInquiryUrl(null));
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');
  });
}

// Render catalog with dynamic filtering
function initCatalog() {
  const container = document.getElementById('catalogGrid');
  const filterContainer = document.getElementById('catalogFilterBar');
  const rfqSelect = document.getElementById('rfqMachineSelect');

  if (!container) return;

  // Extract unique categories
  const categories = ['All Machinery', ...new Set(CATALOG.map(item => item.category))];

  // Render Filter Buttons if filter container exists
  if (filterContainer) {
    filterContainer.innerHTML = categories.map((cat, idx) => `
      <button class="filter-btn ${idx === 0 ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </button>
    `).join('');

    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const selectedCat = btn.getAttribute('data-cat');
        renderCards(selectedCat === 'All Machinery' ? CATALOG : CATALOG.filter(m => m.category === selectedCat));
      });
    });
  }

  // Populate RFQ machine select dropdown
  if (rfqSelect) {
    rfqSelect.innerHTML = `<option value="">-- Select Machine Model (Optional) --</option>` +
      CATALOG.map(m => `<option value="${m.name} (${m.code})">${m.name} [${m.code}]</option>`).join('');
  }

  // Initial render
  renderCards(CATALOG);

  function renderCards(items) {
    container.innerHTML = items.map(m => {
      const waUrl = getWhatsAppInquiryUrl(m);
      const specsHtml = m.specsList ? m.specsList.map(s => `
        <tr>
          <td style="color:var(--muted);">${s.label}</td>
          <td>${s.val}</td>
        </tr>
      `).join('') : '';

      return `
        <article class="spec-card plate" id="${m.id}">
          <div class="card-topbar">
            <span class="card-code">${m.code || 'IND-STD'}</span>
            <span class="card-cat">${m.category}</span>
          </div>
          <div class="card-img-wrap">
            <img src="${m.img}" alt="${m.alt || m.name}" loading="lazy" />
          </div>
          <div class="card-body">
            <h3 class="card-title">${m.name}</h3>
            <p class="card-spec">${m.spec}</p>
            ${specsHtml ? `<table class="card-specs-table">${specsHtml}</table>` : ''}
            <div class="card-footer">
              <div class="card-price-wrap">
                <span class="card-price-label">Ex-Works Quote</span>
                <span class="card-price">${m.price || 'Price on request'}</span>
              </div>
              <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" title="Inquire on WhatsApp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.353.101.173.45 0.742.965 1.201.662.591 1.221.774 1.394.86.173.086.274.072.375-.044.101-.116.433-.506.549-.679.116-.173.231-.144.39-.087s1.011.477 1.184.564c.173.087.289.13.332.202.043.072.043.419-.101.824z"/>
                </svg>
                Inquire
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }
}

// Interactive RFQ Form submission to WhatsApp
function initRfqForm() {
  const form = document.getElementById('rfqForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('rfqName')?.value.trim();
    const phone = document.getElementById('rfqPhone')?.value.trim();
    const company = document.getElementById('rfqCompany')?.value.trim() || 'Individual Buyer';
    const machine = document.getElementById('rfqMachineSelect')?.value.trim() || 'General Machinery Catalog';
    const qty = document.getElementById('rfqQty')?.value.trim() || '1';
    const specs = document.getElementById('rfqSpecs')?.value.trim() || 'Standard machine specs';

    if (!name || !phone) {
      alert('Please fill in the required fields: Full Name and WhatsApp / Phone Number.');
      return;
    }

    const message = 
`*NEW RFQ INQUIRY — ${COMPANY.name}*
----------------------------------------
*Buyer Name:* ${name}
*Contact:* ${phone}
*Company:* ${company}
*Machine:* ${machine}
*Quantity:* ${qty} unit(s)
*Technical Notes:* ${specs}
----------------------------------------
Dispatched via live website RFQ engine.`;

    const waUrl = `https://wa.me/${COMPANY.waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
}

// Mobile Menu
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const links = document.querySelector('.nav-links');

  if (btn && links) {
    btn.addEventListener('click', () => {
      const isVisible = links.style.display === 'flex';
      links.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        links.style.flexDirection = 'column';
        links.style.position = 'absolute';
        links.style.top = '72px';
        links.style.left = '0';
        links.style.right = '0';
        links.style.background = 'var(--paperlight)';
        links.style.padding = '1.5rem';
        links.style.borderBottom = '1px solid var(--hairline)';
        links.style.boxShadow = 'var(--shadow-md)';
      }
    });
  }
}
