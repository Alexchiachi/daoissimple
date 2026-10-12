#!/usr/bin/env python3
"""
深山的幸福道場 · 一鍵建置與自動推送腳本 (tools/push.py)
自動執行繁簡同步建置 (tools/build_zhcn.py)、Git Commit 與 SSH 免密推送。
"""

import subprocess
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

def run(cmd):
    res = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True)
    if res.returncode != 0:
        print(f"❌ 執行失敗: {' '.join(cmd)}\n{res.stderr.strip()}", file=sys.stderr)
        return False
    if res.stdout.strip():
        print(res.stdout.strip())
    return True

def main():
    commit_msg = sys.argv[1] if len(sys.argv) > 1 else "自動更新深山的幸福道場門戶與內容"
    print("⚡ [步驟 1/3] 執行繁簡在地化同步...")
    subprocess.run([sys.executable, str(ROOT / "tools" / "build_zhcn.py")], cwd=ROOT)

    print("📦 [步驟 2/3] 暫存變更並建立 Commit...")
    run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", commit_msg], cwd=ROOT)

    print("🚀 [步驟 3/3] 推送至 GitHub (main 分支)...")
    res = subprocess.run(["git", "push", "origin", "main"], cwd=ROOT, text=True, capture_output=True)
    if res.returncode == 0:
        print("🎉 成功推送到 GitHub！GitHub Pages CI/CD 將自動發布上線。")
    else:
        print(f"⚠️ 推送失敗或遠端倉庫尚未建立：\n{res.stderr.strip()}", file=sys.stderr)
        print("\n👉 請確認已在 GitHub 建立名為 daoissimple 的空倉庫：https://github.com/new")

if __name__ == "__main__":
    main()
