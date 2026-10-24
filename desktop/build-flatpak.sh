#!/usr/bin/env bash
set -eu
cd "$(dirname "$0")"
base_dir="$(flatpak info --user --show-location org.electronjs.Electron2.BaseApp//25.08)"
stage_dir="$PWD/release/flatpak-stage"
mkdir -p "$stage_dir/files"
cp -a "$base_dir/files/." "$stage_dir/files/"
mkdir -p "$stage_dir/files/lib/balloon-pop" "$stage_dir/files/bin" "$stage_dir/export/share/applications" "$stage_dir/export/share/icons/hicolor/256x256/apps"
cp -a release/linux-unpacked/. "$stage_dir/files/lib/balloon-pop/"
cat > "$stage_dir/files/bin/balloon-pop" <<'SH'
#!/bin/sh
exec zypak-wrapper /app/lib/balloon-pop/balloon-pop-desktop "$@"
SH
chmod +x "$stage_dir/files/bin/balloon-pop"
cat > "$stage_dir/metadata" <<'META'
[Application]
name=group.roselt.BalloonPop
runtime=org.freedesktop.Platform/x86_64/25.08
sdk=org.freedesktop.Sdk/x86_64/25.08
command=balloon-pop

[Context]
shared=ipc;
sockets=x11;wayland;pulseaudio;
devices=dri;
META
cat > "$stage_dir/export/share/applications/group.roselt.BalloonPop.desktop" <<'DESKTOP'
[Desktop Entry]
Name=Balloon Pop
Exec=balloon-pop
Type=Application
Icon=group.roselt.BalloonPop
Categories=Game;KidsGame;
DESKTOP
cp icons/icon-256.png "$stage_dir/export/share/icons/hicolor/256x256/apps/group.roselt.BalloonPop.png"
mkdir -p "$stage_dir/files/share/applications" "$stage_dir/files/share/icons/hicolor/256x256/apps"
cp "$stage_dir/export/share/applications/"* "$stage_dir/files/share/applications/"
cp "$stage_dir/export/share/icons/hicolor/256x256/apps/"* "$stage_dir/files/share/icons/hicolor/256x256/apps/"
flatpak build-export --disable-sandbox release/flatpak-repo "$stage_dir" stable
flatpak build-bundle --runtime-repo=https://dl.flathub.org/repo/flathub.flatpakrepo release/flatpak-repo "release/Balloon-Pop-$(node -p "require('./package.json').version")-Linux-x86_64.flatpak" group.roselt.BalloonPop stable
