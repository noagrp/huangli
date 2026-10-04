class HuangliEngine {
  constructor(data) {
    if (!data || !Array.isArray(data.categories)) {
      throw new Error('Invalid Huangli data');
    }
    this.data = data;
    this.categoryMap = new Map();
    this.termMap = new Map();
    this.aliasMap = new Map();

    for (const category of data.categories) {
      this.categoryMap.set(category.id, category);
      for (const term of category.terms || []) {
        const entry = { ...term, categoryId: category.id, categoryName: category.name };
        this.termMap.set(term.id, entry);
        this.termMap.set(term.name, entry);
        for (const alias of term.aliases || []) this.aliasMap.set(alias, entry);
      }
    }
  }

  getMeta() {
    return this.data.meta;
  }

  getCategories() {
    return this.data.categories.map(({ terms, ...category }) => ({
      ...category,
      count: (terms || []).length
    }));
  }

  getCategory(idOrName) {
    return this.data.categories.find(c => c.id === idOrName || c.name === idOrName) || null;
  }

  getTerm(idOrName) {
    return this.termMap.get(idOrName) || this.aliasMap.get(idOrName) || null;
  }

  search(query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    const results = [];
    for (const category of this.data.categories) {
      for (const term of category.terms || []) {
        const haystack = [
          term.id, term.name, term.short, term.explanation,
          ...(term.aliases || []), ...(term.examples || [])
        ].filter(Boolean).join(' ').toLowerCase();
        if (haystack.includes(q)) {
          results.push({ ...term, categoryId: category.id, categoryName: category.name });
        }
      }
    }
    return results;
  }

  explain(input) {
    if (typeof input === 'string') return this.getTerm(input);
    if (!input || typeof input !== 'object') return null;

    const output = {};
    for (const [key, value] of Object.entries(input)) {
      if (value == null || value === '') continue;
      if (key === 'zhixing') {
        output[key] = { value, explanation: this.getTerm(value) };
      } else if (key === 'chong') {
        output[key] = { value, explanation: this.getTerm('冲') };
      } else if (key === 'sha') {
        output[key] = { value, explanation: this.getTerm('煞') };
      } else if (key === 'taishen') {
        output[key] = { value, explanation: this.getTerm('胎神') };
      } else if (['xishen','caishen','fushen'].includes(key)) {
        output[key] = { value, explanation: this.getTerm(key) };
      } else if (key === 'yi') {
        output[key] = {
          value,
          explanation: this.getTerm('宜'),
          items: this.explainActivities(value)
        };
      } else if (key === 'ji') {
        output[key] = {
          value,
          explanation: this.getTerm('忌'),
          items: this.explainActivities(value)
        };
      }
    }
    return output;
  }

  explainActivities(values) {
    const list = Array.isArray(values) ? values : [values];
    return list.filter(v => v != null && v !== '').map(value => ({
      value,
      explanation: this.getTerm(value)
    }));
  }

  getActivity(name) {
    const term = this.getTerm(name);
    return term && term.categoryId === 'yiji-activities' ? term : null;
  }

  listActivities() {
    const category = this.getCategory('yiji-activities');
    return category ? category.terms : [];
  }

  explainList(values) {
    const list = Array.isArray(values) ? values : [values];
    return list.filter(v => v != null && v !== '').map(value => ({
      value,
      explanation: this.getTerm(value)
    }));
  }

  explainWannianli(input) {
    if (!input || typeof input !== 'object') return null;
    const output = {};
    for (const [key, value] of Object.entries(input)) {
      if (value == null || value === '') continue;
      if (['yi','ji'].includes(key)) {
        output[key] = {
          value,
          explanation: this.getTerm(key === 'yi' ? '宜' : '忌'),
          items: this.explainActivities(value)
        };
      } else if (['jishen','xiongsha'].includes(key)) {
        output[key] = { value, items: this.explainList(value) };
      } else if (key === 'bazi') {
        output[key] = { value, explanation: this.getTerm('八字') };
      } else if (key === 'chong') {
        output[key] = { value, explanation: this.getTerm('冲') };
      } else if (key === 'sha') {
        output[key] = { value, explanation: this.getTerm('煞') };
      } else if (key === 'zhixing') {
        output[key] = { value, explanation: this.getTerm(value) };
      } else if (key === 'tianshen') {
        output[key] = { value, explanation: this.getTerm(value) || this.getTerm('值日天神') };
      } else if (key === 'pengzu') {
        output[key] = { value, items: this.explainList(value), explanation: this.getTerm('彭祖百忌') };
      } else if (key === 'jieqi') {
        output[key] = { value, explanation: this.getTerm(value) || this.getTerm('二十四节气') };
      } else if (key === 'xiu') {
        output[key] = { value, explanation: this.getTerm(value) || this.getTerm(value + '宿') || this.getTerm('二十八星宿') };
      } else if (key === 'nayin') {
        output[key] = { value, items: this.explainList(value), explanation: this.getTerm('纳音') };
      } else if (key === 'taishen') {
        output[key] = { value, explanation: this.getTerm('胎神') };
      } else if (['xishen','caishen','fushen'].includes(key)) {
        output[key] = { value, explanation: this.getTerm(key) };
      } else {
        output[key] = { value, explanation: this.getTerm(value) || this.getTerm(key) };
      }
    }
    return output;
  }

  listZhixing() {
    const category = this.getCategory('zhixing');
    return category ? category.terms : [];
  }
}

async function loadHuangliEngine(url = './data/huangli-terms.json') {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load Huangli data');
  return new HuangliEngine(await response.json());
}

if (typeof window !== 'undefined') {
  window.HuangliEngine = HuangliEngine;
  window.loadHuangliEngine = loadHuangliEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HuangliEngine, loadHuangliEngine };
}
