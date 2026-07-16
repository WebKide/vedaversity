/**
 * js/router.js
 *
 * Minimal page-stack navigator that replaces ons-navigator while keeping
 * Onsen UI components (ons-page, ons-toolbar, ons-list, etc.) for styling.
 *
 * Existing code across the app was written against ons-navigator's API
 * (document.getElementById("navigator").pushPage / .popPage / .topPage),
 * so instead of rewriting every call site, this attaches an equivalent
 * API onto the same #navigator element. Old call patterns keep working.
 *
 * Pages are <template> elements in index.html. Each clone becomes a plain
 * DOM node with class="page" that we show/hide ourselves; only the top of
 * the stack is visible. Lifecycle: page.onShow / page.onHide are optional
 * functions a page can set on itself (mirrors ons-navigator's page events).
 * A page's init function is looked up from data-init-fn and called once,
 * right after it's inserted into the DOM.
 */

(function () {
  const container = document.getElementById('app');
  const stack = []; // [{ el, tmplId }]
  let suppressNextPopState = false;

  function createPageFromTemplate(tmplId, data) {
    const tmpl = document.getElementById(tmplId);
    if (!tmpl) throw new Error('Unknown template: ' + tmplId);
    const frag = tmpl.content.cloneNode(true);
    const pageEl = frag.firstElementChild;
    pageEl.data = data || {};
    return pageEl;
  }

  function runInit(pageEl) {
    const fnName = pageEl.dataset.initFn;
    if (fnName && typeof window[fnName] === 'function') {
      window[fnName](pageEl);
    }
  }

  function applyVisibility() {
    stack.forEach((entry, i) => {
      const isTop = i === stack.length - 1;
      entry.el.style.display = isTop ? '' : 'none';
    });
  }

  function callHide(entry) {
    if (entry && typeof entry.el.onHide === 'function') entry.el.onHide();
  }
  function callShow(entry) {
    if (entry && typeof entry.el.onShow === 'function') entry.el.onShow();
  }

  const api = {
    pushPage(tmplId, opts) {
      opts = opts || {};
      const current = stack[stack.length - 1];
      callHide(current);

      const pageEl = createPageFromTemplate(tmplId, opts.data);
      pageEl.classList.add('page--enter');
      container.appendChild(pageEl);
      stack.push({ el: pageEl, tmplId });
      applyVisibility();
      runInit(pageEl);
      callShow(stack[stack.length - 1]);

      history.pushState({ depth: stack.length }, '');
      requestAnimationFrame(() => pageEl.classList.remove('page--enter'));
      return pageEl;
    },

    popPage() {
      if (stack.length <= 1) return Promise.resolve();
      const top = stack.pop();
      callHide(top);
      top.el.remove();
      applyVisibility();
      callShow(stack[stack.length - 1]);
      if (history.state && history.state.depth === stack.length + 1) {
        suppressNextPopState = true;
        history.back();
      }
      return Promise.resolve();
    },

    // Pops the current page and pushes a new one without leaving the old
    // one navigable via back — used for "open this song instead" flows
    // (search result tap, all-songs tap, next/prev song in a list).
    replacePage(tmplId, opts) {
      opts = opts || {};
      const old = stack.pop();
      if (old) {
        callHide(old);
        old.el.remove();
      }
      const pageEl = createPageFromTemplate(tmplId, opts.data);
      container.appendChild(pageEl);
      stack.push({ el: pageEl, tmplId });
      applyVisibility();
      runInit(pageEl);
      callShow(stack[stack.length - 1]);
      return pageEl;
    },

    resetToPage(tmplId, opts) {
      opts = opts || {};
      stack.forEach((entry) => entry.el.remove());
      stack.length = 0;
      history.replaceState({ depth: 0 }, '');
      return api.pushPage(tmplId, opts);
    },

    get topPage() {
      const top = stack[stack.length - 1];
      return top ? top.el : null;
    }
  };

  window.addEventListener('popstate', () => {
    if (suppressNextPopState) {
      suppressNextPopState =  false;
      return;
    }
    if (stack.length > 1) {
      const top = stack.pop();
      callHide(top);
      top.el.remove();
      applyVisibility();
      callShow(stack[stack.length - 1]);
    }
  });

  const navEl = document.getElementById('navigator');
  Object.assign(navEl, api);
  Object.defineProperty(navEl, 'topPage', { get: () => api.topPage });
})();
