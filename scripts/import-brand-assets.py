#!/usr/bin/env python3
# Dev-only: copy Claude brand export into assets/brand and native icon/splash slots.
import os
import shutil
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC = os.path.join(ROOT, ".tmp-brand-handoff", "export")
INK = (0x1C, 0x19, 0x16, 255)
LANCZOS = getattr(Image, "LANCZOS", Image.BICUBIC)


def ensure(path):
    os.makedirs(path, exist_ok=True)
    return path


def copy_name(name, dest_dir):
    ensure(dest_dir)
    shutil.copy2(os.path.join(SRC, name), os.path.join(dest_dir, name))


def flatten_rgb(path, bg=INK):
    im = Image.open(path).convert("RGBA")
    base = Image.new("RGBA", im.size, bg)
    return Image.alpha_composite(base, im).convert("RGB")


def save_resized(src_path, dest, size):
    im = Image.open(src_path).convert("RGBA")
    im.resize((size, size), LANCZOS).save(dest, "PNG")


def main():
    if not os.path.isdir(SRC):
        raise SystemExit("missing .tmp-brand-handoff/export")

    brand = os.path.join(ROOT, "assets", "brand")
    marks = ensure(os.path.join(brand, "marks"))
    icons = ensure(os.path.join(brand, "icons"))
    splash = ensure(os.path.join(brand, "splash"))
    wordmarks = ensure(os.path.join(brand, "wordmarks"))
    lockups = ensure(os.path.join(brand, "lockups"))
    web = ensure(os.path.join(brand, "web"))
    docs = ensure(os.path.join(ROOT, "docs", "brand"))

    for n in [
        "atelier-mark-ink.svg",
        "atelier-mark-ivory.svg",
        "atelier-mark-cypress.svg",
        "atelier-mark-ink-1024.png",
        "atelier-mark-ivory-1024.png",
        "atelier-mark-cypress-1024.png",
        "atelier-mark-24.svg",
        "atelier-mark-32.svg",
        "atelier-mark-letters-16.svg",
        "atelier-mark-128.png",
        "atelier-mark-64.png",
        "atelier-mark-32.png",
        "atelier-mark-24.png",
        "atelier-mark-16.png",
    ]:
        copy_name(n, marks)

    for n in [
        "atelier-app-icon-1024.png",
        "atelier-app-icon-1024.svg",
        "atelier-app-icon-paper-1024.png",
        "atelier-app-icon-paper-1024.svg",
        "atelier-app-icon-cypress-1024.png",
        "atelier-app-icon-cypress-1024.svg",
    ]:
        copy_name(n, icons)

    for n in [
        "atelier-splash-mark-paper.svg",
        "atelier-splash-mark-paper.png",
        "atelier-splash-mark.svg",
        "atelier-splash-mark.png",
    ]:
        copy_name(n, splash)

    for n in [
        "atelier-wordmark-ink.svg",
        "atelier-wordmark-ink.png",
        "atelier-wordmark-ivory.svg",
        "atelier-wordmark-ivory.png",
    ]:
        copy_name(n, wordmarks)

    for n in [
        "atelier-lockup-horizontal-ink.svg",
        "atelier-lockup-horizontal-ink.png",
        "atelier-lockup-horizontal-ivory.svg",
        "atelier-lockup-horizontal-ivory.png",
        "atelier-lockup-stacked-ink.svg",
        "atelier-lockup-stacked-ink.png",
        "atelier-lockup-stacked-ivory.svg",
        "atelier-lockup-stacked-ivory.png",
    ]:
        copy_name(n, lockups)

    for n in [
        "atelier-favicon.svg",
        "atelier-favicon-16.png",
        "atelier-favicon-32.png",
        "atelier-favicon-48.png",
        "atelier-favicon.ico",
    ]:
        copy_name(n, web)

    for n in ["BRAND-SPEC.md", "CONSTRUCTION.md", "README.md"]:
        copy_name(n, docs)

    icon = flatten_rgb(os.path.join(SRC, "atelier-app-icon-1024.png"), INK)
    icon.save(os.path.join(ROOT, "assets", "icon.png"), "PNG")
    icon.save(
        os.path.join(
            ROOT,
            "ios",
            "YearlyTracker",
            "Images.xcassets",
            "AppIcon.appiconset",
            "App-Icon-1024x1024@1x.png",
        ),
        "PNG",
    )
    shutil.copy2(
        os.path.join(SRC, "atelier-favicon-32.png"),
        os.path.join(ROOT, "assets", "favicon.png"),
    )
    shutil.copy2(
        os.path.join(SRC, "atelier-splash-mark-paper.png"),
        os.path.join(ROOT, "assets", "splash-icon.png"),
    )

    mark = Image.open(os.path.join(SRC, "atelier-mark-ivory-1024.png")).convert("RGBA")
    fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    mw = int(round(1024 * 0.6875))
    mh = int(round(mw * mark.size[1] / mark.size[0]))
    mark_r = mark.resize((mw, mh), LANCZOS)
    x = (1024 - mw) // 2
    y = int(round((1024 - mh) / 2 - 1024 * 0.02))
    fg.paste(mark_r, (x, y), mark_r)
    fg.save(os.path.join(ROOT, "assets", "adaptive-icon.png"), "PNG")

    res = os.path.join(ROOT, "android", "app", "src", "main", "res")
    mip = {
        "mdpi": (48, 108),
        "hdpi": (72, 162),
        "xhdpi": (96, 216),
        "xxhdpi": (144, 324),
        "xxxhdpi": (192, 432),
    }
    for dens, (launcher, foreground) in mip.items():
        d = ensure(os.path.join(res, "mipmap-%s" % dens))
        for name in [
            "ic_launcher.webp",
            "ic_launcher_round.webp",
            "ic_launcher_foreground.webp",
        ]:
            p = os.path.join(d, name)
            if os.path.exists(p):
                os.remove(p)
        icon.resize((launcher, launcher), LANCZOS).save(
            os.path.join(d, "ic_launcher.png"), "PNG"
        )
        icon.resize((launcher, launcher), LANCZOS).save(
            os.path.join(d, "ic_launcher_round.png"), "PNG"
        )
        fg.resize((foreground, foreground), LANCZOS).save(
            os.path.join(d, "ic_launcher_foreground.png"), "PNG"
        )

    splash_src = Image.open(
        os.path.join(SRC, "atelier-splash-mark-paper.png")
    ).convert("RGBA")
    splash_sizes = {
        "mdpi": 288,
        "hdpi": 432,
        "xhdpi": 576,
        "xxhdpi": 864,
        "xxxhdpi": 1152,
    }
    for dens, size in splash_sizes.items():
        splash_src.resize((size, size), LANCZOS).save(
            os.path.join(res, "drawable-%s" % dens, "splashscreen_logo.png"), "PNG"
        )

    ios_splash = os.path.join(
        ROOT,
        "ios",
        "YearlyTracker",
        "Images.xcassets",
        "SplashScreenLegacy.imageset",
    )
    splash_src.resize((1024, 1024), LANCZOS).save(
        os.path.join(ios_splash, "image.png"), "PNG"
    )
    splash_src.save(os.path.join(ios_splash, "image@2x.png"), "PNG")
    splash_src.resize((1280, 1280), LANCZOS).save(
        os.path.join(ios_splash, "image@3x.png"), "PNG"
    )

    mark24 = os.path.join(SRC, "atelier-mark-24.png")
    mark16 = os.path.join(SRC, "atelier-mark-16.png")
    mark32 = os.path.join(SRC, "atelier-mark-32.png")
    mark64 = os.path.join(SRC, "atelier-mark-64.png")
    mark128 = os.path.join(SRC, "atelier-mark-128.png")

    dens_scale = {
        "mdpi": 1,
        "hdpi": 1.5,
        "xhdpi": 2,
        "xxhdpi": 3,
        "xxxhdpi": 4,
    }
    for dens, scale in dens_scale.items():
        dd = ensure(os.path.join(res, "drawable-%s" % dens))
        px24 = int(round(24 * scale))
        px16 = int(round(16 * scale))
        src24 = (
            mark128
            if px24 >= 96
            else mark64
            if px24 >= 48
            else mark32
            if px24 >= 32
            else mark24
        )
        src16 = mark64 if px16 >= 32 else mark16
        save_resized(src24, os.path.join(dd, "atelier_mark_24.png"), px24)
        save_resized(src16, os.path.join(dd, "atelier_mark_16.png"), px16)

    wassets = os.path.join(
        ROOT, "ios", "YearlyTrackerWidgets", "Assets.xcassets"
    )
    sets = {
        "AtelierMark24.imageset": [mark24, mark64, mark128],
        "AtelierMark16.imageset": [mark16, mark32, mark64],
    }
    for name, files in sets.items():
        folder = ensure(os.path.join(wassets, name))
        for srcp in files:
            shutil.copy2(srcp, os.path.join(folder, os.path.basename(srcp)))

    print("imported brand assets")
    print("icon", icon.size, icon.mode)
    print("fg bbox", fg.getbbox())


if __name__ == "__main__":
    main()
