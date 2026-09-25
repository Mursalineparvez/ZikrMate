import { ZikrItem } from '../types';

export async function generateZikrPdfReport(zikrs: ZikrItem[], masterTotal: number): Promise<boolean> {
  // Check if html2pdf is available
  const html2pdf = (window as unknown as { html2pdf?: () => any }).html2pdf;
  if (!html2pdf) {
    alert('PDF generation library is still loading. Please try again in a moment.');
    return false;
  }

  // Create temporary off-screen container for rendering
  const container = document.createElement('div');
  container.id = 'temp-pdf-export-container';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '794px'; // Standard A4 width at 96 DPI
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  container.style.padding = '36px 40px';
  container.style.boxSizing = 'border-box';

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeFormatted = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const tableRowsHtml = zikrs.map((zikr, index) => {
    const percentageOfTotal = masterTotal > 0 ? Math.round((zikr.count / masterTotal) * 100) : 0;
    const isCompleted = zikr.target ? zikr.count >= zikr.target : false;
    return `
      <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 12px 14px; font-size: 13px; color: #64748b; font-weight: 600; text-align: center;">
          ${index + 1}
        </td>
        <td style="padding: 12px 14px;">
          <div style="font-weight: 700; font-size: 14px; color: #064e3b;">${zikr.name}</div>
          ${zikr.transliteration ? `<div style="font-size: 11px; color: #64748b; font-style: italic;">${zikr.transliteration}</div>` : ''}
          ${zikr.meaning ? `<div style="font-size: 11px; color: #94a3b8;">${zikr.meaning}</div>` : ''}
        </td>
        <td style="padding: 12px 14px; text-align: right; direction: rtl; font-family: 'Amiri', serif; font-size: 19px; color: #047857; font-weight: 700;">
          ${zikr.arabic || '-'}
        </td>
        <td style="padding: 12px 14px; text-align: center; font-size: 13px; color: #475569;">
          ${zikr.target || '-'}
        </td>
        <td style="padding: 12px 14px; text-align: right; font-size: 16px; font-weight: 800; color: #0f172a;">
          ${zikr.count.toLocaleString()}
          ${isCompleted ? `<span style="display: inline-block; margin-left: 4px; color: #059669; font-size: 12px;">✓</span>` : ''}
        </td>
        <td style="padding: 12px 14px; text-align: right; font-size: 13px; font-weight: 600; color: #0d9488;">
          ${percentageOfTotal}%
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="border: 2px solid #059669; border-radius: 16px; padding: 28px; background: #ffffff;">
      <!-- Header Banner -->
      <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
        <div style="font-family: 'Amiri', serif; font-size: 26px; color: #064e3b; margin-bottom: 6px; letter-spacing: 1px;">
          بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </div>
        <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #064e3b; letter-spacing: 0.5px; text-transform: uppercase;">
          ZikrMate — Zikr Record & Progress Report
        </h1>
        <p style="margin: 6px 0 0; font-size: 12px; color: #64748b;">
          Generated on <strong>${dateFormatted}</strong> at <strong>${timeFormatted}</strong>
        </p>
      </div>

      <!-- Master Counter Highlight Box -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #064e3b 0%, #047857 100%); border-radius: 12px; padding: 20px 28px; color: #ffffff; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(6, 78, 59, 0.15);">
        <div>
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.85; font-weight: 600;">
            Central Master Counter
          </div>
          <div style="font-size: 14px; margin-top: 4px; opacity: 0.95;">
            Total cumulative invocations recorded across ${zikrs.length} individual items
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 38px; font-weight: 900; line-height: 1; letter-spacing: -1px; color: #fef08a;">
            ${masterTotal.toLocaleString()}
          </div>
          <div style="font-size: 11px; margin-top: 4px; color: #a7f3d0; font-weight: 600; text-transform: uppercase;">
            Total Invocations
          </div>
        </div>
      </div>

      <!-- Breakdown Table -->
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          Individual Zikr Breakdown
        </h2>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background-color: #042f2e; color: #ffffff;">
              <th style="padding: 10px 14px; font-size: 12px; font-weight: 700; text-align: center; border-top-left-radius: 8px;">#</th>
              <th style="padding: 10px 14px; font-size: 12px; font-weight: 700;">Zikr Name & Transliteration</th>
              <th style="padding: 10px 14px; font-size: 12px; font-weight: 700; text-align: right;">Arabic</th>
              <th style="padding: 10px 14px; font-size: 12px; font-weight: 700; text-align: center;">Target</th>
              <th style="padding: 10px 14px; font-size: 12px; font-weight: 700; text-align: right;">Count</th>
              <th style="padding: 10px 14px; font-size: 12px; font-weight: 700; text-align: right; border-top-right-radius: 8px;">Share</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f1f5f9; font-weight: 800; border-top: 2px solid #cbd5e1;">
              <td colspan="4" style="padding: 12px 14px; text-align: right; font-size: 13px; color: #0f172a;">
                Grand Total Sum:
              </td>
              <td style="padding: 12px 14px; text-align: right; font-size: 16px; color: #064e3b;">
                ${masterTotal.toLocaleString()}
              </td>
              <td style="padding: 12px 14px; text-align: right; font-size: 13px; color: #064e3b;">
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Footer & Quranic Reminder -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; text-align: center; margin-top: 28px;">
        <div style="font-family: 'Amiri', serif; font-size: 16px; color: #047857; margin-bottom: 4px;">
          وَٱذْكُر رَّبَّكَ كَثِيرًا وَسَبِّحْ بِٱلْعَشِىِّ وَٱلْإِبْكَٰرِ
        </div>
        <div style="font-size: 11px; color: #64748b; font-style: italic;">
          "And remember your Lord much and glorify [Him] in the evening and the morning." — Surah Ali 'Imran (3:41)
        </div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 8px;">
          Generated via ZikrMate Progressive Web App • Stored Locally in Browser Storage
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `ZikrMate-Report-${now.toISOString().slice(0, 10)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  try {
    await html2pdf().set(opt).from(container).save();
    return true;
  } catch (err) {
    console.error('PDF export error:', err);
    throw err;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
