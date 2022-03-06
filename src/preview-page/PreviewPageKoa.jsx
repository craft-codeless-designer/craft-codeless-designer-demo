import { message } from 'antd';
import { CraftDesigner } from 'craft-codeless-designer';
import { merge } from 'lodash';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * @class PreviewPageKoa
 *
 * PreviewPageKoa 仅仅展示，没有编辑功能。
 *
 * @author 大漠穷秋<damoqiongqiu@126.com>
 */
class PreviewPageKoa extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pageEntity: {
        id: uuidv4(),
        pid: '-1',
        pageData: '',
      },
    };
  }

  componentDidMount(prevProps, prevState, snapshot) {
    this.loadData();
  }

  /**
   * 如果传递了 id ，加载服务端数据。
   * @returns
   */
  loadData() {
    const {
      match: { params },
    } = this.props;

    if (!params.id) {
      message.error('没有传递页面 id 参数，无法加载页面。');
      return;
    }

    fetch(`/api/pages/${params.id}`)
      .then(response => {
        return response.json();
      })
      .then(json => {
        merge(this.state.pageEntity, json);
        //在数据库中当成 JSON字符串存储，这里需要把 JSON 字符串转成 JSON 对象
        this.state.pageEntity.pageData = JSON.parse(this.state.pageEntity.pageData);
        this.setState(
          {
            ...this.state,
            token: new Date().getTime(),
          },
          () => {
            console.log('Data loaded...', this.state);
          },
        );
        return this.state.pageEntity.pageData;
      });
  }

  render() {
    //只要给 CraftDesigner 传递 pageData 参数，它自己会反序列化成页面。
    const pageData = this.state.pageEntity.pageData;
    return <CraftDesigner pageData={pageData} showNavBar={false} showSiderBar={false} enabled={false}></CraftDesigner>;
  }
}

export default PreviewPageKoa;
