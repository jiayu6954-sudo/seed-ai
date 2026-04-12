# Seed AI — 项目上下文

## 项目身份
这是 `seed` / `devai` 项目本身的源代码仓库（AI 编码助手）。
工作目录：`D:\claude\devai`

---

## 数据集状态（必读）

### PlantVillage 数据集
| 项目 | 状态 |
|------|------|
| ZIP 文件 | **不存在 / 已删除（损坏）** |
| 解压图片 | **不存在** |
| 需要操作 | 重新下载 → 验证 → 解压 |

**下载方式（按优先级）**：

1. **Kaggle CLI**（需要 `~/.kaggle/kaggle.json`）：
   ```bash
   kaggle datasets download -d abdallahalidev/plantvillage-dataset \
     -p ./datasets/plant_village/ --unzip
   ```

2. **手动下载**：
   - 浏览器打开：https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset
   - 下载后放到：`./datasets/plant_village/`

**严禁行为**：
- ❌ 禁止使用 `tfds.load()` — 默认保存到 `C:\Users\...`，不可用
- ❌ 禁止创建新的 `download_plantvillage.py` — 已知会无限重下载
- ❌ 禁止后台进程下载（`subprocess.Popen`、`&`）
- ✅ 下载前先检查 `./datasets/plant_village/` 是否已有文件

---

## ML 项目结构（目标）

```
devai/
├── datasets/
│   └── plant_village/
│       ├── images/          ← 解压后的图片（38个类别文件夹）
│       └── *.zip            ← 原始压缩包
├── crop_project/
│   ├── crop_dataset/        ← 80/20 划分后的数据
│   ├── data_prepare.py
│   ├── train_crop.py
│   └── evaluate_crop.py
└── CLAUDE.md                ← 本文件
```

## 环境信息
- Python：3.11.9
- conda 环境：`crop_detection`（已创建，位于 E:\miniconda3\envs\）
- GPU：RTX 4070 Ti Super 16GB
- OS：Windows 11

## 激活环境命令
```bash
conda activate crop_detection
```

---

## 通用规则

### 文件路径
- 所有数据/模型/输出 → **项目目录内**（`./datasets/`、`./crop_project/`）
- 禁止写入系统目录：`C:\Users\`、`~/`、`%TEMP%`

### 下载/数据获取
- 下载前先 glob 检查目标目录
- 使用 `subprocess.run()`，不用 `subprocess.Popen()`
- 下载后验证文件完整性（zipfile.testzip() 或 md5）

### 执行顺序
每个步骤完成后等待用户确认再继续下一步。
