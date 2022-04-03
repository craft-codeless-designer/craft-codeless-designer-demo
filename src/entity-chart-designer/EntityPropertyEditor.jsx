import { Button, Checkbox, Form, Input, InputNumber, message, Popconfirm, Select, Space, Table } from 'antd';
import 'antd/dist/antd.css';
import { Entity } from 'ice-entity-designer';
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
  ice; //ice 实例
  entityNameFormRef = React.createRef();

  constructor(props) {
    super(props);
    this.ice = props.ice;
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
        dataIndex: 'primary',
        editable: true,
        inputType: 'Checkbox',
        render: (text, record, index) => {
          return <p>{text + ''}</p>;
        },
      },
      {
        title: 'Not Null?',
        dataIndex: 'nullable',
        editable: true,
        inputType: 'Checkbox',
        render: (text, record, index) => {
          return <p>{text + ''}</p>;
        },
      },
      {
        title: 'Auto Increment?',
        dataIndex: 'generated',
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

    if (this.props.currentEntity) {
      let { entityName, fields } = this.props.currentEntity.state;
      let len = fields.length;
      this.state = {
        entityName: entityName,
        dataSource: [...fields],
        count: len,
      };
    } else {
      this.state = {
        entityName: '',
        dataSource: [],
        count: 0,
      };
    }
  }

  handleDelete(key) {
    let dataSource = [...this.state.dataSource];
    dataSource = dataSource.filter(item => item.key !== key);
    let len = dataSource.length;
    this.setState({
      dataSource: dataSource,
      count: len,
    });
  }

  handleAdd() {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      name: `Column Name (required)`,
      type: 'varchar',
      length: '128',
      primary: false,
      nullable: false,
      generated: false,
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  }

  handleCommit(row) {
    const newArr = [...this.state.dataSource];
    const index = newArr.findIndex(item => row.key === item.key);
    const item = newArr[index];
    newArr.splice(index, 1, { ...item, ...row });
    let len = newArr.length;
    this.setState({
      dataSource: newArr,
      count: len,
    });
  }

  doSave() {
    const formInstance = this.entityNameFormRef.current;
    formInstance
      .validateFields()
      .then(values => {
        let entityName = values.entityName;
        //校验规则-1：同一个数据库中不允许表名重复，所以这里的 entityName 必须唯一
        let componentList = this.ice.childNodes;
        for (let i = 0; i < componentList.length; i++) {
          const component = componentList[i];
          if (component !== this.props.currentEntity && component.state.entityName === entityName) {
            message.error('数据库中不允许重复的表名， Entity Name 必须唯一。');
            return;
          }
        }

        //校验规则-2：获取表格中的数据
        if (!this.state.dataSource || !this.state.dataSource.length) {
          message.error('Entity 至少需要定义一个字段');
          return;
        }

        //TODO:校验规则-3，在同一个实体类中，字段名称不能重复（因为数据库中同一个表不能有重复的字段名称）
        const fields = [];
        this.state.dataSource.map((item, index) => {
          let field = {
            name: item.name,
            type: item.type,
            primary: item.primary,
            generated: item.generated,
            nullable: !item.nullable,
          };
          if (item.length) {
            field.length = parseInt(item.length);
          }
          fields.push(field);
        });

        //如果 this.props 上存在 currentEntity ，表示为更新操作，否则为新增操作
        if (this.props.currentEntity) {
          this.props.currentEntity.setState({
            entityName: entityName,
            fields: [...fields],
          });
        } else {
          let entity = new Entity({
            left: Math.floor(100 * Math.random()),
            top: Math.floor(100 * Math.random()),
            width: 150,
            height: 200,
            showMinBoundingBox: true,
            showMaxBoundingBox: true,
            entityName: entityName,
            fields: [...fields],
          });
          this.ice.addChild(entity);
        }

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
    const { entityName, dataSource } = this.state;

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
            label="Entity Name"
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
            initialValue={entityName}
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
        <Space
          direction="vertical"
          wrap
          size={[2, 2]}
          style={{
            marginTop: 5,
          }}
        >
          <p>1. EntityName 将会用于生成实体类、CRUD接口、SQL 脚本，建议采用规范的大驼峰法则命名，否则自动生成的代码和 SQL 语句无法运行。</p>
          <p>2. 当前版本生成的 Schema 只支持 MySQL，后续版本会升级，支持更多数据库。</p>
        </Space>
      </div>
    );
  }
}

export default EntityPropertyEditor;
