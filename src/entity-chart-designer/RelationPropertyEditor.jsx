import { Button, Form, message, Select, Space } from 'antd';
import { Relation } from 'ice-entity-designer';
import React, { Component } from 'react';

/**
 * @author 大漠穷秋<damoqiongqiu@126.com>
 */
export default class RelationPropertyEditor extends Component {
  ice; //ice 实例
  relationFormRef = React.createRef();

  constructor(props) {
    super(props);
    this.ice = props.ice;
    this.state = {
      entities: [],
      relationType: 'one-to-one', //one-to-one, one-to-many, many-to-one, many-to-many
      targetEntityProperties: [], //one-to-one 的时候引用的目标 Entity 的所有属性
    };
  }

  /**
   * @see https://reactjs.org/docs/react-component.html#static-getderivedstatefromprops
   */
  static getDerivedStateFromProps(props, state) {
    let ice = props.ice;
    let allComponents = ice.childNodes;
    let entities = [];
    allComponents.map(item => {
      item.constructor.name === 'Entity' && entities.push(item);
    });
    state = {
      ...state,
      entities: [...entities],
    };
    return state;
  }

  doSave() {
    const formInstance = this.relationFormRef.current;
    formInstance
      .validateFields()
      .then(values => {
        if (values.fromEntity === values.toEntity) {
          message.error('Entity 自己不能引用自己');
          return;
        }

        let param = {
          left: 0,
          top: 0,
          startPoint: [300, 300],
          endPoint: [400, 400],
          style: {
            strokeStyle: '#08ee00',
            fillStyle: '#008000',
            lineWidth: 2,
          },
          arrow: 'end',
          links: { start: { id: values.fromEntity, position: 'B' }, end: { id: values.toEntity, position: 'B' } },
          relationType: values.relationType,
        };

        //只有 one-to-one 时需要设置引用字段
        if (values.relationType === 'one-to-one') {
          param.referencedColumnName = values.toProperty;
        }

        console.log(param);

        let relation = new Relation(param);
        this.ice.addChild(relation);
        this.props.onSave && this.props.onSave();
      })
      .catch(errorInfo => {
        console.error(errorInfo);
        message.error(JSON.stringify(errorInfo));
      });
  }

  onRelationTypeChange(value) {
    this.setState({
      ...this.state,
      relationType: value,
    });
  }

  onTargetEntityChange(value) {
    for (let i = 0; i < this.state.entities.length; i++) {
      let item = this.state.entities[i];
      if (item.state.id === value) {
        this.setState(
          {
            ...this.state,
            targetEntityProperties: JSON.parse(JSON.stringify(item.state.fields)),
          },
          () => {
            console.log(this.state.targetEntityProperties);
          },
        );
        break;
      }
    }
  }

  render() {
    return (
      <>
        <Form layout="vertical" ref={this.relationFormRef} initialValues={{ relationType: this.state.relationType }}>
          <Form.Item
            name="relationType"
            label="Relation Type"
            rules={[
              {
                required: true,
                whitespace: false,
                message: '请选择关系的类型',
              },
            ]}
          >
            <Select onChange={this.onRelationTypeChange.bind(this)}>
              <Select.Option value="one-to-one">one-to-one</Select.Option>
              <Select.Option value="one-to-many">one-to-many</Select.Option>
              <Select.Option value="many-to-one">many-to-one</Select.Option>
              <Select.Option value="many-to-many">many-to-many</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="fromEntity"
            label="From Entity"
            rules={[
              {
                required: true,
                whitespace: false,
                message: '请选择起点 Entity',
              },
            ]}
          >
            <Select>
              {this.state.entities.map(item => {
                return <Select.Option value={item.state.id}>{item.state.entityName}</Select.Option>;
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name="toEntity"
            label="To Entity"
            rules={[
              {
                required: true,
                whitespace: false,
                message: '请选择终点 Entity',
              },
            ]}
          >
            <Select onChange={this.onTargetEntityChange.bind(this)}>
              {this.state.entities.map(item => {
                return <Select.Option value={item.state.id}>{item.state.entityName}</Select.Option>;
              })}
            </Select>
          </Form.Item>
          {this.state.relationType === 'one-to-one' && (
            <Form.Item
              name="toProperty"
              label="To Property (Reference this property when one-to-one.)"
              rules={[
                {
                  required: true,
                  whitespace: false,
                  message: '请选择引用的属性',
                },
              ]}
            >
              <Select>
                {this.state.targetEntityProperties.map((item, index) => {
                  return <Select.Option value={item.name}>{item.name}</Select.Option>;
                })}
              </Select>
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" onClick={this.doSave.bind(this)}>
              Save
            </Button>
          </Form.Item>
        </Form>
        <Space
          direction="vertical"
          wrap
          size={[2, 2]}
          style={{
            marginTop: 5,
          }}
        >
          <p>1. 关联关系将会用于自动生成实体类、CRUD接口、SQL 脚本，错误的关联关系会导致自动生成的代码和 SQL 语句无法运行。</p>
          <p>2. 当前版本生成的 Schema 只支持 MySQL，后续版本会升级，支持更多数据库。</p>
        </Space>
      </>
    );
  }
}
