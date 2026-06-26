interface ChzzkMedia {
  mediaId: string;
  protocol: string;
  path: string;
}

interface ChzzkPlayback {
  media: ChzzkMedia[];
}

export interface LiveDetail {
  hlsUrl: string | null;
  title: string;
  thumbnail: string;
}

// 한 번의 live-detail 요청으로 HLS 주소 / 방송 제목 / 썸네일을 함께 가져온다.
export const getLiveDetail = async (channelId: string): Promise<LiveDetail> => {
  try {
    const res = await fetch(`https://api.chzzk.naver.com/service/v2/channels/${channelId}/live-detail`);
    if (!res.ok) return { hlsUrl: null, title: '', thumbnail: '' };

    const data = await res.json();
    const title: string = data?.content?.liveTitle ?? '';

    // liveImageUrl 은 {type} 자리표시자를 해상도로 치환해야 한다.
    const liveImageUrl: string | undefined = data?.content?.liveImageUrl;
    const thumbnail = liveImageUrl ? liveImageUrl.replace('{type}', '480') : '';

    let hlsUrl: string | null = null;
    const playbackJson: string | undefined = data?.content?.livePlaybackJson;
    if (playbackJson) {
      const playback: ChzzkPlayback = JSON.parse(playbackJson);
      hlsUrl = playback?.media?.find(m => m.protocol === 'HLS')?.path ?? null;
    }
    return { hlsUrl, title, thumbnail };
  } catch {
    return { hlsUrl: null, title: '', thumbnail: '' };
  }
};

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
