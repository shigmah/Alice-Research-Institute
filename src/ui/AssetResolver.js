export class AssetResolver {
  static candidates(path) {
    return [
      path,
      `../${path}`,
      `./assets/images/${path}`,
      `../assets/images/${path}`,
      `../../assets/images/${path}`,
      `/Alice-Research-Institute/${path}`,
      `/Alice-Research-Institute/assets/images/${path}`
    ];
  }

  static imageCandidates(name) {
    return this.candidates(name);
  }

  static videoCandidates(name) {
    return [
      name,
      `../${name}`,
      `./assets/videos/${name}`,
      `../assets/videos/${name}`,
      `../../assets/videos/${name}`,
      `/Alice-Research-Institute/${name}`,
      `/Alice-Research-Institute/assets/videos/${name}`
    ];
  }

  static diceImageCandidates(value, preferred = "B") {
    const names = [
      `dice_${preferred}${value}.jpeg`,
      `dice_B${value}.jpeg`,
      `dice_R${value}.jpeg`,
      `dice_${preferred}${value}.jpg`,
      `dice_B${value}.jpg`,
      `dice_R${value}.jpg`,
      `dice_${value}.png`
    ];

    return names.flatMap(name => this.imageCandidates(name));
  }

  static diceVideoCandidates(diceCount, preferred = "B") {
    const names = [
      `diceroll_${preferred}${diceCount}.mp4`,
      `diceroll_B${diceCount}.mp4`,
      `diceroll_R${diceCount}.mp4`,
      `diceroll_${preferred}${diceCount}.webm`,
      `diceroll_B${diceCount}.webm`,
      `diceroll_R${diceCount}.webm`
    ];

    return names.flatMap(name => this.videoCandidates(name));
  }

  static setImageWithFallback(img, candidates, onResolved = null) {
    let index = 0;

    const tryNext = () => {
      if (index >= candidates.length) {
        img.removeAttribute("src");
        img.dataset.assetStatus = "missing";
        onResolved?.(null);
        return;
      }

      img.src = candidates[index++];
      img.dataset.assetStatus = "loading";
    };

    img.onload = () => {
      img.dataset.assetStatus = "loaded";
      onResolved?.(img.src);
    };

    img.onerror = tryNext;
    tryNext();
  }

  static setVideoWithFallback(video, candidates, onResolved = null) {
    let index = 0;

    const tryNext = () => {
      if (index >= candidates.length) {
        video.removeAttribute("src");
        video.dataset.assetStatus = "missing";
        onResolved?.(null);
        return;
      }

      video.src = candidates[index++];
      video.dataset.assetStatus = "loading";
      video.load();
    };

    video.addEventListener("loadeddata", () => {
      video.dataset.assetStatus = "loaded";
      onResolved?.(video.src);
    }, { once: false });

    video.addEventListener("error", tryNext);
    tryNext();
  }
}
