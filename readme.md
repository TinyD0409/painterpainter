![](.\src\static\oscar.png)

![](https://img.shields.io/badge/npm-v10.10.0-green.svg) ![](https://img.shields.io/badge/express-v4.16.4-green.svg)![](https://img.shields.io/badge/jimp-v0.5.4-green.svg) ![](https://img.shields.io/badge/socket.io-v2.1.1-green.svg) ![](https://img.shields.io/badge/websocket-v6.1.0-green.svg)

# Pixel Painter

### 主要功能

* 使用canvas绘制，以节省内存提升性能
* 使用websocket进行实时传输
* 使用express构建http服务器
* 使用ws模块构建websocket后端并且与express集成
* 后端使用buffer保存图片实时数据
* 后端自动保存图片状态，服务器重启也不会丢失
* 首次打开页面时，后端将图片转为png编码传给前端，以节省浏览，加快打开速度
* 取色功能
* 取色实时提示
* 缩放
* 移动

### 应用技术

##### 服务端方面

* express、node 搭建后端服务器
* 利用arraybuffer 转换为png图片节省流量
* websocket和socket.io进行信息传输
* 以及各种包的应用

##### 客户端（前端）方面

* 整体使用Vue框架开发
* 利用 canvas 在网页端绘制，节省性能，客户端更流畅
* 各种库的应用，更好更快的进行开发
* CSS3动画的应用

### 技术难点

* 浏览器放大canvas图像虚化的优化
* 鼠标点击位置的精确
* 拖拽功能
* 以鼠标原点为缩放原点
