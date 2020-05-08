import { message } from "antd";

export function copyText(text) {
  var currentFocus = document.activeElement; // 保存当前活动节点

  let input = document.createElement("input"); // 创建一个input标签
  document.body.appendChild(input); // 把标签添加给body
  input.style.opacity = 0; //设置input标签设置为透明(不可见)
  input.value = text; // 把需要复制的值放到input上

  // 记录当前滚动位置, 因为添加节点并选中的时候回影响页面滚动
  let scrollY = window.scrollY;

  input.focus(); // input节点获取焦点
  input.setSelectionRange(0, input.value.length); // 选中input框中的所有文字

  document.execCommand("copy", true); // 复制文字并获取结果

  currentFocus.focus(); // 之前活动节点获得焦点
  document.body.removeChild(input); // 删除添加的input节点

  // 页面滚动到之前位置
  window.scrollTo(0, scrollY);

  message.info("已复制到粘贴板");
}