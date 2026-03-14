interface ChzzkMedia {
  mediaId: string;
  protocol: string;
  path: string;
}

interface ChzzkPlayback {
  media: ChzzkMedia[];
}

export const getHlsUrl = async (channelId: string): Promise<string | null> => {
  try {
    const res = await fetch(`https://api.chzzk.naver.com/service/v2/channels/${channelId}/live-detail`);
    if (!res.ok) return null;

    const data = await res.json();
    const playbackJson: string | undefined = data?.content?.livePlaybackJson;
    if (!playbackJson) return null;

    const playback: ChzzkPlayback = JSON.parse(playbackJson);
    const hlsMedia = playback?.media?.find(m => m.protocol === 'HLS');
    return hlsMedia?.path ?? null;
  } catch {
    return null;
  }
};
