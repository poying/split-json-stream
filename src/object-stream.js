import { Transform } from 'stream';

export default class ObjectStream extends Transform {
  constructor(options) {
    super(Object.assign({}, options, { objectMode: true }));
    this._current = null;
    this._stack = [];
  }

  _transform(chunk, enc, cb) {
    this._parseJson(chunk);
    cb();
  }

  _pushStack(Ctrl) {
    const path = this._current ? this._current.elementPath : [];
    const stack = new Ctrl(path);
    if (this._current) {
      this._stack.push(this._current);
    }
    this._current = stack;
  }

  _popStack() {
    this._current = this._stack.pop();
  }

  _parseJson(token) {
    switch (token.name) {
      case 'startArray':
        this._pushStack(ArrayStack);
        break;
      case 'endArray':
        this._popStack();
        break;

      case 'startObject':
        this._pushStack(ObjectStack);
        break;
      case 'endObject':
        this._popStack();
        break;

      case 'keyValue':
        this._current.key = token.value;
        break;
      case 'stringValue':
      case 'numberValue':
      case 'nullValue':
      case 'trueValue':
      case 'falseValue':
        this.push({
          path: this._current.elementPath,
          value: token.value
        });
        this._current.nextElement();
        break;
    }
  }
}

class Stack {
  constructor(path) {
    this.path = path;
  }

  get elementPath() {
    return this.path.slice();
  }

  nextElement() {}
}

class ObjectStack extends Stack {
  constructor(path) {
    super(path);
    this.type = 'object';
    this.key = null;
  }

  get elementPath() {
    return this.key
      ? this.path.slice().concat(this.key)
      : this.path.slice();
  }

  nextElement() {
    this.key = null;
  }
}

class ArrayStack extends Stack {
  constructor(path) {
    super(path);
    this.type = 'array';
    this.index = 0;
  }

  get elementPath() {
    return this.path.slice().concat(this.index);
  }

  nextElement() {
    this.index += 1;
  }
}
