import { message } from 'antd';
import { CraftDesigner } from 'craft-codeless-designer';
import { merge } from 'lodash';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * @class DesignerPage
 *
 * DesignerPage 用来测试 CraftDesigner 的主要用法。
 *
 * @author 大漠穷秋<damoqiongqiu@126.com>
 */
class DesignerPage extends React.Component {
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

  /**
   * 导航条保存按钮回调函数
   * 把数据保存到服务端
   */
  onSaveData(jsonStr) {
    let postParam = merge({}, this.state.pageEntity, { pageData: JSON.parse(jsonStr) });
    console.log(postParam);

    window.localStorage.setItem('postParam', JSON.stringify(postParam));
    message.warn('在 window.localStorage 中缓存了一份数据供调试用');

    try {
      return fetch('/api/pages/update-pagedata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(postParam),
      })
        .then(response => {
          if (response.ok) {
            console.log(response);
            message.success('页面保存成功...');
          } else {
            message.error(`保存失败...${response}`);
          }
          return response.json();
        })
        .catch(err => console.log('Request Failed', err));
    } catch (error) {
      message.error(error);
      console.error(error);
    }
  }

  /**
   * 导航条预览按钮回调
   * @param {*} data
   */
  onPreview() {
    const {
      match: { params },
    } = this.props;

    window.open(`/preview-koa/${params.id ? params.id : ''}`, '_blank').focus();
    // 如果你正在使用基于 React-Bootstrap 的组件，请使用以下路由预览页面，此页面中导入了 bootstrap 基础 CSS 。
    // window.open(`/preview-bootstrap`, '_blank').focus();
  }

  render() {
    //只要给 CraftDesigner 传递 pageData 参数，它自己会反序列化成页面。
    const pageData = this.state.pageEntity.pageData;
    return (
      <CraftDesigner
        onSaveData={this.onSaveData.bind(this)}
        onLoadData={this.loadData.bind(this)}
        onPreview={this.onPreview.bind(this)}
        pageData={pageData}
      ></CraftDesigner>
    );
  }
}

export default DesignerPage;
