export const getChannelIDByUrl = (url: string) => {
  const regex = /\/live\/([^/?]+)/;
  const match = url.match(regex);

  if (match && match.length >= 2) {
    const channelID = match[1];
    return channelID;
  }
  return "";
};

export const getChannelOpenLive = async (channelId: string) => {
  try {
    const res = await fetch(
      `https://api.chzzk.naver.com/service/v1/channels/${channelId}`
    );
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();
    
    return data.content.openLive;
  } catch (err) {
    return false;
  }
};
