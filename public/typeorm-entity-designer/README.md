<h1 align="center">TypeORM Entity Designer</h1>

An entity designer for typeorm, based on fabric.js.

@see http://fabricjs.com/
@see https://typeorm.io/#/separating-entity-definition

## 简介

TypeORM Entity Designer 是一个用来在页面上绘制 ER 图的小工具，底层基于 fabricjs ，这个小工具可以自动生成 typeorm 规定的 Schema 格式，方便与 typeorm 进行对接。

内部只有 2 个核心类：Entity & Relation ，分别对应“实体”和“关系”。

只依赖以下 3 个 node 模块：

- "fabric": "^4.4.0",
- "pluralize": "^8.0.0",
- "uuid": "^8.3.2"

其中 pluralize 和 uuid 已经被打包进去，fabric 需要使用 script 标签加载。（fabric 当前版本没有提供 ES 模块加载的方式。）

## Usage

```javascript

<!DOCTYPE html>
<html>
  <head>
    <title>Group</title>
    <script src="../node_modules/fabric/dist/fabric.js"></script>
    <script src="../dist/index.umd.js"></script>
  </head>
  <body>
    <div><canvas id="container" style="border: 1px solid #ccc" width="1024" height="768"></canvas></div>
    <script>
      let canvas = new fabric.Canvas('container', {
        preserveObjectStacking: true,
      });

      let boEntity1 = new fabric.BoEntity([], {
        width: 200,
        height: 100,
        fill: '#fee',
        stroke: '#000',
        padding: 5,
        linkable: true,
        title: 'testtesttesttesttesttesttesttesttesttesttest',
        fields: [
          {
            name: 'userName',
            type: 'String',
          },
          {
            name: 'userName',
            type: 'String',
          },
          {
            name: 'userName',
            type: 'String',
          },
          {
            name: 'userName',
            type: 'String',
          },
          {
            name: 'userName',
            type: 'String',
          },
          {
            name: 'userName',
            type: 'String',
          },
        ],
      });
      canvas.add(boEntity1);

      let link1 = new fabric.Link([500, 500, 300, 300], {
        stroke: '#f00',
        fill: '#f00',
        arrowType: 'both',
      });
      canvas.add(link1);

      link1.setLinkTo(boEntity1);

      let boEntity2 = new fabric.BoEntity([], {
        width: 200,
        height: 100,
        fill: '#fee',
        stroke: '#000',
        padding: 5,
        linkable: true,
        title: '2222',
        fields: [
          {
            name: 'userName',
            type: 'String',
          },
        ],
      });
      canvas.add(boEntity2);

      link1.setLinkFrom(boEntity2);

      console.log(canvas.toJSON());
      console.log(JSON.stringify(canvas));
    </script>
  </body>
</html>

```

## License

[MIT licensed](./LICENSE).
