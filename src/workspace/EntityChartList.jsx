import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, GithubOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Form, Input, Layout, message, Modal, Space, Table } from 'antd';
import React, { Component } from 'react';

/**
 * EntityChartList
 * @author 大漠穷秋<damoqiongqiu@126.com>
 */
const { Content, Footer } = Layout;
const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};

export default class EntityChartList extends Component {
  editPageFormRef = React.createRef();
  newPageFormRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      isNewPageModalVisible: false,
      currentRecord: null,
    };

    this.showEditForm = this.showEditForm.bind(this);
    this.openDesigner = this.openDesigner.bind(this);
    this.doDelete = this.doDelete.bind(this);
    this.newChart = this.newChart.bind(this);
    this.handleTableChange = this.handleTableChange.bind(this);
  }

  componentDidMount() {
    this.doLoad();
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      {
        ...this.state,
        pagination: {
          ...this.state.pagination,
          ...pagination,
        },
      },
      () => {
        this.doLoad();
      },
    );
  };

  showEditForm(record) {
    this.setState({
      ...this.state,
      isNewPageModalVisible: true,
      currentRecord: { ...record },
    });
  }

  openDesigner(record) {
    window.open(`/entity-chart-designer/${record.id}`, '_blank').focus();
    this.doLoad();
  }

  doDelete(record) {
    Modal.confirm({
      title: '请确认',
      centered: true,
      icon: <ExclamationCircleOutlined />,
      content: '此操作会删除所有副本，确定吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        fetch('/api/entity-chart/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify({ id: record.id }),
        })
          .then(response => {
            if (response.ok) {
              message.success('删除成功...');
            } else {
              message.error(`删除失败...${response}`);
            }
            this.doLoad();
          })
          .catch(err => console.log('Request Failed', err));
      },
    });
  }

  doLoad() {
    const { pagination } = this.state;
    const offset = (pagination.current - 1) * pagination.pageSize;
    const limit = pagination.pageSize;
    fetch('/api/entity-chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        offset,
        limit,
      }),
    })
      .then(response => {
        return response.json();
      })
      .then(json => {
        this.setState({
          ...this.state,
          tableData: [...json.dataSet],
          pagination: {
            ...this.state.pagination,
            total: json.total,
          },
        });
      });
  }

  newChart() {
    this.setState({
      ...this.state,
      isNewPageModalVisible: true,
      currentRecord: null,
    });
  }

  renderNewChartForm() {
    const { currentRecord } = this.state;
    let tempFields = [];
    if (currentRecord) {
      tempFields = [
        {
          name: 'id',
          value: currentRecord.id,
        },
        {
          name: 'chartName',
          value: currentRecord.entity_chart_name,
        },
        {
          name: 'time',
          value: currentRecord.time,
        },
      ];
    }

    return (
      <Modal
        title="新建/编辑 Entity 图"
        width={600}
        centered={true}
        visible={this.state.isNewPageModalVisible}
        onOk={() => {
          const formInstance = this.newPageFormRef.current;
          formInstance
            .validateFields()
            .then(values => {
              const param = {
                ...values,
              };
              if (currentRecord) {
                fetch('/api/entity-chart/update-chart-info', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                  },
                  body: JSON.stringify({ ...param, id: currentRecord.id }),
                })
                  .then(response => {
                    if (response.ok) {
                      message.success('修改成功');
                      this.setState({ ...this.state, isNewPageModalVisible: false });
                    } else {
                      message.error('修改失败');
                    }
                  })
                  .catch(error => {
                    console.error(error);
                  })
                  .finally(() => {
                    formInstance.resetFields();
                    this.doLoad();
                  });
              } else {
                fetch('/api/entity-chart/new-entity-chart', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                  },
                  body: JSON.stringify(param),
                })
                  .then(response => {
                    if (response.ok) {
                      message.success('创建成功');
                      this.setState({ ...this.state, isNewPageModalVisible: false });
                    } else {
                      message.error('创建失败');
                    }
                  })
                  .catch(error => {
                    console.error(error);
                  })
                  .finally(() => {
                    formInstance.resetFields();
                    this.doLoad();
                  });
              }
            })
            .catch(errorInfo => {
              console.error(errorInfo);
            });
        }}
        onCancel={() => {
          const formInstance = this.newPageFormRef.current;
          formInstance.resetFields();
          this.setState({ ...this.state, isNewPageModalVisible: false });
        }}
      >
        <Form {...layout} ref={this.newPageFormRef} fields={tempFields}>
          <Form.Item
            label="名称"
            name="chartName"
            rules={[
              {
                required: true,
                whitespace: false,
                min: 4,
                max: 32,
                message: '请输入名称，4-32 个字符',
              },
            ]}
          >
            <Input placeholder="名称" />
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  render() {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        width: 50,
        ellipsis: true,
      },
      {
        title: '名称',
        dataIndex: 'chart_name',
        width: 250,
        ellipsis: true,
      },
      {
        title: '最后修改',
        width: 200,
        dataIndex: 'time',
        ellipsis: true,
      },
      {
        title: '操作',
        key: 'action',
        width: 250,
        ellipsis: true,
        render: (text, record) => {
          return (
            <Space size="small" align="center">
              <Button
                type="primary"
                onClick={() => {
                  this.showEditForm(record);
                }}
                icon={<SettingOutlined />}
              >
                修改参数
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  this.openDesigner(record);
                }}
                icon={<EditOutlined />}
              >
                编辑
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => {
                  this.doDelete(record);
                }}
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Space>
          );
        },
      },
    ];

    return (
      <Layout style={{ padding: '15px' }}>
        <Content
          className="site-layout-background"
          style={{
            padding: 15,
            margin: 0,
            minHeight: 280,
          }}
        >
          {this.renderNewChartForm()}
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={this.newChart} icon={<PlusOutlined></PlusOutlined>}>
              New Chart
            </Button>
          </Space>
          <Table
            size="middle"
            columns={columns}
            dataSource={this.state.tableData}
            bordered={true}
            pagination={this.state.pagination}
            onChange={this.handleTableChange}
          />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          <a href="https://github.com/craft-codeless-designer" target="_blank">
            <GithubOutlined />
            {'  '}
          </a>
          Craft Codeless Designer ©2021
        </Footer>
      </Layout>
    );
  }
}
