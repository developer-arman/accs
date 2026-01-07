export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`footer-columns-${cols.length}-cols`);

  const MOBILE_MAX_WIDTH = 768;

  const toAccordion = () => {
    if (block.dataset.mode === 'accordion') return;
    const rows = [...block.children];
    if (rows.length < 2) return;

    const headingRow = rows[0];
    const contentRow = rows[1];
    const headingCols = [...headingRow.children];
    const contentCols = [...contentRow.children];

    const accordionWrapper = document.createElement('div');
    accordionWrapper.className = 'footer-columns-accordion';

    const maxCols = Math.max(headingCols.length, contentCols.length);
    for (let i = 0; i < maxCols; i += 1) {
      const hCol = headingCols[i];
      const cCol = contentCols[i];

      const details = document.createElement('details');
      details.className = 'footer-columns-accordion-item';

      const summary = document.createElement('summary');
      summary.className = 'footer-columns-accordion-summary';

      let titleText = 'Details';
      if (hCol) {
        const heading = hCol.querySelector('h1, h2, h3, h4, h5, h6');
        titleText = heading ? heading.textContent.trim() : (hCol.textContent || '').trim().split('\n')[0] || titleText;
      }
      summary.textContent = titleText;

      const content = document.createElement('div');
      content.className = 'footer-columns-accordion-content';
      if (cCol) {
        while (cCol.firstChild) {
          content.appendChild(cCol.firstChild);
        }
      }

      details.appendChild(summary);
      details.appendChild(content);
      accordionWrapper.appendChild(details);
    }

    contentRow.replaceWith(accordionWrapper);
    headingRow.remove();

    block.dataset.mode = 'accordion';
  };

  const toColumns = () => {
    if (block.dataset.mode !== 'accordion') return;
    const accordionWrapper = block.querySelector('.footer-columns-accordion');
    if (!accordionWrapper) {
      block.dataset.mode = '';
      return;
    }

    const headingRow = document.createElement('div');
    const contentRow = document.createElement('div');
    const items = [...accordionWrapper.querySelectorAll('.footer-columns-accordion-item')];

    items.forEach((item) => {
      const hCol = document.createElement('div');
      const cCol = document.createElement('div');

      const summaryText = item.querySelector('.footer-columns-accordion-summary')?.textContent || '';
      const h = document.createElement('h3');
      h.textContent = summaryText;
      hCol.appendChild(h);

      const content = item.querySelector('.footer-columns-accordion-content');
      if (content) {
        while (content.firstChild) {
          cCol.appendChild(content.firstChild);
        }
      }

      headingRow.appendChild(hCol);
      contentRow.appendChild(cCol);
    });

    accordionWrapper.replaceWith(contentRow);
    contentRow.before(headingRow);

    block.dataset.mode = '';
  };

  const updateLayout = () => {
    if (window.innerWidth <= MOBILE_MAX_WIDTH) {
      toAccordion();
    } else {
      toColumns();
    }
  };

  updateLayout();
  window.addEventListener('resize', updateLayout);
}
