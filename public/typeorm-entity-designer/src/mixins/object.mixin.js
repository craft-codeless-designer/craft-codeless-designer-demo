import fabric from 'fabric';
import { v4 as uuidv4 } from 'uuid';

/**
 * 在 fabric.Object.prototype 上扩展一些属性和工具方法，对所有 fabric 对象有效。
 * 同时覆盖 fabric.Object.prototype.toObject 的默认实现。
 */
let toFixed = fabric.util.toFixed;

fabric.util.object.extend(fabric.Object.prototype, {
  linkable: false,

  /**
   * Constructor
   * 覆盖 fabric.Object 的默认实现
   * @param {Object} [options] Options object
   */
  initialize: function (options = {}) {
    this.setOptions({ ...options, id: options.id || 'fabric-' + uuidv4() });
    if (this.linkable) {
      this.inLinks = {};
      this.outLinks = {};
      this.on('moving', this.updateLinkCoords);
    }
  },

  addInLink(link) {
    if (!this.linkable) {
      console.warn(`${this.type} is not linkable.`);
      return;
    }
    if (this.inLinks[link.id]) {
      console.warn(`InLink ${link.id} has already exists.`);
      return;
    }
    this.inLinks[link.id] = link;
    this.updateLinkCoords();
  },

  removeInLink(link) {
    if (!this.linkable) {
      console.warn(`${this.type} is not linkable.`);
      return;
    }
    link && link.id && delete this.inLinks[link.id];
  },

  addOutLink(link) {
    if (!this.linkable) {
      console.warn(`${this.type} is not linkable.`);
      return;
    }
    if (this.outLinks[link.id]) {
      console.warn(`OutLink ${link.id} has already exists.`);
      return;
    }
    this.outLinks[link.id] = link;
    this.updateLinkCoords();
  },

  removeOutLink(link) {
    if (!this.linkable) {
      console.warn(`${this.type} is not linkable.`);
      return;
    }
    link && link.id && delete this.outLinks[link.id];
  },

  updateLinkCoords(e) {
    let centerX = this.left + this.width / 2;
    let centerY = this.top + this.height / 2;
    for (let p in this.inLinks) {
      this.inLinks[p].setOptions({ x2: centerX, y2: centerY });
      this.canvas.sendBackwards(this.inLinks[p]);
    }
    for (let p in this.outLinks) {
      this.outLinks[p].setOptions({ x1: centerX, y1: centerY });
      this.canvas.sendBackwards(this.outLinks[p]);
    }
    this.canvas.renderAll();
  },

  toObject: function (propertiesToInclude = []) {
    var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS,
      object = {
        id: this.id, //新增，把 id 写入 JSON ，其它代码都是 fabric 原始实现
        linkable: this.linkable, //新增，把 linkable 写入 JSON ，其它代码都是 fabric 原始实现
        type: this.type,
        version: fabric.version,
        originX: this.originX,
        originY: this.originY,
        left: toFixed(this.left, NUM_FRACTION_DIGITS),
        top: toFixed(this.top, NUM_FRACTION_DIGITS),
        width: toFixed(this.width, NUM_FRACTION_DIGITS),
        height: toFixed(this.height, NUM_FRACTION_DIGITS),
        fill: this.fill && this.fill.toObject ? this.fill.toObject() : this.fill,
        stroke: this.stroke && this.stroke.toObject ? this.stroke.toObject() : this.stroke,
        strokeWidth: toFixed(this.strokeWidth, NUM_FRACTION_DIGITS),
        strokeDashArray: this.strokeDashArray ? this.strokeDashArray.concat() : this.strokeDashArray,
        strokeLineCap: this.strokeLineCap,
        strokeDashOffset: this.strokeDashOffset,
        strokeLineJoin: this.strokeLineJoin,
        strokeUniform: this.strokeUniform,
        strokeMiterLimit: toFixed(this.strokeMiterLimit, NUM_FRACTION_DIGITS),
        scaleX: toFixed(this.scaleX, NUM_FRACTION_DIGITS),
        scaleY: toFixed(this.scaleY, NUM_FRACTION_DIGITS),
        angle: toFixed(this.angle, NUM_FRACTION_DIGITS),
        flipX: this.flipX,
        flipY: this.flipY,
        opacity: toFixed(this.opacity, NUM_FRACTION_DIGITS),
        shadow: this.shadow && this.shadow.toObject ? this.shadow.toObject() : this.shadow,
        visible: this.visible,
        backgroundColor: this.backgroundColor,
        fillRule: this.fillRule,
        paintFirst: this.paintFirst,
        globalCompositeOperation: this.globalCompositeOperation,
        skewX: toFixed(this.skewX, NUM_FRACTION_DIGITS),
        skewY: toFixed(this.skewY, NUM_FRACTION_DIGITS),
      };

    if (this.clipPath) {
      object.clipPath = this.clipPath.toObject(propertiesToInclude);
      object.clipPath.inverted = this.clipPath.inverted;
      object.clipPath.absolutePositioned = this.clipPath.absolutePositioned;
    }

    fabric.util.populateWithProperties(this, object, propertiesToInclude);
    if (!this.includeDefaultValues) {
      object = this._removeDefaultValues(object);
    }

    return object;
  },
});
