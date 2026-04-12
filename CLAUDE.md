# Seed AI — 项目上下文

## 项目身份
这是 `seed` / `devai` 项目本身的源代码仓库（AI 编码助手）。
工作目录：`D:\claude\devai`

---

## 数据集状态（必读）

### PlantVillage 数据集
| 项目 | 状态 |
|------|------|
| 原始 ZIP | `./datasets/plant_village/archive.zip`（2.1GB，完整）|
| **解压图片** | ✅ **已就绪** |
| 图片路径 | `./datasets/plant_village/images/plantvillage dataset/color/` |
| 类别数 | **38 类** |
| 总图片数 | **54,305 张** |

**图片路径结构**：
```
datasets/plant_village/images/plantvillage dataset/color/
├── Apple___Apple_scab/       (630张)
├── Apple___Black_rot/
├── Apple___Cedar_apple_rust/
├── Apple___healthy/
├── ...                       (共38个类别)
└── Tomato___Yellow_Leaf_Curl_Virus/
```

**严禁行为**：
- ❌ 禁止使用 `tfds.load()` — 默认保存到 `C:\Users\...`，不可用
- ❌ 禁止创建新的 `download_plantvillage.py` — 已有数据，无需下载
- ❌ 禁止任何形式的重新下载（数据已完整）
- ✅ 直接使用 `./datasets/plant_village/images/plantvillage dataset/color/` 作为数据源

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
