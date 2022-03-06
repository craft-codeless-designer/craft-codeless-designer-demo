import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined, GithubOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Form, Input, Layout, message, Modal, Select, Space, Table } from 'antd';
import React, { Component } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * PageList 页面列表
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

export default class PageList extends Component {
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
    this.newPage = this.newPage.bind(this);
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
    window.open(`/design/${record.id}`, '_blank').focus();
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
        fetch('/api/pages/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
          },
          body: JSON.stringify({ pageId: record.page_id }),
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
    fetch('/api/pages', {
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

  newPage() {
    this.setState({
      ...this.state,
      isNewPageModalVisible: true,
      currentRecord: null,
    });
  }

  renderNewPageModal() {
    const { currentRecord } = this.state;
    let tempFields = [];
    if (currentRecord) {
      tempFields = [
        {
          name: 'id',
          value: currentRecord.id,
        },
        {
          name: 'pageId',
          value: currentRecord.pageId,
        },
        {
          name: 'pageName',
          value: currentRecord.page_name,
        },
        {
          name: 'pageRoute',
          value: currentRecord.page_route,
        },
        {
          name: 'deviceType',
          value: currentRecord.device_type,
        },
      ];
    }

    return (
      <Modal
        title="新建/编辑页面"
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
                pageId: uuidv4(),
                pageData: '',
              };

              if (currentRecord) {
                fetch('/api/pages/update-pageinfo', {
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
                      this.doLoad();
                    } else {
                      message.error('修改失败');
                    }
                    formInstance.resetFields();
                  })
                  .catch(error => {
                    console.error(error);
                    formInstance.resetFields();
                  });
              } else {
                fetch('/api/pages/new-page', {
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
                      this.doLoad();
                    } else {
                      message.error('创建失败');
                    }
                    formInstance.resetFields();
                  })
                  .catch(error => {
                    console.error(error);
                    formInstance.resetFields();
                  });
              }
            })
            .catch(errorInfo => {
              console.error(errorInfo);
              // formInstance.resetFields();
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
            label="页面名称"
            name="pageName"
            rules={[
              {
                required: true,
                whitespace: false,
                min: 4,
                max: 32,
                message: '请输入页面名称，4-32 个字符',
              },
            ]}
          >
            <Input placeholder="页面名称，方便找到你的页面" />
          </Form.Item>
          {/* <Form.Item
            label="页面路径"
            name="pageRoute"
            rules={[
              {
                required: true,
                whitespace: false,
                min: 1,
                max: 128,
                pattern: /^[a-zA-Z0-9_\-\/]+$/,
                message: '请输入页面路径，只能包含字母、数值、下划线、中划线、斜线，例如： /ccd/pages/1 ',
              },
            ]}
          >
            <Input placeholder="页面路径，可以通过此路径进行页面跳转" />
          </Form.Item> */}
          <Form.Item
            name="deviceType"
            label="设备类型"
            rules={[
              {
                required: true,
                message: '请选择设备类型',
              },
            ]}
          >
            <Select placeholder="设备类型，目前支持 PC 端和 H5 两种类型的页面设计" allowClear={false}>
              <Select.Option value="pc">PC</Select.Option>
              <Select.Option value="h5">H5</Select.Option>
            </Select>
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
        dataIndex: 'page_name',
        width: 250,
        ellipsis: true,
      },
      {
        title: '页面路径',
        dataIndex: 'page_route',
        ellipsis: true,
      },
      // {
      //   title: '副本数',
      //   width: 100,
      //   dataIndex: 'count',
      //   ellipsis: true,
      // },
      {
        title: '最后修改',
        width: 200,
        dataIndex: 'time',
        ellipsis: true,
      },
      {
        title: '设备',
        dataIndex: 'device_type',
        width: 80,
        ellipsis: true,
      },
      {
        title: '操作',
        key: 'action',
        width: 310,
        ellipsis: true,
        render: (text, record) => {
          return (
            <Space size="small" align="center">
              <Button
                type="primary"
                onClick={() => {
                  this.showEditForm(record);
                }}
                icon={<SettingOutlined></SettingOutlined>}
              >
                修改参数
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  this.openDesigner(record);
                }}
                icon={<EditOutlined></EditOutlined>}
              >
                编辑
              </Button>
              <Button
                type="primary"
                danger
                onClick={() => {
                  this.doDelete(record);
                }}
                icon={<DeleteOutlined></DeleteOutlined>}
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
          {this.renderNewPageModal()}
          <Space style={{ marginBottom: 16 }}>
            <Button type="primary" onClick={this.newPage} icon={<PlusOutlined></PlusOutlined>}>
              New Page
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
