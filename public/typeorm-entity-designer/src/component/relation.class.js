import fabric from 'fabric';
import * as trigoUtil from '../utils/trigonometric_util';

/**
 * @class Relation
 * 用来描述实体类之间的关系，外观是一条带箭头的连接线。
 * @see https://typeorm.io/#/separating-entity-definition
 */
fabric.Relation = fabric.util.createClass(fabric.Line, {
  type: 'Relation', //This property will be serialized to database, please don't change it.

  initialize: function (points = [0, 0, 0, 0], options = {}) {
    options = {
      ...options,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      lockSkewingX: true,
      lockSkewingY: true,
      lockScalingFlip: true,
    };
    this.callSuper('initialize', points, options);
    this.linkFrom = null;
    this.linkTo = null;
    this.title = options.title || '';
    this.fromId = options.fromId || ''; //for type-orm schema
    this.toId = options.toId || ''; //for type-orm schema
    this.fromName = options.fromName || ''; //for type-orm schema
    this.toName = options.toName || ''; //for type-orm schema
    this.referencedColumnName = options.referencedColumnName || 'id'; //for type-orm schema
    this.arrowType = options.arrowType || 'end'; //start,end,both,none
    this.arrowAngel = options.arrowAngel || Math.PI / 8;
    this.arrowLength = options.arrowLength || this.strokeWidth + 15;
    this.relationType = options.relationType || 'one-to-one'; //one-to-one, one-to-many, many-to-one, many-to-many, @see https://typeorm.io/#/relations
  },

  setLinkFrom(linkFrom) {
    this.linkFrom && this.removeLinkFrom(this.linkFrom);
    this.linkFrom = linkFrom;
    this.fromId = this.linkFrom.id;
    this.fromName = this.linkFrom.title;
    this.linkFrom.addOutLink(this);
  },

  removeLinkFrom() {
    this.linkFrom.removeOutLink(this);
    this.linkFrom = null;
    this.fromId = '';
    this.fromName = '';
  },

  setLinkTo(linkTo) {
    this.linkTo && this.removeLinkTo();
    this.linkTo = linkTo;
    this.toId = this.linkTo.id;
    this.toName = this.linkTo.title;
    this.linkTo.addInLink(this);
  },

  removeLinkTo() {
    this.linkTo.removeInLink(this);
    this.linkTo = null;
    this.toId = '';
    this.toName = '';
  },

  render: function (ctx) {
    this.callSuper('render', ctx);

    if (this.arrowType === 'start' || this.arrowType === 'both') {
      this.renderStartArrow(ctx);
    }
    if (this.arrowType === 'end' || this.arrowType === 'both') {
      this.renderEndArrow(ctx);
    }
  },

  renderStartArrow: function (ctx) {
    let firstTwoPoints = [];
    if (this.linkFrom) {
      let coord = this.linkFrom.getBoundingRectIntersectionPoints(this.x1, this.y1, this.x2, this.y2, -6);
      firstTwoPoints = [
        [coord.x, coord.y],
        [this.x2, this.y2],
      ];
    } else {
      firstTwoPoints = [
        [this.x1, this.y1],
        [this.x2, this.y2],
      ];
    }

    this.__renderArrow(firstTwoPoints, ctx);
  },

  renderEndArrow: function (ctx) {
    //把 this.strokeWidth 加入计算，否则 strokeWidth>1 时箭头会出现一点点偏移。
    let halfStroke = this.strokeWidth / 2;
    let lastTwoPoints = [];
    if (this.linkTo) {
      let coord = this.linkTo.getBoundingRectIntersectionPoints(this.x1, this.y1, this.x2, this.y2, -6);
      lastTwoPoints = [
        [coord.x + halfStroke, coord.y + halfStroke],
        [this.x1 + halfStroke, this.y1 + halfStroke],
      ];
    } else {
      lastTwoPoints = [
        [this.x2 + halfStroke, this.y2 + halfStroke],
        [this.x1 + halfStroke, this.y1 + halfStroke],
      ];
    }
    this.__renderArrow(lastTwoPoints, ctx);
  },

  __renderArrow: function (twoPoints, ctx) {
    let p1 = twoPoints[0];
    let p2 = twoPoints[1];

    //step-1: move origin to end point
    p2[0] = p2[0] - p1[0];
    p2[1] = p2[1] - p1[1];

    //step-2: cosp2 and sinp2
    let cosp2 = trigoUtil.cosx(...p2);
    let sinp2 = trigoUtil.sinx(...p2);

    let cosArrow = Math.cos(this.arrowAngel);
    let sinArrow = Math.sin(this.arrowAngel);

    let x1 = this.arrowLength * (cosp2 * cosArrow - sinp2 * sinArrow);
    let y1 = this.arrowLength * (sinp2 * cosArrow + cosp2 * sinArrow);

    let x2 = this.arrowLength * (cosp2 * cosArrow + sinp2 * sinArrow);
    let y2 = this.arrowLength * (sinp2 * cosArrow - cosp2 * sinArrow);

    //step-3: move origin back to (0,0)
    x1 += p1[0];
    y1 += p1[1];

    x2 += p1[0];
    y2 += p1[1];

    //step-4: draw arrow
    ctx.strokeStyle = this.stroke || '#000';
    ctx.fillStyle = this.fill || '#000';
    ctx.lineWidth = this.strokeWidth;
    ctx.beginPath();
    ctx.moveTo(...p1);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.fill();
  },

  toObject: function (propertiesToInclude = []) {
    return this.callSuper('toObject', [
      ...propertiesToInclude,
      'title',
      'fromId',
      'toId',
      'fromName',
      'toName',
      'referencedColumnName',
      'relationType',
      'arrowType',
      'arrowAngel',
      'arrowLength',
    ]);
  },

  /**
   * 实体类的 JSON 格式描述，与 type-orm 规定的格式对应
   */
  toEntityObject: function () {
    let { title, fromId, toId, relationType, referencedColumnName } = this;
    let result = {
      title,
      fromId,
      toId,
      relationType,
      referencedColumnName,
    };
    return result;
  },
});

fabric.Relation.fromObject = function (object, callback = () => {}) {
  console.log(object);
  let instance = new fabric.Relation([object.x1, object.y1, object.x2, object.y2], object);
  callback(instance);
  return instance;
};
