import { FileDoneOutlined, ForkOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Col, Layout, message, Modal, Row, Space } from 'antd';
import 'antd/dist/antd.css';
import { Entity, Relation, toSchemaObject, toSchemaString } from 'ice-entity-designer';
import { ICE } from 'ice-render';
import React from 'react';
import EntityPropertyEditor from './EntityPropertyEditor';
import './index.scss';
import RelationPropertyEditor from './RelationPropertyEditor';

const { Header, Content } = Layout;

/**
 * @author 大漠穷秋<damoqiongqiu@126.com>
 */
export default class EntityChartDesigner extends React.Component {
  ice; //ice 实例
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

    this.ice = new ICE().init('lower-canvas');
    this.ice.evtBus.on('dblclick', this.dbClickHandler, this);

    this.setState({
      ...this.state,
      id: params.id,
    });

    setTimeout(() => {
      this.loadChartData(params.id);
    }, 0);
    return;
  }

  dbClickHandler(evt) {
    let component = evt.param.component;
    if (!component) {
      return;
    }

    let typeName = component.constructor.name;
    if (typeName === 'Entity') {
      this.setState({
        ...this.state,
        isNewEntityModalVisible: true,
      });
    } else if (typeName === 'Relation') {
      this.setState({
        ...this.state,
        isNewRelationModalVisible: true,
      });
    }
  }

  /**
   * FIXME:增加容错处理，数据可能不存在，或者解析会出错。
   * @param {*} id
   */
  loadChartData(id) {
    fetch(`/api/entity-chart/${id}`)
      .then(response => {
        return response.json();
      })
      .then(json => {
        //!先在 ice 实例上注册类型，然后才能从 JSON 字符串反解析出图形对象，@see https://gitee.com/ice-render/ice-render
        this.ice.registerType('Entity', Entity);
        this.ice.registerType('Relation', Relation);
        this.ice.fromJSONString(json.chartData);
      });
  }

  /**
   * 把图形数据、Schema 数据保存到服务端，图形数据和 Schema 数据都是 JSON 字符串，分别存储在 chartData 和 schemaData 字段中。
   */
  saveChartData() {
    let postData = {
      id: this.state.id,
      chartData: this.ice.toJSONObject(),
      entitySchemaJson: toSchemaObject(this.ice.childNodes),
    };

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
        title="服务端将会解析这份 Schema 自动在 MySQL 中建表/改表"
        width={800}
        centered={true}
        visible={true}
        onOk={() => {
          this.setState({
            ...this.state,
            showSchemaModal: false,
          });
        }}
        onCancel={() => {
          this.setState({
            ...this.state,
            showSchemaModal: false,
          });
        }}
      >
        {toSchemaString(this.ice.childNodes)}
      </Modal>
    );
  }

  renderNewEntityModal() {
    return (
      <Modal
        title="新建/编辑 Entity"
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
          ice={this.ice}
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
        title="新建/编辑 Relation"
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
          ice={this.ice}
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
                  style={{ padding: 0, margin: 0, width: '100%', border: 'none', height: 'calc(100vh - 65px)', overflow: 'hidden' }}
                >
                  <canvas id="lower-canvas" width="1024" height="768"></canvas>
                </div>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
