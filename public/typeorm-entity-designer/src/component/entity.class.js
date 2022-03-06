import fabric from 'fabric';

/**
 * @class Entity
 * 实体类，支持 type-orm 定义的 entity 数据格式。
 * @see https://typeorm.io/#/separating-entity-definition
 */
fabric.Entity = fabric.util.createClass(fabric.Group, {
  type: 'Entity', //This property will be serialized to database, please don't change it.

  initialize: function (objects = [], options = {}, isAlreadyGrouped = false) {
    options = { ...options, hasControls: false };
    this.callSuper('initialize', objects, options, isAlreadyGrouped);
    this.padding = options.padding || 0;
    this.innerPadding = 5; //fabricjs 有一个 padding 属性，但是含义不同
    this.initChildren(options);
  },

  initChildren(options) {
    this.set('title', options.title || 'SET_BO_TITLE'); //BO engity must have a title, which will be used as the table name in the database.
    this.set('fields', options.fields || []);

    //创建一个作为背景的矩形
    const { top = 0, left = 0, width = 200, height = 100, fill = '#fee', stroke = 'black' } = options;
    this.addWithUpdate(new fabric.Rect({ top, left, width, height, fill, stroke }));

    //创建标题
    this.addWithUpdate(
      new fabric.Text(`${this.title}`, {
        fontSize: 24,
      }),
    );

    //创建分隔线
    this.addWithUpdate(
      new fabric.Line([0, 0, 200 + this.innerPadding, 0], {
        stroke: options.stroke || '#f00',
      }),
    );

    //创建所有字段
    this.fields.forEach((field, index) => {
      this.addWithUpdate(
        new fabric.Text(`${field.name}   ${field.type}`, {
          fontSize: 18,
        }),
      );
    });
  },

  /**
   * 覆盖父类的方法
   * @param {*} object
   * @returns
   */
  addWithUpdate(object) {
    let nested = !!this.group;
    this._restoreObjectsState();
    fabric.util.resetObjectTransform(this);
    if (object) {
      if (nested) {
        // if this group is inside another group, we need to pre transform the object
        fabric.util.removeTransformFromObject(object, this.group.calcTransformMatrix());
      }
      this._objects.push(object);
      object.group = this;
      object._set('canvas', this.canvas);
    }

    //在父层实现的中间插入这一行，重新计算子元素的尺寸和坐标，其它代码都是 fabric.js 的原始实现。
    this.doLayout();

    this._calcBounds();
    this._updateObjectsCoords();
    this.dirty = true;
    if (nested) {
      this.group.addWithUpdate();
    } else {
      this.setCoords();
    }
    return this;
  },

  doLayout() {
    let objs = this.getObjects();
    if (!objs || objs.length < 2) {
      return;
    }

    //step-1: 重新计算除了背景矩形以外的其它对象
    let bgRect = objs[0];
    let others = objs.slice(1);
    let totalHeight = 0;
    let maxWidth = 0;
    for (let i = 0; i < others.length; i++) {
      let obj = others[i];
      let objBR = obj.getBoundingRect();
      totalHeight += objBR.height + this.innerPadding;
      if (objBR.width > maxWidth) {
        maxWidth = objBR.width;
      }

      let newTop = bgRect.top + totalHeight - objBR.height; //补偿，把自身的高度减掉
      if (obj.type === 'line') {
        obj.setOptions({ top: newTop, left: bgRect.left });
      } else {
        obj.setOptions({ top: newTop, left: bgRect.left + this.innerPadding });
      }
    }

    //step-2: 重新设置背景矩形尺寸
    if (maxWidth > bgRect.width) {
      bgRect.setOptions({ left: bgRect.left, width: maxWidth });
    }
    if (totalHeight > bgRect.height) {
      bgRect.setOptions({ top: bgRect.top, height: totalHeight });
    }

    //step-3: 重新设置分割线宽度
    let line = objs[2];
    if (line && maxWidth > line.x2) {
      line.setOptions({ x2: maxWidth + this.innerPadding });
    }
    return this;
  },

  toObject: function (propertiesToInclude = []) {
    let jsonObj = this.callSuper('toObject', [...propertiesToInclude, 'title', 'fields', 'padding']);
    jsonObj.objects = [];
    return jsonObj;
  },

  /**
   * 实体类的 JSON 格式描述，与 type-orm 规定的格式对应
   */
  toEntityObject: function () {
    let result = {
      name: this.title,
      columns: {},
    };
    this.fields.forEach((field, index) => {
      result.columns[field.name] = { ...field };
    });
    return result;
  },
});

fabric.Entity.fromObject = function (object, callback) {
  var objects = object.objects,
    options = fabric.util.object.clone(object, true);
  if (typeof objects === 'string') {
    // it has to be an url or something went wrong.
    fabric.loadSVGFromURL(objects, function (elements) {
      var group = fabric.util.groupSVGElements(elements, object, objects);
      group.set(options);
      callback && callback(group);
    });
    return;
  }
  fabric.util.enlivenObjects(objects, function (enlivenedObjects) {
    fabric.util.enlivenObjects([object.clipPath], function (enlivedClipPath) {
      var options = fabric.util.object.clone(object, true);
      options.clipPath = enlivedClipPath[0];
      callback && callback(new fabric.Entity(enlivenedObjects, options, true));
    });
  });
};
