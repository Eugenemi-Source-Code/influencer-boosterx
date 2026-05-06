/* ============================================================
   INFLUENCER BOOSTERX — CHARTS.JS
   Custom SVG/Canvas chart renderers (zero dependencies)
   ============================================================ */

window.BoosterXCharts = (() => {

  const PURPLE = '#a855f7';
  const CYAN   = '#06b6d4';
  const PINK   = '#ec4899';
  const EMERALD= '#10b981';
  const AMBER  = '#f59e0b';

  /* ---- Helpers ---- */
  function svgEl(tag, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function makeSVG(w, h, extra = '') {
    return svgEl('svg', { width: '100%', height: h, viewBox: `0 0 ${w} ${h}`,
      preserveAspectRatio: 'none', style: extra });
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function smoothPath(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cp1x = points[i].x + (points[i + 1].x - points[i].x) / 3;
      const cp1y = points[i].y;
      const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) / 3;
      const cp2y = points[i + 1].y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i+1].x} ${points[i+1].y}`;
    }
    return d;
  }

  /* ---- 1. Sparkline (mini trend line) ---- */
  function renderSparkline(container, data, color = PURPLE, filled = true) {
    const W = 200, H = 48;
    const vals = data.map(d => d.value ?? d);
    const min = Math.min(...vals), max = Math.max(...vals);
    const range = max - min || 1;
    const svg = makeSVG(W, H);
    const defs = svgEl('defs');
    const gradId = 'sg_' + Math.random().toString(36).slice(2);
    const grad = svgEl('linearGradient', { id: gradId, x1:'0', y1:'0', x2:'0', y2:'1' });
    const stop1 = svgEl('stop', { offset:'0%', 'stop-color': color, 'stop-opacity':'0.3' });
    const stop2 = svgEl('stop', { offset:'100%', 'stop-color': color, 'stop-opacity':'0.01' });
    grad.append(stop1, stop2); defs.append(grad); svg.append(defs);

    const pad = 4;
    const pts = vals.map((v, i) => ({
      x: pad + (i / (vals.length - 1)) * (W - pad * 2),
      y: H - pad - ((v - min) / range) * (H - pad * 2)
    }));

    if (filled) {
      const areaD = smoothPath(pts) +
        ` L ${pts[pts.length-1].x} ${H} L ${pts[0].x} ${H} Z`;
      const area = svgEl('path', { d: areaD, fill: `url(#${gradId})`, stroke: 'none' });
      svg.append(area);
    }

    const lineEl = svgEl('path', {
      d: smoothPath(pts), fill: 'none',
      stroke: color, 'stroke-width': '2.5',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      'class': 'chart-line-animated',
      'stroke-dasharray': '1000', 'stroke-dashoffset': '1000'
    });
    svg.append(lineEl);

    // End dot
    const lastPt = pts[pts.length - 1];
    const dot = svgEl('circle', { cx: lastPt.x, cy: lastPt.y, r: '4',
      fill: color, 'class': 'animate-scaleIn' });
    svg.append(dot);

    container.innerHTML = ''; container.append(svg);
    // Trigger animation
    setTimeout(() => { lineEl.style.strokeDashoffset = '0'; lineEl.style.transition = 'stroke-dashoffset 1.2s ease'; }, 100);
  }

  /* ---- 2. Line Chart (multi-series) ---- */
  function renderLineChart(container, datasets, labels, opts = {}) {
    const W = 600, H = opts.height || 200;
    const PAD = { top: 16, right: 20, bottom: 36, left: 52 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;

    const allVals = datasets.flatMap(d => d.data);
    const min = opts.min ?? Math.min(...allVals) * 0.95;
    const max = opts.max ?? Math.max(...allVals) * 1.05;
    const range = max - min || 1;

    const svg = makeSVG(W, H, 'overflow:visible');
    const defs = svgEl('defs');

    // Grid lines
    const gridG = svgEl('g', { opacity: '0.25' });
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = PAD.top + (i / steps) * cH;
      const val = max - (i / steps) * range;
      const line = svgEl('line', { x1: PAD.left, y1: y, x2: PAD.left + cW, y2: y,
        stroke: 'rgba(255,255,255,0.15)', 'stroke-width': '1', 'stroke-dasharray': '4 4' });
      gridG.append(line);
      const label = svgEl('text', { x: PAD.left - 8, y: y + 4, 'text-anchor': 'end',
        fill: 'rgba(255,255,255,0.35)', 'font-size': '10' });
      label.textContent = window.BoosterXData.formatNum(val);
      gridG.append(label);
    }
    svg.append(gridG);

    // Datasets
    datasets.forEach((ds, di) => {
      const color = ds.color || [PURPLE, CYAN, PINK, EMERALD, AMBER][di % 5];
      const gradId = `lg_${di}_${Math.random().toString(36).slice(2)}`;
      const grad = svgEl('linearGradient', { id: gradId, x1:'0', y1:'0', x2:'0', y2:'1' });
      grad.append(
        svgEl('stop', { offset:'0%', 'stop-color': color, 'stop-opacity':'0.25' }),
        svgEl('stop', { offset:'100%', 'stop-color': color, 'stop-opacity':'0.01' })
      );
      defs.append(grad);

      const pts = ds.data.map((v, i) => ({
        x: PAD.left + (i / (ds.data.length - 1)) * cW,
        y: PAD.top + ((max - v) / range) * cH
      }));

      // Area
      const areaPath = smoothPath(pts) +
        ` L ${pts[pts.length-1].x} ${PAD.top + cH} L ${pts[0].x} ${PAD.top + cH} Z`;
      svg.append(svgEl('path', { d: areaPath, fill: `url(#${gradId})`, stroke: 'none' }));

      // Line
      const pathEl = svgEl('path', {
        d: smoothPath(pts), fill: 'none',
        stroke: color, 'stroke-width': '2.5',
        'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        'stroke-dasharray': '2000', 'stroke-dashoffset': '2000'
      });
      svg.append(pathEl);
      setTimeout(() => {
        pathEl.style.transition = 'stroke-dashoffset 1.4s ease';
        pathEl.style.strokeDashoffset = '0';
      }, 100 + di * 150);

      // Dots
      pts.forEach((pt, pi) => {
        if (pi % Math.ceil(pts.length / 10) !== 0 && pi !== pts.length - 1) return;
        const dot = svgEl('circle', { cx: pt.x, cy: pt.y, r: '4',
          fill: color, stroke: 'var(--bg-surface)', 'stroke-width': '2' });
        svg.append(dot);
      });
    });

    svg.append(defs);

    // X-axis labels
    const xG = svgEl('g');
    const step = Math.ceil(labels.length / 6);
    labels.forEach((lbl, i) => {
      if (i % step !== 0 && i !== labels.length - 1) return;
      const x = PAD.left + (i / (labels.length - 1)) * cW;
      const t = svgEl('text', { x, y: H - 8, 'text-anchor': 'middle',
        fill: 'rgba(255,255,255,0.3)', 'font-size': '10' });
      t.textContent = lbl;
      xG.append(t);
    });
    svg.append(xG);

    container.innerHTML = ''; container.append(svg);
  }

  /* ---- 3. Bar Chart ---- */
  function renderBarChart(container, data, opts = {}) {
    const W = 600, H = opts.height || 180;
    const PAD = { top: 16, right: 16, bottom: 32, left: 48 };
    const cW = W - PAD.left - PAD.right;
    const cH = H - PAD.top - PAD.bottom;
    const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 1;
    const barW = cW / data.length * 0.6;
    const gap   = cW / data.length;

    const svg = makeSVG(W, H, 'overflow:visible');
    const defs = svgEl('defs');

    // Grid
    [0, 0.25, 0.5, 0.75, 1].forEach(t => {
      const y = PAD.top + t * cH;
      svg.append(svgEl('line', { x1: PAD.left, y1: y, x2: PAD.left + cW, y2: y,
        stroke: 'rgba(255,255,255,0.08)', 'stroke-width':'1' }));
      if (t < 1) {
        const lbl = svgEl('text', { x: PAD.left - 6, y: y + 4, 'text-anchor':'end',
          fill: 'rgba(255,255,255,0.3)', 'font-size':'10' });
        lbl.textContent = window.BoosterXData.formatNum(maxVal * (1 - t));
        svg.append(lbl);
      }
    });

    data.forEach((d, i) => {
      const x = PAD.left + i * gap + gap / 2 - barW / 2;
      const bH = (d.value / maxVal) * cH;
      const y = PAD.top + cH - bH;
      const color = d.color || opts.color || PURPLE;
      const gradId = `bg_${i}_${Math.random().toString(36).slice(2)}`;
      const grad = svgEl('linearGradient', { id: gradId, x1:'0', y1:'0', x2:'0', y2:'1' });
      grad.append(
        svgEl('stop', { offset:'0%', 'stop-color': color, 'stop-opacity':'1' }),
        svgEl('stop', { offset:'100%', 'stop-color': color, 'stop-opacity':'0.55' })
      );
      defs.append(grad);

      const rect = svgEl('rect', {
        x, y, width: barW, height: bH,
        rx: '5', fill: `url(#${gradId})`,
        style: `transform-origin:${x + barW/2}px ${PAD.top + cH}px; animation:barGrow 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.06}s both`
      });
      svg.append(rect);

      // Label
      const lbl = svgEl('text', { x: x + barW / 2, y: H - 8, 'text-anchor':'middle',
        fill: 'rgba(255,255,255,0.45)', 'font-size':'10' });
      lbl.textContent = d.label;
      svg.append(lbl);
    });

    svg.append(defs);
    container.innerHTML = ''; container.append(svg);
  }

  /* ---- 4. Donut Chart ---- */
  function renderDonut(container, slices, opts = {}) {
    const SIZE = opts.size || 180;
    const cx = SIZE / 2, cy = SIZE / 2;
    const R = SIZE * 0.38, r = SIZE * 0.22;
    const svg = makeSVG(SIZE, SIZE, '');

    let angle = -Math.PI / 2;
    const total = slices.reduce((s, sl) => s + sl.value, 0);

    slices.forEach((sl, i) => {
      const frac = sl.value / total;
      const sweep = frac * Math.PI * 2;
      const x1 = cx + R * Math.cos(angle);
      const y1 = cy + R * Math.sin(angle);
      const x2 = cx + R * Math.cos(angle + sweep);
      const y2 = cy + R * Math.sin(angle + sweep);
      const xi1 = cx + r * Math.cos(angle);
      const yi1 = cy + r * Math.sin(angle);
      const xi2 = cx + r * Math.cos(angle + sweep);
      const yi2 = cy + r * Math.sin(angle + sweep);
      const large = sweep > Math.PI ? 1 : 0;

      const path = svgEl('path', {
        d: `M ${xi1} ${yi1} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${r} ${r} 0 ${large} 0 ${xi1} ${yi1} Z`,
        fill: sl.color,
        style: `animation:scaleIn 0.4s ease ${i * 0.08}s both; transform-origin:${cx}px ${cy}px`,
        'stroke': 'var(--bg-surface)', 'stroke-width': '2'
      });
      svg.append(path);
      angle += sweep;
    });

    // Center text
    if (opts.centerLabel) {
      const t1 = svgEl('text', { x: cx, y: cy - 4, 'text-anchor':'middle',
        fill:'rgba(255,255,255,0.9)', 'font-size':'18', 'font-weight':'800',
        'font-family':'Space Grotesk,sans-serif' });
      t1.textContent = opts.centerLabel;
      const t2 = svgEl('text', { x: cx, y: cy + 14, 'text-anchor':'middle',
        fill:'rgba(255,255,255,0.4)', 'font-size':'10' });
      t2.textContent = opts.centerSub || '';
      svg.append(t1, t2);
    }

    container.innerHTML = ''; container.append(svg);
  }

  /* ---- 5. Heatmap ---- */
  function renderHeatmap(container, matrix) {
    const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const cols = 24;
    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

    // Hour labels
    const hourRow = document.createElement('div');
    hourRow.style.cssText = 'display:flex;padding-left:32px;gap:3px;';
    [0,3,6,9,12,15,18,21].forEach(h => {
      const lbl = document.createElement('span');
      lbl.style.cssText = `width:calc((100% - 32px)/24*3);font-size:9px;color:rgba(255,255,255,0.25);text-align:center;`;
      lbl.textContent = h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h-12}p`;
      hourRow.append(lbl);
    });
    wrap.append(hourRow);

    matrix.forEach((row, day) => {
      const rowEl = document.createElement('div');
      rowEl.style.cssText = 'display:flex;align-items:center;gap:3px;';
      const dayLbl = document.createElement('span');
      dayLbl.style.cssText = 'width:28px;font-size:10px;color:rgba(255,255,255,0.35);flex-shrink:0;';
      dayLbl.textContent = DAYS[day] || '';
      rowEl.append(dayLbl);

      row.forEach((heat, h) => {
        const cell = document.createElement('div');
        const alpha = heat === 0 ? 0.05 : heat === 1 ? 0.15 : heat === 2 ? 0.3 : heat === 3 ? 0.5 : heat === 4 ? 0.7 : 1;
        cell.style.cssText = `flex:1;aspect-ratio:1;border-radius:3px;background:rgba(168,85,247,${alpha});transition:all 0.2s;cursor:pointer;`;
        cell.title = `${DAYS[day]} ${h}:00 — Engagement: ${['None','Low','Medium','Good','High','Peak'][heat]}`;
        cell.addEventListener('mouseenter', () => { cell.style.transform = 'scale(1.3)'; cell.style.zIndex = '2'; });
        cell.addEventListener('mouseleave', () => { cell.style.transform = ''; cell.style.zIndex = ''; });
        rowEl.append(cell);
      });
      wrap.append(rowEl);
    });

    container.append(wrap);
  }

  /* ---- 6. Gauge ---- */
  function renderGauge(container, value, max, color = PURPLE) {
    const W = 160, H = 90;
    const cx = W / 2, cy = H - 10;
    const R = 66;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const filledAngle = startAngle + (value / max) * Math.PI;
    const svg = makeSVG(W, H);

    // Track
    const trackD = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`;
    svg.append(svgEl('path', { d: trackD, fill:'none', stroke:'rgba(255,255,255,0.08)',
      'stroke-width':'10', 'stroke-linecap':'round' }));

    // Fill
    const fx = cx + R * Math.cos(filledAngle);
    const fy = cy + R * Math.sin(filledAngle);
    const large = filledAngle - startAngle > Math.PI ? 1 : 0;
    const fillD = `M ${cx - R} ${cy} A ${R} ${R} 0 ${large} 1 ${fx} ${fy}`;
    svg.append(svgEl('path', { d: fillD, fill:'none', stroke: color,
      'stroke-width':'10', 'stroke-linecap':'round',
      'stroke-dasharray':'400', 'stroke-dashoffset':'400',
      style:'transition:stroke-dashoffset 1.2s ease' }));

    // Center text
    const t = svgEl('text', { x: cx, y: cy - 8, 'text-anchor':'middle',
      fill:'rgba(255,255,255,0.9)', 'font-size':'22', 'font-weight':'800',
      'font-family':'Space Grotesk,sans-serif' });
    t.textContent = value + '%';
    svg.append(t);

    container.innerHTML = ''; container.append(svg);

    setTimeout(() => {
      const filled = container.querySelector('path:nth-child(2)');
      if (filled) { filled.style.strokeDashoffset = 400 - (value / max) * 300; }
    }, 100);
  }

  /* ---- 7. Area Chart (Platform breakdown) ---- */
  function renderPlatformBreakdown(container, data, opts = {}) {
    const maxPct = Math.max(...data.map(d => d.pct));
    container.innerHTML = '';
    data.forEach((item, i) => {
      const plat = window.BoosterXData.getPlatform(item.platform);
      const row = document.createElement('div');
      row.style.cssText = `margin-bottom:14px; transition:all 0.2s; padding:4px; border-radius:6px; ${opts.onRowClick ? 'cursor:pointer;' : ''}`;
      if (opts.onRowClick) {
        row.onmouseenter = () => row.style.background = 'rgba(255,255,255,0.05)';
        row.onmouseleave = () => row.style.background = 'transparent';
        row.onclick = () => opts.onRowClick(item.platform);
      }
      row.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:rgba(255,255,255,0.7);">
            <span style="font-size:1rem;">${plat?.icon || '📱'}</span>${plat?.name || item.platform}
          </span>
          <span style="font-size:0.85rem;font-weight:700;color:rgba(255,255,255,0.9);">${window.BoosterXData.formatNum(item.followers)}</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${(item.pct/maxPct)*100}%;background:${plat?.color || '#a855f7'};border-radius:999px;
            animation:progressGrow 1s ${i * 0.1}s cubic-bezier(0.4,0,0.2,1) both;"></div>
        </div>
        <div style="font-size:0.7rem;color:rgba(255,255,255,0.3);margin-top:3px;">${item.pct}% of total following</div>
      `;
      container.append(row);
    });
  }

  /* ---- 8. Area Chart (Geography breakdown) ---- */
  function renderGeographyBreakdown(container, data) {
    const maxPct = Math.max(...data.map(d => d.pct));
    container.innerHTML = '';
    data.forEach((item, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'margin-bottom:14px;';
      row.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:rgba(255,255,255,0.7);">
            <span style="font-size:1rem;">${item.flag}</span>${item.country}
          </span>
          <span style="font-size:0.85rem;font-weight:700;color:rgba(255,255,255,0.9);">${window.BoosterXData.formatNum(item.followers)}</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${(item.pct/maxPct)*100}%;background:var(--emerald-400);border-radius:999px;
            animation:progressGrow 1s ${i * 0.1}s cubic-bezier(0.4,0,0.2,1) both;"></div>
        </div>
        <div style="font-size:0.7rem;color:rgba(255,255,255,0.3);margin-top:3px;">${item.pct}% of total following</div>
      `;
      container.append(row);
    });
  }

  /* ---- Public API ---- */
  return { renderSparkline, renderLineChart, renderBarChart, renderDonut, renderHeatmap, renderGauge, renderPlatformBreakdown, renderGeographyBreakdown };
})();
