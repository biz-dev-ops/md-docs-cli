const fs = require('fs').promises;
const { env, cwd } = require('process');
const colors = require('colors');
const path = require('path');
const glob = require('glob-promise');

const files = require('../../utils/files');;
const jsonSchemaParser = require('../../utils/json-schema-parser');

const AnchorParser = require('../anchor-parser');

module.exports = class BusinessReferenceArchitectureParser extends AnchorParser {
  constructor({ businessReferenceArchitectureComponent }) {
    super();

    this.component = businessReferenceArchitectureComponent;
  }

  _canParse(anchor) { return anchor.href.endsWith('business-reference-architecture.yml') || anchor.href.endsWith('business-reference-architecture.yaml'); }

  async _parse(anchor, file) {
    console.info(colors.green(`\t\t\t\t* parsing yaml`));
    const json = await this.#getJson(file);

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.json`, JSON.stringify(json));

    console.info(colors.green(`\t\t\t\t* rendering`));
    const html = this.component.render({
      json: JSON.stringify(json)
        .replace(/(\r\n|\n|\r)/gm, "")
        .replace(/"/g, "&quot;")
    });

    if (env.NODE_ENV === 'development')
      await fs.writeFile(`${file}.html`, html);

    return html;
  }

  async #getJson(file) {
    const json = await jsonSchemaParser.parse(file);
    await this.#dereference(json, path.dirname(file));
    return json;
  }

  async #dereference(el, basePath) {
    if (!el) {
      return;
    }

    if (Array.isArray(el)) {
      el.forEach(item => this.#dereference(item, basePath));
      return;
    }

    if (typeof el === 'object') {
      for (const [key, value] of Object.entries(el)) {
        if (!["groups", "buttons"].includes(key) || typeof value !== "string") {
          await this.#dereference(value, basePath);
        }
        else {
          const ref = path.resolve(basePath, value);

          if (await !files.exists(ref)) {
            throw `Path does not exist. ${ref}`;
          }

          el[key] = await (key === "groups" ? this.#parseGroups(ref) : this.#parseButtons(ref));
        }
      }
      return;
    }
  }

  async #parseGroups(ref) {
    const paths = await glob("*/", { cwd: ref });

    return await Promise.all(
      paths.map(async (p) => {
        const group = {
          title: this.#getTitle(p),
          link: await this.#resolveRelativeLinkIfPathContainsIndex(p),
          buttons: await this.#parseButtons(p)
        };
        return group;
      })
    );
  }

  async #parseButtons(ref) {
    const paths = await glob("*/", { cwd: ref });

    return await Promise.all(
      paths.map(async (p) => {
        const button = {
          title: this.#getTitle(p),
          link: await this.#resolveRelativeLinkIfPathContainsIndex(p)
        };
        return button;
      })
    );
  }

  #getTitle(p) {
    const title = path.basename(p);
    return title.charAt(0).toUpperCase() + title.slice(1)
        .replace("-", " ");
  }

  async #resolveRelativeLinkIfPathContainsIndex(p) {
    if (!await files.exists(path.resolve(p, "index.md"))) {
      return null;
    }

    return path.relative(cwd(), p);
  }
}