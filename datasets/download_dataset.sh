#!/usr/bin/env bash
# PlantVillage 数据集下载脚本 — 断点续传，保存到项目目录
# 运行: bash datasets/download_dataset.sh
# 下载完成后: bash datasets/extract_dataset.sh

set -e
DEST="d:/claude/devai/datasets/plant_village"
ZIP="$DEST/Plant_leaf_diseases_dataset_without_augmentation.zip"
# Kaggle 直链 (需要已登录 Kaggle 浏览器会话，或配置 ~/.kaggle/kaggle.json)
URL="https://www.kaggle.com/api/v1/datasets/download/abdallahalidev/plantvillage-dataset"

mkdir -p "$DEST"

echo "[INFO] 目标路径: $ZIP"
echo "[INFO] 开始下载 (~560MB)..."

# -C - = 断点续传  -L = 跟随重定向  -o = 输出文件  --progress-bar = 进度条
curl -L --progress-bar -C - \
  --user "${KAGGLE_USERNAME}:${KAGGLE_KEY}" \
  -o "$ZIP" \
  "$URL"

echo ""
echo "[INFO] 验证文件完整性..."
python -c "
import zipfile, sys
try:
    with zipfile.ZipFile('$ZIP') as zf:
        bad = zf.testzip()
        if bad:
            print(f'[ERROR] 损坏文件: {bad}'); sys.exit(1)
        print(f'[OK] ZIP完整，共 {len(zf.namelist())} 个文件')
except Exception as e:
    print(f'[ERROR] {e}'); sys.exit(1)
"
