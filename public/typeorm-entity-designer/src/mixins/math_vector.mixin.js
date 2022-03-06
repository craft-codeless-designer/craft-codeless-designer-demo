import fabric from 'fabric';
/**
 * 几何意义上的向量，二维直角坐标系
 */
class Vector {
  constructor(x1 = 0, y1 = 0, x2 = 0, y2 = 0) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  /**
   * 向量长度
   * @returns
   */
  getLength() {
    return Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2));
  }

  /**
   * 任意二维向量外积的矩阵算法
   * @param {*} vector
   */
  cross(vector) {
    return (this.x2 - this.x1) * (vector.y2 - vector.y1) - (vector.x2 - vector.x1) * (this.y2 - this.y1);
  }

  /**
   * 内积，二维直角坐标系
   * @param {*} vector
   */
  dot(vector) {
    return this.x1 * vector.x1 + this.y2 * vector.y2;
  }

  /**
   * 获取与另一个向量（线段）的焦点，线段无交点返回 false
   * @param {*} vector
   */
  getIntersectionPoint(vector) {
    let vector1 = new fabric.Vector(this.x1, this.y1, vector.x1, vector.y1);
    let vector2 = new fabric.Vector(this.x1, this.y1, vector.x2, vector.y2);
    let vector3 = new fabric.Vector(this.x2, this.y2, vector.x1, vector.y1);
    let vector4 = new fabric.Vector(this.x2, this.y2, vector.x2, vector.y2);

    let cross1 = vector1.cross(vector3);
    let cross2 = vector2.cross(vector4);
    if (cross1 * cross2 >= 0) {
      //线段的端点位于同侧，线段不相交
      return false;
    }

    let cross3 = vector1.cross(vector2);
    let cross4 = vector3.cross(vector4);
    if (cross3 * cross4 >= 0) {
      //线段的端点位于同侧，线段不相交
      return false;
    }

    //求向量交点
    let t = cross3 / (cross2 - cross1);
    let dx = t * (this.x2 - this.x1);
    let dy = t * (this.y2 - this.y1);
    return { x: this.x1 + dx, y: this.y1 + dy };
  }
}

fabric.Vector = Vector;
