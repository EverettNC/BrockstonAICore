#!/usr/bin/env python3
"""
Download Wav2Lip pretrained models and dependencies for BROCKSTON
"""

import urllib.request
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent
WAV2LIP_DIR = PROJECT_ROOT / "brockston_research" / "Wav2Lip"
CHECKPOINTS_DIR = WAV2LIP_DIR / "checkpoints"
FACE_DETECTION_DIR = WAV2LIP_DIR / "face_detection" / "detection" / "sfd"

# Model URLs from Wav2Lip README
MODELS = {
    "wav2lip_gan.pth": {
        "url": "https://iiitaphyd-my.sharepoint.com/personal/radrabha_m_research_iiit_ac_in/_layouts/15/download.aspx?share=EdjI7bZlgApMqsVoEUUXpLsBxqXbn5z8VTmoxp55YNDcIA",
        "path": CHECKPOINTS_DIR / "wav2lip_gan.pth",
        "description": "Wav2Lip + GAN (better visual quality)",
    },
    "s3fd.pth": {
        "url": "https://www.adrianbulat.com/downloads/python-fan/s3fd-619a316812.pth",
        "path": FACE_DETECTION_DIR / "s3fd.pth",
        "description": "Face detection model (required)",
    },
}


def download_file(url, destination, description):
    """Download file with progress"""
    print(f"\n📥 Downloading {description}...")
    print(f"   URL: {url[:60]}...")
    print(f"   Destination: {destination}")

    destination.parent.mkdir(parents=True, exist_ok=True)

    try:

        def progress(block_num, block_size, total_size):
            downloaded = block_num * block_size
            percent = min(100, (downloaded / total_size) * 100)
            mb_downloaded = downloaded / (1024 * 1024)
            mb_total = total_size / (1024 * 1024)
            print(
                f"\r   Progress: {percent:.1f}% ({mb_downloaded:.1f}/{mb_total:.1f} MB)",
                end="",
                flush=True,
            )

        urllib.request.urlretrieve(url, destination, reporthook=progress)
        print()  # New line after progress

        file_size = destination.stat().st_size / (1024 * 1024)
        print(f"   ✅ Downloaded: {file_size:.1f} MB")
        return True

    except Exception as e:
        print(f"\n   ❌ Download failed: {e}")
        return False


def main():
    print("🎭 BROCKSTON LIP-SYNC MODEL SETUP")
    print("=" * 70)

    # Check if Wav2Lip directory exists
    if not WAV2LIP_DIR.exists():
        print(f"❌ Wav2Lip directory not found: {WAV2LIP_DIR}")
        print("   Run: python brockston_autonomous_lipsync_learning.py first")
        return

    print(f"✅ Wav2Lip directory found: {WAV2LIP_DIR}")

    # Download models
    success_count = 0
    total_count = len(MODELS)

    for name, info in MODELS.items():
        if info["path"].exists():
            file_size = info["path"].stat().st_size / (1024 * 1024)
            print(f"\n✅ Already downloaded: {name} ({file_size:.1f} MB)")
            success_count += 1
        else:
            if download_file(info["url"], info["path"], info["description"]):
                success_count += 1

    print("\n" + "=" * 70)
    print(f"📊 Download Summary: {success_count}/{total_count} models ready")

    if success_count == total_count:
        print("\n🎉 BROCKSTON IS READY TO TALK WITH LIP-SYNC!")
        print("\nNext steps:")
        print("   1. Test: python brockston_speaks.py")
        print(
            "   2. Introduce: python -c 'from brockston_speaks import brockston_introduce_yourself; brockston_introduce_yourself()'"
        )
    else:
        print("\n⚠️  Some models failed to download")
        print("   You can download manually from:")
        print(
            "   https://drive.google.com/drive/folders/153HLrqlBNxzZcHi17PEvP09kkAfzRshM"
        )
        print("   Place in: brockston_research/Wav2Lip/checkpoints/")


if __name__ == "__main__":
    main()
