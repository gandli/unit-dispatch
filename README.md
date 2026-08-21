# unit-dispatch · 简道云用车审批 Bot

简道云「用车申请审批」场景的聊天机器人服务。Express + Vercel AI SDK，对接简道云表单 API 读取员工 / 车辆 / 司机数据，由 LLM 驱动用车申请、审批调度、派车响应、状态查询等对话流程。

> 配套前端：[vehicle-management-chatui](https://github.com/gandli/vehicle-management-chatui)（ChatUI 界面，调用本服务的 `/api/chat`）。

## 功能

- 💬 **AI 对话**：`POST /api/chat` — 注入员工 / 车辆 / 司机实时数据作为上下文，流式返回
- 📝 **用车申请**：`POST /api/requests` — Zod 校验后写入简道云表单
- 🚗 **状态查询**：`GET /api/vehicles/status`、`GET /api/drivers/status`
- ❤️ **健康检查**：`GET /health`

## 配置

环境变量（`.env` 或进程注入）：

```text
PORT=3000
JIANDAOYUN_APP_ID=          # 简道云应用 ID
JIANDAOYUN_API_KEY=         # 简道云 API Key
EMPLOYEE_DIRECTORY_FORM_ID= # 员工通讯录表单 ID
VEHICLE_INFO_FORM_ID=       # 车辆信息表单 ID
DRIVER_INFO_FORM_ID=        # 司机信息表单 ID
OPENAI_API_KEY=             # LLM 调用（@ai-sdk/openai）
```

## 运行

```bash
npm install

npm run dev     # 开发模式（tsx watch）
npm start       # 生产运行
npm run build   # tsc 编译
```

默认监听 `:3000`。

## 技术栈

Express · Vercel AI SDK (`ai` / `@ai-sdk/openai` / `@ai-sdk/anthropic`) · Axios · Zod · TypeScript
