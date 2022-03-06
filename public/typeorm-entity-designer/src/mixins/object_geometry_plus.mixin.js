import fabric from 'fabric';

fabric.util.object.extend(fabric.Object.prototype, {
  /**
   * 获取边界矩形4个角的坐标，二维，canvas 全局坐标系
   * @returns
   */
  getBoundingRectCoords() {
    let boundRect = this.getBoundingRect();
    return [
      [boundRect.left, boundRect.top],
      [boundRect.left + boundRect.width, boundRect.top],
      [boundRect.left + boundRect.width, boundRect.top + boundRect.height],
      [boundRect.left, boundRect.top + boundRect.height],
    ];
  },

  /**
   * 获取边界矩形4条边的向量形式，二维，canvas 全局坐标，向量方向顺时针
   */
  getBoundingRectVectors(offset = 0) {
    let coords = this.getBoundingRectCoords();
    if (offset) {
      coords[0][0] = coords[0][0] - offset;
      coords[0][1] = coords[0][1] - offset;
      coords[1][0] = coords[1][0] + offset;
      coords[1][1] = coords[1][1] - offset;
      coords[2][0] = coords[2][0] + offset;
      coords[2][1] = coords[2][1] + offset;
      coords[3][0] = coords[3][0] - offset;
      coords[3][1] = coords[3][1] + offset;
    }

    let vectors = [];
    for (let i = 0; i < coords.length; i++) {
      vectors.push(new fabric.Vector(...coords[i], ...coords[i === coords.length - 1 ? 0 : i + 1]));
    }
    return vectors;
  },

  /**
   * 获取线段与边界矩形之间的交点坐标，以边界矩形的中心为圆心，二维，在 canvas 全局坐标系中计算。
   * @param {*} x1
   * @param {*} y1
   * @param {*} x2
   * @param {*} y2
   * @param {*} offset 矩形四周扩展像素
   * @returns
   */
  getBoundingRectIntersectionPoints(x1, y1, x2, y2, offset = 0) {
    let targetVector = new fabric.Vector(x1, y1, x2, y2, offset);
    let vectors = this.getBoundingRectVectors(offset);
    for (let i = 0; i < vectors.length; i++) {
      let v = vectors[i];
      let intersectionCoord = v.getIntersectionPoint(targetVector);
      if (intersectionCoord) {
        return intersectionCoord;
      }
    }
    return false;
  },
});
