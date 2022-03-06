import { CopyOutlined, DatabaseOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React from 'react';
import ccdLogo from '../assets/doc-imgs/ccd-icon.svg';
import EntityChartList from './EntityChartList';
import PageList from './PageList';
import './WorkSpace.scss';

/**
 * 整个应用的主入口
 * @author 大漠穷秋<damoqiongqiu@126.com>
 */
export default class WorkSpace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: 'dark',
      current: '1',
    };
  }

  handleClick = e => {
    this.setState({
      current: e.key,
    });
  };

  render() {
    return (
      <Layout>
        <Layout.Header className="header" style={{ padding: '0px 15px' }}>
          <div className="logo">
            <img src={ccdLogo} style={{ width: 32, marginTop: -7, marginRight: 7 }} alt="logo" />
            Craft Codeless Designer
          </div>
          <Menu theme={this.state.theme} mode="horizontal" defaultOpenKeys={['1']} onClick={this.handleClick} selectedKeys={[this.state.current]}>
            <Menu.Item key="1">
              <CopyOutlined />
              页面管理
            </Menu.Item>
            <Menu.Item key="2">
              <DatabaseOutlined />
              数据模型
            </Menu.Item>
          </Menu>
        </Layout.Header>
        <Layout
          style={{
            height: 'calc(100vh - 64px)',
          }}
        >
          {this.state.current === '1' && <PageList></PageList>}
          {this.state.current === '2' && <EntityChartList></EntityChartList>}
        </Layout>
      </Layout>
    );
  }
}
