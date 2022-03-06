import { FileDoneOutlined, ForkOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Col, Layout, message, Modal, Row, Space } from 'antd';
import 'antd/dist/antd.css';
import React from 'react';
import EntityPropertyEditor from './EntityPropertyEditor';
import './index.scss';
import RelationPropertyEditor from './RelationPropertyEditor';

const { Header, Content } = Layout;

/**
 * @author 大漠穷秋<damoqiongqiu@126.com>
 */
export default class EntityChartDesigner extends React.Component {
  entityNameFormRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      isNewEntityModalVisible: false,
      isNewRelationModalVisible: false,
      showSchemaModal: false,
      id: '',
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    if (!params.id) {
      console.error('没有获取到 id');
      return;
    }

    this.setState({
      ...this.state,
      id: params.id,
    });

    setTimeout(() => {
      let fabric = window.fabric;
      let canvas = new fabric.Canvas('lower-canvas', {
        preserveObjectStacking: true,
      });

      //添加事件监听
      canvas.on('mouse:dblclick', options => {
        this.objDbClickHandler(options);
      });
      this.canvas = canvas;

      document.addEventListener('keydown', event => {
        this.keyDownHandler(event);
      });

      //窗口变化时同步修改 canvas 尺寸
      this.syncCanvasSize();
      window.addEventListener('resize', () => {
        this.syncCanvasSize();
      });

      this.loadChartData(params.id);
    }, 0);
    return;
  }

  objDbClickHandler(options) {
    console.log(options);
    if (options.target && options.target.type) {
      let target = options.target;
      let type = options.target.type;
      if (type === 'Entity') {
        this.setState({
          ...this.state,
          isNewEntityModalVisible: true,
        });
      } else if (type === 'Relation') {
        this.setState({
          ...this.state,
          isNewRelationModalVisible: true,
        });
      }
    }
  }

  keyDownHandler(event) {
    //delete
    if (event.keyCode === 46) {
      let activeObjects = this.canvas.getActiveObjects();
      if (!activeObjects || !activeObjects.length) {
        message.info('请选中需要删除的对象。');
        return;
      }

      //连接线不能独立存在，会导致数据库执行报错
      //删除 Entity 时需要把连接线删除
      //删除连接线时，需要重新设置 Entity 上的 relation 关系
      //所以，先尝试删除连接线，再删除其它对象
      activeObjects.map((item, index) => {
        if (item.type === 'Relation') {
          item.removeLinkFrom();
          item.removeLinkTo();
        } else if (item.type === 'Entity') {
          for (let p in item.inLinks) {
            item.inLinks[p].removeLinkto();
          }
          for (let p in item.outLinks) {
            item.outLinks[p].removeLinkFrom();
          }
        }
        this.canvas.remove(item);
      });

      this.canvas.discardActiveObject().renderAll();
    }
  }

  loadChartData(id) {
    fetch(`/api/entity-chart/${id}`)
      .then(response => {
        return response.json();
      })
      .then(json => {
        this.canvas.loadFromJSON(JSON.parse(json.chartData));
      });
  }

  syncCanvasSize() {
    let width = document.getElementById('canvas-container').clientWidth;
    let height = document.getElementById('canvas-container').clientHeight;
    this.canvas.setWidth(width);
    this.canvas.setHeight(height);
    this.canvas.renderAll();
  }

  saveChartData() {
    let postData = {
      id: this.state.id,
      chartData: JSON.stringify(this.canvas.toObject()),
      entitySchemaJson: JSON.stringify(this.canvas.toEntityObject()),
    };
    console.log(postData);

    fetch('/api/entity-chart/update-chart-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(postData),
    })
      .then(response => {
        if (response.ok) {
          message.success('修改成功');
        } else {
          message.error('修改失败');
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  showSchema() {
    this.setState({
      ...this.state,
      showSchemaModal: true,
    });
  }

  renderSchemaModal() {
    return (
      <Modal
        title="TypeORM 将会根据这份 Schema 自动在 MySQL 中建表（改表）"
        width={800}
        centered={true}
        visible={true}
        onOk={() => {}}
        onCancel={() => {
          this.setState({
            ...this.state,
            showSchemaModal: false,
          });
        }}
      >
        {JSON.stringify(this.canvas.toEntityObject())}
      </Modal>
    );
  }

  renderNewEntityModal() {
    return (
      <Modal
        title="新建/编辑 Entity （当前版本生成的 Schema 只支持 MySQL，后续升级改进）"
        width={800}
        centered={true}
        visible={true}
        footer={null}
        onOk={() => {}}
        onCancel={() => {
          this.setState({
            ...this.state,
            isNewEntityModalVisible: false,
          });
        }}
      >
        <EntityPropertyEditor
          canvas={this.canvas}
          onSave={() => {
            this.setState({
              ...this.state,
              isNewEntityModalVisible: false,
            });
          }}
        ></EntityPropertyEditor>
      </Modal>
    );
  }

  renderNewRelationModal() {
    return (
      <Modal
        title="新建/编辑 Relation （当前版本生成的 Schema 只支持 MySQL，后续升级改进）"
        width={800}
        centered={true}
        visible={true}
        footer={null}
        onOk={() => {}}
        onCancel={() => {
          this.setState({
            ...this.state,
            isNewRelationModalVisible: false,
          });
        }}
      >
        <RelationPropertyEditor
          canvas={this.canvas}
          onSave={() => {
            this.setState({
              ...this.state,
              isNewRelationModalVisible: false,
            });
          }}
        ></RelationPropertyEditor>
      </Modal>
    );
  }

  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Header className="site-layout-background" style={{ height: '50px', lineHeight: '50px', padding: '0 15px', background: '#001529' }}>
          <Space size="small" align="end">
            <Button
              type="primary"
              onClick={() => {
                this.setState({
                  ...this.state,
                  isNewEntityModalVisible: true,
                });
              }}
              icon={<PlusOutlined></PlusOutlined>}
            >
              New Entity
            </Button>
            <Button
              type="primary"
              onClick={() => {
                this.setState({
                  ...this.state,
                  isNewRelationModalVisible: true,
                });
              }}
              icon={<ForkOutlined />}
            >
              New Relation
            </Button>
            <Button type="primary" onClick={this.saveChartData.bind(this)} icon={<SaveOutlined />}>
              Save
            </Button>
            <Button type="primary" onClick={this.showSchema.bind(this)} icon={<FileDoneOutlined />}>
              Show Schema
            </Button>
          </Space>
        </Header>
        <Layout className="site-layout">
          <Content style={{ margin: 5 }}>
            {this.state.showSchemaModal && this.renderSchemaModal()}
            {this.state.isNewEntityModalVisible && this.renderNewEntityModal()}
            {this.state.isNewRelationModalVisible && this.renderNewRelationModal()}
            <Row style={{ height: '100%', overflow: 'hidden' }}>
              <Col span={24}>
                <div
                  id="canvas-container"
                  className="site-layout-background"
                  style={{ padding: 0, margin: 0, width: '100%', height: 'calc(100vh - 65px)', overflow: 'hidden' }}
                >
                  <canvas id="lower-canvas" width="1024px" height="768px"></canvas>
                </div>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
