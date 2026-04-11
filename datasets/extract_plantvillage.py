"""
Plant Village 数据集解压脚本
- 源 ZIP: datasets/plant_village/Plant_leaf_diseases_dataset_without_augmentation.zip
- 目标:   datasets/plant_village/images/
- 运行:   python datasets/extract_plantvillage.py
"""

import zipfile
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ZIP_PATH   = os.path.join(SCRIPT_DIR, "plant_village",
                          "Plant_leaf_diseases_dataset_without_augmentation.zip")
OUT_DIR    = os.path.join(SCRIPT_DIR, "plant_village", "images")

def main():
    if not os.path.exists(ZIP_PATH):
        print(f"[ERROR] ZIP not found: {ZIP_PATH}")
        sys.exit(1)

    if os.path.isdir(OUT_DIR) and any(os.scandir(OUT_DIR)):
        print(f"[SKIP] Already extracted → {OUT_DIR}")
        count = sum(len(fs) for _, _, fs in os.walk(OUT_DIR))
        print(f"       {count} files present")
        return

    os.makedirs(OUT_DIR, exist_ok=True)
    zip_size = os.path.getsize(ZIP_PATH) / (1024 ** 2)
    print(f"[INFO] Extracting {zip_size:.0f} MB → {OUT_DIR}")

    with zipfile.ZipFile(ZIP_PATH, "r") as zf:
        members = zf.namelist()
        total   = len(members)
        for i, name in enumerate(members, 1):
            zf.extract(name, OUT_DIR)
            if i % 500 == 0 or i == total:
                pct = i / total * 100
                print(f"       {i}/{total}  ({pct:.1f}%)", end="\r", flush=True)

    print(f"\n[DONE] Extracted {total} files → {OUT_DIR}")

    # 统计类别
    categories = [d for d in os.listdir(OUT_DIR)
                  if os.path.isdir(os.path.join(OUT_DIR, d))]
    if categories:
        print(f"[INFO] {len(categories)} disease categories found")

if __name__ == "__main__":
    main()
