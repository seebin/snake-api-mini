import React from "react";
import SnakeHeader from "./base/header";
import SnakeContent from "./base/content";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { routes } from "./router";
import { Layout } from "antd";

const { Header, Footer, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout>
        <Header
          className="header"
          style={{
            position: "fixed",
            zIndex: 1,
            width: "100%",
            padding: "0 20px",
          }}
        >
          <SnakeHeader />
        </Header>
        <Content>
          <SnakeContent>
            <Switch>
              {routes.map((route, i) => (
                <RouteWithSubRoutes key={route.path} {...route} />
              ))}
            </Switch>
          </SnakeContent>
        </Content>
        <Footer style={{ textAlign: "center", padding: "10px" }}>
          技术支持：seebin | 钉钉交流群:21958681
        </Footer>
      </Layout>
    </Router>
  );
}

function RouteWithSubRoutes(route) {
  document.title = route.title;
  return (
    <Route
      exact={route.exact}
      path={route.path}
      render={(props) => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}

export default App;
