import { Button, Form, message, Select } from 'antd';
import React, { Component } from 'react';

/**
 * @author 大漠穷秋<damoqiongqiu@126.com>
 */
export default class RelationPropertyEditor extends Component {
  relationFormRef = React.createRef();

  constructor(props) {
    super(props);
    this.canvas = props.canvas;
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
    let canvas = props.canvas;
    let allObjects = canvas.getObjects();
    let entities = [];
    allObjects.map((item, index) => {
      item.type === 'Entity' && entities.push(item);
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
        console.log(values);
        if (values.fromEntity === values.toEntity) {
          message.error('Entity 自己不能引用自己');
          return;
        }
        //创建 Relation 对象
        let fabric = window.fabric;
        let relation = new fabric.Relation([500, 500, 300, 300], {
          stroke: '#000',
          strokeWidth: 3,
          fill: '#000',
          arrowType: 'end',
          relationType: 'many-to-many',
        });
        this.canvas.add(relation);

        this.state.entities.map((entity, index) => {
          if (entity.title === values.fromEntity) {
            relation.setLinkFrom(entity);
          } else if (entity.title === values.toEntity) {
            relation.setLinkTo(entity);
          }
        });

        //再次校验两端是否都已经连接
        if (!relation.linkFrom || !relation.linkTo) {
          console.warn('连接关系必须有两个端点');
          relation.removeLinkFrom();
          relation.removeLinkTo();
          this.canvas.remove(relation);
        }

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
      if (item.title === value) {
        this.setState(
          {
            ...this.state,
            targetEntityProperties: JSON.parse(JSON.stringify(item.fields)),
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
            {this.state.entities.map((item, index) => {
              return <Select.Option value={item.title}>{item.title}</Select.Option>;
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
            {this.state.entities.map((item, index) => {
              return <Select.Option value={item.title}>{item.title}</Select.Option>;
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
    );
  }
}
