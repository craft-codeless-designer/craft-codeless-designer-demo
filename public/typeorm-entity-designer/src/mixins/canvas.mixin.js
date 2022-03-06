import fabric from 'fabric';
import { camelCase } from '../utils/camelcase_util';
import { pluralize } from '../utils/pluralize_util';

fabric.util.object.extend(fabric.Canvas.prototype, {
  /**
   * 覆盖内置的 loadFromJSON ，增加对连接线的处理。
   * 连接线一般涉及到起点和终点两个对象，所以必须等所有对象全部创建并渲染完成之后才能执行。
   * @param {*} json
   * @param {*} callback
   * @param {*} reviver
   * @returns
   */
  loadFromJSON: function (json, callback, reviver) {
    if (!json) {
      return;
    }

    // serialize if it wasn't already
    var serialized = typeof json === 'string' ? JSON.parse(json) : fabric.util.object.clone(json);

    var _this = this,
      clipPath = serialized.clipPath,
      renderOnAddRemove = this.renderOnAddRemove;

    this.renderOnAddRemove = false;

    delete serialized.clipPath;

    this._enlivenObjects(
      serialized.objects,
      function (enlivenedObjects) {
        _this.clear();
        _this._setBgOverlay(serialized, function () {
          if (clipPath) {
            _this._enlivenObjects([clipPath], function (enlivenedCanvasClip) {
              _this.clipPath = enlivenedCanvasClip[0];
              _this.__setupCanvas.call(_this, serialized, enlivenedObjects, renderOnAddRemove, callback);
            });
          } else {
            _this.__setupCanvas.call(_this, serialized, enlivenedObjects, renderOnAddRemove, callback);
          }
        });
      },
      reviver,
    );

    //以下代码增加对连接线的处理，其它代码都是 fabric.js 的原生实现。
    let _objs = this._objects || [];
    let relations = {};
    let others = {};
    _objs.forEach((obj, index) => {
      if (obj.type === 'Relation') {
        relations[obj.id] = obj;
      } else {
        others[obj.id] = obj;
      }
    });
    for (let p in relations) {
      let relation = relations[p];
      if (relation.fromId) {
        others[relation.fromId] && relation.setLinkFrom(others[relation.fromId]);
      }
      if (relation.toId) {
        others[relation.toId] && relation.setLinkTo(others[relation.toId]);
      }
    }
    return this;
  },

  /**
   * 用来对接 type-orm ，满足 type-orm 定义的 JSON schema 数据结构。
   * @returns
   */
  toEntityObject: function () {
    let _objs = this._objects || [];
    let entities = [];
    let relations = [];
    let cache = {};
    _objs.forEach((obj, index) => {
      if (obj.type === 'Relation') {
        relations.push(obj);
      } else if (obj.type === 'Entity') {
        entities.push(obj);
        cache[obj.id] = obj.toEntityObject();
      }
    });
    relations.forEach((relation, index) => {
      let relationType = relation.relationType;
      let fromId = relation.fromId;
      let toId = relation.toId;
      let fromName = relation.fromName;
      let toName = relation.toName;
      let fromObj = cache[fromId];
      let toObj = cache[toId];

      if (!fromObj || !toObj) {
        return;
      }
      if (!fromObj.relations) {
        fromObj.relations = {};
      }
      if (!toObj.relations) {
        toObj.relations = {};
      }

      //TODO:这里的实现做了简化，没有支持 type-orm 完整的 schema 规则。
      //TODO:这里需要重构，需要完整支持 type-orm 中的4种关联关系，one-to-one, one-to-many, many-to-one, many-to-many ，type-orm 中定义了更详细的 schema 配置参数。
      if ('one-to-one' === relationType) {
        fromObj.relations[`${camelCase(toName)}`] = {
          type: relationType,
          target: toName,
          joinColumn: {
            target: toName,
            referencedColumnName: relation.referencedColumnName,
          },
        };
        toObj.relations[`${camelCase(fromName)}`] = {
          type: relationType,
          target: fromName,
        };
      } else if ('one-to-many' === relationType) {
        fromObj.relations[`${camelCase(toName)}`] = {
          type: relationType,
          target: toName,
        };
      } else if ('many-to-one' === relationType) {
        toObj.relations[`${camelCase(fromName)}`] = {
          type: 'one-to-many', //反向设置为 one-to-many
          target: fromName,
        };
      } else if ('many-to-many' === relationType) {
        //这里默认双向设置，方便 QueryBuilder 进行操作
        fromObj.relations[`${pluralize(camelCase(toName))}`] = {
          type: relationType,
          target: toName,
          joinTable: {
            target: toName,
          },
        };
        toObj.relations[`${pluralize(camelCase(fromName))}`] = {
          type: relationType,
          target: fromName,
        };
      }
    });
    let result = [];
    for (let p in cache) {
      result.push(cache[p]);
    }
    return result;
  },
});
