import { Home } from "./pages/home";
import { BaseData } from "./pages/base-data";
import { Prefix } from "./pages/prefix";
import { Project } from "./pages/project";
import { Document } from "./pages/document";

export const routes = [
  {
    path: "/",
    component: Home,
    exact: true,
    title: "接口列表"
  },
  {
    path: "/base-data",
    component: BaseData,
    title: "响应数据维护"
    // routes: [
    //   {
    //     path: "/tacos/bus",
    //     component: Bus
    //   }
    // ]
  },
  {
    path: "/prefix",
    component: Prefix,
    title: "接口前缀维护"
  },
  {
    path: "/project",
    component: Project,
    title: "项目配置维护"
  },
  {
    path: "/document",
    component: Document,
    title: "文档说明"
  },
];
