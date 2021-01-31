/*
  An alternative to the JavaScript URL API, that supports relative URLs
*/
class URL {
  constructor(basePath) {
    this.basePath = basePath;
  }

  getSearchParam(key) {
    return this.params && this.params.find(p => p.key === key);
  }

  appendSearchParam(key, value) {
    if (!this.params) {
      this.params = [];
    }

    this.params.push({ key, value });
  }

  appendToPath(string) {
    this.basePath += string;
  }

  getPath() {
    const hasParams = this.params && this.params.length > 0;
    const queryString = hasParams ? this.params.map(p => `${p.key}=${p.value}`).join('&') : null;

    return `${this.basePath}${queryString ? `?${queryString}` : ''}`;
  }
}

export default URL;
