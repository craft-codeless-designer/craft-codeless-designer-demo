import 'antd-mobile/dist/antd-mobile.css';
import 'antd/dist/antd.css';
import EntityChartDesigner from 'entity-chart-designer';
import PreviewPageKoa from 'preview-page/PreviewPageKoa';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import DesignerPage from './designer-page/DesignerPage';
import WorkSpace from './workspace/WorkSpace';

const AppRoute = ({ component: Component, layout: Layout, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      <Layout>
        <Component {...props} />
      </Layout>
    )}
  />
);

const SimpleLayout = props => {
  return <>{props.children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <>
        <Switch>
          <AppRoute exact path={'/'} layout={SimpleLayout} component={WorkSpace}></AppRoute>
          <AppRoute exact path={'/page-list'} layout={SimpleLayout} component={WorkSpace}></AppRoute>
          <AppRoute exact path={'/page/:id?'} layout={SimpleLayout} component={PreviewPageKoa}></AppRoute>
          <AppRoute exact path={'/design/:id?'} layout={SimpleLayout} component={DesignerPage}></AppRoute>
          <AppRoute path={'/preview-koa/:id'} layout={SimpleLayout} component={PreviewPageKoa}></AppRoute>
          <AppRoute path={'/entity-chart-designer/:id?'} layout={SimpleLayout} component={EntityChartDesigner}></AppRoute>
          <AppRoute path="*" layout={SimpleLayout} component={PreviewPageKoa}></AppRoute>
        </Switch>
      </>
    </BrowserRouter>
  );
}

export default App;
