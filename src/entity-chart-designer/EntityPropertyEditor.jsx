import { Button, Checkbox, Form, Input, InputNumber, message, Popconfirm, Select, Space, Table } from 'antd';
import 'antd/dist/antd.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import './index.scss';

/**
 * @author 大漠穷秋<damoqiongqiu@126.com>
 */

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({ title, editable, inputType, rules, children, dataIndex, record, handleCommit, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const commitEdit = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleCommit({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  //https://dev.mysql.com/doc/refman/8.0/en/data-types.html
  const mysqlDataType = [
    'bigint',
    'binary',
    'bit',
    'blob',
    'bool',
    'boolean',
    'char',
    'date',
    'datetime',
    'decimal',
    'double',
    'enum',
    'float',
    'int',
    'longblob',
    'longtext',
    'mediumblob',
    'mediumint',
    'mediumtext',
    'numeric',
    'real',
    'set',
    'smallint',
    'text',
    'time',
    'timestamp',
    'tinyblob',
    'tinyint',
    'tinytext',
    'varbinary',
    'varchar',
    'year',
  ];
  const getInput = () => {
    if (inputType === 'Select') {
      return (
        <Select
          ref={inputRef}
          onChange={commitEdit}
          onBlur={commitEdit}
          showSearch
          placeholder="Search to Select"
          optionFilterProp="children"
          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          filterSort={(optionA, optionB) => optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())}
        >
          {mysqlDataType.map((item, index) => {
            return (
              <Select.Option key={dataIndex + '-' + index} value={item}>
                {item}
              </Select.Option>
            );
          })}
        </Select>
      );
    } else if (inputType === 'Checkbox') {
      return <Checkbox ref={inputRef} onChange={commitEdit} onBlur={commitEdit}></Checkbox>;
    } else if (inputType === 'Input') {
      return <Input ref={inputRef} onPressEnter={commitEdit} onBlur={commitEdit} />;
    } else if (inputType === 'InputNumber') {
      return <InputNumber ref={inputRef} onPressEnter={commitEdit} onBlur={commitEdit} />;
    }
  };

  let childNode = children;
  if (editable) {
    if (editing) {
      childNode =
        inputType === 'Checkbox' ? (
          <Form.Item
            style={{
              margin: 0,
              paddingRight: 24,
            }}
            name={dataIndex}
            valuePropName="checked"
            rules={rules ? [...rules] : []}
          >
            {getInput()}
          </Form.Item>
        ) : (
          <Form.Item
            style={{
              margin: 0,
              paddingRight: 24,
            }}
            name={dataIndex}
            rules={rules ? [...rules] : []}
          >
            {getInput()}
          </Form.Item>
        );
    } else {
      childNode = (
        <div
          className="editable-cell-value-wrap"
          style={{
            margin: 0,
            paddingRight: 24,
          }}
          onClick={toggleEdit}
        >
          {children}
        </div>
      );
    }
  }
  return <td {...restProps}>{childNode}</td>;
};

class EntityPropertyEditor extends React.Component {
  entityNameFormRef = React.createRef();
  constructor(props) {
    super(props);
    this.canvas = props.canvas;
    this.columns = [
      {
        title: 'Column Name',
        dataIndex: 'name',
        width: '30%',
        editable: true,
        inputType: 'Input',
        rules: [
          {
            required: true,
          },
        ],
      },
      {
        title: 'Type',
        dataIndex: 'type',
        editable: true,
        inputType: 'Select',
      },
      {
        title: 'Length',
        dataIndex: 'length',
        editable: true,
        inputType: 'InputNumber',
      },
      {
        title: 'PK?',
        dataIndex: 'isPrimary',
        editable: true,
        inputType: 'Checkbox',
        render: (text, record, index) => {
          return <p>{text + ''}</p>;
        },
      },
      {
        title: 'Not Null?',
        dataIndex: 'notNull',
        editable: true,
        inputType: 'Checkbox',
        render: (text, record, index) => {
          return <p>{text + ''}</p>;
        },
      },
      {
        title: 'Auto Increment?',
        dataIndex: 'autoIncre',
        editable: true,
        inputType: 'Checkbox',
        render: (text, record, index) => {
          return <p>{text + ''}</p>;
        },
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (_, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];
    this.state = {
      dataSource: [],
      count: 0,
    };
  }

  handleDelete(key) {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter(item => item.key !== key),
    });
  }

  handleAdd() {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      name: `Column Name (required)`,
      type: 'varchar',
      length: '128',
      isPrimary: false,
      notNull: false,
      autoIncre: false,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  }

  handleCommit(row) {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    this.setState({
      dataSource: newData,
    });
  }

  doSave() {
    //TODO:提示，save 动作将会删除原有的所有内容。
    //获取Form中的数据
    const formInstance = this.entityNameFormRef.current;
    formInstance
      .validateFields()
      .then(values => {
        let entityName = values.entityName;
        //校验：同一个数据库中不允许表名重复，所以这里的 entityName 必须唯一
        let allObjects = this.canvas.getObjects();
        for (let index = 0; index < allObjects.length; index++) {
          const element = allObjects[index];
          if (element.title === entityName) {
            message.error('数据库中不允许重复的表名， Entity Name 必须唯一。');
            return;
          }
        }

        //校验：获取表格中的数据
        if (!this.state.dataSource || !this.state.dataSource.length) {
          message.error('Entity 至少需要定义一个字段');
          return;
        }

        //TODO:校验，在同一个实体类中，字段名称不能重复
        let fields = [];
        this.state.dataSource.map((item, index) => {
          let field = {
            name: item.name,
            type: item.type,
            primary: item.isPrimary,
            generated: item.autoIncre,
            nullable: !item.notNull,
          };
          if (item.length) {
            field.length = parseInt(item.length);
          }
          fields.push(field);
        });

        let fabric = window.fabric;
        let newEntity = new fabric.Entity([], {
          width: 200,
          height: 100,
          fill: '#fee',
          stroke: '#000',
          padding: 5,
          linkable: true,
          title: entityName,
          fields: [...fields],
        });
        this.canvas.add(newEntity);

        formInstance.resetFields();
        this.setState({
          ...this.state,
          dataSource: [],
        });

        this.props.onSave && this.props.onSave();
      })
      .catch(errorInfo => {
        console.error(errorInfo);
        message.error(JSON.stringify(errorInfo));
      });
  }

  render() {
    const { dataSource } = this.state;

    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          inputType: col.inputType,
          rules: col.rules,
          dataIndex: col.dataIndex,
          title: col.title,
          handleCommit: this.handleCommit.bind(this),
        }),
      };
    });
    return (
      <div>
        <Form
          {...{
            labelCol: {
              span: 24,
            },
            wrapperCol: {
              span: 24,
            },
          }}
          layout="vertical"
          ref={this.entityNameFormRef}
        >
          <Form.Item
            label="Entity Name（对应数据库中的表名）"
            name="entityName"
            rules={[
              {
                required: true,
                whitespace: false,
                min: 4,
                max: 32,
                message: '请输入 Entity 名称，4-12 个英文字符，建议大驼峰法则命名，如：User',
              },
            ]}
          >
            <Input placeholder="请输入实体名称，4-12 个英文字符，建议大驼峰法则命名，如：User" />
          </Form.Item>
        </Form>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          size="small"
        />
        <Space
          wrap
          size={[8, 16]}
          style={{
            marginTop: 16,
          }}
        >
          <Button onClick={this.handleAdd.bind(this)} type="primary">
            Add Property
          </Button>
          <Button onClick={this.doSave.bind(this)} type="primary">
            Save
          </Button>
        </Space>
      </div>
    );
  }
}

export default EntityPropertyEditor;
