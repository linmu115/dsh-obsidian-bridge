# 副本浏览器入口修复

0.3.3-rc2.10：默认浏览器定时器显式绑定 globalThis，避免作为 Runtime 成员调用时出现 Illegal invocation，导致引用及会话贴纸界面初始化中断。自定义注入定时器仍按原契约工作。增加真实接收者回归，类型检查、打包与完整测试通过。

## 安装验证

先提交本地源码，再安装到 0.1.5-rc.2 副本。实际宿主与浏览器验证回执位于 D:/AI/DeepSeekHarness-Plugin/artifacts/knowledge-network-rc2-20260914/client-fix，安装结果另行记录。旧数据迁移由用户选择会话后操作；影响传播只准备用户选中的重答，不自动发送或运行模型。
